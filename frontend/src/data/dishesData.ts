export type LangKey = "vi" | "en" | "zh" | "ko" | "ja";

export const LANGS: Record<
  LangKey,
  { label: string; speechCode: string; flag: string }
> = {
  vi: { label: "Tiếng Việt", speechCode: "vi-VN", flag: "🇻🇳" },
  en: { label: "English", speechCode: "en-US", flag: "🇬🇧" },
  zh: { label: "中文", speechCode: "zh-CN", flag: "🇨🇳" },
  ko: { label: "한국어", speechCode: "ko-KR", flag: "🇰🇷" },
  ja: { label: "日本語", speechCode: "ja-JP", flag: "🇯🇵" },
};

export interface Dish {
  id: number;
  cat: "main" | "snack" | "street" | "sweet";
  emoji: string;
  price: string;
  rating: number;
  lat: number;
  lng: number;
  img: string;
  fallbackImg?: string;
  address?: string;
  favorite_count?: number;
  name: Record<LangKey, string>;
  desc: Record<LangKey, string>;
  tag?: Record<LangKey, string>;
}

// Đã xoá toàn bộ món ăn mẫu: Danh sách món ăn được lấy 100% từ Backend API
export const DISHES: Dish[] = [];
