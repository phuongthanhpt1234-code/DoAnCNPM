import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

export type SupportedLang = 'vi' | 'en' | 'zh' | 'ko' | 'ja' | 'es' | 'ar';

export interface LocalizedDishText {
  name: string;
  tag: string;
  story: string;
}

export interface DishItem {
  id: string;
  shopVi: string;
  rating: string;
  categoryKey: 'specialty' | 'noodle' | 'vegan' | 'snack' | 'drink';
  hours: string;
  isCalm: boolean;
  image: string;
  lat: number;
  lng: number;
  translations: Record<SupportedLang, LocalizedDishText>;
}

// KHO DỮ LIỆU 25 MÓN ĂN ĐẶC SẢN HỘI AN (5 MÓN / DANH MỤC) - ĐỒNG BỘ 7 NGÔN NGỮ
export const ALL_DISHES_DATA: DishItem[] = [
  // ================= 1. ĐẶC SẢN (5 MÓN: ID 1, 2, 3, 4, 21) =================
  {
    id: '1', shopVi: 'Cơm Gà Bà Buội', rating: '4.8', categoryKey: 'specialty', hours: '10:30 - 20:00', isCalm: false,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop', lat: 15.8782, lng: 108.3265,
    translations: {
      vi: { name: 'Cơm Gà Phố Cổ Hội An', tag: 'Gạo thơm nấu nước luộc gà & nghệ tươi', story: 'Hạt gạo Gò Nổi được rang sơ với tỏi rồi nấu chín bằng nước luộc gà thả vườn và nghệ tươi. Thịt gà da giòn vàng ươm xé phay trộn cùng hành tây, đu đủ chua và rau răm Trà Quế.' },
      en: { name: 'Hoi An Heritage Chicken Rice', tag: 'Turmeric Broth-Cooked Rice & Herbs', story: 'Aged local rice is toasted with garlic and simmered in rich turmeric-infused chicken broth. Free-range chicken is hand-shdedded and tossed with onions, pickled papaya, and Tra Que coriander.' },
      zh: { name: '会安古镇特色鸡饭', tag: '姜黄鸡汤焖饭配茶桂香草', story: '精选当地陈米与蒜蓉微炒后，用散养鸡汤和鲜姜黄慢火焖熟。金黄脆皮鸡肉手撕后，搭配洋葱丝、酸木瓜和茶桂村香草拌匀，香气四溢。' },
      ko: { name: '호이안 전통 치킨라이스', tag: '강황 닭육수 밥과 짜꾸에 허브', story: '마늘과 함께 볶은 쌀을 진한 강황 닭육수로 지어내어 고소함이 일품입니다. 방목한 닭고기를 결대로 찢어 양파, 파파야 피클, 짜꾸에 허브와 버무려 먹습니다.' },
      ja: { name: 'ホイアン伝統チキンライス', tag: 'ウコン鶏だしご飯とチャークエ香草', story: 'ニンニクと炒めた古米を、地鶏のスープと生ウコンでふっくら炊き上げます。手裂きした地鶏に玉ねぎ、青パパイヤの漬物、チャークエ村の香草を添えた逸品です。' },
      es: { name: 'Arroz con Pollo Tradicional de Hoi An', tag: 'Arroz cocido en caldo de cúrcuma', story: 'El arroz local se tuesta con ajo y se cocina en caldo de pollo con cúrcuma fresca, servido con pollo de corral desmenuzado y hierbas de Tra Que.' },
      ar: { name: 'أرز الدجاج التراثي في هوي آن', tag: 'أرز مطهو بمرق الدجاج والكركم', story: 'يُحمص الأرز المحلي مع الثوم ثم يُطهى في مرق الدجاج الغني بالكركم الطازج ويُقدم مع الدجاج البلدي المفتت وأعشاب ترا كوي.' }
    }
  },
  {
    id: '2', shopVi: 'Bánh Mì Phượng', rating: '4.6', categoryKey: 'specialty', hours: '06:30 - 21:30', isCalm: false,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=800&auto=format&fit=crop', lat: 15.8780, lng: 108.3285,
    translations: {
      vi: { name: 'Bánh Mì Đặc Ruột Hội An', tag: 'Vỏ nướng lò than giòn rụm & Sốt gia truyền', story: 'Ổ bánh mì hai đầu nhọn nướng lò than giòn tan, bên trong kẹp pate gan béo mịn, thịt xá xíu, chả lụa, dưa góp và nước sốt gia truyền đậm đà.' },
      en: { name: 'Hoi An Crispy Baguette (Banh Mi)', tag: 'Charcoal-Baked Crust & Secret Sauce', story: 'Pointed-end baguette baked over charcoal for a crackling crust, filled with velvety liver pate, char siu pork, artisanal sausage, and secret house sauce.' },
      zh: { name: '会安炭烤法棍三明治', tag: '炭火酥脆外皮与秘制浓郁酱汁', story: '会安特色尖头法棍经炭火烘烤外酥里嫩，内夹绵密猪肝酱、蜜汁叉烧、越式扎肉、爽口酸菜，并淋上世代相传的秘制酱汁。' },
      ko: { name: '호이안 크리스피 반미', tag: '숯불 바게트와 비법 수제 소스', story: '양끝이 뾰족한 호이안식 바게트를 숯불에 구워 겉은 바삭하고 속은 촉촉합니다. 부드러운 파테, 차슈 돼지고기와 비법 소스가 어우러집니다.' },
      ja: { name: 'ホイアン炭火焼きバインミー', tag: 'パリッと香ばしい皮と秘伝ソース', story: '両端が尖った特徴的なバゲットを炭火でパリッと焼き上げ、濃厚なレバーパテ、チャーシュー、なます、秘伝ソースを贅沢に挟みました。' },
      es: { name: 'Baguette Crujiente de Hoi An (Banh Mi)', tag: 'Corteza al carbón y salsa secreta', story: 'Baguette de puntas afiladas horneada al carbón, rellena de paté suave, cerdo char siu, encurtidos y salsa secreta.' },
      ar: { name: 'خبز الباغيت المقرمش في هوي آن', tag: 'قشرة مخبوزة على الفحم وصلصة سرية', story: 'خبز باغيت مقرمش مخبوز على الفحم محشو بباتيه الكبد الغني ولحم المشوي والخضروات المخللة مع الصلصة التقليدية.' }
    }
  },
  {
    id: '3', shopVi: 'Quán Giếng Bá Lễ', rating: '4.5', categoryKey: 'specialty', hours: '11:00 - 21:30', isCalm: true,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop', lat: 15.8765, lng: 108.3280,
    translations: {
      vi: { name: 'Bánh Xèo Tôm Đất Xứ Quảng', tag: 'Đổ khuôn gang nhỏ & Nước lèo tương đậu', story: 'Bánh xèo đổ trong chảo gang nhỏ tạo viền giòn rụm, nhân tôm đất sông Thu Bồn và giá đỗ, cuốn bánh tráng mỏng cùng rau sống chấm tương đậu phộng.' },
      en: { name: 'Quang-Style Crispy Rice Pancake', tag: 'Cast-Iron Crepe & Peanut Dipping Sauce', story: 'Poured into small cast-iron skillets for maximum crunch, filled with river shrimp and bean sprouts, wrapped in rice paper with warm peanut sauce.' },
      zh: { name: '广南风味鲜虾脆煎饼', tag: '小铸铁锅煎制配花生芝麻浓酱', story: '用传统小铸铁锅煎出金黄酥脆的饼边，内含秋盆河鲜虾与豆芽，食用时以薄米纸卷起新鲜生菜，蘸温热的花生芝麻酱享用。' },
      ko: { name: '꽝남식 바삭한 새우 반쎄오', tag: '무쇠 팬 조리와 따뜻한 땅콩 소스', story: '작은 무쇠 팬에 부쳐내어 가장자리가 바삭한 쌀 크레페입니다. 강새우와 숙주를 넣고 라이스페이퍼와 허브로 감싸 고소한 땅콩 소스에 찍어 먹습니다.' },
      ja: { name: 'クアンナム風パリパリお好み焼き', tag: '鉄鍋焼きクレープと濃厚ピーナッツだれ', story: '小さな鉄鍋でカリッと焼き上げたウコン風味の米粉クレープ。川エビともやしを包み、ライスペーパーと香草で巻いて温かいピーナッツだれで味わいます。' },
      es: { name: 'Crepa Crujiente de Camarones (Banh Xeo)', tag: 'Sartén de hierro y salsa de maní', story: 'Crepa de arroz y cúrcuma cocinada en sartén de hierro con camarones de río y brotes, envuelta en papel de arroz con salsa de maní.' },
      ar: { name: 'فطيرة الأرز المقرمشة بالروبيان', tag: 'مخبوزة في مقلاة حديدية مع صلصة الفول السوداني', story: 'فطيرة أرز مقرمشة محشوة بروبيان النهر الطازج وبراعم الفاصوليا، تُلف بورق الأرز وتُغمس في صلصة الفول السوداني.' }
    }
  },
  {
    id: '4', shopVi: 'Bông Hồng Trắng', rating: '4.7', categoryKey: 'specialty', hours: '07:00 - 20:30', isCalm: true,
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=800&auto=format&fit=crop', lat: 15.8790, lng: 108.3250,
    translations: {
      vi: { name: 'Bánh Vạc Bông Hồng Trắng', tag: 'Bột gạo lọc 15 lần bằng nước giếng cổ', story: 'Lớp vỏ bánh làm từ gạo thơm lọc mười lăm lần bằng nước giếng Bá Lễ, vuốt mỏng như cánh hồng trắng ôm nhân tôm đất giã nhuyễn và hành phi.' },
      en: { name: 'White Rose Shrimp Dumplings', tag: '15-Times Filtered Ancient Well Rice Dough', story: 'Translucent rice dough filtered fifteen times with ancient well water, hand-pleated like white rose petals around spiced shrimp and crispy shallots.' },
      zh: { name: '会安白玫瑰鲜虾饺', tag: '古井水十五道过滤纯米薄皮', story: '采用巴礼古井水经过十五道过滤的纯米浆制成晶莹剔透的薄皮，手工捏成盛开的白玫瑰形状，包裹鲜虾肉馅，撒上金黄炸红葱酥。' },
      ko: { name: '화이트 로즈 새우 만두 (반박)', tag: '고대 우물물로 15번 정제한 쌀피', story: '발레 고대 우물물로 15번 걸러낸 투명한 쌀 반죽을 하얀 장미꽃잎 모양으로 빚어 양념한 새우 소를 넣고 튀긴 샬롯을 올린 요리입니다.' },
      ja: { name: 'ホワイトローズ（米粉の蒸し餃子）', tag: '古井戸水で15回濾した透明な米粉皮', story: 'バーレー古井戸の水で15回濾した米粉生地を白いバラの花びらのように手包みし、エビのすり身を詰めて蒸し上げた芸術的な一皿です。' },
      es: { name: 'Empanadillas Rosa Blanca (White Rose)', tag: 'Masa de arroz filtrada 15 veces', story: 'Masa de arroz translúcida filtrada quince veces con agua de pozo antiguo, plegada a mano como pétalos de rosa blanca con camarón.' },
      ar: { name: 'زلابية الوردة البيضاء بالروبيان', tag: 'عجينة أرز مصفاة 15 مرة بماء البئر القديم', story: 'عجينة أرز شفافة تُشكل يدوياً مثل بتلات الورد الأبيض وتحشى بالروبيان المتبل وتُزين بالبصل المقرمش.' }
    }
  },
  {
    id: '21', shopVi: 'Lò Bánh Gia Truyền Cẩm Phô', rating: '4.6', categoryKey: 'specialty', hours: '07:00 - 19:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop', lat: 15.8786, lng: 108.3245,
    translations: {
      vi: { name: 'Bánh Tổ Cổ Truyền Xứ Quảng', tag: 'Gạo nếp hương & Đường bát thắng gừng', story: 'Món bánh tiến vua làm từ gạo nếp hương xay mịn quyện cùng đường bát Quảng Nam nấu gừng già, hấp trong rọ tre lót lá chuối rồi chiên xém cạnh dẻo thơm.' },
      en: { name: 'Royal Quang Sticky Rice Cake (Banh To)', tag: 'Heirloom Glutinous Rice & Ginger Cane Sugar', story: 'Traditional royal delicacy made from fragrant glutinous rice flour, raw cane sugar, and aged ginger, steamed in banana-leaf baskets and pan-seared crispy.' },
      zh: { name: '广南古法红糖姜汁年糕 (Bánh Tổ)', tag: '竹笼蕉叶蒸制糯米红糖老姜糕', story: '昔日进贡皇室的传统名点，选用香糯米粉与广南手工红糖块、老姜汁调合，垫蕉叶蒸熟后微煎至外脆内糯，姜香浓郁。' },
      ko: { name: '꽝남 전통 생강 흑당 찰떡 (반또)', tag: '바나나잎 대나무 바구니에 쪄낸 황실 찰떡', story: '향긋한 찹쌀가루에 전통 흑당과 숙성 생강즙을 넣어 바나나잎 바구니에 쪄낸 뒤, 겉을 노릇하고 바삭하게 구워 먹는 전통 별미입니다.' },
      ja: { name: 'クアンナム伝統・黒糖生姜もち（バイントー）', tag: 'バナナ葉籠で蒸し上げる宮廷献上餅', story: '香り高いもち米粉と伝統黒糖、生姜汁を合わせてバナナの葉を敷いた竹籠で蒸し上げ、表面を香ばしく焼いて味わう伝統菓子です。' },
      es: { name: 'Pastel Real de Arroz Glutinoso y Jengibre', tag: 'Arroz glutinoso al vapor con azúcar de caña', story: 'Delicia tradicional elaborada con harina de arroz glutinoso, azúcar de caña y jengibre, cocida al vapor en hojas de plátano y dorada a la sartén.' },
      ar: { name: 'كعكة الأرز اللزج الملكية بالزنجبيل والسكر الأسمر', tag: 'مطهو على البخار في أوراق الموز مع الزنجبيل', story: 'حلوى ملكية تقليدية تُصنع من دقيق الأرز اللزج العطري وسكر القصب الخام والزنجبيل، تُطهى بالبخار ثم تُحمر قليلاً.' }
    }
  },

  // ================= 2. MÓN NƯỚC (5 MÓN: ID 5, 6, 7, 8, 22) =================
  {
    id: '5', shopVi: 'Không Gian Xanh', rating: '4.7', categoryKey: 'noodle', hours: '09:00 - 21:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800&auto=format&fit=crop', lat: 15.87815, lng: 108.32655,
    translations: {
      vi: { name: 'Cao Lầu Cổ Truyền Hội An', tag: 'Sợi mì ngâm tro củi Cù Lao Chàm & Giếng Bá Lễ', story: 'Sợi mì Cao Lầu nhào từ gạo ngâm tro củi tràm Cù Lao Chàm và nước giếng Bá Lễ tạo độ dai giòn độc nhất, ăn kèm thịt xá xíu ngũ vị và tóp mỡ giòn.' },
      en: { name: 'Traditional Hoi An Cao Lau Noodles', tag: 'Cham Island Wood-Ash & Ba Le Well Noodles', story: 'Chewy golden noodles made from rice soaked in Cham Island wood-ash water and Ba Le well water, tossed with five-spice char siu pork and crispy squares.' },
      zh: { name: '会安传统高楼面 (Cao Lầu)', tag: '占婆岛木灰水与巴礼古井水手工面', story: '高楼面是会安的灵魂美食。面条必须用占婆岛相思木灰水与巴礼古井水揉制，口感筋道爽滑，配以五香叉烧肉、酥脆炸猪皮和茶桂香草。' },
      ko: { name: '호이안 전통 까오러우 (Cao Lầu)', tag: '참섬 나무재 물과 발레 우물물로 만든 면', story: '참섬의 나무재 물과 발레 우물물로 반죽해 쫄깃한 식감을 자랑하는 황금빛 면 요리입니다. 오향 차슈 돼지고기와 바삭한 크래커를 곁들입니다.' },
      ja: { name: 'ホイアン伝統カオラウ（伊勢うどん風麺）', tag: 'チャム島の灰汁と古井戸水で打つ黄金麺', story: 'チャム島の木灰汁とバーレー古井戸の水で練り上げた独特のコシを持つ太麺に、五香粉香るチャーシューと揚げせんべい、新鮮な香草を絡めて味わいます。' },
      es: { name: 'Fideos Tradicionales Cao Lau', tag: 'Fideos de agua de ceniza de Isla Cham', story: 'Fideos dorados masticables elaborados con agua de ceniza de madera de la Isla Cham y agua del pozo Ba Le, servidos con cerdo char siu.' },
      ar: { name: 'نودلز كاو لاو التقليدية في هوي آن', tag: 'نودلز محضرة بماء رماد جزيرة تشام وبئر با لي', story: 'نودلز ذهبية ذات قوام مميز تُصنع من الأرز المنقوع في ماء رماد الخشب وماء بئر با لي القديم، تُقدم مع اللحم المتبل.' }
    }
  },
  {
    id: '6', shopVi: 'Mì Quảng Ông Hai', rating: '4.6', categoryKey: 'noodle', hours: '07:30 - 21:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop', lat: 15.8777, lng: 108.3272,
    translations: {
      vi: { name: 'Mì Quảng Tôm Thịt Trứng', tag: 'Nước nhân cô đặc & Bánh tráng mè nướng', story: 'Sợi mì gạo thoa dầu phụng khử nén thơm lừng, chan lớp nước nhân tôm thịt rim đậm đà, ăn kèm đậu phộng rang và bánh tráng mè nướng giòn.' },
      en: { name: 'Quang-Style Turmeric Rice Noodles', tag: 'Concentrated Shrimp Broth & Sesame Cracker', story: 'Flat rice noodles brushed with aromatic peanut oil, ladled with rich simmered shrimp and pork gravy, topped with roasted peanuts and sesame crackers.' },
      zh: { name: '广南鲜虾猪肉姜黄宽面', tag: '浓郁虾肉卤汁配炭烤芝麻米饼', story: '手工宽米粉涂抹香浓花生油，浇上慢火熬制的鲜虾猪肉浓缩卤汁，搭配鹌鹑蛋、烤花生米和酥脆的炭烤黑芝麻米饼。' },
      ko: { name: '꽝남식 강황 쌀국수 (미꽝)', tag: '진한 새우 돼지고기 육수와 참깨 바삭전병', story: '땅콩기름을 발라 고소한 납작 쌀면 위에 진하게 졸인 새우와 돼지고기 육수를 자작하게 붓고, 구운 땅콩과 참깨 라이스크래커를 부숴 먹습니다.' },
      ja: { name: 'ミークアン（クアンナム風汁なし混ぜ麺）', tag: '濃厚エビ豚スープと黒ごま焼きせんべい', story: 'ピーナッツオイルが香る平打ち米麺に、エビと豚肉の旨味が凝縮された少量の濃厚スープをかけ、香ばしい黒ごまライスクラッカーを割り入れて楽しみます。' },
      es: { name: 'Fideos Mi Quang con Camarones', tag: 'Caldo concentrado y galleta de sésamo', story: 'Fideos planos de arroz con cúrcuma bañados en una reducción concentrada de camarones y cerdo, acompañados de galleta de sésamo.' },
      ar: { name: 'نودلز مي كوانغ بالكركم والروبيان', tag: 'مرق الروبيان المركز ورقائق السمسم المقرمشة', story: 'شرائط أرز عريضة متبلة بزيت الفول السوداني العطري مع مرق الروبيان المركز ورقائق الأرز بالسمسم.' }
    }
  },
  {
    id: '7', shopVi: 'Bún Bà Thuận', rating: '4.5', categoryKey: 'noodle', hours: '06:30 - 18:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop', lat: 15.8784, lng: 108.3278,
    translations: {
      vi: { name: 'Bún Mắm Nêm Heo Quay', tag: 'Mắm nêm cá cơm ủ chum & Mít non luộc', story: 'Bún tươi trộn cùng thịt heo quay da nổ giòn rụm, mít non luộc bùi ngọt, rưới mắm nêm cá cơm pha thơm bằm và tỏi ớt dậy vị.' },
      en: { name: 'Crispy Roast Pork Vermicelli', tag: 'Anchovy Pineapple Sauce & Young Jackfruit', story: 'Fresh rice vermicelli topped with crackling roast pork belly and tender boiled young jackfruit, tossed in pineapple-garlic fermented anchovy sauce.' },
      zh: { name: '脆皮烧肉菠萝鱼露拌米粉', tag: '传统发酵凤尾鱼酱配嫩菠萝蜜', story: '爽滑鲜米粉铺上外皮酥脆的烤五花肉与清甜水煮嫩菠萝蜜，淋上由凤尾鱼酱、碎菠萝与蒜辣椒调制而成的特色酱汁。' },
      ko: { name: '바삭한 구운 삼겹살 비빔 쌀국수', tag: '파인애플 멸치 소스 & 영 잭프루트', story: '신선한 쌀국수 위에 껍질이 바삭한 로스트 포크와 부드럽게 삶은 어린 잭프루트를 올리고, 파인애플과 마늘을 넣은 특제 피쉬소스로 비벼 먹습니다.' },
      ja: { name: 'カリカリ焼き豚の発酵魚醤ビーフン', tag: 'パイナップル入り魚醤だれと若ジャックフルーツ', story: '皮までパリパリに焼いたローストポークと柔らかい若ジャックフルーツを米麺にのせ、パイナップルとニンニクが香る特製発酵魚醤だれで和えて味わいます。' },
      es: { name: 'Fideos con Cerdo Asado Crujiente', tag: 'Salsa de anchoas con piña y yaca tierna', story: 'Fideos de arroz frescos con panceta de cerdo asada crujiente y yaca tierna hervida, aderezados con salsa de anchoas y piña.' },
      ar: { name: 'شعيرية الأرز باللحم المحمص المقرمش', tag: 'صلصة الأنشوجة بالأناناس والجاك فروت الطري', story: 'شعيرية أرز طازجة مع اللحم المحمص المقرمش والجاك فروت المسلوق، متبلة بصلصة الأنشوجة بالأناناس.' }
    }
  },
  {
    id: '8', shopVi: 'Hoành Thánh Anh Dũng', rating: '4.6', categoryKey: 'noodle', hours: '08:00 - 21:30', isCalm: true,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop', lat: 15.8779, lng: 108.3262,
    translations: {
      vi: { name: 'Hoành Thánh Súp Tôm Tươi', tag: 'Vỏ bột mì cán mỏng & Nước dùng xương hầm', story: 'Lá hoành thánh cán mỏng mượt như lụa gói nhân tôm tươi giòn ngọt, nấu trong làn nước dùng xương ống hầm nấm đông cô thanh tao.' },
      en: { name: 'Silky Shrimp Wonton Noodle Soup', tag: 'Delicate Wheat Wrappers & Mushroom Bone Broth', story: 'Silky thin wheat wrappers cradling sweet river shrimp in a crystal-clear, slow-simmered pork bone and shiitake mushroom broth.' },
      zh: { name: '古镇鲜虾高汤云吞面', tag: '丝滑薄皮鲜虾云吞配香菇骨汤', story: '传承自十七世纪华人商贾的技艺，面皮薄如蝉翼，包裹弹牙河虾仁，配以猪筒骨与冬菇慢火熬制的清甜高汤。' },
      ko: { name: '올드타운 생새우 완탕면', tag: '실크처럼 얇은 만두피와 표고버섯 사골 육수', story: '비단처럼 얇고 부드러운 만두피에 탱글탱글한 생새우 소를 채워 넣고, 돼지 사골과 표고버섯으로 맑고 깊게 우려낸 육수에 담아냅니다.' },
      ja: { name: 'ホイアン風プリプリ海老ワンタンスープ', tag: '絹のように滑らかな皮と椎茸ボーンブロス', story: '17世紀の交易港時代から伝わるレシピ。透き通るように薄い皮で新鮮な川エビを包み、豚骨と椎茸でじっくり取った澄んだ黄金スープでいただきます。' },
      es: { name: 'Sopa de Wonton de Camarones Frescos', tag: 'Masa fina como seda y caldo de setas', story: 'Finas envolturas de trigo rellenas de camarones dulces en un caldo cristalino cocinado a fuego lento con setas shiitake.' },
      ar: { name: 'حساء وونتون الروبيان الطازج', tag: 'عجينة رقيقة كالحرير ومرق الفطر الغني', story: 'رقائق عجين ناعمة محشوة بالروبيان الطازج تُقدم في مرق صافٍ مطهو ببطء مع فطر الشيتاكي.' }
    }
  },
  {
    id: '22', shopVi: 'Bún Nghệ Gánh Phố Cổ', rating: '4.5', categoryKey: 'noodle', hours: '14:00 - 20:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop', lat: 15.8776, lng: 108.3279,
    translations: {
      vi: { name: 'Bún Nghệ Xào Nghệ Tươi Rau Răm', tag: 'Nghệ sẻ giã tay vàng óng & Hương rau răm', story: 'Món ăn dân dã đậm tình xứ Quảng: bún gạo tươi xào nóng trên chảo gang cùng củ nghệ sẻ giã nhuyễn vàng ươm, hành tỏi phi thơm và thật nhiều rau răm cắt nhỏ.' },
      en: { name: 'Golden Fresh Turmeric Stir-Fried Vermicelli', tag: 'Hand-Pounded Wild Turmeric & Coriander', story: 'Rustic Quang comfort dish: fresh rice vermicelli wok-tossed with hand-pounded golden turmeric root, aromatic shallots, and generous Vietnamese coriander.' },
      zh: { name: '广南鲜姜黄香草炒米粉', tag: '手工捣碎鲜姜黄与水蓼香草热炒', story: '充满广南乡土风情的传统小吃：新鲜米线与手工捣碎的金黄鲜姜黄、红葱头在铁锅中大火快炒，撒上大量切碎的越南水蓼香草。' },
      ko: { name: '황금 생강황 라우람 볶음 쌀국수 (분응에)', tag: '절구에 찧은 생강황과 베트남 고수의 향연', story: '신선한 쌀국수를 절구에 찧은 황금빛 생강황, 샬롯과 함께 무쇠 팬에 볶아내어 몸에 좋고 향긋한 베트남 허브 라우람을 듬뿍 곁들인 요리입니다.' },
      ja: { name: '生ウコンと香草の黄金焼きビーフン（ブンゲ）', tag: '手搗き生ウコンとベトナムコリアンダーの香り', story: 'すり潰した鮮やかな生ウコンとエシャロットで米麺を香ばしく炒め、たっぷりのベトナムコリアンダー（ラウラム）を合わせた滋味深い郷土麺です。' },
      es: { name: 'Fideos Salteados con Cúrcuma Fresca Dorada', tag: 'Cúrcuma silvestre machacada a mano y cilantro', story: 'Fideos de arroz frescos salteados al wok con raíz de cúrcuma dorada machacada a mano, chalotes aromáticos y abundante cilantro vietnamita.' },
      ar: { name: 'شعيرية الأرز المقلية بالكركم الطازج الذهبي', tag: 'كركم طازج مدقوق يدوياً وأعشاب عطرية', story: 'شعيرية أرز طازجة تُقلى في المقلاة مع جذور الكركم الطازجة المدقوقة يدوياً والبصل المحمر والأعشاب الفيتنامية.' }
    }
  },

  // ================= 3. MÓN CHAY (5 MÓN: ID 9, 10, 11, 12, 23) =================
  {
    id: '9', shopVi: 'Chè Cẩm Nam', rating: '4.4', categoryKey: 'vegan', hours: '09:00 - 22:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?q=80&w=800&auto=format&fit=crop', lat: 15.8760, lng: 108.3300,
    translations: {
      vi: { name: 'Chè Bắp Non Cẩm Nam', tag: 'Bắp nếp non bãi bồi & Nước cốt dừa', story: 'Bắp nếp non vừa ngậm sữa trồng trên đất phù sa Cẩm Nam được bào mỏng, nấu lửa nhỏ cùng đường phèn, lá dứa và nước cốt dừa béo ngậy.' },
      en: { name: 'Cam Nam Baby Corn Sweet Soup', tag: 'Alluvial Island Milk-Corn & Coconut Cream', story: 'Milk-stage glutinous baby corn from Cam Nam alluvial island is thinly shaved and slow-simmered with rock sugar, pandan leaves, and rich coconut cream.' },
      zh: { name: '锦南岛椰香嫩玉米甜羹', tag: '冲积洲乳熟糯玉米配香兰椰浆', story: '选用锦南冲积岛上刚刚灌浆的鲜嫩糯玉米，削成薄片后与冰糖、班兰叶慢火熬煮，食用时淋上浓郁鲜榨椰浆。' },
      ko: { name: '깜남 섬 코코넛 초당옥수수 체 (Chè)', tag: '충적토 찰옥수수와 판단잎 코코넛 크림', story: '깜남 섬의 비옥한 충적토에서 자란 부드러운 어린 찰옥수수를 얇게 썰어 암설탕, 판단잎과 함께 끓여낸 뒤 고소한 코코넛 밀크를 얹어 먹습니다.' },
      ja: { name: 'カムナム島の若トウモロコシとココナッツのチェー', tag: '中洲で育った甘みコーンとパンダンココナッツ', story: 'カムナム島の肥沃な土壌で育ったミルクたっぷりの若いモチトウモロコシを薄く削り、氷砂糖とパンダンリーフで優しく煮込んだココナッツデザートです。' },
      es: { name: 'Postre Dulce de Maíz Tierno de Cam Nam', tag: 'Maíz lechoso de isla aluvial y crema de coco', story: 'Maíz tierno glutinoso de la isla Cam Nam rallado fino y cocinado a fuego lento con azúcar de roca, hojas de pandan y crema de coco.' },
      ar: { name: 'حلوى الذرة الطرية بحليب جوز الهند', tag: 'ذرة جزيرة كام نام الطرية وكريمة جوز الهند', story: 'ذرة صغيرة حلوة من جزيرة كام نام تُبشر وتُطهى على نار هادئة مع سكر النبات وأوراق الباندان وكريمة جوز الهند.' }
    }
  },
  {
    id: '10', shopVi: 'Gánh Chè Ông Thiều', rating: '4.6', categoryKey: 'vegan', hours: '16:00 - 21:00', isCalm: false,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop', lat: 15.8805, lng: 108.3240,
    translations: {
      vi: { name: 'Chè Xí Mà Phù (Mè Đen Cổ Truyền)', tag: 'Mè đen xay cối đá & Thảo mộc dưỡng sinh', story: 'Hạt mè đen rang thơm xay nhuyễn bằng cối đá, nấu cùng bột sắn dây và thảo mộc Đông y tạo thành chén chè đen nhánh, ấm nóng bổ dưỡng.' },
      en: { name: 'Traditional Black Sesame Herbal Pudding', tag: 'Stone-Ground Black Sesame & Oriental Herbs', story: 'Century-old Hoi An delicacy made from stone-ground roasted black sesame cooked with arrowroot and medicinal herbs into a glossy, warming pudding.' },
      zh: { name: '古法石磨养生黑芝麻糊', tag: '百年传承石磨黑芝麻与草本配方', story: '会安流传近百年的养生甜品。精选黑芝麻炒香后以石磨研成细浆，加入葛根粉与传统草本慢火熬成乌黑亮泽、温润滋补的芝麻糊。' },
      ko: { name: '전통 맷돌 흑임자 한방 죽 (씨마푸)', tag: '100년 전통 맷돌 검은깨와 약초 레시피', story: '볶은 검은깨를 맷돌에 곱게 갈아 칡전분과 전통 약초를 넣고 푹 끓여낸 100년 전통의 따뜻하고 고소한 보양 디저트입니다.' },
      ja: { name: '黒ごまの薬膳おしるこ（シーマーフー）', tag: '石臼挽き黒ごまと東洋ハーブの百年レシピ', story: '香ばしく煎った黒ごまを石臼で滑らかに挽き、葛粉と漢方ハーブを加えてとろみをつけた、100年続くホイアン伝統の温かい養生スイーツです。' },
      es: { name: 'Pudín Tradicional de Sésamo Negro', tag: 'Sésamo negro molido en piedra y hierbas', story: 'Receta centenaria de Hoi An elaborada con sésamo negro tostado molido en piedra y cocinado con hierbas medicinales.' },
      ar: { name: 'بودينغ السمسم الأسود العشبي التقليدي', tag: 'سمسم أسود مطحون بالرحى وأعشاب طبيعية', story: 'حلوى تراثية دافئة تُحضر من السمسم الأسود المحمص والمطحون بالحجر مع الأعشاب الشرقية المفيدة.' }
    }
  },
  {
    id: '11', shopVi: 'Tàu Phớ Sông Hoài', rating: '4.5', categoryKey: 'vegan', hours: '14:00 - 22:30', isCalm: true,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop', lat: 15.8772, lng: 108.3275,
    translations: {
      vi: { name: 'Tàu Phớ Nước Đường Gừng Sẻ', tag: 'Đậu nành quê mềm mịn & Đường đen gừng ấm', story: 'Đậu hũ non làm từ đậu nành quê mềm tan đầu lưỡi, hớt từng lát mỏng bằng muôi đồng và chan nước đường đen thắng gừng sẻ thơm nồng.' },
      en: { name: 'Silky Tofu Pudding in Ginger Syrup', tag: 'Heirloom Soy Curd & Warm Spiced Ginger', story: 'Velvety soy pudding skimmed in paper-thin layers using a copper ladle and bathed in dark cane sugar syrup infused with aromatic local ginger.' },
      zh: { name: '怀河姜汁黑糖手工豆腐花', tag: '古法铜勺薄片豆花配老姜黑糖水', story: '选用当地非转基因黄豆手工点制的嫩豆花，用传统扁铜勺片成薄如纸张的豆花层，淋上老姜慢熬的温热黑糖水，入口即化。' },
      ko: { name: '생강 흑당 시럽 순두부 푸딩 (따우포)', tag: '수제 연두부와 따뜻한 생강 사탕수수 시럽', story: '전통 방식으로 만든 부드러운 순두부를 얇게 떠내어, 향긋한 토종 생강을 넣고 달인 따뜻한 흑설탕 시럽을 부어 먹는 디저트입니다.' },
      ja: { name: '生姜黒蜜のなめらか豆花（タウフォー）', tag: '銅杓子ですくう極薄豆腐と生姜シロップ', story: '地元産大豆で作る絹のように滑らかな豆腐プリンを銅の杓子で薄くすくい、香り高い生姜を効かせた温かい黒糖シロップをかけて味わいます。' },
      es: { name: 'Flan Sedoso de Tofu con Jarabe de Jengibre', tag: 'Cuajada de soja artesanal y jengibre tibio', story: 'Suave pudín de soja cortado en láminas finas y bañado en jarabe tibio de azúcar de caña oscura con jengibre fresco.' },
      ar: { name: 'بودينغ التوفو الناعم بشراب الزنجبيل', tag: 'فول صويا تقليدي وشراب السكر الأسمر بالزنجبيل', story: 'حلوى التوفو الحريرية الناعمة تُقدم في شراب السكر الأسمر الدافئ المنكه بالزنجبيل الطازج.' }
    }
  },
  {
    id: '12', shopVi: 'Chay Tâm Quang', rating: '4.7', categoryKey: 'vegan', hours: '07:00 - 20:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop', lat: 15.8792, lng: 108.3260,
    translations: {
      vi: { name: 'Cao Lầu Chay Thanh Tịnh', tag: 'Nấm đùi gà khìa ngũ vị & Ram giòn chay', story: 'Sợi mì Cao Lầu dai giòn kết hợp cùng nấm đông cô, nấm đùi gà khìa ngũ vị hương, đậu khuôn chiên vàng và rau thơm Trà Quế thuần chay.' },
      en: { name: 'Zen Plant-Based Cao Lau Noodles', tag: 'Five-Spice Braised Mushroom & Vegan Crisps', story: 'Authentic chewy Cao Lau noodles paired with five-spice braised king oyster mushrooms, crispy tofu skin, and fresh organic Tra Que herbs.' },
      zh: { name: '禅意五香杏鲍菇素高楼面', tag: '100%纯素五香卤菇配茶桂有机生菜', story: '保留会安高楼面独特的筋道口感，以五香慢卤杏鲍菇、香菇及酥脆腐皮代替肉类，搭配茶桂村有机香草，清爽回甘。' },
      ko: { name: '오향 새송이버섯 비건 까오러우', tag: '100% 식물성 오향 버섯조림과 바삭한 두부피', story: '쫄깃한 까오러우 면발에 오향 소스로 조린 새송이버섯과 표고버섯, 바삭한 유부 크래커, 짜꾸에 유기농 허브를 곁들인 순식물성 요리입니다.' },
      ja: { name: '精進カオラウ（五香エリンギと有機ハーブ）', tag: '100%植物性・五香粉香るキノコと揚げ湯葉', story: '伝統カオラウ麺のコシはそのままに、五香粉で甘辛く煮込んだエリンギと椎茸、カリカリの揚げ湯葉、チャークエ村の有機ハーブを添えた菜食麺です。' },
      es: { name: 'Cao Lau Vegano con Setas Estofadas', tag: '100% vegetal con setas a las cinco especias', story: 'Fideos Cao Lau masticables servidos con setas rey ostra estofadas en cinco especias, tofu crujiente y hierbas orgánicas.' },
      ar: { name: 'نودلز كاو لاو النباتية بالفطر المتبل', tag: 'طبق نباتي 100% مع فطر المحار والأعشاب العضوية', story: 'نودلز كاو لاو التقليدية مع فطر المحار المطهو بالتوابل الخمسة والتوفو المقرمش وأعشاب ترا كوي العضوية.' }
    }
  },
  {
    id: '23', shopVi: 'Chè Sen Cổ Tháp', rating: '4.8', categoryKey: 'vegan', hours: '10:00 - 22:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop', lat: 15.8771, lng: 108.3282,
    translations: {
      vi: { name: 'Chè Hạt Sen Nhãn Nhục Phố Cổ', tag: 'Sen bở hồ Tịnh Tâm & Long nhãn đường phèn', story: 'Hạt sen tươi ninh vừa chín tới giữ nguyên độ bùi bở mà không nát, lồng bên trong cùi nhãn nhục dẻo ngọt, nấu cùng đường phèn thanh mát giúp an thần.' },
      en: { name: 'Lotus Seed & Longan Rock Sugar Sweet Soup', tag: 'velvety Lotus Seeds & Dried Longan Infusion', story: 'Tender lotus seeds tucked inside sweet dried longan fruit, gently poached in clear rock-sugar syrup scented with jasmine blossoms for a soothing dessert.' },
      zh: { name: '古镇冰糖桂圆抱莲子甜汤', tag: '软糯鲜莲子镶桂圆肉配茉莉冰糖水', story: '精选饱满鲜莲子慢火炖至软糯而不散，嵌入清甜桂圆肉中，佐以茉莉花香冰糖水，清心安神、温润甘甜。' },
      ko: { name: '호이안 연자육 용안 암설탕 화채 (체센)', tag: '부드러운 연꽃씨와 달콤한 용안육의 조화', story: '부드럽게 삶아낸 연꽃씨를 달콤한 건조 용안 과육 속에 넣어 재스민 향이 감도는 맑은 암설탕 시럽에 띄워 먹는 고급 전통 디저트입니다.' },
      ja: { name: '蓮の実と竜眼の氷砂糖コンポート（チェーセン）', tag: 'ほっくり蓮の実と竜眼のジャスミンシロップ煮', story: '煮崩れないよう丁寧に炊いた蓮の実を甘い竜眼の果肉で包み、ジャスミン香る澄んだ氷砂糖シロップでいただく上品な伝統甘味です。' },
      es: { name: 'Sopa Dulce de Semillas de Loto y Longan', tag: 'Semillas de loto tiernas en almíbar de jazmín', story: 'Semillas de loto tiernas envueltas en fruta de longan dulce, escalfadas en almíbar claro de azúcar de roca con aroma a jazmín.' },
      ar: { name: 'حساء بذور اللوتس واللونجان الحلو بسكر النبات', tag: 'بذور اللوتس الطرية مع فاكهة اللونجان وماء الياسمين', story: 'بذور لوتس طرية محشوة داخل فاكهة اللونجان الحلوة، مطهوة في شراب سكر النبات الصافي المنكه بالياسمين.' }
    }
  },

  // ================= 4. ĂN VẶT (5 MÓN: ID 13, 14, 15, 16, 24) =================
  {
    id: '13', shopVi: 'Phố Ẩm Thực', rating: '4.3', categoryKey: 'snack', hours: '10:00 - 22:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=800&auto=format&fit=crop', lat: 15.8785, lng: 108.3255,
    translations: {
      vi: { name: 'Hoành Thánh Chiên Sốt Chua Ngọt', tag: 'Vỏ chiên phồng cánh bướm & Sốt dứa tôm', story: 'Lá hoành thánh chiên phồng giòn rụm như cánh bướm vàng, phủ lớp sốt sền sệt nấu từ cà chua, dứa chín, nấm mèo và tôm đất bằm.' },
      en: { name: 'Crispy Fried Wonton with Pineapple Salsa', tag: 'Golden Puff Wontons & Sweet-Sour Shrimp Glaze', story: 'Shrimp wonton wrappers deep-fried into airy golden crisps and crowned with a vibrant sweet-and-sour pineapple, tomato, and minced shrimp glaze.' },
      zh: { name: '凤梨鲜虾糖醋脆皮炸云吞', tag: '金黄蝴蝶脆皮配菠萝鲜虾糖醋汁', story: '会安特色创意小吃：云吞皮炸至金黄酥脆如蝴蝶展翅，上方浇满由新鲜菠萝、番茄、木耳和虾仁碎熬制的酸甜浓汁。' },
      ko: { name: '파인애플 새우 칠리 크리스피 완탕 튀김', tag: '바삭한 황금빛 만두피와 새콤달콤 새우 살사', story: '나비 날개처럼 바삭하게 튀겨낸 완탕피 위에 신선한 파인애플, 토마토, 다진 새우로 만든 새콤달콤한 특제 소스를 듬뿍 얹어냅니다.' },
      ja: { name: '揚げワンタンのパイナップル甘酢あんかけ', tag: 'パリパリ黄金ワンタンと海老パイナップル餡', story: '蝶の羽のようにパリッと揚げたワンタンの皮に、完熟パイナップル、トマト、刻みエビで作ったフルーティーな甘酢あんをたっぷりかけました。' },
      es: { name: 'Wonton Frito Crujiente con Salsa de Piña', tag: 'Wontons dorados con glaseado agridulce', story: 'Crujientes láminas de wonton fritas cubiertas con una vibrante salsa agridulce de piña fresca, tomate y camarones picados.' },
      ar: { name: 'وونتون مقلي مقرمش بصلصة الأناناس', tag: 'رقائق ذهبية مقرمشة مع صلصة الروبيان الحلوة والحامضة', story: 'رقائق وونتون مقلية ومقرمشة مغطاة بصلصة غنية من الأناناس الطازج والطماطم والروبيان المفروم.' }
    }
  },
  {
    id: '14', shopVi: 'Bờ Sông Hoài', rating: '4.8', categoryKey: 'snack', hours: '15:30 - 22:30', isCalm: false,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop', lat: 15.8768, lng: 108.3268,
    translations: {
      vi: { name: 'Thịt Xiên Nướng Cuốn Bánh Ướt', tag: 'Ướp mật ong ngũ vị & Nướng than hoa bờ sông', story: 'Thịt vai heo ướp sả, mật ong và ngũ vị hương nướng trên bếp than hồng, cuốn cùng bánh tráng mỏng, bánh ướt dẻo, khế chua và chấm tương đậu.' },
      en: { name: 'Charcoal Grilled Pork Skewers & Wet Rolls', tag: 'Honey Five-Spice Marinade & Double Rice Paper', story: 'Pork shoulder marinated in lemongrass, honey, and five-spice, grilled over glowing charcoal and wrapped in wet and dry rice paper with fresh herbs.' },
      zh: { name: '怀河炭烤蜜汁五香猪肉串卷', tag: '香茅蜜汁炭火现烤配双层米纸卷', story: '猪肩肉以香茅、五香粉与蜂蜜腌制后在炭火上烤至焦香，用干米纸夹湿米皮，卷入烤肉、酸杨桃与生菜，蘸花生酱食用。' },
      ko: { name: '호아이 강변 숯불 꿀돼지고기 꼬치쌈', tag: '레몬그라스 오향 양념과 이중 라이스페이퍼 쌈', story: '레몬그라스와 꿀, 오향으로 양념한 돼지고기를 숯불에 구워내어 마른 라이스페이퍼와 촉촉한 쌀피에 야채와 함께 싸서 땅콩 소스에 찍어 먹습니다.' },
      ja: { name: 'ホアイ川沿いの炭火焼き豚串と生春巻き', tag: '蜂蜜五香粉マリネと二層ライスペーパー巻き', story: 'レモングラスと蜂蜜、五香粉に漬け込んだ豚肉を炭火で香ばしく焼き、乾燥ライスペーパーと生米皮の二層で香草と一緒に巻いて味わいます。' },
      es: { name: 'Brochetas de Cerdo a la Parrilla en Rollo', tag: 'Marinado en miel y cinco especias al carbón', story: 'Cerdo marinado en hierba limón y miel asado al carbón, envuelto en doble capa de papel de arroz con hierbas frescas.' },
      ar: { name: 'أسياخ اللحم المشوي على الفحم مع لفائف الأرز', tag: 'تتبيلة العسل وعشب الليمون على الفحم', story: 'أسياخ لحم متبلة بعشب الليمون والعسل والتوابل الخمسة مشوية على الفحم وتُلف بورق الأرز الطري.' }
    }
  },
  {
    id: '15', shopVi: 'Quán Bà Già', rating: '4.5', categoryKey: 'snack', hours: '08:00 - 17:30', isCalm: true,
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=800&auto=format&fit=crop', lat: 15.8750, lng: 108.3305,
    translations: {
      vi: { name: 'Bánh Đập Hến Trộn Cẩm Nam', tag: 'Bánh tráng đập giòn tan & Hến sông xào rau răm', story: 'Hai lớp bánh tráng nướng kẹp bánh ướt nóng ở giữa đập nhẹ cho dính vào nhau, dùng để xúc hến cồn Cẩm Nam xào sả ớt và đậu phộng rang.' },
      en: { name: 'Cracked Rice Paper & Stir-Fried Baby Clams', tag: 'Crispy-Wet Layered Rice Paper & River Clams', story: 'Two toasted rice crackers sandwiching a warm steamed rice sheet—cracked by hand and used to scoop up savory stir-fried Cam Nam river baby clams.' },
      zh: { name: '锦南香炒河蚬配脆拍米饼', tag: '双层脆米饼夹软米皮配香茅炒河蚬', story: '两片炭烤脆米饼中间夹一层温热软米皮，用手轻拍使其贴合，用来舀食以香茅、辣椒、花生爆炒的锦南河鲜小蚬肉。' },
      ko: { name: '바삭한 반답 크래커와 깜남 재첩 볶음', tag: '겹겹이 깨먹는 라이스페이퍼와 매콤한 재첩 볶음', story: '구운 라이스크래커 사이에 촉촉한 쌀피를 끼워 손으로 톡 깨뜨린 뒤, 레몬그라스와 고추로 볶아낸 깜남 강 재첩을 듬뿍 얹어 먹습니다.' },
      ja: { name: 'バインダップ（割れせんべい）とシジミ炒め', tag: 'パリもち二層せんべいとカムナム産シジミの香味炒め', story: '焼きせんべいの間に蒸し米シートを挟んで手で割って食べるユニークな料理。レモングラスと香草で炒めたカムナム島のシジミをのせていただきます。' },
      es: { name: 'Papel de Arroz Crujiente con Almejas Salteadas', tag: 'Galleta de arroz doble y almejas de río', story: 'Dos galletas de arroz tostadas con una lámina de arroz al vapor en el medio, partidas a mano para recoger almejas salteadas.' },
      ar: { name: 'رقائق الأرز المقرمشة مع المحار المقلي', tag: 'طبقتان من رقائق الأرز المحمصة مع محار النهر المتبل', story: 'رقائق أرز محمصة ومقرمشة تُستخدم لتناول محار نهر كام نام المقلي مع عشب الليمون والفول السوداني.' }
    }
  },
  {
    id: '16', shopVi: 'Gánh Chùa Cầu', rating: '4.4', categoryKey: 'snack', hours: '14:00 - 21:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800&auto=format&fit=crop', lat: 15.8769, lng: 108.3262,
    translations: {
      vi: { name: 'Bánh Bèo Chén & Bánh Xoài Phố Cổ', tag: 'Ăn bằng dao tre vót mỏng & Nhân tôm thịt đỏ', story: 'Bánh bèo đổ trong chén sành nhỏ có xoáy đồng tiền chứa nhân tôm thịt rim, thưởng thức bằng thanh dao tre vót mỏng truyền thống.' },
      en: { name: 'Earthenware Water Fern Cakes & Mango Cake', tag: 'Eaten with Bamboo Blade & Savory Shrimp Center', story: 'Steamed rice cakes in tiny clay cups topped with savory shrimp paste, traditionally cut and eaten using a thin hand-carved bamboo blade.' },
      zh: { name: '日本桥小碗浮萍粿与芒果糯米糕', tag: '传统竹刀挑食小碗米粿配虾肉臊子', story: '装在小陶碗中蒸熟的纯白米粿，中央凹陷处盛满红亮鲜虾猪肉臊子，遵循古法使用削薄的竹片刀划开享用。' },
      ko: { name: '접시꽃 쌀떡 (반베오) & 망고 찹쌀떡', tag: '대나무 칼로 떠먹는 전통 도자기 종지 떡', story: '작은 도자기 종지에 쪄낸 부드러운 쌀떡 위에 새우 돼지고기 토핑을 올리고, 젓가락 대신 얇게 깎은 대나무 칼로 잘라 먹는 전통 간식입니다.' },
      ja: { name: '小鉢バインベオとホイアン風マンゴー餅', tag: '竹ベラで味わう蒸し米粉餅と海老そぼろ', story: '小さな陶器の小鉢で蒸し上げた米粉生地の中央にエビと豚肉のそぼろをのせ、伝統的な竹ベラで切り分けながら味わう風情あるおやつです。' },
      es: { name: 'Pastelitos de Arroz en Cuenco y Pastel Mango', tag: 'Comido con cuchilla de bambú tradicional', story: 'Pastelitos de arroz al vapor en pequeños cuencos de barro con centro de camarones, cortados tradicionalmente con una fina hoja de bambú.' },
      ar: { name: 'كعك الأرز المطهو على البخار في أوعية فخارية', tag: 'يُؤكل بشفرة الخيزران التقليدية مع حشوة الروبيان', story: 'كعك أرز ناعم مطهو بالبخار في أوعية فخارية صغيرة مغطى بصلصة الروبيان المتبلة.' }
    }
  },
  {
    id: '24', shopVi: 'Lò Bánh Đậu Xanh Bà Trinh', rating: '4.7', categoryKey: 'snack', hours: '07:30 - 21:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop', lat: 15.8783, lng: 108.3259,
    translations: {
      vi: { name: 'Bánh Đậu Xanh Nhân Thịt Nướng Củi', tag: 'Vị ngọt đậu xanh quyện nhân mỡ thịt mặn mà', story: 'Đặc sản tiến vua độc đáo của Hội An: vỏ bánh làm từ đậu xanh nguyên hạt xay mịn đóng khuôn chữ nhật, bên trong ẩn giấu nhân thịt heo rim mỡ hành mặn ngọt, nướng trên than củi thơm lừng.' },
      en: { name: 'Charcoal-Baked Savory Mung Bean Cake', tag: 'Sweet Mung Bean Crust & Savory Pork Filling', story: 'A unique sweet-and-savory royal delicacy of Hoi An: finely ground mung bean paste molded around a seasoned pork belly center, baked over charcoal until fragrant.' },
      zh: { name: '会安炭烤咸肉馅绿豆糕', tag: '清甜绿豆外皮包裹咸香猪油葱肉馅', story: '会安独有的咸甜交融宫廷名点：外层为细腻绵密的纯绿豆糕，内馅藏着以葱油与黑胡椒腌制的咸香猪肉，经炭火慢烘至外酥内润。' },
      ko: { name: '호이안 숯불 구이 고기소 녹두전병', tag: '달콤한 녹두 앙금과 짭조름한 돼지고기 소의 조화', story: '달콤하고 고소한 녹두 가루 반죽 속에 후추와 파기름으로 양념한 짭조름한 돼지고기 소를 넣고 숯불에 구워낸 호이안만의 단짠 황실 다과입니다.' },
      ja: { name: 'ホイアン伝統・豚肉入り炭火焼き緑豆落雁', tag: '甘い緑豆生地と塩気のある豚肉餡の絶妙な調和', story: 'きめ細かな緑豆の甘い生地の中に、黒胡椒とネギ油で味付けした豚肉餡を包み、炭火で香ばしく焼き上げた甘じょっぱい伝統銘菓です。' },
      es: { name: 'Pastel de Frijol Mungo al Carbón con Cerdo', tag: 'Masa dulce de frijol mungo y relleno salado', story: 'Exclusiva delicia dulce y salada de Hoi An: pasta fina de frijol mungo moldeada alrededor de un centro de cerdo sazonado y horneada al carbón.' },
      ar: { name: 'كعكة الفاصوليا الخضراء المحمصة على الفحم', tag: 'مزيج فريد بين عجينة الفاصوليا الحلوة والحشوة المالحة', story: 'حلوى تراثية فريدة في هوي آن تجمع بين قشرة الفاصوليا الخضراء الحلوة الناعمة وحشوة اللحم المتبل المخبوزة على الفحم.' }
    }
  },

  // ================= 5. THỨC UỐNG (5 MÓN: ID 17, 18, 19, 20, 25) =================
  {
    id: '17', shopVi: 'Nước Mót Hội An', rating: '4.9', categoryKey: 'drink', hours: '08:00 - 21:30', isCalm: false,
    image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=800&auto=format&fit=crop', lat: 15.87818, lng: 108.32648,
    translations: {
      vi: { name: 'Trà Thảo Mộc Sả Chanh Cánh Sen', tag: 'Công thức 9 vị thảo mộc cổ phương & Hoa sen', story: 'Thức uống thanh nhiệt nấu từ la hán quả, kim ngân hoa, cam thảo, hoa cúc, sả tươi và chanh, điểm xuyết cánh sen hồng thanh tao.' },
      en: { name: 'Mot Lotus Petal Herbal Lemongrass Tea', tag: '9-Herb Ancient Infusion & Fresh Lotus Petal', story: 'Iconic refreshing herbal elixir brewed from monk fruit, honeysuckle, licorice root, chrysanthemum, lemongrass, and lime, adorned with a pink lotus petal.' },
      zh: { name: '会安荷花瓣九味草本柠檬香茅茶', tag: '古法九味草本凉茶配鲜粉荷花瓣', story: '由罗汉果、金银花、甘草、菊花、新鲜香茅、青柠与蜂蜜慢熬而成的解暑草本茶，杯口点缀一片清雅的粉红荷花瓣。' },
      ko: { name: '연꽃잎 레몬그라스 한방 허브티 (느억못)', tag: '9가지 전통 약초 블렌딩과 핑크 연꽃잎 장식', story: '나한과, 인동초, 감초, 국화, 신선한 레몬그라스와 라임을 우려낸 상쾌한 한방 허브차로, 분홍빛 연꽃잎 한 장을 띄워내는 호이안의 명물입니다.' },
      ja: { name: '蓮の花びら添え・9種ハーブのレモングラス茶', tag: '古方9種ブレンドの涼茶とピンクの蓮の花びら', story: '羅漢果、スイカズラ、甘草、菊花、生レモングラス、ライムを煎じた爽やかなハーブティー。可憐な蓮の花びらが添えられたホイアン名物の一杯です。' },
      es: { name: 'Té Herbal de Hierba Limón y Pétalo de Loto', tag: 'Infusión ancestral de 9 hierbas y flor de loto', story: 'Elixir refrescante elaborado con nueve botánicos como fruto del monje, regaliz, crisantemo, hierba limón y lima, decorado con un pétalo de loto.' },
      ar: { name: 'شاي الأعشاب بعشب الليمون وبتلات اللوتس', tag: 'مزيج تقليدي من 9 أعشاب طبيعية مع زهرة اللوتس', story: 'مشروب عشبي منعش يُحضر من تسعة أعشاب طبيعية مع عشب الليمون الطازج والليمون الأخضر ويُزين ببتلة زهرة اللوتس الوردية.' }
    }
  },
  {
    id: '18', shopVi: 'Faifo Roastery', rating: '4.7', categoryKey: 'drink', hours: '07:00 - 21:30', isCalm: true,
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop', lat: 15.8762, lng: 108.3255,
    translations: {
      vi: { name: 'Cà Phê Phin Rang Mộc Kem Muối Biển', tag: 'Hạt cà phê rang mộc & Kem muối Cửa Đại', story: 'Cà phê rang mộc pha bằng phin nhôm truyền thống nhỏ từng giọt sánh đặc, hòa quyện cùng lớp kem muối biển béo mặn dịu dàng.' },
      en: { name: 'Artisan Phin-Drip Sea Salt Coffee', tag: 'Small-Batch Roasted Beans & Cua Dai Salt Cream', story: 'Small-batch roasted highland coffee slow-dripped through a traditional filter and topped with a velvety layer of Cua Dai sea-salt cream.' },
      zh: { name: '古镇滴漏海盐奶盖手烘咖啡', tag: '传统铝制滴漏壶萃取配楚带海盐奶盖', story: '精选高原咖啡豆小批量原味烘焙，通过传统越式滴漏壶慢速萃取出醇厚咖啡液，覆上一层绵密咸香的海盐奶盖。' },
      ko: { name: '전통 핀 드립 씨솔트 크림 커피', tag: '직화 로스팅 원두와 부드러운 바다소금 크림', story: '소량씩 직접 로스팅한 원두를 베트남 전통 핀 드리퍼로 진하게 내린 뒤, 달콤하고 짭조름한 바다소금 크림을 듬뿍 올린 스페셜티 커피입니다.' },
      ja: { name: '自家焙煎ベトナム雫出し・海塩クリームコーヒー', tag: '伝統フィン抽出とクアダイ海塩の濃厚クリーム', story: '少量ずつ自家焙煎した高原コーヒー豆を伝統のアルミフィルターでじっくり抽出し、ほんのり塩っぱい海塩ホイップクリームを重ねた至福の一杯です。' },
      es: { name: 'Café de Filtro Tradicional con Crema de Sal Marina', tag: 'Tostado artesanal y espuma de sal marina', story: 'Café de altura tostado artesanalmente, filtrado gota a gota y coronado con una suave capa de crema de sal marina.' },
      ar: { name: 'قهوة الفلتر التقليدية بكريمة ملح البحر', tag: 'حبوب قهوة محمصة يدوياً مع رغوة ملح البحر الغنية', story: 'قهوة محمصة بعناية تُقطر ببطء عبر الفلتر التقليدي وتُغطى بطبقة ناعمة من كريمة ملح البحر.' }
    }
  },
  {
    id: '19', shopVi: 'Dừa Cẩm Thanh', rating: '4.6', categoryKey: 'drink', hours: '08:00 - 21:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop', lat: 15.8758, lng: 108.3295,
    translations: {
      vi: { name: 'Nước Dừa Tắc Rừng Dừa Bảy Mẫu', tag: 'Dừa xiêm tươi Cẩm Thanh & Mứt quất hồng bì', story: 'Nước dừa xiêm ngọt mát hái từ rừng dừa Cẩm Thanh pha cùng nước cốt tắc chín vàng và mứt quất ngâm đường phèn thanh giọng.' },
      en: { name: 'Bay Mau Forest Kumquat Coconut Juice', tag: 'Fresh Cam Thanh Coconut & Candied Kumquat', story: 'Sweet young coconut water harvested from Cam Thanh palm forest blended with freshly squeezed kumquat juice and candied citrus peel.' },
      zh: { name: '七亩椰林金桔冰糖鲜椰汁', tag: '锦清生态水椰林鲜椰水配蜜饯金桔', story: '采摘自会安七亩水椰林的清甜嫩椰水，加入鲜榨金桔汁与冰糖蜜饯金桔皮，果香浓郁、生津止渴。' },
      ko: { name: '바이마우 코코넛 숲 금귤 코코넛 주스', tag: '깜탄 영 코코넛 워터와 달콤한 금귤 청', story: '깜탄 코코넛 숲에서 수확한 달콤한 코코넛 워터에 상큼한 생금귤 즙과 당절임 금귤을 더해 갈증을 단번에 날려주는 음료입니다.' },
      ja: { name: 'カムタン椰子の森・金柑ココナッツジュース', tag: '採れたてヤシの実ジュースと氷砂糖漬け金柑', story: 'カムタンの椰子の森で収穫された甘いヤシの実の果汁に、搾りたての金柑と氷砂糖で煮た金柑コンポートを合わせたトロピカルドリンクです。' },
      es: { name: 'Agua de Coco Fresco con Kumquat Dulce', tag: 'Coco joven del bosque Cam Thanh y cítricos', story: 'Agua de coco joven dulce mezclada con jugo de kumquat recién exprimido y cáscara de cítricos confitada.' },
      ar: { name: 'عصير جوز الهند الطازج مع البرتقال الذهبي', tag: 'ماء جوز هند طازج من غابة كام ثانه مع الكمكوات', story: 'مزيج منعش من ماء جوز الهند الحلو الطازج وعصير الكمكوات الحمضي المنعش مع قطع الفاكهة المحلاة.' }
    }
  },
  {
    id: '20', shopVi: 'Trà Sông Hoài', rating: '4.5', categoryKey: 'drink', hours: '09:00 - 22:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=800&auto=format&fit=crop', lat: 15.8774, lng: 108.3266,
    translations: {
      vi: { name: 'Trà Hoa Đậu Biếc Mật Ong Rừng', tag: 'Lên màu tím biếc tự nhiên & Nha đam giòn mát', story: 'Hoa đậu biếc phơi khô hãm nước sôi gặp cốt chanh tươi chuyển sang sắc tím huyền ảo, kết hợp mật ong rừng, hạt chia và nha đam giòn mát.' },
      en: { name: 'Butterfly Pea Flower & Wild Honey Tea', tag: 'Natural Lantern-Violet Tea & Crisp Aloe Vera', story: 'Sun-dried butterfly pea flowers transform from deep blue to lantern-violet with a squeeze of fresh lime, finished with wild honey and aloe vera.' },
      zh: { name: '怀河蝶豆花森林野蜂蜜柠檬茶', tag: '天然梦幻紫罗兰茶汤配脆芦荟与奇亚籽', story: '天然晒干的蝶豆花冲泡出深蓝茶汤，滴入鲜青柠汁瞬间化作古镇灯笼般的梦幻紫色，调入森林野蜂蜜、奇亚籽与爽脆芦荟。' },
      ko: { name: '버터플라이피 야생꿀 알로에 아이스티', tag: '천연 보랏빛 허브티와 아삭한 알로에 & 치아씨드', story: '푸른 빛깔의 버터플라이피 꽃차에 생라임즙을 더해 호이안 등불처럼 신비로운 보랏빛으로 변신시킨 뒤, 야생꿀과 알로에를 넣어 즐깁니다.' },
      ja: { name: 'バタフライピーと森の蜂蜜・アロエハーブティー', tag: 'ライムで紫に変わる幻想的なお茶とアロエ果肉', story: '青いバタフライピーのお茶に生ライムを絞ると、ホイアンのランタンのような美しい紫色に変化。森の蜂蜜とアロエ、チアシード入りで爽やかです。' },
      es: { name: 'Té de Flor de Guisante Mariposa y Miel Silvestre', tag: 'Infusión violeta natural con aloe vera y chía', story: 'Flores de guisante mariposa que cambian de azul a violeta con jugo de lima fresca, endulzadas con miel silvestre y aloe vera.' },
      ar: { name: 'شاي زهرة الفراشة البنفسجي بالعسل البري', tag: 'شاي طبيعي يتحول للون البنفسجي مع الصبار وبذور الشيا', story: 'شاي زهرة الفراشة الطبيعي يكتسب لوناً بنفسجياً ساحراً مع قطرات الليمون ويُحلى بالعسل البري ومكعبات الصبار المنعشة.' }
    }
  },
  {
    id: '25', shopVi: 'Trà Quán Cổ Faifo', rating: '4.8', categoryKey: 'drink', hours: '08:00 - 22:00', isCalm: true,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop', lat: 15.8778, lng: 108.3269,
    translations: {
      vi: { name: 'Trà Gừng Sả Quế Mật Ong Ấm Cổ', tag: 'Gừng sẻ nướng, Quế Trà My & Mật ong rừng', story: 'Thức uống ấm áp chuẩn vị phố cổ vào chiều mưa hay đêm gió sông Hoài: củ gừng sẻ nướng thơm đun cùng vỏ quế Trà My cay ngọt, sả tươi và mật ong rừng nguyên chất.' },
      en: { name: 'Warm Tra My Cinnamon & Roasted Ginger Tea', tag: 'Char-Roasted Ginger, Tra My Cinnamon & Wild Honey', story: 'Soothing heritage infusion for breezy evenings by Hoai River: fire-roasted local ginger simmered with prized Tra My cinnamon bark, lemongrass, and wild honey.' },
      zh: { name: '古镇茶嵋肉桂烤老姜暖心茶', tag: '炭烤老姜配广南茶嵋肉桂与野蜂蜜', story: '怀河夜风中最温暖的古法茶饮：选用炭火微烤的当地小黄姜，与享有盛名的广南茶嵋肉桂皮、香茅慢火同煮，调入纯正森林野蜂蜜。' },
      ko: { name: '짜미 계피 & 구운 생강 야생꿀 온차', tag: '불에 구운 토종 생강과 명품 짜미 시나몬 블렌드', story: '선선한 호아이 강변의 밤을 따뜻하게 녹여주는 전통 차입니다. 불에 구워 향을 낸 생강과 명품 짜미 계피, 레몬그라스를 우려내고 야생꿀을 더했습니다.' },
      ja: { name: 'チャーミー産シナモンと焼き生姜の蜂蜜ホットティー', tag: '炙り生姜と名産チャーミー桂皮の温活ハーブ茶', story: '直火で炙った香り高い地生姜と、クアンナム名産の最高級チャーミーシナモン、レモングラスをじっくり煮出し、森の蜂蜜を加えた心温まる一杯です。' },
      es: { name: 'Té Caliente de Canela Tra My y Jengibre Asado', tag: 'Jengibre asado al fuego, canela Tra My y miel', story: 'Infusión reconfortante para las noches junto al río Hoai: jengibre local asado al fuego hervido con corteza de canela Tra My y miel silvestre.' },
      ar: { name: 'شاي القرفة والزنجبيل المشوي الدافئ بالعسل', tag: 'زنجبيل مشوي مع قرفة ترا مي الفاخرة والعسل البري', story: 'مشروب دافئ مثالي لأمسيات نهر هواي: زنجبيل محلي مشوي يُغلى مع لحاء قرفة ترا مي الشهيرة وعشب الليمون والعسل البري.' }
    }
  }
];

// DỮ LIỆU ĐẶC QUYỀN: 3 GÁNH ĂN "BÍ MẬT HẺM SÂU" + MANH MỐI AGENT AI (SECRET ENVELOPE)
export interface HiddenAlleyGem {
  id: string;
  alleyLocation: string;
  lat: number;
  lng: number;
  distanceHint: string;
  image: string;
  translations: Record<SupportedLang, {
    name: string;
    artisanStory: string;
    aiRiddlePoem: string;
    secretPasscode: string;
  }>;
}

export const HIDDEN_ALLEY_GEMS: HiddenAlleyGem[] = [
  {
    id: 'gem1',
    alleyLocation: 'Hẻm 45/2 Trần Phú (Chỉ vừa 1 người đi)',
    lat: 15.8774, lng: 108.3274, distanceHint: '50m',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=800&auto=format&fit=crop',
    translations: {
      vi: {
        name: 'Gánh Bánh Đập Cụ Mười (42 Năm Trong Hẻm)',
        artisanStory: 'Không biển hiệu, chỉ có đôi quang gánh tre nằm sâu trong con hẻm rêu phong rộng chưa tới 1 mét. Cụ Mười tự tay nướng bánh tráng trên bếp than gáo dừa suốt hơn 40 năm qua.',
        aiRiddlePoem: '“Cách bạn 50 mét, trong một con hẻm chỉ vừa một người đi, có một cụ bà đã bán món bánh phát ra tiếng kêu rôm rốp vui tai suốt 40 năm. Hãy tìm đến đó!”',
        secretPasscode: 'Mật khẩu nhận phần ăn thêm: "Hương Khói Gáo Dừa"'
      },
      en: {
        name: 'Grandma Muoi’s 42-Year Alleyway Cracked Rice Paper',
        artisanStory: 'No signboard—just a bamboo shoulder pole tucked inside a mossy 1-meter-wide alley. For over 40 years, Grandma Muoi has grilled rice paper over coconut-shell charcoal.',
        aiRiddlePoem: '“50 meters away, down an alley barely wide enough for one person, an elderly artisan has spent 40 years making a dish that cracks with a joyful crunch. Seek her stall!”',
        secretPasscode: 'Secret Passcode for bonus topping: "Coconut Charcoal Smoke"'
      },
      zh: {
        name: '深巷梅阿婆四十二年竹担脆拍米饼',
        artisanStory: '没有招牌，只有一副竹担隐匿在不足一米宽的青苔深巷中。梅阿婆四十余年来坚持用椰壳炭火亲手烘烤每一张米饼。',
        aiRiddlePoem: '“距您五十米处，在一条仅容一人侧身通过的深巷里，有一位老阿婆四十年如一日售卖着发出清脆咔嚓声的传统米饼。请寻迹前往！”',
        secretPasscode: '隐藏加料暗号：“椰炭古香”'
      },
      ko: {
        name: '42년 전통 골목길 무어이 할머니의 반답',
        artisanStory: '간판도 없이 한 사람만 겨우 지나가는 이끼 낀 좁은 골목 안, 40년 넘게 코코넛 숯불에 직접 라이스페이퍼를 구워내시는 할머니의 비밀 노점입니다.',
        aiRiddlePoem: '“당신에게서 50미터 떨어진 곳, 한 사람만 겨우 지날 수 있는 좁은 골목 안에 40년 동안 바삭거리는 소리가 나는 떡을 팔아온 할머니가 계십니다. 그곳을 찾아가세요!”',
        secretPasscode: '히든 토핑 암호: "코코넛 숯불의 향기"'
      },
      ja: {
        name: '路地裏42年・ムオイおばあちゃんの割れせんべい',
        artisanStory: '看板はなく、人が一人やっと通れる苔むした路地裏の竹天秤のみ。ムオイおばあちゃんが40年以上ヤシ殻炭で一枚ずつ手焼きしています。',
        aiRiddlePoem: '「あなたから50メートル先、一人しか通れない細い路地裏に、40年間パリパリと小気味よい音を立てる餅を売り続けるおばあちゃんがいます。探し出しましょう！」',
        secretPasscode: '裏メニュー合言葉：「ヤシ炭の香り」'
      },
      es: {
        name: 'Puesto Callejero de 42 Años de la Abuela Muoi',
        artisanStory: 'Sin letrero, oculto en un callejón musgoso de un metro de ancho, la abuela Muoi lleva más de 40 años asando papel de arroz sobre carbón de coco.',
        aiRiddlePoem: '“A 50 metros de ti, en un callejón por donde solo cabe una persona, una anciana lleva 40 años vendiendo un pastel que cruje al romperse. ¡Encuéntrala!”',
        secretPasscode: 'Clave secreta: "Humo de Coco"'
      },
      ar: {
        name: 'كشك الجدة موي السري منذ 42 عاماً في الزقاق الضيق',
        artisanStory: 'بدون لافتة، في زقاق ضيق مغطى بالطحالب لا يتسع إلا لشخص واحد، تشوي الجدة موي رقائق الأرز على فحم جوز الهند منذ أكثر من أربعين عاماً.',
        aiRiddlePoem: '«على بُعد 50 متراً منك، في زقاق ضيق لا يتسع إلا لشخص واحد، تبيع سيدة مسنة منذ 40 عاماً فطيرة تصدر صوت قرمشة شهية. ابحث عنها!»',
        secretPasscode: 'كلمة السر للطبق الإضافي: "عطر فحم جوز الهند"'
      }
    }
  },
  {
    id: 'gem2',
    alleyLocation: 'Hẻm Giếng Cổ Bá Lễ (Sau bức tường vàng)',
    lat: 15.8780, lng: 108.3281, distanceHint: '35m',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    translations: {
      vi: {
        name: 'Nồi Chè Đậu Ván Đặc Quánh Sau Tường Rêu',
        artisanStory: 'Chỉ mở bán đúng 2 tiếng buổi chiều bên cạnh mạch nước ngầm giếng cổ. Hạt đậu ván to bùi được hấp chín rồi nấu với đường phèn và hoa bưởi thơm ngát.',
        aiRiddlePoem: '“Đi dọc bức tường vàng rêu phong 35 mét về hướng mạch nước ngàn năm, nơi hương hoa bưởi tỏa ra từ nồi chè hổ phách sánh đặc chỉ bán lúc chiều tà.”',
        secretPasscode: 'Mật khẩu nhận cốt dừa gừng: "Hoa Bưởi Giếng Xưa"'
      },
      en: {
        name: 'Mossy Wall Pomelo-Blossom Hyacinth Bean Sweet Soup',
        artisanStory: 'Open for only 2 hours each afternoon beside the ancient underground spring. Plump hyacinth beans are steamed and simmered in pomelo-scented rock sugar.',
        aiRiddlePoem: '“Walk 35 meters along the mossy yellow wall toward the thousand-year spring, where pomelo blossoms perfume a golden amber pot sold only at dusk.”',
        secretPasscode: 'Secret Passcode: "Ancient Well Pomelo Blossom"'
      },
      zh: {
        name: '黄墙古井旁柚花扁豆甜羹（每日仅售两小时）',
        artisanStory: '仅在午后于千年古井暗泉旁出摊两小时。颗粒饱满的白扁豆蒸熟后，加入冰糖与新鲜柚子花慢火熬制，清香扑鼻。',
        aiRiddlePoem: '“沿着青苔斑驳的黄墙向千年古泉前行三十五米，寻觅那缕只在黄昏时分飘散的柚子花香与琥珀色甜羹。”',
        secretPasscode: '隐藏暗号：“古井柚花香”'
      },
      ko: {
        name: '이끼 낀 노란 담장 뒤 자몽꽃 편두 체 (하루 2시간 한정)',
        artisanStory: '고대 우물 옆에서 오후에 딱 2시간만 열리는 비밀 노점입니다. 포슬포슬하게 쪄낸 편두콩에 은은한 자몽꽃 향과 암설탕을 더해 끓여냅니다.',
        aiRiddlePoem: '“이끼 낀 노란 담장을 따라 천년의 샘물 쪽으로 35미터 걸어가 보세요. 해 질 녘에만 열리는 호박빛 자몽꽃 향기 단팥죽이 기다립니다.”',
        secretPasscode: '히든 암호: "고대 우물의 자몽꽃"'
      },
      ja: {
        name: '苔むす黄色い壁裏・文旦花香るフジマメのチェー',
        artisanStory: '古井戸の湧き水近くで午後2時間だけ開く秘密の屋台。ふっくら蒸した白フジマメを氷砂糖と文旦（ザボン）の花の香りで炊き上げています。',
        aiRiddlePoem: '「苔むした黄色い壁に沿って千年の泉へ35メートル。夕暮れ時にだけ漂うザボンの花の香りと琥珀色の甘味を探してください。」',
        secretPasscode: '合言葉：「古井戸のザボン花」'
      },
      es: {
        name: 'Postre de Frijol Jacinto y Flor de Pomelo tras el Muro',
        artisanStory: 'Abierto solo 2 horas cada tarde junto al manantial antiguo, cocinado con azúcar de roca y flores de pomelo frescas.',
        aiRiddlePoem: '“Camina 35 metros junto al muro amarillo musgoso hacia el manantial milenario, donde el aroma a flor de pomelo revela una olla ámbar al atardecer.”',
        secretPasscode: 'Clave secreta: "Flor del Pozo Antiguo"'
      },
      ar: {
        name: 'حلوى الفاصوليا بزهر البوملي خلف الجدار الأصفر العتيق',
        artisanStory: 'يُفتح لمدة ساعتين فقط عصراً بجانب نبع البئر القديم، حيث تُطهى حبوب الفاصوليا مع سكر النبات وزهور البوملي العطرية.',
        aiRiddlePoem: '«سر 35 متراً بمحاذاة الجدار الأصفر نحو النبع الألفي، حيث تفوح رائحة زهر البوملي عند الغسق من قدر ذهبي سري.»',
        secretPasscode: 'كلمة السر: "زهر البئر القديم"'
      }
    }
  },
  {
    id: 'gem3',
    alleyLocation: 'Ngõ Nhỏ Ven Chùa Cầu (Dưới giàn hoa giấy cổ)',
    lat: 15.8770, lng: 108.3261, distanceHint: '40m',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop',
    translations: {
      vi: {
        name: 'Quầy Cao Lầu Khô Hấp Củi Tràm Ông Bảy',
        artisanStory: 'Ông Bảy vẫn giữ cách hấp sợi Cao Lầu trên xửng tre đun bằng củi tràm khô và rưới nước xíu gia truyền ủ trong hũ sành từ đời ông nội.',
        aiRiddlePoem: '“Dưới giàn hoa giấy trăm năm cách Chùa Cầu 40 bước chân, lắng nghe tiếng củi tràm nổ lách tách và mùi thơm ngũ vị hương bay ra từ chiếc hũ sành cổ.”',
        secretPasscode: 'Mật khẩu nhận tóp mỡ xíu: "Hũ Sành Ba Đời"'
      },
      en: {
        name: 'Uncle Bay’s Melaleuca-Wood Steamed Dry Cao Lau',
        artisanStory: 'Uncle Bay still steams Cao Lau noodles in bamboo baskets over dry melaleuca wood and drizzles char siu reduction aged in his grandfather’s clay jar.',
        aiRiddlePoem: '“40 steps from the Japanese Bridge beneath a century-old bougainvillea, listen for crackling melaleuca wood and five-spice aroma from an heirloom clay jar.”',
        secretPasscode: 'Secret Passcode: "Three-Generation Clay Jar"'
      },
      zh: {
        name: '七伯百年九重葛下相思木蒸干拌高楼面',
        artisanStory: '七伯至今坚持用相思木柴火竹笼蒸制高楼面，并淋上装在祖传陶罐中秘制三代的五香叉烧卤汁。',
        aiRiddlePoem: '“距离日本桥四十步的百年九重葛花架下，倾听相思木柴噼啪作响，追寻祖传陶罐中飘出的浓郁五香卤汁芬芳。”',
        secretPasscode: '隐藏暗号：“三代古陶罐”'
      },
      ko: {
        name: '백년 부겐빌레아 아래 바이 할아버지의 장작 찜 까오러우',
        artisanStory: '대나무 찜기에 카주풋 장작불로 면을 찌고, 할아버지 대부터 내려온 옹기 항아리에 숙성시킨 비법 오향 차슈 소스를 부어주시는 숨은 명소입니다.',
        aiRiddlePoem: '“내원교에서 마흔 걸음 떨어진 백 년 된 부겐빌레아 꽃나무 아래, 타닥거리는 장작불 소리와 오래된 항아리에서 퍼지는 오향의 향기를 따라가세요.”',
        secretPasscode: '히든 암호: "3대째 내려오는 항아리"'
      },
      ja: {
        name: 'ブーゲンビリアの下・バイおじいさんの薪蒸しカオラウ',
        artisanStory: '竹せいろとメラレウカ薪で麺を蒸し上げ、祖父の代から受け継ぐ陶器壺で熟成させた秘伝チャーシューだれをかける隠れ家屋台です。',
        aiRiddlePoem: '「来遠橋から40歩、樹齢百年のブーゲンビリアの下でパチパチと爆ぜる薪の音と、古壺から漂う五香粉の香りを辿ってください。」',
        secretPasscode: '合言葉：「三代続く古壺」'
      },
      es: {
        name: 'Cao Lau Seco al Vapor de Leña del Tío Bay',
        artisanStory: 'El tío Bay todavía cuece los fideos en cestas de bambú sobre leña y los rocía con salsa char siu envejecida en la tinaja de barro de su abuelo.',
        aiRiddlePoem: '“A 40 pasos del Puente Japonés bajo una buganvilla centenaria, escucha el crepitar de la leña y sigue el aroma de cinco especias de una tinaja antigua.”',
        secretPasscode: 'Clave secreta: "Tinaja de Tres Generaciones"'
      },
      ar: {
        name: 'نودلز كاو لاو المطهوة على حطب الخشب لدى العم باي',
        artisanStory: 'لا يزال العم باي يطهو نودلز كاو لاو بالبخار في سلال الخيزران على الحطب ويضيف صلصة متبلة محفوظة في جرة فخارية موروثة عن جده.',
        aiRiddlePoem: '«على بُعد 40 خطوة من الجسر الياباني تحت شجرة جهنمية عمرها قرن، استمع إلى فرقعة الحطب واتبع رائحة التوابل الخمسة المنبعثة من جرة فخارية عتيقة.»',
        secretPasscode: 'كلمة السر: "جرة الأجيال الثلاثة"'
      }
    }
  }
];

export function getDishInLang(dish: DishItem, langCode: string): LocalizedDishText {
  const code = (langCode || 'vi').split('-')[0].toLowerCase() as SupportedLang;
  return dish.translations[code] || dish.translations.vi;
}

export function getGemInLang(gem: HiddenAlleyGem, langCode: string) {
  const code = (langCode || 'vi').split('-')[0].toLowerCase() as SupportedLang;
  return gem.translations[code] || gem.translations.vi;
}

export function buildPureDishNarration(langCode: string, dish: DishItem): string {
  const code = (langCode || 'vi').split('-')[0].toLowerCase() as SupportedLang;
  const t = dish.translations[code] || dish.translations.vi;

  switch (code) {
    case 'vi':
      return `Theo Dấu Vị Hội xin giới thiệu: ${t.name}. Điểm tinh túy của món ăn là ${t.tag}. ${t.story} Đây là hương vị di sản không thể bỏ lỡ trên hành trình khám phá ẩm thực phố cổ Hội An.`;
    case 'en':
      return `Welcome to Hoi An Culinary Heritage Guide. Let us explore ${t.name}. Its signature hallmark is ${t.tag}. ${t.story} This is an unforgettable culinary treasure of Hoi An Ancient Town.`;
    case 'zh':
      return `欢迎收听“寻味会安”美食文化解说：${t.name}。这道传统名菜的核心特色是${t.tag}。${t.story} 品尝这道佳肴，您将深刻感受到会安古镇世代相传的匠心风味。`;
    case 'ko':
      return `호이안 미식 유산 가이드입니다. 지금 소개해 드릴 요리는 ${t.name} 입니다. 이 요리의 핵심 특징은 ${t.tag} 입니다. ${t.story} 호이안 올드타운의 깊은 역사와 장인의 정성이 담긴 맛을 꼭 경험해 보세요.`;
    case 'ja':
      return `ホイアン食文化ガイドへようこそ。ご紹介する料理は「${t.name}」です。最大の特徴は、${t.tag}です。${t.story} 古都ホイアンで代々受け継がれてきた伝統の味わいをどうぞご堪能ください。`;
    case 'es':
      return `Bienvenido a la Guía del Patrimonio Culinario de Hoi An. Hoy presentamos: ${t.name}. Su sello distintivo es: ${t.tag}. ${t.story} Una joya gastronómica imprescindible en tu visita al casco antiguo.`;
    case 'ar':
      return `مرحباً بكم في دليل التراث الغذائي في هوي آن. نقدم لكم اليوم طبق: ${t.name}. يتميز هذا الطبق بـ: ${t.tag}. ${t.story} تجربة مذاق أصيلة تعكس تاريخ وثقافة بلدة هوي آن القديمة.`;
    default:
      return t.story;
  }
}

// BỘ TỪ ĐIỂN GIAO DIỆN ĐẦY ĐỦ 100% CHO TOÀN BỘ MÀN HÌNH (KHÔNG CÒN BỊ NỬA TRÊN DỊCH NỬA DƯỚI TIẾNG VIỆT)
export interface FullUiTranslation {
  brandName: string;
  brandSub: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  popularDishes: string;
  dishesUnit: string;
  addRoute: string;
  addedRoute: string;
  // Dual GPS Mode
  gpsSelectorTitle: string;
  gpsModeVnTitle: string;
  gpsModeVnSub: string;
  gpsModeHoiAnTitle: string;
  gpsModeHoiAnSub: string;
  hoiAnPrivilegeBanner: string;
  vnModeBanner: string;
  filter20mBtn: string;
  showAllBtn: string;
  in20mListenBtn: string;
  normalListenBtn: string;
  checkInNowBtn: string;
  checkedInBtn: string;
  // Smart Itinerary & Chef Card
  assistantTitle: string;
  newBadge: string;
  assistantDesc: string;
  morningTab: string;
  noonTab: string;
  nightTab: string;
  walkRouteAllBtn: string;
  dietaryTitle: string;
  dietaryDesc: string;
  openChefCardBtn: string;
  // Secret Alley & Food Trail
  secretAlleyTitle: string;
  secretAlleySub: string;
  openSecretEnvelopeBtn: string;
  passportTitle: string;
  openRewardChest: string;
  // Profile & Notebook
  profileHeader: string;
  tabNotebook: string;
  tabAccount: string;
  tabRadar: string;
  tabSecurity: string;
  ambassadorCertTitle: string;
  voucherVaultTitle: string;
  stampBookTitle: string;
  // AI Studio Labels
  studioBadge: string;
  playingStatus: string;
  readyStatus: string;
  walkBtn: string;
  hideWalkBtn: string;
}

export const FULL_UI_TEXT: Record<SupportedLang, FullUiTranslation> = {
  vi: {
    brandName: "THEO DẤU VỊ HỘI",
    brandSub: "BẢN ĐỒ & THUYẾT MINH DI SẢN",
    title: "Theo Dấu Vị Hội,",
    subtitle: "Mỗi Món Ăn Một Câu Chuyện",
    searchPlaceholder: "Tìm trong 25 món ngon, nguyên liệu, quán...",
    popularDishes: "Tinh Hoa 25 Món Ngon Hội An",
    dishesUnit: "món",
    addRoute: "+ Lộ trình",
    addedRoute: "Đã thêm",
    gpsSelectorTitle: "CHỌN CHẾ ĐỘ ĐỊNH VỊ GPS CHECK-IN:",
    gpsModeVnTitle: "🇻🇳 GPS Toàn Quốc (Từ Xa)",
    gpsModeVnSub: "Check-in mọi nơi tại VN (+150 XP)",
    gpsModeHoiAnTitle: "🏮 GPS Tại Hội An (<=20m)",
    gpsModeHoiAnSub: "Đặc quyền X2 điểm (+300 XP) & Hẻm Sâu",
    hoiAnPrivilegeBanner: "🎁 ĐẶC QUYỀN GPS TẠI HỘI AN: Nhân đôi +300 XP/món • Tự phát AI • Mở khóa Bí Mật Hẻm Sâu & Voucher -30%",
    vnModeBanner: "🌍 CHẾ ĐỘ TOÀN QUỐC: Cho phép Check-in từ xa tại bất kỳ đâu trên lãnh thổ Việt Nam (+150 XP/món)",
    filter20mBtn: "Lọc <=20m",
    showAllBtn: "Hiện 25 món",
    in20mListenBtn: "Trong vùng 20m • Nghe AI thuyết minh",
    normalListenBtn: "Nghe AI thuyết minh món ăn",
    checkInNowBtn: "Check-in Ngay",
    checkedInBtn: "Đã Check-in",
    assistantTitle: "Trợ Lý Lịch Trình & Thẻ Khẩu Vị",
    newBadge: "THỰC TIỄN",
    assistantDesc: "Gợi ý thực đơn theo 3 khung giờ trong ngày & tạo Thẻ khẩu vị giao tiếp trực tiếp với chủ quán Hội An.",
    morningTab: "🌅 Buổi Sáng",
    noonTab: "☀️ Buổi Trưa",
    nightTab: "🏮 Phố Đêm",
    walkRouteAllBtn: "Dẫn Đường Đi Bộ Cả 3 Trạm Trong Lịch Trình",
    dietaryTitle: "Thẻ Khẩu Vị & Dị Ứng Giao Tiếp Chủ Quán",
    dietaryDesc: "Chọn lưu ý ăn uống để tạo Thẻ chữ lớn & phát Giọng đọc AI cho đầu bếp tại Hội An:",
    openChefCardBtn: "Mở Thẻ Đưa Chủ Quán Xem & Phát Giọng Đọc AI",
    secretAlleyTitle: "Agent AI: Hộp Thư Mật & Bí Mật Hẻm Sâu",
    secretAlleySub: "Giải mật thư thơ/văn từ Agent AI kèm Bản đồ GPS hỗ trợ dẫn đường trực tiếp bên trong Web.",
    openSecretEnvelopeBtn: "✉️ Mở Hộp Thư Mật Agent AI & Dẫn Đường Hẻm Sâu",
    passportTitle: "Hộ Chiếu Thử Thách Food-Trail",
    openRewardChest: "Mở Rương Thưởng ➔",
    profileHeader: "Hồ Sơ & Sổ Tay Di Sản",
    tabNotebook: "📖 Sổ Tay & Thưởng",
    tabAccount: "👤 Hồ Sơ",
    tabRadar: "📡 Cài Đặt GPS",
    tabSecurity: "🛡️ Bảo Mật",
    ambassadorCertTitle: "CHỨNG NHẬN ĐẠI SỨ ẨM THỰC HỘI AN",
    voucherVaultTitle: "KHO E-VOUCHER & ĐẶC QUYỀN ĐÃ LƯU",
    stampBookTitle: "SỔ TAY CON DẤU 25 MÓN DI SẢN",
    studioBadge: "🎧 THUYẾT MINH VĂN HÓA & NGUYÊN LIỆU MÓN ĂN",
    playingStatus: "Đang phát giọng đọc AI thuyết minh món ăn...",
    readyStatus: "Bấm Play để nghe AI thuyết minh về món ăn",
    walkBtn: "Bản đồ dẫn đường",
    hideWalkBtn: "Thu gọn bản đồ"
  },
  en: {
    brandName: "THEO DẤU VỊ HỘI",
    brandSub: "HERITAGE CULINARY & GPS GUIDE",
    title: "Tracing Hoi An Flavors,",
    subtitle: "Every Dish Tells a Heritage Story",
    searchPlaceholder: "Search 25 delicacies, ingredients, shops...",
    popularDishes: "25 Iconic Hoi An Delicacies",
    dishesUnit: "dishes",
    addRoute: "+ Route",
    addedRoute: "Added",
    gpsSelectorTitle: "SELECT GPS CHECK-IN MODE:",
    gpsModeVnTitle: "🇻🇳 Vietnam Remote GPS",
    gpsModeVnSub: "Check-in anywhere in VN (+150 XP)",
    gpsModeHoiAnTitle: "🏮 On-Site Hoi An (<=20m)",
    gpsModeHoiAnSub: "2X Points (+300 XP) & Secret Alleys",
    hoiAnPrivilegeBanner: "🎁 HOI AN ON-SITE PRIVILEGE: Double +300 XP/dish • Auto AI Voice • Unlock Secret Alleys & -30% VIP Voucher",
    vnModeBanner: "🌍 VIETNAM REMOTE MODE: Check-in from anywhere across Vietnam (+150 XP/dish)",
    filter20mBtn: "Filter <=20m",
    showAllBtn: "Show All 25",
    in20mListenBtn: "Within 20m • Listen to AI Guide",
    normalListenBtn: "Listen to AI Dish Narration",
    checkInNowBtn: "Check-in Now",
    checkedInBtn: "Checked In",
    assistantTitle: "Smart Day-Trip & Chef Dietary Card",
    newBadge: "PRACTICAL",
    assistantDesc: "Time-based culinary itineraries & instant Vietnamese audio flashcards to show local restaurant owners.",
    morningTab: "🌅 Morning",
    noonTab: "☀️ Midday",
    nightTab: "🏮 Lantern Night",
    walkRouteAllBtn: "Start Walking Navigation for All 3 Stops",
    dietaryTitle: "Chef Dietary & Allergy Communication Card",
    dietaryDesc: "Select your dietary needs to generate a large-text card & Vietnamese AI voice for the chef:",
    openChefCardBtn: "Show Card to Restaurant Owner & Play AI Voice",
    secretAlleyTitle: "AI Agent: Secret Riddles & Hidden Alley Gems",
    secretAlleySub: "Unlock poetic clues from our AI Agent with built-in Web GPS walking assistance to hidden 40-year stalls.",
    openSecretEnvelopeBtn: "✉️ Open AI Secret Envelope & In-App GPS Assist",
    passportTitle: "Food-Trail Challenge Passport",
    openRewardChest: "Open Reward Chest ➔",
    profileHeader: "Profile & Heritage Notebook",
    tabNotebook: "📖 Notebook & Vault",
    tabAccount: "👤 Profile",
    tabRadar: "📡 GPS Settings",
    tabSecurity: "🛡️ Security",
    ambassadorCertTitle: "HOI AN CULINARY AMBASSADOR CERTIFICATE",
    voucherVaultTitle: "SAVED E-VOUCHERS & ON-SITE PRIVILEGES",
    stampBookTitle: "25 HERITAGE DISHES STAMP COLLECTION",
    studioBadge: "🎧 CULINARY HERITAGE & INGREDIENT NARRATION",
    playingStatus: "Playing AI culinary voice narration...",
    readyStatus: "Tap Play to listen to AI dish narration",
    walkBtn: "In-App Walk Map",
    hideWalkBtn: "Reset Map"
  },
  zh: {
    brandName: "寻味会安",
    brandSub: "美食遗产地图与 AI 语音导览",
    title: "寻味会安古镇，",
    subtitle: "每一道名菜都是一段历史",
    searchPlaceholder: "搜索 25 道会安名菜、食材、老字号...",
    popularDishes: "会安二十五道传统名菜",
    dishesUnit: "道名菜",
    addRoute: "+ 路线",
    addedRoute: "已添加",
    gpsSelectorTitle: "选择 GPS 打卡定位模式：",
    gpsModeVnTitle: "🇻🇳 越南全境远程打卡",
    gpsModeVnSub: "在越南任意地点即可打卡 (+150 XP)",
    gpsModeHoiAnTitle: "🏮 会安实地定位 (<=20m)",
    gpsModeHoiAnSub: "双倍积分 (+300 XP) 暨解锁深巷秘店",
    hoiAnPrivilegeBanner: "🎁 会安实地专属特权：双倍 +300 XP/道 • 自动播报 AI 讲解 • 解锁四十年深巷秘店与 7折 VIP 礼券",
    vnModeBanner: "🌍 越南全境远程模式：支持在越南境内任意位置自由打卡 (+150 XP/道)",
    filter20mBtn: "筛选 <=20m",
    showAllBtn: "显示全部25道",
    in20mListenBtn: "处于20米内 • 收听 AI 美食解说",
    normalListenBtn: "点击收听 AI 美食文化解说",
    checkInNowBtn: "立即打卡",
    checkedInBtn: "已打卡",
    assistantTitle: "智能一日食程与店主忌口沟通卡",
    newBadge: "实用功能",
    assistantDesc: "按早、中、晚三时段推荐最佳步行美食路线，并生成带越南语发音的大字忌口卡直接展示给店家。",
    morningTab: "🌅 古镇清晨",
    noonTab: "☀️ 午间纳凉",
    nightTab: "🏮 灯笼夜市",
    walkRouteAllBtn: "开启本时段三家名店连线步行导航",
    dietaryTitle: "展示给店主的饮食忌口与过敏沟通卡",
    dietaryDesc: "勾选您的饮食需求，生成越南语大字提示卡并由 AI 朗读给会安厨师听：",
    openChefCardBtn: "打开店主沟通大字卡并播放越南语 AI 语音",
    secretAlleyTitle: "AI 密探：锦囊谜题与深巷四十年秘店",
    secretAlleySub: "拆开 AI 密探诗句锦囊，内置网页端 GPS 辅助导航直达仅容一人通过的深巷老摊。",
    openSecretEnvelopeBtn: "✉️ 拆开 AI 秘信锦囊并开启内置 GPS 寻路",
    passportTitle: "美食寻宝护照 (Food-Trail)",
    openRewardChest: "开启奖励宝箱 ➔",
    profileHeader: "个人主页与美食手账",
    tabNotebook: "📖 奖励手账",
    tabAccount: "👤 个人资料",
    tabRadar: "📡 GPS 设置",
    tabSecurity: "🛡️ 账号安全",
    ambassadorCertTitle: "会安美食文化大使荣誉证书",
    voucherVaultTitle: "已保存的电子优惠券与实地特权",
    stampBookTitle: "二十五道会安遗产美食印章册",
    studioBadge: "🎧 会安美食文化与传统食材语音解说",
    playingStatus: "正在播放 AI 美食文化语音解说...",
    readyStatus: "点击播放收听这道美食的 AI 文化讲解",
    walkBtn: "页内步行导航",
    hideWalkBtn: "收起路线"
  },
  ko: {
    brandName: "호이안 미식 추적",
    brandSub: "다국어 오디오 & GPS 유산 가이드",
    title: "호이안의 맛을 따라서,",
    subtitle: "모든 요리에 담긴 유산 이야기",
    searchPlaceholder: "25가지 전통 별미, 식재료, 맛집 검색...",
    popularDishes: "호이안 25대 전통 미식 지도",
    dishesUnit: "개 요리",
    addRoute: "+ 경로",
    addedRoute: "추가됨",
    gpsSelectorTitle: "GPS 체크인 모드 선택:",
    gpsModeVnTitle: "🇻🇳 베트남 전역 원격 GPS",
    gpsModeVnSub: "베트남 어디서나 체크인 (+150 XP)",
    gpsModeHoiAnTitle: "🏮 호이안 현장 GPS (<=20m)",
    gpsModeHoiAnSub: "더블 포인트 (+300 XP) & 골목 비경 해제",
    hoiAnPrivilegeBanner: "🎁 호이안 현장 체크인 특권: 더블 점수 (+300 XP) • AI 자동 해설 • 40년 골목 비경 및 30% VIP 바우처 해제",
    vnModeBanner: "🌍 베트남 전역 원격 모드: 베트남 내 어디서나 자유롭게 체크인 가능 (+150 XP)",
    filter20mBtn: "<=20m 필터",
    showAllBtn: "25개 전체보기",
    in20mListenBtn: "20m 반경 내 • AI 해설 듣기",
    normalListenBtn: "AI 요리 문화 해설 듣기",
    checkInNowBtn: "즉시 체크인",
    checkedInBtn: "체크인 완료",
    assistantTitle: "시간대별 미식 일정 & 주방장 소통 카드",
    newBadge: "실용 기능",
    assistantDesc: "아침·점심·밤 시간대별 추천 도보 코스와 현지 식당 주인에게 보여줄 베트남어 음성 알레르기 카드입니다.",
    morningTab: "🌅 아침 코스",
    noonTab: "☀️ 점심 코스",
    nightTab: "🏮 등불 야시장",
    walkRouteAllBtn: "이 시간대 3곳 매장 도보 길찾기 시작",
    dietaryTitle: "식당 주인에게 보여주는 식단 & 알레르기 카드",
    dietaryDesc: "기피 식재료를 선택하면 큰 글씨 카드와 베트남어 AI 음성을 출력합니다:",
    openChefCardBtn: "사장님 제시용 카드 열기 & 베트남어 AI 음성 재생",
    secretAlleyTitle: "AI 에이전트: 비밀 편지 수수께끼 & 골목 비경",
    secretAlleySub: "AI가 제공하는 시적 단서를 풀고 앱 내장 웹 GPS 길찾기로 40년 전통의 좁은 골목 노점을 찾아가세요.",
    openSecretEnvelopeBtn: "✉️ AI 비밀 편지 열기 & 앱 내장 GPS 길찾기",
    passportTitle: "푸드트레일 챌린지 패스포트",
    openRewardChest: "보상 상자 열기 ➔",
    profileHeader: "프로필 & 미식 수첩",
    tabNotebook: "📖 수첩 & 보상함",
    tabAccount: "👤 내 정보",
    tabRadar: "📡 GPS 설정",
    tabSecurity: "🛡️ 보안 및 문의",
    ambassadorCertTitle: "호이안 미식 홍보대사 공식 인증서",
    voucherVaultTitle: "보관된 E-바우처 및 현장 특권",
    stampBookTitle: "25대 호이안 유산 요리 스탬프 북",
    studioBadge: "🎧 호이안 미식 유산 & 식재료 AI 음성 해설",
    playingStatus: "AI 요리 문화 음성 해설을 재생 중입니다...",
    readyStatus: "재생 버튼을 눌러 AI 요리 해설을 들어보세요",
    walkBtn: "앱 내 도보 경로",
    hideWalkBtn: "경로 닫기"
  },
  ja: {
    brandName: "ホイアン味めぐり",
    brandSub: "食文化音声ガイド＆GPSマップ",
    title: "ホイアンの味を辿る、",
    subtitle: "一皿ごとに息づく歴史と物語",
    searchPlaceholder: "25種の名物料理、食材、名店を検索...",
    popularDishes: "ホイアン伝統の25選マップ",
    dishesUnit: "品",
    addRoute: "+ ルート",
    addedRoute: "追加済",
    gpsSelectorTitle: "GPSチェックインモードを選択：",
    gpsModeVnTitle: "🇻🇳 ベトナム全域リモートGPS",
    gpsModeVnSub: "ベトナム国内どこでもチェックイン (+150 XP)",
    gpsModeHoiAnTitle: "🏮 ホイアン現地GPS (<=20m)",
    gpsModeHoiAnSub: "2倍ポイント (+300 XP) ＆ 路地裏秘店解放",
    hoiAnPrivilegeBanner: "🎁 ホイアン現地特典：ポイント2倍 (+300 XP) • AI自動音声 • 路地裏40年の秘店＆30%割引VIPクーポン解放",
    vnModeBanner: "🌍 ベトナム全域モード：国内どこからでもリモートチェックイン可能 (+150 XP)",
    filter20mBtn: "<=20m 絞り込み",
    showAllBtn: "全25品を表示",
    in20mListenBtn: "20m圏内 • AI解説を聞く",
    normalListenBtn: "AI料理文化ナレーションを聞く",
    checkInNowBtn: "チェックイン",
    checkedInBtn: "完了",
    assistantTitle: "時間帯別グルメ旅程＆店主伝達カード",
    newBadge: "実用機能",
    assistantDesc: "朝・昼・夜の時間帯別おすすめ徒歩コースと、現地の店主にベトナム語音声で伝えるアレルギー・好みカード。",
    morningTab: "🌅 朝の旧市街",
    noonTab: "☀️ 昼の涼味",
    nightTab: "🏮 ランタン夜街",
    walkRouteAllBtn: "この時間帯の3店舗を巡る徒歩ナビを開始",
    dietaryTitle: "店主にそのまま見せる食事制限・アレルギーカード",
    dietaryDesc: "苦手な食材を選ぶと、大きな文字とベトナム語AI音声で料理人に伝えます：",
    openChefCardBtn: "店主提示カードを開く＆ベトナム語AI音声を再生",
    secretAlleyTitle: "AIエージェント：秘密の手紙＆路地裏の秘店",
    secretAlleySub: "AIの詩的な謎解きとアプリ内埋め込みWeb GPSナビで、一人しか通れない路地裏の老舗屋台へ。",
    openSecretEnvelopeBtn: "✉️ AI秘密の手紙を開く＆アプリ内GPSナビ支援",
    passportTitle: "フードトレイル・パスポート",
    openRewardChest: "報酬宝箱を開く ➔",
    profileHeader: "プロフィール＆美食手帳",
    tabNotebook: "📖 手帳＆報酬",
    tabAccount: "👤 会員情報",
    tabRadar: "📡 GPS設定",
    tabSecurity: "🛡️ 保安・相談",
    ambassadorCertTitle: "ホイアン食文化親善大使 認定証",
    voucherVaultTitle: "保存済みEバウチャー＆現地特典",
    stampBookTitle: "ホイアン伝統25品スタンプ帳",
    studioBadge: "🎧 ホイアン食文化＆伝統食材 AI音声ガイド",
    playingStatus: "AI食文化ナレーションを再生しています...",
    readyStatus: "再生ボタンを押して料理のAI解説を聞く",
    walkBtn: "画面内徒歩ナビ",
    hideWalkBtn: "地図を戻す"
  },
  es: {
    brandName: "HUELLAS DE HỘI AN",
    brandSub: "MAPA Y AUDIO GUÍA DE PATRIMONIO",
    title: "Tras los Sabores de Hội An,",
    subtitle: "Cada Plato Cuenta una Historia",
    searchPlaceholder: "Buscar 25 platos, ingredientes, locales...",
    popularDishes: "25 Joyas Culinarias de Hoi An",
    dishesUnit: "platos",
    addRoute: "+ Ruta",
    addedRoute: "En ruta",
    gpsSelectorTitle: "MODO DE CHECK-IN GPS:",
    gpsModeVnTitle: "🇻🇳 GPS Remoto Vietnam",
    gpsModeVnSub: "Check-in en todo Vietnam (+150 XP)",
    gpsModeHoiAnTitle: "🏮 GPS en Hoi An (<=20m)",
    gpsModeHoiAnSub: "Doble XP (+300 XP) y Callejones Secretos",
    hoiAnPrivilegeBanner: "🎁 PRIVILEGIO EN HOI AN: Doble +300 XP • Audio IA automático • Desbloquea Callejones Secretos y Cupón VIP -30%",
    vnModeBanner: "🌍 MODO REMOTO VIETNAM: Check-in permitido desde cualquier lugar de Vietnam (+150 XP)",
    filter20mBtn: "Filtrar <=20m",
    showAllBtn: "Ver los 25",
    in20mListenBtn: "En radio 20m • Escuchar IA",
    normalListenBtn: "Escuchar historia del plato con IA",
    checkInNowBtn: "Check-in Ahora",
    checkedInBtn: "Completado",
    assistantTitle: "Ruta por Horario y Tarjeta para el Chef",
    newBadge: "PRÁCTICO",
    assistantDesc: "Rutas gastronómicas para mañana, tarde y noche, más tarjeta de alergias con voz IA en vietnamita.",
    morningTab: "🌅 Mañana",
    noonTab: "☀️ Mediodía",
    nightTab: "🏮 Noche",
    walkRouteAllBtn: "Iniciar Ruta a Pie por las 3 Paradas",
    dietaryTitle: "Tarjeta de Preferencias y Alergias para el Chef",
    dietaryDesc: "Selecciona tus restricciones para mostrar una tarjeta grande y reproducir voz IA al cocinero:",
    openChefCardBtn: "Mostrar Tarjeta al Dueño y Reproducir Voz IA",
    secretAlleyTitle: "Agente IA: Carta Secreta y Callejones Ocultos",
    secretAlleySub: "Resuelve acertijos poéticos de la IA con mapa GPS integrado en la web para hallar puestos ocultos.",
    openSecretEnvelopeBtn: "✉️ Abrir Carta Secreta IA y Mapa GPS Integrado",
    passportTitle: "Pasaporte de Retos Food-Trail",
    openRewardChest: "Abrir Cofre ➔",
    profileHeader: "Perfil y Libreta Culinaria",
    tabNotebook: "📖 Libreta y Premios",
    tabAccount: "👤 Perfil",
    tabRadar: "📡 Ajustes GPS",
    tabSecurity: "🛡️ Seguridad",
    ambassadorCertTitle: "CERTIFICADO DE EMBAJADOR CULINARIO DE HOI AN",
    voucherVaultTitle: "CUPONES GUARDADOS Y PRIVILEGIOS",
    stampBookTitle: "COLECCIÓN DE 25 SELLOS GASTRONÓMICOS",
    studioBadge: "🎧 NARRACIÓN IA DE PATRIMONIO E INGREDIENTES",
    playingStatus: "Reproduciendo narración gastronómica IA...",
    readyStatus: "Toca Play para escuchar la historia del plato",
    walkBtn: "Ruta en pantalla",
    hideWalkBtn: "Ocultar ruta"
  },
  ar: {
    brandName: "على خطى نكهات هوي آن",
    brandSub: "دليل الصوت والخرائط للتراث الغذائي",
    title: "على خطى نكهات هوي آن،",
    subtitle: "لكل طبق حكاية تاريخية",
    searchPlaceholder: "ابحث في 25 طبقاً تراثياً والمكونات...",
    popularDishes: "أشهر 25 طبقاً تراثياً في هوي آن",
    dishesUnit: "طبقاً",
    addRoute: "+ مسار",
    addedRoute: "مضاف",
    gpsSelectorTitle: "اختر وضع تسجيل الوصول عبر GPS:",
    gpsModeVnTitle: "🇻🇳 وضع فيتنام عن بُعد",
    gpsModeVnSub: "تسجيل من أي مكان في فيتنام (+150 XP)",
    gpsModeHoiAnTitle: "🏮 موقع هوي آن (<=20م)",
    gpsModeHoiAnSub: "نقاط مضاعفة (+300 XP) وأزقة سرية",
    hoiAnPrivilegeBanner: "🎁 امتيازات هوي آن الميدانية: ضعف النقاط +300 XP • شرح صوتي تلقائي • فتح الأزقة السرية وقسيمة خصم 30%",
    vnModeBanner: "🌍 الوضع الشامل في فيتنام: يمكنك تسجيل الوصول من أي مكان داخل فيتنام (+150 XP)",
    filter20mBtn: "تصفية <=20م",
    showAllBtn: "عرض 25 طبقاً",
    in20mListenBtn: "ضمن 20م • استمع للشرح الذكي",
    normalListenBtn: "استمع لقصة الطبق بالذكاء الاصطناعي",
    checkInNowBtn: "تسجيل الوصول",
    checkedInBtn: "تم التسجيل",
    assistantTitle: "مساعد الجدول اليومي وبطاقة الشيف",
    newBadge: "عملي",
    assistantDesc: "مسارات طعام للصباح والظهيرة والمساء، مع بطاقة تنبيه الحساسية بصوت ذكي باللغة الفيتنامية.",
    morningTab: "🌅 الصباح",
    noonTab: "☀️ الظهيرة",
    nightTab: "🏮 ليل الفوانيس",
    walkRouteAllBtn: "بدء مسار المشي للمحطات الثلاث",
    dietaryTitle: "بطاقة التواصل الغذائي والحساسية لصاحب المطعم",
    dietaryDesc: "حدد متطلباتك الغذائية لعرض بطاقة واضحة وتشغيل نطق صوتي بالفيتنامية للطاهي:",
    openChefCardBtn: "عرض البطاقة لصاحب المطعم وتشغيل الصوت الذكي",
    secretAlleyTitle: "وكيل الذكاء الاصطناعي: الرسائل السرية والأزقة الخفية",
    secretAlleySub: "افتح ألغاز الذكاء الاصطناعي مع خريطة GPS مدمجة داخل الصفحة للوصول إلى أكشاك عمرها 40 عاماً.",
    openSecretEnvelopeBtn: "✉️ فتح الرسالة السرية ومساعد الخريطة المدمج",
    passportTitle: "جواز تحدي مسار الطعام",
    openRewardChest: "فتح صندوق الجوائز ➔",
    profileHeader: "الملف الشخصي ودفتر التراث",
    tabNotebook: "📖 الدفتر والجوائز",
    tabAccount: "👤 الملف",
    tabRadar: "📡 إعدادات GPS",
    tabSecurity: "🛡️ الأمان",
    ambassadorCertTitle: "شهادة سفير التراث الغذائي في هوي آن",
    voucherVaultTitle: "القسائم الإلكترونية والامتيازات المحفوظة",
    stampBookTitle: "دفتر أختام 25 طبقاً تراثياً",
    studioBadge: "🎧 الشرح الصوتي الذكي لتاريخ ومكونات الطبق",
    playingStatus: "جاري تشغيل الشرح الصوتي الذكي للطبق...",
    readyStatus: "اضغط للتشغيل والاستماع إلى قصة هذا الطبق",
    walkBtn: "خريطة المشي المدمجة",
    hideWalkBtn: "إخفاء المسار"
  }
};

export function getFullUiText(langCode: string): FullUiTranslation {
  const code = (langCode || 'vi').split('-')[0].toLowerCase() as SupportedLang;
  return FULL_UI_TEXT[code] || FULL_UI_TEXT.vi;
}

const resources = {
  vi: { translation: { categories: { all: "⭐ Tất cả", specialty: "📍 Đặc sản", noodle: "🍲 Món nước", vegan: "🥗 Món chay", snack: "🍢 Ăn vặt", drink: "🥤 Thức uống" } } },
  en: { translation: { categories: { all: "⭐ All", specialty: "📍 Specialties", noodle: "🍲 Noodles", vegan: "🥗 Vegan", snack: "🍢 Snacks", drink: "🥤 Drinks" } } },
  zh: { translation: { categories: { all: "⭐ 全部", specialty: "📍 招牌特产", noodle: "🍲 汤面类", vegan: "🥗 素食甜品", snack: "🍢 街头小吃", drink: "🥤 特色饮品" } } },
  ko: { translation: { categories: { all: "⭐ 전체", specialty: "📍 대표 특산", noodle: "🍲 면 요리", vegan: "🥗 채식/디저트", snack: "🍢 길거리 간식", drink: "🥤 음료/카페" } } },
  ja: { translation: { categories: { all: "⭐ すべて", specialty: "📍 名物料理", noodle: "🍲 麺類", vegan: "🥗 菜食・甘味", snack: "🍢 屋台おやつ", drink: "🥤 ドリンク" } } },
  es: { translation: { categories: { all: "⭐ Todos", specialty: "📍 Especialidades", noodle: "🍲 Fideos", vegan: "🥗 Vegano", snack: "🍢 Snacks", drink: "🥤 Bebidas" } } },
  ar: { translation: { categories: { all: "⭐ الكل", specialty: "📍 الأطباق المميزة", noodle: "🍲 المعكرونة", vegan: "🥗 نباتي", snack: "🍢 وجبات خفيفة", drink: "🥤 المشروبات" } } }
};

let defaultLanguage = 'vi';
try {
  if (Platform.OS !== 'web' || typeof window !== 'undefined') {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0 && locales[0].languageCode) {
      const code = locales[0].languageCode;
      if (Object.keys(resources).includes(code)) {
        defaultLanguage = code;
      }
    }
  }
} catch (error) {
  defaultLanguage = 'vi';
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'vi',
    interpolation: { escapeValue: false },
  });
}

export default i18n;