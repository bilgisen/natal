// lib/server-db.ts
// This file is for server-side database access only
// It should never be imported in client components

import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';

// This will be replaced with actual implementation in server context
let _db: null | ReturnType<typeof drizzle> = null;

export function getDb() {
  // In server context, initialize and return the database
  if (typeof process !== 'undefined' && process.env?.DATABASE_URL) {
    if (!_db) {
      _db = drizzle(process.env.DATABASE_URL, {
        schema, // Use the imported schema directly
        logger: process.env.NODE_ENV === 'development',
      });
    }
    return _db;
  }

  // In client context, this should never be called
  throw new Error('Database access is only available on the server side');
}

// Export the database instance type with schema
export type Database = NonNullable<ReturnType<typeof drizzle<typeof schema>>>;

// For backward compatibility, but prefer using getDb() in new code
// This creates a properly typed instance on the server side only
export const db = (typeof process !== 'undefined' && process.env?.DATABASE_URL)
  ? drizzle(process.env.DATABASE_URL, {
      schema,
      logger: process.env.NODE_ENV === 'development',
    })
  : null;

// Export the schema for type inference
export { schema };

// This ensures the file is treated as a module
export {};
