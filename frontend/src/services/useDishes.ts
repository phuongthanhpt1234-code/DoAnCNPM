import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export type Dish = {
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

export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tải dữ liệu khi mở trang.
  useEffect(() => {
    let cancelled = false;

    api<Dish[]>("/dishes")
      .then((data) => {
        if (cancelled) return;

        setDishes(data.filter((dish) => dish.is_active));
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Không tải được món ăn",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Tải lại khi người dùng yêu cầu.
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api<Dish[]>("/dishes");
      setDishes(data.filter((dish) => dish.is_active));
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Không tải được món ăn",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { dishes, loading, error, reload };
}
