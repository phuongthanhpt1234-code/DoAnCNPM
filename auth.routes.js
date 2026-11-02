"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../../config/db");
const error_1 = require("../../middlewares/error");
const auth_1 = require("../../middlewares/auth");
const r = (0, express_1.Router)();
// 1. Đăng nhập
r.post("/login", (0, error_1.ah)(async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.status(400).json({
            ok: false,
            message: "Vui lòng nhập tên đăng nhập và mật khẩu",
        });
    }
    const cleanUser = String(username).trim();
    const cleanPass = String(password).trim();
    // 1.1 Kiểm tra trong database PostgreSQL
    try {
        const q = await db_1.pool.query(`SELECT id, username, password_hash, role, full_name FROM admin_users WHERE LOWER(username) = LOWER($1)`, [cleanUser]);
        if (q.rows.length > 0) {
            const u = q.rows[0];
            const isMatch = (0, auth_1.comparePassword)(cleanPass, u.password_hash);
            if (isMatch) {
                const token = (0, auth_1.generateAdminToken)(u.username, u.role);
                return res.json({
                    ok: true,
                    token,
                    user: {
                        id: u.id,
                        username: u.username,
                        role: u.role,
                        full_name: u.full_name || u.username,
                    },
                    message: "Đăng nhập quản trị viên thành công!",
                });
            }
        }
    }
    catch (err) {
        console.warn("[AUTH] DB query failed, using fallback env:", err.message);
    }
    return res.status(401).json({
        ok: false,
        message: "Tên đăng nhập hoặc mật khẩu không chính xác!",
    });
}));
// 2. Lấy thông tin tài khoản đang đăng nhập
r.get("/me", (0, error_1.ah)(async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : req.query.token;
    if (!token) {
        return res.status(401).json({ ok: false, message: "Chưa đăng nhập" });
    }
    const verified = (0, auth_1.verifyAdminToken)(token);
    if (!verified) {
        return res
            .status(401)
            .json({ ok: false, message: "Phiên đăng nhập hết hạn" });
    }
    return res.json({
        ok: true,
        user: {
            username: verified.username,
            role: verified.role,
        },
    });
}));
// 3. Danh sách tài khoản quản trị
r.get("/users", auth_1.requireAdminAuth, (0, error_1.ah)(async (_req, res) => {
    try {
        const q = await db_1.pool.query(`SELECT id, username, role, full_name, created_at FROM admin_users ORDER BY id ASC`);
        if (q.rows.length > 0) {
            return res.json({ ok: true, users: q.rows });
        }
    }
    catch (e) {
        console.warn("[AUTH] Cannot fetch users from DB:", e.message);
    }
    // Fallback: Nếu bảng trống hoặc DB offline, trả về tài khoản admin mặc định
    const defaultUser = process.env.ADMIN_USERNAME || "admin";
    return res.json({
        ok: true,
        users: [
            {
                id: 1,
                username: defaultUser,
                role: "super_admin",
                full_name: "Quản Trị Viên Hệ Thống",
                created_at: new Date().toISOString(),
            },
        ],
    });
}));
// 4. Thêm tài khoản quản trị mới
r.post("/users", auth_1.requireAdminAuth, (0, error_1.ah)(async (req, res) => {
    const { username, password, role, full_name } = req.body || {};
    const cleanUser = String(username || "").trim();
    const cleanPass = String(password || "").trim();
    const cleanRole = String(role || "admin").trim();
    const cleanFullName = String(full_name || cleanUser).trim();
    if (!cleanUser || cleanUser.length < 3) {
        return res.status(400).json({
            ok: false,
            message: "Tên đăng nhập phải có ít nhất 3 ký tự!",
        });
    }
    if (!cleanPass || cleanPass.length < 4) {
        return res.status(400).json({
            ok: false,
            message: "Mật khẩu phải có ít nhất 4 ký tự!",
        });
    }
    const passwordHash = (0, auth_1.hashPassword)(cleanPass);
    try {
        // Đảm bảo bảng tồn tại
        await db_1.pool.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'admin',
          full_name TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
        const checkEx = await db_1.pool.query(`SELECT id FROM admin_users WHERE LOWER(username) = LOWER($1)`, [cleanUser]);
        if (checkEx.rows.length > 0) {
            return res.status(400).json({
                ok: false,
                message: `Tài khoản '${cleanUser}' đã tồn tại trong hệ thống!`,
            });
        }
        const insertRes = await db_1.pool.query(`INSERT INTO admin_users (username, password_hash, role, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, role, full_name, created_at`, [cleanUser, passwordHash, cleanRole, cleanFullName]);
        return res.status(201).json({
            ok: true,
            user: insertRes.rows[0],
            message: `Đã thêm tài khoản '${cleanUser}' thành công!`,
        });
    }
    catch (err) {
        return res.status(500).json({
            ok: false,
            message: "Lỗi tạo tài khoản: " + err.message,
        });
    }
}));
// 5. Xoá tài khoản quản trị
r.delete("/users/:id", auth_1.requireAdminAuth, (0, error_1.ah)(async (req, res) => {
    const userId = Number(req.params.id);
    const currentUser = req.user;
    if (!userId) {
        return res
            .status(400)
            .json({ ok: false, message: "ID tài khoản không hợp lệ" });
    }
    try {
        const userRes = await db_1.pool.query(`SELECT id, username, role FROM admin_users WHERE id = $1`, [userId]);
        if (userRes.rows.length === 0) {
            return res
                .status(404)
                .json({ ok: false, message: "Không tìm thấy tài khoản để xoá" });
        }
        const targetUser = userRes.rows[0];
        // 1. BẢO VỆ TUYỆT ĐỐI: Không tài khoản nào được phép xoá Quản Trị Viên Cấp Cao (super_admin)
        if (targetUser.role === "super_admin") {
            return res.status(403).json({
                ok: false,
                message: "Tài khoản 'Quản Trị Viên Cấp Cao' là tài khoản hệ thống gốc, được bảo vệ cố định và không thể bị xoá!",
            });
        }
        // 2. Không thể tự xoá chính mình
        if (currentUser &&
            currentUser.username?.toLowerCase() === targetUser.username.toLowerCase()) {
            return res.status(400).json({
                ok: false,
                message: "Không thể tự xoá tài khoản bạn đang đăng nhập!",
            });
        }
        // 3. Tài khoản vai trò editor không được xoá tài khoản quản trị khác
        if (currentUser && currentUser.role === "editor") {
            return res.status(403).json({
                ok: false,
                message: "Tài khoản Biên Tập Viên không có quyền xoá tài khoản quản trị khác!",
            });
        }
        const targetUsername = targetUser.username;
        const totalCount = await db_1.pool.query(`SELECT count(*)::int as n FROM admin_users`);
        if ((totalCount.rows[0]?.n || 0) <= 1) {
            return res.status(400).json({
                ok: false,
                message: "Không thể xoá tài khoản cuối cùng. Hệ thống phải giữ ít nhất 1 quản trị viên!",
            });
        }
        await db_1.pool.query(`DELETE FROM admin_users WHERE id = $1`, [userId]);
        return res.json({
            ok: true,
            message: `Đã xoá tài khoản '${targetUsername}' thành công!`,
        });
    }
    catch (err) {
        return res.status(500).json({
            ok: false,
            message: "Lỗi xoá tài khoản: " + err.message,
        });
    }
}));
// 6. Đổi mật khẩu tài khoản hiện tại
r.post("/change-password", auth_1.requireAdminAuth, (0, error_1.ah)(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    const currentUser = req.user;
    const username = currentUser?.username || process.env.ADMIN_USERNAME || "admin";
    if (!currentPassword || !newPassword) {
        return res
            .status(400)
            .json({ ok: false, message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
    }
    if (String(newPassword).trim().length < 4) {
        return res
            .status(400)
            .json({ ok: false, message: "Mật khẩu mới phải có ít nhất 4 ký tự!" });
    }
    // Kiểm tra mật khẩu trong DB
    let isDbUpdated = false;
    try {
        const q = await db_1.pool.query(`SELECT id, password_hash FROM admin_users WHERE LOWER(username) = LOWER($1)`, [username]);
        if (q.rows.length > 0) {
            const u = q.rows[0];
            if (!(0, auth_1.comparePassword)(String(currentPassword).trim(), u.password_hash)) {
                return res.status(400).json({
                    ok: false,
                    message: "Mật khẩu hiện tại không chính xác!",
                });
            }
            const newHash = (0, auth_1.hashPassword)(String(newPassword).trim());
            await db_1.pool.query(`UPDATE admin_users SET password_hash = $1 WHERE id = $2`, [newHash, u.id]);
            isDbUpdated = true;
        }
    }
    catch (err) {
        console.warn("[AUTH] DB check for password change failed:", err.message);
    }
    // Nếu là admin mặc định và chưa update trong DB thì cập nhật fallback env
    if (!isDbUpdated) {
        if (!(0, auth_1.checkAdminCredentials)(username, String(currentPassword).trim())) {
            return res
                .status(400)
                .json({ ok: false, message: "Mật khẩu hiện tại không chính xác!" });
        }
        process.env.ADMIN_PASSWORD = String(newPassword).trim();
        try {
            const envPath = path_1.default.join(__dirname, "../../../.env");
            if (fs_1.default.existsSync(envPath)) {
                let envContent = fs_1.default.readFileSync(envPath, "utf8");
                if (envContent.includes("ADMIN_PASSWORD=")) {
                    envContent = envContent.replace(/ADMIN_PASSWORD=.*(?:\r?\n|$)/, `ADMIN_PASSWORD=${String(newPassword).trim()}\n`);
                }
                else {
                    envContent += `\nADMIN_PASSWORD=${String(newPassword).trim()}\n`;
                }
                fs_1.default.writeFileSync(envPath, envContent, "utf8");
            }
        }
        catch { }
    }
    return res.json({
        ok: true,
        message: "Đổi mật khẩu thành công!",
    });
}));
// 7. Đăng xuất
r.post("/logout", (0, error_1.ah)(async (_req, res) => {
    return res.json({ ok: true, message: "Đã đăng xuất" });
}));
exports.default = r;
