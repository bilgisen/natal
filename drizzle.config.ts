import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

config({ path: '.env' });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    schema: "./db/schema.ts"
  },
  verbose: true,  // This is valid - for more detailed output
  strict: true,   // This is valid - for strict mode
});