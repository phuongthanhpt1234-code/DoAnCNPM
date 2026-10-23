import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';

const r = Router();
const schema = z.object({ device_id: z.string().min(1), dish_id: z.number().int(), note: z.string().nullable().optional() });

r.get('/', ah(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const { rows } = await pool.query(
    `SELECT c.id, c.device_id, c.note, c.created_at, d.id AS dish_id, d.name AS dish_name
     FROM check_ins c JOIN dishes d ON d.id = c.dish_id
     ORDER BY c.created_at DESC LIMIT $1`, [limit]);
  res.json(rows);
}));

r.post('/', ah(async (req, res) => {
  const b = schema.parse(req.body);
  const { rows } = await pool.query(
    'INSERT INTO check_ins (device_id, dish_id, note) VALUES ($1,$2,$3) RETURNING *',
    [b.device_id, b.dish_id, b.note ?? null]);
  res.status(201).json(rows[0]);
}));

export default r;
