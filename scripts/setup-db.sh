#!/usr/bin/env bash
set -euo pipefail

DB_NAME="rag_training"
DB_USER="rag_admin"
ENV_FILE=".env.local"

# --- Generate password and create user/database ---
echo "=== RAG Database Setup ==="

# Check if database already exists
if psql postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null | grep -q 1; then
  echo "Database '$DB_NAME' already exists."
  echo "To recreate, run: dropdb $DB_NAME && bash scripts/setup-db.sh"
else
  # Generate a secure password
  DB_PASS=$(openssl rand -hex 32)
  echo "Generated secure password for user '$DB_USER'"

  # Create user (skip if exists)
  if psql postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null | grep -q 1; then
    echo "User '$DB_USER' already exists, updating password..."
    psql postgres -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';" >/dev/null
  else
    echo "Creating user '$DB_USER'..."
    psql postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" >/dev/null
  fi

  # Create database
  echo "Creating database '$DB_NAME'..."
  createdb -O "$DB_USER" "$DB_NAME"

  # Grant permissions
  psql "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" >/dev/null

  # Build DATABASE_URL
  DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

  # Update .env.local
  if [ -f "$ENV_FILE" ]; then
    # Replace existing DATABASE_URL or append
    if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
      sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" "$ENV_FILE"
      echo "Updated DATABASE_URL in $ENV_FILE"
    else
      echo "DATABASE_URL=${DATABASE_URL}" >> "$ENV_FILE"
      echo "Added DATABASE_URL to $ENV_FILE"
    fi
  else
    # Create .env.local from example
    if [ -f .env.local.example ]; then
      cp .env.local.example "$ENV_FILE"
      sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL}|" "$ENV_FILE"
    else
      echo "DATABASE_URL=${DATABASE_URL}" > "$ENV_FILE"
    fi
    echo "Created $ENV_FILE with DATABASE_URL"
  fi

  echo ""
  echo "Database URL: postgresql://${DB_USER}:****@localhost:5432/${DB_NAME}"
fi

# Load the (possibly updated) .env.local
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Run Drizzle migrations
echo ""
echo "Running Drizzle migrations..."
bunx drizzle-kit migrate

echo ""
echo "=== Database setup complete ==="
