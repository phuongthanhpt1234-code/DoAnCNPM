import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';

const r = Router();

const langEnum = z.enum(['vi', 'en', 'zh', 'ko', 'ja']);
const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  translations: z.record(langEnum, z.string().min(1)).optional(),
});

r.get('/', ah(async (req, res) => {
  const lang = typeof req.query.lang === 'string' ? req.query.lang : 'vi';
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY id');
  const enriched = rows.map((row) => ({
    ...row,
    localized_name: row.translations?.[lang] || row.translations?.vi || row.name,
  }));
  res.json(enriched);
}));

r.post('/', ah(async (req, res) => {
  const b = schema.parse(req.body);
  const translations = {
    vi: b.name,
    ...(b.translations ?? {}),
  };
  const { rows } = await pool.query(
    'INSERT INTO categories (name, slug, translations) VALUES ($1, $2, $3::jsonb) RETURNING *',
    [b.name, b.slug, JSON.stringify(translations)],
  );
  res.status(201).json(rows[0]);
}));

export default r;
