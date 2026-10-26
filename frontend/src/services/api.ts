import { Platform } from "react-native";

const fallback =
  Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://localhost:4000";
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? fallback;

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
  category_name: string | null;
  favorite_count: number;
  is_active: boolean;
};

export function getDishes() {
  return api<ApiDish[]>("/dishes");
}
