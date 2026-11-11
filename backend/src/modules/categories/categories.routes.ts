import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';
import { requireAdminAuth } from '../../middlewares/auth';

const r = Router();

const langEnum = z.enum(['vi', 'en', 'zh', 'ko', 'ja']);
const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  translations: z.record(langEnum, z.string().min(1)).optional(),
});

const DEFAULT_CATEGORIES = [
  { id: 4, name: 'Món chính', slug: 'main', translations: { vi: 'Món chính', en: 'Main Dishes', zh: '主菜', ko: '메인 요리', ja: 'メイン料理' } },
  { id: 5, name: 'Bánh & Ăn vặt', slug: 'snack', translations: { vi: 'Bánh & Ăn vặt', en: 'Cakes & Snacks', zh: '糕点与小吃', ko: '떡 & 간식', ja: '餅＆軽食' } },
  { id: 6, name: 'Đường phố', slug: 'street', translations: { vi: 'Đường phố', en: 'Street Food', zh: '街头美食', ko: '길거리 음식', ja: '屋台料理' } },
  { id: 7, name: 'Chè & Đồ uống', slug: 'sweet', translations: { vi: 'Chè & Đồ uống', en: 'Desserts & Drinks', zh: '甜品与饮品', ko: '디저트 & 음료', ja: 'チェー＆ドリンク' } },
];

r.get('/', ah(async (req, res) => {
  const lang = typeof req.query.lang === 'string' ? req.query.lang : 'vi';
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY id');
    const enriched = rows.map((row) => ({
      ...row,
      localized_name: row.translations?.[lang] || row.translations?.vi || row.name,
    }));
    return res.json(enriched);
  } catch {
    const enriched = DEFAULT_CATEGORIES.map((row: any) => ({
      ...row,
      localized_name: row.translations?.[lang] || row.translations?.vi || row.name,
    }));
    return res.json(enriched);
  }
}));

r.post('/', requireAdminAuth, ah(async (req, res) => {
  const b = schema.parse(req.body);
  const translations = {
    vi: b.name,
    ...(b.translations ?? {}),
  };
  const { rows } = await pool.query(
    'INSERT INTO categories (name, slug, translations) VALUES ($1, $2, $3::jsonb) RETURNING *',
    [b.name, b.slug, JSON.stringify(translations)],
  );
  res.status(201).json(rows[0]);
}));

export default r;
