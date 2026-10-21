import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

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
      </Stack>
    </>
  );
}
