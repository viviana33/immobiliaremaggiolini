import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Parse DATABASE_URL to extract connection parameters
// Remove any quotes that might be around the URL
const cleanDatabaseUrl = process.env.DATABASE_URL.replace(/^['"]|['"]$/g, '');
const connectionUrl = new URL(cleanDatabaseUrl);

const pool = new Pool({ 
  host: connectionUrl.hostname,
  port: parseInt(connectionUrl.port || '5432'),
  database: connectionUrl.pathname.slice(1), // Remove leading slash
  user: connectionUrl.username,
  password: connectionUrl.password,
  // Neon requires SSL in both development and production
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
