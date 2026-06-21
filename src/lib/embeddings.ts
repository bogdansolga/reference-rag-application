/**
 * Embedding utilities for the RAG pipeline.
 * Embeddings always run on Vertex AI (EU region) — they are unaffected by the
 * Claude generation backend, and Google first-party models need no API key (ADC).
 * Model, project and region all come from .env.local (see config.ts).
 */
import { createVertex } from "@ai-sdk/google-vertex";
import { embed } from "ai";
import { env } from "./config";

function embeddingModel() {
  const vertex = createVertex({
    project: env("ANTHROPIC_VERTEX_PROJECT_ID"),
    location: env("CLOUD_ML_REGION"),
  });
  return vertex.embeddingModel(env("EMBEDDING_MODEL"));
}

export async function embedQuery(query: string): Promise<number[]> {
  const { embedding } = await embed({ model: embeddingModel(), value: query });
  return embedding;
}

export async function embedDocument(content: string): Promise<number[]> {
  const { embedding } = await embed({ model: embeddingModel(), value: content });
  return embedding;
}
