# RAG Training Showcase

A minimal Retrieval Augmented Generation (RAG) application built as a training showcase. Demonstrates the full RAG pipeline end-to-end — from document ingestion to vector search to grounded AI responses.

## What It Does

1. **Ingests PDF documents** — extracts text, chunks it, generates embeddings, stores in PostgreSQL with pgvector
2. **Answers questions** — embeds user queries, searches for similar chunks via cosine similarity, streams LLM responses grounded in retrieved context
3. **Shows sources** — displays which document chunks were used to generate each answer, with similarity scores

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| AI | Vercel AI SDK v6 + OpenAI |
| Database | PostgreSQL + pgvector |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS v4 |
| Runtime | Bun |

## Quick Start

```bash
bun install
cp .env.local.example .env.local   # add your OPENAI_API_KEY and DATABASE_URL
bun bootstrap                       # set up DB, pgvector, and ingest PDFs
bun dev                             # start at http://localhost:3000
```

See the **[Setup Guide](docs/SETUP.md)** for detailed instructions, prerequisites, and troubleshooting.

## Architecture

```
User Question
  → Embed query (text-embedding-3-small, 1536 dims)
  → Vector search (pgvector cosine similarity, top 5 chunks)
  → Augment prompt with retrieved context
  → Stream LLM response (gpt-5.4-nano)
  → Display with source citations
```

The app has two pages:
- **/** — Chat interface for querying the knowledge base
- **/overview** — Visual RAG architecture overview with diagrams

## Documentation

| Document | Audience | Description |
|----------|----------|-------------|
| **[Setup Guide](docs/SETUP.md)** | Developers | Prerequisites, installation, configuration, troubleshooting |
| **[CLAUDE.md](CLAUDE.md)** | Claude Code / AI agents | Project context, critical patterns, architecture rules |
| **[RAG Overview](docs/rag-overview.md)** | Students / learners | Architecture diagrams, ingestion & querying phases, design tradeoffs |
| **[Design Spec](docs/superpowers/specs/2026-03-25-rag-application-design.md)** | Architects | Full design specification with data model, API design, and decisions |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Chat UI
│   ├── overview/page.tsx     # RAG architecture overview
│   └── api/
│       ├── chat/route.ts     # RAG chat endpoint
│       └── search/route.ts   # Vector search endpoint
├── lib/
│   ├── db.ts                 # Database connection
│   ├── schema.ts             # Table definitions
│   ├── embeddings.ts         # Embedding helpers
│   └── retrieval.ts          # Vector search + context formatting
└── components/
    └── chat.tsx              # Chat component

scripts/
├── ingest.ts                 # PDF ingestion pipeline
├── setup-db.sh               # Database setup
├── add-pgvector.sh           # pgvector setup
└── migrations/
    └── add-pgvector.sql      # Vector column + HNSW index
```

## License

Training showcase — intended for educational use.
