import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const DEFAULT_AVATAR =
  "https://i.pinimg.com/736x/c8/cc/68/c8cc6816a2448d0a03a5e46e932ce7a9.jpg";

export default function ProfileScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [user, setUser] = useState({
    name: "Trương Trí Trung",
    bio: "Khoa CNTT - Đại học Sài Gòn",
    avatar: DEFAULT_AVATAR,
    email: "tritrungbaclieu@gmail.com",
  });

  const [checkedInCount, setCheckedInCount] = useState<number>(3);
  const [favoriteCount, setFavoriteCount] = useState<number>(2);

  useFocusEffect(
    useCallback(() => {
      const loadProfileData = async () => {
        try {
          const storedData = await AsyncStorage.getItem("userAccount");
          if (storedData) {
            const parsed = JSON.parse(storedData);
            setUser({
              name: parsed.name || "Trương Trí Trung",
              bio: parsed.bio || "Khoa CNTT - Đại học Sài Gòn",
              avatar: parsed.avatar || DEFAULT_AVATAR,
              email: parsed.email || "tritrungbaclieu@gmail.com",
            });
          }

          const savedCheckIns = await AsyncStorage.getItem("checkedInDishIds");
          if (savedCheckIns) {
            const arr = JSON.parse(savedCheckIns);
            if (Array.isArray(arr)) setCheckedInCount(arr.length);
          }

          const savedFavs = await AsyncStorage.getItem("favoriteDishes");
          if (savedFavs) {
            const arr = JSON.parse(savedFavs);
            if (Array.isArray(arr)) setFavoriteCount(arr.length);
          }
        } catch {}
      };
      loadProfileData();
    }, []),
  );

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?")) {
        await AsyncStorage.removeItem("userAccount");
        router.replace("/login" as any);
      }
    } else {
      Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            await AsyncStorage.removeItem("userAccount");
            router.replace("/login" as any);
          },
        },
      ]);
    }
  };

  const menuItems = [
    {
      title: "Chỉnh sửa thông tin cá nhân",
      sub: "Đổi họ tên, tiểu sử giới thiệu và email liên hệ",
      icon: "person-outline" as const,
      color: "#D4AF37",
      route: "/edit-profile",
    },
    {
      title: "Sổ tay món ăn yêu thích",
      sub: `Xem danh sách ${favoriteCount} món đặc sản Hội An đã lưu`,
      icon: "heart-outline" as const,
      color: "#EF4444",
      route: "/favorite",
    },
    {
      title: "Ngôn ngữ ứng dụng / Language",
      sub: `Đang sử dụng: ${(i18n.language || "vi").toUpperCase()} (Hỗ trợ 7 ngôn ngữ)`,
      icon: "globe-outline" as const,
      color: "#10B981",
      route: "/language",
    },
    {
      title: "Cài đặt thông báo",
      sub: "Tùy chỉnh công tắc nhắc Check-in GPS, Voucher & Hệ thống",
      icon: "notifications-outline" as const,
      color: "#F59E0B",
      route: "/notifications",
    },
    {
      title: "Bảo mật & Đổi mật khẩu",
      sub: "Cập nhật mật khẩu tài khoản và bảo vệ đăng nhập",
      icon: "shield-checkmark-outline" as const,
      color: "#D4AF37",
      route: "/security",
    },
    {
      title: "Hỗ trợ & Gửi góp ý",
      sub: "Đóng góp ý kiến hoặc đề xuất quán ăn mới tại Hội An",
      icon: "chatbubble-ellipses-outline" as const,
      color: "#10B981",
      route: "/support",
    },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push("/" as any)}
          >
            <Ionicons name="chevron-back" size={22} color="#D4AF37" />
            <Text style={styles.backText}>Trang chủ</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ Sơ & Sổ Tay Di Sản</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/edit-profile" as any)}
          >
            <Ionicons name="create-outline" size={22} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}
          >
            {/* CỘT TRÁI: THÔNG TIN NGƯỜI DÙNG */}
            <View style={[styles.profileCard, isDesktop && { flex: 1 }]}>
              <View style={styles.profileRow}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userBio}>{user.bio}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.badgePill}>
                    <Ionicons name="medal" size={14} color="#120F0D" />
                    <Text style={styles.badgeText}>Đại Sứ Ẩm Thực Hội An</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>
                    {checkedInCount * 200 + 400}
                  </Text>
                  <Text style={styles.statLabel}>Điểm XP</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: "#10B981" }]}>
                    {checkedInCount}/15
                  </Text>
                  <Text style={styles.statLabel}>Đã Check-in</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{favoriteCount}</Text>
                  <Text style={styles.statLabel}>Yêu thích</Text>
                </View>
              </View>
            </View>

            {/* CỘT PHẢI: DANH SÁCH 6 TÙY CHỌN ĐIỀU HƯỚNG */}
            <View style={[styles.menuColumn, isDesktop && { flex: 1.3 }]}>
              <Text style={styles.sectionTitle}>TÙY CHỌN HỒ SƠ & ỨNG DỤNG</Text>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.menuCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={styles.menuIconWrap}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSub}>{item.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#A89A82" />
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#120F0D" },
  container: { flex: 1, width: "100%", maxWidth: 520, alignSelf: "center" },
  containerDesktop: { maxWidth: 1080, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "web" ? 20 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2621",
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backText: {
    color: "#D4AF37",
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 14,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "serif",
  },
  iconBtn: { padding: 6 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  mainLayout: { flexDirection: "column", gap: 20 },
  mainLayoutDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 24,
  },
  profileCard: {
    backgroundColor: "#1C1815",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
  },
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2.5,
    borderColor: "#D4AF37",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "bold",
    fontFamily: "serif",
  },
  userBio: { color: "#D4AF37", fontSize: 13, fontWeight: "600", marginTop: 3 },
  userEmail: { color: "#B8B0A8", fontSize: 12, marginTop: 2, marginBottom: 8 },
  badgePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4AF37",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#120F0D",
    fontSize: 11,
    fontWeight: "bold",
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#120F0D",
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#302924",
    marginBottom: 16,
  },
  statBox: { flex: 1, alignItems: "center" },
  statNum: { color: "#D4AF37", fontSize: 19, fontWeight: "900" },
  statLabel: { color: "#B8B0A8", fontSize: 11, marginTop: 3 },
  statDivider: { width: 1, backgroundColor: "#302924" },
  exploreBtn: {
    flexDirection: "row",
    backgroundColor: "#D4AF37",
    paddingVertical: 13,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  exploreBtnText: {
    color: "#120F0D",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 6,
  },
  menuColumn: { gap: 10 },
  sectionTitle: {
    color: "#B8B0A8",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1815",
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#302924",
  },
  menuIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  menuSub: { color: "#B8B0A8", fontSize: 12 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
    marginTop: 6,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
