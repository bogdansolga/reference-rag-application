# Reference RAG Application

A training showcase application demonstrating Retrieval Augmented Generation (RAG) with a chat interface. Built with Next.js 16, Vercel AI SDK v6, Drizzle ORM, PostgreSQL + pgvector, and Tailwind CSS v4. Runs on Bun.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) runtime
- PostgreSQL with [pgvector](https://github.com/pgvector/pgvector) extension
- OpenAI API key

### Setup

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your DATABASE_URL and OPENAI_API_KEY

# 3. Bootstrap everything (create DB, enable pgvector, ingest PDFs)
bun bootstrap

# 4. Start dev server
bun dev
```

The app runs at `http://localhost:3000`.

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/rag_training`) |
| `OPENAI_API_KEY` | Yes | — | OpenAI API key for embeddings and chat |
| `CHAT_MODEL` | No | `gpt-5.4-nano` | OpenAI chat model ID |
| `EMBEDDING_MODEL` | No | `text-embedding-3-small` | OpenAI embedding model (1536 dimensions) |

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Start dev server with Turbopack |
| `bun run build` | Production build |
| `bun start` | Start production server |
| `bun db:setup` | Create database + run Drizzle migrations |
| `bun db:embeddings-setup` | Enable pgvector extension + create HNSW index |
| `bun db:generate` | Generate Drizzle migrations from schema changes |
| `bun db:migrate` | Run pending Drizzle migrations |
| `bun db:studio` | Open Drizzle Studio (DB GUI) |
| `bun ingest` | Ingest PDFs from `data/` directory |
| `bun bootstrap` | Run all setup steps in order (db:setup, db:embeddings-setup, ingest) |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Chat UI (server component, renders <Chat />)
│   ├── layout.tsx               # Root layout with dark theme
│   ├── globals.css              # Tailwind v4 + CSS custom properties
│   └── api/
│       ├── chat/route.ts        # POST — RAG chat endpoint (embed, search, stream)
│       └── search/route.ts      # GET ?q=... — direct vector search, returns chunks + scores
├── lib/
│   ├── db.ts                    # Drizzle client + pg connection pool (HMR-safe via globalThis)
│   ├── schema.ts                # documents + chunks table definitions
│   ├── embeddings.ts            # embedQuery() and embedDocument() via OpenAI
│   └── retrieval.ts             # searchSimilar() pgvector cosine search, formatContext()
├── components/
│   └── chat.tsx                 # Client component: useChat hook, streaming, source citations
└── types/
    └── pdf-parse.d.ts           # Type declarations for pdf-parse

scripts/
├── ingest.ts                    # PDF ingestion: extract text -> chunk -> embed -> store
├── setup-db.sh                  # Create database + run Drizzle migrations
├── add-pgvector.sh              # Enable pgvector extension + HNSW index
└── migrations/
    └── add-pgvector.sql         # SQL: CREATE EXTENSION vector, ALTER TABLE, CREATE INDEX

data/                            # PDF source documents (gitignored)
drizzle/                         # Generated Drizzle migrations
docs/superpowers/specs/          # Design spec
```

## Architecture

### RAG Pipeline (query flow)

1. User sends question via the chat UI (`src/components/chat.tsx` calls `sendMessage()`)
2. `POST /api/chat` receives the message array
3. Embeds the latest user query via `embedQuery()` -> 1536-dim vector
4. Searches the `chunks` table using pgvector: `ORDER BY embedding <=> $1::vector LIMIT 5`
5. Builds a system prompt with retrieved context via `formatContext()`
6. Streams the LLM response via `streamText()` + `toUIMessageStreamResponse()`
7. Client fetches source citations from `GET /api/search` after response completes (`onFinish` callback)

### Ingestion Pipeline (offline, `bun ingest`)

1. Reads all PDFs from `data/`
2. Extracts text via `pdf-parse`
3. Chunks into ~2000 char segments with ~200 char overlap
4. Batch-generates embeddings (20 at a time) via `embedDocument()`
5. Stores in PostgreSQL with `::vector` cast

### Database

- **PostgreSQL** with **pgvector** extension
- Two tables defined in `src/lib/schema.ts`:
  - `documents` — file metadata (id, filename, title, created_at)
  - `chunks` — content + embedding vector(1536) (id, document_id, content, chunk_index, metadata)
- **HNSW index** on `chunks.embedding` using `vector_cosine_ops`
- The `embedding` column is added via raw SQL migration (`scripts/migrations/add-pgvector.sql`) because Drizzle does not natively support pgvector types
- Connection pool in `src/lib/db.ts` uses `globalThis` caching to survive Next.js HMR

### Key Patterns

- **No authentication** — this is a local training showcase
- **No repository/service layer** — API routes access Drizzle directly for minimal architecture
- **AI SDK v6 API**: use `sendMessage()` (not `handleSubmit`), check `status` (not `isLoading`), read `message.parts` (not `message.content`). The helper `getMessageText()` in `chat.tsx` extracts text from parts.
- **pgvector**: vectors are cast with `::vector` on insert, searched with `<=>` cosine distance operator. Similarity is computed as `1 - distance`.
- **Tailwind CSS v4**: uses `@tailwindcss/postcss` plugin, CSS custom properties for theming in `globals.css`

## Development

### Adding a new API route

Create a new file under `src/app/api/<name>/route.ts`. Import from `@/lib/*` for database, embeddings, and retrieval utilities.

### Modifying the database schema

1. Edit `src/lib/schema.ts`
2. Run `bun db:generate` to generate a new migration
3. Run `bun db:migrate` to apply it

Note: pgvector-specific columns (embedding) are managed via raw SQL in `scripts/migrations/`, not through Drizzle schema.

### Adding PDF documents

1. Place PDF files in the `data/` directory
2. Run `bun ingest` to process and embed them
3. The ingestion script will skip documents that already exist (matched by filename)

### Tech stack versions

- Next.js 16 (App Router, Turbopack)
- React 19
- Vercel AI SDK v6 (`ai@^6.0.0`, `@ai-sdk/openai@^3.0.0`, `@ai-sdk/react@^3.0.0`)
- Drizzle ORM 0.45+
- Tailwind CSS 4
- TypeScript 5.9+
