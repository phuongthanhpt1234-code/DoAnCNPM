import React, { useState, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
  Linking,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { DISHES, LANGS, LangKey, Dish } from "../data/dishesData";

type TimeSlotKey = "morning" | "noon" | "night";

interface ScheduleStop {
  id: string;
  order: number;
  dishName: string;
  shopName: string;
  hours: string;
  lat: number;
  lng: number;
}

interface DietaryOption {
  id: string;
  emoji: string;
  label: string;
  voiceText: string;
}

const SCHEDULE_SLOTS: {
  key: TimeSlotKey;
  emoji: string;
  title: string;
  timeRange: string;
}[] = [
  {
    key: "morning",
    emoji: "🌅",
    title: "Buổi Sáng",
    timeRange: "07:00 - 10:30",
  },
  {
    key: "noon",
    emoji: "☀️",
    title: "Buổi Trưa",
    timeRange: "11:00 - 15:00",
  },
  {
    key: "night",
    emoji: "🏮",
    title: "Phố Đêm",
    timeRange: "17:00 - 22:00",
  },
];

const SCHEDULE_DATA: Record<TimeSlotKey, ScheduleStop[]> = {
  morning: [
    {
      id: "m1",
      order: 1,
      dishName: "Bánh Mì Đặc Ruột Hội An",
      shopName: "Bánh Mì Phượng",
      hours: "06:30 - 21:30",
      lat: 15.878,
      lng: 108.3285,
    },
    {
      id: "m2",
      order: 2,
      dishName: "Mì Quảng Tôm Thịt Trứng",
      shopName: "Mì Quảng Ông Hai",
      hours: "07:30 - 21:00",
      lat: 15.8775,
      lng: 108.3292,
    },
    {
      id: "m3",
      order: 3,
      dishName: "Trà Thảo Mộc Sả Chanh Cánh Sen",
      shopName: "Nước Mót Hội An",
      hours: "08:00 - 21:30",
      lat: 15.87818,
      lng: 108.32648,
    },
  ],
  noon: [
    {
      id: "n1",
      order: 1,
      dishName: "Cao Lầu Cổ Truyền Hội An",
      shopName: "Cao Lầu Không Gian Xanh",
      hours: "10:00 - 21:00",
      lat: 15.87815,
      lng: 108.32655,
    },
    {
      id: "n2",
      order: 2,
      dishName: "Cơm Gà Xé Phố Cổ",
      shopName: "Cơm Gà Bà Buội",
      hours: "10:30 - 20:00",
      lat: 15.8782,
      lng: 108.3265,
    },
    {
      id: "n3",
      order: 3,
      dishName: "Bánh Đập Hến Xào Cẩm Nam",
      shopName: "Bánh Đập Bà Già",
      hours: "11:00 - 17:00",
      lat: 15.8745,
      lng: 108.3342,
    },
  ],
  night: [
    {
      id: "e1",
      order: 1,
      dishName: "Bánh Vạc Hoa Hồng Trắng",
      shopName: "Nhà Hàng Bông Hồng Trắng",
      hours: "16:00 - 21:30",
      lat: 15.8812,
      lng: 108.3235,
    },
    {
      id: "e2",
      order: 2,
      dishName: "Thịt Xiên Nướng Bờ Sông Hoài",
      shopName: "Phố Đêm Nguyễn Phúc Chu",
      hours: "17:00 - 22:00",
      lat: 15.8768,
      lng: 108.3268,
    },
    {
      id: "e3",
      order: 3,
      dishName: "Chè Xí Mà Phù Cổ Truyền",
      shopName: "Gánh Chè Ông Thiều",
      hours: "17:30 - 22:00",
      lat: 15.8805,
      lng: 108.324,
    },
  ],
};

const DIETARY_OPTIONS: DietaryOption[] = [
  {
    id: "no_peanut",
    emoji: "🥜",
    label: "Dị ứng đậu phộng (Không lạc)",
    voiceText: "Tôi bị dị ứng đậu phộng, xin vui lòng không bỏ lạc",
  },
  {
    id: "no_spicy",
    emoji: "🌶️",
    label: "Không ăn cay (Không ớt)",
    voiceText: "Tôi không ăn được cay, xin đừng bỏ ớt và tương ớt",
  },
  {
    id: "vegan",
    emoji: "🥬",
    label: "Ăn thuần chay (Không thịt cá)",
    voiceText: "Tôi ăn thuần chay, xin không dùng thịt cá và nước mắm",
  },
  {
    id: "no_msg",
    emoji: "🧂",
    label: "Không bột ngọt (Mì chính)",
    voiceText: "Xin vui lòng không nêm bột ngọt mì chính vào món ăn",
  },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ lang?: string; dish?: string }>();

  const [lang, setLang] = useState<LangKey>((params.lang as LangKey) || "vi");
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

  const [activeSlot, setActiveSlot] = useState<TimeSlotKey>("morning");
  const [checkedStops, setCheckedStops] = useState<string[]>(["m3"]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([
    "no_peanut",
    "no_spicy",
  ]);
  const [tasteCardVisible, setTasteCardVisible] = useState<boolean>(false);

  const [user, setUser] = useState<{ name?: string; email?: string } | null>(
    null,
  );

  // Mỗi lần màn hình được focus (kể cả khi quay lại từ login/register) thì đọc lại tài khoản
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("userAccount")
        .then((s) => setUser(s ? JSON.parse(s) : null))
        .catch(() => setUser(null));
    }, []),
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userAccount");
    setUser(null);
  };

  const isDesktop = width >= 900;
  const numColumns = isDesktop ? 3 : width >= 600 ? 2 : 1;

  const filtered = useMemo(() => {
    return DISHES.filter((d) => {
      const matchCat = cat === "all" || d.cat === cat;
      const q = search.toLowerCase();
      const matchSearch = (d.name[lang] + d.name.vi + d.desc[lang])
        .toLowerCase()
        .includes(q);
      return matchCat && matchSearch;
    });
  }, [cat, search, lang]);

  const speakText = (text: string, customSpeechCode?: string) => {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = customSpeechCode || LANGS[lang].speechCode;
      window.speechSynthesis.speak(utter);
    } else if (!customSpeechCode) {
      router.push(`/dish/${selectedDish?.id || 1}?lang=${lang}`);
    }
  };

  const toggleStopCheckIn = (stopId: string) => {
    setCheckedStops((prev) =>
      prev.includes(stopId)
        ? prev.filter((id) => id !== stopId)
        : [...prev, stopId],
    );
  };

  const handleRouteAllThreeStops = () => {
    const stops = SCHEDULE_DATA[activeSlot];
    if (!stops || stops.length < 3) return;
    const origin = `${stops[0].lat},${stops[0].lng}`;
    const waypoint = `${stops[1].lat},${stops[1].lng}`;
    const destination = `${stops[2].lat},${stops[2].lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoint}&travelmode=walking`;
    Linking.openURL(url);
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
    if (chosen.length === 0) {
      return "Xin chào chủ quán Hội An, tôi có thể ăn được tất cả các nguyên liệu bình thường. Cảm ơn quán!";
    }
    return `Xin chào cô chú chủ quán Hội An! Nhờ quán lưu ý giúp tôi: ${chosen
      .map((c) => c.voiceText)
      .join(". ")}. Xin cảm ơn rất nhiều!`;
  };

  const handleOpenAndSpeakTasteCard = () => {
    setTasteCardVisible(true);
    speakText(buildChefVoiceMessage(), "vi-VN");
  };

  const qrTargetUrl = `${customUrl}?mobile=1&lang=${lang}${selectedDish ? `&dish=${selectedDish.id}` : ""}`;
  const qrImageUri = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(qrTargetUrl)}`;

  const currentStops = SCHEDULE_DATA[activeSlot];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.logoEmoji}>🏮</Text>
          <View>
            <Text style={styles.brandTitle}>HỘI AN FOOD MAP</Text>
            <Text style={styles.brandSub}>Thuyết Minh Tự Động Đa Ngôn Ngữ</Text>
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
              onPress={() => setLang(k)}
              style={[styles.langBtn, lang === k && styles.langBtnActive]}
            >
              <Text
                style={[styles.langBtnText, lang === k && { color: "#fff" }]}
              >
                {LANGS[k].flag} {LANGS[k].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.authRow}>
          <TouchableOpacity
            style={styles.qrTriggerBtn}
            onPress={() => setQrVisible(true)}
          >
            <Text style={styles.qrTriggerText}>📱 Quét QR Mobile</Text>
          </TouchableOpacity>

          {user ? (
            <>
              <View style={styles.userChip}>
                <Text style={styles.userChipText} numberOfLines={1}>
                  👤 {user.name || user.email}
                </Text>
              </View>
              <TouchableOpacity style={styles.loginBtn} onPress={handleLogout}>
                <Text style={styles.loginBtnText}>Đăng xuất</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push("/login" as any)}
              >
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => router.push("/register" as any)}
              >
                <Text style={styles.registerBtnText}>Đăng ký</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <FlatList
        key={numColumns}
        data={filtered}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.filterSection}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="🔍 Tìm món ăn Hội An..."
                placeholderTextColor="#a89a82"
                style={styles.searchInput}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catRow}
              >
                {[
                  ["all", "Tất cả (15)"],
                  ["main", "🍜 Món chính"],
                  ["snack", "🥟 Bánh & Ăn vặt"],
                  ["street", "🥖 Đường phố"],
                  ["sweet", "🍧 Chè & Đồ uống"],
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
            style={styles.card}
            onPress={() => setSelectedDish(item)}
            activeOpacity={0.88}
          >
            <Image source={{ uri: item.img }} style={styles.cardImg} />
            <View style={styles.cardBody}>
              <View style={styles.cardMeta}>
                <Text style={styles.cardPrice}>
                  {item.emoji} {item.price}
                </Text>
                <Text style={styles.cardRating}>★ {item.rating}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.name[lang]}</Text>
              <Text style={styles.cardSub}>{item.name.vi}</Text>
              <Text style={styles.cardDesc} numberOfLines={3}>
                {item.desc[lang]}
              </Text>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.listenBtn}
                  onPress={() => {
                    setSelectedDish(item);
                    speakText(item.desc[lang]);
                  }}
                >
                  <Text style={styles.listenBtnText}>🔊 Thuyết minh</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.qrMiniBtn}
                  onPress={() => {
                    setSelectedDish(item);
                    setQrVisible(true);
                  }}
                >
                  <Text style={styles.qrMiniText}>📱 QR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={styles.assistantSection}>
            <View style={styles.assistantHeaderRow}>
              <View style={styles.assistantTitleGroup}>
                <Text style={styles.assistantIcon}>🗓️</Text>
                <Text style={styles.assistantTitle}>
                  Trợ Lý Lịch Trình & Thẻ Khẩu Vị
                </Text>
              </View>
              <View style={styles.practicalBadge}>
                <Text style={styles.practicalBadgeText}>THỰC TIỄN</Text>
              </View>
            </View>

            <Text style={styles.assistantSub}>
              Gợi ý thực đơn theo 3 khung giờ trong ngày & tạo Thẻ khẩu vị giao
              tiếp trực tiếp với chủ quán Hội An.
            </Text>

            <View
              style={[
                styles.assistantGrid,
                isDesktop && styles.assistantGridDesktop,
              ]}
            >
              <View style={[styles.panelBox, isDesktop && { flex: 1 }]}>
                <View style={styles.slotTabsRow}>
                  {SCHEDULE_SLOTS.map((slot) => {
                    const isActive = activeSlot === slot.key;
                    return (
                      <TouchableOpacity
                        key={slot.key}
                        activeOpacity={0.85}
                        onPress={() => setActiveSlot(slot.key)}
                        style={[
                          styles.slotTabBtn,
                          isActive && styles.slotTabBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.slotTabTitle,
                            isActive && styles.slotTabTitleActive,
                          ]}
                        >
                          {slot.emoji} {slot.title}
                        </Text>
                        <Text
                          style={[
                            styles.slotTabTime,
                            isActive && styles.slotTabTimeActive,
                          ]}
                        >
                          {slot.timeRange}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.stopsList}>
                  {currentStops.map((stop) => {
                    const isChecked = checkedStops.includes(stop.id);
                    return (
                      <View key={stop.id} style={styles.stopCard}>
                        <View
                          style={[
                            styles.stopNumberBadge,
                            isChecked
                              ? styles.stopNumberBadgeDone
                              : styles.stopNumberBadgePending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.stopNumberText,
                              isChecked && { color: "#ffffff" },
                            ]}
                          >
                            {stop.order}
                          </Text>
                        </View>

                        <View style={styles.stopInfoCol}>
                          <Text style={styles.stopDishTitle}>
                            {stop.dishName}
                          </Text>
                          <Text style={styles.stopShopMeta}>
                            📍 {stop.shopName} • {stop.hours}
                          </Text>
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => toggleStopCheckIn(stop.id)}
                          style={[
                            styles.checkInActionBtn,
                            isChecked
                              ? styles.checkInActionBtnDone
                              : styles.checkInActionBtnPending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.checkInActionText,
                              isChecked
                                ? styles.checkInActionTextDone
                                : styles.checkInActionTextPending,
                            ]}
                          >
                            {isChecked ? "Đã Check-in" : "Check-in Ngay"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleRouteAllThreeStops}
                  style={styles.walkRouteBtn}
                >
                  <Text style={styles.walkRouteBtnText}>
                    🗺️ Dẫn Đường Đi Bộ Cả 3 Trạm Trong Lịch Trình
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.panelBox, isDesktop && { flex: 1 }]}>
                <View style={styles.dietaryHeaderRow}>
                  <View style={styles.dietaryPlusBadge}>
                    <Text style={styles.dietaryPlusIcon}>＋</Text>
                  </View>
                  <Text style={styles.dietaryPanelTitle}>
                    Thẻ Khẩu Vị & Dị Ứng Giao Tiếp Chủ Quán
                  </Text>
                </View>

                <Text style={styles.dietaryPanelSub}>
                  Chọn lưu ý ăn uống để tạo Thẻ chữ lớn & phát Giọng đọc AI cho
                  đầu bếp tại Hội An:
                </Text>

                <View style={styles.dietaryOptionsList}>
                  {DIETARY_OPTIONS.map((opt) => {
                    const isSelected = selectedDietary.includes(opt.id);
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
                          <Text style={styles.dietaryEmoji}>{opt.emoji}</Text>
                          <Text
                            style={[
                              styles.dietaryLabel,
                              isSelected && styles.dietaryLabelSelected,
                            ]}
                          >
                            {opt.label}
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
                </View>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleOpenAndSpeakTasteCard}
                  style={styles.openTasteCardBtn}
                >
                  <Text style={styles.openTasteCardBtnText}>
                    🔊 Mở Thẻ Đưa Chủ Quán Xem & Phát Giọng Đọc AI
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
                      🔊 Phát Giọng Đọc ({LANGS[lang].label})
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
                      🧭 Chỉ đường Google Maps
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedDish(null)}
                >
                  <Text style={styles.closeBtnText}>Đóng</Text>
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
                THẺ GIAO TIẾP CHỦ QUÁN HỘI AN
              </Text>
            </View>

            <Text style={styles.tasteModalHeading}>
              Xin chào Cô / Chú chủ quán!
            </Text>
            <Text style={styles.tasteModalSub}>
              Nhờ quán chế biến giúp món ăn theo lưu ý khẩu vị sau:
            </Text>

            <View style={styles.tasteLargeList}>
              {selectedDietary.length === 0 ? (
                <Text style={styles.tasteLargeItemText}>
                  ✅ Ăn uống bình thường, không kiêng cữ
                </Text>
              ) : (
                DIETARY_OPTIONS.filter((opt) =>
                  selectedDietary.includes(opt.id),
                ).map((opt) => (
                  <View key={opt.id} style={styles.tasteLargeItem}>
                    <Text style={styles.tasteLargeEmoji}>{opt.emoji}</Text>
                    <Text style={styles.tasteLargeItemText}>{opt.label}</Text>
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity
              style={styles.openTasteCardBtn}
              onPress={() => speakText(buildChefVoiceMessage(), "vi-VN")}
            >
              <Text style={styles.openTasteCardBtnText}>
                🔊 Phát Lại Giọng Đọc AI Cho Đầu Bếp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeBtn, { width: "100%", marginTop: 10 }]}
              onPress={() => setTasteCardVisible(false)}
            >
              <Text style={styles.closeBtnText}>Đóng Thẻ Khẩu Vị</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={qrVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalBox, { padding: 24, alignItems: "center" }]}
          >
            <Text style={styles.qrModalTitle}>
              📱 Quét Mã QR Trên Điện Thoại
            </Text>
            <Text style={styles.qrModalDesc}>
              Dùng Camera điện thoại hoặc Zalo quét mã QR dưới đây để mở ngay
              giao diện Mobile thuyết minh tự động ({LANGS[lang].label}).
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
              <Text style={styles.closeBtnText}>Đóng cửa sổ QR</Text>
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
  logoEmoji: { fontSize: 28 },
  brandTitle: { color: "#e9c26b", fontSize: 20, fontWeight: "bold" },
  brandSub: { color: "#a89a82", fontSize: 11 },
  langBar: { flexDirection: "row", gap: 6, paddingVertical: 4 },
  langBtn: {
    paddingHorizontal: 10,
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
    gap: 8,
    flex: 1,
  },
  assistantIcon: { fontSize: 20 },
  assistantTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
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
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  dietaryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  dietaryPlusBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  dietaryPlusIcon: {
    color: "#090505",
    fontWeight: "900",
    fontSize: 15,
    lineHeight: 17,
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
    gap: 10,
    flex: 1,
  },
  dietaryEmoji: {
    fontSize: 18,
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
    backgroundColor: "#9ca3af",
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
  },
  cardImg: { width: "100%", height: 170 },
  cardBody: { padding: 14, gap: 6 },
  cardMeta: { flexDirection: "row", justifyContent: "space-between" },
  cardPrice: { color: "#e9c26b", fontSize: 12, fontWeight: "bold" },
  cardRating: { color: "#e9c26b", fontSize: 12, fontWeight: "bold" },
  cardTitle: { color: "#f5ead4", fontSize: 20, fontWeight: "bold" },
  cardSub: { color: "#a89a82", fontSize: 12 },
  cardDesc: { color: "#d6c7b2", fontSize: 13, lineHeight: 19 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 8 },
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
    gap: 12,
  },
  tasteLargeEmoji: {
    fontSize: 26,
  },
  tasteLargeItemText: {
    color: "#34d399",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
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
