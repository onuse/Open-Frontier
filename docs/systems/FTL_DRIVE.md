# FTL Drive System

**Version:** 0.1  
**Status:** Design Phase - Needs Heavy Tuning

---

## Overview

The **Tachyon Drive** is Open Frontier's FTL propulsion system. Unlike traditional science fiction warp drives or jump drives, the tachyon drive is a **velocity multiplier** that scales with distance from gravity wells.

This design serves multiple gameplay purposes:
- Natural speed limits near planets/stations (prevents catastrophic collisions)
- Strategic route planning (minimize time in high-gravity regions)
- Seamless transition from interplanetary to interstellar travel
- Makes docking approach feasible (automatic speed reduction near stations)

---

## Core Concept

The tachyon drive doesn't propel the ship—it **multiplies the ship's existing velocity** based on local gravitational conditions.

**Two propulsion modes:**

1. **Newtonian Thrust:** Conventional rocket engine
   - Limited by fuel and thrust rating
   - Provides actual acceleration
   - Maximum realistic velocity: ~0.01c (3,000 km/s)

2. **Tachyon Multiplier:** FTL velocity amplification
   - Multiplies current velocity by 1x to 1,000,000x
   - Scale depends on distance from gravity sources
   - No additional fuel cost (or minimal cost, TBD)
   - Always available, but effectiveness varies

**Key principle:** You must have velocity for the tachyon drive to multiply. If you're stationary, 1,000,000x × 0 = 0.

---

## Mechanics

### Gravity Influence Calculation

The tachyon multiplier is inversely proportional to local gravitational influence:

```
tachyon_multiplier = 1 + (max_multiplier - 1) × (1 - gravity_influence)
```

Where `gravity_influence` is calculated from all significant bodies in the system:

```
gravity_influence = min(1.0, total_gravity_metric / threshold)

total_gravity_metric = Σ (G × mass_i / distance_i²)
```

**Parameters:**
- `G`: Gravitational constant (6.674 × 10⁻¹¹ m³/kg·s²)
- `mass_i`: Mass of body i (kg)
- `distance_i`: Distance from ship to body i (meters)
- `threshold`: Tuning constant (determines scaling, see below)
- `max_multiplier`: Maximum multiplier in deep space (suggested: 1,000,000x)

### Naive Implementation

**WARNING:** These values are starting points and will require extensive tuning during playtesting.

```typescript
interface GravitySource {
  id: string;
  position: Vector3;  // meters
  mass: number;       // kg
}

interface TachyonDriveConfig {
  maxMultiplier: number;      // Default: 1,000,000
  gravityThreshold: number;   // Default: 1e-6 (NEEDS TUNING)
  minDistance: number;        // Default: 10,000m (prevent near-surface issues)
}

function calculateTachyonMultiplier(
  shipPosition: Vector3,
  gravitySources: GravitySource[],
  config: TachyonDriveConfig
): number {
  const G = 6.674e-11;  // Gravitational constant
  
  let totalGravityMetric = 0;
  
  for (const source of gravitySources) {
    const distance = shipPosition.distanceTo(source.position);
    
    // Prevent divide-by-zero and absurd values near surfaces
    if (distance < config.minDistance) {
      // Very close to a body = maximum gravity influence
      return 1.0;  // No tachyon multiplication
    }
    
    // Calculate simplified gravity metric
    const gravityContribution = (G * source.mass) / (distance * distance);
    totalGravityMetric += gravityContribution;
  }
  
  // Normalize to 0-1 range
  const normalizedGravity = Math.min(1.0, totalGravityMetric / config.gravityThreshold);
  
  // Inverse relationship: high gravity = low multiplier
  const multiplier = 1 + (config.maxMultiplier - 1) * (1 - normalizedGravity);
  
  // Return as integer for UI display
  return Math.floor(multiplier);
}
```

### Player Control

The player can manually select any multiplier **up to the current maximum** allowed by gravity conditions.

**Autopilot behavior:**
- Always selects maximum available multiplier
- Optimizes travel time
- Default for most players

**Manual control:**
- Discrete tiers: [1x, 10x, 100x, 1,000x, 10,000x, 100,000x, 1,000,000x]
- Player selects from available tiers ≤ current maximum
- Useful for:
  - Precise orbital adjustments
  - Sightseeing at reduced speed
  - Approaching destinations carefully
  - "Slow boating" for roleplaying purposes

**UI example:**
```
Current Tachyon Limit: 45,320x
Autopilot: ON [45,320x]

Manual Override:
[ ] 1x
[ ] 10x
[ ] 100x
[ ] 1,000x
[ ] 10,000x
[•] 45,320x (MAX)
```

---

## Tuning Parameters

### Critical Values That Need Adjustment

1. **`gravityThreshold`** (Default: 1e-6)
   - Most important tuning parameter
   - Controls how quickly multiplier scales with distance
   - Too high: Player stuck at low speeds too far from planets
   - Too low: Player hits max speed too close to planets (dangerous)
   - **Target behavior:**
     - Low Earth orbit (~400 km): multiplier ≈ 1-10x
     - Earth-Moon distance (384,400 km): multiplier ≈ 100-1,000x
     - Mars orbit distance (225M km): multiplier ≈ 100,000x
     - Deep solar system (beyond Neptune): multiplier ≈ 1,000,000x

2. **`maxMultiplier`** (Default: 1,000,000)
   - Determines interstellar travel time
   - 1,000,000x at c/100 base speed → ~4-6 months to Alpha Centauri
   - 10,000,000x → ~2-3 weeks (might be too fast for "slow gaming")
   - Consider: Do we want interstellar travel to take real-world months?

3. **`minDistance`** (Default: 10,000m)
   - Safety cutoff near surfaces
   - Below this distance, tachyon drive is forced to 1x
   - Prevents computational issues and gameplay exploits
   - Should be larger than station/planet collision radius

### Example Travel Times

**With naive parameters (needs validation):**

| Route | Distance | Estimated Time | Notes |
|-------|----------|----------------|-------|
| Earth Station → Moon | 384,400 km | 3-5 hours | Low multiplier near Earth |
| Earth → Mars (close approach) | 78M km | 1-2 days | Gradual multiplier increase |
| Earth → Mars (average) | 225M km | 2-3 days | More time in high-multiplier region |
| Earth → Jupiter | 778M km | 5-7 days | High multiplier most of route |
| Earth → Neptune | 4.5B km | 2-3 weeks | Nearly max multiplier |
| Sol → Alpha Centauri | 4.37 light-years | 4-6 months | Max multiplier entire route |

**These times are completely speculative.** Actual values depend heavily on:
- Base Newtonian velocity achieved before engaging tachyon drive
- Exact tuning of gravity threshold
- Orbital positions (planets move!)

---

## Implementation Notes

### Coordinate System Interaction

The FTL drive needs to work with the relative coordinate system (see [PHYSICS.md](PHYSICS.md)).

**Challenges:**
- Ship position relative to reference body
- Gravity sources may use different reference frames
- Need to transform to common frame for distance calculations

**Suggested approach:**
- Keep a list of "significant bodies" in each star system
- Pre-calculate their absolute positions each tick
- Ship position transforms to absolute for gravity calculation
- Cache results to avoid repeated transformations

### Performance Considerations

**Every physics tick (10 Hz suggested):**
- Calculate distance to ~10-20 major bodies
- Compute gravity metric
- Determine current multiplier
- Apply to velocity

This is relatively cheap computation, but:
- Cache body positions (they change slowly)
- Only consider bodies within reasonable influence range
- Skip calculation if ship is docked or stationary

### Edge Cases

1. **Binary star systems:** Multiple large gravity sources
   - Algorithm handles this (sum of all contributions)
   - May create interesting "slow zones" between stars

2. **Lagrange points:** Low gravity regions between bodies
   - Natural "fast lanes" for travel
   - Emergent strategic routing

3. **Ship launched from station:** Zero velocity initially
   - Must use Newtonian thrust first
   - Then tachyon drive becomes effective
   - Prevents instant acceleration exploits

4. **Manual course correction mid-flight:**
   - Player rotates ship and applies thrust
   - Velocity vector changes direction
   - Tachyon drive continues multiplying new vector
   - Works naturally with Newtonian mechanics

---

## Fuel Consumption

**Open design question:** Does the tachyon drive consume fuel?

### Option A: Tachyon Drive is Free
**Pros:**
- Simpler to understand
- Fuel management focused on Newtonian thrust only
- Encourages long journeys (no fuel anxiety)

**Cons:**
- Less strategic depth
- No tradeoff for using high multipliers
- Removes "do I have enough fuel to reach X?" tension

### Option B: Minimal Fuel Cost
**Formula:** `fuel_per_tick = base_cost × (multiplier / 1000)`

**Pros:**
- Adds strategic consideration
- Very long journeys require planning
- High-multiplier travel has slight cost

**Cons:**
- More complex to balance
- Could frustrate players if not tuned well

**Recommendation:** Start with Option A (free), add fuel cost later if game feels too easy.

---

## UI/UX Considerations

### Information Display

**HUD should show:**
1. Current velocity (both Newtonian and effective)
   - "Velocity: 2,500 km/s → 125,000,000 km/s (50,000x)"
2. Available tachyon multiplier range
   - "Tachyon Limit: 50,000x"
3. Autopilot status
   - "Autopilot: ON [MAX]" or "Manual: 1,000x"
4. Nearest gravity source and distance
   - "Closest: Earth (1.2M km)"

### Visual Feedback

**Speed effects:**
- No "warp tunnel" or magic effects
- Stars may streak slightly at very high multipliers (optional)
- Keep aesthetic grounded and minimal
- Distance to target updates rapidly at high speeds

**Gravity influence visualization:**
- Color-coded HUD indicator?
- Green = high multiplier available
- Yellow = moderate
- Red = near gravity well, low multiplier

---

## Testing Checklist

Once implemented, validate:

- [ ] Can travel from Earth to Moon in ~3-5 hours
- [ ] Can travel from Earth to Mars in ~2-3 days
- [ ] Multiplier naturally reduces when approaching destinations
- [ ] Docking approach is feasible (not approaching at 1,000,000x)
- [ ] Cannot accidentally crash into planets at FTL speeds
- [ ] Manual control tiers feel intuitive
- [ ] Autopilot picks sensible speeds
- [ ] Edge cases (Lagrange points, binary systems) behave reasonably
- [ ] Performance is acceptable (60fps maintained)
- [ ] Travel times "feel right" for slow gaming philosophy

---

## Future Enhancements

### Phase 2+:
- **Route planning UI:** Visualize multiplier along planned trajectory
- **Gravity map overlay:** See "fast lanes" and "slow zones"
- **Advanced autopilot:** Optimize route for fastest travel (not just max multiplier)
- **Drive upgrades:** Better drives have higher max_multiplier
- **Emergency stop:** Rapidly reduce multiplier (costs fuel?)

### Far Future:
- **Wormholes/Gates:** Instant travel between distant systems (expensive infrastructure)
- **Gravity slingshots:** Use planetary flybys to gain velocity before engaging tachyon drive
- **Hazard zones:** Regions where tachyon drive is dangerous or unstable

---

## Conclusion

This tachyon drive design is **intentionally simple** to start with. The core formula is straightforward, and the behavior emerges naturally from distance-to-mass relationships.

**The critical work is tuning.** The `gravityThreshold` parameter will make or break the game feel. Too conservative, and travel is tedious. Too aggressive, and docking becomes impossible.

**Expect to iterate heavily** during Phase 0 proof-of-concept. The math is easy; the feel is hard.

**Next steps:**
1. Implement naive algorithm
2. Fly around Earth-Moon system
3. Adjust threshold until it feels right
4. Expand to full solar system
5. Test interplanetary travel times
6. Adjust max_multiplier for desired gameplay cadence

The algorithm will change. That's expected. This document provides a starting point, not gospel.
