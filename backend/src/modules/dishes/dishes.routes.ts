import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../config/db';
import { ah } from '../../middlewares/error';

const r = Router();

export const SUPPORTED_LANGS = ['vi', 'en', 'zh', 'ko', 'ja'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const LANG_TARGET_MAP: Record<Exclude<SupportedLang, 'vi'>, string> = {
  en: 'en',
  zh: 'zh-CN',
  ko: 'ko',
  ja: 'ja',
};

// Chuẩn hoá thuật ngữ ẩm thực Hội An trước và sau khi dịch tự động
const CULINARY_GLOSSARY: Array<{
  pattern: RegExp;
  replacement: Record<Exclude<SupportedLang, 'vi'>, string>;
}> = [
  {
    pattern: /\bQuán\s+Cao\s+[lL]ầu\s+Bá\s+Lễ\b/gi,
    replacement: {
      en: 'Ba Le Cao Lau Noodles',
      zh: '霸礼高楼面馆 (Cao Lầu Bá Lễ)',
      ko: '바레 까오러우 전문점 (Cao Lầu Bá Lễ)',
      ja: 'バーレー・カオラウ専門店 (Cao Lầu Bá Lễ)',
    },
  },
  {
    pattern: /\bBánh\s+M[ìì]\s+Phượng\b/gi,
    replacement: {
      en: 'Banh Mi Phuong',
      zh: '会安Phượng法棍三明治 (Bánh Mì Phượng)',
      ko: '반미 프엉 (Bánh Mì Phượng)',
      ja: 'バインミー・フ엉 (Bánh Mì Phượng)',
    },
  },
  {
    pattern: /\bCơm\s+Gà\s+B[àà]\s+Bu[ộọ]i\b/gi,
    replacement: {
      en: 'Ba Buoi Hoi An Chicken Rice',
      zh: '会安Bà Buội鸡饭 (Cơm Gà Bà Buội)',
      ko: '바부오이 호이안 치킨라이스 (Cơm Gà Bà Buội)',
      ja: 'バーブオイ・ホイアンチキンライス (Cơm Gà Bà Buội)',
    },
  },
  {
    pattern: /\bTrà\s+[mM]ót\b/gi,
    replacement: {
      en: 'Mot Hoi An Herbal Tea',
      zh: '会安Mót草本凉茶',
      ko: '호이안 못(Mót) 전통 허브티',
      ja: 'ホイアン名物モット（Mót）伝統ハーブティー',
    },
  },
  {
    pattern: /\bBánh\s+bao\s+bánh\s+vạc(\s+Hội\s+An)?\b/gi,
    replacement: {
      en: 'White Rose Dumplings (Bánh Bao Bánh Vạc)',
      zh: '会安白玫瑰虾饺 (Bánh Bao Bánh Vạc)',
      ko: '화이트 로즈 만두 (Bánh Bao Bánh Vạc)',
      ja: 'ホワイトローズ蒸し餃子 (Bánh Bao Bánh Vạc)',
    },
  },
  {
    pattern: /\bM[ìi]\s+Quảng(\s+Hội\s+An)?\b/gi,
    replacement: {
      en: 'Mi Quang Turmeric Noodles',
      zh: '广南姜黄面 (Mì Quảng)',
      ko: '미꽝 강황 국수 (Mì Quảng)',
      ja: 'ミークアン（広南風ターメリック麺）',
    },
  },
  {
    pattern: /\bHoành\s+thánh(\s+chiên)?(\s+Hội\s+An)?\b/gi,
    replacement: {
      en: 'Hoi An Crispy Wontons (Hoành Thánh)',
      zh: '会安炸云吞 (Hoành Thánh)',
      ko: '호이안 프라이드 완탄 (Hoành Thánh)',
      ja: 'ホイアン風揚げワンタン (Hoành Thánh)',
    },
  },
];

function splitIntoChunks(text: string, maxLen = 360): string[] {
  if (text.length <= maxLen) return [text];
  const sentences = text.split(/(?<=[.!?。！？])\s+/);
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if ((current + (current ? ' ' : '') + s).length <= maxLen) {
      current = current ? `${current} ${s}` : s;
    } else {
      if (current) chunks.push(current);
      if (s.length <= maxLen) {
        current = s;
      } else {
        for (let i = 0; i < s.length; i += maxLen) {
          chunks.push(s.slice(i, i + maxLen));
        }
        current = '';
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translateSingleChunk(
  chunk: string,
  targetLang: Exclude<SupportedLang, 'vi'>,
): Promise<string> {
  const tl = LANG_TARGET_MAP[targetLang];

  // 1. Thử Google Translate GTX trước
  try {
    const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${tl}&dt=t&q=${encodeURIComponent(chunk)}`;
    const gRes = await fetch(gUrl);
    if (gRes.ok) {
      const data: any = await gRes.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((part: any) => part?.[0] || '')
          .join('')
          .trim();
        if (translated) return translated;
      }
    }
  } catch {
    // Chuyển sang provider dự phòng bên dưới
  }

  // 2. Dự phòng MyMemory Neural MT (hoạt động ổn định ngay cả khi IP bị Google giới hạn 429)
  try {
    const emailParam = `hoian_culinary_${Math.floor(Math.random() * 900000 + 100000)}@gmail.com`;
    const mUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=vi|${tl}&de=${emailParam}`;
    const mRes = await fetch(mUrl);
    if (mRes.ok) {
      const data: any = await mRes.json();
      const translated: string | undefined = data?.responseData?.translatedText?.trim();
      if (
        translated &&
        !translated.toUpperCase().includes('MYMEMORY WARNING') &&
        !translated.toUpperCase().includes('QUERY LENGTH LIMIT')
      ) {
        return translated;
      }
    }
  } catch {
    // Fallback cuối
  }

  return chunk;
}

export async function autoTranslateFromVi(
  textVi: string | null | undefined,
  targetLang: Exclude<SupportedLang, 'vi'>,
): Promise<string | null> {
  const clean = (textVi || '').normalize('NFC').trim();
  if (!clean) return null;

  // Kiểm tra khớp chính xác tên các món đặc sản nổi tiếng Hội An
  for (const item of CULINARY_GLOSSARY) {
    if (item.pattern.test(clean) && clean.replace(item.pattern, '').trim() === '') {
      item.pattern.lastIndex = 0;
      return item.replacement[targetLang];
    }
    item.pattern.lastIndex = 0;
  }

  // Tách theo đoạn xuống dòng (\n) để giữ nguyên bố cục đoạn văn
  const paragraphs = clean.split(/\n+/);
  const translatedParagraphs: string[] = [];

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;
    const chunks = splitIntoChunks(trimmedPara, 360);
    const translatedChunks: string[] = [];
    for (const c of chunks) {
      translatedChunks.push(await translateSingleChunk(c, targetLang));
    }
    translatedParagraphs.push(translatedChunks.join(' '));
  }

  const result = translatedParagraphs.join('\n\n').trim();
  return result || clean;
}

const transItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
});

const dishSchema = z.object({
  category_id: z.number().int().nullable().optional(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  price_vnd: z.number().int().nonnegative().nullable().optional(),
  image_url: z.string().nullable().optional(),
  emoji: z.string().min(1).optional().default('🍜'),
  rating: z.number().min(0).max(5).optional().default(4.8),
  lat: z.number().optional().default(15.877),
  lng: z.number().optional().default(108.327),
  is_active: z.boolean().default(true),
  translations: z
    .object({
      vi: transItemSchema.optional(),
      en: transItemSchema.optional(),
      zh: transItemSchema.optional(),
      ko: transItemSchema.optional(),
      ja: transItemSchema.optional(),
    })
    .optional(),
});

const DISH_SELECT_SQL = `
  SELECT
    d.*,
    d.rating::float AS rating,
    c.name AS category_name,
    c.slug AS category_slug,
    c.translations AS category_translations,
    (SELECT count(*) FROM favorites f WHERE f.dish_id = d.id)::int AS favorite_count,
    COALESCE(
      (
        SELECT jsonb_object_agg(
          dt.lang,
          jsonb_build_object('name', dt.name, 'description', COALESCE(dt.description, ''))
        )
        FROM dish_translations dt
        WHERE dt.dish_id = d.id
      ),
      '{}'::jsonb
    ) AS translations
  FROM dishes d
  LEFT JOIN categories c ON c.id = d.category_id
`;

const nfc = (s: string | null | undefined): string => (s ? s.normalize('NFC') : '');

function formatDishRow(row: any, requestedLang?: string) {
  const rawTrans = row.translations || {};
  const rowName = nfc(row.name);
  const rowDesc = nfc(row.description);
  const name_i18n: Record<SupportedLang, string> = {
    vi: nfc(rawTrans.vi?.name) || rowName,
    en: nfc(rawTrans.en?.name) || nfc(rawTrans.vi?.name) || rowName,
    zh: nfc(rawTrans.zh?.name) || nfc(rawTrans.vi?.name) || rowName,
    ko: nfc(rawTrans.ko?.name) || nfc(rawTrans.vi?.name) || rowName,
    ja: nfc(rawTrans.ja?.name) || nfc(rawTrans.vi?.name) || rowName,
  };
  const desc_i18n: Record<SupportedLang, string> = {
    vi: nfc(rawTrans.vi?.description) || rowDesc,
    en: nfc(rawTrans.en?.description) || nfc(rawTrans.vi?.description) || rowDesc,
    zh: nfc(rawTrans.zh?.description) || nfc(rawTrans.vi?.description) || rowDesc,
    ko: nfc(rawTrans.ko?.description) || nfc(rawTrans.vi?.description) || rowDesc,
    ja: nfc(rawTrans.ja?.description) || nfc(rawTrans.vi?.description) || rowDesc,
  };

  const lang: SupportedLang =
    requestedLang && SUPPORTED_LANGS.includes(requestedLang as SupportedLang)
      ? (requestedLang as SupportedLang)
      : 'vi';

  return {
    ...row,
    name: rowName,
    description: rowDesc,
    address: row.address ? nfc(row.address) : row.address,
    rating: Number(row.rating ?? 4.8),
    lat: Number(row.lat ?? 15.877),
    lng: Number(row.lng ?? 108.327),
    emoji: row.emoji || '🍜',
    category_slug: row.category_slug || 'main',
    localized_name: name_i18n[lang],
    localized_description: desc_i18n[lang],
    name_i18n,
    desc_i18n,
    translations: {
      vi: { name: name_i18n.vi, description: desc_i18n.vi },
      en: { name: name_i18n.en, description: desc_i18n.en },
      zh: { name: name_i18n.zh, description: desc_i18n.zh },
      ko: { name: name_i18n.ko, description: desc_i18n.ko },
      ja: { name: name_i18n.ja, description: desc_i18n.ja },
    },
  };
}

async function upsertTranslations(
  dishId: number,
  viName: string,
  viDesc: string | null | undefined,
  translations?: z.infer<typeof dishSchema>['translations'],
) {
  const baseViName = translations?.vi?.name?.trim() || viName.trim();
  const baseViDesc = translations?.vi?.description?.trim() || viDesc?.trim() || null;

  const merged: Record<SupportedLang, { name: string; description: string | null }> = {
    vi: { name: baseViName, description: baseViDesc },
    en: { name: baseViName, description: baseViDesc },
    zh: { name: baseViName, description: baseViDesc },
    ko: { name: baseViName, description: baseViDesc },
    ja: { name: baseViName, description: baseViDesc },
  };

  const otherLangs: Exclude<SupportedLang, 'vi'>[] = ['en', 'zh', 'ko', 'ja'];

  await Promise.all(
    otherLangs.map(async (lang) => {
      const providedName = translations?.[lang]?.name?.trim();
      const providedDesc = translations?.[lang]?.description?.trim();

      const needsAutoName = !providedName || providedName === baseViName;
      const needsAutoDesc = baseViDesc && (!providedDesc || providedDesc === baseViDesc);

      const [finalName, finalDesc] = await Promise.all([
        needsAutoName ? autoTranslateFromVi(baseViName, lang) : Promise.resolve(providedName!),
        needsAutoDesc ? autoTranslateFromVi(baseViDesc, lang) : Promise.resolve(providedDesc ?? baseViDesc),
      ]);

      merged[lang] = {
        name: finalName || baseViName,
        description: finalDesc ?? baseViDesc,
      };
    }),
  );

  for (const [lang, item] of Object.entries(merged)) {
    await pool.query(
      `INSERT INTO dish_translations (dish_id, lang, name, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (dish_id, lang)
       DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
      [dishId, lang, item.name, item.description],
    );
  }
}

// Danh sách món ăn (hỗ trợ tìm kiếm đa ngôn ngữ ?q=..., lọc ?category_id=..., ?category_slug=..., ?lang=...)
r.get('/', ah(async (req, res) => {
  const q = typeof req.query.q === 'string' && req.query.q.trim() ? req.query.q.trim() : null;
  const cat = req.query.category_id ? Number(req.query.category_id) : null;
  const catSlug = typeof req.query.category_slug === 'string' && req.query.category_slug ? req.query.category_slug : null;
  const lang = typeof req.query.lang === 'string' ? req.query.lang : undefined;

  const { rows } = await pool.query(
    `${DISH_SELECT_SQL}
     WHERE (
       $1::text IS NULL
       OR d.name ILIKE '%' || $1 || '%'
       OR COALESCE(d.description, '') ILIKE '%' || $1 || '%'
       OR COALESCE(d.address, '') ILIKE '%' || $1 || '%'
       OR EXISTS (
         SELECT 1 FROM dish_translations dt
         WHERE dt.dish_id = d.id
           AND (dt.name ILIKE '%' || $1 || '%' OR COALESCE(dt.description, '') ILIKE '%' || $1 || '%')
       )
     )
       AND ($2::int IS NULL OR d.category_id = $2)
       AND ($3::text IS NULL OR c.slug = $3)
     ORDER BY d.id ASC`,
    [q, cat, catSlug],
  );
  res.json(rows.map((row) => formatDishRow(row, lang)));
}));

// Chi tiết 1 món ăn kèm đủ 5 ngôn ngữ
r.get('/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  const lang = typeof req.query.lang === 'string' ? req.query.lang : undefined;
  const { rows } = await pool.query(`${DISH_SELECT_SQL} WHERE d.id = $1`, [id]);
  if (!rows[0]) return res.status(404).json({ code: 'NOT_FOUND', message: 'Không tìm thấy món ăn' });
  res.json(formatDishRow(rows[0], lang));
}));

// Thêm món ăn mới (tự động dịch sang 5 ngôn ngữ nếu chỉ nhập Tiếng Việt)
r.post('/', ah(async (req, res) => {
  const b = dishSchema.parse(req.body);
  const { rows } = await pool.query(
    `INSERT INTO dishes (category_id, name, description, address, price_vnd, image_url, emoji, rating, lat, lng, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [
      b.category_id ?? null,
      b.name,
      b.description ?? null,
      b.address ?? null,
      b.price_vnd ?? null,
      b.image_url ?? null,
      b.emoji ?? '🍜',
      b.rating ?? 4.8,
      b.lat ?? 15.877,
      b.lng ?? 108.327,
      b.is_active,
    ],
  );
  const newId = rows[0].id;
  await upsertTranslations(newId, b.name, b.description, b.translations);

  const full = await pool.query(`${DISH_SELECT_SQL} WHERE d.id = $1`, [newId]);
  res.status(201).json(formatDishRow(full.rows[0]));
}));

// Cập nhật món ăn (tự động dịch sang 5 ngôn ngữ nếu chưa nhập bản dịch)
r.put('/:id', ah(async (req, res) => {
  const id = Number(req.params.id);
  const b = dishSchema.parse(req.body);
  const { rows } = await pool.query(
    `UPDATE dishes
     SET category_id=$1, name=$2, description=$3, address=$4, price_vnd=$5,
         image_url=$6, emoji=$7, rating=$8, lat=$9, lng=$10, is_active=$11
     WHERE id=$12 RETURNING id`,
    [
      b.category_id ?? null,
      b.name,
      b.description ?? null,
      b.address ?? null,
      b.price_vnd ?? null,
      b.image_url ?? null,
      b.emoji ?? '🍜',
      b.rating ?? 4.8,
      b.lat ?? 15.877,
      b.lng ?? 108.327,
      b.is_active,
      id,
    ],
  );
  if (!rows[0]) return res.status(404).json({ code: 'NOT_FOUND', message: 'Không tìm thấy món ăn' });

  await upsertTranslations(id, b.name, b.description, b.translations);
  const full = await pool.query(`${DISH_SELECT_SQL} WHERE d.id = $1`, [id]);
  res.json(formatDishRow(full.rows[0]));
}));

// Xoá món ăn
r.delete('/:id', ah(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM dishes WHERE id = $1', [Number(req.params.id)]);
  if (!rowCount) return res.status(404).json({ code: 'NOT_FOUND', message: 'Không tìm thấy món ăn' });
  res.status(204).end();
}));

// Cập nhật riêng lẻ 1 bản dịch ngôn ngữ (vi | en | zh | ko | ja)
r.put('/:id/translations/:lang', ah(async (req, res) => {
  const lang = z.enum(SUPPORTED_LANGS).parse(req.params.lang);
  const b = transItemSchema.parse(req.body);
  const dishId = Number(req.params.id);

  const { rows } = await pool.query(
    `INSERT INTO dish_translations (dish_id, lang, name, description) VALUES ($1,$2,$3,$4)
     ON CONFLICT (dish_id, lang) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
     RETURNING *`,
    [dishId, lang, b.name, b.description ?? null],
  );

  if (lang === 'vi') {
    await pool.query('UPDATE dishes SET name = $1, description = $2 WHERE id = $3', [
      b.name,
      b.description ?? null,
      dishId,
    ]);
  }
  res.json(rows[0]);
}));

export default r;
