import { useEffect, useState } from "react";
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

  const reload = () => {
    setLoading(true);
    api<Dish[]>("/dishes")
      .then((d) => setDishes(d.filter((x) => x.is_active)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(reload, []);
  return { dishes, loading, error, reload };
}
