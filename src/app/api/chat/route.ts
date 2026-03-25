import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";
import { embedQuery } from "@/lib/embeddings";
import { formatContext, searchSimilar } from "@/lib/retrieval";

const chatModel = process.env.CHAT_MODEL || "gpt-5.4-nano";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get the latest user message for embedding
  const lastUserMessage = [...messages]
    .reverse()
    .find((m: { role: string }) => m.role === "user");
  if (!lastUserMessage) {
    return new Response("No user message found", { status: 400 });
  }

  // 1. Embed the user's query
  const queryEmbedding = await embedQuery(lastUserMessage.content);

  // 2. Search for similar chunks
  const results = await searchSimilar(queryEmbedding, 5);

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
    model: openai(chatModel),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "X-Sources": JSON.stringify(sources),
    },
  });
}
