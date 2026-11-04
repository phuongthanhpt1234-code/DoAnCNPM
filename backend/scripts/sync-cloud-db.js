const { Client } = require('pg');

async function syncCloudDb() {
  try {
    const cloudUrl = process.env.CLOUD_API_URL || 'https://doancnpm-backend.onrender.com';
    const r = await fetch(`${cloudUrl}/api/dishes`);
    const dishes = await r.json();
    console.log(`[SYNC] Tải thành công ${dishes.length} món ăn từ Cloud (${cloudUrl})`);

    const localUrl = process.env.DATABASE_URL || 'postgres://postgres:123456@localhost:5432/hoian_food';
    const client = new Client({ connectionString: localUrl });
    await client.connect();

    const catRes = await client.query('SELECT id, slug FROM categories');
    const catMap = {};
    catRes.rows.forEach((row) => (catMap[row.slug] = row.id));

    const renderIds = dishes.map((d) => d.id);
    if (renderIds.length > 0) {
      await client.query(`DELETE FROM dishes WHERE id NOT IN (${renderIds.join(',')})`);
    }

    for (const d of dishes) {
      const catId = catMap[d.category_slug] || 4;
      await client.query(
        `INSERT INTO dishes (id, category_id, name, description, address, price_vnd, image_url, emoji, rating, lat, lng, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
         ON CONFLICT (id) DO UPDATE SET
           category_id = EXCLUDED.category_id,
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           address = EXCLUDED.address,
           price_vnd = EXCLUDED.price_vnd,
           image_url = EXCLUDED.image_url,
           emoji = EXCLUDED.emoji,
           rating = EXCLUDED.rating,
           lat = EXCLUDED.lat,
           lng = EXCLUDED.lng,
           is_active = true`,
        [d.id, catId, d.name, d.description, d.address || 'Hội An', d.price_vnd || null, d.image_url, d.emoji || '🍜', d.rating || 4.8, d.lat || 15.877, d.lng || 108.327]
      );

      if (d.translations) {
        for (const [lang, t] of Object.entries(d.translations)) {
          if (t && t.name) {
            await client.query(
              `INSERT INTO dish_translations (dish_id, lang, name, description)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (dish_id, lang) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
              [d.id, lang, t.name, t.description || '']
            );
          }
        }
      }
    }

    await client.query(`SELECT setval(pg_get_serial_sequence('dishes', 'id'), COALESCE((SELECT MAX(id) FROM dishes), 1))`);
    const count = await client.query('SELECT count(*)::int as n FROM dishes');
    console.log(`[SYNC] ✅ Đã đồng bộ thành công vào PostgreSQL Local! Hiện có: ${count.rows[0].n} món.`);
    await client.end();
  } catch (err) {
    console.error('[SYNC] Lỗi đồng bộ:', err.message);
  }
}

if (require.main === module) {
  syncCloudDb();
}

module.exports = { syncCloudDb };
