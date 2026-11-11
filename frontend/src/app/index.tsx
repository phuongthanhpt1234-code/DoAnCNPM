import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { activityHistoryText } from "../locales/activityHistory";
import {
  DIETARY_OPTIONS,
  PAGE_UI,
  translateNoteInstant,
} from "../constants/homeData";
import { styles } from "../styles/homeStyles";
import {
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { DISHES, Dish, LANGS, LangKey } from "../data/dishesData";
import { ALL_DISHES_DATA } from "../locales";
import {
  API_URL,
  api,
  getClientDeviceId,
  getDishes,
  notifyPresenceLangChange,
  onDishesUpdated,
  startPresenceSession,
} from "../services/api";
import { playSpeech, stopSpeech } from "../services/speech";

function getCustomerMapUrl(lang: string = "vi") {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `/customer-map.html?embed=true&lang=${lang}`;
  }
  return `${API_URL}/customer-map.html?embed=true&lang=${lang}`;
}

function DishCardImage({
  uri,
  fallbackUri,
  style,
}: {
  uri?: string;
  fallbackUri: string;
  style: any;
}) {
  const [hasError, setHasError] = useState(false);
  const [lastUri, setLastUri] = useState(uri);

  if (uri !== lastUri) {
    setLastUri(uri);
    setHasError(false);
  }

  const currentUri = !hasError && uri ? uri : fallbackUri;

  return (
    <Image
      key={currentUri}
      source={{ uri: currentUri }}
      style={style}
      resizeMode="cover"
      onError={() => {
        if (!hasError) setHasError(true);
      }}
    />
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ lang?: string; dish?: string }>();

  const [languageSelection, setLanguageSelection] = useState<{
    route: string | undefined;
    value: LangKey;
  }>(() => ({ route: params.lang, value: (params.lang as LangKey) || "vi" }));
  const lang: LangKey =
    languageSelection.route === params.lang
      ? languageSelection.value
      : params.lang && PAGE_UI[params.lang]
        ? (params.lang as LangKey)
        : "vi";
  const setLang = useCallback(
    (value: LangKey) => {
      setLanguageSelection({ route: params.lang, value });
    },
    [params.lang],
  );
  const [cat, setCat] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(
    params.dish
      ? DISHES.find((d) => d.id === Number(params.dish)) || null
      : null,
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [qrVisible, setQrVisible] = useState<boolean>(false);
  const [customerMapVisible, setCustomerMapVisible] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>(
    Platform.OS === "web" && typeof window !== "undefined"
      ? window.location.origin
      : "https://hoian-food-map.vercel.app",
  );
  const [activityFilter, setActivityFilter] = useState<
    "all" | "favorites" | "checkins"
  >("all");
  const [tasteCardVisible, setTasteCardVisible] = useState<boolean>(false);
  const [checkedDishIds, setCheckedDishIds] = useState<number[]>([]);
  const handleStopSpeech = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
  }, []);
  const flatListRef = useRef<FlatList<Dish> | null>(null);
  const handleCloseDishModal = useCallback(() => {
    handleStopSpeech();
    setSelectedDish(null);
  }, [handleStopSpeech]);

  const handleResetHome = useCallback(() => {
    handleStopSpeech();
    setActivityFilter("all");
    setCat("all");
    setSearch("");
    setSelectedDish(null);
    setQrVisible(false);
    setCustomerMapVisible(false);
    setTasteCardVisible(false);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [handleStopSpeech]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    if (isSpeaking) {
      handleStopSpeech();
    }
  }, [lang]);

  const [favoritedDishIds, setFavoritedDishIds] = useState<number[]>([]);
  const [toastMsg, setToastMsg] = useState<string>("");

  const [apiDishes, setApiDishes] = useState<Dish[]>(DISHES);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const CAT_BY_NAME: Record<string, Dish["cat"]> = {
      "Món chính": "main",
      "Ăn vặt": "snack",
      "Đường phố": "street",
      "Đồ uống": "sweet",
      "Chè & Đồ uống": "sweet",
    };

    async function loadDishes() {
      try {
        const rows: any[] = await getDishes();

        if (cancelled) return;

        const converted: Dish[] = rows
          .filter((row) => row.is_active !== false)
          .map((row): Dish => {
            const rowNameNorm = String(row.name || "")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .replace(/đ/g, "d")
              .replace(/[^a-z0-9]/g, " ")
              .replace(/\s+/g, " ")
              .trim();

            const localDish = ALL_DISHES_DATA.find((d) => {
              const s1 = (d.shopVi || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/đ/g, "d")
                .replace(/[^a-z0-9]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
              const s2 = (d.translations?.vi?.name || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/đ/g, "d")
                .replace(/[^a-z0-9]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
              if (
                s1 === rowNameNorm ||
                s2 === rowNameNorm ||
                (s1 && rowNameNorm.includes(s1)) ||
                (s1 && s1.includes(rowNameNorm)) ||
                (s2 && rowNameNorm.includes(s2)) ||
                (s2 && s2.includes(rowNameNorm))
              ) {
                return true;
              }
              if (
                rowNameNorm.includes("cao lau") &&
                (s1.includes("cao lau") || s2.includes("cao lau"))
              )
                return true;
              if (
                rowNameNorm.includes("mot") &&
                (s1.includes("mot") || s2.includes("mot"))
              )
                return true;
              if (
                rowNameNorm.includes("banh mi") &&
                (s1.includes("banh mi") || s2.includes("banh mi"))
              )
                return true;
              if (
                rowNameNorm.includes("com ga") &&
                (s1.includes("com ga") || s2.includes("com ga"))
              )
                return true;
              if (
                rowNameNorm.includes("banh beo") &&
                (s1.includes("banh beo") || s2.includes("banh beo"))
              )
                return true;
              if (
                rowNameNorm.includes("banh xeo") &&
                (s1.includes("banh xeo") || s2.includes("banh xeo"))
              )
                return true;
              if (
                rowNameNorm.includes("mi quang") &&
                (s1.includes("mi quang") || s2.includes("mi quang"))
              )
                return true;
              if (
                rowNameNorm.includes("che") &&
                (s1.includes("che") || s2.includes("che"))
              )
                return true;
              if (
                (rowNameNorm.includes("bong hong") ||
                  rowNameNorm.includes("banh vac")) &&
                (s1.includes("bong hong") || s2.includes("banh vac"))
              )
                return true;
              return false;
            });

            const dishPresetById = DISHES.find((d) => d.id === Number(row.id));
            const getLocalizedName = (k: LangKey): string => {
              if (k === "vi")
                return (
                  row.name_i18n?.vi ||
                  row.name ||
                  dishPresetById?.name?.vi ||
                  localDish?.translations?.vi?.name ||
                  "Món Hội An"
                );
              const rName = row.name_i18n?.[k] || row.translations?.[k]?.name;
              if (rName && rName.trim() && rName !== row.name) {
                return rName;
              }
              if (dishPresetById?.name?.[k]) {
                return dishPresetById.name[k];
              }
              const localName = localDish?.translations?.[k]?.name;
              if (localName && localName.trim()) {
                return localName;
              }
              return rName || localDish?.translations?.en?.name || row.name;
            };

            const rawDescVi =
              row.desc_i18n?.vi ||
              row.description ||
              dishPresetById?.desc?.vi ||
              localDish?.translations?.vi?.story ||
              "";
            const getLocalizedDesc = (k: LangKey): string => {
              if (k === "vi") return rawDescVi;
              const rDesc =
                row.desc_i18n?.[k] || row.translations?.[k]?.description;
              if (rDesc && rDesc.trim() && rDesc !== rawDescVi) {
                return rDesc;
              }
              if (dishPresetById?.desc?.[k]) {
                return dishPresetById.desc[k];
              }
              const localStory = localDish?.translations?.[k]?.story;
              if (localStory && localStory.trim()) {
                return localStory;
              }
              return rDesc || localDish?.translations?.en?.story || rawDescVi;
            };

            const mergedName: Record<LangKey, string> = {
              vi: getLocalizedName("vi"),
              en: getLocalizedName("en"),
              zh: getLocalizedName("zh"),
              ko: getLocalizedName("ko"),
              ja: getLocalizedName("ja"),
            };

            const mergedDesc: Record<LangKey, string> = {
              vi: getLocalizedDesc("vi"),
              en: getLocalizedDesc("en"),
              zh: getLocalizedDesc("zh"),
              ko: getLocalizedDesc("ko"),
              ja: getLocalizedDesc("ja"),
            };

            const mergedTag: Record<LangKey, string> = {
              vi: localDish?.translations?.vi?.tag || "",
              en: localDish?.translations?.en?.tag || "",
              zh: localDish?.translations?.zh?.tag || "",
              ko: localDish?.translations?.ko?.tag || "",
              ja: localDish?.translations?.ja?.tag || "",
            };

            const defaultCatImg =
              row.category_slug === "snack"
                ? "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800"
                : row.category_slug === "street"
                  ? "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=800"
                  : row.category_slug === "sweet"
                    ? "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800"
                    : "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800";

            const backendFallback = DISHES.find(
              (d) => d.id === Number(row.id),
            )?.img;
            const fallbackImg =
              backendFallback || localDish?.image || defaultCatImg;

            let rawImg = (row.image_url || "").trim();
            if (rawImg.includes("/uploads/")) {
              const uploadPart = rawImg.slice(rawImg.indexOf("/uploads/"));
              rawImg = `${API_URL}${uploadPart}`;
            } else if (
              rawImg.startsWith("http://doancnpm-backend.onrender.com")
            ) {
              rawImg = rawImg.replace("http://", "https://");
            }

            const dishImg = rawImg || fallbackImg;

            return {
              id: Number(row.id),
              cat:
                (row.category_slug as Dish["cat"]) ??
                CAT_BY_NAME[row.category_name] ??
                "main",
              lat: row.lat != null ? Number(row.lat) : 15.877,
              lng: row.lng != null ? Number(row.lng) : 108.327,
              address:
                row.address ||
                DISHES.find((d) => d.id === Number(row.id))?.address ||
                localDish?.shopVi ||
                "",
              name: mergedName,
              desc: mergedDesc,
              tag: mergedTag,
              img: dishImg,
              fallbackImg,
              price:
                row.price_vnd != null
                  ? Number(row.price_vnd).toLocaleString("vi-VN") + "đ"
                  : "Đang cập nhật",
            };
          });

        const finalDishes = converted.length > 0 ? converted : DISHES;
        setApiDishes(finalDishes);

        let targetParam = params.dish;
        if (
          !targetParam &&
          Platform.OS === "web" &&
          typeof window !== "undefined"
        ) {
          const sM = window.location.search.match(/[?&]dish=([^&]+)/);
          if (sM) targetParam = decodeURIComponent(sM[1]);
          const pM = window.location.pathname.match(/\/dish\/([^/?#]+)/);
          if (pM) targetParam = decodeURIComponent(pM[1]);
        }

        let initialDish: Dish | null = null;
        if (targetParam) {
          const normP = String(targetParam)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .trim();
          initialDish =
            finalDishes.find(
              (d) =>
                String(d.id) === String(targetParam) ||
                d.name.vi
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/đ/g, "d")
                  .includes(normP) ||
                normP.includes(
                  d.name.vi
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/đ/g, "d"),
                ),
            ) || null;
        }

        setSelectedDish((prev) => {
          if (initialDish) return initialDish;
          if (!prev) return null;
          const updated = finalDishes.find((d) => d.id === prev.id);
          return updated || prev;
        });
        console.log("API OK:", finalDishes.length, "món");
        setApiError("");
      } catch (err) {
        console.log("API LỖI:", err);
        if (!cancelled) {
          if (DISHES.length > 0) {
            setApiDishes(DISHES);
          }
          setApiError(
            err instanceof Error ? err.message : "Không tải được món ăn",
          );
        }
      } finally {
        if (!cancelled) {
          setApiLoading(false);
        }
      }
    }

    loadDishes();

    const unsub = onDishesUpdated(() => {
      loadDishes();
    });

    let handleFocus: (() => void) | null = null;
    let handleVisibility: (() => void) | null = null;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      handleFocus = () => loadDishes();
      handleVisibility = () => {
        if (document.visibilityState === "visible") loadDishes();
      };
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleVisibility);
    }

    const pollTimer = setInterval(() => {
      loadDishes();
    }, 8000);

    return () => {
      cancelled = true;
      unsub();
      clearInterval(pollTimer);
      if (handleFocus) window.removeEventListener("focus", handleFocus);
      if (handleVisibility)
        document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const toastTimerRef = useRef<any>(null);
  const lastCheckInActionRef = useRef<Record<number, number>>({});
  const isCheckInBusyRef = useRef<Record<number, boolean>>({});

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMsg("");
    }, 2800);
  }, []);

  const handleSelectLanguage = async (k: LangKey) => {
    setLang(k);
    router.setParams({ lang: k });
    try {
      await AsyncStorage.setItem("appLanguage", k);
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("customer_map_lang", k);
      }
    } catch (e) {}
  };

  const syncActivityLists = useCallback(async (signal?: AbortSignal) => {
    const deviceId = encodeURIComponent(getClientDeviceId());
    const options = signal ? { signal } : {};

    let localFavs: number[] = [];
    let localChecks: number[] = [];

    try {
      const rawFav = await AsyncStorage.getItem("favoritedDishIds");
      if (rawFav) {
        const parsed = JSON.parse(rawFav);
        if (Array.isArray(parsed)) {
          localFavs = parsed.map(Number).filter((n) => !isNaN(n) && n > 0);
          if (!signal?.aborted) setFavoritedDishIds(localFavs);
        }
      }
    } catch {}

    try {
      const rawCheck = await AsyncStorage.getItem("checkedDishIds");
      if (rawCheck) {
        const parsed = JSON.parse(rawCheck);
        if (Array.isArray(parsed)) {
          localChecks = parsed.map(Number).filter((n) => !isNaN(n) && n > 0);
          if (!signal?.aborted) setCheckedDishIds(localChecks);
        }
      }
    } catch {}

    api<{ id?: number; dish_id?: number }[]>(
      `/favorites?device_id=${deviceId}`,
      options,
    )
      .then((favs) => {
        if (!signal?.aborted && Array.isArray(favs)) {
          const serverIds = favs
            .map((f) => Number(f.id ?? f.dish_id))
            .filter((n) => !isNaN(n) && n > 0);
          const merged = Array.from(new Set([...localFavs, ...serverIds]));
          setFavoritedDishIds(merged);
          AsyncStorage.setItem(
            "favoritedDishIds",
            JSON.stringify(merged),
          ).catch(() => {});
        }
      })
      .catch(() => {});

    api<{ dish_id?: number; id?: number }[]>(
      `/checkins?device_id=${deviceId}`,
      options,
    )
      .then((checks) => {
        if (!signal?.aborted && Array.isArray(checks)) {
          const serverIds = checks
            .map((c) => Number(c.dish_id ?? c.id))
            .filter((n) => !isNaN(n) && n > 0);
          const merged = Array.from(new Set([...localChecks, ...serverIds]));
          setCheckedDishIds(merged);
          AsyncStorage.setItem("checkedDishIds", JSON.stringify(merged)).catch(
            () => {},
          );
        }
      })
      .catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      syncActivityLists(controller.signal);
      return () => controller.abort();
    }, [syncActivityLists]),
  );
  const [selectedDietary, setSelectedDietary] = useState<string[]>([
    "no_peanut",
    "no_spicy",
  ]);

  const [showCustomNoteBox, setShowCustomNoteBox] = useState<boolean>(false);
  const [customDietaryNote, setCustomDietaryNote] = useState<string>("");
  const [remoteTranslation, setRemoteTranslation] = useState({
    source: "",
    text: "",
  });
  const noteSource = customDietaryNote.trim();
  const translatedCustomNoteVi = !noteSource
    ? ""
    : remoteTranslation.source === noteSource
      ? remoteTranslation.text
      : translateNoteInstant(noteSource);

  const ui = PAGE_UI[lang] || PAGE_UI.vi;

  useEffect(() => {
    const cleanup = startPresenceSession(() => lang);
    return cleanup;
  }, []);

  useEffect(() => {
    notifyPresenceLangChange(lang);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("customer_map_lang", lang);
      }
    } catch (e) {}
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleMapMessage = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === "MAP_LANG_CHANGED" &&
        event.data.lang &&
        (LANGS as any)[event.data.lang]
      ) {
        handleSelectLanguage(event.data.lang as LangKey);
      }
    };
    window.addEventListener("message", handleMapMessage);
    return () => window.removeEventListener("message", handleMapMessage);
  }, []);

  useEffect(() => {
    if (params.lang && PAGE_UI[params.lang]) {
      AsyncStorage.setItem("appLanguage", params.lang).catch(() => {});
    }
  }, [params.lang]);

  useEffect(() => {
    let isCancelled = false;
    const raw = customDietaryNote.trim();
    if (!raw) return;

    const timer = setTimeout(async () => {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(raw)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!isCancelled && Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0]
            .map((part: any) => part[0])
            .join("")
            .trim();
          if (translated)
            setRemoteTranslation({ source: raw, text: translated });
        }
      } catch (e) {}
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [customDietaryNote]);

  useFocusEffect(
    useCallback(() => {
      if (!params.lang) {
        AsyncStorage.getItem("appLanguage")
          .then((savedLang) => {
            if (savedLang && PAGE_UI[savedLang]) {
              setLang(savedLang as LangKey);
            }
          })
          .catch(() => {});
      }
    }, [params.lang, setLang]),
  );

  const isDesktop = width >= 900;
  const numColumns = isDesktop ? 3 : width >= 600 ? 2 : 1;
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return apiDishes.filter((dish) => {
      const dishId = Number(dish.id);
      if (
        activityFilter === "favorites" &&
        !favoritedDishIds.includes(dishId)
      ) {
        return false;
      }

      if (activityFilter === "checkins" && !checkedDishIds.includes(dishId)) {
        return false;
      }

      const matchCat = cat === "all" || dish.cat === cat;
      const searchableText = [
        dish.name?.[lang],
        dish.name?.vi,
        dish.desc?.[lang],
        dish.desc?.vi,
      ]
        .join(" ")
        .toLowerCase();

      return matchCat && searchableText.includes(query);
    });
  }, [
    apiDishes,
    cat,
    search,
    lang,
    activityFilter,
    favoritedDishIds,
    checkedDishIds,
  ]);

  const speakText = useCallback(
    (text: string, customSpeechCode?: string) => {
      if (!text || !text.trim()) return;
      const targetLang = customSpeechCode || LANGS[lang]?.speechCode || "vi-VN";
      setIsSpeaking(true);
      playSpeech(text, targetLang, 1.0, (speaking) => {
        setIsSpeaking(speaking);
      });
    },
    [lang],
  );

  const handleCheckInDish = async (dish: Dish) => {
    const now = Date.now();
    const lastTime = lastCheckInActionRef.current[dish.id] || 0;
    const isBusy = isCheckInBusyRef.current[dish.id];

    if (isBusy || now - lastTime < 2000) {
      showToast(ui.spamCheckInWarning);
      return;
    }

    lastCheckInActionRef.current[dish.id] = now;
    isCheckInBusyRef.current[dish.id] = true;

    const isAlreadyChecked = checkedDishIds.includes(dish.id);
    const nextChecked = !isAlreadyChecked;
    const deviceId = getClientDeviceId();

    setCheckedDishIds((prev) => {
      const updated = isAlreadyChecked
        ? prev.filter((id) => id !== Number(dish.id))
        : Array.from(new Set([...prev, Number(dish.id)]));
      AsyncStorage.setItem("checkedDishIds", JSON.stringify(updated)).catch(
        () => {},
      );
      return updated;
    });

    const dishTitle = dish.name[lang] || dish.name.vi || "";
    showToast(
      nextChecked
        ? lang === "vi"
          ? `Đã check-in thành công: ${dishTitle}`
          : `Successfully checked in: ${dishTitle}`
        : lang === "vi"
          ? `Đã hủy check-in: ${dishTitle}`
          : `Unchecked: ${dishTitle}`,
    );

    try {
      if (nextChecked) {
        await api("/checkins", {
          method: "POST",
          body: JSON.stringify({
            device_id: deviceId,
            dish_id: Number(dish.id),
            note: `Check-in món ${dish.name.vi}`,
          }),
        });
      } else {
        await api(
          `/checkins?device_id=${encodeURIComponent(deviceId)}&dish_id=${Number(dish.id)}`,
          { method: "DELETE" },
        );
      }
    } catch (e) {
      console.warn("Check-in sync warning:", e);
    } finally {
      isCheckInBusyRef.current[dish.id] = false;
    }
  };

  const handleToggleFavorite = async (dish: Dish) => {
    const dishId = Number(dish.id);
    const isFav = favoritedDishIds.includes(dishId);
    const nextFav = !isFav;
    const deviceId = getClientDeviceId();

    setFavoritedDishIds((prev) => {
      const updated = isFav
        ? prev.filter((id) => id !== dishId)
        : Array.from(new Set([...prev, dishId]));
      AsyncStorage.setItem("favoritedDishIds", JSON.stringify(updated)).catch(
        () => {},
      );
      return updated;
    });

    try {
      if (nextFav) {
        await api("/favorites", {
          method: "POST",
          body: JSON.stringify({
            device_id: deviceId,
            dish_id: dishId,
          }),
        });
      } else {
        await api(
          `/favorites/${dishId}?device_id=${encodeURIComponent(deviceId)}`,
          { method: "DELETE" },
        );
      }
    } catch (e) {
      console.warn("Toggle favorite sync warning:", e);
    }
  };

  const toggleDietaryOption = (id: string) => {
    setSelectedDietary((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const buildChefVoiceMessage = () => {
    const chosen = DIETARY_OPTIONS.filter((opt) =>
      selectedDietary.includes(opt.id),
    );
    const extraVi = (
      translatedCustomNoteVi || translateNoteInstant(customDietaryNote)
    ).trim();

    const voiceParts = chosen.map((c) => c.voiceText);
    if (extraVi) {
      voiceParts.push(`Ngoài ra xin lưu ý giúp tôi: ${extraVi}`);
    }

    if (voiceParts.length === 0) {
      return "Xin chào chủ quán Hội An, tôi có thể ăn được tất cả các nguyên liệu bình thường. Cảm ơn quán!";
    }
    return `Xin chào cô chú chủ quán Hội An! Nhờ quán lưu ý giúp tôi: ${voiceParts.join(". ")}. Xin cảm ơn rất nhiều!`;
  };

  const handleOpenAndSpeakTasteCard = () => {
    setTasteCardVisible(true);
    speakText(buildChefVoiceMessage(), "vi-VN");
  };

  const qrTargetUrl = `${customUrl}?mobile=1&lang=${lang}${selectedDish ? `&dish=${selectedDish.id}` : ""}`;
  const qrImageUri = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(qrTargetUrl)}`;

  const activeExtraNoteVi = (
    translatedCustomNoteVi || translateNoteInstant(customDietaryNote)
  ).trim();

  return (
    <View style={styles.container}>
      {toastMsg ? (
        <View style={styles.toastContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.toastCard}
            onPress={() => setToastMsg("")}
          >
            <Text style={styles.toastText}>{toastMsg}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleResetHome}
            accessibilityRole="button"
          >
            <Text style={styles.brandTitle}>{ui.brandTitle}</Text>
            <Text style={styles.brandSub}>{ui.brandSub}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ maxWidth: "100%" }}
          contentContainerStyle={styles.langBar}
        >
          {(Object.keys(LANGS) as LangKey[]).map((k) => (
            <TouchableOpacity
              key={k}
              onPress={() => handleSelectLanguage(k)}
              style={[styles.langBtn, lang === k && styles.langBtnActive]}
            >
              <Text
                style={[styles.langBtnText, lang === k && { color: "#fff" }]}
              >
                {k.toUpperCase()} {LANGS[k].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.authRow, !isDesktop && { width: "100%" }]}>
          {(
            [
              [
                "favorites",
                favoritedDishIds.length > 0
                  ? `${activityHistoryText[lang].favorite} (${favoritedDishIds.length})`
                  : activityHistoryText[lang].favorite,
              ],
              [
                "checkins",
                checkedDishIds.length > 0
                  ? `${activityHistoryText[lang].checkins} (${checkedDishIds.length})`
                  : activityHistoryText[lang].checkins,
              ],
            ] as const
          ).map(([value, label]) => {
            const selected = activityFilter === value;

            return (
              <TouchableOpacity
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={selected ? styles.registerBtn : styles.loginBtn}
                onPress={() => {
                  const nextFilter = selected ? "all" : value;
                  setActivityFilter(nextFilter);
                  setCat("all");
                  setSearch("");
                }}
              >
                <Text
                  style={
                    selected ? styles.registerBtnText : styles.loginBtnText
                  }
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.mapTriggerBtn}
            onPress={() => setCustomerMapVisible(true)}
          >
            <Text style={styles.mapTriggerText}>
              {ui.mapTriggerBtn || "Bản Đồ & GPS"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.qrTriggerBtn}
            onPress={() => setQrVisible(true)}
          >
            <Text style={styles.qrTriggerText}>{ui.qrMobileBtn}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        key={`dishes-${numColumns}`}
        data={filtered}
        extraData={{ lang, checkedDishIds, favoritedDishIds }}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.filterSection}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={ui.searchPlaceholder}
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catRow}
              >
                {[
                  [
                    "all",
                    `${ui.catAll.replace(/\s*\(\d+\)/, "")} (${apiDishes.length})`,
                  ],
                  ["main", ui.catMain],
                  ["snack", ui.catSnack],
                  ["street", ui.catStreet],
                  ["sweet", ui.catSweet],
                ].map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      setCat(key);
                      if (key === "all") setActivityFilter("all");
                    }}
                    style={[
                      styles.catChip,
                      cat === key && styles.catChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        cat === key && { color: "#fff" },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          activityFilter !== "all" ? (
            <View style={styles.emptyActivityBox}>
              <Ionicons
                name={
                  activityFilter === "favorites"
                    ? "heart-outline"
                    : "checkmark-circle-outline"
                }
                size={36}
                color="#9ca3af"
              />
              <Text style={styles.emptyActivityText}>
                {activityFilter === "favorites"
                  ? activityHistoryText[lang].emptyFavorite
                  : activityHistoryText[lang].emptyCheckins}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              numColumns === 3 && {
                maxWidth:
                  Platform.OS === "web"
                    ? ("calc(33.333% - 16px)" as any)
                    : "31.5%",
              },
              numColumns === 2 && {
                maxWidth:
                  Platform.OS === "web" ? ("calc(50% - 16px)" as any) : "48%",
              },
            ]}
            onPress={() => setSelectedDish(item)}
            activeOpacity={0.88}
          >
            <View style={styles.cardImgWrap}>
              <DishCardImage
                uri={item.img}
                fallbackUri={
                  item.fallbackImg ||
                  "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800"
                }
                style={styles.cardImg}
              />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTopContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name[lang] || item.name.vi}
                </Text>
                {item.address ? (
                  <View style={styles.cardAddressRow}>
                    <Ionicons
                      name="location-sharp"
                      size={13}
                      color="#ea580c"
                      style={{ marginRight: 3, flexShrink: 0 }}
                    />
                    <Text style={styles.cardAddressText} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.desc[lang] || item.desc.vi}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.listenBtn}
                  onPress={() => {
                    setSelectedDish(item);
                    speakText(item.desc[lang] || item.desc.vi);
                  }}
                >
                  <Text style={styles.listenBtnText}>{ui.listenBtn}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleCheckInDish(item)}
                  style={[
                    styles.checkInActionBtn,
                    checkedDishIds.includes(item.id)
                      ? styles.checkInActionBtnDone
                      : styles.checkInActionBtnPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.checkInActionText,
                      checkedDishIds.includes(item.id)
                        ? styles.checkInActionTextDone
                        : styles.checkInActionTextPending,
                    ]}
                  >
                    {checkedDishIds.includes(item.id)
                      ? ui.checkInDone
                      : ui.checkInNow}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    handleToggleFavorite(item);
                  }}
                  style={[
                    styles.favoriteHeartBtn,
                    favoritedDishIds.includes(item.id) &&
                      styles.favoriteHeartBtnActive,
                  ]}
                >
                  <Ionicons
                    name="heart"
                    size={20}
                    color={
                      favoritedDishIds.includes(item.id) ? "#ef4444" : "#4b5563"
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={styles.assistantSection}>
            <View style={styles.assistantHeaderRow}>
              <View style={styles.assistantTitleGroup}>
                <Text style={styles.assistantTitle}>{ui.dietaryTitle}</Text>
              </View>
              <View style={styles.practicalBadge}>
                <Text style={styles.practicalBadgeText}>
                  {ui.practicalBadge}
                </Text>
              </View>
            </View>

            <Text style={styles.assistantSub}>{ui.dietarySub}</Text>

            <View
              style={[
                styles.assistantGrid,
                isDesktop && styles.assistantGridDesktop,
              ]}
            >
              <View style={[styles.panelBox, isDesktop && { flex: 1 }]}>
                <View style={styles.dietaryOptionsList}>
                  {DIETARY_OPTIONS.map((opt) => {
                    const isSelected = selectedDietary.includes(opt.id);
                    const optLabel = opt.label[lang] || opt.label.vi;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.85}
                        onPress={() => toggleDietaryOption(opt.id)}
                        style={[
                          styles.dietaryItemRow,
                          isSelected && styles.dietaryItemRowSelected,
                        ]}
                      >
                        <View style={styles.dietaryItemLeft}>
                          <Text
                            style={[
                              styles.dietaryLabel,
                              isSelected && styles.dietaryLabelSelected,
                            ]}
                          >
                            {optLabel}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.dietaryRadioCircle,
                            isSelected && styles.dietaryRadioCircleSelected,
                          ]}
                        >
                          {isSelected && (
                            <Text style={styles.dietaryCheckMark}>✓</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setShowCustomNoteBox(!showCustomNoteBox)}
                    style={[
                      styles.dietaryItemRow,
                      (showCustomNoteBox ||
                        customDietaryNote.trim().length > 0) &&
                        styles.dietaryItemRowSelected,
                    ]}
                  >
                    <View style={styles.dietaryItemLeft}>
                      <Text
                        style={[
                          styles.dietaryLabel,
                          (showCustomNoteBox ||
                            customDietaryNote.trim().length > 0) &&
                            styles.dietaryLabelSelected,
                        ]}
                      >
                        {ui.addCustomNoteBtn}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.dietaryRadioCircle,
                        (showCustomNoteBox ||
                          customDietaryNote.trim().length > 0) &&
                          styles.dietaryRadioCircleSelected,
                      ]}
                    >
                      <Text style={styles.dietaryCheckMark}>
                        {showCustomNoteBox ||
                        customDietaryNote.trim().length > 0
                          ? "✓"
                          : "+"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {(showCustomNoteBox ||
                    customDietaryNote.trim().length > 0) && (
                    <View style={styles.customNoteInputWrap}>
                      <TextInput
                        value={customDietaryNote}
                        onChangeText={setCustomDietaryNote}
                        placeholder={ui.customNotePlaceholder}
                        placeholderTextColor="#a89a82"
                        style={styles.customNoteInput}
                      />
                      {activeExtraNoteVi ? (
                        <Text style={styles.customNotePreviewText}>
                          {ui.customNoteTranslatedPrefix}{" "}
                          <Text
                            style={{ color: "#34d399", fontWeight: "bold" }}
                          >
                            {activeExtraNoteVi}
                          </Text>
                        </Text>
                      ) : null}
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleOpenAndSpeakTasteCard}
                  style={styles.openTasteCardBtn}
                >
                  <Text style={styles.openTasteCardBtnText}>
                    {ui.openTasteCardBtn}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
      />

      <Modal
        visible={!!selectedDish && !qrVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseDishModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseDishModal}
        >
          {selectedDish && (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalBox}
              onPress={(e) => e.stopPropagation?.()}
            >
              <DishCardImage
                uri={selectedDish.img}
                fallbackUri={
                  selectedDish.fallbackImg ||
                  "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800"
                }
                style={styles.modalImg}
              />
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedDish.name[lang]}</Text>
                {selectedDish.address ? (
                  <View style={styles.modalAddressRow}>
                    <Ionicons
                      name="location-sharp"
                      size={14}
                      color="#ea580c"
                      style={{ marginRight: 5, flexShrink: 0 }}
                    />
                    <Text style={styles.modalAddressText} numberOfLines={2}>
                      {selectedDish.address}
                    </Text>
                  </View>
                ) : null}
                <ScrollView style={{ maxHeight: 150 }}>
                  <Text style={styles.modalDesc}>
                    {selectedDish.desc[lang]}
                  </Text>
                </ScrollView>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      isSpeaking && { backgroundColor: "#d97706" },
                    ]}
                    onPress={() => {
                      if (isSpeaking) {
                        handleStopSpeech();
                      } else {
                        speakText(
                          selectedDish.desc[lang] || selectedDish.desc.vi,
                        );
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Ionicons
                        name={isSpeaking ? "stop-circle" : "volume-high"}
                        size={18}
                        color="#ffffff"
                      />
                      <Text style={styles.primaryBtnText}>
                        {isSpeaking
                          ? `${ui.stopVoiceModalBtn} (${LANGS[lang].label})`
                          : `${ui.playVoiceModalBtn} (${LANGS[lang].label})`}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {isSpeaking && (
                    <TouchableOpacity
                      style={[
                        styles.secondaryBtn,
                        { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
                      ]}
                      onPress={handleStopSpeech}
                      activeOpacity={0.85}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Ionicons
                          name="stop-circle-outline"
                          size={18}
                          color="#b91c1c"
                        />
                        <Text
                          style={[
                            styles.secondaryBtnText,
                            { color: "#b91c1c" },
                          ]}
                        >
                          {ui.stopVoiceModalBtn}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() =>
                      Linking.openURL(
                        `https://www.google.com/maps/dir/?api=1&destination=${selectedDish.lat},${selectedDish.lng}`,
                      )
                    }
                  >
                    <Text style={styles.secondaryBtnText}>
                      {ui.directionsModalBtn}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.secondaryBtn,
                      checkedDishIds.includes(selectedDish.id) && {
                        backgroundColor: "#10b981",
                        borderColor: "#10b981",
                      },
                    ]}
                    onPress={() => handleCheckInDish(selectedDish)}
                  >
                    <Text
                      style={[
                        styles.secondaryBtnText,
                        checkedDishIds.includes(selectedDish.id) && {
                          color: "#fff",
                        },
                      ]}
                    >
                      {checkedDishIds.includes(selectedDish.id)
                        ? ui.checkInDone
                        : ui.checkInNow}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleCloseDishModal}
                >
                  <Text style={styles.closeBtnText}>{ui.closeBtn}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Modal>

      <Modal visible={tasteCardVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.tasteModalBox}>
            <View style={styles.tasteModalBadge}>
              <Text style={styles.tasteModalBadgeText}>
                {ui.tasteModalBadge}
              </Text>
            </View>

            <Text style={styles.tasteModalHeading}>{ui.tasteModalHeading}</Text>
            <Text style={styles.tasteModalSub}>{ui.tasteModalSub}</Text>

            <View style={styles.tasteLargeList}>
              {selectedDietary.length === 0 && !activeExtraNoteVi ? (
                <Text style={styles.tasteLargeItemText}>
                  {ui.tasteNormalText}
                </Text>
              ) : (
                <>
                  {DIETARY_OPTIONS.filter((opt) =>
                    selectedDietary.includes(opt.id),
                  ).map((opt) => (
                    <View key={opt.id} style={styles.tasteLargeItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tasteLargeItemText}>
                          {opt.label.vi}
                        </Text>
                        {lang !== "vi" && (
                          <Text
                            style={{
                              color: "#a89a82",
                              fontSize: 13,
                              marginTop: 2,
                            }}
                          >
                            {opt.label[lang] || opt.label.en}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}

                  {activeExtraNoteVi.length > 0 && (
                    <View style={styles.tasteLargeItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tasteLargeItemText}>
                          Lưu ý thêm: {activeExtraNoteVi}
                        </Text>
                        {customDietaryNote.trim().toLowerCase() !==
                          activeExtraNoteVi.toLowerCase() && (
                          <Text
                            style={{
                              color: "#a89a82",
                              fontSize: 13,
                              marginTop: 2,
                            }}
                          >
                            ({customDietaryNote.trim()})
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.openTasteCardBtn,
                isSpeaking && { backgroundColor: "#d97706" },
              ]}
              onPress={() => {
                if (isSpeaking) {
                  handleStopSpeech();
                } else {
                  speakText(buildChefVoiceMessage(), "vi-VN");
                }
              }}
            >
              <Text style={styles.openTasteCardBtnText}>
                {isSpeaking
                  ? `⏹ ${ui.stopVoiceModalBtn}`
                  : ui.replayChefVoiceBtn}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeBtn, { width: "100%", marginTop: 10 }]}
              onPress={() => {
                handleStopSpeech();
                setTasteCardVisible(false);
              }}
            >
              <Text style={styles.closeBtnText}>{ui.closeTasteCardBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={qrVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalBox, { padding: 24, alignItems: "center" }]}
          >
            <Text style={styles.qrModalTitle}>{ui.qrModalTitle}</Text>
            <Text style={styles.qrModalDesc}>
              {ui.qrModalDesc} ({LANGS[lang].label}).
            </Text>

            <View style={styles.qrFrame}>
              <Image
                source={{ uri: qrImageUri }}
                style={{ width: 220, height: 220 }}
              />
            </View>

            <TextInput
              value={customUrl}
              onChangeText={setCustomUrl}
              style={styles.urlInput}
            />

            <TouchableOpacity
              style={[styles.closeBtn, { width: "100%" }]}
              onPress={() => setQrVisible(false)}
            >
              <Text style={styles.closeBtnText}>{ui.closeQrModalBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={customerMapVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setCustomerMapVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#fdfbf7" }}>
          <View style={styles.customerMapHeader}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.customerMapTitle} numberOfLines={1}>
                {ui.mapModalTitle || "THEO DẤU VỊ HỘI — BẢN ĐỒ & CHỈ ĐƯỜNG GPS"}
              </Text>
              <Text style={styles.customerMapSubtitle} numberOfLines={1}>
                {ui.mapModalSubtitle ||
                  "Định vị GPS tức thời · Quét bán kính · Chỉ đường thực tế OSRM"}
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TouchableOpacity
                style={styles.customerMapCloseBtn}
                onPress={() => setCustomerMapVisible(false)}
              >
                <Text style={styles.customerMapCloseBtnText}>
                  {ui.closeModalBtn || `✕ ${ui.closeBtn || "Đóng"}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            {Platform.OS === "web" ? (
              <iframe
                key={`customer-map-iframe-${lang}`}
                src={getCustomerMapUrl(lang)}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  backgroundColor: "#fdfbf7",
                }}
                allow="geolocation"
                title="Bản Đồ GPS Ẩm Thực Hội An"
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#8b1d24",
                    marginBottom: 8,
                  }}
                >
                  Bản Đồ Ẩm Thực Du Khách Hội An
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                >
                  Trải nghiệm khám phá quán ăn với radar GPS và định tuyến đường
                  bộ OSRM.
                </Text>
                <TouchableOpacity
                  style={styles.qrTriggerBtn}
                  onPress={() =>
                    Linking.openURL(`/customer-map.html?lang=${lang}`)
                  }
                >
                  <Text style={styles.qrTriggerText}>
                    Mở Bản Đồ Trên Trình Duyệt
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
