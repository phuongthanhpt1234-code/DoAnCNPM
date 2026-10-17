import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as LocalesData from '../locales';

const { height } = Dimensions.get('window');

// @ts-ignore
let MapView: any = View; let Marker: any = View; let Circle: any = View;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default; 
  Marker = Maps.Marker; 
  Circle = Maps.Circle;
}

type LangCode = 'vi' | 'en' | 'zh' | 'ko' | 'ja' | 'es' | 'ar';

const VOICE_LANGS: { id: LangCode; flag: string; label: string; bcp47: string }[] = [
  { id: 'vi', flag: '🇻🇳', label: 'Tiếng Việt', bcp47: 'vi-VN' },
  { id: 'en', flag: '🇬🇧', label: 'English', bcp47: 'en-US' },
  { id: 'zh', flag: '🇨🇳', label: '中文', bcp47: 'zh-CN' },
  { id: 'ko', flag: '🇰🇷', label: '한국어', bcp47: 'ko-KR' },
  { id: 'ja', flag: '🇯🇵', label: '日本語', bcp47: 'ja-JP' },
  { id: 'es', flag: '🇪🇸', label: 'Español', bcp47: 'es-ES' },
  { id: 'ar', flag: '🇸🇦', label: 'العربية', bcp47: 'ar-SA' },
];

// DỮ LIỆU ĐA NGÔN NGỮ CHO 3 MẬT THƯ HẺM SÂU (KHÔNG BAO GIỜ BỊ NHẢY VỀ CƠM GÀ BÀ BUỘI)
const SECRET_CLUES_MULTILINGUAL: Record<string, {
  lat: number;
  lng: number;
  translations: Record<LangCode, { name: string; shop: string; tag: string; story: string }>;
}> = {
  c1: {
    lat: 15.8781, lng: 108.3269,
    translations: {
      vi: { name: 'Gánh Bánh Đập Cụ Mười (42 Năm)', shop: 'Hẻm 68 Phan Chu Trinh, Hội An', tag: 'Mật thư Hẻm Sâu #1 • Bánh đập giòn rôm rốp', story: 'Cách bạn 50 mét trong con hẻm nhỏ chỉ vừa một người đi, cụ Mười đã gắn bó 42 năm với gánh bánh đập giòn tan. Hai lớp bánh tráng nướng kẹp bánh ướt nóng hổi, chấm mắm nêm cá cơm thơm lừng.' },
      en: { name: 'Grandma Muoi’s Cracked Rice Paper (42 Years)', shop: 'Alley 68 Phan Chu Trinh, Hoi An', tag: 'Secret Alley #1 • Crispy Cracked Rice Paper', story: 'Hidden 50 meters away in a narrow one-person alleyway, Grandma Muoi has served crackling rice paper sandwiches with steamed wet rice sheets and savory anchovy sauce for 42 years.' },
      zh: { name: '十婆四十二年深巷脆拍米饼', shop: '会安潘周桢街68号窄巷', tag: '深巷密信 #1 • 咔嚓酥脆双层米饼', story: '距离您50米仅容一人通过的幽深窄巷内，十婆已坚守四十二年。两片炭烤脆米饼夹着温热软米皮，蘸上香浓凤尾鱼酱，满口酥香。' },
      ko: { name: '므어이 할머니의 42년 골목 반답', shop: '호이안 판추찐 68번지 좁은 골목', tag: '비밀 골목 #1 • 바삭한 반답 크래커', story: '50미터 앞 한 사람만 겨우 지나는 좁은 골목에서 42년간 자리를 지켜온 할머니의 노점입니다. 구운 라이스크래커와 촉촉한 쌀피를 겹쳐 향긋한 멸치 소스에 찍어 먹습니다.' },
      ja: { name: 'ムオイおばあちゃんの路地裏バインダップ（42年）', shop: 'ホイアン ファンチュウチン通り68番路地', tag: '路地裏の密書 #1 • パリパリ割れせんべい', story: '50メートル先の人が一人通れるほどの細い路地裏で、42年間愛され続ける屋台です。焼きせんべいで蒸し米シートを挟み、特製アンチョビだれで味わいます。' },
      es: { name: 'Papel de Arroz Crujiente de la Abuela Muoi', shop: 'Callejón 68 Phan Chu Trinh, Hoi An', tag: 'Callejón Secreto #1 • Receta de 42 años', story: 'Escondido a 50 metros en un callejón estrecho, la abuela Muoi lleva 42 años sirviendo galletas de arroz tostadas rellenas de arroz al vapor con salsa de anchoas.' },
      ar: { name: 'رقائق الأرز المقرمشة للجدة موي (42 عاماً)', shop: 'زقاق 68 فان تشو ترين، هوي آن', tag: 'الزقاق السري #1 • وصفة تراثية منذ 42 عاماً', story: 'على بعد 50 متراً في زقاق ضيق، تقدم الجدة موي رقائق الأرز المشوية المحشوة بالأرز المطهو على البخار مع صلصة الأنشوجة منذ 42 عاماً.' }
    }
  },
  c2: {
    lat: 15.8786, lng: 108.3283,
    translations: {
      vi: { name: 'Nồi Chè Đậu Ván Đặc Quánh Sau Tường Rêu', shop: 'Ngách nhỏ Kiệt Bá Lễ, Hội An', tag: 'Mật thư Hẻm Sâu #2 • Đậu ván nấu bếp than 4 giờ', story: 'Đi dọc bức tường vàng rêu phong 35 mét về hướng mạch nước ngàn năm, nồi chè đậu ván béo bùi được ninh trên bếp than hồng suốt bốn giờ, quyện hương lá dứa rừng và nước cốt dừa.' },
      en: { name: 'Mossy Wall Thick Hyacinth Bean Sweet Soup', shop: 'Ba Le Well Sub-Alley, Hoi An', tag: 'Secret Alley #2 • 4-Hour Charcoal Simmered Beans', story: '35 meters along the mossy yellow wall toward the ancient well, plump hyacinth beans are slow-cooked over charcoal for four hours with forest pandan leaves and rich coconut cream.' },
      zh: { name: '苔墙后四小时炭火扁豆浓甜羹', shop: '会安巴礼古井幽静小巷', tag: '深巷密信 #2 • 炭火慢熬四小时扁豆羹', story: '沿着长满青苔的黄墙向古井方向走35米，饱满的扁豆在炭火上慢熬四个小时，融合野生班兰叶清香与浓郁椰浆。' },
      ko: { name: '이끼 낀 담장 뒤편 진한 까치콩 체 (Chè)', shop: '호이안 발레 고대 우물 작은 골목', tag: '비밀 골목 #2 • 4시간 숯불로 고아낸 콩 디저트', story: '이끼 낀 노란 담장을 따라 35미터 걸어가면 만날 수 있는 노점입니다. 숯불 위에서 4시간 동안 정성껏 졸여낸 까치콩과 판단잎, 코코넛 밀크가 어우러집니다.' },
      ja: { name: '苔むす黄色い壁裏の濃厚フジマメぜんざい', shop: 'ホイアン バーレー古井戸の小路', tag: '路地裏の密書 #2 • 炭火で4時間煮込んだ伝統チェー', story: '苔むした黄色い壁に沿って35メートル進んだ古井戸のそばで、炭火で4時間じっくり煮込まれたフジマメとパンダンリーフ、ココナッツミルクの濃厚な甘味が楽しめます。' },
      es: { name: 'Postre Espeso de Frijoles Tras el Muro de Musgo', shop: 'Callejón del Pozo Ba Le, Hoi An', tag: 'Callejón Secreto #2 • Cocinado 4 horas al carbón', story: 'A 35 metros junto al muro amarillo cubierto de musgo, frijoles dulces cocinados a fuego lento durante cuatro horas con hojas de pandan y crema de coco.' },
      ar: { name: 'حلوى الفاصوليا الكثيفة خلف الجدار الطحلبي', shop: 'زقاق بئر با لي القديم، هوي آن', tag: 'الزقاق السري #2 • مطهوة على الفحم لمدة 4 ساعات', story: 'على بعد 35 متراً بمحاذاة الجدار الأصفر العتيق، تُطهى الفاصوليا الحلوة ببطء على الفحم مع أوراق الباندان وكريمة جوز الهند.' }
    }
  },
  c3: {
    lat: 15.8772, lng: 108.3261,
    translations: {
      vi: { name: 'Quầy Cao Lầu Khô Hấp Củi Tràm Ông Bảy', shop: 'Hẻm 14 Nguyễn Thị Minh Khai, Hội An', tag: 'Mật thư Hẻm Sâu #3 • Sợi mì hấp xửng vải củi tràm', story: 'Dưới giàn hoa giấy trăm năm cách Chùa Cầu 40 bước chân, ông Bảy vẫn giữ lối hấp sợi Cao Lầu trên xửng vải bằng củi tràm Cù Lao, trộn thịt xíu ngũ vị thơm nức.' },
      en: { name: 'Uncle Bay’s Melaleuca-Steamed Dry Cao Lau', shop: 'Alley 14 Nguyen Thi Minh Khai, Hoi An', tag: 'Secret Alley #3 • Cloth-Steamed Over Cham Wood', story: 'Beneath a century-old bougainvillea 40 steps from the Japanese Bridge, Uncle Bay steams fresh Cao Lau noodles on cloth racks over Cham Island wood fire with five-spice pork.' },
      zh: { name: '七叔百年纸花架下相思木蒸干高楼面', shop: '会安阮氏明开街14号巷（日本桥旁）', tag: '深巷密信 #3 • 传统布笼相思木柴火蒸面', story: '距离日本桥仅40步之遥的百年三角梅花架下，七叔依然坚持用占婆岛相思木柴火在布笼上蒸制高楼面，拌入五香叉烧，古味十足。' },
      ko: { name: '바이 할아버지의 참섬 장작 찜 비빔 까오러우', shop: '호이안 응우옌티민카이 14번지 골목', tag: '비밀 골목 #3 • 백년 부겐빌레아 아래 장작 찜면', story: '내원교에서 40걸음 떨어진 백 년 된 꽃나무 아래, 참섬 장작불과 천 찜기로 직접 쪄낸 쫄깃한 까오러우 면에 오향 차슈를 비벼 내는 숨은 명소입니다.' },
      ja: { name: 'バイおじいちゃんのチャム島薪蒸し汁なしカオラウ', shop: 'ホイアン グエンティミンカイ通り14番路地', tag: '路地裏の密書 #3 • 日本橋から40歩の百年ブーゲンビリア下', story: '来遠橋（日本橋）から40歩の樹齢百年のブーゲンビリアの下で、チャム島の薪火と布せいろで蒸し上げる伝統の汁なしカオラウです。' },
      es: { name: 'Cao Lau Seco al Vapor de Leña del Tío Bay', shop: 'Callejón 14 Nguyen Thi Minh Khai, Hoi An', tag: 'Callejón Secreto #3 • A 40 pasos del Puente Japonés', story: 'Bajo una buganvilla centenaria a 40 pasos del Puente Japonés, el tío Bay cocina al vapor los fideos Cao Lau sobre leña con cerdo a las cinco especias.' },
      ar: { name: 'نودلز كاو لاو الجافة المطهوة على حطب العم باي', shop: 'زقاق 14 نغوين تهي مينه خاي، هوي آن', tag: 'الزقاق السري #3 • على بعد 40 خطوة من الجسر الياباني', story: 'تحت شجرة بوغنفيليا عمرها قرن من الزمان، يطهو العم باي نودلز كاو لاو بالبخار على حطب جزيرة تشام مع اللحم المتبل.' }
    }
  }
};

// NHÃN GIAO DIỆN ĐỒNG BỘ 100% CHO CẢ 7 NGÔN NGỮ (BAO GỒM CẢ CÁC NÚT TRÊN TOP BAR)
const UI_LABELS: Record<LangCode, {
  studioBadge: string;
  playingStatus: string;
  readyStatus: string;
  checkInHoiAnBtn: string;
  checkInNationalBtn: string;
  checkedInBtn: string;
  walkBtn: string;
  hideWalkBtn: string;
  inRadiusText: string;
  nationalModeText: string;
  switchRemoteBtn: string;
  switchNearBtn: string;
  modePin: string;
  modeWalk: string;
  modeSat: string;
  multiStopTitle: string;
  multiStopTag: string;
}> = {
  vi: {
    studioBadge: '🎧 THUYẾT MINH VĂN HÓA & NGUYÊN LIỆU MÓN ĂN',
    playingStatus: 'Đang phát giọng đọc AI thuyết minh...',
    readyStatus: 'Bấm Play để nghe AI thuyết minh',
    checkInHoiAnBtn: '🏮 Check-in Tại Hội An (<=20m • +300 XP)',
    checkInNationalBtn: '🇻🇳 Check-in Toàn Quốc (Từ Xa • +150 XP)',
    checkedInBtn: '🎉 Đã Lưu Vào Hộ Chiếu Di Sản',
    walkBtn: 'Chỉ đường',
    hideWalkBtn: 'Ẩn lộ trình',
    inRadiusText: '🟢 Trong vùng 20m tại Hội An (X2 XP)',
    nationalModeText: '🇻🇳 GPS Toàn Quốc (Check-in mọi nơi)',
    switchRemoteBtn: 'Đổi Từ Xa',
    switchNearBtn: 'Giả lập <=20m',
    modePin: '📍 Vị trí',
    modeWalk: '🚶 Đường đi bộ',
    modeSat: '🛰️ Vệ tinh',
    multiStopTitle: 'Lộ Trình Đi Bộ Đa Điểm Phố Cổ',
    multiStopTag: '🚶 Bản đồ nối liền các trạm thưởng thức ẩm thực'
  },
  en: {
    studioBadge: '🎧 CULINARY HERITAGE & INGREDIENT NARRATION',
    playingStatus: 'Playing AI culinary voice narration...',
    readyStatus: 'Tap Play to listen to AI narration',
    checkInHoiAnBtn: '🏮 Check-in at Hoi An (<=20m • +300 XP)',
    checkInNationalBtn: '🇻🇳 Remote Check-in (+150 XP)',
    checkedInBtn: '🎉 Saved to Heritage Passport',
    walkBtn: 'Directions',
    hideWalkBtn: 'Hide Route',
    inRadiusText: '🟢 Within 20m in Hoi An (X2 XP)',
    nationalModeText: '🇻🇳 Nationwide GPS (Check-in Anywhere)',
    switchRemoteBtn: 'Set Remote',
    switchNearBtn: 'Sim <=20m',
    modePin: '📍 Pin View',
    modeWalk: '🚶 Walk Route',
    modeSat: '🛰️ Satellite',
    multiStopTitle: 'Multi-Stop Ancient Town Walking Tour',
    multiStopTag: '🚶 Connected walking itinerary across selected stops'
  },
  zh: {
    studioBadge: '🎧 会安美食文化与传统食材语音解说',
    playingStatus: '正在播放 AI 美食文化语音解说...',
    readyStatus: '点击播放收听 AI 美食文化讲解',
    checkInHoiAnBtn: '🏮 会安 20米内打卡 (+300 XP)',
    checkInNationalBtn: '🇻🇳 全境远程打卡 (+150 XP)',
    checkedInBtn: '🎉 已成功记入美食护照',
    walkBtn: '步行导航',
    hideWalkBtn: '隐藏路线',
    inRadiusText: '🟢 会安 20米范围内 (双倍积分)',
    nationalModeText: '🇻🇳 全境自由打卡模式',
    switchRemoteBtn: '切换远程',
    switchNearBtn: '模拟 <=20m',
    modePin: '📍 位置视图',
    modeWalk: '🚶 步行路线',
    modeSat: '🛰️ 卫星地图',
    multiStopTitle: '会安古镇多站点美食步行路线',
    multiStopTag: '🚶 串联所选美食站点的最佳步行导航'
  },
  ko: {
    studioBadge: '🎧 호이안 미식 유산 & 식재료 AI 음성 해설',
    playingStatus: 'AI 요리 문화 음성 해설 재생 중...',
    readyStatus: '재생 버튼을 눌러 AI 해설 듣기',
    checkInHoiAnBtn: '🏮 호이안 20m 체크인 (+300 XP)',
    checkInNationalBtn: '🇻🇳 원격 체크인 (+150 XP)',
    checkedInBtn: '🎉 미식 패스포트 기록 완료',
    walkBtn: '도보 길찾기',
    hideWalkBtn: '경로 닫기',
    inRadiusText: '🟢 호이안 반경 20m 내 (2배 포인트)',
    nationalModeText: '🇻🇳 어디서나 원격 체크인 가능',
    switchRemoteBtn: '원격 전환',
    switchNearBtn: '20m 시뮬레이션',
    modePin: '📍 위치 보기',
    modeWalk: '🚶 도보 경로',
    modeSat: '🛰️ 위성 지도',
    multiStopTitle: '호이안 올드타운 다중 경유지 도보 투어',
    multiStopTag: '🚶 선택한 맛집들을 연결하는 최적 도보 코스'
  },
  ja: {
    studioBadge: '🎧 ホイアン食文化＆伝統食材 AI音声ガイド',
    playingStatus: 'AI食文化ナレーションを再生しています...',
    readyStatus: '再生ボタンを押してAI解説を聞く',
    checkInHoiAnBtn: '🏮 ホイアン20mチェックイン (+300 XP)',
    checkInNationalBtn: '🇻🇳 リモートチェックイン (+150 XP)',
    checkedInBtn: '🎉 グルメパスポートに記録完了',
    walkBtn: '徒歩ナビ',
    hideWalkBtn: 'ルート非表示',
    inRadiusText: '🟢 ホイアン半径20m圏内 (ポイント2倍)',
    nationalModeText: '🇻🇳 どこでもチェックイン可能モード',
    switchRemoteBtn: '遠隔切替',
    switchNearBtn: '20m接近',
    modePin: '📍 スポット位置',
    modeWalk: '🚶 徒歩ルート',
    modeSat: '🛰️ 衛星写真',
    multiStopTitle: 'ホイアン旧市街・複数スポット食べ歩きルート',
    multiStopTag: '🚶 選択した名店を順番に巡る徒歩ナビゲーション'
  },
  es: {
    studioBadge: '🎧 NARRACIÓN IA DE PATRIMONIO E INGREDIENTES',
    playingStatus: 'Reproduciendo narración IA...',
    readyStatus: 'Toca Play para escuchar la narración',
    checkInHoiAnBtn: '🏮 Check-in en Hoi An (+300 XP)',
    checkInNationalBtn: '🇻🇳 Check-in Remoto (+150 XP)',
    checkedInBtn: '🎉 Guardado en tu Pasaporte',
    walkBtn: 'Ruta a pie',
    hideWalkBtn: 'Ocultar ruta',
    inRadiusText: '🟢 Radio de 20m en Hoi An (XP Doble)',
    nationalModeText: '🇻🇳 Modo Check-in desde cualquier lugar',
    switchRemoteBtn: 'Modo Remoto',
    switchNearBtn: 'Simular <=20m',
    modePin: '📍 Ubicación',
    modeWalk: '🚶 Ruta a pie',
    modeSat: '🛰️ Satélite',
    multiStopTitle: 'Ruta Gastronómica a Pie Multi-Parada',
    multiStopTag: '🚶 Recorrido conectado por tus paradas seleccionadas'
  },
  ar: {
    studioBadge: '🎧 الشرح الصوتي الذكي لتاريخ ومكونات الطبق',
    playingStatus: 'جاري تشغيل الشرح الصوتي الذكي...',
    readyStatus: 'اضغط للتشغيل والاستماع إلى الشرح',
    checkInHoiAnBtn: '🏮 تسجيل الوصول في هوي آن (+300 XP)',
    checkInNationalBtn: '🇻🇳 تسجيل الوصول عن بعد (+150 XP)',
    checkedInBtn: '🎉 تم الحفظ في جواز السفر الغذائي',
    walkBtn: 'مسار المشي',
    hideWalkBtn: 'إخفاء المسار',
    inRadiusText: '🟢 ضمن نطاق 20م في هوي آن (نقاط مضاعفة)',
    nationalModeText: '🇻🇳 وضع تسجيل الوصول الشامل',
    switchRemoteBtn: 'وضع بعيد',
    switchNearBtn: 'محاكاة <=20م',
    modePin: '📍 الموقع',
    modeWalk: '🚶 مسار المشي',
    modeSat: '🛰️ قمر صناعي',
    multiStopTitle: 'مسار المشي متعدد المحطات في هوي آن',
    multiStopTag: '🚶 خريطة متصلة لجميع محطات الطعام المختارة'
  }
};

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const { i18n } = useTranslation();

  const [isDarkMode, setIsDarkMode] = useState(true);

  const initialLang = (((i18n.language || 'vi').split('-')[0].toLowerCase()) as LangCode) || 'vi';
  const [voiceLang, setVoiceLang] = useState<LangCode>(initialLang);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const allDishesList: any[] = (LocalesData as any).ALL_DISHES_DATA || [];

  // 1. KIỂM TRA CHẾ ĐỘ LỘ TRÌNH ĐA ĐIỂM (KHI NGƯỜI DÙNG BẤM DẪN ĐƯỜNG NHIỀU TRẠM)
  let parsedRouteStops: any[] = [];
  if (params.stopsJson) {
    try {
      const stopIds: string[] = JSON.parse(params.stopsJson as string);
      parsedRouteStops = stopIds
        .map(sid => allDishesList.find((d: any) => String(d.id) === String(sid)))
        .filter(Boolean);
    } catch (e) {}
  }
  const isMultiStopMode = parsedRouteStops.length > 1 || params.isMultiStop === '1';

  // 2. KIỂM TRA CHẾ ĐỘ MẬT THƯ HẺM SÂU AGENT AI (KHÔNG BAO GIỜ NHẢY VỀ CƠM GÀ BÀ BUỘI)
  const detectSecretClueKey = (): string | null => {
    const cid = String(params.clueId || params.id || '');
    if (SECRET_CLUES_MULTILINGUAL[cid]) return cid;
    const rawName = String(params.name || params.title || '').toLowerCase();
    if (rawName.includes('cụ mười') || rawName.includes('bánh đập cụ mười') || rawName.includes('muoi')) return 'c1';
    if (rawName.includes('đậu ván') || rawName.includes('tường rêu') || rawName.includes('hyacinth')) return 'c2';
    if (rawName.includes('ông bảy') || rawName.includes('củi tràm') || rawName.includes('uncle bay')) return 'c3';
    if (params.lat) {
      const pLat = parseFloat(params.lat as string);
      if (Math.abs(pLat - 15.8781) < 0.00005) return 'c1';
      if (Math.abs(pLat - 15.8786) < 0.00005) return 'c2';
      if (Math.abs(pLat - 15.8772) < 0.00005) return 'c3';
    }
    return null;
  };
  const secretClueKey = detectSecretClueKey();
  const secretClueObj = secretClueKey ? SECRET_CLUES_MULTILINGUAL[secretClueKey] : null;

  // 3. TÌM MÓN ĂN CHính XÁC THEO ID HOẶC TÊN HOẶC TỌA ĐỘ
  const findExactDish = () => {
    if (secretClueObj || isMultiStopMode) return null;
    if (params.id) {
      const byId = allDishesList.find((d: any) => String(d.id) === String(params.id));
      if (byId) return byId;
    }
    if (params.name) {
      const q = String(params.name).toLowerCase();
      const byName = allDishesList.find((d: any) => {
        const viName = d.translations?.vi?.name?.toLowerCase() || '';
        const enName = d.translations?.en?.name?.toLowerCase() || '';
        const shop = (d.shopVi || '').toLowerCase();
        return viName.includes(q) || q.includes(viName) || enName.includes(q) || shop.includes(q);
      });
      if (byName) return byName;
    }
    if (params.lat && params.lng) {
      const pLat = parseFloat(params.lat as string);
      const pLng = parseFloat(params.lng as string);
      const byCoords = allDishesList.find((d: any) => Math.abs(d.lat - pLat) < 0.0001 && Math.abs(d.lng - pLng) < 0.0001);
      if (byCoords) return byCoords;
    }
    // Chỉ khi không truyền bất kỳ thông tin gì mới dùng món đầu tiên
    if (!params.name && !params.lat) return allDishesList[0];
    return null;
  };

  const foundDish = findExactDish();

  // Tọa độ chính xác của mục tiêu
  const foodLat = secretClueObj
    ? secretClueObj.lat
    : isMultiStopMode && parsedRouteStops.length > 0
      ? parsedRouteStops[parsedRouteStops.length - 1].lat
      : params.lat
        ? parseFloat(params.lat as string)
        : (foundDish?.lat || 15.8782);

  const foodLng = secretClueObj
    ? secretClueObj.lng
    : isMultiStopMode && parsedRouteStops.length > 0
      ? parsedRouteStops[parsedRouteStops.length - 1].lng
      : params.lng
        ? parseFloat(params.lng as string)
        : (foundDish?.lng || 108.3265);

  const initDist = params.initialDistance ? parseInt(params.initialDistance as string, 10) : 10;
  const [isSimulatedNear, setIsSimulatedNear] = useState<boolean>(initDist <= 20);
  const [userCoords] = useState({
    lat: isMultiStopMode && parsedRouteStops.length > 0 ? parsedRouteStops[0].lat : (initDist <= 20 ? foodLat - 0.00008 : 15.8755),
    lng: isMultiStopMode && parsedRouteStops.length > 0 ? parsedRouteStops[0].lng : (initDist <= 20 ? foodLng - 0.00007 : 108.3238)
  });

  // Nếu là Lộ trình đa điểm hoặc bấm Dẫn đường từ Hộp thư mật -> tự động bật chế độ vẽ đường đi bộ ('walk')
  const [mapMode, setMapMode] = useState<'pin' | 'walk' | 'sat'>(
    isMultiStopMode || params.autoWalk === '1' || secretClueObj ? 'walk' : 'pin'
  );
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const waveAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    AsyncStorage.getItem('appThemeMode').then(saved => {
      if (saved !== null) setIsDarkMode(saved === 'dark');
    });
    AsyncStorage.getItem('appLanguage').then(savedLang => {
      if (savedLang) {
        const clean = savedLang.split('-')[0].toLowerCase() as LangCode;
        if (UI_LABELS[clean]) setVoiceLang(clean);
      }
    });
  }, []);

  useEffect(() => {
    const clean = ((i18n.language || 'vi').split('-')[0].toLowerCase()) as LangCode;
    if (UI_LABELS[clean]) setVoiceLang(clean);
  }, [i18n.language]);

  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 350, useNativeDriver: false }),
          Animated.timing(waveAnim, { toValue: 0.25, duration: 350, useNativeDriver: false }),
        ])
      ).start();
    } else {
      waveAnim.setValue(0.3);
    }
  }, [isSpeaking, waveAnim]);

  const distanceMeters = isSimulatedNear ? (initDist <= 20 ? initDist : 10) : 220;
  const isInside20m = distanceMeters <= 20;
  const uiLabels = UI_LABELS[voiceLang] || UI_LABELS.vi;

  // Lấy thông tin hiển thị (Tên món / Mật thư / Lộ trình) hoàn toàn theo ngôn ngữ `voiceLang`
  const getDisplayContent = (lang: LangCode) => {
    const labels = UI_LABELS[lang] || UI_LABELS.vi;

    // Trường hợp 1: Lộ trình đi bộ nhiều trạm
    if (isMultiStopMode) {
      const stopNames = parsedRouteStops.length > 0
        ? parsedRouteStops.map((d, idx) => `${idx + 1}. ${d.translations?.[lang]?.name || d.translations?.vi?.name}`).join(' ➔ ')
        : (params.routeNames as string) || '1 ➔ 2 ➔ 3';
      return {
        name: labels.multiStopTitle,
        shop: stopNames,
        tag: labels.multiStopTag,
        story: lang === 'ja'
          ? `選択されたスポット（${stopNames}）を順番に巡る徒歩ルートを表示しています。地図の青いルートに沿って古都ホイアンの食べ歩きをお楽しみください。`
          : lang === 'en'
            ? `Active walking itinerary connecting: ${stopNames}. Follow the blue walking path on the map to enjoy each culinary stop in order.`
            : lang === 'zh'
              ? `已为您规划串联以下美食站点的步行路线：${stopNames}。请沿着地图上的路线依次品尝会安古镇美食。`
              : lang === 'ko'
                ? `선택하신 맛집 코스(${stopNames})를 연결하는 도보 길찾기입니다. 지도의 안내선을 따라 이동해 보세요.`
                : `Lộ trình đi bộ kết nối các trạm: ${stopNames}. Bản đồ phía trên đã vẽ sẵn đường đi bộ ngắn nhất nối từ trạm đầu tiên đến trạm cuối cùng.`
      };
    }

    // Trường hợp 2: Mật thư Hẻm Sâu Agent AI
    if (secretClueObj) {
      return secretClueObj.translations[lang] || secretClueObj.translations.vi;
    }

    // Trường hợp 3: Món ăn trong danh sách 25 món
    if (foundDish && foundDish.translations) {
      const tr = foundDish.translations[lang] || foundDish.translations.vi;
      return {
        name: tr.name,
        shop: foundDish.shopVi || 'Hội An',
        tag: tr.tag,
        story: tr.story
      };
    }

    // Trường hợp 4: Địa điểm tùy chỉnh khác truyền qua params
    return {
      name: (params.name as string) || 'Đặc sản Hội An',
      shop: (params.shopVi as string) || 'Phố Cổ Hội An',
      tag: (params.tagVi as string) || labels.studioBadge,
      story: (params.desc as string) || ''
    };
  };

  const displayContent = getDisplayContent(voiceLang);

  const buildVoiceScript = (lang: LangCode) => {
    const content = getDisplayContent(lang);
    if (isMultiStopMode || secretClueObj) {
      return `${content.name}. ${content.tag}. ${content.story}`;
    }
    if (typeof (LocalesData as any).buildPureDishNarration === 'function' && foundDish) {
      return (LocalesData as any).buildPureDishNarration(lang, foundDish);
    }
    return `${content.name}. ${content.tag}. ${content.story}`;
  };

  const pureScript = buildVoiceScript(voiceLang);

  const speakDishNarration = (langOverride?: LangCode, rateOverride?: number) => {
    const targetLang = langOverride || voiceLang;
    const targetRate = rateOverride || speechRate;
    const textToSpeak = buildVoiceScript(targetLang);
    const langMeta = VOICE_LANGS.find(l => l.id === targetLang) || VOICE_LANGS[0];

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langMeta.bcp47;
      utterance.rate = targetRate;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang.toLowerCase())) ||
                           voices.find(v => v.lang.toLowerCase().includes(langMeta.bcp47.toLowerCase()));
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(true);
    }
  };

  const stopDishNarration = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (params.autoSpeak === '1' || isInside20m) {
        speakDishNarration(voiceLang, speechRate);
      }
    }, 450);
    return () => {
      clearTimeout(timer);
      stopDishNarration();
    };
  }, []);

  const handleSelectVoiceLang = async (newLang: LangCode) => {
    setVoiceLang(newLang);
    await i18n.changeLanguage(newLang);
    await AsyncStorage.setItem('appLanguage', newLang);
    speakDishNarration(newLang, speechRate);
  };

  const handleDualModeCheckIn = async () => {
    setIsCheckedIn(true);
    const earnedXp = isInside20m ? 300 : 150;
    try {
      const targetId = String(foundDish?.id || secretClueKey || params.id || '1');
      const saved = await AsyncStorage.getItem('checkedInDishIds');
      const ids: string[] = saved ? JSON.parse(saved) : [];
      if (!ids.includes(targetId)) {
        const updated = [...ids, targetId];
        await AsyncStorage.setItem('checkedInDishIds', JSON.stringify(updated));
      }
      setToastMsg(`${uiLabels.checkedInBtn} (+${earnedXp} XP)`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (e) {}
  };

  const getEmbeddedMapUrl = () => {
    const satParam = mapMode === 'sat' ? '&t=k' : '';
    if (isMultiStopMode && parsedRouteStops.length >= 2) {
      const first = parsedRouteStops[0];
      const last = parsedRouteStops[parsedRouteStops.length - 1];
      return `https://maps.google.com/maps?saddr=${first.lat},${first.lng}&daddr=${last.lat},${last.lng}&dirflg=w${satParam}&output=embed`;
    }
    if (mapMode === 'walk') {
      return `https://maps.google.com/maps?saddr=${userCoords.lat},${userCoords.lng}&daddr=${foodLat},${foodLng}&dirflg=w${satParam}&output=embed`;
    }
    return `https://maps.google.com/maps?q=${foodLat},${foodLng}&z=18${satParam}&output=embed`;
  };

  const theme = {
    bg: isDarkMode ? '#120F0D' : '#F6F3EC',
    cardBg: isDarkMode ? '#1C1815' : '#FFFFFF',
    subBox: isDarkMode ? '#120F0D' : '#F3EFE6',
    textMain: isDarkMode ? '#FFFFFF' : '#18181B',
    textSub: isDarkMode ? '#B8B0A8' : '#4B5563',
    accent: isDarkMode ? '#D4AF37' : '#8C5E0A',
    green: isDarkMode ? '#10B981' : '#047857',
    border: isDarkMode ? '#302924' : '#E2DCD0',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {toastMsg ? (
        <View style={styles.toastBox}>
          <Ionicons name="sparkles" size={16} color="#120F0D" />
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      ) : null}
      
      {/* THANH TOP BAR ĐỒNG BỘ 100% NGÔN NGỮ & HIỂN THỊ ĐÚNG ĐỊA ĐIỂM */}
      <View style={[styles.topBar, { backgroundColor: theme.cardBg, borderColor: isInside20m ? theme.green : theme.border }]}>
        <View style={styles.topBarRow}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.subBox }]} onPress={() => { stopDishNarration(); router.back(); }}>
            <Ionicons name="chevron-back" size={20} color={theme.textMain} />
          </TouchableOpacity>

          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={{ color: isInside20m ? theme.green : theme.accent, fontSize: 12, fontWeight: 'bold' }} numberOfLines={1}>
              {isInside20m ? `${uiLabels.inRadiusText} (${distanceMeters}m)` : uiLabels.nationalModeText}
            </Text>
            <Text style={{ color: theme.textSub, fontSize: 11 }} numberOfLines={1}>
              📍 {displayContent.shop} ({foodLat.toFixed(4)}°N, {foodLng.toFixed(4)}°E)
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.simBtn, { backgroundColor: isInside20m ? theme.green : theme.accent }]} 
            onPress={() => setIsSimulatedNear(!isSimulatedNear)}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>
              {isInside20m ? uiLabels.switchRemoteBtn : uiLabels.switchNearBtn}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modeTabsRow}>
          {(['pin', 'walk', 'sat'] as const).map((m) => (
            <TouchableOpacity 
              key={m} 
              style={[styles.modeTab, { backgroundColor: mapMode === m ? '#8B2E2E' : theme.subBox }]} 
              onPress={() => setMapMode(m)}
            >
              <Text style={{ color: mapMode === m ? '#FFFFFF' : theme.textMain, fontSize: 11, fontWeight: 'bold' }}>
                {m === 'pin' ? uiLabels.modePin : m === 'walk' ? uiLabels.modeWalk : uiLabels.modeSat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* KHUNG BẢN ĐỒ */}
      {Platform.OS === 'web' ? (
        <View style={styles.mapBase}>
          {/* @ts-ignore */}
          <iframe width="100%" height="100%" style={{ border: 0 }} src={getEmbeddedMapUrl()} allowFullScreen />
        </View>
      ) : (
        <MapView style={styles.mapBase} initialRegion={{ latitude: foodLat, longitude: foodLng, latitudeDelta: 0.004, longitudeDelta: 0.004 }}>
          <Marker coordinate={{ latitude: foodLat, longitude: foodLng }} title={displayContent.name} />
          <Circle center={{ latitude: foodLat, longitude: foodLng }} radius={20} fillColor="rgba(16, 185, 129, 0.3)" strokeColor="#10B981" />
        </MapView>
      )}

      {/* BẢNG THUYẾT MINH MÓN ĂN (ĐÃ SỬA LỖI CẮT CHỮ TIÊU ĐỀ TIẾNG NHẬT) */}
      <View style={[styles.bottomSheet, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 6, paddingBottom: 16 }}>
          
          <Text style={[styles.dishCategoryLabel, { color: theme.accent }]}>
            {uiLabels.studioBadge}
          </Text>
          <Text style={[styles.dishName, { color: theme.textMain }]}>
            {displayContent.name}
          </Text>
          <Text style={[styles.dishTag, { color: theme.green }]}>✨ {displayContent.tag}</Text>

          {/* PHÒNG THU GIỌNG ĐỌC AI 7 NGÔN NGỮ */}
          <View style={[styles.aiBox, { backgroundColor: theme.subBox, borderColor: isSpeaking ? theme.green : theme.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {VOICE_LANGS.map((vl) => {
                const active = voiceLang === vl.id;
                return (
                  <TouchableOpacity
                    key={vl.id}
                    style={[styles.langChip, { backgroundColor: active ? theme.green : theme.cardBg, borderColor: theme.border }]}
                    onPress={() => handleSelectVoiceLang(vl.id)}
                  >
                    <Text style={{ fontSize: 13, marginRight: 4 }}>{vl.flag}</Text>
                    <Text style={{ color: active ? '#FFFFFF' : theme.textMain, fontSize: 12, fontWeight: active ? 'bold' : '500' }}>
                      {vl.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={[styles.playerRow, { backgroundColor: theme.cardBg }]}>
              <TouchableOpacity 
                style={[styles.playBtn, { backgroundColor: isSpeaking ? theme.green : theme.accent }]}
                onPress={() => isSpeaking ? stopDishNarration() : speakDishNarration()}
              >
                <Ionicons name={isSpeaking ? "pause" : "play"} size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={{ color: theme.textMain, fontSize: 12, fontWeight: 'bold', marginBottom: 4 }} numberOfLines={1}>
                  {isSpeaking ? uiLabels.playingStatus : uiLabels.readyStatus}
                </Text>
                <View style={styles.waveRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                    <Animated.View
                      key={bar}
                      style={{
                        width: 4,
                        borderRadius: 2,
                        marginRight: 4,
                        backgroundColor: isSpeaking ? theme.green : theme.textSub,
                        opacity: isSpeaking ? waveAnim : 0.35,
                        height: isSpeaking ? (bar % 2 === 0 ? 14 : 8) : 5
                      }}
                    />
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row' }}>
                {[0.8, 1.0, 1.2].map((r) => (
                  <TouchableOpacity 
                    key={r} 
                    style={[styles.rateChip, { backgroundColor: speechRate === r ? theme.accent : theme.subBox }]}
                    onPress={() => { setSpeechRate(r); if (isSpeaking) speakDishNarration(voiceLang, r); }}
                  >
                    <Text style={{ color: speechRate === r ? '#FFFFFF' : theme.textSub, fontSize: 10, fontWeight: 'bold' }}>{r}x</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.scriptCard, { borderLeftColor: theme.green }]}>
              <Text style={[styles.scriptText, { color: theme.textMain }]}>
                "{pureScript}"
              </Text>
            </View>
          </View>

          {/* NÚT CHECK-IN & CHỈ ĐƯỜNG */}
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={[styles.checkInBtn, { backgroundColor: isCheckedIn ? theme.green : (isInside20m ? '#059669' : theme.accent) }]} 
              onPress={handleDualModeCheckIn}
            >
              <Ionicons name={isCheckedIn ? "checkmark-circle" : "location"} size={18} color="#FFFFFF" />
              <Text style={styles.checkInBtnText} numberOfLines={1}>
                {isCheckedIn 
                  ? uiLabels.checkedInBtn 
                  : (isInside20m ? uiLabels.checkInHoiAnBtn : uiLabels.checkInNationalBtn)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.walkBtn, { borderColor: theme.accent }]} 
              onPress={() => {
                if (Platform.OS === 'web') setMapMode(mapMode === 'walk' ? 'pin' : 'walk');
                else Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${foodLat},${foodLng}&travelmode=walking`);
              }}
            >
              <Ionicons name="walk" size={18} color={theme.accent} />
              <Text style={[styles.walkBtnText, { color: theme.accent }]}>
                {mapMode === 'walk' ? uiLabels.hideWalkBtn : uiLabels.walkBtn}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center' },
  toastBox: { position: 'absolute', top: 115, left: 20, right: 20, zIndex: 50, backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', elevation: 10 },
  toastText: { color: '#120F0D', fontSize: 12, fontWeight: 'bold', marginLeft: 8, flex: 1 },
  topBar: { position: 'absolute', top: 10, left: 12, right: 12, zIndex: 20, borderRadius: 16, padding: 10, borderWidth: 1.5, elevation: 8 },
  topBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtn: { padding: 7, borderRadius: 10 },
  simBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  modeTabsRow: { flexDirection: 'row', gap: 6 },
  modeTab: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 8 },
  mapBase: { flex: 1, width: '100%', paddingBottom: height * 0.50 },
  
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10, borderTopWidth: 1.5, height: height * 0.54 },
  dishCategoryLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.6, marginBottom: 6 },
  dishName: { fontSize: 20, lineHeight: 28, fontWeight: 'bold', fontFamily: 'serif', marginBottom: 4 },
  dishTag: { fontSize: 12, lineHeight: 18, fontWeight: '600', marginBottom: 12 },

  aiBox: { borderRadius: 16, padding: 12, borderWidth: 1, marginBottom: 14 },
  langChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginRight: 8, borderWidth: 1 },
  playerRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 10 },
  playBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  waveRow: { flexDirection: 'row', alignItems: 'center', height: 16 },
  rateChip: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, marginLeft: 4 },
  scriptCard: { borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 4 },
  scriptText: { fontSize: 13, lineHeight: 20, fontStyle: 'italic' },

  bottomActions: { flexDirection: 'row', gap: 8 },
  checkInBtn: { flex: 1.8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, paddingHorizontal: 8, borderRadius: 12 },
  checkInBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  walkBtn: { flex: 0.9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, borderWidth: 1.5 },
  walkBtnText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 }
});