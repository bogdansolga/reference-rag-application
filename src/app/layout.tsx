import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG Training Showcase",
  description: "Retrieval Augmented Generation demo with Next.js and pgvector",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
