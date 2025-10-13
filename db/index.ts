// db/index.ts
// Export all schema and relations for database operations

// Export all schema types and tables
export * from "./schema";

// Export all relations
export * from "./relations";

// Export a combined schema object that includes both tables and relations
import * as schema from "./schema";
import * as relations from "./relations";

export const dbSchema = {
  ...schema,
  ...relations,
};

export type DatabaseSchema = typeof dbSchema;
