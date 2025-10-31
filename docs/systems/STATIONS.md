# Station System

**Version:** 0.1  
**Status:** Design Phase

---

## Overview

Stations are **social and economic hubs** where players dock, trade, refuel, repair, and (eventually) interact with other players. Like everything else in Open Frontier, stations are data-driven entities defined in JSON files.

This document covers:
- Station types and roles
- Station geometry and visual design
- Orbital mechanics
- Station services
- Docking port configuration
- 3D model specifications

---

## Design Philosophy

**Stations are functional, not decorative:**
- Clear geometric forms
- Rotating stations for artificial gravity
- Low-poly aesthetic (500-1000 triangles)
- Different designs reflect different functions

**Stations are alive:**
- Production/consumption creates economic activity
- Docking bays show other player ships (Phase 2+)
- Market prices reflect actual supply/demand

**Stations are data-driven:**
- Everything in JSON: geometry, economy, services
- Easy to add new stations or modify existing ones

---

## Station Types

### By Function

**Habitat Station:**
- Role: Population center, general commerce
- Services: Market, repair, missions, shipyard
- Production: None
- Consumption: Water, oxygen, food
- Example: Earth Station Alpha

**Refinery Station:**
- Role: Resource processing
- Services: Market, fuel depot
- Production: Fuel, manufactured goods
- Consumption: Raw materials, energy
- Example: Mars Refinery Delta

**Mining Station:**
- Role: Resource extraction
- Services: Basic market, repair
- Production: Ore, minerals, ice
- Consumption: Minimal (automated)
- Example: Europa Mining Outpost

**Industrial Station:**
- Role: Manufacturing
- Services: Market, shipyard, fitting yard
- Production: Electronics, machinery, ship components
- Consumption: Raw materials, energy
- Example: Titan Industrial Complex

**Research Station:**
- Role: Scientific missions
- Services: Specialized missions, data analysis
- Production: Research data, rare items
- Consumption: Everything (expensive to maintain)
- Example: Neptune Science Platform

### By Size

**Small Outpost:**
- 2-4 docking ports (small ships only)
- Limited market
- Basic services
- ~500 triangles

**Medium Station:**
- 6-10 docking ports (small and medium ships)
- Full market
- Most services
- ~800 triangles

**Large Hub:**
- 12-20 docking ports (all ship sizes)
- Complete market
- All services
- Multi-player social areas (Phase 3+)
- ~1200 triangles

---

## Station Geometry

### Visual Designs

**Rotating Ring (Habitat):**
- Torus or cylinder rotating on axis
- Docking at hub (non-rotating)
- Artificial gravity in ring
- **Triangle budget: ~800**

**Non-Rotating Platform (Industrial):**
- Modular rectangular platforms
- Docking ports on multiple faces
- No artificial gravity (low-gravity work)
- **Triangle budget: ~600**

**Spherical Core (Mining):**
- Central sphere with extending arms
- Docking ports on arms
- Compact design
- **Triangle budget: ~500**

### Construction Aesthetic

**Geometric modularity:**
- Visible modules/sections
- Functional appearance (not sleek)
- Industrial materials (grays, browns, yellows)
- Lights at docking ports and windows

**Example: Ring Station**
```
    [HUB]
      ||
   .======.
  |        |
  |  RING  |
  |        |
   '======'
      ||
   [DOCKING]
```

---

## 3D Model Specifications

### Ring Station (Large Habitat)

**Geometry:**
- Torus: 200 triangles (32 segments, 8 sides)
- Hub: 100 triangles (cylinder)
- Docking spokes: 50 triangles (4 × simple cylinders)
- Surface detail: 100 triangles (windows, modules)
- **Total: ~450 triangles**

**Proportions:**
- Ring radius: 500m
- Ring cross-section: 50m
- Hub radius: 30m
- Hub height: 100m

**Colors:**
- Hull: Industrial gray (#999999)
- Modules: Darker gray (#666666)
- Windows: Cyan glow (#00FFFF)
- Docking lights: Green (#00FF00)

### Platform Station (Industrial)

**Geometry:**
- Main platform: 50 triangles (rectangular box)
- Secondary platforms: 100 triangles (4 × smaller boxes)
- Connecting struts: 50 triangles
- Docking arms: 80 triangles (4 × simple arms)
- Surface detail: 100 triangles
- **Total: ~380 triangles**

**Proportions:**
- Main platform: 300m × 200m × 50m
- Secondary platforms: 100m × 80m × 30m
- Docking arm length: 50m

**Colors:**
- Hull: Industrial brown (#8B7355)
- Details: Rust orange (#CC5500)
- Hazard stripes: Yellow (#FFFF00)
- Docking lights: Green

### Model Format (JSON)

```json
{
  "name": "Ring Habitat Station",
  "type": "habitat",
  "components": [
    {
      "id": "ring",
      "geometry_type": "torus",
      "major_radius": 500,
      "minor_radius": 25,
      "segments": 32,
      "sides": 8,
      "color": "#999999",
      "rotation_axis": [0, 1, 0],
      "rotation_speed_rpm": 2.0
    },
    {
      "id": "hub",
      "geometry_type": "cylinder",
      "radius": 30,
      "height": 100,
      "segments": 16,
      "color": "#888888",
      "position": [0, 0, 0]
    },
    {
      "id": "docking_spoke_1",
      "geometry_type": "cylinder",
      "radius": 5,
      "height": 50,
      "segments": 8,
      "color": "#666666",
      "position": [0, 50, 0]
    }
  ],
  "docking_ports": [
    {
      "id": "port_1",
      "position": [0, 75, 0],
      "orientation": [0, 1, 0, 0],
      "size_class": "small",
      "type": "axial"
    }
  ]
}
```

---

## Orbital Mechanics

### Station Orbits

Stations orbit their parent body (planet or moon):

```typescript
interface StationOrbit {
  parent_body: string;         // "Earth", "Mars", etc.
  altitude_km: number;         // Height above surface
  inclination_degrees: number; // Orbit angle
  period_hours: number;        // Orbital period
}
```

**Example: Earth Station Alpha**
```json
{
  "orbit": {
    "parent_body": "Earth",
    "altitude_km": 400,
    "inclination_degrees": 51.6,
    "period_hours": 1.5
  }
}
```

### Orbital Position Calculation

```typescript
function calculateStationPosition(
  station: Station,
  current_time: Date
): Position {
  const parent = getBody(station.orbit.parent_body);
  const orbit_radius = parent.radius_km + station.orbit.altitude_km;
  
  // Simple circular orbit
  const period_seconds = station.orbit.period_hours * 3600;
  const angular_velocity = (2 * Math.PI) / period_seconds;
  const elapsed_seconds = (current_time.getTime() - station.orbit.epoch.getTime()) / 1000;
  const angle = (angular_velocity * elapsed_seconds) % (2 * Math.PI);
  
  // Position in orbital plane
  const x = orbit_radius * Math.cos(angle);
  const z = orbit_radius * Math.sin(angle);
  
  // Apply inclination (simplified)
  const incl_rad = (station.orbit.inclination_degrees * Math.PI) / 180;
  const y = z * Math.sin(incl_rad);
  const z_adjusted = z * Math.cos(incl_rad);
  
  return {
    referenceBody: station.orbit.parent_body,
    offset: new Vector3(x * 1000, y * 1000, z_adjusted * 1000)  // Convert km to m
  };
}
```

---

## Station Rotation

### Artificial Gravity

Some stations rotate to generate artificial gravity:

```typescript
interface StationRotation {
  rotating: boolean;
  axis: Vector3;              // Rotation axis (typically [0, 1, 0] = Y-axis)
  rpm: number;                // Revolutions per minute
  angular_velocity: number;   // Calculated rad/s
}
```

**Example:**
- Ring station rotating at 2 RPM
- Generates ~0.5g at 500m radius
- Docking at non-rotating hub

**Docking challenge:**
- Player must match station's rotational velocity
- Hub (non-rotating) is easier
- Ring ports (rotating) are harder but more rewarding

### Rotation Animation

```typescript
function updateStationRotation(station: THREE.Group, dt: number): void {
  if (station.userData.rotation.rotating) {
    const rpm = station.userData.rotation.rpm;
    const angular_velocity = (rpm * 2 * Math.PI) / 60;  // Convert RPM to rad/s
    
    // Rotate only the ring component
    const ring = station.getObjectByName('ring');
    ring.rotateOnAxis(station.userData.rotation.axis, angular_velocity * dt);
  }
}
```

---

## Docking Ports

### Port Configuration

Each station has multiple docking ports:

```typescript
interface DockingPort {
  id: string;
  position: Vector3;          // Relative to station center
  orientation: Quaternion;    // Port "forward" direction
  size_class: string;         // "small", "medium", "large"
  type: string;               // "axial", "radial"
  occupied: boolean;
  occupied_by?: string;       // Player ID or ship name
  status: string;             // "available", "reserved", "damaged"
}
```

**Port types:**

**Axial ports (hub):**
- Along station's rotation axis
- Non-rotating (easier to dock)
- Limited number (2-4)
- All ship sizes

**Radial ports (ring):**
- Around station perimeter
- Rotating with station (harder to dock)
- More available (8-12)
- Typically small ships only

### Port Assignment

When player approaches station:
1. Request docking clearance
2. Station assigns available port matching ship size
3. Port lights turn green
4. Navigation marker appears
5. Player docks manually

---

## Station Services

### Market Terminal

**Available at all stations:**
- Buy/sell trade goods
- View market prices
- See price trends
- Check inventory levels

### Repair Bay

**Available at most stations:**
- Repair hull damage
- Cost: `damage × ship.repair_cost_per_hp`
- Instant (no waiting)

### Fuel Depot

**Available at all stations:**
- Refuel ship to capacity
- Cost: Market price of fuel × quantity
- Instant

### Shipyard

**Available at large stations:**
- Purchase new ships
- Trade in current ship
- View ship stats and comparison

### Fitting Yard (Phase 2+)

**Available at industrial stations:**
- Install/remove ship modules
- Upgrade engines, cargo, systems
- Customize ship

### Mission Board

**Available at all stations:**
- View available missions
- Accept missions
- Complete missions
- Post player contracts (Phase 3+)

---

## Station UI/Menus

### Docking Menu

Upon successful dock:

```
=== DOCKED AT EARTH STATION ALPHA ===
Bay 03 | Type-4 Shuttle

[MARKET]       - Buy and sell goods
[MISSIONS]     - Available missions
[REPAIR]       - Hull: 85/100 HP (Repair: 7,500 cr)
[REFUEL]       - Fuel: 650/1000 (Refuel: 17,500 cr)
[SHIPYARD]     - Purchase ships
[STATION INFO] - View station details
[UNDOCK]       - Launch into space
```

### Market Interface

```
=== EARTH STATION ALPHA - MARKET ===
Your Credits: 125,000
Your Cargo: 35 / 50 units

COMMODITY       | BUY    | SELL   | STOCK  | TREND
----------------|--------|--------|--------|-------
Water           | 55     | 50     | 85%    | →
Oxygen          | 105    | 100    | 90%    | →
Fuel            | 95     | 90     | 75%    | ↓
Electronics     | 5,200  | 5,000  | 45%    | ↑
Food            | 125    | 120    | 60%    | →

[BUY] [SELL] [VIEW DETAILS] [BACK]
```

---

## Station State

### Runtime State

```typescript
interface StationState {
  // Identity
  id: string;
  name: string;
  station_type: string;
  
  // Location
  orbit: StationOrbit;
  position: Position;         // Current orbital position
  
  // Rotation
  rotation: StationRotation;
  current_rotation: Quaternion;
  
  // Docking
  docking_ports: DockingPort[];
  
  // Economy
  inventory: Record<string, number>;
  storage_capacity: Record<string, number>;
  production: ProductionRate[];
  consumption: ConsumptionRate[];
  
  // Services
  services: string[];         // ["market", "repair", "shipyard"]
  
  // Status
  operational: boolean;
  last_maintenance: Date;
  
  // 3D Model
  model_file: string;
}
```

---

## Station Definitions (JSON)

### Example: Earth Station Alpha

```json
{
  "id": "earth_station_alpha",
  "name": "Earth Station Alpha",
  "station_type": "habitat",
  "description": "Largest orbital habitat in Earth orbit. Primary commerce hub for inner solar system.",
  
  "orbit": {
    "parent_body": "Earth",
    "altitude_km": 400,
    "inclination_degrees": 51.6,
    "period_hours": 1.5,
    "epoch": "2025-01-01T00:00:00Z"
  },
  
  "rotation": {
    "rotating": true,
    "axis": [0, 1, 0],
    "rpm": 2.0
  },
  
  "docking_ports": [
    {
      "id": "port_hub_north",
      "position": [0, 75, 0],
      "orientation": [0, 0, 0, 1],
      "size_class": "large",
      "type": "axial"
    },
    {
      "id": "port_hub_south",
      "position": [0, -75, 0],
      "orientation": [0, 0, 1, 0],
      "size_class": "large",
      "type": "axial"
    },
    {
      "id": "port_ring_1",
      "position": [500, 0, 0],
      "orientation": [0, 0, 0, 1],
      "size_class": "small",
      "type": "radial"
    }
  ],
  
  "inventory": {
    "water": 900,
    "oxygen": 850,
    "food": 700,
    "fuel": 600,
    "electronics": 300
  },
  
  "storage_capacity": {
    "water": 1000,
    "oxygen": 1000,
    "food": 1000,
    "fuel": 1000,
    "electronics": 500
  },
  
  "production": [],
  
  "consumption": [
    { "good": "water", "unitsPerDay": 200 },
    { "good": "oxygen", "unitsPerDay": 300 },
    { "good": "food", "unitsPerDay": 150 }
  ],
  
  "services": [
    "market",
    "repair",
    "refuel",
    "missions",
    "shipyard"
  ],
  
  "model_file": "ring_habitat_large.json"
}
```

---

## Multi-Player Presence (Phase 2+)

### Docking Manifest

Show other players docked at station:

```
=== DOCKING MANIFEST ===
Bay 01: [YOUR SHIP] Type-4 Shuttle
Bay 03: Wanderer's Dream (Elena_R) - Hauler-9
Bay 05: Star Chaser (Marcus_T) - Swift Courier
Bay 07: [EMPTY]
Bay 08: Serenity's Edge (Yuki_S) - Type-4 Shuttle
...
```

**Interactions:**
- See other ships in bays
- View basic ship info (type, owner name)
- Cannot interact with ships directly

### Station Chat (Phase 3+)

Text chat available at docked stations:

```
=== STATION CHAT - EARTH STATION ALPHA ===
[Elena_R]: Anyone heading to Mars? Need electronics hauled.
[Marcus_T]: @Elena_R I'm going there in 2 hours
[Yuki_S]: Fuel prices are insane here. Anyone know why?
[YOU]: @Yuki_S Droid supply route is behind schedule
[Elena_R]: @Marcus_T Perfect, I'll post a contract. 50k for 100 units.
```

---

## Performance Considerations

### Rendering

**Single station visible:**
- 500-1200 triangles
- Trivial GPU cost

**Multiple stations in view:**
- 10 stations = 10,000 triangles
- Still trivial

### Rotation Animation

**Per frame:**
- Update rotation quaternion
- No mesh manipulation
- <0.01ms

### Orbital Position

**Per tick:**
- Calculate position from time
- No integration needed (circular orbit)
- <0.01ms

---

## Testing Checklist

- [ ] Stations render correctly (geometry, colors)
- [ ] Rotating stations animate smoothly
- [ ] Orbital positions calculate correctly
- [ ] Docking ports have correct positions/orientations
- [ ] Station services work (market, repair, refuel)
- [ ] Inventory consumption works over time
- [ ] Docking manifest shows correctly (Phase 2+)
- [ ] Multiple stations can exist simultaneously

---

## Future Enhancements

### Phase 2+:
- Damaged stations (malfunctioning, reduced services)
- Station reputation system (affects prices, services)
- Visual customization (lights, colors per station)
- Dynamic construction (stations grow over time)

### Phase 3+:
- Player-owned stations (very long-term)
- Station defense systems (inactive, decorative)
- Unique station events (festivals, emergencies)
- Interior views (walk around station)

---

## Data File Location

```
/data
  /stations
    earth_station_alpha.json
    mars_refinery_delta.json
    europa_mining_outpost.json
    ...
  /models
    /stations
      ring_habitat_large.json
      platform_industrial.json
      sphere_mining.json
      ...
```

---

## Conclusion

Stations are the **beating heart** of Open Frontier's economy and social life. They should:
- Look functional and geometric (not sleek or futuristic)
- Rotate realistically (for those with artificial gravity)
- Provide clear services and economic activity
- Be entirely data-driven for easy modding

The station system is **straightforward to implement**—mostly just 3D models and UI menus. The complexity is in the economic simulation, which is covered in ECONOMY.md.

---

**Status:** Complete design. Ready for implementation in Phase 0 (Earth Station Alpha only).
