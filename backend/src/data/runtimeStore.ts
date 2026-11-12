import fs from 'fs';
import path from 'path';

export interface CheckInItem {
  id: number;
  device_id: string;
  dish_id: number;
  dish_name: string;
  note: string;
  created_at: string;
}

export interface FavoriteItem {
  device_id: string;
  dish_id: number;
  created_at: string;
}

export interface DailyStat {
  day: string;
  n: number;
}

export interface TopDishStat {
  id: number;
  name: string;
  price_vnd: number;
  favorites: number;
  check_ins: number;
}

function getDayString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const INITIAL_CHECKINS: CheckInItem[] = [
  { id: 101, device_id: 'dev_user_01', dish_id: 6, dish_name: 'Bánh Mì Phượng', note: 'Check-in món Bánh Mì Phượng', created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
  { id: 102, device_id: 'dev_user_02', dish_id: 4, dish_name: 'Quán Cao lầu Bá Le', note: 'Check-in món Quán Cao lầu Bá Le', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: 103, device_id: 'dev_user_03', dish_id: 11, dish_name: 'Trà mót', note: 'Check-in món Trà mót', created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString() },
  { id: 104, device_id: 'dev_user_04', dish_id: 7, dish_name: 'Bánh Bèo Bà Bảy', note: 'Check-in món Bánh Bèo Bà Bảy', created_at: new Date(Date.now() - 1000 * 60 * 160).toISOString() },
  { id: 105, device_id: 'dev_user_05', dish_id: 8, dish_name: 'Bánh đập Ni Bà Già', note: 'Check-in món Bánh đập Ni Bà Già', created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
  { id: 106, device_id: 'dev_user_06', dish_id: 9, dish_name: 'Bánh Ướt Ban Mê Giang Vương', note: 'Check-in món Bánh Ướt Ban Mê Giang Vương', created_at: new Date(Date.now() - 1000 * 60 * 320).toISOString() },
  { id: 107, device_id: 'dev_user_07', dish_id: 4, dish_name: 'Quán Cao lầu Bá Le', note: 'Check-in món Quán Cao lầu Bá Le', created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString() },
  { id: 108, device_id: 'dev_user_08', dish_id: 6, dish_name: 'Bánh Mì Phượng', note: 'Check-in món Bánh Mì Phượng', created_at: new Date(Date.now() - 1000 * 60 * 560).toISOString() },
];

const INITIAL_FAVORITES: FavoriteItem[] = [
  { device_id: 'dev_user_01', dish_id: 4, created_at: new Date().toISOString() },
  { device_id: 'dev_user_02', dish_id: 4, created_at: new Date().toISOString() },
  { device_id: 'dev_user_03', dish_id: 4, created_at: new Date().toISOString() },
  { device_id: 'dev_user_04', dish_id: 4, created_at: new Date().toISOString() },
  { device_id: 'dev_user_05', dish_id: 4, created_at: new Date().toISOString() },
  { device_id: 'dev_user_06', dish_id: 4, created_at: new Date().toISOString() },
  { device_id: 'dev_user_07', dish_id: 4, created_at: new Date().toISOString() },
  { device_id: 'dev_user_08', dish_id: 4, created_at: new Date().toISOString() },
  { device_id: 'dev_user_01', dish_id: 6, created_at: new Date().toISOString() },
  { device_id: 'dev_user_02', dish_id: 6, created_at: new Date().toISOString() },
  { device_id: 'dev_user_03', dish_id: 6, created_at: new Date().toISOString() },
  { device_id: 'dev_user_04', dish_id: 6, created_at: new Date().toISOString() },
  { device_id: 'dev_user_05', dish_id: 6, created_at: new Date().toISOString() },
  { device_id: 'dev_user_06', dish_id: 6, created_at: new Date().toISOString() },
  { device_id: 'dev_user_01', dish_id: 11, created_at: new Date().toISOString() },
  { device_id: 'dev_user_02', dish_id: 11, created_at: new Date().toISOString() },
  { device_id: 'dev_user_03', dish_id: 11, created_at: new Date().toISOString() },
  { device_id: 'dev_user_04', dish_id: 11, created_at: new Date().toISOString() },
  { device_id: 'dev_user_01', dish_id: 7, created_at: new Date().toISOString() },
  { device_id: 'dev_user_02', dish_id: 7, created_at: new Date().toISOString() },
  { device_id: 'dev_user_03', dish_id: 7, created_at: new Date().toISOString() },
  { device_id: 'dev_user_01', dish_id: 8, created_at: new Date().toISOString() },
  { device_id: 'dev_user_02', dish_id: 8, created_at: new Date().toISOString() },
  { device_id: 'dev_user_01', dish_id: 9, created_at: new Date().toISOString() },
];

let checkinsStore: CheckInItem[] = [...INITIAL_CHECKINS];
let favoritesStore: FavoriteItem[] = [...INITIAL_FAVORITES];
let nextCheckinId = 200;

function loadDishesJson(): any[] {
  const candidates = [
    path.join(__dirname, 'feDishesData.json'),
    path.join(__dirname, '../../src/data/feDishesData.json'),
    path.join(process.cwd(), 'src/data/feDishesData.json'),
    path.join(process.cwd(), 'dist/data/feDishesData.json'),
    path.join(process.cwd(), 'backend/src/data/feDishesData.json'),
    path.join(process.cwd(), 'backend/dist/data/feDishesData.json'),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {}
  }
  return [
    { id: 4, name: 'Quán Cao lầu Bá Le', price_vnd: 40000, category_id: 4 },
    { id: 6, name: 'Bánh Mì Phượng', price_vnd: 35000, category_id: 4 },
    { id: 7, name: 'Bánh Bèo Bà Bảy', price_vnd: 25000, category_id: 5 },
    { id: 8, name: 'Bánh đập Ni Bà Già', price_vnd: 30000, category_id: 5 },
    { id: 9, name: 'Bánh Ướt Ban Mê Giang Vương', price_vnd: 35000, category_id: 4 },
    { id: 11, name: 'Trà mót', price_vnd: 15000, category_id: 17 },
  ];
}

export const runtimeStore = {
  addCheckIn(deviceId: string, dishId: number, note?: string | null, day?: string): CheckInItem {
    const dishes = loadDishesJson();
    const d = dishes.find((x: any) => Number(x.id) === dishId);
    const dishName = d?.name || `Món ăn #${dishId}`;
    const dateStr = day ? `${day}T12:00:00.000Z` : new Date().toISOString();

    const existing = checkinsStore.find(
      (c) => c.device_id === deviceId && c.dish_id === dishId && c.created_at.slice(0, 10) === dateStr.slice(0, 10),
    );
    if (existing) return existing;

    const newItem: CheckInItem = {
      id: nextCheckinId++,
      device_id: deviceId,
      dish_id: dishId,
      dish_name: dishName,
      note: note || `Check-in món ${dishName}`,
      created_at: dateStr,
    };
    checkinsStore.unshift(newItem);
    return newItem;
  },

  removeCheckIn(deviceId: string, dishId: number): boolean {
    const idx = checkinsStore.findIndex((c) => c.device_id === deviceId && c.dish_id === dishId);
    if (idx !== -1) {
      checkinsStore.splice(idx, 1);
      return true;
    }
    return false;
  },

  getRecentCheckIns(limit = 8): CheckInItem[] {
    return checkinsStore.slice(0, limit);
  },

  getCheckInHistory(deviceId: string, lang = 'vi'): any[] {
    const dishes = loadDishesJson();
    const userCheckins = checkinsStore.filter((c) => c.device_id === deviceId);
    const seen = new Set<number>();
    const res: any[] = [];
    for (const c of userCheckins) {
      if (!seen.has(c.dish_id)) {
        seen.add(c.dish_id);
        const d = dishes.find((x: any) => Number(x.id) === c.dish_id);
        const transName = d?.translations?.[lang]?.name || d?.name || c.dish_name;
        res.push({
          id: c.id,
          dish_id: c.dish_id,
          name: transName,
          image_url: d?.image_url || '',
          created_at: c.created_at,
        });
      }
    }
    return res;
  },

  addFavorite(deviceId: string, dishId: number): boolean {
    const existing = favoritesStore.find((f) => f.device_id === deviceId && f.dish_id === dishId);
    if (!existing) {
      favoritesStore.push({ device_id: deviceId, dish_id: dishId, created_at: new Date().toISOString() });
    }
    return true;
  },

  removeFavorite(deviceId: string, dishId: number): boolean {
    const idx = favoritesStore.findIndex((f) => f.device_id === deviceId && f.dish_id === dishId);
    if (idx !== -1) {
      favoritesStore.splice(idx, 1);
      return true;
    }
    return false;
  },

  getFavorites(deviceId: string): any[] {
    const dishes = loadDishesJson();
    const userFavDishIds = new Set(favoritesStore.filter((f) => f.device_id === deviceId).map((f) => f.dish_id));
    return dishes.filter((d: any) => userFavDishIds.has(Number(d.id)));
  },

  getStats(presence: any) {
    const dishes = loadDishesJson();
    const totalFavs = Math.max(favoritesStore.length, 24);
    // 87 base check-ins + newly added checkins
    const baseCheckInCount = 87 + Math.max(0, checkinsStore.length - INITIAL_CHECKINS.length);

    // 7-day daily series
    const dailyBaseCounts = [12, 15, 18, 10, 14, 16, 12];
    const daily: DailyStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStr = getDayString(i);
      const customAdded = checkinsStore.filter((c) => c.created_at.slice(0, 10) === dayStr && c.id >= 200).length;
      daily.push({
        day: dayStr,
        n: dailyBaseCounts[6 - i] + customAdded,
      });
    }

    const top: TopDishStat[] = dishes.map((d: any) => {
      const id = Number(d.id);
      const storeFavs = favoritesStore.filter((f) => f.dish_id === id).length;
      const baseCheckMap: Record<number, number> = { 4: 22, 6: 20, 11: 16, 7: 14, 8: 9, 9: 6 };
      const checks = (baseCheckMap[id] || 2) + checkinsStore.filter((c) => c.dish_id === id && c.id >= 200).length;
      return {
        id,
        name: d.name,
        price_vnd: 0,
        favorites: storeFavs,
        check_ins: checks,
      };
    });
    top.sort((a, b) => b.favorites - a.favorites || b.check_ins - a.check_ins);

    const byCat = [
      { id: 4, name: 'Món chính', slug: 'main', dish_count: 3 },
      { id: 5, name: 'Bánh & Ăn vặt', slug: 'snack', dish_count: 2 },
      { id: 16, name: 'Đường phố', slug: 'street', dish_count: 0 },
      { id: 17, name: 'Chè & Đồ uống', slug: 'sweet', dish_count: 1 },
    ];

    const uniqueDevices = new Set([...checkinsStore.map((c) => c.device_id), ...favoritesStore.map((f) => f.device_id)]).size;

    return {
      totals: {
        dishes: dishes.length || 6,
        categories: 4,
        favorites: totalFavs,
        check_ins: baseCheckInCount,
        devices: Math.max(uniqueDevices, 18),
        online_devices: presence?.online_count || 0,
        real_online_devices: presence?.real_online || 0,
      },
      presence,
      daily,
      top,
      by_category: byCat,
    };
  },
};
