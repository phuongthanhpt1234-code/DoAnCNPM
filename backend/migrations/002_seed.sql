-- 1. Làm sạch dữ liệu cũ của bảng dishes để tránh bị trùng lặp
TRUNCATE TABLE dishes RESTART IDENTITY CASCADE;

-- 2. Đồng bộ 4 danh mục chuẩn (main, snack, street, sweet) kèm 5 ngôn ngữ
INSERT INTO categories (name, slug, translations) VALUES
  ('Món chính', 'main', '{"vi":"Món chính","en":"Main Dishes","zh":"主菜","ko":"메인 요리","ja":"メイン料理"}'::jsonb),
  ('Bánh & Ăn vặt', 'snack', '{"vi":"Bánh & Ăn vặt","en":"Snacks & Cakes","zh":"糕点与小吃","ko":"떡 & 간식","ja":"軽食・餅"}'::jsonb),
  ('Đường phố', 'street', '{"vi":"Đường phố","en":"Street Food","zh":"街头美食","ko":"길거리 음식","ja":"屋台料理"}'::jsonb),
  ('Chè & Đồ uống', 'sweet', '{"vi":"Chè & Đồ uống","en":"Sweet Soups & Drinks","zh":"甜品与饮品","ko":"디저트 & 음료","ja":"チェー・飲み物"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  translations = EXCLUDED.translations;

-- Xóa các danh mục ngoài 4 danh mục chuẩn
DELETE FROM categories WHERE slug NOT IN ('main', 'snack', 'street', 'sweet');

-- 3. Thêm dữ liệu mẫu các món ăn kèm đầy đủ bản dịch 5 ngôn ngữ
INSERT INTO dishes (name, description, address, price_vnd, image_url, emoji, rating, lat, lng, category_id, translations) 
VALUES
(
  'Trà mót', 
  'Trà mót Hội An là thức uống thảo mộc thanh mát, kết hợp từ chanh, sả, gừng và hoa sen, mang lại cảm giác thư giãn tuyệt vời giữa phố cổ.', 
  '150 Trần Phú, Hội An', 
  20000, 
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800', 
  '', 
  , 
  15.8788, 
  108.3275, 
  (SELECT id FROM categories WHERE slug = 'sweet'),
  '{"vi": {"name": "Trà mót", "description": "Trà mót Hội An là thức uống thảo mộc thanh mát, kết hợp từ chanh, sả, gừng và hoa sen."}, "en": {"name": "Mot Hoi An Herbal Tea", "description": "A refreshing herbal tea infused with lemongrass, ginger, and lotus."}, "zh": {"name": "会安Mot草本茶", "description": "清凉的草本茶，融合了柠檬草、生姜和莲花。"}, "ko": {"name": "못 호이안 허브차", "description": "레몬그라스, 생강, 연꽃이 어우러진 상쾌한 허브차입니다."}, "ja": {"name": "モットー・ホイアン・ハーバルティー", "description": "レモングラス、生姜、ハスの花をブレンドした爽やかなハーブティー。"}}'::jsonb
),
(
  'Quán Cao lầu Bá Lễ', 
  'Cao lầu là món ăn đặc sản nổi tiếng của Hội An với sợi mì vàng dai đặc trưng, thịt xá xíu đậm đà, da heo giòn và rau sống Trà Quế.', 
  '45/3 Trần Hưng Đạo, Hội An', 
  60000, 
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800', 
  '', 
  , 
  15.8765, 
  108.3312, 
  (SELECT id FROM categories WHERE slug = 'main'),
  '{"vi": {"name": "Quán Cao lầu Bá Lễ", "description": "Cao lầu là món ăn đặc sản nổi tiếng của Hội An với sợi mì vàng dai đặc trưng."}, "en": {"name": "Ba Le Cao Lau Noodles", "description": "Hoi An signature noodle dish with chewy noodles, savory char siu pork, and crispy pork skin."}, "zh": {"name": "巴乐高楼面", "description": "会安标志性的特色面条，配以柔韧的面条、浓郁的叉烧和脆皮。"}, "ko": {"name": "바레 까오라우", "description": "쫄깃한 면발과 차슈, 바삭한 돼지껍질이 어우러진 호이안의 대표 국수입니다."}, "ja": {"name": "カオラウ（Ba Le）", "description": "コシのある麺、特製チャーシュー、カリッとした豚皮が特徴のホイアン名物麺。"}}'::jsonb
),
(
  'Bánh Mì Phượng', 
  'Bánh mì Phượng nổi tiếng toàn cầu với lớp vỏ giòn rụm, phần nhân ngập tràn pate thơm béo, chả lụa, thịt nướng và loại nước sốt gia truyền đặc biệt.', 
  '2B Phan Châu Trinh, Hội An', 
  40000, 
  'https://images.unsplash.com/photo-1626803775151-61d756612f97?auto=format&fit=crop&q=80&w=800', 
  '', 
  , 
  15.8795, 
  108.3301, 
  (SELECT id FROM categories WHERE slug = 'street'),
  '{"vi": {"name": "Bánh Mì Phượng", "description": "Bánh mì Phượng nổi tiếng toàn cầu với lớp vỏ giòn rụm và nước sốt gia truyền."}, "en": {"name": "Banh Mi Phuong", "description": "World-famous Vietnamese sandwich with crispy crust, rich pate, and special homemade sauce."}, "zh": {"name": "Phượng越南法棍", "description": "闻名全球的越南三明治，外皮酥脆，配有浓郁的肉酱和秘制酱汁。"}, "ko": {"name": "뱐미 프엉", "description": "바삭한 바게트와 풍부한 파테, 특제 소스가 어우러진 세계적으로 유명한 반미입니다."}, "ja": {"name": "バインミー・フォン", "description": "サクサクのパンに特製パテと特製ソースを挟んだ、世界的に有名なベトナム風サンドイッチ。"}}'::jsonb
);