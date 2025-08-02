#!/bin/sh

echo "📦 Running docker-entrypoint.sh..."

# Optional: load .env manually if Prisma or other tools miss it
export $(grep -v '^#' .env | xargs)

# Generate Prisma Client (if not already generated)
npx prisma generate

# Optional: run migrations if needed
# npx prisma migrate deploy

# Start the server
npm run start
