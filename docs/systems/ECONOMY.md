# Economy System

**Version:** 0.1  
**Status:** Design Phase

---

## Overview

Open Frontier's economy is **deterministic and player-driven**. No NPC traders. No simulated competition. Just:
- Automated station production/consumption
- Droid logistics on predetermined routes
- Player trading and opportunism

This document covers:
- Station production/consumption mechanics
- Price calculation formulas
- Droid supply routes
- Market dynamics
- Trade goods definitions

---

## Core Principles

1. **No random fluctuation:** Prices are deterministic based on supply and demand
2. **No NPC traders:** Only players and dumb automation
3. **Opportunities are real:** Profitable routes exist because they're genuinely unfilled
4. **Supply/demand is literal:** Based on actual inventory levels

---

## Station Production & Consumption

### Station Definition

```typescript
interface Station {
  id: string;
  name: string;
  location: Position;
  
  // Economic properties
  inventory: Record<string, number>;      // Current stock of each good
  storageCapacity: Record<string, number>; // Max storage per good
  
  production: ProductionRate[];    // What this station produces
  consumption: ConsumptionRate[];  // What this station consumes
  
  // Docking
  dockingPorts: DockingPort[];
}

interface ProductionRate {
  good: string;
  unitsPerDay: number;
  requiresInput?: Record<string, number>;  // Goods consumed to produce
}

interface ConsumptionRate {
  good: string;
  unitsPerDay: number;
}
```

### Production Simulation

Each game tick:
1. Check if station has storage space
2. Check if station has required inputs (if any)
3. Produce goods at defined rate
4. Add to inventory
5. If storage full, production stops

**Example: Mars Refinery**
```json
{
  "production": [
    {
      "good": "fuel",
      "unitsPerDay": 1000,
      "requiresInput": {
        "hydrogen": 500,
        "deuterium": 100
      }
    }
  ]
}
```

### Consumption Simulation

Each game tick:
1. Check inventory for consumed goods
2. Deduct consumption amount
3. If inventory depleted, consumption continues from reserves
4. When reserves empty, station generates critical mission

**Example: Mars Station**
```json
{
  "consumption": [
    {
      "good": "oxygen",
      "unitsPerDay": 500
    },
    {
      "good": "water",
      "unitsPerDay": 300
    },
    {
      "good": "food",
      "unitsPerDay": 200
    }
  ]
}
```

---

## Droid Logistics

### Supply Routes

Droid ships run **predetermined routes** established long ago:

```typescript
interface DroidRoute {
  id: string;
  origin: string;              // Station ID
  destination: string;         // Station ID
  cargo: string;               // Trade good ID
  quantity: number;            // Units per delivery
  frequencyHours: number;      // How often (168 = weekly)
  lastDelivery: Date;          // When last delivery occurred
}
```

**Example: Earth-Mars Water Route**
```json
{
  "id": "earth_mars_water",
  "origin": "Earth_Station_Alpha",
  "destination": "Mars_Olympus_Station",
  "cargo": "water",
  "quantity": 100,
  "frequencyHours": 168,
  "lastDelivery": "2025-10-23T00:00:00Z"
}
```

### Droid Behavior

Droids are **predictable and inefficient:**
- Run on fixed schedule regardless of market conditions
- Don't optimize routes or cargo
- Don't respond to shortages or surpluses
- Sometimes deliver to stations that don't need goods (surplus builds)
- Sometimes skip stations that desperately need goods (shortages worsen)

**This creates player opportunities:**
- Notice chronic shortages
- Haul goods for profit
- Stabilize prices through smart trading

### Droid Route Discovery

Players learn about droid routes through:
- Station logs (show recent deliveries)
- Market data (predictable price patterns)
- Observation (see delivery schedules over time)

**No central database of routes.** Part of the game is learning the infrastructure.

---

## Price Calculation

### Formula

```
price = base_price × supply_demand_ratio × distance_modifier
```

**Components:**

1. **Base Price:** Defined in trade good data file
2. **Supply/Demand Ratio:**
   ```
   ratio = max(0.1, min(10.0, demand / supply))
   ```
   - If supply > demand: ratio < 1 (cheap)
   - If demand > supply: ratio > 1 (expensive)
   - Clamped to prevent extreme prices

3. **Distance Modifier:**
   ```
   modifier = 1.0 + (distance_from_origin / max_distance) × 0.5
   ```
   - Remote stations have slight premium
   - Represents historical transport costs

### Supply and Demand Values

**Supply:** Current inventory at station
```
supply = inventory[good] / storageCapacity[good]
```
(Normalized to 0-1 range)

**Demand:** Based on consumption rate and time to depletion
```
demand = consumptionRate / (inventory + buffer)
```
Where `buffer` is safety margin before critical shortage

### Price Examples

**Mars Station - Oxygen:**
- Base price: 100 credits/unit
- Inventory: 50 units (10% of capacity)
- Consumption: 500 units/day
- Supply ratio: 0.1 (very low supply)
- Demand ratio: 10.0 (very high demand)
- Distance modifier: 1.2 (Mars is far from Earth)
- **Final price: 100 × 10.0 × 1.2 = 1,200 credits/unit**

**Earth Station - Water:**
- Base price: 50 credits/unit
- Inventory: 900 units (90% of capacity)
- Consumption: 200 units/day
- Supply ratio: 0.9 (high supply)
- Demand ratio: 0.2 (low demand)
- Distance modifier: 1.0 (origin world)
- **Final price: 50 × 0.2 × 1.0 = 10 credits/unit**

**Player opportunity:** Buy water at Earth (10 cr), sell at Mars (unclear without checking Mars prices, but likely profitable).

---

## Trade Goods

### Categories

1. **Volatiles** (Life support essentials)
   - Water, oxygen, nitrogen
   - High demand at all inhabited stations
   - Produced at ice mines, refineries

2. **Fuel** (Ship propulsion)
   - Hydrogen, deuterium
   - Essential for all ships
   - Produced at refineries near gas giants

3. **Raw Materials**
   - Ore, minerals, ice
   - Input for manufacturing
   - Mined from asteroids, moons

4. **Manufactured Goods**
   - Electronics, machinery, tools
   - Produced at industrial stations
   - Consumed at colony stations

5. **Luxury Items**
   - Art, exotic foods, entertainment
   - High value, low volume
   - Produced at core worlds, consumed at colonies

6. **Contraband** (Future)
   - Illegal or restricted goods
   - Higher risk, higher reward
   - Reputation consequences

### Trade Good Definition

```typescript
interface TradeGood {
  id: string;
  name: string;
  category: string;
  basePrice: number;       // Credits per unit
  volumePerUnit: number;   // Cubic meters
  massPerUnit: number;     // Kilograms
  description: string;
  legal: boolean;          // Is this contraband?
}
```

**Example: Water**
```json
{
  "id": "water",
  "name": "Water",
  "category": "volatiles",
  "basePrice": 50,
  "volumePerUnit": 1,
  "massPerUnit": 1000,
  "description": "Essential for life support and industrial processes.",
  "legal": true
}
```

---

## Market Dynamics

### Equilibrium

Over time, prices should oscillate around equilibrium:
- Players buy low, sell high
- This moves inventory between stations
- Prices converge toward stable state

**But equilibrium is fragile:**
- Droid routes are inefficient
- Consumption never stops
- Production can be disrupted
- New players create demand spikes

### Shortage Cascade

If a critical good depletes:
1. Station consumption continues from reserves
2. Reserves empty → critical mission generated
3. If not filled, station production requiring that good stops
4. This creates shortages of downstream goods
5. Economic cascade

**Example:**
- Mars Refinery runs out of hydrogen
- Cannot produce fuel
- Ships at Mars cannot refuel
- Mars becomes stranded hub
- Price of fuel at Mars skyrockets

**Player opportunity:** Haul hydrogen to Mars, break the cascade, profit enormously.

### Market Manipulation

**Can players corner markets?**

Limited by:
- Storage capacity at stations (can't stockpile infinitely)
- Droid routes provide baseline supply
- Other players can undercut

**But strategic hoarding is viable:**
- Buy up critical goods before shortage
- Sell during peak demand
- Profit from timing

---

## Player Trading Interface

### Market Terminal UI

At docked station, player sees:

```
=== MARS OLYMPUS STATION - MARKET ===
Your Credits: 125,000
Your Cargo: 35 / 50 units

COMMODITY       | BUY    | SELL   | STOCK  | TREND
----------------|--------|--------|--------|--------
Water           | 850    | 800    | 15%    | ↑↑↑
Oxygen          | 1,200  | 1,150  | 8%     | ↑↑↑
Fuel            | 300    | 280    | 45%    | ↓
Electronics     | 5,000  | 4,800  | 70%    | ↓
Food            | 600    | 550    | 25%    | ↑

TREND: Recent price movement (↑ rising, ↓ falling, → stable)
```

**Buy:** Price you pay to purchase  
**Sell:** Price you receive when selling  
**Stock:** Current inventory percentage  
**Trend:** Indicates whether good is becoming scarce

### Transaction

```typescript
interface TradeTransaction {
  good: string;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
  timestamp: Date;
}

function buyGood(player: Player, station: Station, good: string, quantity: number) {
  const price = calculateBuyPrice(station, good);
  const cost = price * quantity;
  
  // Check player can afford
  if (player.credits < cost) return { error: 'Insufficient credits' };
  
  // Check player has cargo space
  if (player.cargoUsed + quantity > player.cargoCapacity) return { error: 'Insufficient cargo space' };
  
  // Check station has stock
  if (station.inventory[good] < quantity) return { error: 'Insufficient stock' };
  
  // Execute transaction
  player.credits -= cost;
  player.cargo[good] = (player.cargo[good] || 0) + quantity;
  station.inventory[good] -= quantity;
  
  // Log transaction (affects market data)
  logTransaction({ player, station, good, quantity, price });
  
  return { success: true, cost };
}
```

---

## Data Files

### Station Data Example

```json
{
  "id": "mars_olympus_station",
  "name": "Mars Olympus Station",
  "location": {
    "referenceBody": "Mars",
    "offset": [0, 500000, 0]
  },
  "inventory": {
    "water": 150,
    "oxygen": 80,
    "fuel": 450,
    "food": 250
  },
  "storageCapacity": {
    "water": 1000,
    "oxygen": 1000,
    "fuel": 1000,
    "food": 1000
  },
  "production": [],
  "consumption": [
    { "good": "water", "unitsPerDay": 300 },
    { "good": "oxygen", "unitsPerDay": 500 },
    { "good": "food", "unitsPerDay": 200 }
  ]
}
```

---

## Testing Checklist

- [ ] Prices respond to supply/demand changes
- [ ] Droid routes execute on schedule
- [ ] Shortages generate missions
- [ ] Players can profit from inefficiencies
- [ ] No exploits (infinite money glitches)
- [ ] Market data is transparent and readable
- [ ] Economic cascades are recoverable

---

## Future Enhancements

- Dynamic droid routes (adapt slowly to player activity)
- Contract system (pre-order goods for guaranteed price)
- Futures market (speculate on future prices)
- Station upgrades (increase production/storage)
- Player-owned infrastructure (very long-term)

---

**Status:** Stub document. Needs expansion and formula refinement during implementation.
