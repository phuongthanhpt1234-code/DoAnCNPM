import React, { useState, useMemo } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { DISHES, LANGS, LangKey, Dish } from "../data/dishesData";

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

  // Phát giọng nói đa ngôn ngữ (Tự động hỗ trợ Web Speech API)
  const speakText = (text: string) => {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = LANGS[lang].speechCode;
      window.speechSynthesis.speak(utter);
    } else {
      router.push(`/dish/${selectedDish?.id || 1}?lang=${lang}`);
    }
  };

  // Đường link nhúng vào mã QR để điện thoại quét
  const qrTargetUrl = `${customUrl}?mobile=1&lang=${lang}${selectedDish ? `&dish=${selectedDish.id}` : ""}`;
  const qrImageUri = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(qrTargetUrl)}`;

  return (
    <View style={styles.container}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.logoEmoji}>🏮</Text>
          <View>
            <Text style={styles.brandTitle}>HỘI AN FOOD MAP</Text>
            <Text style={styles.brandSub}>Thuyết Minh Tự Động Đa Ngôn Ngữ</Text>
          </View>
        </View>

        {/* CHỌN 5 NGÔN NGỮ */}
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

        {/* NÚT HIỆN MÃ QR TRÊN WEB ĐỂ ĐIỆN THOẠI QUÉT */}
        <TouchableOpacity
          style={styles.qrTriggerBtn}
          onPress={() => setQrVisible(true)}
        >
          <Text style={styles.qrTriggerText}>📱 Quét QR Mobile</Text>
        </TouchableOpacity>
      </View>

      {/* THANH TÌM KIẾM & DANH MỤC */}
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
              style={[styles.catChip, cat === key && styles.catChipActive]}
            >
              <Text
                style={[styles.catChipText, cat === key && { color: "#fff" }]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* DANH SÁCH 15 MÓN ĂN */}
      <FlatList
        key={numColumns}
        data={filtered}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
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
      />

      {/* MODAL THUYẾT MINH CHI TIẾT MÓN ĂN */}
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

      {/* MODAL HIỂN THỊ MÃ QR ĐỂ QUÉT TRÊN ĐIỆN THOẠI */}
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

            <Text style={styles.urlHint}>
              Địa chỉ kết nối (Đổi localhost thành IP Wi-Fi máy tính nếu quét
              trong mạng LAN):
            </Text>
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
  filterSection: { padding: 14, gap: 10 },
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
  urlHint: {
    color: "#a89a82",
    fontSize: 11,
    alignSelf: "flex-start",
    marginTop: 6,
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
