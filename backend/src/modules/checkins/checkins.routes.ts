import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';
import { broadcastAdminRefresh } from '../presence/presence.routes';

const r = Router();
const schema = z.object({
  device_id: z.string().min(1, 'Thiếu device_id'),
  dish_id: z.number().int({ message: 'Mã món ăn dish_id phải là số nguyên hợp lệ' }),
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
  const checkDish = await pool.query('SELECT id, name FROM dishes WHERE id = $1', [b.dish_id]);
  if (checkDish.rowCount === 0) {
    return res.status(404).json({ code: 'NOT_FOUND', message: `Không tìm thấy món ăn với ID = ${b.dish_id}` });
  }

  const dishName = checkDish.rows[0].name;
  const defaultNote = `Check-in món ${dishName}`;

  const { rows } = b.day
    ? await pool.query(
        `INSERT INTO check_ins (device_id, dish_id, note, created_at)
         VALUES ($1, $2, $3, ($4::date + localtime)::timestamptz)
         RETURNING *`,
        [b.device_id, b.dish_id, b.note ?? defaultNote, b.day],
      )
    : await pool.query(
        'INSERT INTO check_ins (device_id, dish_id, note) VALUES ($1, $2, $3) RETURNING *',
        [b.device_id, b.dish_id, b.note ?? defaultNote],
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
