import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';
import { broadcastAdminRefresh } from '../presence/presence.routes';

const r = Router();
const schema = z.object({
  device_id: z.string().min(1),
  dish_id: z.number().int().optional(),
  note: z.string().nullable().optional(),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

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
  let targetDishId = b.dish_id;
  if (targetDishId) {
    const checkDish = await pool.query('SELECT id FROM dishes WHERE id = $1', [targetDishId]);
    if (checkDish.rowCount === 0) targetDishId = undefined;
  }
  if (!targetDishId) {
    const firstDish = await pool.query('SELECT id FROM dishes ORDER BY id ASC LIMIT 1');
    if (firstDish.rowCount === 0) {
      return res.status(400).json({ message: 'Chưa có món ăn nào trong hệ thống' });
    }
    targetDishId = firstDish.rows[0].id;
  }

  const { rows } = b.day
    ? await pool.query(
        `INSERT INTO check_ins (device_id, dish_id, note, created_at)
         VALUES ($1, $2, $3, ($4::date + localtime)::timestamptz)
         RETURNING *`,
        [b.device_id, targetDishId, b.note ?? null, b.day],
      )
    : await pool.query(
        'INSERT INTO check_ins (device_id, dish_id, note) VALUES ($1, $2, $3) RETURNING *',
        [b.device_id, targetDishId, b.note ?? null],
      );
  broadcastAdminRefresh();
  res.status(201).json(rows[0]);
}));

r.delete('/day/:day', ah(async (req, res) => {
  const day = String(req.params.day || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return res.status(400).json({ message: 'Ngày không hợp lệ' });
  }
  await pool.query(
    `DELETE FROM check_ins
     WHERE id = (
       SELECT id FROM check_ins
       WHERE created_at::date = $1::date
       ORDER BY created_at DESC, id DESC
       LIMIT 1
     )`,
    [day],
  );
  broadcastAdminRefresh();
  res.status(204).end();
}));

export default r;
