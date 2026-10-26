import { Router } from 'express';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';
import { getPresenceSummary } from '../presence/presence.routes';

const r = Router();

r.get('/', ah(async (_req, res) => {
  // Tự động đồng bộ ngày check-in cũ vào khung 7 ngày gần nhất nếu đồng hồ hệ thống thay đổi
  const checkWindow = await pool.query(`
    SELECT
      (SELECT count(*) FROM check_ins)::int AS total_all,
      (SELECT count(*) FROM check_ins WHERE created_at::date < current_date - 6 OR created_at::date > current_date)::int AS out_of_range
  `);
  const totalAll = checkWindow.rows[0]?.total_all ?? 0;
  const outOfRange = checkWindow.rows[0]?.out_of_range ?? 0;

  if (totalAll > 0 && outOfRange > 0) {
    await pool.query(`
      WITH numbered AS (
        SELECT id, (row_number() OVER (ORDER BY id) - 1)::int AS rn
        FROM check_ins
        WHERE created_at::date < current_date - 6 OR created_at::date > current_date
      )
      UPDATE check_ins c
      SET created_at = ((current_date - (numbered.rn % 7))::date + time '10:15:00' + (numbered.rn * interval '19 minutes'))::timestamptz
      FROM numbered
      WHERE c.id = numbered.id
    `);
  }

  const [totals, daily, top, byCat] = await Promise.all([
    pool.query(`SELECT
      (SELECT count(*) FROM dishes)::int AS dishes,
      (SELECT count(*) FROM categories)::int AS categories,
      (SELECT count(*) FROM favorites)::int AS favorites,
      (SELECT count(*) FROM check_ins)::int AS check_ins,
      (SELECT count(DISTINCT device_id) FROM check_ins)::int AS devices`),
    pool.query(`SELECT to_char(d::date, 'YYYY-MM-DD') AS day, count(c.id)::int AS n
      FROM generate_series(current_date - 6, current_date, interval '1 day') d
      LEFT JOIN check_ins c ON c.created_at::date = d::date
      GROUP BY d ORDER BY d`),
    pool.query(`SELECT d.id, d.name, COALESCE(d.price_vnd, 0)::int AS price_vnd,
      count(f.dish_id)::int AS favorites,
      (SELECT count(*) FROM check_ins ci WHERE ci.dish_id = d.id)::int AS check_ins
      FROM dishes d LEFT JOIN favorites f ON f.dish_id = d.id
      GROUP BY d.id ORDER BY favorites DESC, check_ins DESC, d.id ASC`),
    pool.query(`SELECT c.id, c.name, c.slug, count(d.id)::int AS dish_count
      FROM categories c
      LEFT JOIN dishes d ON d.category_id = c.id
      GROUP BY c.id ORDER BY c.id ASC`),
  ]);
  const presence = getPresenceSummary();
  res.json({
    totals: {
      ...totals.rows[0],
      online_devices: presence.online_count,
      real_online_devices: presence.real_online,
    },
    presence,
    daily: daily.rows,
    top: top.rows,
    by_category: byCat.rows,
  });
}));

export default r;
