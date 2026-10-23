CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS dishes (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  price_vnd INT CHECK (price_vnd >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dish_translations (
  id SERIAL PRIMARY KEY,
  dish_id INT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  lang VARCHAR(5) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  UNIQUE (dish_id, lang)
);

-- Chưa làm đăng nhập: định danh thiết bị bằng device_id do app tự sinh
CREATE TABLE IF NOT EXISTS favorites (
  device_id TEXT NOT NULL,
  dish_id INT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, dish_id)
);

CREATE TABLE IF NOT EXISTS check_ins (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  dish_id INT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkins_created ON check_ins (created_at);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes (category_id);
