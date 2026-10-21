import React, { useState } from "react";
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
import { DISHES, LANGS } from "../../data/dishesData";

export default function DishDetailScreen() {
  const { id, lang: paramLang } = useLocalSearchParams<{
    id: string;
    lang?: string;
  }>();
  const [lang, setLang] = useState<"vi" | "en" | "zh" | "ko" | "ja">(
    (paramLang as any) || "vi",
  );

  const dish = DISHES.find((d) => d.id === Number(id)) || DISHES[0];

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
            onPress={() => setLang(key as any)}
            style={[styles.langBtn, lang === key && styles.langBtnActive]}
          >
            <Text
              style={[styles.langText, lang === key && styles.langTextActive]}
            >
              {item.flag} {key.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.body}>
        <Text style={styles.price}>
          {dish.emoji} {dish.price} · ★ {dish.rating}
        </Text>
        <Text style={styles.title}>{dish.name[lang]}</Text>
        <Text style={styles.subtitle}>Tên gốc: {dish.name.vi}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>
            🎧 Nội dung thuyết minh ({LANGS[lang].label})
          </Text>
          <Text style={styles.desc}>{dish.desc[lang]}</Text>
        </View>

        <TouchableOpacity style={styles.mapBtn} onPress={openGoogleMaps}>
          <Text style={styles.mapBtnText}>
            🧭 Chỉ đường đến quán (Google Maps)
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
