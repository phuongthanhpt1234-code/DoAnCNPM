import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db";

const SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "hoian-food-admin-secret-key-2026";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString("hex");
  return `${salt}:${hash}`;
}

export function comparePassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
}

export async function ensureDefaultAdminUser() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        full_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Đảm bảo bảng favorites hỗ trợ device_id không cần đăng nhập
      ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_pkey;
      ALTER TABLE favorites ADD COLUMN IF NOT EXISTS device_id VARCHAR(100);
      ALTER TABLE favorites ALTER COLUMN user_id DROP NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_device_dish ON favorites (device_id, dish_id);
    `);

    const defaultUser = process.env.ADMIN_USERNAME || "admin";
    const defaultPass = process.env.ADMIN_PASSWORD || "admin123";

    const countRes = await pool.query(
      `SELECT count(*)::int as n FROM admin_users`
    );
    if ((countRes.rows[0]?.n || 0) === 0) {
      const hashed = hashPassword(defaultPass);
      await pool.query(
        `INSERT INTO admin_users (username, password_hash, role, full_name) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING`,
        [defaultUser, hashed, "super_admin", "Quản Trị Viên Mặc Định"]
      );
      console.log(`[AUTH] Khởi tạo tài khoản quản trị mặc định: ${defaultUser}`);
    }
  } catch (err: any) {
    console.warn("[AUTH] Bỏ qua khởi tạo DB user:", err.message);
  }
}

export function generateAdminToken(username: string, role = "admin"): string {
  const payload = {
    username,
    role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 ngày
  };
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(b64Payload)
    .digest("base64url");
  return `${b64Payload}.${signature}`;
}

export function verifyAdminToken(
  token: string
): { username: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [b64Payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(b64Payload)
      .digest("base64url");

    if (
      signature.length !== expectedSig.length ||
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSig)
      )
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(b64Payload, "base64url").toString("utf8")
    );
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : (req.query.token as string);

  if (!token) {
    return res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Yêu cầu đăng nhập tài khoản quản trị viên (Admin)",
    });
  }

  const verified = verifyAdminToken(token);
  if (!verified) {
    return res.status(401).json({
      code: "INVALID_TOKEN",
      message:
        "Phiên đăng nhập quản trị đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
    });
  }

  (req as any).user = verified;
  next();
}

export function checkAdminCredentials(u: string, p: string): boolean {
  const currentAdminUser = process.env.ADMIN_USERNAME || "admin";
  const currentAdminPass = process.env.ADMIN_PASSWORD || "admin123";
  return u === currentAdminUser && p === currentAdminPass;
}
