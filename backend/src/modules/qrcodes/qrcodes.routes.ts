import { Router } from "express";
import { z } from "zod";
import { pool } from "../../config/db";
import { ah } from "../../middlewares/error";
import { requireAdminAuth } from "../../middlewares/auth";

const r = Router();

// Khởi tạo bảng qr_codes và nạp dữ liệu mẫu ban đầu
export async function ensureQrCodesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        target_type VARCHAR(50) NOT NULL DEFAULT 'dish',
        target_id INTEGER,
        target_url TEXT NOT NULL,
        lang VARCHAR(10) NOT NULL DEFAULT 'vi',
        color VARCHAR(20) NOT NULL DEFAULT '#d4152f',
        location VARCHAR(150),
        scan_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_scanned_at TIMESTAMPTZ
      );
    `);

    const countRes = await pool.query(`SELECT count(*)::int as n FROM qr_codes`);
    if ((countRes.rows[0]?.n || 0) === 0) {
      await pool.query(`
        INSERT INTO qr_codes (code, title, target_type, target_id, target_url, lang, color, location, scan_count)
        VALUES
          ('QR-APP-HOIAN', 'Standee Cổng Chào Phố Cổ (Toàn Ứng Dụng)', 'app', NULL, 'https://doancnpm-beta.vercel.app', 'vi', '#d4152f', 'Cổng Chùa Cầu', 142),
          ('QR-MAP-01', 'Bản Đồ Ẩm Thực Tương Tác', 'map', NULL, 'https://doancnpm-beta.vercel.app/map', 'vi', '#e5a83b', 'Trung tâm thông tin du lịch', 89),
          ('QR-DISH-18', 'QR Standee Quán Trà Mót Hội An', 'dish', 18, 'https://doancnpm-beta.vercel.app/dish/18', 'vi', '#10b981', 'Quầy thảo mộc phố Trần Phú', 315),
          ('QR-DISH-19', 'QR Thẻ Bàn - Cao Lầu Bá Lễ', 'dish', 19, 'https://doancnpm-beta.vercel.app/dish/19', 'vi', '#d4152f', 'Bàn ăn số 2', 125),
          ('QR-DISH-20', 'QR Thẻ Đợi - Bánh Mì Phượng', 'dish', 20, 'https://doancnpm-beta.vercel.app/dish/20', 'vi', '#ea580c', 'Khu vực đợi mang về', 210),
          ('QR-DISH-21', 'QR Thẻ Bàn 3 - Cơm Gà Bà Buội', 'dish', 21, 'https://doancnpm-beta.vercel.app/dish/21', 'vi', '#0f172a', 'Bàn ăn số 3', 78),
          ('QR-DISH-27', 'QR Thẻ Bàn 1 - Mì Quảng 92', 'dish', 27, 'https://doancnpm-beta.vercel.app/dish/27', 'vi', '#d4152f', 'Bàn số 1 - Quán 92', 67)
        ON CONFLICT (code) DO NOTHING;
      `);
      console.log('✅ Khởi tạo dữ liệu mẫu cho Quản Lý Mã QR thành công!');
    }
  } catch (err: any) {
    console.warn('⚠️ Lỗi kiểm tra bảng qr_codes:', err.message);
  }
}

// 1. Lấy danh sách toàn bộ mã QR
r.get(
  "/",
  ah(async (req, res) => {
    const rawQ = req.query.q || req.query.search;
    const q = typeof rawQ === "string" ? rawQ.trim() : null;
    const rawType = req.query.type;
    const type = typeof rawType === "string" ? rawType.trim() : null;

    let sql = `SELECT * FROM qr_codes WHERE 1=1`;
    const params: any[] = [];

    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (title ILIKE $${params.length} OR code ILIKE $${params.length} OR location ILIKE $${params.length})`;
    }

    if (type && type.toLowerCase() !== "all") {
      params.push(type.toLowerCase());
      sql += ` AND LOWER(target_type) = $${params.length}`;
    }

    sql += ` ORDER BY id ASC`;
    const { rows } = await pool.query(sql, params);
    // Bổ sung các alias để frontend hiển thị dễ dàng
    const mapped = rows.map((r: any) => ({
      ...r,
      qr_type: r.target_type,
      location_label: r.location,
      dish_id: r.target_id,
    }));
    res.json(mapped);
  })
);

// 2. Thống kê dữ liệu QR
r.get(
  "/stats",
  ah(async (_req, res) => {
    const [totals, topQrs, byType] = await Promise.all([
      pool.query(`
        SELECT
          count(*)::int AS total_qrs,
          COALESCE(sum(scan_count), 0)::int AS total_scans,
          count(CASE WHEN is_active THEN 1 END)::int AS active_qrs
        FROM qr_codes
      `),
      pool.query(`
        SELECT id, code, title, target_type, location, scan_count, color
        FROM qr_codes
        ORDER BY scan_count DESC
        LIMIT 5
      `),
      pool.query(`
        SELECT target_type, count(*)::int AS count, sum(scan_count)::int AS scans
        FROM qr_codes
        GROUP BY target_type
        ORDER BY count DESC
      `),
    ]);

    const totalQrs = totals.rows[0]?.total_qrs || 0;
    const totalScans = totals.rows[0]?.total_scans || 0;
    const activeQrs = totals.rows[0]?.active_qrs || 0;
    const activeRate = totalQrs > 0 ? Math.round((activeQrs / totalQrs) * 100) : 0;
    const topScanned = topQrs.rows[0] || null;

    res.json({
      totals: totals.rows[0],
      top: topQrs.rows,
      by_type: byType.rows,
      total_qrcodes: totalQrs,
      total_scans: totalScans,
      active_qrcodes: activeQrs,
      active_rate: activeRate,
      top_scanned: topScanned,
    });
  })
);

// 3. Quét mã QR (Scan tracking endpoint)
// Khi du khách quét link: https://doancnpm-backend.onrender.com/api/qrcodes/scan/QR-DISH-18
// Server tự động tăng lượt quét scan_count và chuyển hướng (redirect) tới trang ứng dụng
r.get(
  "/scan/:code",
  ah(async (req, res) => {
    const code = String(req.params.code).trim();
    const result = await pool.query(
      `UPDATE qr_codes
       SET scan_count = scan_count + 1, last_scanned_at = now()
       WHERE code = $1 AND is_active = true
       RETURNING target_url`,
      [code]
    );

    if (result.rows.length === 0) {
      // Nếu mã bị khoá hoặc không tồn tại, chuyển về trang chủ app
      return res.redirect("https://doancnpm-beta.vercel.app");
    }

    const redirectUrl = result.rows[0].target_url;
    return res.redirect(redirectUrl);
  })
);

const qrSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(2),
  target_type: z.string().optional(),
  qr_type: z.string().optional(),
  target_id: z.number().nullable().optional(),
  dish_id: z.number().nullable().optional(),
  target_url: z.string().min(4),
  lang: z.string().default("vi"),
  color: z.string().default("#d4152f"),
  location: z.string().nullable().optional(),
  location_label: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

// 4. Thêm mã QR mới vào Data
r.post(
  "/",
  requireAdminAuth,
  ah(async (req, res) => {
    const b = qrSchema.parse(req.body);
    const targetType = b.target_type || b.qr_type || "dish";
    const targetId = b.target_id ?? b.dish_id ?? null;
    const loc = b.location || b.location_label || null;

    const check = await pool.query(`SELECT id FROM qr_codes WHERE LOWER(code) = LOWER($1)`, [b.code]);
    if (check.rows.length > 0) {
      return res.status(400).json({ ok: false, message: `Mã code '${b.code}' đã tồn tại!` });
    }

    const { rows } = await pool.query(
      `INSERT INTO qr_codes (code, title, target_type, target_id, target_url, lang, color, location, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [b.code, b.title, targetType, targetId, b.target_url, b.lang, b.color, loc, b.is_active]
    );

    res.status(201).json({ ok: true, data: rows[0], message: "Đã thêm mã QR thành công!" });
  })
);

// 5. Cập nhật mã QR
r.put(
  "/:id",
  requireAdminAuth,
  ah(async (req, res) => {
    const id = Number(req.params.id);
    const b = qrSchema.parse(req.body);
    const targetType = b.target_type || b.qr_type || "dish";
    const targetId = b.target_id ?? b.dish_id ?? null;
    const loc = b.location || b.location_label || null;

    const { rows } = await pool.query(
      `UPDATE qr_codes
       SET code = $1, title = $2, target_type = $3, target_id = $4,
           target_url = $5, lang = $6, color = $7, location = $8, is_active = $9
       WHERE id = $10
       RETURNING *`,
      [b.code, b.title, targetType, targetId, b.target_url, b.lang, b.color, loc, b.is_active, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Không tìm thấy mã QR để cập nhật" });
    }

    res.json({ ok: true, data: rows[0], message: "Cập nhật mã QR thành công!" });
  })
);

// 6. Bật / Tắt trạng thái mã QR
r.patch(
  "/:id/toggle",
  requireAdminAuth,
  ah(async (req, res) => {
    const id = Number(req.params.id);
    const explicitStatus = typeof req.body?.is_active === "boolean" ? req.body.is_active : null;
    const query = explicitStatus !== null
      ? `UPDATE qr_codes SET is_active = $1 WHERE id = $2 RETURNING *`
      : `UPDATE qr_codes SET is_active = NOT is_active WHERE id = $1 RETURNING *`;
    const params = explicitStatus !== null ? [explicitStatus, id] : [id];
    const { rows } = await pool.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Không tìm thấy mã QR" });
    }
    res.json({ ok: true, data: rows[0] });
  })
);

// 7. Xoá mã QR khỏi cơ sở dữ liệu
r.delete(
  "/:id",
  requireAdminAuth,
  ah(async (req, res) => {
    const id = Number(req.params.id);
    const { rowCount } = await pool.query(`DELETE FROM qr_codes WHERE id = $1`, [id]);
    if (!rowCount) {
      return res.status(404).json({ ok: false, message: "Không tìm thấy mã QR để xoá" });
    }
    res.json({ ok: true, message: "Đã xoá mã QR thành công!" });
  })
);

export default r;
