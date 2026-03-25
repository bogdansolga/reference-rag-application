/**
 * Embedding utilities for RAG pipeline.
 * Uses OpenAI text-embedding-3-small (1536 dimensions) via Vercel AI SDK.
 */
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

export async function embedQuery(query: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: query,
  });
  return embedding;
}

export async function embedDocument(content: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: content,
  });
  return embedding;
}
