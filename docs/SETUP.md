# Setup Guide

Step-by-step guide for setting up and running the RAG Training Showcase application.

## Prerequisites

- **Bun** (v1.1+) — [Install Bun](https://bun.sh/)
- **PostgreSQL** (v15+) with the [pgvector](https://github.com/pgvector/pgvector) extension installed
- **OpenAI API key** — [Get one here](https://platform.openai.com/api-keys)

## 1. Install Dependencies

```bash
bun install
```

## 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your settings:

```bash
DATABASE_URL=postgresql://your_user@localhost:5432/rag_training
OPENAI_API_KEY=sk-proj-your-key-here
CHAT_MODEL=gpt-5.4-nano           # optional, this is the default
EMBEDDING_MODEL=text-embedding-3-small  # optional, this is the default
```

## 3. Set Up the Database

You can run all steps at once:

```bash
bun bootstrap
```

Or step by step:

```bash
# Create database and run Drizzle migrations
bun db:setup

# Enable pgvector extension and create HNSW index
bun db:embeddings-setup
```

## 4. Prepare Training Documents

Copy PDF files into the `data/` directory:

```bash
mkdir -p data
cp /path/to/your/pdfs/*.pdf data/
```

This project was designed for the "AI Introduction & Integration" training course materials, but any PDF documents will work.

## 5. Ingest Documents

```bash
bun ingest
```

This will:
- Read each PDF from `data/`
- Extract text content
- Split into ~2000 character chunks with ~200 character overlap
- Generate embeddings via OpenAI `text-embedding-3-small`
- Store everything in PostgreSQL with pgvector

You'll see progress output for each document.

## 6. Start the Application

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Pages

| URL | Description |
|-----|-------------|
| `/` | Chat interface — ask questions about the ingested documents |
| `/overview` | Visual RAG architecture overview with diagrams |

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server with Turbopack |
| `bun run build` | Production build |
| `bun start` | Start production server |
| `bun db:setup` | Create database + run Drizzle migrations |
| `bun db:embeddings-setup` | Enable pgvector extension + create HNSW index |
| `bun db:generate` | Generate Drizzle migrations from schema changes |
| `bun db:migrate` | Run pending Drizzle migrations |
| `bun db:studio` | Open Drizzle Studio (visual DB editor) |
| `bun ingest` | Ingest PDFs from `data/` directory |
| `bun bootstrap` | Run all setup steps in order |

## Troubleshooting

### "pgvector extension not found"
Install pgvector for your PostgreSQL version. On macOS with Homebrew:
```bash
brew install pgvector
```

### "Port 3000 is in use"
Next.js will automatically use the next available port. Check the terminal output for the actual URL.

### Embedding errors
Verify your `OPENAI_API_KEY` is valid and has access to the embeddings API. The default model `text-embedding-3-small` requires a standard OpenAI API key.

### Empty responses from chat
Make sure you've run `bun ingest` after placing PDFs in `data/`. The chat uses vector search to find relevant context — without ingested documents, there's nothing to retrieve.
