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
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, fallbackDish]);

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
        <Text style={styles.title}>{dish.name[lang] || dish.name.vi}</Text>
        <Text style={styles.subtitle}>Tên gốc: {dish.name.vi}</Text>

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
