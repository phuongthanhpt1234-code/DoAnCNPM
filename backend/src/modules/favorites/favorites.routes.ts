import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';
import { runtimeStore } from '../../data/runtimeStore';

const r = Router();
const schema = z.object({ device_id: z.string().min(1), dish_id: z.number().int() });

r.get('/', ah(async (req, res) => {
  const deviceId = z.string().min(1).parse(req.query.device_id);
  try {
    const { rows } = await pool.query(
      `SELECT d.* FROM favorites f JOIN dishes d ON d.id = f.dish_id
       WHERE f.device_id = $1 ORDER BY f.created_at DESC`, [deviceId]);
    if (!rows || rows.length === 0) {
      const fb = runtimeStore.getFavorites(deviceId);
      if (fb && fb.length > 0) return res.json(fb);
    }
    return res.json(rows || []);
  } catch {
    return res.json(runtimeStore.getFavorites(deviceId));
  }
}));

r.post('/', ah(async (req, res) => {
  const b = schema.parse(req.body);
  try {
    await pool.query('INSERT INTO favorites (device_id, dish_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [b.device_id, b.dish_id]);
    runtimeStore.addFavorite(b.device_id, b.dish_id);
    return res.status(201).json({ ok: true });
  } catch {
    runtimeStore.addFavorite(b.device_id, b.dish_id);
    return res.status(201).json({ ok: true });
  }
}));

r.delete('/:dishId', ah(async (req, res) => {
  const deviceId = z.string().min(1).parse(req.query.device_id);
  const dishId = Number(req.params.dishId);
  try {
    await pool.query('DELETE FROM favorites WHERE device_id=$1 AND dish_id=$2', [deviceId, dishId]);
    runtimeStore.removeFavorite(deviceId, dishId);
    return res.status(204).end();
  } catch {
    runtimeStore.removeFavorite(deviceId, dishId);
    return res.status(204).end();
  }
}));

export default r;
