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
| AI | Vercel AI SDK v6 + Claude (Anthropic API / Vertex AI) + Vertex embeddings |
| Database | PostgreSQL + pgvector |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS v4 |
| Runtime | Bun |

**Provider-agnostic:** generation runs on Claude through either the Anthropic API or Vertex AI, switched by `CHAT_BACKEND` in `.env.local`. Embeddings always run on Vertex AI (EU region). All config lives in `.env.local` — see `.env.local.example`.

## Quick Start

```bash
bun install
cp .env.local.example .env.local   # set CHAT_BACKEND, ANTHROPIC_API_KEY (or Vertex), DATABASE_URL
bun bootstrap                       # set up DB, pgvector, and ingest PDFs
bun dev                             # start at http://localhost:3000
```

See the **[Setup Guide](docs/SETUP.md)** for detailed instructions, prerequisites, and troubleshooting.

## Architecture

```
User Question
  → Embed query (Vertex text-embedding-005, 768 dims)
  → Vector search (pgvector cosine similarity, top-k chunks)
  → Augment prompt with retrieved context
  → Stream LLM response (Claude Sonnet 4.6 — Anthropic API or Vertex AI)
  → Display with source citations
```

The app has two pages:
- **/** — Chat interface for querying the knowledge base
- **/overview** — Visual RAG architecture overview with diagrams

## Deploy to Kubernetes

A minimal manifest set lives in [`k8s/`](k8s/) — Namespace, Postgres+pgvector
StatefulSet (persistent volume), ConfigMap, Secret templates, Deployment, Service,
and a Traefik Ingress.

```bash
# build + push (multi-arch)
docker buildx build --platform linux/amd64,linux/arm64 \
  -t <registry>/reference-rag-application:1.0 --push .

# Postgres + config + app (secrets are NOT committed — see k8s/11-secret.example.yaml)
kubectl apply -f k8s/00-namespace.yaml -f k8s/20-config.yaml -f k8s/10-postgres.yaml
kubectl apply -f k8s/30-deployment.yaml -f k8s/31-service.yaml -f k8s/32-ingress.yaml
```

**Populate the vector store — two options:**

- **Ingest live** (`k8s/40-ingest-job.yaml`) — runs `db:migrate` + `ingest` to embed the
  `data/` PDFs via Vertex.
- **Restore a dump** (`k8s/41-db-restore-job.yaml`) — load pre-computed embeddings from a
  `pg_dump`, so no embedding API is needed to populate the knowledge base:
  ```bash
  pg_dump --no-owner --no-privileges "$LOCAL_DATABASE_URL" > rag.sql
  kubectl -n reference-rag create configmap rag-db-dump --from-file=rag.sql=rag.sql
  kubectl -n reference-rag apply -f k8s/41-db-restore-job.yaml
  ```

Either way, **query embedding still runs on Vertex at request time**, so chat needs the
`gcp-sa` Secret (a service-account JSON with `roles/aiplatform.user`). The Ingress uses
`ingressClassName: traefik` (k3s default).

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
