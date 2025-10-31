# Open Frontier

A space trading and exploration game inspired by Frontier: Elite II, embracing **slow gaming** as a core mechanic.

## Vision

Open Frontier is a reimagining of the classic space trading genre. Navigate a persistent, simulated solar system at realistic scales, making meaningful decisions about trade, missions, and destinations, with manual docking as the primary skill challenge.

**The "Open" in Open Frontier signifies extensibility:** All game content (ships, systems, trade goods, missions, 3D models) exists as editable data files, enabling unlimited creativity and community contributions.

## Setting: The Automated Idiocrasy

Humanity vanished. What remains is an elaborate clockwork of infrastructure: stations orbit planets, refineries process ore, fabricators produce goods, and slave droids execute centuries-old logistics protocols.

But the system is *stupid*. Droids follow predetermined routes regardless of efficiency. Markets accumulate surpluses in one location while shortages cripple another.

**You are among the few humans who remain.** The galaxy doesn't need heroes—it needs **logistics**.

## Core Pillars

1. **Slow Gaming:** Real-time travel over days. Log in, make decisions, log out.
2. **Meaningful Decisions:** Every choice has weight—fuel, cargo, destination, risk.
3. **Diegetic Realism:** Camera drones instead of magical external views. Plausible in-universe explanations.
4. **Shared Solitude:** You never see other players in space. Only evidence of their existence.
5. **Grounded Economy:** No NPCs. Only player agency and automated droid logistics.
6. **Data-Driven Everything:** Ships, systems, economies—all JSON. Mod-friendly from day one.

## Project Status

**Phase 0: Proof of Concept** (Current)

Building the core gameplay loop:
- Three.js rendering of Earth, Moon, and station
- Newtonian physics with tachyon drive
- Manual docking mechanics
- Basic HUD and controls

## Tech Stack

### Client
- **Framework:** Vite + TypeScript
- **Rendering:** Three.js
- **UI:** HTML/CSS + Canvas 2D

### Server
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** SQLite (Phase 0-1)

### Shared
- **Language:** TypeScript
- **Validation:** Zod

## Project Structure

```
open-frontier/
├── client/       # Browser client (Vite + Three.js)
├── server/       # Node.js server (Express + SQLite)
├── shared/       # Shared types and utilities
├── data/         # Game data (JSON files)
├── docs/         # Documentation
└── scripts/      # Build and utility scripts
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Install dependencies for all workspaces
npm install

# Build shared types first
npm run build --workspace=shared
```

### Development

```bash
# Start all services in parallel (recommended)
npm run dev

# Or start individually:
npm run dev:client    # Client on http://localhost:5173
npm run dev:server    # Server on http://localhost:3000
npm run dev:shared    # Watch shared types
```

### Building for Production

```bash
npm run build        # Build all packages
npm run start        # Start production server
```

## Documentation

- [Design Document](docs/OPEN_FRONTIER_DESIGN.md) - Overall vision and design
- [Architecture](docs/ARCHITECTURE.md) - Technical architecture
- [Systems Documentation](docs/systems/) - Individual system specs
  - [Physics](docs/systems/PHYSICS.md)
  - [FTL Drive](docs/systems/FTL_DRIVE.md)
  - [Planets](docs/systems/PLANETS.md)
  - [Starfield](docs/systems/STARFIELD.md)
  - [Docking](docs/systems/DOCKING.md)
  - [Ships](docs/systems/SHIPS.md)
  - [Stations](docs/systems/STATIONS.md)
  - [Economy](docs/systems/ECONOMY.md)
  - [Missions](docs/systems/MISSIONS.md)
  - [HUD](docs/systems/HUD.md)
  - [Controls](docs/systems/CONTROLS.md)

## Development Roadmap

### Phase 0: Proof of Concept (2-4 weeks)
- [x] Documentation complete
- [x] Project structure scaffolded
- [ ] Basic rendering (Earth, Moon, station)
- [ ] Newtonian physics
- [ ] Manual docking
- [ ] Basic HUD and controls

### Phase 1: Core Single-Player Loop (6-8 weeks)
- [ ] Complete docking system
- [ ] Trade economy
- [ ] Mission system
- [ ] Save/load
- [ ] Tachyon drive
- [ ] Multiple ships

### Phase 2: Polish and Content (4-6 weeks)
- [ ] Expanded solar system
- [ ] More ship types
- [ ] Economic simulation
- [ ] Sound effects
- [ ] Tutorial

### Phase 3+: Multi-User Foundation
- [ ] Server deployment
- [ ] User authentication
- [ ] Persistent world
- [ ] Station chat
- [ ] Player contracts

## Contributing

Open Frontier is currently in early development. Contribution guidelines will be added in Phase 1.

## License

MIT License - See LICENSE file for details

## Credits

Inspired by Frontier: Elite II (1993) by David Braben

---

**Status:** Phase 0 - Pre-Production
**Version:** 0.1.0
**Last Updated:** October 31, 2025
