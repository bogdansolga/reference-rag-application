# Claude Code Context

This file provides context for Claude Code when working on this project.

## What This Is

A minimal RAG (Retrieval Augmented Generation) training showcase. Educational app — clarity over production features.

## Tech Stack

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**
- **Vercel AI SDK v6** (`ai@^6`, `@ai-sdk/anthropic@^3`, `@ai-sdk/google-vertex@^4`, `@ai-sdk/react@^3`)
- **Claude** generation, provider-agnostic via `CHAT_BACKEND` (Anthropic API ⇄ Vertex AI); **Vertex** embeddings. All config in `.env.local`.
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
src/lib/embeddings.ts         → embedQuery(), embedDocument() via Vertex text-embedding-005
src/lib/llm.ts                → chatModel() — Claude, backend chosen by CHAT_BACKEND
src/lib/config.ts             → env()/envNum() — all config from .env.local, nothing hard-coded
src/lib/retrieval.ts          → searchSimilar() pgvector cosine, formatContext()
src/components/chat.tsx       → Client component: useChat, streaming, sources
scripts/ingest.ts             → PDF ingestion pipeline
scripts/setup-db.sh           → DB creation + Drizzle migrations
scripts/add-pgvector.sh       → pgvector extension + HNSW index
scripts/migrations/add-pgvector.sql → Raw SQL for vector column + index
Dockerfile                    → Bun image; next build (non-standalone, keeps node_modules + data/)
k8s/                          → Kubernetes manifests (see Deployment below)
```

## Deployment (Kubernetes)

`k8s/` holds a minimal manifest set: Namespace, Postgres+pgvector StatefulSet (persistent
volume), ConfigMap, Secret templates (`11-secret.example.yaml`), Deployment, Service, and a
Traefik Ingress (`ingressClassName: traefik` — k3s default; not nginx). Secrets are never
committed. Populate the vector store either by **ingesting** (`40-ingest-job.yaml`: migrate +
embed `data/` PDFs via Vertex) or by **restoring a dump** (`41-db-restore-job.yaml`: load a
`pg_dump` via a `rag-db-dump` ConfigMap — pre-computed embeddings, no embedding API needed).
Query embedding still runs on Vertex at request time, so chat needs the `gcp-sa`
service-account Secret regardless. See README "Deploy to Kubernetes".

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

All config lives in `.env.local` (see `.env.local.example`) — nothing is hard-coded in the app.

```
DATABASE_URL                 → PostgreSQL connection string
CHAT_BACKEND                 → direct (Anthropic API) | vertex (Claude on Vertex)
CHAT_MODEL                   → e.g. claude-sonnet-4-6
ANTHROPIC_API_KEY            → for CHAT_BACKEND=direct
ANTHROPIC_VERTEX_PROJECT_ID  → GCP project (Vertex generation + all embeddings; ADC auth)
CLOUD_ML_REGION              → e.g. europe-west1
EMBEDDING_MODEL              → e.g. text-embedding-005
EMBEDDING_DIMENSIONS         → must match the model + pgvector column (e.g. 768)
RAG_TOP_K, RAG_CHUNK_SIZE, RAG_CHUNK_OVERLAP, RAG_EMBEDDING_BATCH_SIZE
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
