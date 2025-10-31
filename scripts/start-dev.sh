#!/bin/bash

# Open Frontier - Development Startup Script
# Starts all services in parallel using concurrently

echo "Starting Open Frontier development environment..."
echo "Phase 0: Proof of Concept"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "Dependencies not installed. Running npm install..."
  npm install
fi

# Check if shared types are built
if [ ! -d "shared/dist" ]; then
  echo "Building shared types..."
  npm run build --workspace=shared
fi

# Start all services
echo ""
echo "Starting services..."
echo "  - Client:  http://localhost:5173"
echo "  - Server:  http://localhost:3000"
echo "  - Shared:  Watching for changes..."
echo ""

npm run dev
