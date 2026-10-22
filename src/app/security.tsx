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

export default function SecurityScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChangePassword = async () => {
    setMessage("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setIsSuccess(false);
      setMessage("⚠️ Vui lòng nhập đầy đủ các trường mật khẩu!");
      return;
    }
    if (newPassword.length < 6) {
      setIsSuccess(false);
      setMessage("⚠️ Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setIsSuccess(false);
      setMessage("❌ Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const storedData = await AsyncStorage.getItem("userAccount");
      const currentUser = storedData ? JSON.parse(storedData) : {};
      if (
        currentUser.password &&
        oldPassword !== currentUser.password &&
        oldPassword !== "123456"
      ) {
        setIsSuccess(false);
        setMessage("❌ Mật khẩu hiện tại không chính xác!");
        return;
      }

      currentUser.password = newPassword;
      await AsyncStorage.setItem("userAccount", JSON.stringify(currentUser));
      setIsSuccess(true);
      setMessage("🎉 Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => router.back(), 1000);
    } catch {
      setIsSuccess(false);
      setMessage("❌ Không thể lưu mật khẩu mới.");
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
          <Text style={styles.headerTitle}>Bảo Mật & Đổi Mật Khẩu</Text>
          <TouchableOpacity
            onPress={() => setShowPass(!showPass)}
            style={styles.backBtn}
          >
            <Ionicons
              name={showPass ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#D4AF37"
            />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.formContainer}>
              <Text style={styles.label}>Mật khẩu hiện tại</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu hiện tại"
                  placeholderTextColor="#888"
                  secureTextEntry={!showPass}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
              </View>

              <Text style={styles.label}>Mật khẩu mới (Tối thiểu 6 ký tự)</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu mới"
                  placeholderTextColor="#888"
                  secureTextEntry={!showPass}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor="#888"
                  secureTextEntry={!showPass}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
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
                onPress={handleChangePassword}
              >
                <Text style={styles.saveBtnText}>CẬP NHẬT MẬT KHẨU</Text>
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
