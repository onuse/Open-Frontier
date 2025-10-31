# Docking System

**Version:** 0.1  
**Status:** Design Phase

---

## Overview

**Docking is the core gameplay skill challenge in Open Frontier.** Everything else is decision-making and patience. Docking is where player skill matters.

This document covers:
- Docking requirements and tolerances
- Collision detection
- UI feedback and assistance
- Success/failure states
- Learning curve considerations

---

## Docking Requirements

### Successful Dock

A ship successfully docks when ALL conditions are met:

1. **Position:** Ship within docking port collision volume
2. **Alignment:** Ship orientation within tolerance of port orientation
3. **Velocity:** Relative velocity below safe threshold
4. **Rotation:** Ship rotation rate below threshold

**Suggested tolerances (NEED TUNING):**
```typescript
interface DockingTolerance {
  positionRadius: number;      // meters (e.g., 5m for shuttle, 20m for freighter)
  alignmentAngle: number;      // degrees (e.g., 15°)
  maxVelocity: number;         // m/s (e.g., 2 m/s)
  maxRotationRate: number;     // rad/s (e.g., 0.1 rad/s)
}
```

### Failure States

**Minor collision (5-15 m/s):**
- Hull damage proportional to impact velocity
- "Bounce" away from station
- Must reattempt docking
- Repair costs at station

**Major collision (>15 m/s):**
- Ship destroyed
- Insurance claim triggered
- Lose cargo (but keep credits)
- Respawn at last docked station with basic shuttle

**Failed alignment:**
- Ship makes contact but not properly aligned
- Scrape damage (less than collision)
- Rejected by docking port automation
- Must back off and retry

---

## Docking Port Types

### Standard Docking Port
- Cylindrical volume
- Ship must enter nose-first
- Most common at stations

### Bay Docking
- Large rectangular volume
- Ships can enter from any angle
- Align after entering
- Used for larger ships at major stations

### Surface Landing Pads
- Circular or rectangular area on planet/moon surface
- Vertical descent required
- Gravity adds difficulty
- Used for planetary stations

---

## UI Assistance

### Visual Aids

**Docking Alignment Indicator:**
```
    ⬆ (Target orientation)
    |
  +---+
  |   | (Ship icon)
  +---+
    ↓ (Current orientation)
```

**Distance/Velocity Display:**
```
Distance to Port: 125m
Relative Velocity: 15.3 m/s ⚠️ TOO FAST
Approach Angle: 8° ✓
Rotation Rate: 0.05 rad/s ✓
```

**Color Coding:**
- Green: Within tolerance
- Yellow: Close to tolerance
- Red: Outside tolerance

### No Autopilot

**Critical design decision:** No automatic docking.

Players must:
- Manually thrust to match station velocity
- Rotate to align with port
- Carefully approach at safe speed
- Make final adjustments

**Why no autopilot:**
- Docking is THE skill moment
- Removes player agency
- Trivializes the one challenging action
- Goes against "earned accomplishment" philosophy

**Exception:** Tutorial may offer assisted docking for first attempt

---

## Learning Curve

### First-Time Docker

New players need to learn:
1. Match velocity with target (hardest part)
2. Rotate to align
3. Approach slowly
4. Make micro-adjustments

**Tutorial flow:**
1. Explain relative velocity concept
2. Practice matching velocity with no rotation
3. Practice rotation with no movement
4. Attempt full docking with generous tolerances
5. Reduce tolerances as player improves

### Experienced Docker

With practice, players should:
- Dock consistently in 2-5 minutes
- Rarely collide
- Understand velocity matching intuitively
- Use minimal fuel for approach

**Skill expression:**
- Speed running (how fast can you dock?)
- Zero-fuel docking (coast into port)
- Emergency docking (low fuel, damaged ship)

---

## Station Considerations

### Rotating Stations

Some stations rotate to generate artificial gravity:

**Additional challenge:**
- Port has rotational velocity
- Player must match rotation + translation
- More difficult but more rewarding

**UI support:**
- Show station rotation rate
- Display relative velocity including rotational component

### Busy Stations

Multiple docking ports, some occupied:

**Implementation:**
- Occupied ports show other player ships (docked only)
- Cannot select occupied port
- Must choose available port
- No collision with docked ships (different instances)

---

## Collision Detection Implementation

### Docking Port Geometry

```typescript
interface DockingPort {
  id: string;
  stationId: string;
  position: Vector3;          // Relative to station
  orientation: Quaternion;    // Port "forward" direction
  radius: number;             // Collision cylinder radius
  depth: number;              // Collision cylinder depth
  occupied: boolean;
  occupiedBy?: string;        // Player ID if occupied
}
```

### Collision Check

Each physics tick:
```typescript
function checkDockingCollision(
  ship: Ship,
  port: DockingPort,
  tolerance: DockingTolerance
): DockingResult {
  // 1. Check if ship inside port volume
  const inVolume = isInsideDockingVolume(ship, port);
  if (!inVolume) return { status: 'approaching' };
  
  // 2. Check alignment
  const alignmentError = calculateAlignmentError(ship, port);
  const alignmentOK = alignmentError < tolerance.alignmentAngle;
  
  // 3. Check velocity
  const relativeVelocity = calculateRelativeVelocity(ship, port);
  const velocityMagnitude = relativeVelocity.length();
  const velocityOK = velocityMagnitude < tolerance.maxVelocity;
  
  // 4. Check rotation
  const rotationRate = ship.angularVelocity.length();
  const rotationOK = rotationRate < tolerance.maxRotationRate;
  
  // Determine outcome
  if (alignmentOK && velocityOK && rotationOK) {
    return { status: 'docked_success' };
  } else if (velocityMagnitude > 15) {
    return { status: 'collision_major', damage: calculateDamage(velocityMagnitude) };
  } else if (velocityMagnitude > 5) {
    return { status: 'collision_minor', damage: calculateDamage(velocityMagnitude) };
  } else {
    return { 
      status: 'alignment_failed',
      errors: {
        alignment: !alignmentOK ? alignmentError : null,
        velocity: !velocityOK ? velocityMagnitude : null,
        rotation: !rotationOK ? rotationRate : null
      }
    };
  }
}
```

---

## Feedback and Polish

### Audio Cues

**Docking approach:**
- Proximity beep (faster as you get closer)
- Alignment tone (changes pitch with alignment error)
- Velocity warning (audible warning if too fast)

**Collision:**
- Impact sound (volume based on severity)
- Hull stress sounds
- Emergency klaxon for major collision

### Visual Effects

**Minimal, grounded effects:**
- Docking guide lights on port (green = go, red = stop)
- Slight screen shake on collision
- Hull damage indicators
- No magical particle effects

### Haptics (Future)

For gamepad support:
- Vibration on thruster fire
- Collision rumble
- Docking confirmation pulse

---

## Camera Drone Behavior During Docking

Player can switch to camera drone for external view:

**Drone positioning:**
- Maintains relative position to ship
- Can be manually repositioned (with limits)
- If drone collides with station, destroyed → return to cockpit view

**Use cases:**
- See ship orientation relative to port
- Verify alignment visually
- More cinematic approach

**Tradeoff:**
- Easier to see alignment
- Harder to read HUD instruments

---

## Docking at Planet Surfaces

Planetary landing pads have additional challenges:

**Gravity:**
- Constant downward acceleration
- Must counter with continuous thrust
- Fuel consumption higher

**Terrain:**
- Uneven surfaces (future)
- Visual obstruction (mountains, structures)
- Dust effects on thrusters (visual only)

**Suggested approach:**
- Reduce vertical velocity to near-zero above pad
- Adjust horizontal position
- Gentle descent onto pad
- Land at < 1 m/s vertical velocity

---

## Performance and Optimization

Docking collision checks are expensive:

**Optimizations:**
- Only check collision when ship within ~1 km of station
- Broad phase: sphere-sphere check first
- Narrow phase: precise cylinder check if broad phase passes
- Cache station/port positions (update only when station moves)

---

## Testing Checklist

- [ ] Can dock successfully with reasonable effort
- [ ] Feedback is clear (know why you failed)
- [ ] Tolerances feel fair (not too punishing)
- [ ] Minor collisions feel impactful but recoverable
- [ ] Major collisions feel catastrophic (as intended)
- [ ] Rotating stations work correctly
- [ ] UI assistance is helpful but not hand-holding
- [ ] Learning curve is steep but not frustrating
- [ ] Experienced players can dock consistently

---

## Tuning Parameters

**Critical values to adjust during playtesting:**

| Parameter | Initial Value | Notes |
|-----------|---------------|-------|
| Max safe velocity | 2 m/s | Adjust based on player feedback |
| Alignment tolerance | 15° | More forgiving for beginners? |
| Max rotation rate | 0.1 rad/s | How stable must ship be? |
| Minor collision threshold | 5 m/s | When does damage start? |
| Major collision threshold | 15 m/s | When is ship destroyed? |
| Port radius (shuttle) | 5 m | Based on ship size |
| Port depth | 10 m | How far inside to dock? |

**Expect to iterate heavily.** Docking feel is everything.

---

## Future Enhancements

- Emergency docking (automated when hull critical)
- Damage affects docking ability (asymmetric thrust, rotation issues)
- Advanced docking modes (precision vs. fast)
- Docking challenges/minigames (for speedrunners)
- Cooperative docking (player guides, another player docks)

---

**Status:** Stub document. Needs expansion during implementation and heavy playtesting.
