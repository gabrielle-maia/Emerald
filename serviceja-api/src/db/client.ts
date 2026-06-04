import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import dotenv from 'dotenv';
dotenv.config();

const dbPath = process.env.DATABASE_URL || './serviceja.db';
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema, logger: process.env.NODE_ENV === 'development' });
export default db;
