# Open Frontier - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.0.0 or higher
- **npm** 10.0.0 or higher
- **Git** (for version control)

### Checking Your Environment

```bash
node --version   # Should be >= 20.0.0
npm --version    # Should be >= 10.0.0
```

## Initial Setup

### 1. Install Dependencies

From the project root directory:

```bash
npm install
```

This will install dependencies for all workspaces (client, server, shared) using npm workspaces.

### 2. Build Shared Types

The shared package must be built before starting development:

```bash
npm run build --workspace=shared
```

This compiles the TypeScript types that are used by both client and server.

## Development

### Starting the Development Environment

**Recommended: Use the startup script**

```bash
# On Windows
scripts\start-dev.bat

# On macOS/Linux
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

**Or manually start all services:**

```bash
npm run dev
```

This will start:
- **Client** on http://localhost:5173 (Vite dev server with HMR)
- **Server** on http://localhost:3000 (Node.js with auto-restart)
- **Shared** type compiler in watch mode

### Accessing the Application

- Open your browser to http://localhost:5173
- The client will automatically proxy API requests to the server at http://localhost:3000

### Development Workflow

1. **Make changes** to client, server, or shared code
2. **Client changes** hot-reload automatically (Vite HMR)
3. **Server changes** restart the server automatically (nodemon)
4. **Shared type changes** recompile automatically and trigger dependent restarts

## Project Structure

```
open-frontier/
├── client/          # Frontend (Vite + Three.js + TypeScript)
│   ├── src/         # Source code
│   ├── public/      # Static assets
│   └── index.html   # Entry HTML
├── server/          # Backend (Node.js + Express + TypeScript)
│   └── src/         # Source code
├── shared/          # Shared types and utilities
│   └── src/         # Source code
├── data/            # Game data (JSON files)
├── docs/            # Documentation
└── scripts/         # Utility scripts
```

## Common Tasks

### Running Individual Services

```bash
# Client only
npm run dev:client

# Server only
npm run dev:server

# Shared types watch mode
npm run dev:shared
```

### Building for Production

```bash
# Build all packages
npm run build

# Start production server (serves client bundle)
npm run start
```

### Linting and Formatting

```bash
# Lint all code
npm run lint

# Format all code
npm run format
```

### Validating Data Files

```bash
# Validate all JSON data files against schemas
npm run validate-data
```

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

**Server port:** Edit `shared/src/constants/game.ts` and change `SERVER_PORT`

**Client port:** Edit `client/vite.config.ts` and change `server.port`

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### TypeScript Errors in IDE

```bash
# Rebuild shared types
npm run build --workspace=shared

# Restart your IDE/editor
```

### Module Not Found Errors

Ensure shared types are built:

```bash
npm run build --workspace=shared
```

### Server Won't Start

Check if the server port (3000) is available:

```bash
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000
```

## IDE Setup

### VS Code (Recommended)

Install recommended extensions:
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar) - for TypeScript support

**Workspace settings** (.vscode/settings.json):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.workingDirectories": ["client", "server", "shared"],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### WebStorm/IntelliJ IDEA

1. Open project
2. Enable TypeScript support
3. Configure ESLint and Prettier
4. Mark `client/src`, `server/src`, `shared/src` as source roots

## Next Steps

Once your development environment is running:

1. **Check the server** is responding: http://localhost:3000/health
2. **Open the client**: http://localhost:5173
3. **Review the architecture**: [docs/ARCHITECTURE.md](ARCHITECTURE.md)
4. **Read the design docs**: [docs/OPEN_FRONTIER_DESIGN.md](OPEN_FRONTIER_DESIGN.md)
5. **Start implementing Phase 0** features

## Getting Help

- **Documentation**: See `/docs` directory
- **Issues**: Report bugs or request features (GitHub Issues when available)
- **Design Questions**: Refer to design documents in `/docs/systems/`

---

**Happy coding! Let's build something special.**
