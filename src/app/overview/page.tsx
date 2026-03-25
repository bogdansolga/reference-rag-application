import Link from "next/link";

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
        <Link href="/" className="text-lg font-semibold hover:text-[var(--primary)] transition-colors">
          RAG Training Showcase
        </Link>
        <span className="text-xs text-[var(--muted)] bg-[var(--input)] px-2 py-1 rounded">
          Architecture Overview
        </span>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-2">Retrieval Augmented Generation (RAG)</h1>
        <p className="text-[var(--muted)] text-xl mb-8">
          Architecture Overview &mdash; <em>&quot;There are no solutions, there are only tradeoffs.&quot;</em>
        </p>

        {/* System Diagram */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">System Components</h2>
          <div className="bg-[var(--input)] border border-[var(--border)] rounded-xl p-8 overflow-x-auto">
            <svg viewBox="0 0 800 530" className="w-full max-w-3xl mx-auto" style={{ minWidth: 600 }}>
              {/* Users */}
              <rect x="300" y="10" width="200" height="50" rx="8" fill="var(--primary)" />
              <text x="400" y="40" textAnchor="middle" fill="var(--primary-foreground)" fontSize="15" fontWeight="600">Users</text>

              {/* Document */}
              <rect x="40" y="100" width="140" height="50" rx="8" fill="var(--card)" stroke="var(--border)" />
              <text x="110" y="130" textAnchor="middle" fill="var(--foreground)" fontSize="13">Large Document</text>

              {/* Web App */}
              <rect x="250" y="100" width="300" height="60" rx="8" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
              <text x="400" y="127" textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="600">AI Powered Web Application</text>
              <text x="400" y="147" textAnchor="middle" fill="var(--muted)" fontSize="11">Next.js + Vercel AI SDK</text>

              {/* LLM */}
              <rect x="100" y="280" width="220" height="60" rx="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="210" y="307" textAnchor="middle" fill="#92400e" fontSize="14" fontWeight="600">Large Language Model</text>
              <text x="210" y="327" textAnchor="middle" fill="#b45309" fontSize="11">OpenAI gpt-5.4-nano</text>

              {/* Vector DB */}
              <rect x="480" y="280" width="220" height="60" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
              <text x="590" y="307" textAnchor="middle" fill="#1e40af" fontSize="14" fontWeight="600">Vector Database</text>
              <text x="590" y="327" textAnchor="middle" fill="#1d4ed8" fontSize="11">PostgreSQL + pgvector</text>

              {/* Arrows: User to Web App */}
              <line x1="370" y1="60" x2="370" y2="100" stroke="var(--muted)" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <line x1="430" y1="60" x2="430" y2="100" stroke="var(--muted)" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <text x="350" y="85" textAnchor="end" fill="var(--muted)" fontSize="13">upload</text>
              <text x="450" y="85" fill="var(--muted)" fontSize="13">query</text>

              {/* Document to Web App */}
              <line x1="180" y1="125" x2="250" y2="125" stroke="var(--muted)" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <text x="215" y="118" textAnchor="middle" fill="var(--muted)" fontSize="10">1</text>

              {/* Web App to LLM */}
              <line x1="330" y1="160" x2="230" y2="280" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow-amber)" />
              <text x="265" y="215" fill="#b45309" fontSize="10" fontWeight="600">3, 7</text>

              {/* LLM to Web App */}
              <line x1="260" y1="280" x2="360" y2="160" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrow-amber)" />
              <text x="325" y="215" fill="#b45309" fontSize="10" fontWeight="600">9</text>

              {/* Web App to Vector DB */}
              <line x1="470" y1="160" x2="560" y2="280" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow-blue)" />
              <text x="530" y="215" fill="#1d4ed8" fontSize="10" fontWeight="600">2, 4</text>

              {/* Vector DB to Web App */}
              <line x1="530" y1="280" x2="440" y2="160" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrow-blue)" />
              <text x="470" y="215" fill="#1d4ed8" fontSize="10" fontWeight="600">6, 8</text>

              {/* Ingestion label */}
              <rect x="40" y="400" width="320" height="115" rx="8" fill="#fef9c3" stroke="#facc15" strokeWidth="1" />
              <text x="200" y="425" textAnchor="middle" fill="#854d0e" fontSize="15" fontWeight="700">Ingestion (steps 1-4)</text>
              <text x="60" y="447" fill="#92400e" fontSize="13">1. Upload documents</text>
              <text x="60" y="465" fill="#92400e" fontSize="13">2. Chunk text + save metadata</text>
              <text x="60" y="483" fill="#92400e" fontSize="13">3. Generate embeddings (LLM)</text>
              <text x="60" y="501" fill="#92400e" fontSize="13">4. Store embeddings in vector DB</text>

              {/* Querying label */}
              <rect x="400" y="400" width="360" height="115" rx="8" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" />
              <text x="580" y="425" textAnchor="middle" fill="#1e40af" fontSize="15" fontWeight="700">Querying (steps 5-11)</text>
              <text x="420" y="447" fill="#1e3a8a" fontSize="13">5. User asks question</text>
              <text x="420" y="465" fill="#1e3a8a" fontSize="13">6-8. Embed query → similarity search → top 5</text>
              <text x="420" y="483" fill="#1e3a8a" fontSize="13">9. Prompt LLM with context chunks</text>
              <text x="420" y="501" fill="#1e3a8a" fontSize="13">10-11. Save &amp; return response</text>

              {/* Arrow markers */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)" />
                </marker>
                <marker id="arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                </marker>
                <marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
              </defs>
            </svg>
          </div>
        </section>

        {/* Ingestion Phase */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Phase 1: Ingestion</h2>
          <p className="text-[var(--muted)] text-lg mb-4">
            Transform source documents into searchable, vectorized chunks stored in the database.
          </p>
          <div className="space-y-3">
            {[
              { step: 1, title: "Upload documents", desc: "PDFs are placed in the data/ directory for processing", color: "bg-amber-50 border-amber-200" },
              { step: 2, title: "Chunk text + save metadata", desc: "Split into ~2000 char chunks with ~200 char overlap. Each chunk is stored with its document reference.", color: "bg-amber-50 border-amber-200" },
              { step: 3, title: "Generate embeddings", desc: "Each chunk is sent to OpenAI text-embedding-3-small → 1536-dimensional vector", color: "bg-amber-50 border-amber-200" },
              { step: 4, title: "Store embeddings", desc: "Vectors stored in PostgreSQL via pgvector with HNSW index for fast cosine similarity search", color: "bg-amber-50 border-amber-200" },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className={`${color} border rounded-lg p-4 flex gap-4 items-start`}>
                <span className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">{step}</span>
                <div>
                  <p className="font-semibold text-base">{title}</p>
                  <p className="text-base text-[var(--muted)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Querying Phase */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Phase 2: Querying</h2>
          <p className="text-[var(--muted)] text-lg mb-4">
            Handle user questions by retrieving relevant context and generating grounded answers.
          </p>
          <div className="space-y-3">
            {[
              { step: 5, title: "User asks a question", desc: "Via the chat interface at the home page", color: "bg-blue-50 border-blue-200" },
              { step: 6, title: "Embed the question", desc: "Convert the user's question into a 1536-dim vector using the same embedding model", color: "bg-blue-50 border-blue-200" },
              { step: 7, title: "Similarity search", desc: "Find top 5 most similar chunks using cosine distance (⇔ operator) on the HNSW index", color: "bg-blue-50 border-blue-200" },
              { step: 8, title: "Build augmented prompt", desc: "Inject retrieved chunks into the system prompt as context for the LLM", color: "bg-blue-50 border-blue-200" },
              { step: 9, title: "Stream LLM response", desc: "gpt-5.4-nano generates an answer grounded in the retrieved context, streamed to the UI", color: "bg-blue-50 border-blue-200" },
              { step: 10, title: "Display with sources", desc: "Response shown with source citations (document name, chunk index, similarity score)", color: "bg-blue-50 border-blue-200" },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className={`${color} border rounded-lg p-4 flex gap-4 items-start`}>
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">{step}</span>
                <div>
                  <p className="font-semibold text-base">{title}</p>
                  <p className="text-base text-[var(--muted)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Considerations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Key Considerations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3">Ingestion Complexities</h3>
              <ul className="space-y-2 text-base text-[var(--muted)]">
                <li>Choosing the right <strong className="text-[var(--foreground)]">chunk size and overlap</strong></li>
                <li>Handling <strong className="text-[var(--foreground)]">diverse document formats</strong></li>
                <li>Deciding what <strong className="text-[var(--foreground)]">metadata</strong> to extract</li>
                <li>Managing <strong className="text-[var(--foreground)]">re-ingestion</strong> on updates</li>
                <li>Ensuring <strong className="text-[var(--foreground)]">embedding consistency</strong></li>
              </ul>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3">Querying Complexities</h3>
              <ul className="space-y-2 text-base text-[var(--muted)]">
                <li>Balancing <strong className="text-[var(--foreground)]">latency vs. accuracy</strong></li>
                <li>Handling <strong className="text-[var(--foreground)]">ambiguous questions</strong></li>
                <li><strong className="text-[var(--foreground)]">Caching</strong> question embeddings</li>
                <li>Constructing effective <strong className="text-[var(--foreground)]">LLM prompts</strong> within token limits</li>
                <li>Deciding on <strong className="text-[var(--foreground)]">re-ranking</strong> strategies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Database Selection */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Database Selection</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-base border border-[var(--border)] rounded-lg overflow-hidden">
              <thead className="bg-[var(--card)]">
                <tr>
                  <th className="text-left p-3 font-semibold border-b border-[var(--border)]">Option</th>
                  <th className="text-left p-3 font-semibold border-b border-[var(--border)]">Pros</th>
                  <th className="text-left p-3 font-semibold border-b border-[var(--border)]">Cons</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="p-3 font-medium">Dedicated Vector DB<br /><span className="text-xs text-[var(--muted)]">Qdrant, Pinecone, Weaviate</span></td>
                  <td className="p-3 text-[var(--muted)]">Purpose-built for similarity search; optimized indexing</td>
                  <td className="p-3 text-[var(--muted)]">Additional infrastructure to manage</td>
                </tr>
                <tr className="border-b border-[var(--border)] bg-[var(--accent)]">
                  <td className="p-3 font-medium">Postgres + pgvector <span className="text-xs text-[var(--primary)]">(this project)</span></td>
                  <td className="p-3 text-[var(--muted)]">Single database for everything; familiar SQL interface</td>
                  <td className="p-3 text-[var(--muted)]">May not scale for very large vector workloads</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Elasticsearch / OpenSearch</td>
                  <td className="p-3 text-[var(--muted)]">Combines text + vector search (hybrid)</td>
                  <td className="p-3 text-[var(--muted)]">More complex setup; heavier resources</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-sm text-[var(--muted)] py-8 border-t border-[var(--border)]">
          <Link href="/" className="text-[var(--primary)] hover:underline">
            ← Back to Chat
          </Link>
        </footer>
      </div>
    </div>
  );
}
