# Physics System

**Version:** 0.1  
**Status:** Design Phase

---

## Overview

Open Frontier uses **realistic Newtonian mechanics** for all ship movement. No arbitrary speed limits, no flight-sim style physics. Ships obey F=ma.

This document covers:
- Newtonian motion model
- Coordinate system (relative positioning)
- Floating-point precision handling
- Collision detection basics

---

## Newtonian Mechanics

### Force and Acceleration

Ships accelerate based on thrust and mass:

```
F = m × a
a = F / m
```

**Ship properties:**
- `mass` (kg): Ship hull + cargo + fuel
- `thrust` (N): Maximum engine force
- `velocity` (m/s): Current velocity vector
- `rotation` (quaternion): Ship orientation

**Each physics tick:**
1. Calculate thrust force in ship's forward direction
2. Calculate acceleration: `a = thrust / mass`
3. Update velocity: `v += a × dt`
4. Update position: `pos += v × dt`

### Rotation

Ships can rotate independently of translation:
- Yaw, pitch, roll thrusters
- Rotation does NOT affect velocity direction (real physics!)
- Player must thrust in new direction after rotating

### Fuel Consumption

Thrust consumes fuel:
```
fuel_consumed = (thrust_magnitude / max_thrust) × fuel_rate × dt
```

When fuel depletes:
- Cannot thrust (but can still rotate)
- Velocity maintains (no friction in space)
- Ship drifts until refueled

---

## Coordinate System

### The Floating-Point Precision Problem

JavaScript uses 64-bit floats. At AU distances (Earth to Sun = 1.496 × 10¹¹ meters), precision degrades for small movements.

**Example problem:**
- Ship at Mars: position = [2.28 × 10¹¹, 0, 0] meters
- Docking adjustment: move 0.5 meters
- Result: Precision loss causes jitter

### Solution: Relative Coordinates

All positions stored relative to nearest significant body:

```typescript
interface Position {
  referenceBody: string;  // "Earth", "Mars", "Sol", etc.
  offset: Vector3;        // Meters from reference body center
}
```

**Significant bodies:**
- Stars (Sol, Alpha Centauri A/B)
- Planets (Earth, Mars, Jupiter, etc.)
- Large moons (Luna, Titan, Ganymede, etc.)
- Stations (reference their parent planet)

### Coordinate Transforms

**To absolute position:**
```typescript
function toAbsolute(pos: Position): Vector3 {
  const bodyPos = getBodyAbsolutePosition(pos.referenceBody);
  return bodyPos.add(pos.offset);
}
```

**To relative position:**
```typescript
function toRelative(absolutePos: Vector3): Position {
  const nearestBody = findNearestSignificantBody(absolutePos);
  const offset = absolutePos.subtract(nearestBody.position);
  return { 
    referenceBody: nearestBody.id, 
    offset 
  };
}
```

### Reference Switching

When ship moves far from current reference body:
- Automatically switch to nearer body
- Transform offset to new reference frame
- No gameplay impact, purely technical

**Trigger distance:** ~10% of distance to next nearest body

---

## Gravity

### Simplified Gravity Model

Gravity affects ship trajectory:

```
F_gravity = G × (m_ship × m_body) / r²
a_gravity = F_gravity / m_ship = G × m_body / r²
```

**Implementation:**
- Calculate gravity from all significant bodies each tick
- Apply as acceleration vector toward each body
- Sum all gravity accelerations

**Optimization:**
- Only consider bodies within reasonable influence range
- Cache body masses and positions
- Skip distant bodies with negligible effect

### Orbital Mechanics

Ships can achieve orbit naturally:
- Velocity perpendicular to gravity = circular orbit
- No "orbit mode" needed, just physics
- Players can establish parking orbits

**Escape velocity:** Calculated from body mass and distance

---

## Collision Detection

### Basic Collision Model

**Collision checks:**
- Ship vs. planet surface
- Ship vs. station docking ports
- Ship vs. other static objects (derelicts, asteroids)

**NOT checked:**
- Ship vs. other player ships (they don't exist in same instance)

### Bounding Volumes

Ships and objects use simple collision shapes:
- Sphere (for most objects)
- Cylinder (for elongated ships)
- Box (for stations)

**Collision response:**
- Calculate penetration depth
- Apply impulse to separate
- Apply damage based on impact velocity
- Bounce or stick depending on context

### Docking

Special collision case (see [DOCKING.md](DOCKING.md) for details):
- Precise alignment required
- Velocity tolerance
- "Soft dock" vs. "crash"

---

## Performance Optimization

### Fixed Timestep

Physics runs at fixed rate (suggested 10 Hz):
```typescript
const PHYSICS_TICK_RATE = 10; // Hz
const PHYSICS_DT = 1.0 / PHYSICS_TICK_RATE;

function physicsLoop() {
  setInterval(() => {
    updatePhysics(PHYSICS_DT);
  }, PHYSICS_DT * 1000);
}
```

**Benefits:**
- Deterministic simulation
- Independent of render framerate
- Easier to debug

### Spatial Partitioning

For collision detection:
- Grid-based spatial hash (for dense areas like station vicinity)
- Broad phase: reject distant objects
- Narrow phase: precise collision on nearby objects

---

## Edge Cases

1. **Ship at system boundary:** Switch to interstellar reference frame
2. **Near speed of light:** No relativistic effects (keep it simple)
3. **Zero mass cargo:** Mass never goes below ship hull mass
4. **Numerical instability:** Clamp very small values to zero

---

## Testing Checklist

- [ ] Ships accelerate realistically based on mass
- [ ] Rotation doesn't affect velocity direction
- [ ] Gravity pulls ships toward planets
- [ ] Orbital mechanics work naturally
- [ ] No jitter or precision loss during docking
- [ ] Performance: 10 Hz physics stable at 60fps render
- [ ] Collision detection works reliably

---

## Future Enhancements

- Atmospheric drag near planets
- Tidal forces from multiple bodies
- N-body orbital evolution (very long-term)
- Gravity assists and slingshot maneuvers

---

**Status:** Stub document. Needs expansion during implementation.
