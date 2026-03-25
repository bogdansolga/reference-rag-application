# Claude Code Context

This file provides context for Claude Code when working on this project.

## What This Is

A minimal RAG (Retrieval Augmented Generation) training showcase. Educational app — clarity over production features.

## Tech Stack

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**
- **Vercel AI SDK v6** (`ai@^6`, `@ai-sdk/openai@^3`, `@ai-sdk/react@^3`)
- **Drizzle ORM** + **PostgreSQL** + **pgvector**
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **Bun** runtime

## Project Structure

```
src/app/page.tsx              → Chat page (renders <Chat />)
src/app/overview/page.tsx     → RAG architecture visual overview
src/app/layout.tsx            → Root layout (light theme)
src/app/globals.css           → Tailwind v4 + CSS vars + prose styles
src/app/api/chat/route.ts     → POST: embed query → vector search → stream LLM response
src/app/api/search/route.ts   → GET ?q=: direct vector search, returns chunks + scores
src/lib/db.ts                 → Drizzle client + pg Pool (globalThis HMR-safe)
src/lib/schema.ts             → documents + chunks tables (Drizzle)
src/lib/embeddings.ts         → embedQuery(), embedDocument() via OpenAI
src/lib/retrieval.ts          → searchSimilar() pgvector cosine, formatContext()
src/components/chat.tsx       → Client component: useChat, streaming, sources
scripts/ingest.ts             → PDF ingestion pipeline
scripts/setup-db.sh           → DB creation + Drizzle migrations
scripts/add-pgvector.sh       → pgvector extension + HNSW index
scripts/migrations/add-pgvector.sql → Raw SQL for vector column + index
```

## Critical Patterns

### AI SDK v6 (NOT v3/v4)

The API changed significantly in v6. Do NOT use deprecated patterns:

```typescript
// CORRECT (v6)
const { messages, sendMessage, status } = useChat();
void sendMessage({ text: inputValue });
const text = message.parts.filter(p => p.type === "text").map(p => p.text).join("");
// status: "ready" | "submitted" | "streaming"

// WRONG (old API — do not use)
// const { input, handleInputChange, handleSubmit, isLoading } = useChat();
// message.content  ← does not exist in v6
```

### pgvector

- Vector column added via raw SQL migration, NOT Drizzle schema (Drizzle lacks native pgvector support)
- Insert: cast with `$1::vector`
- Search: `ORDER BY embedding <=> $1::vector` (cosine distance)
- Similarity: `1 - (embedding <=> $1::vector)`
- HNSW index with `vector_cosine_ops`

### Message Text Extraction (server-side)

Messages arriving at API routes may have `content` (string) or `parts` (array). Always handle both:

```typescript
const userText =
  lastUserMessage.content ??
  lastUserMessage.parts
    ?.filter((p: { type: string }) => p.type === "text")
    .map((p: { text: string }) => p.text)
    .join("") ?? "";
```

### Architecture Rules

- **No auth** — local training showcase
- **No service/repository layers** — API routes access Drizzle directly
- **Minimal files** — each file has one clear purpose
- **Light theme** — CSS custom properties in globals.css

## Database

- Tables: `documents` (metadata) and `chunks` (content + `embedding vector(1536)`)
- pgvector setup: `scripts/migrations/add-pgvector.sql`
- Connection pool: `src/lib/db.ts` with `globalThis` caching for HMR

## Environment Variables

```
DATABASE_URL    → PostgreSQL connection string (required)
OPENAI_API_KEY  → OpenAI API key (required)
CHAT_MODEL      → default: gpt-5.4-nano
EMBEDDING_MODEL → default: text-embedding-3-small
```

## Scripts

```
bun dev              → dev server (Turbopack)
bun run build        → production build
bun db:setup         → create DB + migrations
bun db:embeddings-setup → pgvector extension + index
bun ingest           → process PDFs from data/
bun bootstrap        → all setup in order
```

## When Modifying

- **Schema changes**: edit `src/lib/schema.ts`, then `bun db:generate` + `bun db:migrate`. pgvector columns stay in raw SQL.
- **New routes**: create under `src/app/api/<name>/route.ts`, import from `@/lib/*`
- **New pages**: create under `src/app/<name>/page.tsx`
- **Theme**: edit CSS custom properties in `src/app/globals.css`
