export type LangKey = "vi" | "en" | "zh" | "ko" | "ja";

export const LANGS: Record<
  LangKey,
  { label: string; speechCode: string; flag: string }
> = {
  vi: { label: "Tiếng Việt", speechCode: "vi-VN", flag: "🇻🇳" },
  en: { label: "English", speechCode: "en-US", flag: "🇬🇧" },
  zh: { label: "中文", speechCode: "zh-CN", flag: "🇨🇳" },
  ko: { label: "한국어", speechCode: "ko-KR", flag: "🇰🇷" },
  ja: { label: "日本語", speechCode: "ja-JP", flag: "🇯🇵" },
};

export interface Dish {
  id: number;
  cat: "main" | "snack" | "street" | "sweet";
  emoji: string;
  price: string;
  rating: number;
  lat: number;
  lng: number;
  img: string;
  fallbackImg?: string;
  address?: string;
  name: Record<LangKey, string>;
  desc: Record<LangKey, string>;
  tag?: Record<LangKey, string>;
}

// Dữ liệu khởi tạo 6 món ăn đặc sản Hội An (sẽ được đồng bộ & cập nhật trực tiếp từ Backend API)
export const DISHES: Dish[] = [
  {
    id: 4,
    cat: "main",
    emoji: "🍜",
    price: "Đang cập nhật",
    rating: 4.8,
    lat: 15.87858,
    lng: 108.32986,
    address: "49/3 Trần Hưng Đạo, Phường Minh An, Hội An",
    img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800",
    name: {
      vi: "Quán Cao lầu Bá Lễ",
      en: "Traditional Hoi An Cao Lau Noodles",
      zh: "会安传统高楼面 (Cao Lầu)",
      ko: "호이안 전통 까오러우 (Cao Lầu)",
      ja: "ホイアン伝統カオラウ（伊勢うどん風麺）",
    },
    desc: {
      vi: "Cao lầu là món ăn đặc sản nổi tiếng của Hội An với sợi mì vàng dai đặc trưng, thịt xá xíu đậm đà, da heo giòn và rau sống Trà Quế.",
      en: "Chewy golden noodles made from rice soaked in Cham Island wood-ash water and Ba Le well water, tossed with five-spice char siu pork and crispy squares.",
      zh: "高楼面是会安的灵魂美食。面条必须用占婆岛相思木灰水与巴礼古井水揉制，口感筋道爽滑，配以五香叉烧肉、酥脆炸猪皮和茶桂香草。",
      ko: "참섬의 나무재 물과 발레 우물물로 반죽해 쫄깃한 식감을 자랑하는 황금빛 면 요리입니다. 오향 차슈 돼지고기와 바삭한 크래커를 곁들입니다.",
      ja: "チャム島の木灰汁とバーレー古井戸の水で練り上げた独特のコシを持つ太麺に、五香粉香るチャーシューと揚げせんべい、新鮮な香草を絡めて味わいます。",
    },
  },
  {
    id: 6,
    cat: "main",
    emoji: "🥖",
    price: "Đang cập nhật",
    rating: 4.8,
    lat: 15.87955,
    lng: 108.33262,
    address: "2B Phan Châu Trinh, Cẩm Châu, Hội An",
    img: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=800",
    name: {
      vi: "Bánh Mì Phượng",
      en: "Hoi An Crispy Baguette (Banh Mi)",
      zh: "会安炭烤法棍三明治",
      ko: "호이안 크리스피 반미",
      ja: "ホイアン炭火焼きバインミー",
    },
    desc: {
      vi: "Bánh mì Phượng nổi tiếng toàn cầu với lớp vỏ giòn rụm, phần nhân ngập tràn pate thơm béo, chả lụa, thịt nướng và loại nước sốt gia truyền đặc biệt.",
      en: "Pointed-end baguette baked over charcoal for a crackling crust, filled with velvety liver pate, char siu pork, artisanal sausage, and secret house sauce.",
      zh: "会安特色尖头法棍经炭火烘烤外酥里嫩，内夹绵密猪肝酱、蜜汁叉烧、越式扎肉、爽口酸菜，并淋上世代相传的秘制酱汁。",
      ko: "양끝이 뾰족한 호이안식 바게트를 숯불에 구워 겉은 바삭하고 속은 촉촉합니다. 부드러운 파테, 차슈 돼지고기와 비법 소스가 어우러집니다.",
      ja: "両端が尖った特徴的なバゲットを炭火でパリッと焼き上げ、濃厚なレバーパテ、チャーシュー、なます、秘伝ソースを贅沢に挟みました。",
    },
  },
  {
    id: 7,
    cat: "main",
    emoji: "🍜",
    price: "Đang cập nhật",
    rating: 4.8,
    lat: 15.87725,
    lng: 108.3256,
    address: "2 Hoàng Văn Thụ, Phường Minh An, Hội An",
    img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800",
    name: {
      vi: "Bánh Bèo Bà Bảy",
      en: "Ba Bay Savory Steamed Rice Cakes (Banh Beo)",
      zh: "会安七婆传统碗仔糕 (Bánh Bèo)",
      ko: "호이안 바바이 전통 반베오",
      ja: "ホイアン伝統バインベオ（米粉の蒸し餅）",
    },
    desc: {
      vi: "Bánh bèo chén nhỏ mềm mịn, bên trên có nhân tôm thịt đậm đà và lớp ram giòn nhẹ, mang đậm hương vị ẩm thực đường phố Phố cổ Hội An.",
      en: "Delicate steamed rice cakes served in small ceramic bowls, topped with savory shrimp-pork paste and crispy fried wonton strips.",
      zh: "盛在小巧瓷碗中的顺滑米糕，铺上浓郁鲜虾猪肉馅与香脆炸面片，是漫步会安古镇不可错过的地道小吃。",
      ko: "작은 도자기 그릇에 담아낸 부드러운 쌀떡 위에 감칠맛 나는 새우 돼지고기 소와 바삭한 고명을 얹어 먹는 호이안 대표 길거리 음식입니다.",
      ja: "小鉢に蒸し上げた滑らかな米粉生地の上に、旨味たっぷりのエビ豚そぼろとカリカリの揚げワンタンをのせたホイアンの伝統軽食です。",
    },
  },
  {
    id: 8,
    cat: "main",
    emoji: "🍜",
    price: "Đang cập nhật",
    rating: 4.8,
    lat: 15.87335,
    lng: 108.33685,
    address: "Thôn 1, Cẩm Nam, Hội An (34 Nguyễn Tri Phương)",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
    name: {
      vi: "Bánh đập Bà Già Hội An",
      en: "Cam Nam Smashed Rice Paper & Steamed Sheet (Banh Dap)",
      zh: "会安锦南岛特色拍拍饼 (Bánh Đập)",
      ko: "호이안 깜남 섬 전통 반답 (바삭한 라이스페이퍼 샌드)",
      ja: "ホイアン名物バインダップ（焼き＆蒸しライスペーパー重ね）",
    },
    desc: {
      vi: "Sự kết hợp thú vị giữa bánh tráng nướng giòn rụm và bánh ướt mềm dẻo ở giữa, chấm cùng mắm cái đậm đà đặc trưng làng Cẩm Nam.",
      en: "A delightful crunch-and-chew pairing of charcoal-grilled crispy rice paper sandwiching a moist steamed rice sheet, dipped in savory fermented anchovy sauce.",
      zh: "炭烤酥脆米纸夹着柔滑湿润的蒸肠粉皮，拍碎后蘸取锦南岛秘制凤尾鱼发酵浓酱，脆糯交织。",
      ko: "숯불에 구운 바삭한 라이스페이퍼 사이에 촉촉한 쌀피를 끼워 손으로 살짝 깨뜨린 뒤 특제 멸치 소스에 찍어 먹는 별미입니다.",
      ja: "炭火でパリッと焼いたライスペーパーでしっとり蒸し米粉皮を挟み、手で割って特製発酵アンチョビだれにつけて味わう名物料理です。",
    },
  },
  {
    id: 9,
    cat: "main",
    emoji: "🍜",
    price: "Đang cập nhật",
    rating: 4.8,
    lat: 15.8768,
    lng: 108.3268,
    address: "Bờ Sông Hoài, Đường Bạch Đằng, Phường Minh An, Hội An",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    name: {
      vi: "Bánh Ướt Cuốn Thịt Nướng Phố Cổ",
      en: "Hoai River Grilled Pork Wet Rice Rolls",
      zh: "怀河畔炭烤猪肉卷湿米纸",
      ko: "호아이 강변 숯불구이 돼지고기 라이스롤",
      ja: "ホアイ川畔・炭火焼き豚肉の生春巻き風米粉ロール",
    },
    desc: {
      vi: "Thịt nướng than hoa thơm lừng cuốn cùng bánh ướt mềm dẻo và rau sống tươi mát bên bờ sông Hoài, chấm nước lèo đậu phộng béo bùi.",
      en: "Charcoal-grilled marinated pork skewers wrapped in soft wet rice sheets with fresh herbs along the Hoai River, served with rich peanut sesame sauce.",
      zh: "在怀河畔品尝炭火香烤猪肉串，裹入柔嫩湿米皮与新鲜香草，蘸取香浓花生芝麻酱，清爽解腻。",
      ko: "호아이 강변에서 즐기는 숯불 양념 돼지고기 꼬치구이로, 부드러운 쌀피와 신선한 채소에 싸서 고소한 땅콩 참깨 소스에 찍어 먹습니다.",
      ja: "ホアイ川のほとりで味わう炭火焼き豚串。柔らかい生米粉シートと新鮮なハーブで巻き、濃厚なピーナッツ胡麻だれでいただきます。",
    },
  },
  {
    id: 11,
    cat: "sweet",
    emoji: "🍜",
    price: "Đang cập nhật",
    rating: 4.8,
    lat: 15.87785,
    lng: 108.33035,
    address: "150 Trần Phú, Phường Cẩm Châu, Hội An",
    img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800",
    name: {
      vi: "Trà Mót Hội An",
      en: "Mot Lotus Petal Herbal Lemongrass Tea",
      zh: "会安荷花瓣九味草本柠檬香茅茶",
      ko: "연꽃잎 레몬그라스 한방 허브티 (느억못)",
      ja: "蓮の花びら添え・9種ハーブのレモングラス茶",
    },
    desc: {
      vi: "Nước Mót là sự kết hợp từ hơn 10 loại thảo dược thiên nhiên như sả, hoa cúc, lá trà xanh, cam thảo, kim ngân hoa, điểm xuyết cánh sen hồng thanh tao.",
      en: "Iconic refreshing herbal elixir brewed from monk fruit, honeysuckle, licorice root, chrysanthemum, lemongrass, and lime, adorned with a pink lotus petal.",
      zh: "由罗汉果、金银花、甘草、菊花、新鲜香茅、青柠与蜂蜜慢熬而成的解暑草本茶，杯口点缀一片清雅的粉红荷花瓣。",
      ko: "나한과, 인동초, 감초, 국화, 신선한 레몬그라스와 라임을 우려낸 상쾌한 한방 허브차로, 분홍빛 연꽃잎 한 장을 띄워내는 호이안의 명물입니다.",
      ja: "羅漢果、スイカズラ、甘草、菊花、生レモングラス、ライムを煎じた爽やかなハーブティー。可憐な蓮の花びらが添えられたホイアン名物の一杯です。",
    },
  },
];
