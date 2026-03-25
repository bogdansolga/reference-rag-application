-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column for embeddings (1536 dimensions = text-embedding-3-small)
ALTER TABLE chunks
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create HNSW index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON chunks
  USING hnsw (embedding vector_cosine_ops);
