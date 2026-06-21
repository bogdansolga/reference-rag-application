/**
 * Apply the pgvector setup (extension + embedding column + ANN index) via the pg driver.
 *
 * Reads the committed DDL from drizzle/0001_pgvector_embeddings.sql — single source of
 * truth — and runs it over DATABASE_URL. Works against a containerised Postgres with no
 * local psql client. Run after `bun run db:migrate` (which creates the base tables):
 *
 *   bun scripts/setup-pgvector.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

const ddlPath = join(process.cwd(), "drizzle", "0001_pgvector_embeddings.sql");
const statements = readFileSync(ddlPath, "utf8")
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

for (const stmt of statements) {
  await pool.query(stmt);
  const firstLine = stmt.split("\n").find((l) => l && !l.startsWith("--")) ?? stmt;
  console.log("applied:", firstLine.slice(0, 70));
}

await pool.end();
console.log("pgvector ready");
