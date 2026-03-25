import { embedQuery } from "@/lib/embeddings";
import { searchSimilar } from "@/lib/retrieval";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return Response.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  const queryEmbedding = await embedQuery(query);
  const results = await searchSimilar(queryEmbedding, 5);

  return Response.json({ query, results });
}
