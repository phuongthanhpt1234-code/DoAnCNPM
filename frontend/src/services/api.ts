import { AppState, Platform } from "react-native";
import { LangKey } from "../data/dishesData";

// Tự động nhận diện backend URL linh hoạt cho cả Local, Render và Vercel
const getFallbackUrl = () => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const host = window.location.hostname;
    // Nếu đang chạy local (localhost hoặc IP mạng LAN như 192.168.x.x)
    if (host === "localhost" || host === "127.0.0.1" || /^192\.168\./.test(host) || /^10\./.test(host)) {
      return `http://${host}:4000`;
    }
  }
  // Mặc định gọi đến Backend triển khai trên Render
  return "https://doancnpm-backend.onrender.com";
};

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? getFallbackUrl()
).replace(/\/+$/, "");

const SESSION_TAB_ID = `tab_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
let cachedDeviceId: string | null = null;

export function getClientDeviceId(): string {
  if (cachedDeviceId) return cachedDeviceId;
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.localStorage
  ) {
    const saved = window.localStorage.getItem("hoian_device_id");
    if (saved) {
      cachedDeviceId = saved;
      return saved;
    }
    const created = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem("hoian_device_id", created);
    cachedDeviceId = created;
    return created;
  }
  cachedDeviceId = `mob_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  return cachedDeviceId;
}

let activeMountCount = 0;
let activeCleanup: (() => void) | null = null;
let currentPresenceLang: LangKey = "vi";

export function startPresenceSession(getLang: () => LangKey): () => void {
  currentPresenceLang = getLang();
  activeMountCount += 1;

  if (activeMountCount === 1 && !activeCleanup) {
    const deviceId = getClientDeviceId();
    const tabId = SESSION_TAB_ID;
    let es: EventSource | null = null;

    const sendHeartbeat = () => {
      fetch(`${API_URL}/api/presence/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          tab_id: tabId,
          lang: currentPresenceLang,
          platform: Platform.OS === "web" ? undefined : Platform.OS,
        }),
      }).catch(() => {});
    };

    const sendLeave = () => {
      const payload = JSON.stringify({ device_id: deviceId, tab_id: tabId });
      if (
        Platform.OS === "web" &&
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function"
      ) {
        navigator.sendBeacon(`${API_URL}/api/presence/leave`, payload);
      } else {
        fetch(`${API_URL}/api/presence/leave`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    sendHeartbeat();
    const hbTimer = setInterval(sendHeartbeat, 5000);

    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (typeof window.EventSource !== "undefined") {
        try {
          const q = new URLSearchParams({
            role: "client",
            device_id: deviceId,
            tab_id: tabId,
            lang: currentPresenceLang,
          });
          es = new window.EventSource(
            `${API_URL}/api/presence/stream?${q.toString()}`,
          );
        } catch {}
      }
      window.addEventListener("pagehide", sendLeave);
      window.addEventListener("beforeunload", sendLeave);
    }

    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        sendHeartbeat();
      } else if (nextState === "background" || nextState === "inactive") {
        sendLeave();
      }
    });

    activeCleanup = () => {
      clearInterval(hbTimer);
      if (es) es.close();
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.removeEventListener("pagehide", sendLeave);
        window.removeEventListener("beforeunload", sendLeave);
      }
      appStateSub.remove();
      sendLeave();
    };
  }

  return () => {
    activeMountCount = Math.max(0, activeMountCount - 1);
    if (activeMountCount === 0 && activeCleanup) {
      activeCleanup();
      activeCleanup = null;
    }
  };
}

export function notifyPresenceLangChange(lang: LangKey) {
  currentPresenceLang = lang;
  const deviceId = getClientDeviceId();
  fetch(`${API_URL}/api/presence/heartbeat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device_id: deviceId,
      tab_id: SESSION_TAB_ID,
      lang,
    }),
  }).catch(() => {});
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(API_URL + "/api" + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Lỗi " + res.status);
  }
  return res.status === 204 ? (null as T) : res.json();
}

export type ApiDish = {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  price_vnd: number | null;
  image_url: string | null;
  emoji: string;
  rating: number;
  lat: number;
  lng: number;
  category_name: string | null;
  category_slug: "main" | "snack" | "street" | "sweet" | null;
  favorite_count: number;
  is_active: boolean;
  name_i18n?: Record<LangKey, string>;
  desc_i18n?: Record<LangKey, string>;
  translations?: Record<LangKey, { name: string; description: string }>;
};

export function getDishes(lang?: LangKey) {
  const query = lang ? `?lang=${encodeURIComponent(lang)}` : "";
  return api<ApiDish[]>("/dishes" + query);
}

export function getFavorites(deviceId: string) {
  return api<ApiDish[]>(`/favorites?device_id=${encodeURIComponent(deviceId)}`);
}

export function addFavorite(deviceId: string, dishId: number) {
  return api<{ ok: boolean }>("/favorites", {
    method: "POST",
    body: JSON.stringify({ device_id: deviceId, dish_id: dishId }),
  });
}

export function removeFavorite(deviceId: string, dishId: number) {
  return api<void>(
    `/favorites/${dishId}?device_id=${encodeURIComponent(deviceId)}`,
    { method: "DELETE" },
  );
}
