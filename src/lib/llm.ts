/**
 * Backend-agnostic Claude generation model.
 *
 * The app is provider-agnostic for Claude: the SAME code reaches the SAME model
 * through either backend, chosen entirely by CHAT_BACKEND in .env.local:
 *
 *   CHAT_BACKEND=direct  -> Claude via the Anthropic API (ANTHROPIC_API_KEY)
 *                           — works without Vertex quota; used now.
 *   CHAT_BACKEND=vertex  -> Claude on Vertex AI (EU region, ADC, no API key)
 *                           — the deployment for regulated data; flip to it once
 *                             the GCP project has partner-model quota.
 *
 * One env var flips the whole app between them. No values are hard-coded here.
 */
import { anthropic } from "@ai-sdk/anthropic";
import { createVertexAnthropic } from "@ai-sdk/google-vertex/anthropic";
import { env } from "./config";

export function chatBackend(): "direct" | "vertex" {
  const backend = env("CHAT_BACKEND").toLowerCase();
  if (backend !== "direct" && backend !== "vertex") {
    throw new Error('CHAT_BACKEND must be "direct" or "vertex"');
  }
  return backend;
}

export function chatModel() {
  const model = env("CHAT_MODEL");
  if (chatBackend() === "vertex") {
    const vertexAnthropic = createVertexAnthropic({
      project: env("ANTHROPIC_VERTEX_PROJECT_ID"),
      location: env("CLOUD_ML_REGION"),
    });
    return vertexAnthropic(model);
  }
  return anthropic(model);
}
