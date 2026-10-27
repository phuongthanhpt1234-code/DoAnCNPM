import fs from 'fs';
import path from 'path';
import { pool } from './config/db';

export async function runMigrations() {
  // Tìm thư mục migrations ở cả dev (src/../migrations) và dist (dist/../migrations)
  let dir = path.join(__dirname, '..', 'migrations');
  if (!fs.existsSync(dir)) {
    dir = path.join(process.cwd(), 'migrations');
  }

  if (!fs.existsSync(dir)) {
    console.warn('⚠️ Không tìm thấy thư mục migrations:', dir);
    return;
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    await pool.query(sql);
    console.log('✔ Migrated:', f);
  }
}

async function main() {
  await runMigrations();
  await pool.end();
}

if (require.main === module) {
  main().catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  });
}
