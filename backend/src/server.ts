import 'dotenv/config';
import app from './app';
import { runMigrations } from './migrate';
import { ensureDefaultAdminUser } from './middlewares/auth';
import { ensureQrCodesTable } from './modules/qrcodes/qrcodes.routes';
import { syncDishTranslations, ensureAllDishesSynced } from './modules/dishes/dishes.routes';

const port = Number(process.env.PORT) || 4000;

async function bootstrap() {
  if (process.env.DATABASE_URL) {
    try {
      console.log('Đang đồng bộ cơ sở dữ liệu...');
      await runMigrations();
      await ensureDefaultAdminUser();
      await ensureQrCodesTable();
      await ensureAllDishesSynced();
      console.log('Cơ sở dữ liệu đã sẵn sàng.');
      await syncDishTranslations();
    } catch (err) {
      console.error('Lỗi chạy migration khi khởi động:', err);
    }
  }
  app.listen(port, () => console.log(`API chạy tại port ${port}`));
}
bootstrap();
