# Open Frontier: Technical Architecture

**Version:** 0.1
**Status:** Phase 0 Implementation
**Date:** October 31, 2025

---

## Overview

This document describes the technical architecture for Open Frontier, covering:
- Project structure and organization
- Module boundaries and responsibilities
- Data flow and state management
- Client-server separation
- Build and development workflow

---

## Architecture Principles

### 1. Client-Server Separation (Day One)

Even for Phase 0 single-player, we maintain strict client-server boundaries:

**Benefits:**
- Seamless transition to multiplayer (Phase 3+)
- Clear separation of concerns
- Server validates all game logic (prevents cheating later)
- Can test server logic independently

**Implementation:**
- Client runs in browser (Vite dev server)
- Server runs as Node.js process (localhost:3000)
- Communication via REST API (Phase 0) and WebSocket (Phase 3+)
- Both written in TypeScript, share type definitions

### 2. Data-Driven Everything

All game content defined in JSON files:
- Ships, stations, planets, trade goods, missions
- Loaded by server at startup
- Validated against schemas
- Hot-reloadable during development

### 3. Modular Design

Each system is self-contained with clear interfaces:
- Physics engine (Newtonian mechanics, collision)
- Rendering engine (Three.js wrapper)
- Input handling (keyboard, mouse)
- HUD/UI system (HTML/Canvas overlay)
- Network layer (client-server communication)

### 4. Type Safety

TypeScript throughout with:
- Strict mode enabled
- Shared types between client and server
- No `any` types (except for external library integration)
- Runtime validation at API boundaries

---

## Project Structure

```
open-frontier/
├── client/                    # Browser-based client
│   ├── src/
│   │   ├── main.ts           # Entry point
│   │   ├── core/             # Core client systems
│   │   │   ├── game.ts       # Main game loop
│   │   │   ├── renderer.ts   # Three.js rendering
│   │   │   ├── input.ts      # Input handling
│   │   │   └── audio.ts      # Audio system
│   │   ├── systems/          # Game systems (client-side)
│   │   │   ├── camera.ts     # Camera controller
│   │   │   ├── controls.ts   # Ship controls
│   │   │   └── hud.ts        # HUD rendering
│   │   ├── rendering/        # Rendering subsystems
│   │   │   ├── planet.ts     # Planet rendering
│   │   │   ├── starfield.ts  # Starfield rendering
│   │   │   ├── station.ts    # Station rendering
│   │   │   └── ship.ts       # Ship rendering
│   │   ├── ui/               # UI components
│   │   │   ├── menus/        # Menu screens
│   │   │   ├── hud/          # HUD elements
│   │   │   └── components/   # Reusable UI components
│   │   ├── network/          # Client networking
│   │   │   ├── api.ts        # REST API client
│   │   │   └── websocket.ts  # WebSocket client (Phase 3+)
│   │   ├── state/            # Client state management
│   │   │   ├── gameState.ts  # Game state
│   │   │   └── uiState.ts    # UI state
│   │   └── utils/            # Utilities
│   │       ├── math.ts       # Math helpers
│   │       ├── geometry.ts   # Geometry utilities
│   │       └── logger.ts     # Logging
│   ├── public/               # Static assets
│   │   ├── fonts/            # Terminal fonts
│   │   └── audio/            # Sound effects
│   ├── index.html            # Entry HTML
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                    # Node.js server
│   ├── src/
│   │   ├── main.ts           # Entry point
│   │   ├── core/             # Core server systems
│   │   │   ├── server.ts     # Express server setup
│   │   │   ├── gameLoop.ts   # Server game loop
│   │   │   └── database.ts   # Database (SQLite)
│   │   ├── systems/          # Game systems (server-side)
│   │   │   ├── physics.ts    # Physics simulation
│   │   │   ├── economy.ts    # Economic simulation
│   │   │   ├── missions.ts   # Mission generation
│   │   │   └── docking.ts    # Docking validation
│   │   ├── entities/         # Entity management
│   │   │   ├── ship.ts       # Ship entity
│   │   │   ├── station.ts    # Station entity
│   │   │   ├── planet.ts     # Planet entity
│   │   │   └── player.ts     # Player entity
│   │   ├── data/             # Data loading
│   │   │   ├── loader.ts     # JSON data loader
│   │   │   └── validator.ts  # Schema validation
│   │   ├── api/              # REST API routes
│   │   │   ├── game.ts       # Game state endpoints
│   │   │   ├── market.ts     # Market endpoints
│   │   │   ├── missions.ts   # Mission endpoints
│   │   │   └── auth.ts       # Auth (Phase 2+)
│   │   └── utils/            # Utilities
│   │       ├── math.ts       # Math helpers
│   │       ├── time.ts       # Time utilities
│   │       └── logger.ts     # Logging
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json          # Dev hot-reload config
│
├── shared/                    # Shared code (types, constants)
│   ├── src/
│   │   ├── types/            # Shared TypeScript types
│   │   │   ├── ship.ts       # Ship types
│   │   │   ├── station.ts    # Station types
│   │   │   ├── planet.ts     # Planet types
│   │   │   ├── physics.ts    # Physics types
│   │   │   ├── economy.ts    # Economy types
│   │   │   └── api.ts        # API request/response types
│   │   ├── constants/        # Shared constants
│   │   │   ├── physics.ts    # Physics constants (G, c, etc.)
│   │   │   └── game.ts       # Game constants
│   │   └── utils/            # Shared utilities
│   │       └── vector.ts     # Vector3 operations
│   ├── package.json
│   └── tsconfig.json
│
├── data/                      # Game data (JSON files)
│   ├── ships/
│   │   └── shuttle_type4.json
│   ├── stations/
│   │   └── earth_station_alpha.json
│   ├── planets/
│   │   ├── earth.json
│   │   └── moon.json
│   ├── stars/
│   │   └── hipparcos_visible.json
│   ├── trade-goods/
│   │   ├── water.json
│   │   ├── oxygen.json
│   │   └── fuel.json
│   ├── models/              # 3D model definitions (JSON)
│   │   ├── ships/
│   │   │   └── shuttle_type4_model.json
│   │   ├── stations/
│   │   │   └── ring_habitat_large.json
│   │   └── planets/
│   │       └── (procedurally generated)
│   └── schemas/             # JSON schemas for validation
│       ├── ship.schema.json
│       ├── station.schema.json
│       └── planet.schema.json
│
├── docs/                      # Documentation
│   ├── OPEN_FRONTIER_DESIGN.md
│   ├── ARCHITECTURE.md       # This file
│   └── systems/
│       ├── PHYSICS.md
│       ├── ECONOMY.md
│       └── ...
│
├── tests/                     # Tests (Phase 1+)
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # End-to-end tests
│
├── scripts/                   # Build and utility scripts
│   ├── start-dev.sh          # Start both client and server
│   ├── build.sh              # Production build
│   └── validate-data.ts      # Validate all JSON data
│
├── .gitignore
├── .eslintrc.json
├── .prettierrc.json
├── package.json              # Root package.json (workspace)
└── README.md
```

---

## Module Architecture

### Client Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    UI Layer (HTML/CSS)                │  │
│  │  - Menus (station, market, missions)                  │  │
│  │  - HUD overlays (Canvas 2D)                           │  │
│  │  - Notifications                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ▲                                  │
│                            │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Core Game Loop                       │  │
│  │  - requestAnimationFrame                              │  │
│  │  - Update (process input, update state)               │  │
│  │  - Render (Three.js scene)                            │  │
│  └───────────────────────────────────────────────────────┘  │
│       ▲              ▲                ▲                       │
│       │              │                │                       │
│  ┌────┴────┐    ┌───┴─────┐    ┌────┴─────┐                │
│  │ Input   │    │Rendering│    │ Network  │                │
│  │ System  │    │ Engine  │    │ Client   │                │
│  └─────────┘    └─────────┘    └──────────┘                │
│       │              │                │                       │
│       └──────────────┴────────────────┘                      │
│                      │                                        │
│                      ▼                                        │
│              ┌──────────────┐                                │
│              │ Client State │                                │
│              └──────────────┘                                │
│                      │                                        │
└──────────────────────┼────────────────────────────────────────┘
                       │ HTTP/WS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVER (Node.js)                        │
└─────────────────────────────────────────────────────────────┘
```

### Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Server                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  REST API (Express)                    │  │
│  │  /api/game/state                                       │  │
│  │  /api/game/action                                      │  │
│  │  /api/market/:station                                  │  │
│  │  /api/missions/:station                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ▲                                  │
│                            │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Server Game Loop (10 Hz)                  │  │
│  │  - Physics simulation                                  │  │
│  │  - Economic simulation                                 │  │
│  │  - Mission generation                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│       ▲              ▲                ▲                       │
│       │              │                │                       │
│  ┌────┴────┐    ┌───┴─────┐    ┌────┴─────┐                │
│  │Physics  │    │ Economy │    │ Missions │                │
│  │ System  │    │ System  │    │ System   │                │
│  └─────────┘    └─────────┘    └──────────┘                │
│       │              │                │                       │
│       └──────────────┴────────────────┘                      │
│                      │                                        │
│                      ▼                                        │
│              ┌──────────────┐                                │
│              │ Game State   │                                │
│              │ (In-Memory)  │                                │
│              └──────────────┘                                │
│                      │                                        │
│                      ▼                                        │
│              ┌──────────────┐                                │
│              │  Database    │                                │
│              │  (SQLite)    │                                │
│              └──────────────┘                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## System Boundaries

### Physics System

**Responsibility:** Simulate all movement and collisions

**Inputs:**
- Ship thrust commands
- Current positions/velocities
- Gravity sources (planets, stars)

**Outputs:**
- Updated positions/velocities
- Collision events
- Fuel consumption

**Location:** `server/src/systems/physics.ts`

**Key Classes:**
- `PhysicsEngine` - Main physics loop
- `RigidBody` - Physical entity (ship, station)
- `CollisionDetector` - Collision detection

### Rendering System

**Responsibility:** Render 3D scene using Three.js

**Inputs:**
- Game state (positions, rotations)
- Camera configuration
- Player ship data

**Outputs:**
- Rendered frame to canvas
- Visual effects (thrusters, explosions)

**Location:** `client/src/core/renderer.ts`

**Key Classes:**
- `Renderer` - Main rendering loop
- `PlanetRenderer` - Planet geometry/materials
- `StationRenderer` - Station geometry/materials
- `StarfieldRenderer` - Starfield points

### Economy System

**Responsibility:** Simulate station production/consumption, prices

**Inputs:**
- Station configurations (production rates)
- Player trades
- Droid logistics

**Outputs:**
- Updated station inventories
- Market prices
- Mission generation triggers

**Location:** `server/src/systems/economy.ts`

**Key Classes:**
- `EconomySimulator` - Main economy loop
- `Station` - Station entity with inventory
- `Market` - Price calculation
- `DroidRoute` - Automated supply route

### HUD System

**Responsibility:** Display flight information and UI

**Inputs:**
- Game state (velocity, fuel, position)
- Player ship state
- Target information

**Outputs:**
- HUD overlays (Canvas 2D)
- Warnings and notifications

**Location:** `client/src/systems/hud.ts`

**Key Classes:**
- `HUD` - Main HUD controller
- `FlightHUD` - Flight info display
- `DockingHUD` - Docking alignment display
- `NotificationManager` - Toast notifications

---

## Data Flow

### Client → Server (Player Actions)

```typescript
// Example: Player thrusts forward

// 1. Client detects input
input.isKeyPressed('KeyW') // true

// 2. Client sends action to server
POST /api/game/action
{
  "action": "thrust",
  "direction": [0, 0, -1], // Forward in ship space
  "magnitude": 1.0
}

// 3. Server validates and applies
const ship = gameState.getPlayerShip(playerId);
ship.applyThrust(direction, magnitude, dt);

// 4. Server responds with updated state
{
  "ship": {
    "position": {...},
    "velocity": {...},
    "fuel": 998
  }
}

// 5. Client updates local state
gameState.updateShip(response.ship);

// 6. Client renders new state
renderer.render(gameState);
```

### Server → Client (State Updates)

```typescript
// Example: Station inventory changes (automatic)

// 1. Server economy tick
economySystem.tick(dt);

// 2. Station consumes oxygen
station.consume('oxygen', 0.5); // 0.5 units this tick

// 3. Price recalculated
market.updatePrice('oxygen', station);

// 4. Client polls for updates
GET /api/market/earth_station_alpha

// 5. Server responds with current state
{
  "inventory": {
    "oxygen": 849.5
  },
  "prices": {
    "oxygen": {
      "buy": 105,
      "sell": 100
    }
  }
}

// 6. Client updates UI
marketUI.refresh(marketData);
```

---

## State Management

### Client State

**In-Memory Only (No Persistence in Phase 0):**

```typescript
interface ClientGameState {
  // Camera
  cameraMode: 'cockpit' | 'drone';
  cameraPosition: Vector3;
  cameraTarget: Vector3;

  // Player ship (local prediction)
  ship: {
    position: Position;
    velocity: Vector3;
    rotation: Quaternion;
    fuel: number;
    hull: number;
    cargo: Record<string, number>;
  };

  // Environment (from server)
  nearbyObjects: {
    planets: Planet[];
    stations: Station[];
    // Other ships (Phase 2+)
  };

  // Navigation
  target: string | null; // Target ID
  targetInfo: {
    distance: number;
    eta: number;
  } | null;

  // UI state
  docked: boolean;
  dockedAt: string | null;
  currentMenu: MenuState;
}
```

**Update Strategy:**
- **Prediction:** Client predicts ship movement locally
- **Reconciliation:** Server sends authoritative state periodically
- **Correction:** Client smoothly corrects prediction errors

### Server State

**In-Memory Game State:**

```typescript
interface ServerGameState {
  // Time
  currentTime: Date;
  tickRate: number; // 10 Hz

  // Entities
  players: Map<string, Player>;
  ships: Map<string, Ship>;
  stations: Map<string, Station>;
  planets: Map<string, Planet>;

  // Systems
  physics: PhysicsEngine;
  economy: EconomySimulator;
  missions: MissionGenerator;

  // Droid logistics
  droidRoutes: DroidRoute[];
}
```

**Persistence (SQLite):**
- Player accounts (Phase 2+)
- Ship ownership
- Credits and cargo
- Mission progress
- Station inventories (checkpointed)

---

## API Design

### RESTful Endpoints (Phase 0)

```typescript
// Get current game state
GET /api/game/state
Response: {
  time: Date;
  ship: ShipState;
  nearbyObjects: Entity[];
}

// Submit player action
POST /api/game/action
Request: {
  action: 'thrust' | 'rotate' | 'dock' | ...;
  params: any;
}
Response: {
  success: boolean;
  state: GameState;
}

// Get market data
GET /api/market/:stationId
Response: {
  inventory: Record<string, number>;
  prices: Record<string, {buy: number, sell: number}>;
  trend: Record<string, 'up' | 'down' | 'stable'>;
}

// Buy/sell goods
POST /api/market/:stationId/trade
Request: {
  action: 'buy' | 'sell';
  good: string;
  quantity: number;
}
Response: {
  success: boolean;
  cost: number;
  newBalance: number;
  newCargo: Record<string, number>;
}

// Get available missions
GET /api/missions/:stationId
Response: {
  missions: Mission[];
}

// Accept mission
POST /api/missions/:stationId/accept
Request: {
  missionId: string;
}
Response: {
  success: boolean;
  mission: Mission;
}
```

### WebSocket Events (Phase 3+)

```typescript
// Real-time updates for multiplayer

// Server → Client
'ship:docked' - Another player docked
'market:updated' - Market prices changed
'chat:message' - Station chat message
'mission:completed' - Mission completed by someone

// Client → Server
'chat:send' - Send chat message
'ping' - Heartbeat
```

---

## Build and Development

### Development Workflow

**Terminal 1 - Server:**
```bash
cd server
npm run dev  # Runs nodemon (auto-restart on changes)
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev  # Runs Vite dev server with HMR
```

**Terminal 3 - Watch Shared Types:**
```bash
cd shared
npm run watch  # Recompile types on change
```

**Or use convenience script:**
```bash
./scripts/start-dev.sh  # Starts all three in parallel
```

### Production Build

```bash
npm run build  # Builds client and server
npm run start  # Runs production server (serves client bundle)
```

### Testing Strategy (Phase 1+)

**Unit Tests:**
- Physics calculations
- Price formulas
- Math utilities

**Integration Tests:**
- API endpoints
- Database operations
- Economy simulation

**End-to-End Tests:**
- Complete game loops
- Docking sequences
- Trading workflows

---

## Performance Targets

### Client

- **Frame Rate:** 60 FPS on 2020-era laptops
- **Input Lag:** <16ms (1 frame)
- **Load Time:** <5 seconds to playable
- **Memory:** <512 MB

### Server

- **Tick Rate:** 10 Hz (fixed timestep)
- **API Response:** <50ms (p95)
- **Memory:** <256 MB per player session
- **Concurrent Players:** 100+ (Phase 3+)

---

## Technology Stack

### Client
- **Framework:** Vite (dev server, HMR, bundling)
- **Language:** TypeScript 5.0+
- **Rendering:** Three.js r160+
- **UI:** HTML/CSS + Canvas 2D
- **HTTP:** Fetch API
- **WebSocket:** Native WebSocket API (Phase 3+)

### Server
- **Runtime:** Node.js 20+
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.0+
- **Database:** SQLite (better-sqlite3)
- **WebSocket:** ws library (Phase 3+)

### Shared
- **Language:** TypeScript 5.0+
- **Validation:** Zod (schema validation)

### Development Tools
- **Linting:** ESLint
- **Formatting:** Prettier
- **Testing:** Vitest (Phase 1+)
- **Version Control:** Git

---

## Deployment Strategy

### Phase 0-1 (Local Development)
- Client: Vite dev server (localhost:5173)
- Server: Node.js (localhost:3000)
- Database: SQLite file (local)

### Phase 2 (Single-Player Release)
- Electron wrapper (optional)
- Or: Static client + bundled Node server
- Distribute via itch.io or GitHub releases

### Phase 3+ (Multiplayer)
- Client: Static hosting (Vercel, Netlify)
- Server: VPS or cloud hosting (DigitalOcean, AWS)
- Database: PostgreSQL (cloud-hosted)
- CDN: Cloudflare (static assets)

---

## Security Considerations

### Phase 0 (Local Only)
- No authentication needed
- No input validation needed (trusted environment)

### Phase 3+ (Multiplayer)
- **Authentication:** JWT tokens
- **Authorization:** Role-based access control
- **Input Validation:** Zod schemas at API boundaries
- **Rate Limiting:** Express rate limiter
- **SQL Injection:** Parameterized queries (better-sqlite3)
- **XSS Prevention:** Content Security Policy

---

## Extensibility

### Mod Support (Phase 2+)

**Data Mods:**
- Replace/add JSON files in `/data`
- Server validates against schemas
- Hot-reload in development

**Code Mods:**
- Plugin system via dynamic imports
- Hooks for custom systems
- Sandboxed execution (future)

**Example Mod Structure:**
```
my-custom-ships/
├── mod.json          # Mod metadata
├── data/
│   ├── ships/
│   │   └── my_ship.json
│   └── models/
│       └── my_ship_model.json
└── README.md
```

---

## Conclusion

This architecture provides:
- **Separation:** Clear client-server boundaries
- **Modularity:** Self-contained systems
- **Type Safety:** TypeScript throughout
- **Data-Driven:** JSON configuration
- **Scalability:** Ready for multiplayer
- **Maintainability:** Well-organized code

The architecture is **simple enough for Phase 0** but **flexible enough for Phase 3+**. Start simple, add complexity only when needed.

---

**Status:** Complete. Ready for implementation.
