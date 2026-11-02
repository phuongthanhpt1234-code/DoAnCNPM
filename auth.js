"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.ensureDefaultAdminUser = ensureDefaultAdminUser;
exports.generateAdminToken = generateAdminToken;
exports.verifyAdminToken = verifyAdminToken;
exports.requireAdminAuth = requireAdminAuth;
exports.checkAdminCredentials = checkAdminCredentials;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../config/db");
const SECRET = process.env.ADMIN_JWT_SECRET ||
    process.env.JWT_SECRET ||
    "hoian-food-admin-secret-key-2026";
function hashPassword(password) {
    const salt = crypto_1.default.randomBytes(16).toString("hex");
    const hash = crypto_1.default
        .pbkdf2Sync(password, salt, 1000, 64, "sha256")
        .toString("hex");
    return `${salt}:${hash}`;
}
function comparePassword(password, stored) {
    const parts = stored.split(":");
    if (parts.length !== 2)
        return false;
    const [salt, hash] = parts;
    const verifyHash = crypto_1.default
        .pbkdf2Sync(password, salt, 1000, 64, "sha256")
        .toString("hex");
    return crypto_1.default.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
}
async function ensureDefaultAdminUser() {
    try {
        await db_1.pool.query(`
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
        const countRes = await db_1.pool.query(`SELECT count(*)::int as n FROM admin_users`);
        if ((countRes.rows[0]?.n || 0) === 0) {
            const hashed = hashPassword(defaultPass);
            await db_1.pool.query(`INSERT INTO admin_users (username, password_hash, role, full_name) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING`, [defaultUser, hashed, "super_admin", "Quản Trị Viên Mặc Định"]);
            console.log(`[AUTH] Khởi tạo tài khoản quản trị mặc định: ${defaultUser}`);
        }
    }
    catch (err) {
        console.warn("[AUTH] Bỏ qua khởi tạo DB user:", err.message);
    }
}
function generateAdminToken(username, role = "admin") {
    const payload = {
        username,
        role,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 ngày
    };
    const b64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto_1.default
        .createHmac("sha256", SECRET)
        .update(b64Payload)
        .digest("base64url");
    return `${b64Payload}.${signature}`;
}
function verifyAdminToken(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 2)
            return null;
        const [b64Payload, signature] = parts;
        const expectedSig = crypto_1.default
            .createHmac("sha256", SECRET)
            .update(b64Payload)
            .digest("base64url");
        if (signature.length !== expectedSig.length ||
            !crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
            return null;
        }
        const payload = JSON.parse(Buffer.from(b64Payload, "base64url").toString("utf8"));
        if (payload.exp && Date.now() > payload.exp) {
            return null;
        }
        return payload;
    }
    catch {
        return null;
    }
}
function requireAdminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : req.query.token;
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
            message: "Phiên đăng nhập quản trị đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
        });
    }
    req.user = verified;
    next();
}
function checkAdminCredentials(u, p) {
    const currentAdminUser = process.env.ADMIN_USERNAME || "admin";
    const currentAdminPass = process.env.ADMIN_PASSWORD || "admin123";
    return u === currentAdminUser && p === currentAdminPass;
}
