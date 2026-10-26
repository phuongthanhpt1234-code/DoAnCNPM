import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router, useGlobalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";

type LangCode = "vi" | "en" | "zh" | "ko" | "ja" | "es" | "ar";

const LAYOUT_I18N: Record<
  LangCode,
  { home: string; dishTitle: string; loginTitle: string; registerTitle: string }
> = {
  vi: {
    home: "Trang chủ",
    dishTitle: "Thuyết Minh Ẩm Thực",
    loginTitle: "Đăng nhập",
    registerTitle: "Đăng ký",
  },
  en: {
    home: "Home",
    dishTitle: "Culinary Audio Guide",
    loginTitle: "Sign In",
    registerTitle: "Sign Up",
  },
  zh: {
    home: "返回首页",
    dishTitle: "美食语音导览",
    loginTitle: "登录",
    registerTitle: "注册",
  },
  ko: {
    home: "홈으로",
    dishTitle: "미식 오디오 가이드",
    loginTitle: "로그인",
    registerTitle: "회원가입",
  },
  ja: {
    home: "ホーム",
    dishTitle: "グルメ音声ガイド",
    loginTitle: "ログイン",
    registerTitle: "新規登録",
  },
  es: {
    home: "Inicio",
    dishTitle: "Guía Culinaria",
    loginTitle: "Iniciar Sesión",
    registerTitle: "Registrarse",
  },
  ar: {
    home: "الرئيسية",
    dishTitle: "دليل الطعام الصوتي",
    loginTitle: "تسجيل الدخول",
    registerTitle: "إنشاء حساب",
  },
};

function resolveLangCode(raw?: string | string[] | null): LangCode | null {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (!val) return null;
  const clean = val.split("-")[0].toLowerCase().trim() as LangCode;
  return LAYOUT_I18N[clean] ? clean : null;
}

// Nút quay về trang chủ dùng chung cho login và register (Đồng bộ ngôn ngữ)
const BackHomeButton = ({ lang }: { lang: LangCode }) => {
  const t = LAYOUT_I18N[lang] || LAYOUT_I18N.vi;
  return (
    <TouchableOpacity
      onPress={() =>
        router.replace({ pathname: "/" as any, params: { lang } })
      }
      style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}
    >
      <Ionicons name="chevron-back" size={24} color="#e9c26b" />
      <Text style={{ color: "#e9c26b", fontWeight: "bold" }}>{t.home}</Text>
    </TouchableOpacity>
  );
};

export default function RootLayout() {
  const params = useGlobalSearchParams<{ lang?: string }>();
  const [lang, setLang] = useState<LangCode>("vi");

  useEffect(() => {
    let isMounted = true;
    const syncLang = async () => {
      const fromParam = resolveLangCode(params.lang);
      if (fromParam) {
        if (isMounted) setLang(fromParam);
        return;
      }
      try {
        const saved = await AsyncStorage.getItem("appLanguage");
        const fromSaved = resolveLangCode(saved);
        if (fromSaved && isMounted) {
          setLang(fromSaved);
        }
      } catch (e) {}
    };

    syncLang();
    const timer = setInterval(syncLang, 500);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [params.lang]);

  // Lấy trực tiếp ngôn ngữ từ params ngay lúc render để không bị trễ 1 nhịp
  const activeLang: LangCode = resolveLangCode(params.lang) || lang;
  const t = LAYOUT_I18N[activeLang] || LAYOUT_I18N.vi;

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
          options={{ title: t.dishTitle, presentation: "modal" }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: t.loginTitle,
            headerTitle: "",
            headerLeft: () => <BackHomeButton lang={activeLang} />,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: t.registerTitle,
            headerTitle: "",
            headerLeft: () => <BackHomeButton lang={activeLang} />,
          }}
        />
      </Stack>
    </>
  );
}