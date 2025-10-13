// lib/server-db.ts
// This file is for server-side database access only
// It should never be imported in client components

import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema'; // Import your schema tables

// Initialize the database instance directly for Next.js server components
const db = drizzle(process.env.DATABASE_URL!, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// For dynamic initialization if needed
let _db: typeof db | null = null;

export function getDb() {
  // In server context, initialize and return the database
  if (typeof process !== 'undefined' && process.env?.DATABASE_URL) {
    if (!_db) {
      _db = drizzle(process.env.DATABASE_URL, {
        schema,
        logger: process.env.NODE_ENV === 'development',
      });
    }
    return _db;
  }

  // In client context, this should never be called
  throw new Error('Database access is only available on the server side');
}

// Export the database instance type with schema
export type Database = typeof db;

// Export the properly typed database instance
export { db };

// This ensures the file is treated as a module
export {};
