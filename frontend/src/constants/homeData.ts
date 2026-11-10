export type TimeSlotKey = "morning" | "noon" | "night";

export interface LocalizedText {
  vi: string;
  en: string;
  zh: string;
  ko: string;
  ja: string;
  [key: string]: string;
}

export interface ScheduleStop {
  id: string;
  order: number;
  dishName: LocalizedText;
  shopName: LocalizedText;
  hours: string;
  lat: number;
  lng: number;
}

export interface DietaryOption {
  id: string;
  label: LocalizedText;
  voiceText: string;
}

export const QUICK_CULINARY_DICT: { patterns: string[]; vi: string }[] = [
  {
    patterns: [
      "no onion",
      "without onion",
      "不要洋葱",
      "不放洋葱",
      "양파 빼",
      "양파 없이",
      "玉ねぎ抜き",
      "たまねぎ抜き",
      "không hành tây",
    ],
    vi: "không bỏ hành tây",
  },
  {
    patterns: [
      "no scallion",
      "no green onion",
      "no spring onion",
      "不要葱",
      "不放葱",
      "파 빼",
      "파 없이",
      "ネギ抜き",
      "ねぎ抜き",
      "không hành lá",
      "không hành",
    ],
    vi: "không bỏ hành lá",
  },
  {
    patterns: [
      "no cilantro",
      "no coriander",
      "不要香菜",
      "不放香菜",
      "고수 빼",
      "고수 없이",
      "パクチー抜き",
      "香菜抜き",
      "không rau mùi",
      "không ngò",
    ],
    vi: "không bỏ rau mùi và hành ngò",
  },
  {
    patterns: [
      "no garlic",
      "without garlic",
      "不要蒜",
      "不放蒜",
      "마늘 빼",
      "마늘 없이",
      "ニンニク抜き",
      "にんにく抜き",
      "không tỏi",
    ],
    vi: "không bỏ tỏi",
  },
  {
    patterns: [
      "less sugar",
      "no sugar",
      "low sugar",
      "少糖",
      "无糖",
      "설탕 적게",
      "설탕 빼",
      "甘さ控えめ",
      "砂糖抜き",
      "ít đường",
      "không đường",
    ],
    vi: "giảm ngọt, cho ít đường",
  },
  {
    patterns: [
      "less salt",
      "low salt",
      "no salt",
      "少盐",
      "싱겁게",
      "소금 적게",
      "塩分控えめ",
      "ít mặn",
      "nhạt hơn",
    ],
    vi: "nêm nhạt, cho ít muối",
  },
  {
    patterns: [
      "no shrimp",
      "shrimp allergy",
      "seafood allergy",
      "no seafood",
      "海鲜过敏",
      "不要虾",
      "새우 알레르기",
      "해산물 알레르기",
      "새우 빼",
      "エビ抜き",
      "甲殻類アレルギー",
      "dị ứng hải sản",
      "không tôm",
    ],
    vi: "tôi dị ứng hải sản, xin không bỏ tôm cua",
  },
  {
    patterns: [
      "no pork",
      "without pork",
      "no meat",
      "不要猪肉",
      "不吃猪肉",
      "돼지고기 빼",
      "豚肉抜き",
      "không thịt heo",
      "không mỡ",
    ],
    vi: "không bỏ thịt heo và mỡ heo",
  },
  {
    patterns: [
      "no fish sauce",
      "without fish sauce",
      "不要鱼露",
      "피쉬소스 빼",
      "느억맘 빼",
      "魚醤抜き",
      "ヌクマム抜き",
      "không nước mắm",
    ],
    vi: "không dùng nước mắm",
  },
  {
    patterns: [
      "less oil",
      "no oil",
      "少油",
      "기름 적게",
      "油少なめ",
      "ít dầu mỡ",
    ],
    vi: "chế biến ít dầu mỡ",
  },
  {
    patterns: [
      "less ice",
      "no ice",
      "少冰",
      "去冰",
      "얼음 적게",
      "얼음 빼",
      "氷少なめ",
      "氷抜き",
      "ít đá",
      "không đá",
    ],
    vi: "cho ít đá hoặc không đá",
  },
];

export function translateNoteInstant(rawText: string): string {
  const clean = rawText.trim();
  if (!clean) return "";
  const lower = clean.toLowerCase();
  const matchedVi: string[] = [];
  for (const item of QUICK_CULINARY_DICT) {
    if (item.patterns.some((p) => lower.includes(p))) {
      matchedVi.push(item.vi);
    }
  }
  if (matchedVi.length > 0) return matchedVi.join(", ");
  return clean;
}

export const PAGE_UI: Record<
  string,
  {
    brandTitle: string;
    brandSub: string;
    qrMobileBtn: string;
    loginBtn: string;
    registerBtn: string;
    logoutBtn: string;
    searchPlaceholder: string;
    catAll: string;
    catMain: string;
    catSnack: string;
    catStreet: string;
    catSweet: string;
    listenBtn: string;
    qrShortBtn: string;
    assistantTitle: string;
    practicalBadge: string;
    assistantSub: string;
    slotMorning: string;
    slotNoon: string;
    slotNight: string;
    checkInDone: string;
    checkInNow: string;
    walkAllThreeBtn: string;
    dietaryTitle: string;
    dietarySub: string;
    addCustomNoteBtn: string;
    customNotePlaceholder: string;
    customNoteTranslatedPrefix: string;
    openTasteCardBtn: string;
    playVoiceModalBtn: string;
    stopVoiceModalBtn: string;
    directionsModalBtn: string;
    closeBtn: string;
    tasteModalBadge: string;
    tasteModalHeading: string;
    tasteModalSub: string;
    tasteNormalText: string;
    replayChefVoiceBtn: string;
    closeTasteCardBtn: string;
    qrModalTitle: string;
    qrModalDesc: string;
    closeQrModalBtn: string;
    spamCheckInWarning: string;
    mapTriggerBtn?: string;
    mapModalTitle?: string;
    mapModalSubtitle?: string;
    closeModalBtn?: string;
  }
> = {
  vi: {
    mapTriggerBtn: "Bản Đồ & GPS",
    mapModalTitle: "THEO DẤU VỊ HỘI — BẢN ĐỒ & CHỈ ĐƯỜNG GPS",
    mapModalSubtitle: "Định vị GPS tức thời · Quét bán kính · Chỉ đường thực tế OSRM",
    closeModalBtn: "✕ Đóng",
    brandTitle: "THEO DẤU VỊ HỘI",
    brandSub: "Thuyết Minh Tự Động Đa Ngôn Ngữ",
    qrMobileBtn: "Quét QR Mobile",
    loginBtn: "Đăng nhập",
    registerBtn: "Đăng ký",
    logoutBtn: "Đăng xuất",
    searchPlaceholder: "Tìm món ăn Hội An...",
    catAll: "Tất cả (15)",
    catMain: "Món chính",
    catSnack: "Bánh & Ăn vặt",
    catStreet: "Đường phố",
    catSweet: "Chè & Đồ uống",
    listenBtn: "Thuyết minh",
    qrShortBtn: "Mã QR",
    assistantTitle: "Trợ Lý Lịch Trình & Thẻ Khẩu Vị",
    practicalBadge: "THỰC TIỄN",
    assistantSub:
      "Gợi ý thực đơn theo 3 khung giờ trong ngày & tạo Thẻ khẩu vị giao tiếp trực tiếp với chủ quán Hội An.",
    slotMorning: "Buổi Sáng",
    slotNoon: "Buổi Trưa",
    slotNight: "Phố Đêm",
    checkInDone: "Đã Check-in",
    checkInNow: "Check-in Ngay",
    walkAllThreeBtn: "Dẫn Đường Đi Bộ Cả 3 Trạm Trong Lịch Trình",
    dietaryTitle: "Thẻ Khẩu Vị & Dị Ứng Giao Tiếp Chủ Quán",
    dietarySub:
      "Chọn lưu ý ăn uống để tạo Thẻ chữ lớn & phát Giọng đọc AI cho đầu bếp tại Hội An:",
    addCustomNoteBtn:
      "+ Thêm ghi chú khẩu vị khác (Dịch & phát giọng đọc Tiếng Việt)",
    customNotePlaceholder:
      "Nhập yêu cầu thêm (VD: Không hành ngò, ít mỡ, không tỏi...)",
    customNoteTranslatedPrefix: "Nội dung phát Tiếng Việt cho chủ quán:",
    openTasteCardBtn: "Mở Thẻ Đưa Chủ Quán Xem & Phát Giọng Đọc AI",
    playVoiceModalBtn: "Phát Giọng Đọc",
    stopVoiceModalBtn: "Dừng Phát Giọng Đọc",
    directionsModalBtn: "Chỉ đường Google Maps",
    closeBtn: "Đóng",
    tasteModalBadge: "THẺ GIAO TIẾP CHỦ QUÁN HỘI AN",
    tasteModalHeading: "Xin chào Cô / Chú chủ quán!",
    tasteModalSub: "Nhờ quán chế biến giúp món ăn theo lưu ý khẩu vị sau:",
    tasteNormalText: "Ăn uống bình thường, không kiêng cữ",
    replayChefVoiceBtn: "Phát Lại Giọng Đọc AI Cho Đầu Bếp",
    closeTasteCardBtn: "Đóng Thẻ Khẩu Vị",
    qrModalTitle: "Quét Mã QR Trên Điện Thoại",
    qrModalDesc:
      "Dùng Camera điện thoại hoặc Zalo quét mã QR dưới đây để mở ngay giao diện Mobile thuyết minh tự động",
    closeQrModalBtn: "Đóng cửa sổ QR",
    spamCheckInWarning: "Bạn đang thao tác quá nhanh! Vui lòng chờ 2 giây trước khi bấm lại.",
  },
  en: {
    mapTriggerBtn: "Map & GPS",
    mapModalTitle: "FLAVORS OF HOI AN — GPS MAP & DIRECTIONS",
    mapModalSubtitle: "Real-time GPS · Radius Scanner · Turn-by-turn OSRM",
    closeModalBtn: "✕ Close",
    brandTitle: "THEO DẤU VỊ HỘI",
    brandSub: "Multilingual Automated Audio Guide",
    qrMobileBtn: "Mobile QR Code",
    loginBtn: "Sign in",
    registerBtn: "Sign up",
    logoutBtn: "Log out",
    searchPlaceholder: "Search Hoi An dishes...",
    catAll: "All (15)",
    catMain: "Main Dishes",
    catSnack: "Cakes & Snacks",
    catStreet: "Street Food",
    catSweet: "Sweet Soup & Drinks",
    listenBtn: "Audio Guide",
    qrShortBtn: "QR Code",
    assistantTitle: "Itinerary Assistant & Dietary Card",
    practicalBadge: "PRACTICAL",
    assistantSub:
      "Recommended menus for 3 daily time slots & Dietary Card to communicate directly with Hoi An restaurant owners.",
    slotMorning: "Morning",
    slotNoon: "Midday",
    slotNight: "Night Town",
    checkInDone: "Checked In",
    checkInNow: "Check-in Now",
    walkAllThreeBtn: "Walking Directions for All 3 Stops (Stop 1 -> 2 -> 3)",
    dietaryTitle: "Dietary & Allergy Communication Card",
    dietarySub:
      "Select dietary preferences to display a large-text card & play Vietnamese audio for the chef in Hoi An:",
    addCustomNoteBtn:
      "+ Add custom dietary note (Auto-translated to Vietnamese voice)",
    customNotePlaceholder:
      "Type any extra request (e.g. No onion, no cilantro, less sugar...)",
    customNoteTranslatedPrefix: "Vietnamese voice for Chef:",
    openTasteCardBtn: "Open Chef Card & Play AI Voice",
    playVoiceModalBtn: "Play Voice Narration",
    stopVoiceModalBtn: "Stop Voice Narration",
    directionsModalBtn: "Google Maps Directions",
    closeBtn: "Close",
    tasteModalBadge: "COMMUNICATION CARD FOR HOI AN CHEF",
    tasteModalHeading: "Hello Restaurant Owner / Chef!",
    tasteModalSub:
      "Please kindly prepare my dish with the following dietary notes:",
    tasteNormalText: "Normal diet, no restrictions",
    replayChefVoiceBtn: "Replay Vietnamese Voice for Chef",
    closeTasteCardBtn: "Close Dietary Card",
    qrModalTitle: "Scan QR Code on Mobile",
    qrModalDesc:
      "Use your phone camera to scan the QR code below to open the automated mobile audio guide",
    closeQrModalBtn: "Close QR Window",
    spamCheckInWarning: "You're doing that too fast! Please wait 2 seconds before tapping again.",
  },
  zh: {
    mapTriggerBtn: "地图与GPS",
    mapModalTitle: "寻味会安 — GPS地图与路线指引",
    mapModalSubtitle: "即时GPS定位 · 半径雷达探测 · OSRM实境导航 · TSP最佳美食巡回路线",
    closeModalBtn: "✕ 关闭",
    brandTitle: "THEO DẤU VỊ HỘI",
    brandSub: "多语言自动语音导览系统",
    qrMobileBtn: "手机扫码",
    loginBtn: "登录",
    registerBtn: "注册",
    logoutBtn: "退出登录",
    searchPlaceholder: "搜索会安美食...",
    catAll: "全部 (15)",
    catMain: "主食名菜",
    catSnack: "糕点小吃",
    catStreet: "街头风味",
    catSweet: "甜品饮品",
    listenBtn: "语音解说",
    qrShortBtn: "二维码",
    assistantTitle: "行程助手与饮食忌口卡",
    practicalBadge: "实用功能",
    assistantSub:
      "按早、午、晚三个时段推荐菜单，并生成大字版饮食忌口卡直接与会安店主沟通。",
    slotMorning: "清晨早点",
    slotNoon: "午间正餐",
    slotNight: "古镇夜市",
    checkInDone: "已打卡",
    checkInNow: "立即打卡",
    walkAllThreeBtn: "开启本时段全部 3 站步行导航 (第 1 -> 2 -> 3 站)",
    dietaryTitle: "展示给店主的饮食偏好与过敏沟通卡",
    dietarySub: "勾选饮食注意事项以生成大字卡，并向会安厨师播放越南语语音：",
    addCustomNoteBtn: "+ 添加其他饮食备注（自动翻译并朗读越南语）",
    customNotePlaceholder:
      "输入其他忌口要求（如：不要香菜、不要洋葱、少糖...）",
    customNoteTranslatedPrefix: "已翻译为越南语供厨师收听：",
    openTasteCardBtn: "打开店主沟通卡并播放语音",
    playVoiceModalBtn: "播放语音讲解",
    stopVoiceModalBtn: "停止语音讲解",
    directionsModalBtn: "谷歌地图导航",
    closeBtn: "关闭",
    tasteModalBadge: "会安餐厅店主沟通卡",
    tasteModalHeading: "店主您好！",
    tasteModalSub: "烹制菜品时请协助留意以下饮食要求：",
    tasteNormalText: "正常饮食，无特殊忌口",
    replayChefVoiceBtn: "重新向厨师播放越南语语音",
    closeTasteCardBtn: "关闭忌口卡",
    qrModalTitle: "使用手机扫描二维码",
    qrModalDesc: "使用手机相机扫描下方二维码，即可打开移动端多语言自动语音导览",
    closeQrModalBtn: "关闭二维码窗口",
    spamCheckInWarning: "操作过于频繁！请等待 2 秒后再试。",
  },
  ko: {
    mapTriggerBtn: "지도 & GPS",
    mapModalTitle: "호이안의 맛 — GPS 지도 & 길찾기",
    mapModalSubtitle: "실시간 GPS 위치 · 반경 스캔 · OSRM 실시간 경로 · TSP 최적 맛집 투어 경로",
    closeModalBtn: "✕ 닫기",
    brandTitle: "THEO DẤU VỊ HỘI",
    brandSub: "다국어 자동 음성 가이드",
    qrMobileBtn: "모바일 QR 코드",
    loginBtn: "로그인",
    registerBtn: "회원가입",
    logoutBtn: "로그아웃",
    searchPlaceholder: "호이안 요리 검색...",
    catAll: "전체 (15)",
    catMain: "메인 요리",
    catSnack: "전통 떡 & 간식",
    catStreet: "길거리 음식",
    catSweet: "체(디저트) & 음료",
    listenBtn: "음성 해설",
    qrShortBtn: "QR 코드",
    assistantTitle: "일정 도우미 & 식단 소통 카드",
    practicalBadge: "실용 기능",
    assistantSub:
      "하루 3개 시간대별 추천 코스와 호이안 식당 주인에게 직접 보여줄 식단 소통 카드를 생성합니다.",
    slotMorning: "아침 시간",
    slotNoon: "점심 시간",
    slotNight: "야시장 밤",
    checkInDone: "체크인 완료",
    checkInNow: "체크인하기",
    walkAllThreeBtn: "일정 내 3개 정류장 전체 도보 길찾기 (1 -> 2 -> 3번)",
    dietaryTitle: "식당 주인 소통용 식단 & 알레르기 카드",
    dietarySub:
      "식이 유의사항을 선택하여 호이안 요리사에게 큰 글씨 카드와 베트남어 음성을 전달하세요:",
    addCustomNoteBtn:
      "+ 기타 식단 요청사항 추가 (베트남어 자동 번역 및 음성 안내)",
    customNotePlaceholder:
      "추가 요청 입력 (예: 고수 빼주세요, 양파 빼주세요, 덜 달게...)",
    customNoteTranslatedPrefix: "요리사용 베트남어 번역:",
    openTasteCardBtn: "주방장 제시용 카드 열기 & 음성 재생",
    playVoiceModalBtn: "음성 해설 재생",
    stopVoiceModalBtn: "음성 해설 중지",
    directionsModalBtn: "구글 지도 길찾기",
    closeBtn: "닫기",
    tasteModalBadge: "호이안 식당 주인 소통 카드",
    tasteModalHeading: "사장님 안녕하세요!",
    tasteModalSub: "음식 조리 시 아래 식이 요청사항을 참고해 주세요:",
    tasteNormalText: "가리는 음식 없이 모두 잘 먹습니다",
    replayChefVoiceBtn: "요리사를 위해 베트남어 음성 다시 재생",
    closeTasteCardBtn: "식단 카드 닫기",
    qrModalTitle: "휴대폰으로 QR 코드 스캔",
    qrModalDesc:
      "휴대폰 카메라로 아래 QR 코드를 스캔하면 모바일 자동 음성 가이드가 열립니다",
    closeQrModalBtn: "QR 창 닫기",
    spamCheckInWarning: "작업이 너무 빠릅니다! 2초 후 다시 시도해 주세요.",
  },
  ja: {
    mapTriggerBtn: "地図 & GPS",
    mapModalTitle: "ホイアンの味 — GPS地図＆ルート案内",
    mapModalSubtitle: "リアルタイムGPS測位 · 半径レーダースキャン · OSRM実走ルート案内 · TSP最適グルメツアールート",
    closeModalBtn: "✕ 閉じる",
    brandTitle: "THEO DẤU VỊ HỘI",
    brandSub: "多言語自動音声グルメガイド",
    qrMobileBtn: "モバイルQR",
    loginBtn: "ログイン",
    registerBtn: "新規登録",
    logoutBtn: "ログアウト",
    searchPlaceholder: "ホイアンの料理を検索...",
    catAll: "すべて (15)",
    catMain: "メイン料理",
    catSnack: "餅・軽食",
    catStreet: "屋台グルメ",
    catSweet: "チェー・飲み物",
    listenBtn: "音声ガイド",
    qrShortBtn: "QRコード",
    assistantTitle: "時間帯別プラン＆食事制限カード",
    practicalBadge: "実用機能",
    assistantSub:
      "1日3つの時間帯別おすすめメニューと、ホイアンの店主に直接見せる食事制限カードを作成します。",
    slotMorning: "朝の時間",
    slotNoon: "昼の時間",
    slotNight: "夜の旧市街",
    checkInDone: "チェックイン済",
    checkInNow: "チェックイン",
    walkAllThreeBtn: "全3スポットの徒歩ルート案内（スポット1 -> 2 -> 3）",
    dietaryTitle: "店主に見せる食事制限・アレルギーカード",
    dietarySub:
      "食事の注意点を選択して、大きな文字のカードとベトナム語音声で料理人に伝えます：",
    addCustomNoteBtn: "+ その他の要望を追加（ベトナム語に自動翻訳＆音声再生）",
    customNotePlaceholder:
      "追加の要望を入力（例：パクチー抜き、玉ねぎ抜き、甘さ控えめ...）",
    customNoteTranslatedPrefix: "料理人向けベトナム語翻訳：",
    openTasteCardBtn: "カードを表示してベトナム語音声を再生",
    playVoiceModalBtn: "音声ガイドを再生",
    stopVoiceModalBtn: "音声ガイドを停止",
    directionsModalBtn: "Googleマップで案内",
    closeBtn: "閉じる",
    tasteModalBadge: "ホイアン店主向け伝達カード",
    tasteModalHeading: "こんにちは！",
    tasteModalSub: "調理の際、以下の食事制限にご配慮いただけますと幸いです：",
    tasteNormalText: "食事制限はありません（すべて食べられます）",
    replayChefVoiceBtn: "料理人向けにベトナム語音声をもう一度再生",
    closeTasteCardBtn: "カードを閉じる",
    qrModalTitle: "スマートフォンでQRをスキャン",
    qrModalDesc:
      "スマートフォンのカメラで下のQRコードを読み取ると、モバイル音声ガイドが開きます",
    closeQrModalBtn: "QR画面を閉じる",
    spamCheckInWarning: "操作が速すぎます！2秒ほどお待ちください。",
  },
};

export const SCHEDULE_DATA: Record<TimeSlotKey, ScheduleStop[]> = {
  morning: [
    {
      id: "m1",
      order: 1,
      dishName: {
        vi: "Bánh Mì Đặc Ruột Hội An",
        en: "Hoi An Crispy Baguette (Banh Mi)",
        zh: "会安炭烤法棍三明治",
        ko: "호이안 크리스피 반미",
        ja: "ホイアン炭火焼きバインミー",
      },
      shopName: {
        vi: "Bánh Mì Phượng",
        en: "Phuong Banh Mi",
        zh: "凤姐法棍店 (Bánh Mì Phượng)",
        ko: "반미 프엉 (Bánh Mì Phượng)",
        ja: "バインミー・フォン",
      },
      hours: "06:30 - 21:30",
      lat: 15.878,
      lng: 108.3285,
    },
    {
      id: "m2",
      order: 2,
      dishName: {
        vi: "Mì Quảng Tôm Thịt Trứng",
        en: "Quang-Style Turmeric Noodles",
        zh: "广南鲜虾猪肉姜黄面",
        ko: "꽝남식 강황 쌀국수 (미꽝)",
        ja: "ミークアン（海老と豚肉の混ぜ麺）",
      },
      shopName: {
        vi: "Mì Quảng Ông Hai",
        en: "Ong Hai Mi Quang",
        zh: "二叔广南面 (Mì Quảng Ông Hai)",
        ko: "옹하이 미꽝",
        ja: "ミークアン・オンハイ",
      },
      hours: "07:30 - 21:00",
      lat: 15.8775,
      lng: 108.3292,
    },
    {
      id: "m3",
      order: 3,
      dishName: {
        vi: "Trà Thảo Mộc Sả Chanh Cánh Sen",
        en: "Lotus Petal Lemongrass Herbal Tea",
        zh: "会安荷花瓣九味草本凉茶",
        ko: "연꽃잎 레몬그라스 허브티",
        ja: "モット・ハーブティー（蓮の花びら添え）",
      },
      shopName: {
        vi: "Nước Mót Hội An",
        en: "Mot Hoi An Herbal Tea",
        zh: "会安 Mót 草本茶铺",
        ko: "느억못 호이안",
        ja: "ヌックモット・ホイアン",
      },
      hours: "08:00 - 21:30",
      lat: 15.87818,
      lng: 108.32648,
    },
  ],
  noon: [
    {
      id: "n1",
      order: 1,
      dishName: {
        vi: "Cao Lầu Cổ Truyền Hội An",
        en: "Traditional Hoi An Cao Lau Noodles",
        zh: "会安传统高楼面",
        ko: "호이안 전통 까오러우",
        ja: "カオラウ（ホイアン伝統太麺）",
      },
      shopName: {
        vi: "Cao Lầu Không Gian Xanh",
        en: "Green Space Cao Lau",
        zh: "绿色空间高楼面",
        ko: "콩잔싼 까오러우",
        ja: "カオラウ・コンザンサイン",
      },
      hours: "10:00 - 21:00",
      lat: 15.87815,
      lng: 108.32655,
    },
    {
      id: "n2",
      order: 2,
      dishName: {
        vi: "Cơm Gà Xé Phố Cổ",
        en: "Hoi An Shredded Chicken Rice",
        zh: "会安古镇手撕鸡饭",
        ko: "호이안 전통 치킨라이스",
        ja: "ホイアン伝統チキンライス",
      },
      shopName: {
        vi: "Cơm Gà Bà Buội",
        en: "Ba Buoi Chicken Rice",
        zh: "布伊阿婆鸡饭 (Bà Buội)",
        ko: "바부오이 치킨라이스",
        ja: "コムガー・バーブオイ",
      },
      hours: "10:30 - 20:00",
      lat: 15.8782,
      lng: 108.3265,
    },
    {
      id: "n3",
      order: 3,
      dishName: {
        vi: "Bánh Đập Hến Xào Cẩm Nam",
        en: "Cracked Rice Paper & Stir-Fried Clams",
        zh: "锦南香炒河蚬配脆拍米饼",
        ko: "깜남 재첩 볶음과 반답 크래커",
        ja: "バインダップとカムナム産シジミ炒め",
      },
      shopName: {
        vi: "Bánh Đập Bà Già",
        en: "Ba Gia Cam Nam Stall",
        zh: "锦南老阿婆米饼店",
        ko: "바자 반답 노점",
        ja: "バインダップ・バージャー",
      },
      hours: "11:00 - 17:00",
      lat: 15.8745,
      lng: 108.3342,
    },
  ],
  night: [
    {
      id: "e1",
      order: 1,
      dishName: {
        vi: "Bánh Vạc Hoa Hồng Trắng",
        en: "White Rose Shrimp Dumplings",
        zh: "会安白玫瑰鲜虾饺",
        ko: "화이트 로즈 새우 만두 (반박)",
        ja: "ホワイトローズ（米粉の蒸し餃子）",
      },
      shopName: {
        vi: "Nhà Hàng Bông Hồng Trắng",
        en: "White Rose Restaurant",
        zh: "白玫瑰传统工坊",
        ko: "봉홍짱 레스토랑",
        ja: "ホワイトローズ工房",
      },
      hours: "16:00 - 21:30",
      lat: 15.8812,
      lng: 108.3235,
    },
    {
      id: "e2",
      order: 2,
      dishName: {
        vi: "Thịt Xiên Nướng Bờ Sông Hoài",
        en: "Hoai Riverbank Grilled Pork Skewers",
        zh: "怀河岸炭烤五香肉串",
        ko: "호아이 강변 숯불 고기꼬치",
        ja: "ホアイ川沿いの炭火焼き豚串",
      },
      shopName: {
        vi: "Phố Đêm Nguyễn Phúc Chu",
        en: "Nguyen Phuc Chu Night Street",
        zh: "阮福周夜市美食街",
        ko: "응우옌푹쭈 야시장 거리",
        ja: "グエンフックチュウ夜市通り",
      },
      hours: "17:00 - 22:00",
      lat: 15.8768,
      lng: 108.3268,
    },
    {
      id: "e3",
      order: 3,
      dishName: {
        vi: "Chè Xí Mà Phù Cổ Truyền",
        en: "Traditional Black Sesame Pudding",
        zh: "古法石磨养生黑芝麻糊",
        ko: "전통 흑임자 죽 (씨마푸)",
        ja: "黒ごまの薬膳チェー（シーマーフー）",
      },
      shopName: {
        vi: "Gánh Chè Ông Thiều",
        en: "Ong Thieu Heritage Stall",
        zh: "邵公百年黑芝麻糊摊",
        ko: "옹티에우 전통 체 노점",
        ja: "オンティエウ伝統甘味屋台",
      },
      hours: "17:30 - 22:00",
      lat: 15.8805,
      lng: 108.324,
    },
  ],
};

export const DIETARY_OPTIONS: DietaryOption[] = [
  {
    id: "no_peanut",
    label: {
      vi: "Dị ứng đậu phộng (Không lạc)",
      en: "Peanut Allergy (No Peanuts)",
      zh: "花生过敏（请勿放花生）",
      ko: "땅콩 알레르기 (땅콩 제외)",
      ja: "ピーナッツアレルギー（ピーナッツ抜き）",
    },
    voiceText: "Tôi bị dị ứng đậu phộng, xin vui lòng không bỏ lạc",
  },
  {
    id: "no_spicy",
    label: {
      vi: "Không ăn cay (Không ớt)",
      en: "No Spicy (No Chili)",
      zh: "不吃辣（请勿放辣椒）",
      ko: "맵지 않게 (고추 제외)",
      ja: "辛くしないでください（唐辛子抜き）",
    },
    voiceText: "Tôi không ăn được cay, xin đừng bỏ ớt và tương ớt",
  },
  {
    id: "vegan",
    label: {
      vi: "Ăn thuần chay (Không thịt cá)",
      en: "Strict Vegan (No Meat or Fish Sauce)",
      zh: "纯素食（不含肉类与鱼露）",
      ko: "순수 채식 (육류 및 피쉬소스 제외)",
      ja: "完全菜食（肉・魚・魚醤抜き）",
    },
    voiceText: "Tôi ăn thuần chay, xin không dùng thịt cá và nước mắm",
  },
  {
    id: "no_msg",
    label: {
      vi: "Không bột ngọt (Mì chính)",
      en: "No MSG Added",
      zh: "请勿添加味精",
      ko: "조미료(MSG) 제외",
      ja: "うま味調味料（MSG）抜き",
    },
    voiceText: "Xin vui lòng không nêm bột ngọt mì chính vào món ăn",
  },
];

