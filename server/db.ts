import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

if (!connectionString || connectionString.includes('undefined')) {
  throw new Error("DATABASE_URL not properly configured");
}

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });
