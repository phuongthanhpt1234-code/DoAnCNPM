import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function EditProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("userAccount");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setName(parsedData.name || "Trương Trí Trung");
          setBio(parsedData.bio || "Khoa CNTT - Đại học Sài Gòn");
          setEmail(parsedData.email || "tritrungbaclieu@gmail.com");
        } else {
          setName("Trương Trí Trung");
          setBio("Khoa CNTT - Đại học Sài Gòn");
          setEmail("tritrungbaclieu@gmail.com");
        }
      } catch {}
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    setMessage("");
    if (!name.trim()) {
      setIsSuccess(false);
      setMessage("⚠️ Họ và tên không được để trống!");
      return;
    }

    try {
      const storedData = await AsyncStorage.getItem("userAccount");
      const currentUser = storedData ? JSON.parse(storedData) : {};
      const updatedUser = {
        ...currentUser,
        name: name.trim(),
        bio: bio.trim(),
        email: email.trim(),
      };
      await AsyncStorage.setItem("userAccount", JSON.stringify(updatedUser));
      setIsSuccess(true);
      setMessage("🎉 Đã cập nhật thông tin hồ sơ thành công!");
      setTimeout(() => router.back(), 900);
    } catch {
      setIsSuccess(false);
      setMessage("❌ Lỗi hệ thống khi lưu dữ liệu.");
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
          <Text style={styles.headerTitle}>Chỉnh Sửa Thông Tin</Text>
          <View style={{ width: 34 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.formContainer}>
              <Text style={styles.label}>Họ và tên hiển thị</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: Trương Trí Trung"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text style={styles.label}>Email liên hệ</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập địa chỉ email"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Text style={styles.label}>Thông tin giới thiệu / Tiểu sử</Text>
              <View
                style={[
                  styles.inputBox,
                  { height: 90, alignItems: "flex-start", paddingTop: 14 },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    { height: "100%", textAlignVertical: "top" },
                  ]}
                  placeholder="Ví dụ: Khoa CNTT - Đại học Sài Gòn..."
                  placeholderTextColor="#888"
                  multiline
                  value={bio}
                  onChangeText={setBio}
                />
              </View>

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

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>LƯU THAY ĐỔI</Text>
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
    marginBottom: 8,
    marginLeft: 5,
    fontWeight: "bold",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#120F0D",
    borderWidth: 1,
    borderColor: "#332B25",
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 55,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#FFF", fontSize: 15 },
  messageText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 15,
  },
  saveBtn: {
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
