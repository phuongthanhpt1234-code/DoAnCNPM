import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { DISHES, Dish, LANGS, LangKey } from "../../data/dishesData";
import {
  api,
  ApiDish,
  getClientDeviceId,
  notifyPresenceLangChange,
  startPresenceSession,
} from "../../services/api";

export default function DishDetailScreen() {
  const { id, lang: paramLang } = useLocalSearchParams<{
    id: string;
    lang?: string;
  }>();
  const [lang, setLang] = useState<LangKey>(
    (paramLang as LangKey) || "vi",
  );
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const cleanup = startPresenceSession(() => lang);
    return cleanup;
  }, []);

  useEffect(() => {
    notifyPresenceLangChange(lang);
  }, [lang]);

  const fallbackDish = DISHES.find((d) => d.id === Number(id)) || DISHES[0];
  const [dish, setDish] = useState<Dish>(fallbackDish);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const deviceId = getClientDeviceId();

    api<ApiDish>(`/dishes/${id}`)
      .then((row) => {
        if (cancelled || !row) return;
        setDish({
          id: row.id,
          cat: (row.category_slug as Dish["cat"]) || fallbackDish.cat,
          emoji: row.emoji || fallbackDish.emoji,
          price:
            row.price_vnd != null
              ? Number(row.price_vnd).toLocaleString("vi-VN") + "đ"
              : fallbackDish.price,
          rating: row.rating != null ? Number(row.rating) : fallbackDish.rating,
          lat: row.lat != null ? Number(row.lat) : fallbackDish.lat,
          lng: row.lng != null ? Number(row.lng) : fallbackDish.lng,
          img: row.image_url || fallbackDish.img,
          name: row.name_i18n || fallbackDish.name,
          desc: row.desc_i18n || fallbackDish.desc,
          favorite_count: Number(row.favorite_count || 0),
        });
        setFavoriteCount(Number(row.favorite_count || 0));
      })
      .catch(() => {});

    api<any[]>(`/favorites?device_id=${encodeURIComponent(deviceId)}`)
      .then((favs) => {
        if (cancelled || !Array.isArray(favs)) return;
        setIsFavorited(favs.some((f) => String(f.id) === String(id)));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id, fallbackDish]);

  const toggleFavorite = async () => {
    const next = !isFavorited;
    const deviceId = getClientDeviceId();
    setIsFavorited(next);
    setFavoriteCount((prev) => Math.max(0, prev + (next ? 1 : -1)));

    try {
      if (next) {
        await api("/favorites", {
          method: "POST",
          body: JSON.stringify({ device_id: deviceId, dish_id: Number(id) }),
        });
      } else {
        await api(
          `/favorites/${id}?device_id=${encodeURIComponent(deviceId)}`,
          { method: "DELETE" },
        );
      }
    } catch (e) {
      console.warn("Toggle favorite error:", e);
    }
  };

  const openGoogleMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${dish.lat},${dish.lng}`,
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: dish.img }} style={styles.image} />

      {/* Thanh chuyển đổi 5 ngôn ngữ ngay trên Mobile */}
      <View style={styles.langRow}>
        {Object.entries(LANGS).map(([key, item]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setLang(key as LangKey)}
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
        <View style={styles.titleRow}>
          <Text style={[styles.title, { flex: 1 }]}>
            {dish.name[lang] || dish.name.vi}
          </Text>
          <TouchableOpacity
            style={[styles.favBtn, isFavorited && styles.favBtnActive]}
            onPress={toggleFavorite}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 14 }}>{isFavorited ? "❤️" : "🤍"}</Text>
            <Text style={[styles.favBtnText, isFavorited && { color: "#fff" }]}>
              {favoriteCount} {lang === "vi" ? "yêu thích" : "likes"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>
            Nội dung thuyết minh ({LANGS[lang].label})
          </Text>
          <Text style={styles.desc}>{dish.desc[lang] || dish.desc.vi}</Text>
        </View>

        <TouchableOpacity style={styles.mapBtn} onPress={openGoogleMaps}>
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
  image: { width: "100%", height: 240 },
  langRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "#160c0c",
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
  body: { padding: 20, gap: 12 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  favBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(30, 26, 23, 0.8)",
    borderWidth: 1,
    borderColor: "#e9c26b55",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  favBtnActive: {
    backgroundColor: "rgba(185, 28, 28, 0.9)",
    borderColor: "#e11d48",
  },
  favBtnText: {
    color: "#e9c26b",
    fontSize: 13,
    fontWeight: "700",
  },
  price: { color: "#e9c26b", fontSize: 14, fontWeight: "600" },
  title: { color: "#f5ead4", fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "#a89a82", fontSize: 13 },
  card: {
    backgroundColor: "#160c0c",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e9c26b33",
    marginTop: 8,
  },
  sectionHeader: {
    color: "#e9c26b",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  desc: { color: "#f5ead4", fontSize: 16, lineHeight: 26 },
  mapBtn: {
    backgroundColor: "#e9c26b",
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: "center",
    marginTop: 12,
  },
  mapBtnText: { color: "#090505", fontWeight: "bold", fontSize: 15 },
});
