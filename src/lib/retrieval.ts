/**
 * Vector similarity search for RAG pipeline.
 * Uses pgvector cosine distance for nearest neighbor search.
 */
import { pool } from "@/lib/db";

export interface RetrievalResult {
  content: string;
  documentId: number;
  chunkIndex: number;
  similarity: number;
  metadata: Record<string, unknown> | null;
  filename: string;
}

export async function searchSimilar(
  embedding: number[],
  limit: number,
): Promise<RetrievalResult[]> {
  const vectorStr = `[${embedding.join(",")}]`;

  const result = await pool.query(
    `SELECT c.content, c.document_id, c.chunk_index, c.metadata,
            d.filename,
            1 - (c.embedding <=> $1::vector) AS similarity
     FROM chunks c
     JOIN documents d ON d.id = c.document_id
     WHERE c.embedding IS NOT NULL
     ORDER BY c.embedding <=> $1::vector
     LIMIT $2`,
    [vectorStr, limit],
  );

  return result.rows.map((row) => ({
    content: row.content,
    documentId: row.document_id,
    chunkIndex: row.chunk_index,
    similarity: parseFloat(row.similarity),
    metadata: row.metadata,
    filename: row.filename,
  }));
}

/**
 * Format retrieval results into context string for LLM prompt.
 */
export function formatContext(results: RetrievalResult[]): string {
  return results
    .map(
      (r, i) =>
        `[Source ${i + 1}: ${r.filename}, chunk ${r.chunkIndex} (similarity: ${r.similarity.toFixed(2)})]:\n${r.content}`,
    )
    .join("\n\n");
}
