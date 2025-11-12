import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

// Check if DATABASE_URL is a valid connection string (starts with postgres:// or postgresql://)
const isValidDatabaseUrl = process.env.DATABASE_URL && 
  (process.env.DATABASE_URL.startsWith('postgresql://') || process.env.DATABASE_URL.startsWith('postgres://'));

const connectionString = isValidDatabaseUrl 
  ? process.env.DATABASE_URL
  : `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

if (!connectionString || connectionString.includes('undefined')) {
  throw new Error("DATABASE_URL not properly configured");
}

const pool = new Pool({ 
  connectionString
});

export const db = drizzle(pool, { schema });
