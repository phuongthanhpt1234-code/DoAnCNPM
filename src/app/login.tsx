import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Thêm @ts-ignore để vô hiệu hóa lỗi "Cannot find module" của TypeScript
// @ts-ignore
import * as Facebook from "expo-auth-session/providers/facebook";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
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

// Đã xóa 1 dòng bị lặp, chỉ giữ lại 1 dòng duy nhất
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: "123456789012345",
  });

  // Tự động điền email đã lưu nếu có
  useEffect(() => {
    AsyncStorage.getItem("userAccount").then((stored) => {
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) setEmail(parsed.email);
      }
    });
  }, []);

  useEffect(() => {
    if (response && response.type === "success") {
      const fetchFacebookUserData = async () => {
        try {
          const { access_token } = response.params;
          const fbResponse = await fetch(
            `https://graph.facebook.com/me?access_token=${access_token}&fields=id,name,email,picture.type(large)`,
          );
          const fbUser = await fbResponse.json();
          const userData = {
            name: fbUser.name,
            email: fbUser.email || "fb_user@hoian.vn",
            avatar: fbUser.picture?.data?.url,
          };
          await AsyncStorage.setItem("userAccount", JSON.stringify(userData));
          setIsSuccess(true);
          setMessage(`🎉 Chào mừng ${fbUser.name}!`);
          setTimeout(() => router.replace("/" as any), 1000);
        } catch (error) {
          setIsSuccess(false);
          setMessage("❌ Không thể kết nối Facebook Graph API.");
        }
      };
      fetchFacebookUserData();
    }
  }, [response]);

  const handleLogin = async () => {
    setMessage("");
    if (!email.trim() || !password.trim()) {
      setIsSuccess(false);
      setMessage("⚠️ Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    try {
      const storedData = await AsyncStorage.getItem("userAccount");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (
          email.toLowerCase() === (parsed.email || "").toLowerCase() &&
          password === parsed.password
        ) {
          setIsSuccess(true);
          setMessage("🎉 Đăng nhập thành công! Đang vào Phố Cổ...");
          setTimeout(() => router.replace("/" as any), 800);
          return;
        }
      }
      // Cho phép tài khoản mặc định luôn đăng nhập được để không bị kẹt khi demo
      if (
        email.toLowerCase() === "tritrungbaclieu@gmail.com" ||
        password === "123456"
      ) {
        const defaultUser = {
          name: "Trương Trí Trung",
          bio: "Khoa CNTT - Đại học Sài Gòn",
          email: email.trim(),
          password: password,
        };
        await AsyncStorage.setItem("userAccount", JSON.stringify(defaultUser));
        setIsSuccess(true);
        setMessage("🎉 Đăng nhập thành công!");
        setTimeout(() => router.replace("/" as any), 800);
      } else {
        setIsSuccess(false);
        setMessage(
          "❌ Email hoặc mật khẩu chưa đúng (Hoặc bấm nút Demo bên dưới)!",
        );
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage("❌ Lỗi truy xuất dữ liệu.");
    }
  };

  // Nút đăng nhập nhanh 1 chạm phục vụ thuyết trình đồ án
  const handleQuickDemoLogin = async () => {
    const demoUser = {
      name: "Trương Trí Trung",
      bio: "Khoa CNTT - Đại học Sài Gòn",
      email: "tritrungbaclieu@gmail.com",
      password: "123456",
    };
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    await AsyncStorage.setItem("userAccount", JSON.stringify(demoUser));
    setIsSuccess(true);
    setMessage("⚡ Đã kích hoạt Tài khoản Demo! Đang chuyển trang...");
    setTimeout(() => router.replace("/" as any), 700);
  };

  const handleQuickSocialSim = async (provider: string) => {
    const socialUser = {
      name: `Trương Trí Trung (${provider})`,
      bio: "Thực Khách Sành Ăn • Hội An",
      email: `tritrung.${provider.toLowerCase()}@gmail.com`,
    };
    await AsyncStorage.setItem("userAccount", JSON.stringify(socialUser));
    setIsSuccess(true);
    setMessage(`🎉 Đã xác thực qua ${provider}! Đang vào ứng dụng...`);
    setTimeout(() => router.replace("/" as any), 800);
  };

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
            <View style={styles.headerContainer}>
              <View style={styles.logoBadge}>
                <Ionicons name="restaurant" size={34} color="#120F0D" />
              </View>
              <Text style={styles.logoTitle}>THEO DẤU VỊ HỘI</Text>
              <Text style={styles.logoSubtitle}>
                HỘ CHIẾU DI SẢN ẨM THỰC HỘI AN
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formHeading}>Đăng Nhập Tài Khoản</Text>

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
                  placeholder="ví dụ: tritrungbaclieu@gmail.com"
                  placeholderTextColor="#777"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#D4AF37"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu của bạn"
                  placeholderTextColor="#777"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#D4AF37"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <Ionicons
                    name={rememberMe ? "checkbox" : "square-outline"}
                    size={18}
                    color="#D4AF37"
                  />
                  <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
                </TouchableOpacity>
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
                style={styles.loginBtn}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.loginBtnText}>ĐĂNG NHẬP NGAY</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#120F0D"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />

                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}></View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Bạn chưa có Hộ chiếu Ẩm thực?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/register" as any)}>
                <Text style={styles.registerText}>Đăng ký tài khoản</Text>
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
    backgroundColor: "rgba(15, 12, 10, 0.90)",
  },
  container: { flex: 1, maxWidth: 480, width: "100%", alignSelf: "center" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
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

  headerContainer: { alignItems: "center", marginBottom: 25 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: "900",
    fontFamily: "serif",
    color: "#D4AF37",
    letterSpacing: 3,
  },
  logoSubtitle: {
    fontSize: 11,
    color: "#C2B8B0",
    letterSpacing: 2,
    marginTop: 4,
    fontWeight: "bold",
  },

  formContainer: {
    width: "100%",
    backgroundColor: "#1C1815",
    padding: 22,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#332B25",
  },
  formHeading: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
    fontFamily: "serif",
    textAlign: "center",
    marginBottom: 18,
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
    marginBottom: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#FFF", fontSize: 15 },

  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rememberRow: { flexDirection: "row", alignItems: "center" },
  rememberText: { color: "#C2B8B0", fontSize: 12, marginLeft: 6 },
  demoLinkText: { color: "#10B981", fontSize: 12, fontWeight: "bold" },

  msgBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    marginBottom: 14,
  },
  loginBtn: {
    flexDirection: "row",
    backgroundColor: "#D4AF37",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  loginBtnText: {
    color: "#120F0D",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#332B25" },
  orText: {
    color: "#888",
    fontSize: 10,
    fontWeight: "bold",
    marginHorizontal: 10,
    letterSpacing: 1,
  },

  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    height: 46,
    borderRadius: 12,
    backgroundColor: "#120F0D",
    borderWidth: 1,
    borderColor: "#332B25",
    justifyContent: "center",
    alignItems: "center",
  },
  socialBtnLabel: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#C2B8B0", fontSize: 14 },
  registerText: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
