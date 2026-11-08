import { Router } from 'express';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';
import { requireAdminAuth } from '../../middlewares/auth';
import { getPresenceSummary } from '../presence/presence.routes';

const r = Router();

r.get('/', requireAdminAuth, ah(async (_req, res) => {
  const [totals, daily, top, byCat] = await Promise.all([
    pool.query(`SELECT
      (SELECT count(*) FROM dishes)::int AS dishes,
      (SELECT count(*) FROM categories)::int AS categories,
      (SELECT count(*) FROM favorites)::int AS favorites,
      (SELECT count(*) FROM check_ins)::int AS check_ins,
      (SELECT count(DISTINCT device_id) FROM check_ins)::int AS devices`),
    pool.query(`SELECT to_char(d::date, 'YYYY-MM-DD') AS day, count(c.id)::int AS n
      FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, interval '1 day') d
      LEFT JOIN check_ins c ON c.created_at >= CURRENT_DATE - INTERVAL '6 days'
                            AND c.created_at < CURRENT_DATE + INTERVAL '1 day'
                            AND c.created_at::date = d::date
      GROUP BY d ORDER BY d`),
    pool.query(`SELECT d.id, d.name, 0 AS price_vnd,
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
