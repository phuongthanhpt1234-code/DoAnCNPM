import 'dotenv/config';
import app from './app';
import { runMigrations } from './migrate';
import { ensureDefaultAdminUser } from './middlewares/auth';
import { ensureQrCodesTable } from './modules/qrcodes/qrcodes.routes';
import { syncDishTranslations } from './modules/dishes/dishes.routes';

const port = Number(process.env.PORT) || 4000;

async function bootstrap() {
  // Tự động kiểm tra và chạy migration/seed nếu có database kết nối (Render, Neon, Local)
  if (process.env.DATABASE_URL) {
    try {
      console.log('🔄 Đang đồng bộ cấu trúc cơ sở dữ liệu (Neon / Postgres)...');
      await runMigrations();
      await ensureDefaultAdminUser();
      await ensureQrCodesTable();
      console.log('✅ Cơ sở dữ liệu đã sẵn sàng!');
      await syncDishTranslations();
    } catch (err) {
      console.error('⚠️ Không thể tự chạy migration khi khởi động:', err);
    }
  }

  app.listen(port, () => console.log(`API chạy tại port ${port}`));
}

bootstrap();
