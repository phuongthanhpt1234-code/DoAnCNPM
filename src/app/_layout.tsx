import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Nút quay về trang chủ dùng chung cho login và register
const BackHomeButton = () => (
  <TouchableOpacity
    onPress={() => router.replace("/" as any)}
    style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}
  >
    <Ionicons name="chevron-back" size={24} color="#e9c26b" />
    <Text style={{ color: "#e9c26b", fontWeight: "bold" }}>Trang chủ</Text>
  </TouchableOpacity>
);

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#140909" },
          headerTintColor: "#e9c26b",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "#090505" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="dish/[id]"
          options={{ title: "Thuyết Minh Ẩm Thực", presentation: "modal" }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: "Đăng nhập",
            headerTitle: "",
            headerLeft: () => <BackHomeButton />,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: "Đăng ký",
            headerTitle: "",
            headerLeft: () => <BackHomeButton />,
          }}
        />
      </Stack>
    </>
  );
}
