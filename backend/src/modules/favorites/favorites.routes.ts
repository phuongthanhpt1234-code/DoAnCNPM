import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';

const r = Router();
const schema = z.object({ device_id: z.string().min(1), dish_id: z.number().int() });

r.get('/', ah(async (req, res) => {
  const deviceId = z.string().min(1).parse(req.query.device_id);
  const { rows } = await pool.query(
    `SELECT d.* FROM favorites f JOIN dishes d ON d.id = f.dish_id
     WHERE f.device_id = $1 ORDER BY f.created_at DESC`, [deviceId]);
  res.json(rows);
}));

r.post('/', ah(async (req, res) => {
  const b = schema.parse(req.body);
  await pool.query('INSERT INTO favorites (device_id, dish_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [b.device_id, b.dish_id]);
  res.status(201).json({ ok: true });
}));

r.delete('/:dishId', ah(async (req, res) => {
  const deviceId = z.string().min(1).parse(req.query.device_id);
  await pool.query('DELETE FROM favorites WHERE device_id=$1 AND dish_id=$2', [deviceId, Number(req.params.dishId)]);
  res.status(204).end();
}));

export default r;
