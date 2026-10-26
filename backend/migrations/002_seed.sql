-- Đồng bộ 4 danh mục chuẩn với Frontend (main, snack, street, sweet) kèm 5 ngôn ngữ
INSERT INTO categories (name, slug, translations) VALUES
  ('Món chính', 'main', '{"vi":"Món chính","en":"Main Dishes","zh":"主菜","ko":"메인 요리","ja":"メイン料理"}'::jsonb),
  ('Bánh & Ăn vặt', 'snack', '{"vi":"Bánh & Ăn vặt","en":"Snacks & Cakes","zh":"糕点与小吃","ko":"떡 & 간식","ja":"軽食・餅"}'::jsonb),
  ('Đường phố', 'street', '{"vi":"Đường phố","en":"Street Food","zh":"街头美食","ko":"길거리 음식","ja":"屋台料理"}'::jsonb),
  ('Chè & Đồ uống', 'sweet', '{"vi":"Chè & Đồ uống","en":"Sweet Soups & Drinks","zh":"甜品与饮品","ko":"디저트 & 음료","ja":"チェー・飲み物"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  translations = EXCLUDED.translations;

DELETE FROM categories WHERE slug NOT IN ('main', 'snack', 'street', 'sweet');
