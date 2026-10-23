import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';

const r = Router();
const schema = z.object({ name: z.string().min(1), slug: z.string().min(1) });

r.get('/', ah(async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY id');
  res.json(rows);
}));

r.post('/', ah(async (req, res) => {
  const b = schema.parse(req.body);
  const { rows } = await pool.query('INSERT INTO categories (name, slug) VALUES ($1,$2) RETURNING *', [b.name, b.slug]);
  res.status(201).json(rows[0]);
}));

export default r;
