import fs from 'fs';
import path from 'path';
import { pool } from './config/db';

async function main() {
  const dir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    await pool.query(fs.readFileSync(path.join(dir, f), 'utf8'));
    console.log('✔', f);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
