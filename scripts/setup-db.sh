#!/usr/bin/env bash
set -euo pipefail

# Load DATABASE_URL from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

DB_NAME="rag_training"

echo "Creating database '$DB_NAME' (if not exists)..."
createdb "$DB_NAME" 2>/dev/null || echo "Database '$DB_NAME' already exists"

echo "Running Drizzle migrations..."
bunx drizzle-kit migrate

echo "Database setup complete."
