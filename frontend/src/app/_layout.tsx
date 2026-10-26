import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useGlobalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

type LangCode = "vi" | "en" | "zh" | "ko" | "ja";

const LAYOUT_I18N: Record<LangCode, { dishTitle: string }> = {
  vi: { dishTitle: "Thuyết Minh Ẩm Thực" },
  en: { dishTitle: "Culinary Audio Guide" },
  zh: { dishTitle: "美食语音导览" },
  ko: { dishTitle: "미식 오디오 가이드" },
  ja: { dishTitle: "グルメ音声ガイド" },
};

function resolveLangCode(raw?: string | string[] | null): LangCode | null {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (!val) return null;
  const clean = val.split("-")[0].toLowerCase().trim() as LangCode;
  return LAYOUT_I18N[clean] ? clean : null;
}

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
      } catch {}
    };

    syncLang();
    const timer = setInterval(syncLang, 500);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [params.lang]);

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
      </Stack>
    </>
  );
}
