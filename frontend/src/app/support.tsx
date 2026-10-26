import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function SupportScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [topic, setTopic] = useState("Đề xuất quán ngon Hội An");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const topics = [
    "Đề xuất quán ngon Hội An",
    "Góp ý tính năng thuyết minh AI",
    "Báo lỗi tọa độ bản đồ GPS",
  ];

  const handleSubmit = async () => {
    if (!content.trim()) {
      setIsSuccess(false);
      setMessage("⚠️ Vui lòng nhập nội dung góp ý của bạn!");
      return;
    }

    try {
      const existing = await AsyncStorage.getItem("userFeedbacks");
      const list = existing ? JSON.parse(existing) : [];
      list.push({
        id: String(Date.now()),
        topic,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem("userFeedbacks", JSON.stringify(list));
      setIsSuccess(true);
      setMessage("🎉 Cảm ơn bạn! Góp ý đã được gửi tới đội ngũ phát triển.");
      setContent("");
      setTimeout(() => router.back(), 1000);
    } catch {
      setIsSuccess(false);
      setMessage("❌ Lỗi khi gửi góp ý.");
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.container, isDesktop && { maxWidth: 720 }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hỗ Trợ & Gửi Góp Ý</Text>
          <View style={{ width: 34 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.formContainer}>
              <Text style={styles.label}>Chọn chủ đề góp ý</Text>
              <View style={styles.topicWrap}>
                {topics.map((t) => {
                  const active = topic === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.topicChip,
                        active && styles.topicChipActive,
                      ]}
                      onPress={() => setTopic(t)}
                    >
                      <Text
                        style={[
                          styles.topicText,
                          active && { color: "#120F0D" },
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Nội dung chi tiết</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Nhập tên quán ăn, địa chỉ hẻm hoặc ý kiến đóng góp của bạn..."
                placeholderTextColor="#888"
                multiline
                value={content}
                onChangeText={setContent}
              />

              {message ? (
                <Text
                  style={[
                    styles.messageText,
                    { color: isSuccess ? "#10B981" : "#FF6B6B" },
                  ]}
                >
                  {message}
                </Text>
              ) : null}

              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                <Ionicons
                  name="send"
                  size={18}
                  color="#120F0D"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveBtnText}>GỬI GÓP Ý NGAY</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#120F0D" },
  container: { flex: 1, width: "100%", maxWidth: 480, alignSelf: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1A17",
  },
  backBtn: { padding: 5 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "serif",
    color: "#FFF",
  },
  content: { flexGrow: 1, padding: 20, justifyContent: "center" },
  formContainer: {
    backgroundColor: "#1E1A17",
    padding: 25,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#332B25",
  },
  label: {
    color: "#A9A9A9",
    fontSize: 13,
    marginBottom: 10,
    fontWeight: "bold",
  },
  topicWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  topicChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#120F0D",
    borderWidth: 1,
    borderColor: "#332B25",
  },
  topicChipActive: { backgroundColor: "#D4AF37", borderColor: "#D4AF37" },
  topicText: { color: "#FFF", fontSize: 13, fontWeight: "bold" },
  textArea: {
    backgroundColor: "#120F0D",
    borderWidth: 1,
    borderColor: "#332B25",
    borderRadius: 16,
    padding: 15,
    color: "#FFF",
    fontSize: 15,
    height: 140,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  messageText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 15,
  },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#D4AF37",
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#120F0D",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
