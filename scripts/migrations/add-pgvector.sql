-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column for embeddings. Dimension must match the embedding model:
-- 768 for Vertex text-embedding-005. The live setup is applied by scripts/add-pgvector.sh,
-- which reads EMBEDDING_DIMENSIONS from .env.local — this file is reference only.
ALTER TABLE chunks
  ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create HNSW index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON chunks
  USING hnsw (embedding vector_cosine_ops);
