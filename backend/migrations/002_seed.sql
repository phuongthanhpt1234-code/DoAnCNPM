-- 1. Đồng bộ 4 danh mục chuẩn (main, snack, street, sweet) kèm 5 ngôn ngữ
INSERT INTO categories (name, slug, translations) VALUES
  ('Món chính', 'main', '{"vi":"Món chính","en":"Main Dishes","zh":"主菜","ko":"메인 요리","ja":"メイン料理"}'::jsonb),
  ('Bánh & Ăn vặt', 'snack', '{"vi":"Bánh & Ăn vặt","en":"Snacks & Cakes","zh":"糕点与小吃","ko":"떡 & 간식","ja":"軽食・餅"}'::jsonb),
  ('Đường phố', 'street', '{"vi":"Đường phố","en":"Street Food","zh":"街头美食","ko":"길거리 음식","ja":"屋台料理"}'::jsonb),
  ('Chè & Đồ uống', 'sweet', '{"vi":"Chè & Đồ uống","en":"Sweet Soups & Drinks","zh":"甜品与饮品","ko":"디저트 & 음료","ja":"チェー・飲み物"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  translations = EXCLUDED.translations;

DELETE FROM categories WHERE slug NOT IN ('main', 'snack', 'street', 'sweet');

-- 2. Đảm bảo có sẵn các món ăn mẫu chuẩn Hội An nếu bảng dishes đang rỗng
DO $$
DECLARE
  v_dish_id INT;
  v_cat_sweet INT;
  v_cat_main INT;
  v_cat_street INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM dishes LIMIT 1) THEN
    SELECT id INTO v_cat_sweet FROM categories WHERE slug = 'sweet';
    SELECT id INTO v_cat_main FROM categories WHERE slug = 'main';
    SELECT id INTO v_cat_street FROM categories WHERE slug = 'street';

    -- Món 1: Trà Mót
    INSERT INTO dishes (name, description, address, price_vnd, image_url, emoji, rating, lat, lng, category_id)
    VALUES (
      'Trà mót',
      'Trà mót Hội An là thức uống thảo mộc thanh mát, kết hợp từ chanh, sả, gừng và hoa sen, mang lại cảm giác thư giãn tuyệt vời giữa phố cổ.',
      '150 Trần Phú, Hội An',
      20000,
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800',
      '🍹',
      4.8,
      15.8788,
      108.3275,
      v_cat_sweet
    ) RETURNING id INTO v_dish_id;

    INSERT INTO dish_translations (dish_id, lang, name, description) VALUES
      (v_dish_id, 'vi', 'Trà mót Hội An', 'Trà mót Hội An là thức uống thảo mộc thanh mát, kết hợp từ chanh, sả, gừng và hoa sen.'),
      (v_dish_id, 'en', 'Mot Hoi An Herbal Tea', 'A refreshing herbal tea infused with lemongrass, ginger, and lotus.'),
      (v_dish_id, 'zh', '会安Mót草本茶', '清凉的草本茶，融合了柠檬草、生姜和莲花。'),
      (v_dish_id, 'ko', '호이안 못(Mót) 전통 허브티', '레몬그라스, 생강, 연꽃이 어우러진 상쾌한 허브차입니다.'),
      (v_dish_id, 'ja', 'ホイアン名物モット（Mót）伝統ハーブティー', 'レモングラス、生姜、ハスの花をブレンドした爽やかなハーブティー。');

    -- Món 2: Quán Cao lầu Bá Lễ
    INSERT INTO dishes (name, description, address, price_vnd, image_url, emoji, rating, lat, lng, category_id)
    VALUES (
      'Quán Cao lầu Bá Lễ',
      'Cao lầu là món ăn đặc sản nổi tiếng của Hội An với sợi mì vàng dai đặc trưng, thịt xá xíu đậm đà, da heo giòn và rau sống Trà Quế.',
      '45/3 Trần Hưng Đạo, Hội An',
      60000,
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800',
      '🍜',
      4.9,
      15.8765,
      108.3312,
      v_cat_main
    ) RETURNING id INTO v_dish_id;

    INSERT INTO dish_translations (dish_id, lang, name, description) VALUES
      (v_dish_id, 'vi', 'Cao Lầu Cổ Truyền Hội An', 'Cao lầu là món ăn đặc sản nổi tiếng của Hội An với sợi mì vàng dai đặc trưng, thịt xá xíu đậm đà.'),
      (v_dish_id, 'en', 'Traditional Hoi An Cao Lau Noodles', 'Hoi An signature noodle dish with chewy noodles, savory char siu pork, and crispy pork skin.'),
      (v_dish_id, 'zh', '会安传统高楼面 (Cao Lầu)', '会安标志性的特色面条，配以柔韧的面条、浓郁的叉烧和脆皮。'),
      (v_dish_id, 'ko', '호이안 전통 까오러우 (Cao Lầu)', '쫄깃한 면발과 차슈, 바삭한 돼지껍질이 어우러진 호이안의 대표 국수입니다.'),
      (v_dish_id, 'ja', 'ホイアン伝統カオラウ（伊勢うどん風麺）', 'コシのある麺、特製チャーシュー、カリッとした豚皮が特徴のホイアン名物麺。');

    -- Món 3: Bánh Mì Phượng
    INSERT INTO dishes (name, description, address, price_vnd, image_url, emoji, rating, lat, lng, category_id)
    VALUES (
      'Bánh Mì Phượng',
      'Bánh mì Phượng nổi tiếng toàn cầu với lớp vỏ giòn rụm, phần nhân ngập tràn pate thơm béo, chả lụa, thịt nướng và loại nước sốt gia truyền đặc biệt.',
      '2B Phan Châu Trinh, Hội An',
      40000,
      'https://images.unsplash.com/photo-1626803775151-61d756612f97?auto=format&fit=crop&q=80&w=800',
      '🥖',
      4.7,
      15.8795,
      108.3301,
      v_cat_street
    ) RETURNING id INTO v_dish_id;

    INSERT INTO dish_translations (dish_id, lang, name, description) VALUES
      (v_dish_id, 'vi', 'Bánh Mì Đặc Ruột Hội An', 'Bánh mì Phượng nổi tiếng toàn cầu với lớp vỏ giòn rụm và nước sốt gia truyền.'),
      (v_dish_id, 'en', 'Hoi An Crispy Baguette (Banh Mi)', 'World-famous Vietnamese sandwich with crispy crust, rich pate, and special homemade sauce.'),
      (v_dish_id, 'zh', '会安炭烤法棍三明治', '闻名全球的越南三明治，外皮酥脆，配有浓郁的肉酱和秘制酱汁。'),
      (v_dish_id, 'ko', '호이안 크리스피 반미', '바삭한 바게트와 풍부한 파테, 특제 소스가 어우러진 세계적으로 유명한 반미입니다.'),
      (v_dish_id, 'ja', 'ホイアン炭火焼きバインミー', 'サクサクのパンに特製パテと特製ソースを挟んだ、世界的に有名なベトナム風サンドイッチ。');
  END IF;
END $$;
