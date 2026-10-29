import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';
import { requireAdminAuth } from '../../middlewares/auth';
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
  const deviceId = req.query.device_id ? String(req.query.device_id).trim() : null;

  if (deviceId) {
    const { rows } = await pool.query(
      `SELECT c.id, c.device_id, c.note, c.created_at, d.id AS dish_id, d.name AS dish_name
       FROM check_ins c JOIN dishes d ON d.id = c.dish_id
       WHERE c.device_id = $1 AND c.created_at::date = CURRENT_DATE
       ORDER BY c.created_at DESC LIMIT $2`, [deviceId, limit]);
    return res.json(rows);
  }

  // Truy vấn toàn bộ lịch sử check-in hệ thống: Yêu cầu quyền quản trị viên
  return requireAdminAuth(req, res, async () => {
    const { rows } = await pool.query(
      `SELECT c.id, c.device_id, c.note, c.created_at, d.id AS dish_id, d.name AS dish_name
       FROM check_ins c JOIN dishes d ON d.id = c.dish_id
       ORDER BY c.created_at DESC LIMIT $1`, [limit]);
    res.json(rows);
  });
}));

r.post('/', ah(async (req, res) => {
  const b = schema.parse(req.body);
  const checkDish = await pool.query('SELECT id, name FROM dishes WHERE id = $1', [b.dish_id]);
  if (checkDish.rowCount === 0) {
    return res.status(404).json({ code: 'NOT_FOUND', message: `Không tìm thấy món ăn với ID = ${b.dish_id}` });
  }

  const dishName = checkDish.rows[0].name;
  const defaultNote = `Check-in món ${dishName}`;

  // Chống spam: Kiểm tra xem thiết bị này đã check-in món này trong ngày chưa
  const existing = b.day
    ? await pool.query(
        `SELECT id, device_id, dish_id, note, created_at
         FROM check_ins
         WHERE device_id = $1 AND dish_id = $2 AND created_at::date = $3::date
         ORDER BY created_at DESC LIMIT 1`,
        [b.device_id, b.dish_id, b.day],
      )
    : await pool.query(
        `SELECT id, device_id, dish_id, note, created_at
         FROM check_ins
         WHERE device_id = $1 AND dish_id = $2 AND created_at::date = CURRENT_DATE
         ORDER BY created_at DESC LIMIT 1`,
        [b.device_id, b.dish_id],
      );

  if (existing.rowCount && existing.rowCount > 0) {
    // Đã có bản ghi check-in trong ngày -> Trả về bản ghi hiện tại mà không tạo bản ghi mới trùng lặp
    return res.status(200).json(existing.rows[0]);
  }

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

r.delete('/day/:day', requireAdminAuth, ah(async (req, res) => {
  const day = String(req.params.day || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return res.status(400).json({ message: 'Ngày không hợp lệ' });
  }
  const result = await pool.query(
    `DELETE FROM check_ins
     WHERE id = (
       SELECT id FROM check_ins
       WHERE created_at::date = $1::date
       ORDER BY created_at DESC, id DESC
       LIMIT 1
     )`,
    [day],
  );
  if (result.rowCount && result.rowCount > 0) {
    broadcastAdminRefresh();
  }
  res.status(204).end();
}));

r.delete('/:dishId', ah(async (req, res) => {
  const dishId = Number(req.params.dishId);
  const deviceId = String(req.query.device_id || req.body?.device_id || '').trim();
  if (!deviceId || isNaN(dishId)) {
    return res.status(400).json({ message: 'Thiếu device_id hoặc dishId không hợp lệ' });
  }
  const result = await pool.query(
    `DELETE FROM check_ins
     WHERE id IN (
       SELECT id FROM check_ins
       WHERE device_id = $1 AND dish_id = $2
       ORDER BY created_at DESC
       LIMIT 1
     )`,
    [deviceId, dishId],
  );
  if (result.rowCount && result.rowCount > 0) {
    broadcastAdminRefresh();
  }
  res.status(204).end();
}));

r.delete('/', ah(async (req, res) => {
  const deviceId = String(req.query.device_id || req.body?.device_id || '').trim();
  const dishId = Number(req.query.dish_id || req.body?.dish_id);
  if (!deviceId || !dishId || isNaN(dishId)) {
    return res.status(400).json({ message: 'Thiếu device_id hoặc dish_id' });
  }
  const result = await pool.query(
    `DELETE FROM check_ins
     WHERE id IN (
       SELECT id FROM check_ins
       WHERE device_id = $1 AND dish_id = $2
       ORDER BY created_at DESC
       LIMIT 1
     )`,
    [deviceId, dishId],
  );
  if (result.rowCount && result.rowCount > 0) {
    broadcastAdminRefresh();
  }
  res.status(204).end();
}));

export default r;
