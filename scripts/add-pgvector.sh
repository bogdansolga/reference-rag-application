#!/usr/bin/env bash
set -euo pipefail

# Load DATABASE_URL from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SQL_FILE="$SCRIPT_DIR/migrations/add-pgvector.sql"

echo "Running pgvector setup..."
psql "$DATABASE_URL" -f "$SQL_FILE"
echo "pgvector setup complete."
