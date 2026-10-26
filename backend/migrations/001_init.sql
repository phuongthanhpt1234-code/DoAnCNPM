CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  translations JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS dishes (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  price_vnd INT CHECK (price_vnd >= 0),
  image_url TEXT,
  emoji TEXT NOT NULL DEFAULT '🍜',
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.8,
  lat DOUBLE PRECISION NOT NULL DEFAULT 15.877,
  lng DOUBLE PRECISION NOT NULL DEFAULT 108.327,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS price_vnd INT CHECK (price_vnd >= 0),
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS emoji TEXT NOT NULL DEFAULT '🍜',
  ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) NOT NULL DEFAULT 4.8,
  ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION NOT NULL DEFAULT 15.877,
  ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION NOT NULL DEFAULT 108.327,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'dish_translations'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'dish_translations' AND column_name = 'lang'
  ) THEN
    DROP TABLE dish_translations CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS dish_translations (
  id SERIAL PRIMARY KEY,
  dish_id INT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  lang VARCHAR(5) NOT NULL CHECK (lang IN ('vi', 'en', 'zh', 'ko', 'ja')),
  name TEXT NOT NULL,
  description TEXT,
  UNIQUE (dish_id, lang)
);

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
CREATE INDEX IF NOT EXISTS idx_dish_translations_dish_lang ON dish_translations (dish_id, lang);
