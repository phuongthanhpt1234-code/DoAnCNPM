INSERT INTO categories (name, slug) VALUES ('Món chính', 'mon-chinh'), ('Ăn vặt', 'an-vat')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO dishes (name, category_id, description)
SELECT v.name, (SELECT id FROM categories WHERE slug = v.slug), v.d
FROM (VALUES
  ('Cao lầu', 'mon-chinh', 'Mì sợi dày ăn cùng thịt xíu, rau sống và bánh tráng giòn.'),
  ('Mì Quảng', 'mon-chinh', 'Mì sợi bản rộng với ít nước dùng, thường có tôm và thịt.'),
  ('Cơm gà', 'mon-chinh', 'Cơm nấu bằng nước luộc gà, ăn với gà xé và rau răm.'),
  ('Bánh mì', 'an-vat', 'Bánh mì kiểu Hội An với nhiều loại nhân và nước sốt riêng.'),
  ('Bánh bao bánh vạc', 'an-vat', 'Bánh gạo trong, nhân tôm hoặc thịt, ăn kèm nước mắm chua ngọt.')
) AS v(name, slug, d)
WHERE NOT EXISTS (SELECT 1 FROM dishes x WHERE x.name = v.name);
