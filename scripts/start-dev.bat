@echo off
REM Open Frontier - Development Startup Script (Windows)
REM Starts all services in parallel using concurrently

echo Starting Open Frontier development environment...
echo Phase 0: Proof of Concept
echo.

REM Check if dependencies are installed
if not exist "node_modules\" (
  echo Dependencies not installed. Running npm install...
  call npm install
)

REM Check if shared types are built
if not exist "shared\dist\" (
  echo Building shared types...
  call npm run build --workspace=shared
)

REM Start all services
echo.
echo Starting services...
echo   - Client:  http://localhost:5173
echo   - Server:  http://localhost:3000
echo   - Shared:  Watching for changes...
echo.

call npm run dev
