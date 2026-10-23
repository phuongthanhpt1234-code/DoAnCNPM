import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';

const r = Router();

const dishSchema = z.object({
  category_id: z.number().int().nullable().optional(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  price_vnd: z.number().int().nonnegative().nullable().optional(),
  image_url: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});
const transSchema = z.object({ name: z.string().min(1), description: z.string().nullable().optional() });

const vals = (b: z.infer<typeof dishSchema>) => [
  b.category_id ?? null, b.name, b.description ?? null, b.address ?? null,
  b.price_vnd ?? null, b.image_url ?? null, b.is_active,
];

r.get('/', ah(async (req, res) => {
  const q = typeof req.query.q === 'string' && req.query.q ? req.query.q : null;
  const cat = req.query.category_id ? Number(req.query.category_id) : null;
  const { rows } = await pool.query(
    `SELECT d.*, c.name AS category_name,
            (SELECT count(*) FROM favorites f WHERE f.dish_id = d.id)::int AS favorite_count
     FROM dishes d LEFT JOIN categories c ON c.id = d.category_id
     WHERE ($1::text IS NULL OR d.name ILIKE '%' || $1 || '%')
       AND ($2::int IS NULL OR d.category_id = $2)
     ORDER BY d.id DESC`, [q, cat]);
  res.json(rows);
}));

r.get('/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await pool.query('SELECT * FROM dishes WHERE id = $1', [id]);
  if (!rows[0]) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
  const t = await pool.query('SELECT lang, name, description FROM dish_translations WHERE dish_id = $1', [id]);
  res.json({ ...rows[0], translations: t.rows });
}));

r.post('/', ah(async (req, res) => {
  const b = dishSchema.parse(req.body);
  const { rows } = await pool.query(
    `INSERT INTO dishes (category_id, name, description, address, price_vnd, image_url, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, vals(b));
  res.status(201).json(rows[0]);
}));

r.put('/:id', ah(async (req, res) => {
  const b = dishSchema.parse(req.body);
  const { rows } = await pool.query(
    `UPDATE dishes SET category_id=$1, name=$2, description=$3, address=$4, price_vnd=$5, image_url=$6, is_active=$7
     WHERE id=$8 RETURNING *`, [...vals(b), Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
  res.json(rows[0]);
}));

r.delete('/:id', ah(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM dishes WHERE id = $1', [Number(req.params.id)]);
  if (!rowCount) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
  res.status(204).end();
}));

r.put('/:id/translations/:lang', ah(async (req, res) => {
  const b = transSchema.parse(req.body);
  const { rows } = await pool.query(
    `INSERT INTO dish_translations (dish_id, lang, name, description) VALUES ($1,$2,$3,$4)
     ON CONFLICT (dish_id, lang) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
     RETURNING *`, [Number(req.params.id), req.params.lang, b.name, b.description ?? null]);
  res.json(rows[0]);
}));

export default r;
