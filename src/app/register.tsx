import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Đánh giá độ mạnh mật khẩu trực quan
  const getPasswordStrength = () => {
    if (!password) return { label: "Chưa nhập", color: "#555", width: "0%" };
    if (password.length < 6)
      return { label: "Yếu (Cần >= 6 ký tự)", color: "#EF4444", width: "33%" };
    if (password.length < 9)
      return { label: "Khá an toàn", color: "#F59E0B", width: "66%" };
    return { label: "Mạnh • Bảo mật cao", color: "#10B981", width: "100%" };
  };

  const handleRegister = async () => {
    setMessage("");
    if (!name.trim() || !email.trim() || !password) {
      setIsSuccess(false);
      setMessage("⚠️ Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu!");
      return;
    }
    if (!email.includes("@")) {
      setIsSuccess(false);
      setMessage("⚠️ Định dạng Email chưa hợp lệ!");
      return;
    }
    if (password.length < 6) {
      setIsSuccess(false);
      setMessage("⚠️ Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setIsSuccess(false);
      setMessage("❌ Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const userData = {
        name: name.trim(),
        email: email.trim(),
        password,
      };
      await AsyncStorage.setItem("userAccount", JSON.stringify(userData));

      setIsSuccess(true);
      setMessage(
        "🎉 Khởi tạo Hộ Chiếu Ẩm Thực thành công! Đang vào trang chủ...",
      );

      setTimeout(() => {
        router.replace("/" as any);
      }, 1000);
    } catch (error) {
      setIsSuccess(false);
      setMessage("❌ Lỗi hệ thống khi lưu tài khoản.");
    }
  };

  const strength = getPasswordStrength();

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1559592413-7ce470e4e201?q=80&w=1000&auto=format&fit=crop",
      }}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={22} color="#FFF" />
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 13,
                  fontWeight: "bold",
                  marginLeft: 4,
                }}
              >
                Quay lại
              </Text>
            </TouchableOpacity>

            <View style={styles.headerContainer}>
              <Text style={styles.logoTitle}>THEO DẤU VỊ HỘI</Text>
              <Text style={styles.welcomeText}>
                Lưu trữ huy hiệu Food-Trail & Thuyết minh đa ngôn ngữ
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Họ và tên hiển thị</Text>
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
                  placeholderTextColor="#777"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text style={styles.inputLabel}>Địa chỉ Email</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: tritrungbaclieu@gmail.com"
                  placeholderTextColor="#777"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Text style={styles.inputLabel}>Mật khẩu bảo mật</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tối thiểu 6 ký tự"
                  placeholderTextColor="#777"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#D4AF37"
                  />
                </TouchableOpacity>
              </View>

              {/* Thanh đo độ mạnh mật khẩu */}
              {password.length > 0 && (
                <View style={styles.strengthBox}>
                  <View style={styles.strengthBarBg}>
                    <View
                      style={[
                        styles.strengthBarFill,
                        {
                          width: strength.width as any,
                          backgroundColor: strength.color,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={{
                      color: strength.color,
                      fontSize: 11,
                      fontWeight: "bold",
                      marginTop: 4,
                    }}
                  >
                    Độ bảo mật: {strength.label}
                  </Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#777"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {message ? (
                <View
                  style={[
                    styles.msgBox,
                    { borderColor: isSuccess ? "#10B981" : "#F87171" },
                  ]}
                >
                  <Text
                    style={{
                      color: isSuccess ? "#34D399" : "#F87171",
                      fontSize: 13,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {message}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.registerBtn}
                onPress={handleRegister}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="sparkles"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.registerBtnText}>
                  TẠO TÀI KHOẢN & VÀO NGAY
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push("/login" as any)}>
                <Text style={styles.loginText}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 12, 10, 0.92)",
  },
  container: { flex: 1, maxWidth: 480, width: "100%", alignSelf: "center" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 25,
  },
  backBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },

  headerContainer: { alignItems: "center", marginBottom: 20 },
  logoTitle: {
    fontSize: 26,
    fontWeight: "900",
    fontFamily: "serif",
    color: "#D4AF37",
    letterSpacing: 2,
  },
  welcomeText: {
    color: "#C2B8B0",
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
  },

  formContainer: {
    width: "100%",
    backgroundColor: "#1C1815",
    padding: 22,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#332B25",
  },
  inputLabel: {
    color: "#C2B8B0",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#120F0D",
    borderWidth: 1,
    borderColor: "#332B25",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#FFF", fontSize: 15 },

  strengthBox: { marginBottom: 12, paddingHorizontal: 4 },
  strengthBarBg: {
    height: 5,
    backgroundColor: "#332B25",
    borderRadius: 3,
    overflow: "hidden",
  },
  strengthBarFill: { height: "100%", borderRadius: 3 },

  msgBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    marginBottom: 14,
  },
  registerBtn: {
    flexDirection: "row",
    backgroundColor: "#D4AF37",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  registerBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
  footerText: { color: "#C2B8B0", fontSize: 14 },
  loginText: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
