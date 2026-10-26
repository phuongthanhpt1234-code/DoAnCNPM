import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { DISHES, Dish, LANGS, LangKey } from "../data/dishesData";
import {
  api,
  getClientDeviceId,
  getDishes,
  notifyPresenceLangChange,
  startPresenceSession,
} from "../services/api";

type TimeSlotKey = "morning" | "noon" | "night";

interface LocalizedText {
  vi: string;
  en: string;
  zh: string;
  ko: string;
  ja: string;
  [key: string]: string;
}

interface ScheduleStop {
  id: string;
  order: number;
  dishName: LocalizedText;
  shopName: LocalizedText;
  hours: string;
  lat: number;
  lng: number;
}

interface DietaryOption {
  id: string;
  label: LocalizedText;
  voiceText: string;
}

// TỪ ĐIỂN ẨM THỰC TỨC THÌ (ĐẢM BẢO DỊCH NGAY LẬP TỨC KHI BẤM PHÁT GIỌNG ĐỌC AI TIẾNG VIỆT)
const QUICK_CULINARY_DICT: { patterns: string[]; vi: string }[] = [
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

function translateNoteInstant(rawText: string): string {
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

const PAGE_UI: Record<
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
  }
> = {
  vi: {
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
  },
  en: {
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
  },
  zh: {
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
  },
  ko: {
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
  },
  ja: {
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
  },
};

const SCHEDULE_DATA: Record<TimeSlotKey, ScheduleStop[]> = {
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

const DIETARY_OPTIONS: DietaryOption[] = [
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

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ lang?: string; dish?: string }>();

  const [apiDishes, setApiDishes] = useState<Dish[]>(DISHES);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

const CAT_BY_NAME: Record<string, Dish["cat"]> = {
      "Món chính": "main",
      "Ăn vặt": "snack",
      "Đường phố": "street",
      "Đồ uống": "sweet",
      "Chè & Đồ uống": "sweet",
    };

    async function loadDishes() {
      try {
        const rows: any[] = await getDishes();

        if (cancelled) return;

        const converted: Dish[] = rows
          .filter((row) => row.is_active !== false)
   .map((row): Dish => {
            const localDish = DISHES.find(
              (d) =>
                d.name.vi.trim().toLowerCase() ===
                String(row.name).trim().toLowerCase(),
            );

            const base: Dish = localDish ?? {
              id: row.id,
              cat: "main",
              emoji: row.emoji || "🍜",
              price: "Đang cập nhật",
              rating: Number(row.rating ?? 4.8),
              lat: Number(row.lat ?? 15.877),
              lng: Number(row.lng ?? 108.327),
              img: row.image_url || "",
              name: row.name_i18n ?? {
                vi: row.name,
                en: row.name,
                zh: row.name,
                ko: row.name,
                ja: row.name,
              },
              desc: row.desc_i18n ?? {
                vi: row.description ?? "",
                en: row.description ?? "",
                zh: row.description ?? "",
                ko: row.description ?? "",
                ja: row.description ?? "",
              },
            };

            const mergedName: Record<LangKey, string> = {
              vi: row.name_i18n?.vi || row.name || base.name.vi,
              en:
                row.name_i18n?.en && row.name_i18n.en !== row.name
                  ? row.name_i18n.en
                  : localDish?.name.en || row.name_i18n?.en || row.name,
              zh:
                row.name_i18n?.zh && row.name_i18n.zh !== row.name
                  ? row.name_i18n.zh
                  : localDish?.name.zh || row.name_i18n?.zh || row.name,
              ko:
                row.name_i18n?.ko && row.name_i18n.ko !== row.name
                  ? row.name_i18n.ko
                  : localDish?.name.ko || row.name_i18n?.ko || row.name,
              ja:
                row.name_i18n?.ja && row.name_i18n.ja !== row.name
                  ? row.name_i18n.ja
                  : localDish?.name.ja || row.name_i18n?.ja || row.name,
            };

            const rawDescVi = row.desc_i18n?.vi || row.description || base.desc.vi;
            const mergedDesc: Record<LangKey, string> = {
              vi: rawDescVi,
              en:
                row.desc_i18n?.en && row.desc_i18n.en !== rawDescVi
                  ? row.desc_i18n.en
                  : localDish?.desc.en || row.desc_i18n?.en || rawDescVi,
              zh:
                row.desc_i18n?.zh && row.desc_i18n.zh !== rawDescVi
                  ? row.desc_i18n.zh
                  : localDish?.desc.zh || row.desc_i18n?.zh || rawDescVi,
              ko:
                row.desc_i18n?.ko && row.desc_i18n.ko !== rawDescVi
                  ? row.desc_i18n.ko
                  : localDish?.desc.ko || row.desc_i18n?.ko || rawDescVi,
              ja:
                row.desc_i18n?.ja && row.desc_i18n.ja !== rawDescVi
                  ? row.desc_i18n.ja
                  : localDish?.desc.ja || row.desc_i18n?.ja || rawDescVi,
            };

            return {
              ...base,
              id: Number(row.id),
              emoji: row.emoji || base.emoji,
              rating: row.rating != null ? Number(row.rating) : base.rating,
              lat: row.lat != null ? Number(row.lat) : base.lat,
              lng: row.lng != null ? Number(row.lng) : base.lng,
              name: mergedName,
              desc: mergedDesc,
              img: row.image_url || base.img,
              price:
                row.price_vnd != null
                  ? Number(row.price_vnd).toLocaleString("vi-VN") + "đ"
                  : base.price,
              cat:
                (row.category_slug as Dish["cat"]) ??
                CAT_BY_NAME[row.category_name] ??
                localDish?.cat ??
                "main",
            };
          });

        setApiDishes(converted);
        console.log("API OK:", converted.length, "món");
        setApiError("");
      } catch (err) {
        console.log("API LỖI:", err);
        if (!cancelled) {
          setApiError(
            err instanceof Error ? err.message : "Không tải được món ăn",
          );
        }
      } finally {
        if (!cancelled) {
          setApiLoading(false);
        }
      }
    }

    loadDishes();

    return () => {
      cancelled = true;
    };
  }, []);

  const [languageSelection, setLanguageSelection] = useState<{
    route: string | undefined;
    value: LangKey;
  }>(() => ({ route: params.lang, value: (params.lang as LangKey) || "vi" }));
  const lang: LangKey = languageSelection.route === params.lang
    ? languageSelection.value
    : params.lang && PAGE_UI[params.lang] ? params.lang as LangKey : "vi";
  const setLang = useCallback((value: LangKey) => {
    setLanguageSelection({ route: params.lang, value });
  }, [params.lang]);
  const [cat, setCat] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(
    params.dish
      ? DISHES.find((d) => d.id === Number(params.dish)) || null
      : null,
  );
  const [qrVisible, setQrVisible] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>(
    Platform.OS === "web" && typeof window !== "undefined"
      ? window.location.origin
      : "https://hoian-food-map.vercel.app",
  );

  const [checkedDishIds, setCheckedDishIds] = useState<number[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([
    "no_peanut",
    "no_spicy",
  ]);
  const [tasteCardVisible, setTasteCardVisible] = useState<boolean>(false);

  // STATE CHO MỤC (THÊM): NHẬP GHI CHÚ BẰNG BẤT KỲ NGÔN NGỮ NÀO -> DỊCH & ĐỌC TIẾNG VIỆT
  const [showCustomNoteBox, setShowCustomNoteBox] = useState<boolean>(false);
  const [customDietaryNote, setCustomDietaryNote] = useState<string>("");
  const [remoteTranslation, setRemoteTranslation] = useState({ source: "", text: "" });
  const noteSource = customDietaryNote.trim();
  const translatedCustomNoteVi = !noteSource ? ""
    : remoteTranslation.source === noteSource ? remoteTranslation.text
    : translateNoteInstant(noteSource);

  const ui = PAGE_UI[lang] || PAGE_UI.vi;

  // Kết nối đếm thiết bị đang truy cập thời gian thực (tự động giảm khi đóng tab/app)
  useEffect(() => {
    const cleanup = startPresenceSession(() => lang);
    return cleanup;
  }, []);

  useEffect(() => {
    notifyPresenceLangChange(lang);
  }, [lang]);

  useEffect(() => {
    if (params.lang && PAGE_UI[params.lang]) {
      AsyncStorage.setItem("appLanguage", params.lang).catch(() => {});
    }
  }, [params.lang]);

  useEffect(() => {
    let isCancelled = false;
    const raw = customDietaryNote.trim();
    if (!raw) return;

    const timer = setTimeout(async () => {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(raw)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!isCancelled && Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0]
            .map((part: any) => part[0])
            .join("")
            .trim();
          if (translated) setRemoteTranslation({ source: raw, text: translated });
        }
      } catch (e) {}
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [customDietaryNote]);

  useFocusEffect(
    useCallback(() => {
      if (!params.lang) {
        AsyncStorage.getItem("appLanguage")
          .then((savedLang) => {
            if (savedLang && PAGE_UI[savedLang]) {
              setLang(savedLang as LangKey);
            }
          })
          .catch(() => {});
      }
    }, [params.lang, setLang]),
  );

  const handleSelectLanguage = async (k: LangKey) => {
    setLang(k);
    router.setParams({ lang: k });
    try {
      await AsyncStorage.setItem("appLanguage", k);
    } catch (e) {}
  };

  const isDesktop = width >= 900;
  const numColumns = isDesktop ? 3 : width >= 600 ? 2 : 1;

  const filtered = useMemo(() => {
    return apiDishes.filter((d) => {
      const matchCat = cat === "all" || d.cat === cat;
      const q = search.toLowerCase();
      const matchSearch = (
        (d.name[lang] || "") +
        d.name.vi +
        (d.desc[lang] || "")
      )
        .toLowerCase()
        .includes(q);
      return matchCat && matchSearch;
    });
  }, [apiDishes, cat, search, lang]);

  const speakText = (text: string, customSpeechCode?: string) => {
    const targetLang = customSpeechCode || LANGS[lang]?.speechCode || "vi-VN";

    if (Platform.OS === "web" && typeof window !== "undefined") {
      // Hủy âm thanh cũ đang phát (nếu có)
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if ((window as any).__currentAudio) {
        (window as any).__currentAudio.pause();
      }

      const playFallbackOnlineVoice = () => {
        try {
          const shortLang = targetLang.split("-")[0];
          const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
            text,
          )}&tl=${shortLang}&client=tw-ob`;
          const audio = new window.Audio(url);
          (window as any).__currentAudio = audio;
          audio.play().catch((err) => console.warn("Audio play error:", err));
        } catch (e) {}
      };

      if ("speechSynthesis" in window) {
        setTimeout(() => {
          const voices = window.speechSynthesis.getVoices();
          const matchedVoice = voices.find((v) =>
            v.lang
              .toLowerCase()
              .replace("_", "-")
              .startsWith(targetLang.toLowerCase().slice(0, 2)),
          );

          if (!matchedVoice && targetLang.toLowerCase().startsWith("vi")) {
            playFallbackOnlineVoice();
            return;
          }

          const utter = new SpeechSynthesisUtterance(text);

          (window as any).__currentUtter = utter;
          utter.lang = targetLang;
          utter.rate = 0.95;

          if (matchedVoice) {
            utter.voice = matchedVoice;
          }

          utter.onerror = () => {
            playFallbackOnlineVoice();
          };

          window.speechSynthesis.speak(utter);
        }, 120);
      } else {
        playFallbackOnlineVoice();
      }
    } else if (!customSpeechCode) {
      router.push(`/dish/${selectedDish?.id || 1}?lang=${lang}`);
    }
  };

  const handleCheckInDish = (dish: Dish) => {
    const isAlreadyChecked = checkedDishIds.includes(dish.id);
    setCheckedDishIds((prev) =>
      prev.includes(dish.id)
        ? prev.filter((id) => id !== dish.id)
        : [...prev, dish.id],
    );
    if (!isAlreadyChecked) {
      api("/checkins", {
        method: "POST",
        body: JSON.stringify({
          device_id: getClientDeviceId(),
          dish_id: dish.id,
          note: `Check-in món ${dish.name.vi}`,
        }),
      }).catch(() => {});
    }
  };

  const toggleDietaryOption = (id: string) => {
    setSelectedDietary((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const buildChefVoiceMessage = () => {
    const chosen = DIETARY_OPTIONS.filter((opt) =>
      selectedDietary.includes(opt.id),
    );
    const extraVi = (
      translatedCustomNoteVi || translateNoteInstant(customDietaryNote)
    ).trim();

    const voiceParts = chosen.map((c) => c.voiceText);
    if (extraVi) {
      voiceParts.push(`Ngoài ra xin lưu ý giúp tôi: ${extraVi}`);
    }

    if (voiceParts.length === 0) {
      return "Xin chào chủ quán Hội An, tôi có thể ăn được tất cả các nguyên liệu bình thường. Cảm ơn quán!";
    }
    return `Xin chào cô chú chủ quán Hội An! Nhờ quán lưu ý giúp tôi: ${voiceParts.join(". ")}. Xin cảm ơn rất nhiều!`;
  };

  // GỌI ĐỒNG BỘ TRỰC TIẾP ĐỂ TRÌNH DUYỆT PHÁT GIỌNG ĐỌC AI TIẾNG VIỆT NGAY LẬP TỨC
  const handleOpenAndSpeakTasteCard = () => {
    setTasteCardVisible(true);
    speakText(buildChefVoiceMessage(), "vi-VN");
  };

  const qrTargetUrl = `${customUrl}?mobile=1&lang=${lang}${selectedDish ? `&dish=${selectedDish.id}` : ""}`;
  const qrImageUri = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(qrTargetUrl)}`;

  const activeExtraNoteVi = (
    translatedCustomNoteVi || translateNoteInstant(customDietaryNote)
  ).trim();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brandTitle}>{ui.brandTitle}</Text>
            <Text style={styles.brandSub}>{ui.brandSub}</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.langBar}
        >
          {(Object.keys(LANGS) as LangKey[]).map((k) => (
            <TouchableOpacity
              key={k}
              onPress={() => handleSelectLanguage(k)}
              style={[styles.langBtn, lang === k && styles.langBtnActive]}
            >
              <Text
                style={[styles.langBtnText, lang === k && { color: "#fff" }]}
              >
                {k.toUpperCase()} {LANGS[k].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.authRow}>
          <TouchableOpacity
            style={styles.qrTriggerBtn}
            onPress={() => setQrVisible(true)}
          >
            <Text style={styles.qrTriggerText}>{ui.qrMobileBtn}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        key={"${numColumns}-${lang}"}
        data={filtered}
        extraData={{ lang, checkedDishIds }}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.filterSection}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={ui.searchPlaceholder}
                placeholderTextColor="#a89a82"
                style={styles.searchInput}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catRow}
              >
                {[
                  ["all", `${ui.catAll.replace(/\s*\(\d+\)/, "")} (${apiDishes.length})`],
                  ["main", ui.catMain],
                  ["snack", ui.catSnack],
                  ["street", ui.catStreet],
                  ["sweet", ui.catSweet],
                ].map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setCat(key)}
                    style={[
                      styles.catChip,
                      cat === key && styles.catChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        cat === key && { color: "#fff" },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              numColumns === 3 && {
                maxWidth:
                  Platform.OS === "web"
                    ? ("calc(33.333% - 16px)" as any)
                    : "31.5%",
              },
              numColumns === 2 && {
                maxWidth:
                  Platform.OS === "web"
                    ? ("calc(50% - 16px)" as any)
                    : "48%",
              },
            ]}
            onPress={() => setSelectedDish(item)}
            activeOpacity={0.88}
          >
            <View style={styles.cardImgWrap}>
              {item.img ? (
                <Image
                  source={{ uri: item.img }}
                  style={styles.cardImg}
                  resizeMode="cover"
                />
              ) : null}
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTopContent}>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardPrice}>
                    {item.price}
                  </Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name[lang] || item.name.vi}
                </Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {lang === "vi"
                    ? item.name.en || item.name.vi
                    : item.name.vi}
                </Text>
                <Text style={styles.cardDesc} numberOfLines={3}>
                  {item.desc[lang] || item.desc.vi}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.listenBtn}
                  onPress={() => {
                    setSelectedDish(item);
                    speakText(item.desc[lang] || item.desc.vi);
                  }}
                >
                  <Text style={styles.listenBtnText}>{ui.listenBtn}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleCheckInDish(item)}
                  style={[
                    styles.checkInActionBtn,
                    checkedDishIds.includes(item.id)
                      ? styles.checkInActionBtnDone
                      : styles.checkInActionBtnPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.checkInActionText,
                      checkedDishIds.includes(item.id)
                        ? styles.checkInActionTextDone
                        : styles.checkInActionTextPending,
                    ]}
                  >
                    {checkedDishIds.includes(item.id)
                      ? ui.checkInDone
                      : ui.checkInNow}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={styles.assistantSection}>
            <View style={styles.assistantHeaderRow}>
              <View style={styles.assistantTitleGroup}>
                <Text style={styles.assistantTitle}>{ui.dietaryTitle}</Text>
              </View>
              <View style={styles.practicalBadge}>
                <Text style={styles.practicalBadgeText}>
                  {ui.practicalBadge}
                </Text>
              </View>
            </View>

            <Text style={styles.assistantSub}>{ui.dietarySub}</Text>

            <View
              style={[
                styles.assistantGrid,
                isDesktop && styles.assistantGridDesktop,
              ]}
            >
              <View style={[styles.panelBox, isDesktop && { flex: 1 }]}>
                <View style={styles.dietaryOptionsList}>
                  {DIETARY_OPTIONS.map((opt) => {
                    const isSelected = selectedDietary.includes(opt.id);
                    const optLabel = opt.label[lang] || opt.label.vi;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.85}
                        onPress={() => toggleDietaryOption(opt.id)}
                        style={[
                          styles.dietaryItemRow,
                          isSelected && styles.dietaryItemRowSelected,
                        ]}
                      >
                        <View style={styles.dietaryItemLeft}>
                          <Text
                            style={[
                              styles.dietaryLabel,
                              isSelected && styles.dietaryLabelSelected,
                            ]}
                          >
                            {optLabel}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.dietaryRadioCircle,
                            isSelected && styles.dietaryRadioCircleSelected,
                          ]}
                        >
                          {isSelected && (
                            <Text style={styles.dietaryCheckMark}>✓</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {/* MỤC (THÊM): NHẬP GHI CHÚ BẰNG 1 TRONG 5 NGÔN NGỮ -> DỊCH & PHÁT GIỌNG ĐỌC AI TIẾNG VIỆT */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setShowCustomNoteBox(!showCustomNoteBox)}
                    style={[
                      styles.dietaryItemRow,
                      (showCustomNoteBox ||
                        customDietaryNote.trim().length > 0) &&
                        styles.dietaryItemRowSelected,
                    ]}
                  >
                    <View style={styles.dietaryItemLeft}>
                      <Text
                        style={[
                          styles.dietaryLabel,
                          (showCustomNoteBox ||
                            customDietaryNote.trim().length > 0) &&
                            styles.dietaryLabelSelected,
                        ]}
                      >
                        {ui.addCustomNoteBtn}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.dietaryRadioCircle,
                        (showCustomNoteBox ||
                          customDietaryNote.trim().length > 0) &&
                          styles.dietaryRadioCircleSelected,
                      ]}
                    >
                      <Text style={styles.dietaryCheckMark}>
                        {showCustomNoteBox ||
                        customDietaryNote.trim().length > 0
                          ? "✓"
                          : "+"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {(showCustomNoteBox ||
                    customDietaryNote.trim().length > 0) && (
                    <View style={styles.customNoteInputWrap}>
                      <TextInput
                        value={customDietaryNote}
                        onChangeText={setCustomDietaryNote}
                        placeholder={ui.customNotePlaceholder}
                        placeholderTextColor="#a89a82"
                        style={styles.customNoteInput}
                      />
                      {activeExtraNoteVi ? (
                        <Text style={styles.customNotePreviewText}>
                          {ui.customNoteTranslatedPrefix}{" "}
                          <Text
                            style={{ color: "#34d399", fontWeight: "bold" }}
                          >
                            {activeExtraNoteVi}
                          </Text>
                        </Text>
                      ) : null}
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleOpenAndSpeakTasteCard}
                  style={styles.openTasteCardBtn}
                >
                  <Text style={styles.openTasteCardBtnText}>
                    {ui.openTasteCardBtn}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
      />

      <Modal
        visible={!!selectedDish && !qrVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          {selectedDish && (
            <View style={styles.modalBox}>
              <Image
                source={{ uri: selectedDish.img }}
                style={styles.modalImg}
              />
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedDish.name[lang]}</Text>
                <Text style={styles.modalSub}>
                  {selectedDish.name.vi} · {selectedDish.price}
                </Text>
                <ScrollView style={{ maxHeight: 160 }}>
                  <Text style={styles.modalDesc}>
                    {selectedDish.desc[lang]}
                  </Text>
                </ScrollView>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => speakText(selectedDish.desc[lang])}
                  >
                    <Text style={styles.primaryBtnText}>
                      {ui.playVoiceModalBtn} ({LANGS[lang].label})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() =>
                      Linking.openURL(
                        `https://www.google.com/maps/dir/?api=1&destination=${selectedDish.lat},${selectedDish.lng}`,
                      )
                    }
                  >
                    <Text style={styles.secondaryBtnText}>
                      {ui.directionsModalBtn}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.secondaryBtn,
                      checkedDishIds.includes(selectedDish.id) && {
                        backgroundColor: "#10b981",
                        borderColor: "#10b981",
                      },
                    ]}
                    onPress={() => handleCheckInDish(selectedDish)}
                  >
                    <Text
                      style={[
                        styles.secondaryBtnText,
                        checkedDishIds.includes(selectedDish.id) && {
                          color: "#fff",
                        },
                      ]}
                    >
                      {checkedDishIds.includes(selectedDish.id)
                        ? ui.checkInDone
                        : ui.checkInNow}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedDish(null)}
                >
                  <Text style={styles.closeBtnText}>{ui.closeBtn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      <Modal visible={tasteCardVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.tasteModalBox}>
            <View style={styles.tasteModalBadge}>
              <Text style={styles.tasteModalBadgeText}>
                {ui.tasteModalBadge}
              </Text>
            </View>

            <Text style={styles.tasteModalHeading}>{ui.tasteModalHeading}</Text>
            <Text style={styles.tasteModalSub}>{ui.tasteModalSub}</Text>

            <View style={styles.tasteLargeList}>
              {selectedDietary.length === 0 && !activeExtraNoteVi ? (
                <Text style={styles.tasteLargeItemText}>
                  {ui.tasteNormalText}
                </Text>
              ) : (
                <>
                  {DIETARY_OPTIONS.filter((opt) =>
                    selectedDietary.includes(opt.id),
                  ).map((opt) => (
                    <View key={opt.id} style={styles.tasteLargeItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tasteLargeItemText}>
                          {opt.label.vi}
                        </Text>
                        {lang !== "vi" && (
                          <Text
                            style={{
                              color: "#a89a82",
                              fontSize: 13,
                              marginTop: 2,
                            }}
                          >
                            {opt.label[lang] || opt.label.en}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}

                  {activeExtraNoteVi.length > 0 && (
                    <View style={styles.tasteLargeItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tasteLargeItemText}>
                          Lưu ý thêm: {activeExtraNoteVi}
                        </Text>
                        {customDietaryNote.trim().toLowerCase() !==
                          activeExtraNoteVi.toLowerCase() && (
                          <Text
                            style={{
                              color: "#a89a82",
                              fontSize: 13,
                              marginTop: 2,
                            }}
                          >
                            ({customDietaryNote.trim()})
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.openTasteCardBtn}
              onPress={() => speakText(buildChefVoiceMessage(), "vi-VN")}
            >
              <Text style={styles.openTasteCardBtnText}>
                {ui.replayChefVoiceBtn}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeBtn, { width: "100%", marginTop: 10 }]}
              onPress={() => setTasteCardVisible(false)}
            >
              <Text style={styles.closeBtnText}>{ui.closeTasteCardBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={qrVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalBox, { padding: 24, alignItems: "center" }]}
          >
            <Text style={styles.qrModalTitle}>{ui.qrModalTitle}</Text>
            <Text style={styles.qrModalDesc}>
              {ui.qrModalDesc} ({LANGS[lang].label}).
            </Text>

            <View style={styles.qrFrame}>
              <Image
                source={{ uri: qrImageUri }}
                style={{ width: 220, height: 220 }}
              />
            </View>

            <TextInput
              value={customUrl}
              onChangeText={setCustomUrl}
              style={styles.urlInput}
            />

            <TouchableOpacity
              style={[styles.closeBtn, { width: "100%" }]}
              onPress={() => setQrVisible(false)}
            >
              <Text style={styles.closeBtnText}>{ui.closeQrModalBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090505" },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 16 : 48,
    paddingBottom: 12,
    backgroundColor: "#140909",
    borderBottomWidth: 1,
    borderBottomColor: "#e9c26b33",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandTitle: {
    color: "#e9c26b",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },
  brandSub: { color: "#a89a82", fontSize: 11, marginTop: 2 },
  langBar: { flexDirection: "row", gap: 6, paddingVertical: 4 },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e9c26b33",
  },
  langBtnActive: { backgroundColor: "#d4152f", borderColor: "#e9c26b" },
  langBtnText: { color: "#a89a82", fontSize: 12, fontWeight: "600" },
  qrTriggerBtn: {
    backgroundColor: "#e9c26b",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  qrTriggerText: { color: "#090505", fontWeight: "bold", fontSize: 12 },
  authRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  loginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e9c26b",
  },
  loginBtnText: { color: "#e9c26b", fontWeight: "bold", fontSize: 12 },
  registerBtn: {
    backgroundColor: "#d4152f",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  registerBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  userChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#160c0c",
    borderWidth: 1,
    borderColor: "#e9c26b33",
    maxWidth: 160,
  },
  userChipText: { color: "#f5ead4", fontSize: 12, fontWeight: "600" },
  filterSection: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 10,
  },
  searchInput: {
    backgroundColor: "#160c0c",
    color: "#f5ead4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e9c26b44",
    fontSize: 14,
  },
  catRow: { flexDirection: "row", gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#160c0c",
    borderWidth: 1,
    borderColor: "#e9c26b33",
  },
  catChipActive: { backgroundColor: "#d4152f", borderColor: "#e9c26b" },
  catChipText: { color: "#a89a82", fontSize: 13, fontWeight: "600" },
  assistantSection: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 40,
  },
  assistantHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  assistantTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  assistantTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "bold",
  },
  practicalBadge: {
    backgroundColor: "#047857",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  practicalBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  assistantSub: {
    color: "#b8b0a8",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  assistantGrid: {
    flexDirection: "column",
    gap: 14,
  },
  assistantGridDesktop: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  panelBox: {
    backgroundColor: "#14110f",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2e2621",
    justifyContent: "space-between",
  },
  slotTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  slotTabBtn: {
    flex: 1,
    backgroundColor: "#1e1a17",
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#332b25",
  },
  slotTabBtnActive: {
    backgroundColor: "#7c2d2d",
    borderColor: "#f87171",
  },
  slotTabTitle: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 3,
  },
  slotTabTitleActive: {
    color: "#ffffff",
  },
  slotTabTime: {
    color: "#a89a82",
    fontSize: 11,
  },
  slotTabTimeActive: {
    color: "#fde68a",
    fontWeight: "600",
  },
  stopsList: {
    gap: 10,
    marginBottom: 14,
  },
  stopCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1815",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#302924",
  },
  stopNumberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stopNumberBadgePending: {
    backgroundColor: "#f59e0b",
  },
  stopNumberBadgeDone: {
    backgroundColor: "#10b981",
  },
  stopNumberText: {
    color: "#120f0d",
    fontWeight: "900",
    fontSize: 14,
  },
  stopInfoCol: {
    flex: 1,
    paddingRight: 8,
  },
  stopDishTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
  },
  stopShopMeta: {
    color: "#b8b0a8",
    fontSize: 12,
  },
  checkInActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  checkInActionBtnPending: {
    backgroundColor: "#14110f",
    borderColor: "#b45309",
  },
  checkInActionBtnDone: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkInActionText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  checkInActionTextPending: {
    color: "#f59e0b",
  },
  checkInActionTextDone: {
    color: "#ffffff",
  },
  walkRouteBtn: {
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  walkRouteBtnText: {
    color: "#120f0d",
    fontSize: 14,
    fontWeight: "900",
  },
  dietaryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  dietaryPanelTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  dietaryPanelSub: {
    color: "#b8b0a8",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  dietaryOptionsList: {
    gap: 10,
    marginBottom: 14,
  },
  dietaryItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1c1815",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#302924",
  },
  dietaryItemRowSelected: {
    backgroundColor: "#0c291e",
    borderColor: "#10b981",
  },
  dietaryItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  dietaryLabel: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
  dietaryLabelSelected: {
    color: "#34d399",
    fontWeight: "bold",
  },
  dietaryRadioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4b5563",
    justifyContent: "center",
    alignItems: "center",
  },
  dietaryRadioCircleSelected: {
    backgroundColor: "#10b981",
  },
  dietaryCheckMark: {
    color: "#090505",
    fontSize: 13,
    fontWeight: "900",
  },
  customNoteInputWrap: {
    backgroundColor: "#181412",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#10b981",
    gap: 6,
  },
  customNoteInput: {
    backgroundColor: "#120f0d",
    color: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#302924",
    fontSize: 13,
  },
  customNotePreviewText: {
    color: "#b8b0a8",
    fontSize: 12,
    marginTop: 2,
  },
  openTasteCardBtn: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  openTasteCardBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  listContent: { padding: 10, paddingBottom: 40 },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#160c0c",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e9c26b33",
    overflow: "hidden",
    justifyContent: "space-between",
  },
  cardImgWrap: {
    width: "100%",
    height: 180,
    backgroundColor: "#1f1111",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "#e9c26b22",
  },
  cardImgFallbackEmoji: {
    fontSize: 44,
    opacity: 0.45,
  },
  cardImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  cardBody: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    gap: 10,
  },
  cardTopContent: {
    gap: 6,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPrice: { color: "#e9c26b", fontSize: 13, fontWeight: "bold" },
  cardRating: { color: "#e9c26b", fontSize: 13, fontWeight: "bold" },
  cardTitle: { color: "#f5ead4", fontSize: 19, fontWeight: "bold" },
  cardSub: { color: "#a89a82", fontSize: 12 },
  cardDesc: {
    color: "#d6c7b2",
    fontSize: 13,
    lineHeight: 19,
    minHeight: 57,
  },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  listenBtn: {
    flex: 1,
    backgroundColor: "#d4152f",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  listenBtnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  qrMiniBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e9c26b66",
  },
  qrMiniText: { color: "#e9c26b", fontWeight: "bold", fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#160c0c",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e9c26b",
    overflow: "hidden",
  },
  modalImg: { width: "100%", height: 210 },
  modalContent: { padding: 20, gap: 10 },
  modalTitle: { color: "#e9c26b", fontSize: 24, fontWeight: "bold" },
  modalSub: { color: "#a89a82", fontSize: 13 },
  modalDesc: { color: "#f5ead4", fontSize: 15, lineHeight: 23 },
  modalBtnRow: { gap: 8, marginTop: 8 },
  primaryBtn: {
    backgroundColor: "#d4152f",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  secondaryBtn: {
    backgroundColor: "#e9c26b22",
    paddingVertical: 11,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9c26b",
  },
  secondaryBtnText: { color: "#e9c26b", fontWeight: "bold", fontSize: 13 },
  closeBtn: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#ffffff15",
    alignItems: "center",
  },
  closeBtnText: { color: "#f5ead4", fontWeight: "600", fontSize: 13 },
  tasteModalBox: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#14110f",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#10b981",
    padding: 22,
  },
  tasteModalBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#065f46",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 10,
  },
  tasteModalBadgeText: {
    color: "#34d399",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  tasteModalHeading: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tasteModalSub: {
    color: "#b8b0a8",
    fontSize: 13,
    marginBottom: 14,
  },
  tasteLargeList: {
    gap: 10,
    marginBottom: 18,
  },
  tasteLargeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0c291e",
    borderWidth: 1.5,
    borderColor: "#10b981",
    borderRadius: 14,
    padding: 14,
  },
  tasteLargeItemText: {
    color: "#34d399",
    fontSize: 17,
    fontWeight: "bold",
  },
  qrModalTitle: {
    color: "#e9c26b",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  qrModalDesc: {
    color: "#a89a82",
    fontSize: 13,
    textAlign: "center",
    marginVertical: 8,
    lineHeight: 19,
  },
  qrFrame: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 20,
    marginVertical: 10,
  },
  urlInput: {
    width: "100%",
    backgroundColor: "#090505",
    color: "#e9c26b",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9c26b55",
    fontSize: 12,
    marginVertical: 6,
  },
});
