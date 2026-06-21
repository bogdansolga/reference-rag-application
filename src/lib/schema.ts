import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chunks = pgTable("chunks", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  // embedding vector(EMBEDDING_DIMENSIONS) is added via scripts/add-pgvector.sh (dimension from
  // .env.local; e.g. 768 for Vertex text-embedding-005). pgvector not natively supported by Drizzle.
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
});
