/**
 * PDF Ingestion Pipeline for RAG Training Showcase
 *
 * Reads PDFs from /data directory, extracts text, chunks it,
 * generates embeddings, and stores everything in PostgreSQL.
 *
 * Usage: bun scripts/ingest.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";
import { envNum } from "../src/lib/config";
import { embedDocument } from "../src/lib/embeddings";

// --- Configuration (from .env.local — nothing hard-coded) ---
const CHUNK_SIZE = envNum("RAG_CHUNK_SIZE");
const CHUNK_OVERLAP = envNum("RAG_CHUNK_OVERLAP");
const EMBEDDING_BATCH_SIZE = envNum("RAG_EMBEDDING_BATCH_SIZE");
const DATA_DIR = join(process.cwd(), "data");

// --- Direct pool for script (not using the app's pool) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 3,
});

// --- Text chunking ---
function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}

// --- Batch embedding with rate limiting ---
async function embedBatch(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);
    const batchEmbeddings = await Promise.all(
      batch.map((text) => embedDocument(text)),
    );
    embeddings.push(...batchEmbeddings);

    if (i + EMBEDDING_BATCH_SIZE < texts.length) {
      console.log(`  Embedded ${embeddings.length}/${texts.length} chunks...`);
      await new Promise((r) => setTimeout(r, 500)); // rate limit pause
    }
  }

  return embeddings;
}

// --- Main ingestion pipeline ---
async function ingest() {
  console.log("=== RAG Ingestion Pipeline ===\n");

  // 1. Find PDFs
  const files = readdirSync(DATA_DIR).filter((f) => f.toLowerCase().endsWith(".pdf"));
  console.log(`Found ${files.length} PDF files in ${DATA_DIR}\n`);

  if (files.length === 0) {
    console.log("No PDF files found. Copy PDFs to the data/ directory and try again.");
    process.exit(1);
  }

  let totalChunks = 0;
  let totalEmbeddings = 0;

  // pdf-parse v2: PDFParse class (new PDFParse({ data }).getText())
  const { PDFParse } = await import("pdf-parse");

  for (const filename of files) {
    console.log(`Processing: ${filename}`);

    // 2. Extract text from PDF
    const pdfBuffer = readFileSync(join(DATA_DIR, filename));
    const parser = new PDFParse({ data: pdfBuffer });
    const text = (await parser.getText()).text;
    console.log(`  Extracted ${text.length} characters`);

    // 3. Insert document metadata
    const docResult = await pool.query(
      "INSERT INTO documents (filename, title) VALUES ($1, $2) RETURNING id",
      [filename, filename.replace(/\.pdf$/i, "")],
    );
    const documentId = docResult.rows[0].id;

    // 4. Chunk text
    const chunks = chunkText(text);
    console.log(`  Split into ${chunks.length} chunks`);

    // 5. Generate embeddings
    console.log(`  Generating embeddings...`);
    const embeddings = await embedBatch(chunks);

    // 6. Insert chunks with embeddings
    for (let i = 0; i < chunks.length; i++) {
      const vectorStr = `[${embeddings[i].join(",")}]`;
      await pool.query(
        `INSERT INTO chunks (document_id, content, chunk_index, embedding, metadata)
         VALUES ($1, $2, $3, $4::vector, $5)`,
        [documentId, chunks[i], i, vectorStr, JSON.stringify({ filename })],
      );
    }

    totalChunks += chunks.length;
    totalEmbeddings += embeddings.length;
    console.log(`  Done: ${chunks.length} chunks stored\n`);
  }

  console.log("=== Ingestion Complete ===");
  console.log(`Documents: ${files.length}`);
  console.log(`Chunks: ${totalChunks}`);
  console.log(`Embeddings: ${totalEmbeddings}`);

  await pool.end();
}

ingest().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
