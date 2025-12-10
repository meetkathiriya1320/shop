#!/bin/bash

# Ensure database directory exists
mkdir -p /tmp/data

# Set database path for Render
export DATABASE_PATH="/tmp/data/database.sqlite"

# Create database directory if it doesn't exist
mkdir -p $(dirname "$DATABASE_PATH")

# Make database file writable
touch "$DATABASE_PATH"
chmod 666 "$DATABASE_PATH"

echo "Starting application with database at: $DATABASE_PATH"

# Start the application
npm start