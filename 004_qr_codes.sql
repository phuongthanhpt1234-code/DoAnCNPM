CREATE TABLE IF NOT EXISTS qr_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  target_type VARCHAR(50) NOT NULL DEFAULT 'dish',
  target_id INTEGER,
  target_url TEXT NOT NULL,
  lang VARCHAR(10) NOT NULL DEFAULT 'vi',
  color VARCHAR(20) NOT NULL DEFAULT '#d4152f',
  location VARCHAR(150),
  scan_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_scanned_at TIMESTAMPTZ
);