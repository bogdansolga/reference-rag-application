"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Markdown from "react-markdown";

interface Source {
  filename: string;
  chunkIndex: number;
  similarity: number;
}

/** Extract text content from a UIMessage's parts array */
function getMessageText(message: { parts: Array<{ type: string; text?: string }> }): string {
  return message.parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");
}

export function Chat() {
  const [inputValue, setInputValue] = useState("");
  const [sourcesMap, setSourcesMap] = useState<Record<string, Source[]>>({});
  const lastQueryRef = useRef<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    onFinish: async ({ message }) => {
      const query = lastQueryRef.current;
      if (!query) return;

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        const sources: Source[] = data.results.map(
          (r: { filename: string; chunkIndex: number; similarity: number }) => ({
            filename: r.filename,
            chunkIndex: r.chunkIndex,
            similarity: parseFloat(r.similarity.toFixed(2)),
          }),
        );
        setSourcesMap((prev) => ({ ...prev, [message.id]: sources }));
      } catch {
        // silently ignore source fetch errors
      }
    },
  });

  const isLoading = status !== "ready";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      lastQueryRef.current = inputValue;
      void sendMessage({ text: inputValue });
      setInputValue("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3">
        <h1 className="text-lg font-semibold">RAG Training Showcase</h1>
        <span className="text-xs text-[var(--muted)] bg-[var(--input)] px-2 py-1 rounded">
          AI Introduction &amp; Integration
        </span>
        <div className="ml-auto">
          <Link
            href="/overview"
            className="text-sm text-[var(--primary)] hover:underline"
          >
            RAG Overview
          </Link>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="max-w-6xl mx-auto text-center pt-20 pb-8">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-[var(--muted)] text-base mb-1">
              Ask anything about AI, ML, RAG, or Vector Databases
            </p>
            <p className="text-[var(--muted)] text-sm">
              Answers are grounded in the training course materials
            </p>
          </div>
        )}

        <div className="max-w-6xl mx-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-[var(--user-bubble)] text-[var(--user-text)] px-4 py-2.5 rounded-xl rounded-br-sm max-w-[80%] text-base">
                    {getMessageText(message)}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-[var(--card)] border border-[var(--border)] px-5 py-4 rounded-xl text-base leading-relaxed prose max-w-none">
                    <Markdown>{getMessageText(message)}</Markdown>
                  </div>
                  {sourcesMap[message.id] &&
                    sourcesMap[message.id].length > 0 && (
                      <div className="mt-2 pl-2">
                        <p className="text-[11px] text-[var(--muted)] mb-1.5">
                          Sources:
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          {sourcesMap[message.id].map((source, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] text-[var(--primary)] bg-[var(--accent)] px-2 py-0.5 rounded border border-[var(--accent-border)]"
                            >
                              {source.filename} — chunk {source.chunkIndex}{" "}
                              <span className="text-[var(--muted)]">
                                ({source.similarity})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          ))}

          {status === "submitted" && (
            <div className="bg-[var(--card)] border border-[var(--border)] px-4 py-3 rounded-xl text-sm text-[var(--muted)]">
              Thinking...
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-800 px-4 py-3 rounded-xl text-sm text-red-400">
              {error.message}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--input)]">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about AI, ML, or RAG..."
            className="flex-1 bg-[var(--input)] border border-[var(--border)] rounded-lg px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-3 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
