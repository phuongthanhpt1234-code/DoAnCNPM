import "dotenv/config";
import app from "./app";
import { pool } from "./config/db";
import { runMigrations } from "./migrate";
import { ensureDefaultAdminUser } from "./middlewares/auth";
import { ensureQrCodesTable } from "./modules/qrcodes/qrcodes.routes";
import { seedDishesIfEmpty } from "./modules/dishes/dishes.routes";

const port = Number(process.env.PORT) || 4000;

async function bootstrap() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Thiếu DATABASE_URL trong backend/.env");
  }

  const database = await pool.query(
    "SELECT current_database() AS db, current_schema() AS schema"
  );

  console.log("Database đang kết nối:", database.rows[0]);

  console.log("1. Đang chạy migration...");
  await runMigrations();

  console.log("2. Đang kiểm tra/tạo tài khoản admin...");
  await ensureDefaultAdminUser();

  const accounts = await pool.query(
    "SELECT id, username, role FROM admin_users ORDER BY id"
  );

  console.log("Tài khoản admin trong database:");
  console.table(accounts.rows);

  if (accounts.rows.length === 0) {
    throw new Error(
      "Bảng admin_users vẫn rỗng sau khi chạy ensureDefaultAdminUser()."
    );
  }

  console.log("3. Đang kiểm tra dữ liệu món ăn...");
  await seedDishesIfEmpty();

  console.log("4. Đang kiểm tra bảng QR...");
  await ensureQrCodesTable();

  console.log("Cơ sở dữ liệu đã sẵn sàng.");

  app.listen(port, () => {
    console.log(`API chạy tại http://localhost:${port}`);
  });
}

bootstrap().catch(async (error) => {
  console.error("Không thể khởi động backend:", error);
  await pool.end().catch(() => {});
  process.exit(1);
});