"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const migrate_1 = require("./migrate");
const auth_1 = require("./middlewares/auth");
const qrcodes_routes_1 = require("./modules/qrcodes/qrcodes.routes");
const dishes_routes_1 = require("./modules/dishes/dishes.routes");
const port = Number(process.env.PORT) || 4000;
async function bootstrap() {
    // Tự động kiểm tra và chạy migration/seed nếu có database kết nối (Render, Neon, Local)
    if (process.env.DATABASE_URL) {
        try {
            console.log('🔄 Đang đồng bộ cấu trúc cơ sở dữ liệu (Neon / Postgres)...');
            await (0, migrate_1.runMigrations)();
            await (0, auth_1.ensureDefaultAdminUser)();
            await (0, dishes_routes_1.seedDishesIfEmpty)();
            await (0, qrcodes_routes_1.ensureQrCodesTable)();
            console.log('✅ Cơ sở dữ liệu đã sẵn sàng!');
        }
        catch (err) {
            console.error('⚠️ Không thể tự chạy migration khi khởi động:', err);
        }
    }
    app_1.default.listen(port, () => console.log(`API chạy tại port ${port}`));
}
bootstrap();
