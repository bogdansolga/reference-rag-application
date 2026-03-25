import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Survive Next.js HMR in dev — reuse pool across hot reloads
const globalForDb = globalThis as unknown as {
  __dbPool?: Pool;
  __db?: NodePgDatabase<typeof schema>;
};

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: false,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

if (!globalForDb.__dbPool) {
  globalForDb.__dbPool = createPool();
}
export const pool = globalForDb.__dbPool;

if (!globalForDb.__db) {
  globalForDb.__db = drizzle(pool, { schema });
}
export const db: NodePgDatabase<typeof schema> = globalForDb.__db;
