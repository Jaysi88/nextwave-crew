import { neon } from '@neondatabase/serverless';

export function db() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured. Add your Neon connection string.');
  }
  return neon(databaseUrl);
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}
