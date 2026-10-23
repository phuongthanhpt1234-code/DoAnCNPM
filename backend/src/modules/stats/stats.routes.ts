import { Router } from 'express';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';

const r = Router();

r.get('/', ah(async (_req, res) => {
  const [totals, daily, top] = await Promise.all([
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
    pool.query(`SELECT d.id, d.name, count(f.dish_id)::int AS favorites,
      (SELECT count(*) FROM check_ins ci WHERE ci.dish_id = d.id)::int AS check_ins
      FROM dishes d LEFT JOIN favorites f ON f.dish_id = d.id
      GROUP BY d.id ORDER BY favorites DESC, check_ins DESC, d.id LIMIT 5`),
  ]);
  res.json({ totals: totals.rows[0], daily: daily.rows, top: top.rows });
}));

export default r;
