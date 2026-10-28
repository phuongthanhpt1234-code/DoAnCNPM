import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dish, LANGS, LangKey } from "../../data/dishesData";
import {
  API_URL,
  api,
  ApiDish,
  notifyPresenceLangChange,
  startPresenceSession,
} from "../../services/api";
import { playSpeech, stopSpeech } from "../../services/speech";

export default function DishDetailScreen() {
  const router = useRouter();
  const { id, lang: paramLang } = useLocalSearchParams<{
    id: string;
    lang?: string;
  }>();

  const [lang, setLang] = useState<LangKey>(
    (paramLang as LangKey) || "vi",
  );
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    const cleanup = startPresenceSession(() => lang);
    return () => {
      cleanup?.();
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    notifyPresenceLangChange(lang);
  }, [lang]);

  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy mã món ăn");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    api<ApiDish>(`/dishes/${id}`)
      .then((row) => {
        if (cancelled) return;
        if (!row || !row.id) {
          setError("Món ăn không tồn tại hoặc đã bị gỡ khỏi hệ thống");
          setDish(null);
          return;
        }

        const fallbackImg =
          "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800";

        let rawImg = (row.image_url || "").trim();
        if (rawImg.includes("/uploads/")) {
          const uploadPart = rawImg.slice(rawImg.indexOf("/uploads/"));
          rawImg = `${API_URL}${uploadPart}`;
        } else if (rawImg.startsWith("http://doancnpm-backend.onrender.com")) {
          rawImg = rawImg.replace("http://", "https://");
        }
        const dishImg = rawImg || fallbackImg;

        const rowNameObj: Record<LangKey, string> = {
          vi: row.name || "",
          en: row.name_i18n?.en || row.name || "",
          zh: row.name_i18n?.zh || row.name || "",
          ko: row.name_i18n?.ko || row.name || "",
          ja: row.name_i18n?.ja || row.name || "",
        };

        const rowDescObj: Record<LangKey, string> = {
          vi: row.description || "",
          en: row.desc_i18n?.en || row.description || "",
          zh: row.desc_i18n?.zh || row.description || "",
          ko: row.desc_i18n?.ko || row.description || "",
          ja: row.desc_i18n?.ja || row.description || "",
        };

        setDish({
          id: row.id,
          cat: (row.category_slug as Dish["cat"]) || "main",
          emoji: row.emoji || "🍜",
          price:
            row.price_vnd != null
              ? Number(row.price_vnd).toLocaleString("vi-VN") + "đ"
              : "Đang cập nhật",
          rating: row.rating != null ? Number(row.rating) : 4.8,
          lat: row.lat != null ? Number(row.lat) : 15.877,
          lng: row.lng != null ? Number(row.lng) : 108.327,
          img: dishImg,
          fallbackImg,
          address: row.address || "Phố cổ Hội An",
          name: rowNameObj,
          desc: rowDescObj,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể kết nối đến máy chủ để tải thông tin món",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleToggleVoice = () => {
    if (!dish) return;
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    const textToSpeak = dish.desc[lang] || dish.desc.vi || dish.name[lang] || dish.name.vi;
    const speechCode = LANGS[lang]?.speechCode || "vi-VN";
    playSpeech(textToSpeak, speechCode, 1.0, (speaking) => {
      setIsSpeaking(speaking);
    });
  };

  const openGoogleMaps = () => {
    if (!dish) return;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${dish.lat},${dish.lng}`,
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e9c26b" />
        <Text style={styles.loadingText}>Đang tải chi tiết món ăn...</Text>
      </View>
    );
  }

  if (error || !dish) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Không tìm thấy món ăn</Text>
        <Text style={styles.errorSub}>
          {error || "Món ăn này không tồn tại trong hệ thống ẩm thực Hội An."}
        </Text>
        <TouchableOpacity style={styles.backActionBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#090505" />
          <Text style={styles.backActionText}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentName = dish.name[lang] || dish.name.vi;
  const currentDesc = dish.desc[lang] || dish.desc.vi;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imgWrap}>
        <Image
          source={{ uri: dish.img }}
          style={styles.image}
          resizeMode="cover"
          onError={() => {
            const fallback =
              dish.fallbackImg ||
              "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800";
            if (dish.img !== fallback) {
              setDish((prev) => (prev ? { ...prev, img: fallback } : null));
            }
          }}
        />
        <TouchableOpacity
          style={styles.floatingBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Thanh chuyển đổi 5 ngôn ngữ */}
      <View style={styles.langRow}>
        {Object.entries(LANGS).map(([key, item]) => (
          <TouchableOpacity
            key={key}
            onPress={() => {
              setLang(key as LangKey);
              if (isSpeaking) {
                stopSpeech();
                setIsSpeaking(false);
              }
            }}
            style={[styles.langBtn, lang === key && styles.langBtnActive]}
          >
            <Text
              style={[styles.langText, lang === key && styles.langTextActive]}
            >
              {key.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{currentName}</Text>
        {dish.address ? (
          <Text style={styles.address}>📍 {dish.address}</Text>
        ) : null}

        {/* Cụm nút Thuyết minh AI phát âm thanh thực tế */}
        <TouchableOpacity
          style={[styles.voiceBtn, isSpeaking && styles.voiceBtnActive]}
          onPress={handleToggleVoice}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isSpeaking ? "pause-circle" : "volume-high"}
            size={22}
            color="#ffffff"
          />
          <Text style={styles.voiceBtnText}>
            {isSpeaking
              ? "Đang phát thuyết minh (Bấm để tạm dừng)"
              : `Phát thuyết minh giọng đọc (${LANGS[lang].label})`}
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>
            Nội dung thuyết minh ({LANGS[lang].label})
          </Text>
          <Text style={styles.desc}>
            {currentDesc || "Nội dung thuyết minh đang được cập nhật."}
          </Text>
        </View>

        <TouchableOpacity style={styles.mapBtn} onPress={openGoogleMaps}>
          <Ionicons name="navigate" size={18} color="#090505" />
          <Text style={styles.mapBtnText}>
            Chỉ đường đến quán (Google Maps)
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090505" },
  centerContainer: {
    flex: 1,
    backgroundColor: "#090505",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    color: "#e9c26b",
    fontSize: 15,
    marginTop: 14,
    fontWeight: "600",
  },
  errorTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 14,
  },
  errorSub: {
    color: "#a89a82",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  backActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e9c26b",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backActionText: { color: "#090505", fontWeight: "bold", fontSize: 14 },
  imgWrap: { position: "relative", width: "100%", height: 260 },
  image: { width: "100%", height: "100%" },
  floatingBackBtn: {
    position: "absolute",
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  langRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "#160c0c",
    borderBottomWidth: 1,
    borderBottomColor: "#e9c26b22",
  },
  langBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e9c26b44",
  },
  langBtnActive: { backgroundColor: "#d4152f", borderColor: "#e9c26b" },
  langText: { color: "#a89a82", fontSize: 12, fontWeight: "600" },
  langTextActive: { color: "#fff" },
  body: { padding: 20, gap: 14 },
  title: { color: "#f5ead4", fontSize: 26, fontWeight: "bold" },
  address: { color: "#e9c26b", fontSize: 13, marginBottom: 2 },
  voiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#d4152f",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  voiceBtnActive: { backgroundColor: "#059669" },
  voiceBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  card: {
    backgroundColor: "#160c0c",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e9c26b33",
  },
  sectionHeader: {
    color: "#e9c26b",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  desc: { color: "#f5ead4", fontSize: 15, lineHeight: 24 },
  mapBtn: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#e9c26b",
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  mapBtnText: { color: "#090505", fontWeight: "bold", fontSize: 15 },
});
