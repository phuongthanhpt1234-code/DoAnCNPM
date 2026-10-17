import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Image, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import '../locales';

type LangCode = 'vi' | 'en' | 'zh' | 'ko' | 'ja' | 'es' | 'ar';

const EXPLORE_I18N: Record<LangCode, {
  headerTitle: string;
  unlockAllBtn: string;
  passportBadge: string;
  progressTitle: string;
  progressHint: string;
  claimBtn: string;
  tabTrails: string;
  tabSecret: string;
  openSecretBtn: string;
  secretIntro: string;
  sealTitle: string;
  sealSub: string;
  tapSealHint: string;
  listenRiddleBtn: string;
  guessLabel: string;
  solveAndMapBtn: string;
  directMapBtn: string;
  nextClueBtn: string;
  ambassadorTitle: string;
  awardedTo: string;
  saveRewardBtn: string;
  savedRewardBtn: string;
}> = {
  vi: {
    headerTitle: 'Hộ Chiếu Food-Trail',
    unlockAllBtn: 'Mở Khóa 100%',
    passportBadge: '🏆 HÀNH TRÌNH ĐẠI SỨ ẨM THỰC',
    progressTitle: 'Tiến độ chinh phục:',
    progressHint: 'Chạm vào món ăn để Check-in hoặc mở Bản đồ GPS.',
    claimBtn: 'Nhận Thưởng',
    tabTrails: '🏆 3 Tuyến Thử Thách',
    tabSecret: '✉️ Hộp Thư Mật AI (3)',
    openSecretBtn: 'Mở Hộp Thư Mật Agent AI & Dẫn Đường Hẻm Sâu',
    secretIntro: 'Giải mật thư thơ/văn từ Agent AI kèm Bản đồ GPS dẫn đường trực tiếp vào hẻm.',
    sealTitle: 'HỘP THƯ MẬT HẺM SÂU',
    sealSub: 'Agent AI vừa quét thấy một gánh quà cổ truyền ẩn mình trong hẻm nhỏ. Chạm vào ấn sáp đỏ để mở thư!',
    tapSealHint: '✨ Chạm vào ấn sáp đỏ để mở phong bì',
    listenRiddleBtn: 'Nghe Agent AI đọc mật thư',
    guessLabel: '🔍 Chọn đáp án giải mật thư:',
    solveAndMapBtn: 'Giải Mật Thư & Mở Map',
    directMapBtn: 'Chỉ đường GPS',
    nextClueBtn: 'Nhận manh mối tiếp theo ➔',
    ambassadorTitle: 'ĐẠI SỨ ẨM THỰC HỘI AN',
    awardedTo: 'Chứng nhận trao cho:',
    saveRewardBtn: 'Lưu Chứng Nhận & E-Voucher Ngay',
    savedRewardBtn: '🎉 Đã Lưu Vào Hồ Sơ Của Bạn!'
  },
  en: {
    headerTitle: 'Food-Trail Passport',
    unlockAllBtn: 'Unlock 100%',
    passportBadge: '🏆 CULINARY AMBASSADOR JOURNEY',
    progressTitle: 'Conquered Progress:',
    progressHint: 'Tap any dish to Check-in or open GPS Map.',
    claimBtn: 'Claim Rewards',
    tabTrails: '🏆 3 Heritage Trails',
    tabSecret: '✉️ AI Secret Letters (3)',
    openSecretBtn: 'Open AI Secret Letter & Alleyway GPS',
    secretIntro: 'Solve poetic riddles from Agent AI to unlock hidden alleyway stalls on the GPS map.',
    sealTitle: 'SECRET ALLEYWAY LETTER',
    sealSub: 'Agent AI detected a 40-year-old hidden street stall nearby. Tap the red wax seal to unseal the clue!',
    tapSealHint: '✨ Tap the red wax seal to open envelope',
    listenRiddleBtn: 'Listen to AI Riddle Narration',
    guessLabel: '🔍 Guess the secret dish:',
    solveAndMapBtn: 'Solve Clue & Show Map',
    directMapBtn: 'GPS Route',
    nextClueBtn: 'Get Next Secret Clue ➔',
    ambassadorTitle: 'HOI AN CULINARY AMBASSADOR',
    awardedTo: 'Certificate awarded to:',
    saveRewardBtn: 'Save Certificate & E-Voucher',
    savedRewardBtn: '🎉 Saved to Your Passport!'
  },
  zh: {
    headerTitle: '会安美食寻宝护照',
    unlockAllBtn: '一键全解锁',
    passportBadge: '🏆 会安美食文化大使之旅',
    progressTitle: '当前打卡进度：',
    progressHint: '点击菜品即可完成打卡或开启 GPS 地图导航。',
    claimBtn: '领取奖励',
    tabTrails: '🏆 三大美食路线',
    tabSecret: '✉️ AI 深巷密信 (3)',
    openSecretBtn: '开启 AI 密信盒 & 深巷 GPS 导航',
    secretIntro: '解开 AI 智能体生成的诗文谜题，在地图上解锁隐藏在古镇窄巷中的传统老摊。',
    sealTitle: '古镇深巷密信',
    sealSub: 'AI 雷达探测到附近窄巷内藏着一家传承四十年的老摊。点击红蜡封开启密信！',
    tapSealHint: '✨ 点击红色火漆印章拆开信封',
    listenRiddleBtn: '收听 AI 语音朗读密信',
    guessLabel: '🔍 猜出密信中的传统美食：',
    solveAndMapBtn: '解开密信并显示地图',
    directMapBtn: 'GPS 导航',
    nextClueBtn: '获取下一条密信线索 ➔',
    ambassadorTitle: '会安美食文化大使',
    awardedTo: '荣誉证书授予：',
    saveRewardBtn: '保存荣誉证书与电子优惠券',
    savedRewardBtn: '🎉 已存入您的美食护照！'
  },
  ko: {
    headerTitle: '푸드트레일 패스포트',
    unlockAllBtn: '100% 잠금해제',
    passportBadge: '🏆 호이안 미식 홍보대사 여정',
    progressTitle: '미식 정복 진행도:',
    progressHint: '요리를 터치하여 체크인하거나 GPS 지도를 여세요.',
    claimBtn: '보상 받기',
    tabTrails: '🏆 3대 미식 코스',
    tabSecret: '✉️ AI 비밀 편지함 (3)',
    openSecretBtn: 'AI 비밀 편지 열기 & 골목길 GPS 안내',
    secretIntro: 'Agent AI의 시적 수수께끼를 풀고 좁은 골목 속 숨겨진 40년 전통 노점을 찾아보세요.',
    sealTitle: '깊은 골목의 비밀 편지',
    sealSub: 'AI 레이더가 근처 골목에서 전통 노점을 감지했습니다. 붉은 밀랍 인장을 터치해 편지를 여세요!',
    tapSealHint: '✨ 붉은 인장을 터치하여 봉투 열기',
    listenRiddleBtn: 'AI 음성으로 수수께끼 듣기',
    guessLabel: '🔍 비밀 요리 정답 선택:',
    solveAndMapBtn: '단서 풀기 & 지도 보기',
    directMapBtn: 'GPS 길찾기',
    nextClueBtn: '다음 비밀 단서 받기 ➔',
    ambassadorTitle: '호이안 미식 문화 대사',
    awardedTo: '인증서 수여자:',
    saveRewardBtn: '인증서 & E-바우처 저장하기',
    savedRewardBtn: '🎉 패스포트에 저장되었습니다!'
  },
  ja: {
    headerTitle: 'フードトレイル・パスポート',
    unlockAllBtn: '100%解放デモ',
    passportBadge: '🏆 ホイアン食文化アンバサダーの旅',
    progressTitle: '制覇プログレス：',
    progressHint: '料理をタップしてチェックイン、またはGPS地図を開きます。',
    claimBtn: '特典を受取る',
    tabTrails: '🏆 3大グルメコース',
    tabSecret: '✉️ AI 路地裏の密書 (3)',
    openSecretBtn: 'AI密書を開封＆路地裏GPSナビを起動',
    secretIntro: 'Agent AIからの詩的な謎解きをクリアして、細い路地裏に佇む秘伝の屋台へ案内します。',
    sealTitle: '路地裏の秘密の手紙',
    sealSub: 'AIレーダーが近くの路地裏に40年続く老舗屋台を検知しました。赤い封蝋をタップして開封しましょう！',
    tapSealHint: '✨ 赤いシーリングスタンプをタップして開封',
    listenRiddleBtn: 'AI音声で密書を聞く',
    guessLabel: '🔍 密書が示す秘伝の料理は？',
    solveAndMapBtn: '謎を解いて地図を表示',
    directMapBtn: 'GPSナビへ',
    nextClueBtn: '次の手がかりを受け取る ➔',
    ambassadorTitle: 'ホイアン食文化アンバサダー',
    awardedTo: '認定証授与：',
    saveRewardBtn: '認定証＆E-バウチャーを保存',
    savedRewardBtn: '🎉 パスポートに保存しました！'
  },
  es: {
    headerTitle: 'Pasaporte Food-Trail',
    unlockAllBtn: 'Desbloquear 100%',
    passportBadge: '🏆 VIAJE DEL EMBAJADOR CULINARIO',
    progressTitle: 'Progreso conquistado:',
    progressHint: 'Toca un plato para hacer Check-in o abrir el mapa GPS.',
    claimBtn: 'Reclamar Premio',
    tabTrails: '🏆 3 Rutas Culinarias',
    tabSecret: '✉️ Cartas Secretas IA (3)',
    openSecretBtn: 'Abrir Carta Secreta IA y Mapa de Callejón',
    secretIntro: 'Resuelve acertijos poéticos de Agent AI para descubrir puestos ocultos con GPS.',
    sealTitle: 'CARTA SECRETA DEL CALLEJÓN',
    sealSub: '¡Toca el sello de cera roja para abrir el acertijo del callejón antiguo!',
    tapSealHint: '✨ Toca el sello rojo para abrir el sobre',
    listenRiddleBtn: 'Escuchar acertijo con voz IA',
    guessLabel: '🔍 Adivina el plato secreto:',
    solveAndMapBtn: 'Resolver y Ver Mapa',
    directMapBtn: 'Ruta GPS',
    nextClueBtn: 'Siguiente pista secreta ➔',
    ambassadorTitle: 'EMBAJADOR CULINARIO DE HOI AN',
    awardedTo: 'Certificado otorgado a:',
    saveRewardBtn: 'Guardar Certificado y Cupón',
    savedRewardBtn: '🎉 ¡Guardado en tu Pasaporte!'
  },
  ar: {
    headerTitle: 'جواز سفر مسار الطعام',
    unlockAllBtn: 'فتح 100%',
    passportBadge: '🏆 رحلة سفير التراث الغذائي',
    progressTitle: 'تقدم الإنجاز:',
    progressHint: 'اضغط على أي طبق لتسجيل الوصول أو فتح خريطة GPS.',
    claimBtn: 'استلام المكافأة',
    tabTrails: '🏆 3 مسارات تراثية',
    tabSecret: '✉️ رسائل الذكاء الاصطناعي (3)',
    openSecretBtn: 'فتح الرسالة السرية وملاحة الأزقة',
    secretIntro: 'حل الألغاز الشعرية من الذكاء الاصطناعي لاكتشاف الأكشاك المخفية في الأزقة.',
    sealTitle: 'رسالة الزقاق السرية',
    sealSub: 'اضغط على الختم الشمعي الأحمر لفتح الرسالة السرية!',
    tapSealHint: '✨ اضغط على الختم الأحمر لفتح الظرف',
    listenRiddleBtn: 'استمع إلى اللغز بصوت الذكاء الاصطناعي',
    guessLabel: '🔍 خمن الطبق السري:',
    solveAndMapBtn: 'حل اللغز وعرض الخريطة',
    directMapBtn: 'ملاحة GPS',
    nextClueBtn: 'الحصول على الدليل التالي ➔',
    ambassadorTitle: 'سفير التراث الغذائي في هوي آن',
    awardedTo: 'تُمنح الشهادة لـ:',
    saveRewardBtn: 'حفظ الشهادة والقسيمة',
    savedRewardBtn: '🎉 تم الحفظ في جواز سفرك!'
  }
};

// DỮ LIỆU 3 MẬT THƯ HẺM SÂU ĐỒNG BỘ ĐA NGÔN NGỮ
const SECRET_CLUES_LIST = [
  {
    id: 'c1',
    order: '#1',
    distance: '50m',
    lat: 15.8781,
    lng: 108.3269,
    xpBonus: 250,
    bcp47: { vi: 'vi-VN', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR', ja: 'ja-JP', es: 'es-ES', ar: 'ar-SA' },
    content: {
      vi: {
        title: 'Gánh Bánh Đập Cụ Mười (42 Năm Trong Hẻm)',
        riddle: '“Cách bạn 50 mét, trong một con hẻm chỉ vừa một người đi, có một cụ bà đã bán món bánh có tiếng kêu ‘rôm rốp’ này suốt 42 năm. Hãy tìm đến đó!”',
        hint: '💡 Gợi ý AI: Hẻm 68 Phan Chu Trinh • Hai mảnh bánh tráng nướng kẹp bánh ướt chấm mắm nêm.',
        answer: 'Bánh Đập Mắm Nêm',
        options: ['Bánh Đập Mắm Nêm', 'Bánh Bèo Chén', 'Bánh Ít Lá Gai']
      },
      ja: {
        title: 'ムオイおばあちゃんの路地裏バインダップ（42年）',
        riddle: '「50メートル先、人が一人通れるほどの細い路地裏で、42年間『パリパリ』と音を立てる餅菓子を売り続けるおばあちゃんがいます。そこを探し出しましょう！」',
        hint: '💡 AIヒント：ファンチュウチン通り68番路地 • 焼きせんべいと蒸し米シートの二層仕立て。',
        answer: 'バインダップ（割れせんべい）',
        options: ['バインダップ（割れせんべい）', '小鉢バインベオ', 'ホワイトローズ']
      },
      en: {
        title: 'Grandma Muoi’s Alley Cracked Rice Paper (42 Years)',
        riddle: '“50 meters away, down an alley wide enough for just one person, a grandmother has sold this ‘crackling’ rice cake for 42 years. Find her stall!”',
        hint: '💡 AI Hint: Alley 68 Phan Chu Trinh • Toasted rice crackers sandwiching wet steamed rice paper.',
        answer: 'Cracked Rice Paper (Bánh Đập)',
        options: ['Cracked Rice Paper (Bánh Đập)', 'Water Fern Cake', 'White Rose Dumpling']
      },
      zh: {
        title: '十婆四十二年深巷脆拍米饼',
        riddle: '“距离您50米，在一条仅容一人通过的窄巷里，一位老奶奶卖这种‘咔嚓’作响的脆米饼已有42年。快去寻找吧！”',
        hint: '💡 AI 提示：潘周桢街68号窄巷 • 两片烤米饼夹软米皮蘸凤尾鱼酱。',
        answer: '脆拍米饼 (Bánh Đập)',
        options: ['脆拍米饼 (Bánh Đập)', '小碗浮萍粿', '白玫瑰虾饺']
      },
      ko: {
        title: '므어이 할머니의 42년 골목 반답',
        riddle: '“50미터 앞, 한 사람만 겨우 지나는 좁은 골목 안에서 42년 동안 ‘바삭바삭’ 소리가 나는 이 떡을 팔아온 할머니가 계십니다. 그곳을 찾아가 보세요!”',
        hint: '💡 AI 힌트: 판추찐 68번지 골목 • 구운 라이스크래커와 촉촉한 쌀피의 조화.',
        answer: '반답 크래커 (Bánh Đập)',
        options: ['반답 크래커 (Bánh Đập)', '반베오 쌀떡', '화이트 로즈']
      }
    }
  },
  {
    id: 'c2',
    order: '#2',
    distance: '35m',
    lat: 15.8786,
    lng: 108.3283,
    xpBonus: 250,
    content: {
      vi: {
        title: 'Nồi Chè Đậu Ván Đặc Quánh Sau Tường Rêu',
        riddle: '“Đi dọc bức tường vàng rêu phong 35 mét về hướng mạch nước ngàn năm, nơi hương lá dứa quyện cùng hạt đậu ván nấu trên bếp than hồng suốt bốn canh giờ...”',
        hint: '💡 Gợi ý AI: Ngách nhỏ Kiệt Bá Lễ • Gánh chè 4 chiếc ghế đẩu gỗ thấp cạnh giếng cổ.',
        answer: 'Chè Đậu Ván Đặc',
        options: ['Chè Đậu Ván Đặc', 'Chè Hạt Sen', 'Tàu Phớ Đá']
      },
      ja: {
        title: '苔むす黄色い壁裏の濃厚フジマメぜんざい',
        riddle: '「苔むした黄色い壁に沿って千年古井戸へ35メートル。炭火で4時間じっくり煮込まれたフジマメとパンダンリーフの甘い香りが漂う場所へ…」',
        hint: '💡 AIヒント：バーレー古井戸の小路 • 低い木の椅子が4つだけ並ぶ秘伝の甘味屋台。',
        answer: '濃厚フジマメのチェー',
        options: ['濃厚フジマメのチェー', '蓮の実ぜんざい', '冷やし豆花']
      },
      en: {
        title: 'Mossy Wall Thick Hyacinth Bean Sweet Soup',
        riddle: '“Walk 35 meters along the mossy yellow wall toward the thousand-year well, where pandan leaves meet beans simmered over charcoal for four hours...”',
        hint: '💡 AI Hint: Ba Le Well Sub-Alley • Look for 4 low wooden stools near the ancient well.',
        answer: 'Hyacinth Bean Sweet Soup',
        options: ['Hyacinth Bean Sweet Soup', 'Lotus Seed Soup', 'Iced Tofu Pudding']
      },
      zh: {
        title: '苔墙后四小时炭火扁豆浓甜羹',
        riddle: '“沿着青苔黄墙向千年古井走35米，班兰叶清香与炭火慢熬四个时辰的扁豆甜香在巷尾交织……”',
        hint: '💡 AI 提示：巴礼古井小巷 • 古井旁摆着四张低矮木凳的老糖水摊。',
        answer: '炭火扁豆甜羹',
        options: ['炭火扁豆甜羹', '冰糖莲子羹', '冰镇豆腐花']
      },
      ko: {
        title: '이끼 낀 담장 뒤편 진한 까치콩 체 (Chè)',
        riddle: '“이끼 낀 노란 담장을 따라 천년 우물 쪽으로 35미터 걸어가면, 네 시간 동안 숯불에 고아낸 까치콩과 판단잎 향기가 퍼지는 곳이 있습니다...”',
        hint: '💡 AI 힌트: 발레 우물 작은 골목 • 낮은 나무 의자 4개가 놓인 전통 디저트 노점.',
        answer: '까치콩 체 (Chè Đậu Ván)',
        options: ['까치콩 체 (Chè Đậu Ván)', '연꽃씨 체', '아이스 순두부']
      }
    }
  },
  {
    id: 'c3',
    order: '#3',
    distance: '40m',
    lat: 15.8772,
    lng: 108.3261,
    xpBonus: 300,
    content: {
      vi: {
        title: 'Quầy Cao Lầu Khô Hấp Củi Tràm Ông Bảy',
        riddle: '“Dưới giàn hoa giấy trăm năm cách Chùa Cầu 40 bước chân, lắng nghe tiếng củi tràm Cù Lao nổ lách tách và mùi thịt xíu ngũ vị bay ra từ căn bếp nhỏ...”',
        hint: '💡 Gợi ý AI: Hẻm 14 Nguyễn Thị Minh Khai • Sợi mì hấp trên xửng vải truyền thống.',
        answer: 'Cao Lầu Củi Tràm',
        options: ['Cao Lầu Củi Tràm', 'Mì Quảng Gà', 'Bún Mắm Nêm']
      },
      ja: {
        title: 'バイおじいちゃんのチャム島薪蒸し汁なしカオラウ',
        riddle: '「日本橋から40歩、樹齢百年のブーゲンビリアの下で、チャム島の薪がパチパチと爆ぜる音と五香粉チャーシューの香りを辿ってみましょう…」',
        hint: '💡 AIヒント：グエンティミンカイ通り14番路地 • 布せいろで蒸し上げる伝統麺。',
        answer: '薪蒸しカオラウ',
        options: ['薪蒸しカオラウ', '鶏ミークアン', '発酵魚醤ビーフン']
      },
      en: {
        title: 'Uncle Bay’s Melaleuca-Steamed Dry Cao Lau',
        riddle: '“Beneath a century-old bougainvillea 40 steps from the Japanese Bridge, listen for crackling island firewood and five-spice pork wafting from a tiny kitchen...”',
        hint: '💡 AI Hint: Alley 14 Nguyen Thi Minh Khai • Noodles steamed on traditional cloth racks.',
        answer: 'Wood-Steamed Cao Lau',
        options: ['Wood-Steamed Cao Lau', 'Chicken Mi Quang', 'Anchovy Vermicelli']
      },
      zh: {
        title: '七叔百年纸花架下相思木蒸干高楼面',
        riddle: '“距离日本桥四十步的百年三角梅花架下，聆听占婆岛相思木柴火噼啪作响，追随五香叉烧的香气……”',
        hint: '💡 AI 提示：阮氏明开街14号巷 • 传统布笼柴火现蒸高楼面。',
        answer: '柴火蒸高楼面',
        options: ['柴火蒸高楼面', '广南鸡肉面', '鱼露拌米粉']
      },
      ko: {
        title: '바이 할아버지의 참섬 장작 찜 비빔 까오러우',
        riddle: '“내원교에서 40걸음 떨어진 백 년 된 부겐빌레아 꽃나무 아래, 장작불 소리와 오향 차슈 향기가 피어오르는 작은 부엌을 찾아보세요...”',
        hint: '💡 AI 힌트: 응우옌티민카이 14번지 골목 • 천 찜기로 쪄내는 전통 까오러우.',
        answer: '장작 찜 까오러우',
        options: ['장작 찜 까오러우', '닭고기 미꽝', '비빔 쌀국수']
      }
    }
  }
];

// DỮ LIỆU 3 TUYẾN FOOD-TRAIL GẮN ĐÚNG ID MÓN ĂN (ĐỂ BẤM CHỈ ĐƯỜNG LUÔN RA ĐÚNG MÓN ĐÓ)
const TRAILS_MULTILINGUAL = [
  {
    id: 't1',
    xp: 350,
    duration: '1.5h',
    badge: { vi: '🌅 Bản Lĩnh Sáng Sớm', ja: '🌅 朝焼けの美食家', en: '🌅 Morning Explorer', zh: '🌅 古镇晨光食客', ko: '🌅 아침의 미식가' },
    title: { vi: 'Tuyến 1: Sáng Thức Giấc Ở Phố Hội', ja: 'ルート1：古都ホイアンの朝ごはん巡り', en: 'Route 1: Morning Awakening in Hoi An', zh: '路线1：唤醒会安古镇的清晨味蕾', ko: '코스 1: 호이안 올드타운의 아침을 깨우다' },
    stops: [
      { id: 's1', dishId: '2', lat: 15.8780, lng: 108.3285, done: true, name: { vi: 'Bánh Mì Đặc Ruột Phượng', ja: '炭火焼きバインミー・フォン', en: 'Phuong Crispy Baguette', zh: '会安炭烤法棍三明治', ko: '호이안 크리스피 반미' } },
      { id: 's2', dishId: '1', lat: 15.8782, lng: 108.3265, done: true, name: { vi: 'Cơm Gà Phố Cổ Bà Buội', ja: 'ホイアン伝統チキンライス', en: 'Ba Buoi Heritage Chicken Rice', zh: '会安古镇特色鸡饭', ko: '호이안 전통 치킨라이스' } },
      { id: 's3', dishId: '18', lat: 15.8762, lng: 108.3255, done: false, name: { vi: 'Cà Phê Phin Rang Xay Faifo', ja: '自家焙煎ベトナム雫出しコーヒー', en: 'Faifo Roastery Phin Coffee', zh: '古镇滴漏海盐手烘咖啡', ko: '전통 핀 드립 로스터리 커피' } },
    ]
  },
  {
    id: 't2',
    xp: 450,
    duration: '2.0h',
    badge: { vi: '🏅 Nghệ Nhân Giếng Cổ', ja: '🏅 古井戸の継承者', en: '🏅 Ancient Well Master', zh: '🏅 古井遗产匠人', ko: '🏅 고대 우물의 장인' },
    title: { vi: 'Tuyến 2: Bí Ẩn Nước Giếng Cổ Bá Lễ', ja: 'ルート2：千年バーレー古井戸の秘伝料理', en: 'Route 2: Mystery of Ba Le Ancient Well', zh: '路线2：探秘千年巴礼古井水名菜', ko: '코스 2: 천년 발레 고대 우물의 비밀' },
    stops: [
      { id: 's4', dishId: '5', lat: 15.87815, lng: 108.32655, done: true, name: { vi: 'Cao Lầu Cổ Truyền Hội An', ja: 'ホイアン伝統カオラウ', en: 'Traditional Cao Lau Noodles', zh: '会安传统高楼面', ko: '호이안 전통 까오러우' } },
      { id: 's5', dishId: '3', lat: 15.8765, lng: 108.3280, done: false, name: { vi: 'Bánh Xèo Tôm Đất Giếng Bá Lễ', ja: 'クアンナム風パリパリお好み焼き', en: 'Ba Le Crispy Rice Pancake', zh: '广南风味鲜虾脆煎饼', ko: '꽝남식 바삭한 반쎄오' } },
      { id: 's6', dishId: '10', lat: 15.8805, lng: 108.3240, done: false, name: { vi: 'Chè Xí Mà Phù Ông Thiều', ja: '黒ごまの薬膳おしるこ（シーマーフー）', en: 'Black Sesame Herbal Pudding', zh: '古法石磨养生黑芝麻糊', ko: '전통 맷돌 흑임자 한방 죽' } },
    ]
  },
  {
    id: 't3',
    xp: 350,
    duration: '1.5h',
    badge: { vi: '🏮 Thực Thần Phố Đêm', ja: '🏮 ランタン夜市の達人', en: '🏮 Lantern Night Gourmand', zh: '🏮 怀河灯笼夜市食神', ko: '🏮 등불 야시장 미식가' },
    title: { vi: 'Tuyến 3: Dạ Tiệc Đèn Lồng Sông Hoài', ja: 'ルート3：ホアイ川ランタン夜市食べ歩き', en: 'Route 3: Hoai River Lantern Night Feast', zh: '路线3：怀河灯笼夜宴美食之旅', ko: '코스 3: 호아이 강변 등불 야시장 투어' },
    stops: [
      { id: 's7', dishId: '14', lat: 15.8768, lng: 108.3268, done: true, name: { vi: 'Thịt Xiên Nướng Bờ Sông', ja: 'ホアイ川沿いの炭火焼き豚串', en: 'Riverbank Grilled Pork Skewers', zh: '怀河炭烤蜜汁猪肉串', ko: '호아이 강변 숯불 돼지꼬치' } },
      { id: 's8', dishId: '17', lat: 15.87818, lng: 108.32648, done: true, name: { vi: 'Trà Thảo Mộc Cánh Sen Mót', ja: '蓮の花びら添え・9種ハーブ茶', en: 'Mot Lotus Petal Herbal Tea', zh: '荷花瓣九味草本柠檬香茅茶', ko: '연꽃잎 레몬그라스 허브티' } },
      { id: 's9', dishId: '11', lat: 15.8772, lng: 108.3275, done: false, name: { vi: 'Tàu Phớ Nước Đường Gừng', ja: '生姜黒蜜のなめらか豆花', en: 'Warm Ginger Tofu Pudding', zh: '怀河姜汁黑糖手工豆腐花', ko: '생강 흑당 시럽 순두부 푸딩' } },
    ]
  }
];

export default function ExploreScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userName, setUserName] = useState('Trương Trí Trung');
  const [activeSectionTab, setActiveSectionTab] = useState<'trails' | 'secret'>('trails');
  const [trailList, setTrailList] = useState(TRAILS_MULTILINGUAL);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [claimedVoucher, setClaimedVoucher] = useState(false);

  // State cho Hộp Thư Mật Agent AI
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [solvedClueIds, setSolvedClueIds] = useState<string[]>(['c1']);
  const [selectedRiddleOption, setSelectedRiddleOption] = useState<string | null>(null);
  const [letterFeedback, setLetterFeedback] = useState('');
  const [showEmbeddedAlleyMap, setShowEmbeddedAlleyMap] = useState(false);

  const letterScaleAnim = useRef(new Animated.Value(0.75)).current;
  const letterOpacityAnim = useRef(new Animated.Value(0)).current;
  const letterFloatAnim = useRef(new Animated.Value(0)).current;
  const sealRotateAnim = useRef(new Animated.Value(0)).current;

  const langCode = (((i18n.language || 'vi').split('-')[0].toLowerCase()) as LangCode) || 'vi';
  const ui = EXPLORE_I18N[langCode] || EXPLORE_I18N.vi;

  useEffect(() => {
    const loadSettings = async () => {
      const savedTheme = await AsyncStorage.getItem('appThemeMode');
      if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');

      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang && savedLang !== i18n.language) {
        await i18n.changeLanguage(savedLang);
      }

      const storedUser = await AsyncStorage.getItem('userAccount');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setUserName(parsed.name);
      }

      const savedClues = await AsyncStorage.getItem('solvedSecretClues');
      if (savedClues) setSolvedClueIds(JSON.parse(savedClues));
    };
    loadSettings();

    Animated.loop(
      Animated.sequence([
        Animated.timing(letterFloatAnim, { toValue: -6, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(letterFloatAnim, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const getLocalizedClue = (clueObj: typeof SECRET_CLUES_LIST[0]) => {
    const c = (clueObj.content as any)[langCode] || clueObj.content.en || clueObj.content.vi;
    return c;
  };

  const triggerLetterOpenAnimation = (index: number, autoUnseal = false) => {
    setCurrentClueIndex(index);
    setSelectedRiddleOption(null);
    setLetterFeedback('');
    setShowEmbeddedAlleyMap(false);
    setIsEnvelopeOpened(autoUnseal);
    setShowLetterModal(true);

    letterScaleAnim.setValue(0.65);
    letterOpacityAnim.setValue(0);
    sealRotateAnim.setValue(0);

    Animated.parallel([
      Animated.spring(letterScaleAnim, { toValue: 1, friction: 6, tension: 55, useNativeDriver: true }),
      Animated.timing(letterOpacityAnim, { toValue: 1, duration: 360, useNativeDriver: true }),
    ]).start();
  };

  const handleBreakWaxSeal = () => {
    Animated.timing(sealRotateAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start(() => {
      setIsEnvelopeOpened(true);
      letterScaleAnim.setValue(0.88);
      Animated.spring(letterScaleAnim, { toValue: 1, friction: 5, tension: 65, useNativeDriver: true }).start();
    });
  };

  const handleNextSecretClue = () => {
    const nextIdx = (currentClueIndex + 1) % SECRET_CLUES_LIST.length;
    Animated.timing(letterOpacityAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setCurrentClueIndex(nextIdx);
      setSelectedRiddleOption(null);
      setLetterFeedback('');
      setShowEmbeddedAlleyMap(false);
      setIsEnvelopeOpened(true);
      letterScaleAnim.setValue(0.85);
      Animated.parallel([
        Animated.spring(letterScaleAnim, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
        Animated.timing(letterOpacityAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    });
  };

  const speakSecretClue = (clueObj: typeof SECRET_CLUES_LIST[0]) => {
    const loc = getLocalizedClue(clueObj);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${loc.title}. ${loc.riddle}`);
      const bcpMap: Record<string, string> = { vi: 'vi-VN', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR', ja: 'ja-JP', es: 'es-ES', ar: 'ar-SA' };
      u.lang = bcpMap[langCode] || 'vi-VN';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSolveClue = async (clueObj: typeof SECRET_CLUES_LIST[0]) => {
    const loc = getLocalizedClue(clueObj);
    if (selectedRiddleOption !== loc.answer) {
      setLetterFeedback('⚠️ Hãy chọn đúng món ăn bí ẩn được nhắc đến trong mật thư!');
      return;
    }
    if (!solvedClueIds.includes(clueObj.id)) {
      const updated = [...solvedClueIds, clueObj.id];
      setSolvedClueIds(updated);
      await AsyncStorage.setItem('solvedSecretClues', JSON.stringify(updated));
    }
    setLetterFeedback(`🎉 +${clueObj.xpBonus} XP! Đã mở khóa tọa độ GPS dẫn vào hẻm sâu!`);
    setShowEmbeddedAlleyMap(true);
  };

  const toggleStopCompletion = (trailId: string, stopId: string) => {
    setTrailList(prev =>
      prev.map(t => {
        if (t.id !== trailId) return t;
        return { ...t, stops: t.stops.map(s => (s.id === stopId ? { ...s, done: !s.done } : s)) };
      })
    );
  };

  const unlockAllForDemo = () => {
    setTrailList(prev => prev.map(t => ({ ...t, stops: t.stops.map(s => ({ ...s, done: true })) })));
    setShowRewardModal(true);
  };

  const totalStops = trailList.reduce((acc, t) => acc + t.stops.length, 0);
  const completedStops = trailList.reduce((acc, t) => acc + t.stops.filter(s => s.done).length, 0);
  const progressPercent = Math.round((completedStops / totalStops) * 100);
  const isAllCompleted = completedStops === totalStops;

  const currentClueObj = SECRET_CLUES_LIST[currentClueIndex];
  const currentClueLoc = getLocalizedClue(currentClueObj);
  const sealRotation = sealRotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '25deg'] });

  const theme = {
    bg: isDarkMode ? '#120F0D' : '#F6F3EC',
    cardBg: isDarkMode ? '#1C1815' : '#FFFFFF',
    subBg: isDarkMode ? '#120F0D' : '#F3EFE6',
    textMain: isDarkMode ? '#FFFFFF' : '#18181B',
    textSub: isDarkMode ? '#B8B0A8' : '#4B5563',
    accent: isDarkMode ? '#D4AF37' : '#9E7312',
    green: isDarkMode ? '#10B981' : '#047857',
    border: isDarkMode ? '#302924' : '#E2DCD0',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      
      {/* HEADER ĐỒNG BỘ ĐA NGÔN NGỮ */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/' as any)}>
          <Ionicons name="chevron-back" size={24} color={theme.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>{ui.headerTitle}</Text>
        <TouchableOpacity onPress={unlockAllForDemo} style={[styles.demoUnlockBtn, { borderColor: theme.accent }]}>
          <Text style={{ color: theme.accent, fontSize: 11, fontWeight: 'bold' }}>{ui.unlockAllBtn}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        
        {/* BẢNG TIẾN ĐỘ TỔNG GỌN GÀNG */}
        <View style={[styles.masterCard, { backgroundColor: theme.cardBg, borderColor: isAllCompleted ? theme.green : theme.border }]}>
          <View style={styles.masterTopRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.masterBadgeLabel, { color: theme.accent }]}>{ui.passportBadge}</Text>
              <Text style={[styles.masterTitle, { color: theme.textMain }]}>
                {ui.progressTitle} {completedStops}/{totalStops} ({progressPercent}%)
              </Text>
              <Text style={{ color: theme.textSub, fontSize: 12, marginTop: 4 }}>{ui.progressHint}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.chestBtn, { backgroundColor: isAllCompleted ? theme.green : theme.accent }]}
              onPress={() => setShowRewardModal(true)}
            >
              <Ionicons name="gift" size={22} color="#FFFFFF" />
              <Text style={styles.chestBtnText}>{ui.claimBtn}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: isAllCompleted ? theme.green : theme.accent }]} />
          </View>
        </View>

        {/* THANH CHUYỂN TAB TINH GỌN (KHÔNG CÒN BỊ RỐI MẮT) */}
        <View style={[styles.segmentBar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <TouchableOpacity 
            style={[styles.segmentBtn, activeSectionTab === 'trails' && { backgroundColor: '#8B2E2E' }]}
            onPress={() => setActiveSectionTab('trails')}
          >
            <Text style={[styles.segmentBtnText, { color: activeSectionTab === 'trails' ? '#FFFFFF' : theme.textMain }]}>
              {ui.tabTrails}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentBtn, activeSectionTab === 'secret' && { backgroundColor: '#8B2E2E' }]}
            onPress={() => setActiveSectionTab('secret')}
          >
            <Text style={[styles.segmentBtnText, { color: activeSectionTab === 'secret' ? '#FFFFFF' : theme.textMain }]}>
              {ui.tabSecret}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: 3 TUYẾN THỬ THÁCH FOOD-TRAIL (GỌN GÀNG & DẪN ĐÚNG TỌA ĐỘ MÓN ĂN) */}
        {activeSectionTab === 'trails' && (
          <View>
            {trailList.map((trail) => {
              const doneCount = trail.stops.filter(s => s.done).length;
              const isTrailComplete = doneCount === trail.stops.length;
              const trTitle = (trail.title as any)[langCode] || trail.title.en || trail.title.vi;
              const trBadge = (trail.badge as any)[langCode] || trail.badge.en || trail.badge.vi;

              return (
                <View key={trail.id} style={[styles.trailCard, { backgroundColor: theme.cardBg, borderColor: isTrailComplete ? theme.green : theme.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.badgePill, { backgroundColor: isTrailComplete ? theme.green : '#8B2E2E' }]}>
                      <Text style={styles.badgePillText}>{trBadge}</Text>
                    </View>
                    <Text style={{ color: theme.accent, fontSize: 12, fontWeight: 'bold' }}>+{trail.xp} XP • {trail.duration}</Text>
                  </View>

                  <Text style={[styles.trailName, { color: theme.textMain }]}>{trTitle}</Text>

                  <View style={[styles.stopsContainer, { backgroundColor: theme.subBg, borderColor: theme.border }]}>
                    {trail.stops.map((stop, idx) => {
                      const stopTitle = (stop.name as any)[langCode] || stop.name.en || stop.name.vi;
                      return (
                        <View 
                          key={stop.id} 
                          style={[styles.stopRow, idx < trail.stops.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
                        >
                          <TouchableOpacity 
                            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                            onPress={() => toggleStopCompletion(trail.id, stop.id)}
                          >
                            <Ionicons 
                              name={stop.done ? "checkmark-circle" : "ellipse-outline"} 
                              size={22} 
                              color={stop.done ? theme.green : theme.textSub} 
                            />
                            <Text style={{ color: theme.textMain, fontSize: 14, fontWeight: 'bold', marginLeft: 10, flex: 1 }}>
                              {idx + 1}. {stopTitle}
                            </Text>
                          </TouchableOpacity>

                          {/* Nút mở đúng tọa độ món ăn đó trên Map (Không bị nhảy về Cơm Gà Bà Buội) */}
                          <TouchableOpacity 
                            style={[styles.gpsMiniBtn, { borderColor: theme.accent }]}
                            onPress={() => router.push({
                              pathname: '/map' as any,
                              params: { id: stop.dishId, name: stopTitle, lat: stop.lat, lng: stop.lng, autoSpeak: '1' }
                            })}
                          >
                            <Ionicons name="navigate" size={12} color={theme.accent} />
                            <Text style={{ color: theme.accent, fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>GPS</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 2: HỘP THƯ MẬT AGENT AI & BÍ MẬT HẺM SÂU (DẪN ĐÚNG TỌA ĐỘ HẺM) */}
        {activeSectionTab === 'secret' && (
          <View style={[styles.secretContainerCard, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
            <Text style={[styles.secretSectionSub, { color: theme.textSub }]}>{ui.secretIntro}</Text>

            {SECRET_CLUES_LIST.map((clue, idx) => {
              const isSolved = solvedClueIds.includes(clue.id);
              const loc = getLocalizedClue(clue);
              return (
                <TouchableOpacity
                  key={clue.id}
                  activeOpacity={0.85}
                  style={[
                    styles.secretItemRow,
                    idx < SECRET_CLUES_LIST.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
                  ]}
                  onPress={() => triggerLetterOpenAnimation(idx, false)}
                >
                  <View style={[styles.secretOrderCircle, isSolved && { backgroundColor: theme.green }]}>
                    <Text style={styles.secretOrderText}>{isSolved ? '✓' : clue.order}</Text>
                  </View>

                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={[styles.secretItemTitle, { color: theme.textMain }]} numberOfLines={1}>
                      {loc.title}
                    </Text>
                    <Text style={[styles.secretItemSnippet, { color: theme.textSub }]} numberOfLines={2}>
                      {loc.riddle}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.secretDistanceText, { color: theme.green }]}>{clue.distance}</Text>
                    <Ionicons name="mail-open-outline" size={16} color={theme.accent} style={{ marginTop: 4 }} />
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.openSecretBoxBtn}
              activeOpacity={0.85}
              onPress={() => triggerLetterOpenAnimation(0, false)}
            >
              <Ionicons name="sparkles" size={18} color="#FDE68A" />
              <Text style={styles.openSecretBoxBtnText}>{ui.openSecretBtn}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL HIỆU ỨNG ĐỘNG LÁ THƯ MẬT AGENT AI */}
      <Modal visible={showLetterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.letterAnimatedWrapper,
              {
                opacity: letterOpacityAnim,
                transform: [{ scale: letterScaleAnim }, { translateY: letterFloatAnim }]
              }
            ]}
          >
            {!isEnvelopeOpened ? (
              <View style={styles.envelopeClosedCard}>
                <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowLetterModal(false)}>
                  <Ionicons name="close" size={24} color="#FDE68A" />
                </TouchableOpacity>

                <Text style={styles.envelopeTitle}>{ui.sealTitle}</Text>
                <Text style={styles.envelopeSub}>{ui.sealSub}</Text>

                <TouchableOpacity activeOpacity={0.85} onPress={handleBreakWaxSeal} style={styles.envelopeBody}>
                  <Animated.View style={[styles.waxSealButton, { transform: [{ rotate: sealRotation }] }]}>
                    <Ionicons name="mail-unread" size={30} color="#FDE68A" />
                    <Text style={styles.waxSealText}>{currentClueObj.order}</Text>
                  </Animated.View>
                  <Text style={styles.tapSealHint}>{ui.tapSealHint}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.parchmentCard}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.parchmentTopRow}>
                    <View style={styles.parchmentOrderBadge}>
                      <Ionicons name="compass" size={14} color="#FFF" />
                      <Text style={styles.parchmentOrderText}>{currentClueObj.order} • {currentClueObj.distance}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowLetterModal(false)}>
                      <Ionicons name="close-circle" size={26} color="#5C4033" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.parchmentHeading}>{currentClueLoc.title}</Text>

                  <View style={styles.riddlePoemBox}>
                    <Text style={styles.riddlePoemText}>{currentClueLoc.riddle}</Text>
                    <TouchableOpacity style={styles.listenPoemBtn} onPress={() => speakSecretClue(currentClueObj)}>
                      <Ionicons name="volume-high" size={16} color="#8B2E2E" />
                      <Text style={styles.listenPoemBtnText}>{ui.listenRiddleBtn}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.aiHintText}>{currentClueLoc.hint}</Text>

                  <Text style={styles.solveTitle}>{ui.guessLabel}</Text>
                  <View style={styles.optionsRow}>
                    {currentClueLoc.options.map((opt: string) => {
                      const active = selectedRiddleOption === opt;
                      return (
                        <TouchableOpacity
                          key={opt}
                          style={[styles.optionPill, active && styles.optionPillActive]}
                          onPress={() => setSelectedRiddleOption(opt)}
                        >
                          <Text style={[styles.optionPillText, active && { color: '#FFFFFF' }]}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {letterFeedback ? <Text style={styles.letterFeedbackText}>{letterFeedback}</Text> : null}

                  {showEmbeddedAlleyMap && Platform.OS === 'web' && (
                    <View style={styles.embeddedMapContainer}>
                      {/* @ts-ignore */}
                      <iframe
                        width="100%"
                        height="145"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${currentClueObj.lat},${currentClueObj.lng}&z=18&output=embed`}
                      />
                    </View>
                  )}

                  <View style={styles.letterActionsRow}>
                    <TouchableOpacity style={styles.solveBtn} onPress={() => handleSolveClue(currentClueObj)}>
                      <Ionicons name="key" size={16} color="#FFFFFF" />
                      <Text style={styles.solveBtnText}>{ui.solveAndMapBtn}</Text>
                    </TouchableOpacity>

                    {/* TRUYỀN ĐÚNG clueId SANG MAP ĐỂ MỞ ĐÚNG GÁNH HÀNG TRONG HẺM */}
                    <TouchableOpacity
                      style={styles.goFullMapBtn}
                      onPress={() => {
                        setShowLetterModal(false);
                        router.push({
                          pathname: '/map' as any,
                          params: {
                            clueId: currentClueObj.id,
                            name: currentClueLoc.title,
                            desc: currentClueLoc.riddle,
                            lat: currentClueObj.lat,
                            lng: currentClueObj.lng,
                            autoWalk: '1',
                            autoSpeak: '1'
                          }
                        });
                      }}
                    >
                      <Ionicons name="navigate" size={16} color="#8B2E2E" />
                      <Text style={styles.goFullMapBtnText}>{ui.directMapBtn}</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.nextClueBtn} onPress={handleNextSecretClue}>
                    <Ionicons name="refresh-circle" size={18} color="#D4AF37" />
                    <Text style={styles.nextClueBtnText}>{ui.nextClueBtn}</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* POPUP PHẦN THƯỞNG ĐẠI SỨ */}
      <Modal visible={showRewardModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowRewardModal(false)}>
              <Ionicons name="close" size={24} color={theme.textMain} />
            </TouchableOpacity>

            <Ionicons name="trophy" size={52} color="#D4AF37" style={{ marginBottom: 6 }} />
            <Text style={[styles.modalTitle, { color: theme.textMain }]}>{ui.ambassadorTitle}</Text>
            <Text style={{ color: theme.accent, fontSize: 14, fontWeight: 'bold', marginBottom: 16 }}>
              {ui.awardedTo} {userName}
            </Text>

            <View style={[styles.rewardBox, { backgroundColor: theme.subBg, borderColor: theme.green }]}>
              <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg' }} style={styles.qrMini} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rewardTitle, { color: theme.green }]}>E-Voucher -20% • HOIANVIP2026</Text>
                <Text style={{ color: theme.textSub, fontSize: 12 }}>VIP Culinary Ambassador Pass & Secret Alley Access</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.claimBtn, { backgroundColor: claimedVoucher ? theme.green : '#D4AF37' }]} 
              onPress={() => { setClaimedVoucher(true); setTimeout(() => setShowRewardModal(false), 800); }}
            >
              <Text style={{ color: claimedVoucher ? '#FFFFFF' : '#120F0D', fontSize: 14, fontWeight: 'bold' }}>
                {claimedVoucher ? ui.savedRewardBtn : ui.saveRewardBtn}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 4 }, 
  headerTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'serif' },
  demoUnlockBtn: { borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  content: { padding: 18 },
  
  masterCard: { padding: 16, borderRadius: 20, borderWidth: 1.5, marginBottom: 14 },
  masterTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  masterBadgeLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5, marginBottom: 4 },
  masterTitle: { fontSize: 17, fontWeight: 'bold', fontFamily: 'serif' },
  chestBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chestBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', marginTop: 3 },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },

  segmentBar: { flexDirection: 'row', padding: 5, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentBtnText: { fontSize: 13, fontWeight: 'bold' },

  trailCard: { borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgePillText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 },
  trailName: { fontSize: 16, fontWeight: 'bold', fontFamily: 'serif', marginBottom: 12 },
  stopsContainer: { borderRadius: 12, paddingHorizontal: 12, borderWidth: 1 },
  stopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  gpsMiniBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, marginLeft: 8 },

  secretContainerCard: { borderRadius: 20, padding: 16, borderWidth: 1.5 },
  secretSectionSub: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  secretItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  secretOrderCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  secretOrderText: { color: '#120F0D', fontWeight: '900', fontSize: 13 },
  secretItemTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  secretItemSnippet: { fontSize: 12, fontStyle: 'italic', lineHeight: 17 },
  secretDistanceText: { fontSize: 13, fontWeight: 'bold' },
  openSecretBoxBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B2E2E', paddingVertical: 14, borderRadius: 14, marginTop: 12 },
  openSecretBoxBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  letterAnimatedWrapper: { width: '100%', maxWidth: 420 },
  envelopeClosedCard: { backgroundColor: '#231712', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: '#D4AF37' },
  envelopeTitle: { color: '#FDE68A', fontSize: 20, fontWeight: '900', fontFamily: 'serif', marginBottom: 8, marginTop: 8, textAlign: 'center' },
  envelopeSub: { color: '#E5E7EB', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  envelopeBody: { width: '100%', backgroundColor: '#3A231B', borderRadius: 18, paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center', borderWidth: 1.5, borderColor: '#D4AF37' },
  waxSealButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#991B1B', borderWidth: 3, borderColor: '#FDE68A', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  waxSealText: { color: '#FDE68A', fontSize: 11, fontWeight: '900', marginTop: 2 },
  tapSealHint: { color: '#FDE68A', fontSize: 12, fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center' },

  parchmentCard: { backgroundColor: '#FBF3E4', borderRadius: 24, padding: 20, borderWidth: 3, borderColor: '#B45309', maxHeight: 610 },
  parchmentTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  parchmentOrderBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B2E2E', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  parchmentOrderText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', marginLeft: 5 },
  parchmentHeading: { color: '#3E2723', fontSize: 18, fontWeight: 'bold', fontFamily: 'serif', marginBottom: 10 },
  riddlePoemBox: { backgroundColor: '#F3E5AB', padding: 14, borderRadius: 14, borderLeftWidth: 4, borderLeftColor: '#8B2E2E', marginBottom: 10 },
  riddlePoemText: { color: '#271911', fontSize: 13, lineHeight: 20, fontStyle: 'italic', fontWeight: '600' },
  listenPoemBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, alignSelf: 'flex-start', backgroundColor: 'rgba(139, 46, 46, 0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  listenPoemBtnText: { color: '#8B2E2E', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
  aiHintText: { color: '#047857', fontSize: 12, fontWeight: 'bold', lineHeight: 18, marginBottom: 12 },
  solveTitle: { color: '#3E2723', fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  optionPill: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: '#E6D7B9', borderWidth: 1, borderColor: '#B45309' },
  optionPillActive: { backgroundColor: '#8B2E2E', borderColor: '#8B2E2E' },
  optionPillText: { color: '#3E2723', fontSize: 12, fontWeight: 'bold' },
  letterFeedbackText: { color: '#047857', fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  embeddedMapContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#B45309', marginBottom: 12 },
  letterActionsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  solveBtn: { flex: 1.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#047857', paddingVertical: 12, borderRadius: 12 },
  solveBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  goFullMapBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3E5AB', borderWidth: 1.5, borderColor: '#8B2E2E', paddingVertical: 12, borderRadius: 12 },
  goFullMapBtnText: { color: '#8B2E2E', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  nextClueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#271911', paddingVertical: 12, borderRadius: 12 },
  nextClueBtnText: { color: '#FDE68A', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },

  modalContent: { width: '100%', maxWidth: 420, borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 2 },
  closeModalBtn: { position: 'absolute', top: 14, right: 14, padding: 5 },
  modalTitle: { fontSize: 19, fontWeight: '900', fontFamily: 'serif', textAlign: 'center', marginBottom: 4 },
  rewardBox: { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 14, borderRadius: 16, marginBottom: 14, borderWidth: 1 },
  rewardTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  qrMini: { width: 56, height: 56, marginRight: 12, backgroundColor: '#FFF', padding: 4, borderRadius: 8 },
  claimBtn: { width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center' }
});