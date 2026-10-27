import { HOI_AN_DISHES_PRESETS } from '../../data/hoiAnDishesData';

export type SupportedLang = 'vi' | 'en' | 'zh' | 'ko' | 'ja';

export interface HoiAnPresetTranslation {
  name: Record<SupportedLang, string>;
  description: Record<SupportedLang, string>;
  tag?: Record<SupportedLang, string>;
  image?: string;
}

const ALIASES: Array<{ keywords: string[]; targetId: string }> = [
  { keywords: ['cao lau ba le', 'quan cao lau ba le', 'cao lau', 'cao lau hoi an', 'cao lau co truyen'], targetId: '5' },
  { keywords: ['tra mot', 'nuoc mot', 'mot hoi an', 'tra thao moc'], targetId: '17' },
  { keywords: ['banh mi phuong', 'banh mi', 'banh mi dac ruot'], targetId: '2' },
  { keywords: ['com ga ba buoi', 'com ga', 'com ga pho co'], targetId: '1' },
  { keywords: ['gieng ba le', 'quan gieng ba le', 'banh xeo', 'banh xeo tom dat'], targetId: '3' },
  { keywords: ['bong hong trang', 'banh vac', 'hoa hong trang', 'banh bao banh vac'], targetId: '4' },
  { keywords: ['mi quang ong hai', 'mi quang', 'mi quang tom thit'], targetId: '6' },
  { keywords: ['bun ba thuan', 'bun mam nem', 'heo quay'], targetId: '7' },
  { keywords: ['hoanh thanh anh dung', 'hoanh thanh sup', 'hoanh thanh'], targetId: '8' },
  { keywords: ['che cam nam', 'che bap', 'che bap non'], targetId: '9' },
  { keywords: ['che ong thieu', 'xi ma phu', 'che me den', 'me den co truyen'], targetId: '10' },
  { keywords: ['tau pho song hoai', 'tau pho', 'tau hu'], targetId: '11' },
  { keywords: ['chay tam quang', 'cao lau chay'], targetId: '12' },
  { keywords: ['pho am thuc', 'hoanh thanh chien', 'hoanh thanh sot chua ngot'], targetId: '13' },
  { keywords: ['bo song hoai', 'thit xien nuong', 'thit xien nuong cuon banh uot'], targetId: '14' },
  { keywords: ['quan ba gia', 'banh dap', 'banh dap hen tron', 'banh dap hen xao'], targetId: '15' },
  { keywords: ['ganh chua cau', 'banh beo chen', 'banh xoai'], targetId: '16' },
  { keywords: ['faifo roastery', 'ca phe phin', 'ca phe muoi'], targetId: '18' },
  { keywords: ['dua cam thanh', 'nuoc dua tac', 'rung dua bay mau'], targetId: '19' },
  { keywords: ['tra song hoai', 'tra hoa dau biec'], targetId: '20' },
  { keywords: ['banh to co truyen', 'banh to', 'cam pho'], targetId: '21' },
  { keywords: ['bun nghe', 'bun nghe xao'], targetId: '22' },
  { keywords: ['che sen co thap', 'che hat sen', 'che sen'], targetId: '23' },
  { keywords: ['banh dau xanh ba trinh', 'banh dau xanh', 'banh dau xanh nhan thit'], targetId: '24' },
  { keywords: ['tra quan co faifo', 'tra gung sa que'], targetId: '25' },
];

function normalize(s: string | null | undefined): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findHoiAnPreset(nameOrShop: string, dishId?: string | number): HoiAnPresetTranslation | null {
  const norm = normalize(nameOrShop);

  let raw: any = null;

  // 1. Luôn ưu tiên đối chiếu theo tên món ăn / tên quán / từ khoá ẩm thực thực tế
  if (norm) {
    for (const alias of ALIASES) {
      if (alias.keywords.some((k) => norm.includes(k) || k.includes(norm))) {
        raw = (HOI_AN_DISHES_PRESETS as readonly any[]).find((d) => String(d.id) === alias.targetId);
        if (raw) break;
      }
    }
  }

  if (!raw && norm) {
    raw = (HOI_AN_DISHES_PRESETS as readonly any[]).find((d) => {
      const s1 = normalize(d.shopVi);
      const s2 = normalize(d.translations?.vi?.name);
      return (
        s1 === norm ||
        s2 === norm ||
        norm.includes(s1) ||
        s1.includes(norm) ||
        norm.includes(s2) ||
        s2.includes(norm)
      );
    });
  }

  // 2. Chỉ dùng dishId làm fallback cuối nếu không tìm thấy tên phù hợp
  if (!raw && dishId != null) {
    raw = (HOI_AN_DISHES_PRESETS as readonly any[]).find((d) => String(d.id) === String(dishId));
  }

  if (!raw || !raw.translations) return null;

  const t = raw.translations;
  return {
    name: {
      vi: t.vi?.name || nameOrShop,
      en: t.en?.name || t.vi?.name || nameOrShop,
      zh: t.zh?.name || t.vi?.name || nameOrShop,
      ko: t.ko?.name || t.vi?.name || nameOrShop,
      ja: t.ja?.name || t.vi?.name || nameOrShop,
    },
    description: {
      vi: t.vi?.story || '',
      en: t.en?.story || t.vi?.story || '',
      zh: t.zh?.story || t.vi?.story || '',
      ko: t.ko?.story || t.vi?.story || '',
      ja: t.ja?.story || t.vi?.story || '',
    },
    tag: {
      vi: t.vi?.tag || '',
      en: t.en?.tag || '',
      zh: t.zh?.tag || '',
      ko: t.ko?.tag || '',
      ja: t.ja?.tag || '',
    },
    image: raw.image || '',
  };
}

export function getAllPresets() {
  return HOI_AN_DISHES_PRESETS;
}
