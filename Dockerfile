# Next.js 16 (Bun) RAG app. next.config has no `output: standalone`, so the
# runtime needs the full build: .next/ + node_modules/ + source. We keep ALL deps
# (incl. drizzle-kit) so the same image powers the ingestion Job (migrate + ingest).
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1
WORKDIR /app
ENV NODE_ENV=production
# Full app tree (build output, deps, data/ PDFs, drizzle/ migrations, scripts/).
COPY --from=build /app ./
EXPOSE 3000
CMD ["bun", "run", "start"]
