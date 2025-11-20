#!/bin/bash
# Script to run database migrations on Render
# This script disables Replit's default PG* environment variables
# that interfere with the DATABASE_URL connection

echo "Running database migrations..."
env -u PGHOST -u PGUSER -u PGPASSWORD -u PGDATABASE -u PGPORT npm run db:push
echo "Migrations completed!"
