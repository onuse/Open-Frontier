# Open Frontier: Design Document

**Version:** 0.1  
**Date:** October 30, 2025  
**Status:** Pre-Production

---

## Vision Statement

Open Frontier is a reimagining of the classic space trading and exploration genre, inspired by Frontier: Elite II. It embraces **slow gaming** as a core mechanic—a game you check in on over days or weeks, not hours. Players navigate a persistent, simulated solar system at realistic scales, making meaningful decisions about trade, missions, and destinations, with manual docking as the primary skill challenge.

The "Open" in Open Frontier signifies extensibility: all game content (ships, systems, trade goods, missions, 3D models) exists as editable data files, enabling unlimited creativity and community contributions.

### Setting: The Automated Idiocrasy

Humanity vanished. Whether through exodus, catastrophe, or transcendence—the records are unclear. What remains is an elaborate clockwork of infrastructure: stations orbit planets, refineries process ore, fabricators produce goods, and slave droids execute centuries-old logistics protocols.

But the system is *stupid*. Droids follow predetermined routes regardless of efficiency. Markets accumulate surpluses in one location while shortages cripple another. The machinery works, but it doesn't *think*.

**You are among the few humans who remain** (or have returned, or have awakened from cryosleep—the exact circumstances are deliberately vague). The infrastructure recognizes your credentials and grants you access. A basic shuttle. Docking rights. Credit accounts that still function.

The galaxy doesn't need heroes. It needs **logistics**.

### Core Pillars

1. **Slow Gaming:** Real-time travel over days. Log in, make decisions, log out.
2. **Meaningful Decisions:** Every choice has weight—fuel, cargo, destination, risk.
3. **Diegetic Realism:** Camera drones instead of magical external views. Plausible in-universe explanations.
4. **Shared Solitude:** You never see other players in space. Only evidence of their existence—docking manifests, market fluctuations, chat at stations.
5. **Grounded Economy:** No NPCs. Only player agency and automated droid logistics. Opportunities exist because they're genuinely unfilled.
6. **Data-Driven Everything:** Ships, systems, economies—all JSON. Mod-friendly from day one.

---

## Narrative Framing

### The Vanishing

Humanity vanished approximately 100-150 years ago. The exact cause is unknown, deliberately ambiguous, and not central to gameplay. Theories exist in scattered data logs:
- Mass exodus to another star system via generation ships
- Transcendence event (technological singularity)
- Plague or environmental catastrophe
- Something stranger

What matters: **the infrastructure survived intact.** 

### The Machinery

Automated systems continue operating:
- **Refineries** process raw materials on predetermined schedules
- **Fabricators** produce goods using ancient manufacturing protocols
- **Slave droids** execute logistics routes programmed decades ago
- **Stations** maintain life support, docking systems, and market terminals
- **Communication networks** still function, accepting credentials from a bygone era

But the system is **stupid by design.** It was never meant to run unsupervised for this long. Droids follow obsolete routes. Markets accumulate surpluses while shortages cripple other locations. The machinery works, but doesn't *adapt*.

### The Player

**You are human.** How you came to be here is deliberately vague—choose your own interpretation:
- Survivor who hid during the vanishing
- Descendant of survivors
- Colonist returning from deep space
- Awakened from cryosleep
- Something else entirely

The system recognizes your biometric credentials. You have access to:
- A basic shuttle (docked at your starting station)
- Credit accounts that still function
- Docking rights at all automated stations
- Market terminals and trade interfaces

The galaxy doesn't need heroes or warriors. It needs **logistics**. It needs someone who can see the inefficiencies, exploit the opportunities, and maybe—just maybe—keep the whole thing from grinding to a halt.

### Why This Matters

This framing justifies the game mechanics:
- **No NPCs:** Because there aren't any humans left to compete with
- **Opportunities everywhere:** Because the automation is inefficient
- **Easy early profits:** Not because of "tutorial balance," but because human intelligence is genuinely scarce
- **Stations still function:** Because automated systems are robust
- **No quest givers:** The missions are system-generated needs, not narrative hooks
- **Shared solitude:** Because you're one of very few humans left

You're not playing a "trader character." You're playing **one of the last humans** trying to navigate a galaxy-sized Rube Goldberg machine that's been running on autopilot for a century.

---

## Game Loop

### Typical Session (20 minutes)

**At a Station:**
1. Review market prices and cargo
2. Buy/sell trade goods
3. Accept missions
4. Restock fuel and repair damage
5. Chat with other players (future feature)
6. Select destination
7. Launch

**During Docking Approach:**
1. Manual piloting using Newtonian physics
2. Match velocity with station
3. Align with docking port
4. Dock successfully (or crash and face consequences)

**In Deep Space:**
1. Check position, velocity, ETA
2. Optionally change course (costs fuel)
3. Monitor ship status
4. Contemplate the void
5. Log out and wait

The isolation is intentional. No random encounters, no NPCs, no events. Just you, your ship, and the mathematics of orbital mechanics. The *lack* of activity is part of the experience.

---

## Technical Architecture

### Philosophy

Design for **multi-user from day one**, but implement **single-player first**. This means client-server separation even for local play, allowing seamless transition to persistent multiplayer later.

### Stack

#### Client
- **Framework:** Three.js for 3D rendering
- **Language:** TypeScript
- **Build Tool:** Vite
- **Responsibilities:**
  - Rendering (ships, planets, stations, HUD)
  - Input handling (keyboard, mouse, future gamepad)
  - Camera management (cockpit view, camera drones)
  - API communication with server

#### Server
- **Runtime:** Node.js
- **Language:** TypeScript
- **Database:** SQLite (initial), PostgreSQL (production)
- **API:** REST initially, WebSockets for real-time when needed
- **Responsibilities:**
  - Game state (player positions, inventories, ship status)
  - Physics simulation (continuous tick)
  - Economic simulation (price fluctuations, NPC trading)
  - Mission generation and tracking
  - Authentication (future)

#### Data Layer
- **Format:** JSON files for all content
- **Structure:**
```
/data
  /ships          # Ship definitions (stats, models, costs)
  /systems        # Star systems (planets, stations, positions)
  /trade-goods    # Commodities (base prices, demand curves)
  /missions       # Mission templates
  /models         # 3D geometry definitions (simple polygons)
```

### Communication Protocol

**Single-Player (Phase 1):**
- Client connects to `localhost:3000`
- Server runs as local process
- State persists in local SQLite database

**Multi-User (Phase 2+):**
- Client connects to `openfrontier.server.com`
- Server runs continuously
- State persists in cloud database
- WebSocket for station chat and real-time events

---

## Core Systems

### 1. Physics System

**See [docs/systems/PHYSICS.md](docs/systems/PHYSICS.md) for detailed implementation.**

**Overview:**

**Newtonian Mechanics:**
- All movement follows F=ma
- No speed limits (except tachyon drive mechanics)
- Rotation and translation are independent
- Gravity wells affect trajectory

**Tachyon Drive:**
For FTL travel mechanics, see [docs/systems/FTL_DRIVE.md](docs/systems/FTL_DRIVE.md).

**Summary:**
- Speed multiplier increases with distance from gravity wells
- Formula: `multiplier = 1 + (max_multiplier - 1) × (1 - gravity_influence)`
- Allows FTL travel in deep space
- Automatically throttles near planets/stations

**Coordinate System:**
- Relative positioning to nearest significant body
- Player position stored as `{reference_body: "Earth", offset: {x, y, z}}`
- Prevents floating-point precision loss at AU scales
- Transform to absolute coordinates only for rendering

### 2. Time System

**Real-Time Simulation:**
- Server ticks continuously at fixed rate (10 Hz suggested)
- Player positions update based on velocity vectors
- Economy simulates even when no players online
- Mission deadlines progress in real-time

**Transit Times (Examples):**
- Earth to Moon: ~4 hours
- Earth to Mars: ~2-3 days (depending on orbital positions)
- Earth to Jupiter: ~1-2 weeks
- Earth to Neptune: ~1 month
- Sol to Alpha Centauri: ~4-6 months (with tachyon drive)

### 3. Docking System

**See [docs/systems/DOCKING.md](docs/systems/DOCKING.md) for detailed implementation.**

**Manual Docking as Core Gameplay:**

Docking is the primary skill challenge. Players must:
1. Approach station within safe velocity range
2. Match rotational velocity if station is rotating
3. Align ship with docking port (within tolerance)
4. Make contact at < 2 m/s relative velocity

**Consequences:**
- **Success:** Normal docking, access to station services
- **Minor collision:** Hull damage, repair costs
- **Major collision:** Ship destroyed, insurance claim (lose cargo)
- **Failed approach:** Waste fuel attempting again

**UI Assistance:**
- Velocity vector display
- Distance to station
- Relative velocity indicator
- Alignment guides (but no autopilot)

### 4. Economic System

**See [docs/systems/ECONOMY.md](docs/systems/ECONOMY.md) for detailed implementation.**

**No NPC Economy - Only Automation and Players**

The economic system is driven by two forces:
1. **Automated production/consumption:** Stations produce and consume goods at fixed rates
2. **Player trading:** Human intelligence exploiting inefficiencies

**There are no NPC traders.** No simulated competitors. No fake market actors. Just players and dumb automation.

**Station Production/Consumption:**
Each station has:
- **Production rates:** Goods generated per day (e.g., Mars Refinery produces 1000 units of fuel/day)
- **Consumption rates:** Goods consumed per day (e.g., Mars Station consumes 500 units of oxygen/day)
- **Storage capacity:** Maximum inventory (prevents infinite accumulation)

When storage fills, production slows or stops. When inventory depletes, prices rise.

**Droid Supply Routes:**
Predetermined automated routes established before humanity vanished. Droids are **predictable and inefficient:**
- They run on fixed schedules regardless of market conditions
- They don't optimize routes or cargo
- They don't respond to shortages or surpluses

This creates opportunities for players who can adapt and optimize.

**Price Calculation:**
```
price = base_price × supply_demand_ratio × distance_modifier
```

Where:
- `base_price`: Defined in trade good data file
- `supply_demand_ratio`: `(demand / supply)` at the station
- `distance_modifier`: Slight premium for remote stations

**No random fluctuation.** Prices are deterministic based on actual inventory and consumption.

### 5. Mission System

**See [docs/systems/MISSIONS.md](docs/systems/MISSIONS.md) for detailed implementation.**

**No Mission NPCs - Only Station Needs and Player Contracts**

Missions come from two sources:
1. **Automated station needs:** Generated when inventory shortages reach critical levels
2. **Player contracts:** Posted by other players (Phase 3+)

**Station-Generated Missions:**

When a station's critical inventory falls below a threshold, it automatically generates a delivery mission with rewards calculated based on urgency and market conditions.

**Mission Types (Phase 1):**

1. **Critical Delivery:** Station needs specific goods urgently
   - Auto-generated when inventory < 10% of capacity
   - Higher rewards for faster delivery (urgency multiplier)
   - Mission fails if deadline passes

2. **Bulk Transport:** Station needs large quantities (less urgent)
   - Auto-generated when inventory < 50% capacity
   - Lower per-unit reward but high total value
   - No strict deadline, just economic opportunity

**Player-Posted Contracts (Phase 3+):**

Players can post missions at stations with collateral system to prevent griefing:
- Contract poster must lock collateral (e.g., 50% of reward)
- Contractor completes mission and gets reward
- Collateral prevents fake missions and ensures good faith

### 6. Ship Systems

**Ship Definition (JSON):**
```json
{
  "id": "shuttle_basic",
  "name": "Type-4 Shuttle",
  "hull_points": 100,
  "cargo_capacity": 50,
  "fuel_capacity": 1000,
  "max_thrust": 50000,
  "mass": 5000,
  "cost": 100000,
  "model": "shuttle_basic.json"
}
```

**Ship State (Server):**
- Position (reference body + offset)
- Velocity vector
- Rotation (quaternion)
- Hull integrity
- Fuel remaining
- Cargo manifest
- Equipped modules (future)

### 7. Camera System

**Diegetic Camera Drones:**

Players don't have magical external views. Instead:
- Ships carry hundreds of disposable camera drones
- Launch drone for external view (costs nothing, functionally infinite)
- Drone maintains relative position/orientation to ship
- If drone collides with anything, it's destroyed (return to cockpit view)
- Future: drones could be untethered, fly independently

**Views:**
1. **Cockpit (default):** First-person, HUD overlays
2. **Drone External:** Third-person follow camera
3. **Drone Free:** (Future) Detached drone with independent controls

---

## Visual Design

### Art Direction

**Retro-Futuristic Minimalism:**
- Solid colored polygons (no textures)
- Low-poly geometric ships and stations
- Simplified planetary bodies (spheres with basic color/features)
- Inspired by 1990s polygon aesthetics, rendered with modern clarity

**Color Palette:**
- Ships: metallic grays, whites, industrial colors
- Planets: realistic colors (Earth blues, Mars reds)
- HUD: cyan/green monochrome terminal aesthetic
- Space: deep black with distant star points

**UI/HUD Style:**
- Retro terminal aesthetics
- Monospace fonts
- Minimal chrome
- Functional over decorative
- Scanlines and CRT effects (subtle, toggleable)

### 3D Models

**Ship Geometry:**
- 50-200 polygons per ship (rough target)
- Simple geometric forms (boxes, cylinders, cones)
- Defined in JSON as vertex arrays and face indices

**Example Ship Model (JSON):**
```json
{
  "vertices": [
    [0, 0, 10],
    [2, 0, -2],
    [-2, 0, -2],
    [0, 3, 0]
  ],
  "faces": [
    [0, 1, 2],
    [0, 1, 3],
    [1, 2, 3],
    [2, 0, 3]
  ],
  "colors": [
    "#CCCCCC",
    "#AAAAAA",
    "#888888",
    "#666666"
  ]
}
```

---

## Multiplayer Design

### Philosophy: Shared Solitude

**Players never see each other in space.** Not because of phasing or instancing, but because that's not the game. When you're in transit, you're alone. That's the point.

**Evidence of other players exists only at stations:**
- Docking manifests showing other ships
- Market prices affected by player trades
- Chat messages and conversations
- Mission board postings

You know others exist. You see their impact on the universe. You might chat with them at stations. But you never encounter them in the void.

**This is not a limitation—it's the design.** The loneliness of space is part of the experience. The relief of reaching a station and seeing other human activity is meaningful *because* of that isolation.

### No NPCs, Only Automation

**There are no NPC traders, passengers, or competitors.** The universe contains:
- **Players:** Human intelligence, capable of optimization and adaptation
- **Slave droids:** Simple automated systems following predetermined logic
- **Infrastructure:** Stations, refineries, factories that produce/consume goods on fixed schedules

**Why this matters:**
- The economy is *actually* player-driven, not simulated
- Profitable opportunities exist because they're genuinely unfilled
- No artificial difficulty scaling or rubber-banding
- New players aren't competing against fake entities
- The universe feels like an actual system, not a game

**Droid Logistics:**
Droids run basic supply routes established long ago:
- Earth Station → Mars Station: water and oxygen
- Mars Refinery → Jupiter Station: fuel
- Europa Ice Mine → Earth Station: volatiles

These routes are *inefficient* and *predictable*. They don't respond to market conditions. They don't optimize. This creates opportunities for human players who can adapt, speculate, and exploit inefficiencies.

### Anti-Griefing by Design

**Physical interaction is impossible** because players don't exist in the same space. You can't:
- Block docking ports (you're never in the same instance)
- Steal cargo (no physical contact)
- Sabotage ships (no direct interaction)
- Camp trade routes (no encounters in space)

**Station interactions are safe:**
- Trade is consensual (both players must agree)
- Chat has moderation tools (mute, report)
- Market manipulation is limited (droids provide baseline supply)

### Social Features (Phased)

**Phase 1 (Single-Player):**
- None, just prove the core loop works
- Droid logistics provide baseline economy

**Phase 2 (Soft Multi-User):**
- Docking manifests show other player ships at stations
- Shared market prices affected by all players
- Leaderboards (wealth, distance traveled, successful dockings)

**Phase 3 (Full Multi-User):**
- Station text chat
- Player-to-player trading (via station interface)
- Player-posted mission board (contract work)
- Persistent universe events (economic booms, shortages driven by player activity)

**Phase 4+ (Extended):**
- Mail system (delayed communication, fits the slow gaming theme)
- Player corporations (shared resources and goals)
- Player-owned stations (very long-term, possibly endgame content)

---

## Data-Driven Design

### Extensibility as Core Feature

Everything that defines the game world is in editable JSON files. This enables:
- Easy balancing without code changes
- Community mods and content packs
- Rapid iteration during development
- Player-created missions and trade routes (future)

### Data File Structure

```
/data
  /ships
    shuttle_basic.json
    freighter_heavy.json
    ...
  /systems
    sol_system.json
    alpha_centauri.json
    ...
  /stations
    earth_station_alpha.json
    mars_olympus.json
    ...
  /trade_goods
    water.json
    electronics.json
    ...
  /missions
    templates/
      cargo_delivery.json
      passenger_transport.json
      ...
  /models
    shuttle_basic_model.json
    station_ring_model.json
    ...
```

### Data Validation

- JSON Schema validation on load
- Server validates all data before accepting
- Client caches data locally for offline editing/modding
- Hot-reload support during development

---

## Development Roadmap

### Phase 0: Proof of Concept (2-4 weeks)

**Goal:** Validate core technical decisions and "feel"

**Deliverables:**
1. Three.js rendering of Earth and Moon at true scale
2. Single ship with Newtonian physics
3. Cockpit view with basic HUD (velocity, position, target)
4. Camera drone external view
5. Manual flight controls (WASD + mouse)
6. Simple target and approach mechanics
7. Basic docking with collision detection

**Success Criteria:**
- Smooth rendering at 60fps
- Docking feels challenging but fair
- Scale and physics feel "right"
- Architecture supports planned features

### Phase 1: Core Single-Player Loop (6-8 weeks)

**Goal:** Complete minimal viable single-player game

**Deliverables:**
1. Client-server architecture (local server)
2. Solar system with Earth, Moon, Mars, and stations
3. Complete docking system with feedback
4. Basic trade economy (buy/sell at stations)
5. Ship status (fuel, hull, cargo)
6. Simple mission system (cargo delivery)
7. Save/load game state
8. Tachyon drive for interplanetary travel
9. Data-driven ships and trade goods

**Success Criteria:**
- Can complete full trade loop: buy cargo → travel → dock → sell → profit
- Missions are completable and rewarding
- Game state persists across sessions
- Feels like a complete (if minimal) game

### Phase 2: Polish and Content (4-6 weeks)

**Goal:** Make Phase 1 feel polished and deep

**Deliverables:**
1. Expanded solar system (Jupiter, Saturn, their moons)
2. More ship types with different characteristics (cargo hauler, fast courier)
3. Station-generated missions (critical deliveries, bulk transport)
4. Droid supply routes (visible via market data/station logs)
5. Economic simulation (deterministic price fluctuations based on inventory)
6. Random ship events (equipment failures, fuel leaks—no encounters)
7. Improved HUD and UI design
8. Sound effects and ambient audio
9. Tutorial/onboarding flow

**Success Criteria:**
- Game has 20+ hours of content discovery
- Economic system feels alive and exploitable
- Players understand opportunities through market data
- "Feels like a real universe"

### Phase 3: Multi-User Foundation (6-8 weeks)

**Goal:** Deploy persistent server, enable multi-user

**Deliverables:**
1. Deploy server to cloud hosting
2. User authentication and accounts
3. Persistent world simulation
4. See other ships at stations
5. Shared economy (player actions affect prices)
6. Leaderboards
7. Basic anti-cheat measures

**Success Criteria:**
- Server runs stably for days without restarts
- Multiple users can play simultaneously
- Economy feels dynamic and responsive
- No major exploits or griefing possible

### Phase 4+: Social Features (Ongoing)

**Goal:** Build out social and community features

**Deliverables:**
1. Station text chat
2. Player-to-player trading
3. Player-created mission boards
4. Mail/messaging system
5. Corporations/guilds
6. Community events

**Success Criteria:**
- Players form communities
- Social features enhance rather than detract from core loop
- Moderation tools are effective

---

## Technical Considerations

### Floating-Point Precision at AU Scale

**Problem:** JavaScript uses 64-bit floats. At AU distances (billions of meters), precision degrades for small movements (sub-meter adjustments during docking).

**Solution:** Relative coordinate system
- All positions stored relative to nearest significant body
- Transform to absolute coordinates only for rendering
- Physics calculations in local space
- Camera position calculated relative to player ship

**Implementation:**
```typescript
interface Position {
  referenceBody: string;  // "Earth", "Moon", "Mars", etc.
  offset: Vector3;         // Meters from reference body
}

function toAbsolute(pos: Position): Vector3 {
  const bodyPos = getBodyPosition(pos.referenceBody);
  return bodyPos.add(pos.offset);
}

function toRelative(absolutePos: Vector3): Position {
  const nearestBody = findNearestBody(absolutePos);
  const offset = absolutePos.subtract(nearestBody.position);
  return { referenceBody: nearestBody.id, offset };
}
```

### Rendering Performance

**Targets:**
- 60fps on modest hardware (2020-era laptops)
- Sub-100ms frame times consistently
- Fast initial load (<5 seconds to playable)

**Optimizations:**
- Simple polygon models (low vertex count)
- No textures (solid colors only)
- Frustum culling (don't render off-screen objects)
- LOD system for distant objects (future)
- Instancing for repeated geometry (stars, asteroids)

### Save State Management

**What to Save:**
- Player ship state (position, velocity, rotation, fuel, hull, cargo)
- Missions in progress
- Visited locations
- Credits and reputation
- Game time elapsed

**Format:** JSON serialization to SQLite BLOB
**Frequency:** Auto-save every 5 minutes, save on dock, save on exit

### Network Protocol (Phase 3+)

**API Endpoints:**
- `POST /api/auth/login` - Authenticate user
- `GET /api/game/state` - Get current game state
- `POST /api/game/action` - Submit player action (launch, dock, trade)
- `GET /api/market/:station` - Get market prices
- `GET /api/missions/:station` - Get available missions
- `WebSocket /api/realtime` - Real-time updates (other ships, chat)

**Synchronization Strategy:**
- Client polls state every 1-5 seconds (depending on context)
- Server broadcasts events via WebSocket (optional optimization)
- Optimistic client prediction for input responsiveness
- Server authoritative for all state

---

## Risk Assessment

### High-Risk Areas

1. **Floating-point precision:** Relative coordinates should solve this, but needs early validation
2. **Docking feel:** Hard to get right. Needs extensive playtesting and iteration
3. **Economy balance:** Player-driven economy is complex. Needs simulation and tuning
4. **Scope creep:** Feature list can grow infinitely. Stick to roadmap

### Medium-Risk Areas

1. **Server costs:** Continuous simulation costs compute. Plan for scaling or optimize tick rate
2. **Player retention:** Slow gaming is niche. Needs clear communication and onboarding
3. **Content creation:** Handcrafting solar systems is tedious. Tooling and templates help

### Low-Risk Areas

1. **Graphics:** Simple polygons are well within Three.js capabilities
2. **Input handling:** Standard controls, no exotic requirements
3. **Data format:** JSON is universal and well-supported

---

## Open Questions

1. **Death mechanics:** What happens if you run out of fuel in deep space? Auto-distress beacon? Insurance? Ship recovery fee? Permadeath?
2. **Starting resources:** How much money and what ship does a new player start with? Which station?
3. **Droid route visibility:** Can players see droid delivery schedules? Should this be discoverable or transparent?
4. **Contraband:** How to handle illegal goods without NPCs? Station automation flags contraband and impounds it? Reputation loss?
5. **Station authority:** Do stations have automated security? What happens if you violate docking protocols or crash into a station?
6. **Communication delays:** Should messages/chat have realistic light-speed delays between stations? (Flavor vs. UX tradeoff)
7. **Endgame:** What does "winning" look like? Is there a goal (restore human civilization?), or pure sandbox?
8. **Player interdependence:** Should certain goods require player cooperation? (e.g., massive cargo only movable by multiple small ships?)
9. **Exploration content:** What do players find when exploring empty space? Derelicts? Ancient probes? Or just nothing (which might be fine)?

---

## Conclusion

Open Frontier is an ambitious but achievable project. By focusing on **slow gaming**, **meaningful decisions**, and **data-driven extensibility**, we create a unique space that doesn't compete directly with action-heavy space sims.

The phased roadmap allows us to validate core concepts early (Phase 0), build a complete single-player experience (Phase 1-2), and only then expand to multi-user features (Phase 3+).

The key to success is **discipline**: stick to the roadmap, resist feature creep, and validate each phase before moving to the next.

---

**Next Steps:**
1. Set up repository structure
2. Initialize Vite + TypeScript + Three.js project
3. Implement Phase 0 proof of concept
4. Playtest and iterate on docking feel
5. If successful, proceed to Phase 1

Let's build something special.
