#!/bin/sh
set -e

echo "Starting Stock Daily Backend..."

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

echo "Migrations completed. Starting server..."

# Start the application
exec node dist/app.js
