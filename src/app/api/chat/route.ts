import { convertToModelMessages, streamText } from "ai";
import { envNum } from "@/lib/config";
import { embedQuery } from "@/lib/embeddings";
import { chatModel } from "@/lib/llm";
import { formatContext, searchSimilar } from "@/lib/retrieval";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get the latest user message text for embedding
  const lastUserMessage = [...messages]
    .reverse()
    .find((m: { role: string }) => m.role === "user");
  if (!lastUserMessage) {
    return new Response("No user message found", { status: 400 });
  }

  // Extract text from message (AI SDK v6 uses parts array, fallback to content for compatibility)
  const userText =
    lastUserMessage.content ??
    lastUserMessage.parts
      ?.filter((p: { type: string }) => p.type === "text")
      .map((p: { text: string }) => p.text)
      .join("") ??
    "";

  if (!userText) {
    return new Response("Empty user message", { status: 400 });
  }

  // 1. Embed the user's query
  const queryEmbedding = await embedQuery(userText);

  // 2. Search for similar chunks (top-k from .env.local)
  const results = await searchSimilar(queryEmbedding, envNum("RAG_TOP_K"));

  // 3. Build system prompt with retrieved context
  const context = formatContext(results);
  const systemPrompt = `You are a helpful AI assistant for a training course on AI, Machine Learning, and RAG (Retrieval Augmented Generation).

Answer questions based on the following context from the training materials. If the context doesn't contain relevant information, say so honestly rather than making up an answer.

${context ? `## Retrieved Context\n\n${context}` : "No relevant context found in the training materials."}`;

  // 4. Prepare source citations header
  const sources = results.map((r) => ({
    filename: r.filename,
    chunkIndex: r.chunkIndex,
    similarity: parseFloat(r.similarity.toFixed(2)),
  }));

  // 5. Stream LLM response
  const result = streamText({
    model: chatModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "X-Sources": JSON.stringify(sources),
    },
  });
}
