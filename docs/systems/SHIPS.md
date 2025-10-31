# Ship System

**Version:** 0.1  
**Status:** Design Phase

---

## Overview

Ships are the player's primary interface with the game world. Everything you do—traveling, trading, docking—happens through your ship. Ships are **data-driven entities** defined in JSON files, with stats, 3D models, and gameplay characteristics.

This document covers:
- Ship variants and roles
- Ship statistics and definitions
- Upgrade and modification system
- Purchase and insurance mechanics
- Damage model
- Fuel consumption
- 3D model specifications

---

## Design Philosophy

**Ships should feel different:**
- Shuttle: nimble, small cargo, good for short hauls
- Freighter: slow, massive cargo, expensive to run
- Courier: fast, minimal cargo, specialized for time-sensitive missions

**No arbitrary progression:**
- Bigger isn't always better
- Different ships for different jobs
- Player chooses based on playstyle and goals

**Visual coherence:**
- Same low-poly aesthetic as planets
- 50-200 triangles per ship
- Simple geometric forms
- Vertex colors, no textures

---

## Ship Variants

### Phase 0: Single Ship

**Type-4 Shuttle (Starter Ship)**
- Role: General purpose light transport
- Cargo: 50 units
- Fuel: 1000 units
- Speed: Medium acceleration
- Cost: 100,000 credits (starting ship, free)

### Phase 1: Core Fleet

**Type-4 Shuttle**
- Role: Starter/general purpose
- Cargo: 50 units
- Best for: Short hauls, learning the game

**Hauler-9 Freighter**
- Role: Bulk cargo transport
- Cargo: 500 units
- Best for: Long-distance bulk trading
- Tradeoff: Slow, expensive fuel consumption

**Swift Courier**
- Role: Fast delivery
- Cargo: 20 units
- Best for: Time-sensitive missions, passenger transport
- Tradeoff: Minimal cargo, high fuel consumption

### Phase 2+: Specialized Ships

**Prospector Mining Ship**
- Role: Resource extraction
- Cargo: 200 units (specialized for raw materials)
- Equipment: Mining laser, ore refinery
- Best for: Asteroid mining

**Explorer Survey Ship**
- Role: Long-range exploration
- Cargo: 100 units
- Equipment: Advanced sensors, extended fuel tanks
- Best for: Interstellar travel, discovering new systems

**Luxury Yacht**
- Role: Passenger transport
- Cargo: 10 units (mostly passenger cabins)
- Best for: High-value passenger missions
- Tradeoff: Expensive, low cargo

---

## Ship Statistics

### Core Stats

Every ship has these fundamental properties:

```typescript
interface ShipStats {
  // Identity
  id: string;
  name: string;
  manufacturer: string;
  description: string;
  
  // Physical
  mass_kg: number;              // Empty mass (affects acceleration)
  cargo_capacity_units: number; // Max cargo
  cargo_mass_per_unit: number;  // kg per cargo unit (typically 1000)
  
  // Propulsion
  max_thrust_newtons: number;   // Engine power
  fuel_capacity_units: number;  // Max fuel
  fuel_consumption_rate: number; // Units per second at max thrust
  
  // Structure
  hull_integrity_max: number;   // Hit points
  hull_integrity_current: number;
  armor_rating: number;         // Damage reduction (future)
  
  // Economics
  base_price_credits: number;   // Purchase cost
  insurance_rate: number;       // Percentage of value per month
  repair_cost_per_hp: number;   // Credits per hull point repaired
  
  // Docking
  docking_size_class: string;   // "small", "medium", "large"
  
  // 3D Model
  model_file: string;           // Path to geometry JSON
}
```

### Derived Stats

Calculated from core stats:

```typescript
interface DerivedStats {
  // Performance
  acceleration_empty: number;      // m/s² with no cargo
  acceleration_loaded: number;     // m/s² with max cargo
  range_km: number;                // Distance on full tank
  
  // Economics
  cost_per_km: number;             // Fuel cost per kilometer
  cargo_efficiency: number;        // Cargo capacity / cost
}

function calculateDerivedStats(ship: ShipStats): DerivedStats {
  const empty_mass = ship.mass_kg;
  const loaded_mass = empty_mass + (ship.cargo_capacity_units * ship.cargo_mass_per_unit);
  
  return {
    acceleration_empty: ship.max_thrust_newtons / empty_mass,
    acceleration_loaded: ship.max_thrust_newtons / loaded_mass,
    range_km: calculateRange(ship),
    cost_per_km: calculateCostPerKm(ship),
    cargo_efficiency: ship.cargo_capacity_units / ship.base_price_credits
  };
}
```

---

## Ship Definitions (JSON)

### Example: Type-4 Shuttle

```json
{
  "id": "shuttle_type4",
  "name": "Type-4 Shuttle",
  "manufacturer": "Nakamura Dynamics",
  "description": "Reliable general-purpose light transport. The most common ship in human-occupied space before the vanishing.",
  
  "mass_kg": 5000,
  "cargo_capacity_units": 50,
  "cargo_mass_per_unit": 1000,
  
  "max_thrust_newtons": 50000,
  "fuel_capacity_units": 1000,
  "fuel_consumption_rate": 0.5,
  
  "hull_integrity_max": 100,
  "armor_rating": 1.0,
  
  "base_price_credits": 100000,
  "insurance_rate": 0.05,
  "repair_cost_per_hp": 500,
  
  "docking_size_class": "small",
  "model_file": "shuttle_type4.json"
}
```

### Example: Hauler-9 Freighter

```json
{
  "id": "freighter_hauler9",
  "name": "Hauler-9 Freighter",
  "manufacturer": "Titan Industrial",
  "description": "Heavy cargo hauler designed for bulk transport. Slow but efficient for large-scale trading operations.",
  
  "mass_kg": 50000,
  "cargo_capacity_units": 500,
  "cargo_mass_per_unit": 1000,
  
  "max_thrust_newtons": 200000,
  "fuel_capacity_units": 5000,
  "fuel_consumption_rate": 2.0,
  
  "hull_integrity_max": 300,
  "armor_rating": 2.0,
  
  "base_price_credits": 2500000,
  "insurance_rate": 0.03,
  "repair_cost_per_hp": 2000,
  
  "docking_size_class": "large",
  "model_file": "freighter_hauler9.json"
}
```

---

## Fuel Consumption

### Calculation

Fuel consumption is proportional to thrust usage:

```typescript
function calculateFuelConsumption(
  ship: ShipStats,
  thrust_percent: number,  // 0.0 to 1.0
  dt: number               // Delta time in seconds
): number {
  const consumption = ship.fuel_consumption_rate * thrust_percent * dt;
  return consumption;
}
```

**Example:**
- Ship with fuel_consumption_rate = 0.5 units/s
- Thrusting at 100% for 10 seconds
- Consumption = 0.5 × 1.0 × 10 = 5 units

### Tachyon Drive Fuel Cost

**Option A (recommended for Phase 0): Tachyon drive is free**
- Only Newtonian thrust consumes fuel
- Simplifies gameplay
- Encourages long-distance travel

**Option B (future): Tachyon drive has minimal cost**
```typescript
function calculateTachyonFuelConsumption(
  ship: ShipStats,
  multiplier: number,
  dt: number
): number {
  const base_cost = 0.001; // Very small
  return base_cost * (multiplier / 1000) * dt;
}
```

### Running Out of Fuel

**Consequences:**
- Cannot thrust (but can rotate)
- Drift at current velocity indefinitely
- Must be rescued or wait for fuel delivery

**Rescue options (Phase 2+):**
- AI rescue drone dispatched (takes real-time hours/days)
- Another player delivers fuel
- Self-destruct and respawn (lose cargo, keep credits)

---

## Damage Model

### Hull Integrity

Ships have hit points (hull integrity):
- Docking collisions cause damage
- Minor collision: proportional to impact velocity
- Major collision: instant destruction

```typescript
function calculateCollisionDamage(impact_velocity_mps: number): number {
  if (impact_velocity_mps < 2) return 0;  // Safe docking speed
  
  if (impact_velocity_mps < 5) {
    // Minor collision: linear damage
    return (impact_velocity_mps - 2) * 10;  // 0-30 damage
  } else if (impact_velocity_mps < 15) {
    // Moderate collision
    return 30 + (impact_velocity_mps - 5) * 20;  // 30-230 damage
  } else {
    // Major collision: destruction
    return 999999;
  }
}
```

### Damage Effects

**No damage (hull > 75%):**
- Ship functions normally

**Light damage (hull 50-75%):**
- Visual: Sparks, warning indicators
- Gameplay: None (yet)

**Moderate damage (hull 25-50%):**
- Thrust efficiency reduced by 25%
- Fuel consumption increased by 25%
- Warning klaxons

**Heavy damage (hull 0-25%):**
- Thrust efficiency reduced by 50%
- Fuel consumption increased by 50%
- Random system failures (future)
- Critical warnings

**Destroyed (hull = 0):**
- Ship explodes
- Insurance claim triggered
- Respawn at last docked station

### Repair

**At stations:**
- Cost: `damage × ship.repair_cost_per_hp`
- Instant repair (no waiting)

**Example:**
- Type-4 Shuttle damaged by 30 HP
- Repair cost: 30 × 500 = 15,000 credits

---

## Ship Purchase and Insurance

### Purchasing Ships

**At stations with shipyards:**
1. View available ships
2. See stats and comparison to current ship
3. Trade in current ship (70% of base value)
4. Pay difference

**Example:**
- Current ship: Type-4 Shuttle (base value 100k, trade-in 70k)
- New ship: Hauler-9 (base value 2.5M)
- Cost: 2.5M - 70k = 2.43M credits

### Insurance

**Monthly premiums:**
- Automatically deducted from credits
- Rate varies by ship (typically 3-5% of base value per month)
- Covers total loss only (not repairs)

**Insurance claim:**
- Ship destroyed → new ship spawned at last docked station
- Cargo lost (NOT covered)
- Credits preserved

**Without insurance:**
- Ship destroyed → game over (permadeath mode)
- OR respawn with starter shuttle and 10k credits (fresh start)

**Implementation note:** "Monthly" premium calculated as:
```typescript
const real_time_hours_per_game_month = 720; // 30 days × 24 hours
const premium_per_hour = (ship.base_price_credits × ship.insurance_rate) / real_time_hours_per_game_month;
```

---

## Ship Upgrades and Modifications

### Phase 0-1: No Upgrades

Ships are fixed. You buy a new ship for different capabilities.

**Rationale:**
- Simpler to implement and balance
- Encourages ship switching based on needs
- Avoids "best build" meta

### Phase 2+: Module System

**Upgrade slots:**
- Engine (thrust, fuel efficiency)
- Cargo hold (capacity, specialized storage)
- Hull (armor, integrity)
- Systems (sensors, autopilot quality)

**Example modules:**
```json
{
  "id": "engine_thrust_upgrade_mk2",
  "name": "Mk2 Thrust Upgrade",
  "slot": "engine",
  "effect": {
    "max_thrust_multiplier": 1.25
  },
  "cost": 50000,
  "compatible_ships": ["shuttle_type4", "courier_swift"]
}
```

**Installation:**
- Available at stations with fitting yards
- Instant installation (no waiting)
- Can swap modules freely (original equipment preserved)

---

## 3D Ship Models

### Geometry Specifications

**Triangle budget: 50-200 triangles per ship**

**Example: Type-4 Shuttle**
- Hull: Box with tapered nose (20 triangles)
- Wings: Two flat panels (8 triangles)
- Engine nacelles: Two cylinders (32 triangles)
- Cockpit: Inset detail (10 triangles)
- **Total: ~70 triangles**

### Model Format (JSON)

```json
{
  "name": "Type-4 Shuttle",
  "vertices": [
    [0, 0, 5],      // Nose
    [1, 0, 0],      // Right front
    [-1, 0, 0],     // Left front
    [1, 0, -3],     // Right rear
    [-1, 0, -3],    // Left rear
    [0, 0.5, 0],    // Top
    [0, -0.5, 0]    // Bottom
  ],
  "faces": [
    [0, 1, 5],      // Right top nose
    [0, 5, 2],      // Left top nose
    [1, 3, 5],      // Right top body
    [2, 5, 4],      // Left top body
    [0, 6, 1],      // Right bottom nose
    [0, 2, 6],      // Left bottom nose
    [1, 6, 3],      // Right bottom body
    [2, 4, 6]       // Left bottom body
  ],
  "colors": [
    "#CCCCCC",      // Hull color
    "#AAAAAA",      // Shadow color
    "#888888",      // Detail color
    "#FFFFFF"       // Cockpit color
  ],
  "face_colors": [
    0, 0, 0, 0,     // Most faces are hull color
    1, 1, 1, 1      // Underside is darker
  ]
}
```

### Visual Style

**Geometric forms:**
- Wedge shapes (shuttles, couriers)
- Box shapes (freighters)
- Cylinder shapes (miners, specialized)

**Color schemes:**
- Corporate fleets: Uniform colors (grays, whites)
- Personal ships: Player can repaint (future)
- Functional markings: Thrusters (orange/red), cockpit (blue/cyan)

**Example color palettes:**
- Shuttle: Light gray hull, dark gray accents, cyan cockpit
- Freighter: Industrial brown, rust accents, yellow hazard stripes
- Courier: White hull, blue racing stripes, red thrusters

---

## Ship State (Runtime)

### Player Ship State

```typescript
interface PlayerShipState {
  // Reference to ship definition
  ship_id: string;
  
  // Current condition
  hull_integrity: number;
  fuel_current: number;
  
  // Cargo
  cargo: Record<string, number>;  // { "water": 30, "fuel": 20 }
  cargo_used: number;             // Sum of all cargo quantities
  
  // Position and motion
  position: Position;             // Relative coordinates
  velocity: Vector3;              // m/s
  rotation: Quaternion;
  angular_velocity: Vector3;      // rad/s
  
  // Economics
  last_insurance_payment: Date;
  total_distance_traveled_km: number;
  total_dockings: number;
  
  // Status
  docked_at: string | null;       // Station ID if docked
  autopilot_target: string | null; // Destination if autopilot active
}
```

---

## Ship Selection and Starting

### New Player Ship

**Phase 0-1: Fixed start**
- Every new player starts with Type-4 Shuttle
- Docked at Earth Station Alpha
- 10,000 starting credits
- Full fuel, full hull integrity
- Empty cargo

### Phase 2+: Ship Selection

**Choose starting ship:**
- Type-4 Shuttle (balanced)
- Hauler-9 (trading focus, fewer credits)
- Swift Courier (delivery focus, bonus speed)

**Starting credits adjusted:**
- Shuttle: 10,000 credits
- Hauler: 5,000 credits (ship is worth more)
- Courier: 15,000 credits (ship is worth less)

**Balances out:** All starts are roughly equivalent in total value.

---

## Ship Comparison UI

### Market Display

When buying ships, show comparison:

```
=== SHIPYARD - EARTH STATION ALPHA ===
Your Credits: 2,650,000

[CURRENT SHIP: Type-4 Shuttle]
Cargo: 50 units
Fuel: 1000 units
Hull: 100 HP
Trade-in Value: 70,000 credits

[AVAILABLE: Hauler-9 Freighter]
Cargo: 500 units (+450)
Fuel: 5000 units (+4000)
Hull: 300 HP (+200)
Price: 2,500,000 credits
COST AFTER TRADE-IN: 2,430,000 credits

[PURCHASE] [COMPARE] [CANCEL]
```

---

## Performance Considerations

### Rendering

**One player ship visible at a time:**
- 50-200 triangles
- Negligible GPU cost

**Other ships at stations (future):**
- Render docked ships in bays
- Same triangle budget
- 10-20 ships visible = 2,000-4,000 triangles total
- Still trivial

### Physics

**Ship physics per tick:**
- Calculate thrust force
- Apply gravity from nearby bodies
- Update velocity and position
- Check collision (only near station)

**Cost: <0.1ms per frame**

---

## Testing Checklist

- [ ] Ships load correctly from JSON
- [ ] Ship stats affect gameplay (thrust, cargo, fuel)
- [ ] Damage model works (collisions cause appropriate damage)
- [ ] Repair costs calculated correctly
- [ ] Fuel consumption matches expected rates
- [ ] Ship purchase and trade-in work
- [ ] Insurance premium deduction works
- [ ] Ships render with correct geometry and colors
- [ ] Different ships feel meaningfully different to fly

---

## Future Enhancements

### Phase 2+:
- Ship customization (paint colors, decals)
- Module upgrades (engines, cargo, sensors)
- Ship naming (player-chosen names)
- Ship history/log (where it's been, what it's done)

### Phase 3+:
- Ship damage visible on model (dents, missing parts)
- Ship variants (military, racing, luxury versions)
- Player-designed ships (modular construction)
- Ship aging (wear and tear over time)

---

## Data File Location

```
/data
  /ships
    shuttle_type4.json
    freighter_hauler9.json
    courier_swift.json
    ...
  /models
    /ships
      shuttle_type4_model.json
      freighter_hauler9_model.json
      ...
```

---

## Conclusion

Ships are the player's avatar in Open Frontier. They should:
- Feel meaningfully different from each other
- Have clear strengths and tradeoffs
- Be visually distinct and geometrically simple
- Be defined entirely in data files for easy modding

The ship system is **simple by design**—no complex upgrade trees or min-maxing. Choose the right ship for the job, keep it fueled and repaired, and focus on the actual gameplay of trading and traveling.

---

**Status:** Complete design. Ready for implementation in Phase 0 (Type-4 Shuttle only).
