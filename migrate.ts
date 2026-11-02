import "dotenv/config";
import fs from "fs";
import path from "path";
import { pool } from "./config/db";

export async function runMigrations() {
  let dir = path.join(__dirname, "..", "migrations");

  if (!fs.existsSync(dir)) {
    dir = path.join(process.cwd(), "migrations");
  }

  if (!fs.existsSync(dir)) {
    throw new Error(`Không tìm thấy thư mục migrations: ${dir}`);
  }

  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const client = await pool.connect();
  const completed: string[] = [];

  try {
    await client.query("BEGIN");

    // Tránh hai tiến trình chạy migration cùng lúc.
    await client.query("SELECT pg_advisory_xact_lock(741302)");

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const result = await client.query<{ name: string }>(
      "SELECT name FROM schema_migrations"
    );

    const applied = new Set(result.rows.map((row) => row.name));

    for (const file of files) {
      if (applied.has(file)) {
        continue;
      }

      const sql = fs.readFileSync(path.join(dir, file), "utf8");

      await client.query(sql);

      await client.query(
        "INSERT INTO schema_migrations (name) VALUES ($1)",
        [file]
      );

      completed.push(file);
    }

    await client.query("COMMIT");

    if (completed.length === 0) {
      console.log("✓ Database đã cập nhật, không có migration mới.");
    } else {
      completed.forEach((file) => {
        console.log("✓ Đã chạy migration:", file);
      });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigrations()
    .catch((error) => {
      console.error("Migration thất bại:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}