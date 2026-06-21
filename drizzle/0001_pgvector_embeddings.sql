-- pgvector: enable the extension and add the embedding column + ANN index.
-- Dimension 768 matches Vertex AI text-embedding-005 (see EMBEDDING_DIMENSIONS in .env.local).
CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
ALTER TABLE "chunks" ADD COLUMN IF NOT EXISTS "embedding" vector(768);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chunks_embedding" ON "chunks" USING hnsw ("embedding" vector_cosine_ops);
