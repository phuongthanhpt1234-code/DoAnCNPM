import 'dotenv/config';
import { Pool, PoolConfig } from 'pg';

const connectionString = process.env.DATABASE_URL;

const isRemoteDb =
  connectionString?.includes('neon.tech') ||
  connectionString?.includes('render.com') ||
  process.env.NODE_ENV === 'production';

const config: PoolConfig = {
  connectionString,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
};

export const pool = new Pool(config);
