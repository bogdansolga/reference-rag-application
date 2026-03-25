# Retrieval Augmented Generation (RAG) -- Architecture Overview

> *"There are no solutions, there are only tradeoffs."*

This document describes the high-level architecture of a simple RAG system, covering
both the **Ingestion** phase (loading documents) and the **Querying** phase (answering
user questions).

---

## System Components

```
                        +---------------------+
                        |       Users         |
                        | (upload & question) |
                        +---------------------+
                           |  1 (upload)    | 5 (ask)
                           v                v
  +-----------+    1    +-----------------------------+
  |   Large   | ------> |   AI Powered Web Application |
  |  Document |         +-----------------------------+
  +-----------+            |    |    |    |    |    |
                           |    |    |    |    |    |
              +------------+    |    |    |    |    +-----------+
              |  3        7     |    |    |   9               |
              v            v    |    |    |    v               |
     +---------------------+   |    |    |  +---------------------+
     |  Large Language      |   |    |    |  |  Large Language      |
     |  Model (LLM)        |   |    |    |  |  Model (LLM)        |
     +---------------------+   |    |    |  +---------------------+
                                |    |    |
          Ingestion flows:      |    |    |      Querying flows:
          2 (save chunks)       |    |    |      6 (search DB)
          4 (store embeddings)  |    |    |      8 (similarity search)
                                |    |    |      10 (save question)
                                v    v    v
                      +-------------------------+
                      |    Vector Database       |
                      |  +-----+ +-----+ +-----+|
                      |  | m q | | m q | | m q | |
                      |  +-----+ +-----+ +-----+|
                      +-------------------------+
                         m = metadata chunk
                         q = query / embedding

              +-------------------+
              | Database(s)       |
              | selection         |
              +-------------------+
```

### Simplified Data Flow

```
INGESTION (steps 1-4)                  QUERYING (steps 5-11)

  User                                   User
   |                                      |
   | 1. Upload document                   | 5. Ask question
   v                                      v
  Web App                                Web App
   |                                      |
   | 2. Chunk text + save metadata        | 6. Search question in DB
   v                                      |
  Vector DB                               | 7. Generate question embeddings (via LLM)
   ^                                      |
   | 4. Store embeddings                  | 8. Similarity search in Vector DB
   |                                      |
  LLM                                    | 9. Prompt LLM with top chunks
   ^                                      |
   | 3. Generate chunk embeddings         | 10. Save question + embeddings to DB
   |                                      |
                                          | 11. Return formatted response
                                          v
                                        User
```

---

## Phase 1: Ingestion (Steps 1--4)

The ingestion phase transforms a large source document into searchable, vectorized
chunks stored in the database.

| Step | Action | Component |
|------|--------|-----------|
| **1** | Upload the documents | User --> Web App |
| **2** | Perform text chunking and database saving (chunks with metadata) | Web App --> Vector DB |
| **3** | Generate the embeddings for each saved chunk | Web App --> LLM |
| **4** | Store the embeddings for the generated chunks | Web App --> Vector DB |

### Key considerations during ingestion

- **Chunking strategy** -- How large should each chunk be? Overlapping or not?
- **Metadata** -- What metadata to attach to each chunk (source, page, section, etc.)?
- **Embedding model** -- Which model to use, and at what dimensionality?

---

## Phase 2: Querying (Steps 5--11)

The querying phase handles user questions, retrieves relevant context from the
database, and uses an LLM to generate an answer.

| Step | Action | Component |
|------|--------|-----------|
| **5** | Ask a question from the web interface | User --> Web App |
| **6** | Search for the question in the database first (cache / dedup) | Web App --> Vector DB |
| **7** | Generate embeddings for the question (if not already found in DB) | Web App --> LLM |
| **8** | Similarity search by embeddings -- returns top 5 chunks, without ranking, without text search | Web App --> Vector DB |
| **9** | Prompt the LLM with the user's question and the relevant document chunks | Web App --> LLM |
| **10** | Save the question's text, embeddings, and metadata | Web App --> Vector DB |
| **11** | Return the response to the user, formatted as needed | Web App --> User |

### Key considerations during querying

- **Similarity threshold** -- What cosine-similarity cutoff to use?
- **Top-K selection** -- How many chunks to retrieve (default: 5)?
- **Re-ranking** -- Currently not applied; could improve relevance.
- **Hybrid search** -- Text search is not used alongside vector search in this version.

---

## Complexity Notes

### Data Saving Complexities

Ingestion is not as simple as "just store the text." Real-world concerns include:

- Choosing the right **chunk size and overlap** for your domain.
- Handling **diverse document formats** (PDF, DOCX, HTML, etc.).
- Deciding what **metadata** to extract and persist alongside each chunk.
- Managing **re-ingestion** when source documents are updated.
- Ensuring **embedding consistency** (same model and parameters across all chunks).

### Data Querying Complexities

Querying introduces its own set of tradeoffs:

- Balancing **latency vs. accuracy** (more chunks = better context but slower).
- Handling **ambiguous or multi-part questions**.
- Deciding whether to **cache question embeddings** for repeated queries.
- Constructing effective **LLM prompts** that include retrieved context without exceeding token limits.
- Formatting the **response** appropriately for the end user.

---

## Database(s) Selection

The choice of database technology is a critical architectural decision:

| Option | Pros | Cons |
|--------|------|------|
| **Dedicated vector DB** (e.g., Qdrant, Pinecone, Weaviate) | Purpose-built for similarity search; optimized indexing | Additional infrastructure to manage |
| **Postgres + pgvector** | Single database for everything; familiar SQL interface | May not scale as well for very large vector workloads |
| **Elasticsearch / OpenSearch** | Combines text search with vector search (hybrid) | More complex setup; heavier resource usage |

> Remember: *"There are no solutions, there are only tradeoffs."*
> Choose the database that fits your scale, team expertise, and operational constraints.
