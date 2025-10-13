// db/drizzle.ts
// This file is a re-export for backward compatibility
// Prefer importing directly from '@/lib/server-db' in new code

// This will throw if used on the client side
export { db, type Database } from '../lib/server-db';
