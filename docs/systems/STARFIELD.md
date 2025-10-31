# Starfield System

**Version:** 0.1  
**Status:** Design Phase

---

## Overview

The starfield provides the visual backdrop for Open Frontier—a scientifically accurate representation of the night sky using real astronomical data. Stars are **static, clickable, and scientifically accurate**.

This document covers:
- Star catalog data source
- Rendering approach
- Interactive features (clicking stars)
- Visual fidelity options
- Performance optimization

---

## Design Philosophy

**Scientifically Grounded:**
- Use real star positions from astronomical catalogs
- Accurate distances and brightnesses
- Proper star names and classifications

**Gameplay Relevant:**
- Stars are clickable for navigation
- Nearby stars can be destinations
- Provides spatial orientation cues

**Performance Conscious:**
- Static geometry (stars don't move relative to each other)
- Single draw call for all stars
- Minimal computational overhead

---

## Data Source: Hipparcos Star Catalog

### The Hipparcos Catalog

The **Hipparcos catalog** (ESA, 1997) contains precise measurements of ~118,000 stars:
- Right Ascension (RA) and Declination (Dec) coordinates
- Apparent magnitude (brightness as seen from Earth)
- Distance (in parsecs)
- Spectral classification
- Proper names (for notable stars)

**License:** Public domain, freely available

### Subset Selection

For performance and visual clarity, use only visible stars:

**Criteria:**
- Apparent magnitude < 6.5 (naked-eye visible from Earth)
- Results in ~9,000 stars
- File size: ~2-5 MB as JSON

**Rationale:**
- Fainter stars are imperceptible at typical screen resolutions
- More stars = more clutter without visual benefit
- Can always add fainter stars later if needed

### Data Format

```json
{
  "stars": [
    {
      "id": "HIP_71683",
      "name": "Alpha Centauri A",
      "common_name": "Rigil Kentaurus",
      "ra": 219.902,
      "dec": -60.834,
      "magnitude": -0.01,
      "distance_ly": 4.37,
      "distance_pc": 1.34,
      "spectral_type": "G2V",
      "color_index": 0.65
    },
    {
      "id": "HIP_0",
      "name": "Sol",
      "common_name": "The Sun",
      "ra": 0.0,
      "dec": 0.0,
      "magnitude": -26.74,
      "distance_ly": 0.0,
      "spectral_type": "G2V",
      "color_index": 0.65,
      "is_current_system": true
    },
    ...
  ]
}
```

**Special entries:**
- Sol (our Sun) included with magnitude adjusted for when viewed from other systems
- Notable nearby stars flagged for gameplay purposes

---

## Coordinate System

### Celestial Coordinates

Stars are defined in **equatorial coordinates:**
- **Right Ascension (RA):** 0° to 360° (like longitude)
- **Declination (Dec):** -90° to +90° (like latitude)

### Conversion to 3D Space

Convert RA/Dec to Cartesian coordinates on a celestial sphere:

```typescript
function celestialToCartesian(
  ra: number,    // degrees
  dec: number,   // degrees
  radius: number = 10000  // arbitrary large distance
): Vector3 {
  // Convert degrees to radians
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  
  // Spherical to Cartesian conversion
  const x = radius * Math.cos(decRad) * Math.cos(raRad);
  const y = radius * Math.sin(decRad);
  const z = -radius * Math.cos(decRad) * Math.sin(raRad);
  
  return new Vector3(x, y, z);
}
```

**Note:** Radius is arbitrary (e.g., 10,000 units). Stars are so far away that parallax is negligible for gameplay purposes. We just need them "far enough" that they don't interfere with game geometry.

---

## Rendering Implementation

### Basic Approach

Use Three.js `Points` for efficient rendering:

```typescript
interface StarData {
  position: Vector3;
  magnitude: number;
  colorIndex: number;
  catalogId: string;
}

function createStarfield(catalog: StarCatalogEntry[]): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const catalogIds: string[] = [];
  
  for (const star of catalog) {
    // Convert to 3D position
    const pos = celestialToCartesian(star.ra, star.dec, 10000);
    positions.push(pos.x, pos.y, pos.z);
    
    // Color based on spectral type
    const color = spectralTypeToColor(star.spectral_type);
    colors.push(color.r, color.g, color.b);
    
    // Size based on magnitude (brighter = larger)
    const size = magnitudeToSize(star.magnitude);
    sizes.push(size);
    
    // Store catalog ID for interaction
    catalogIds.push(star.id);
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  
  // Store catalog IDs as user data
  geometry.userData.catalogIds = catalogIds;
  
  const material = new THREE.PointsMaterial({
    size: 2.0,
    sizeAttenuation: false,  // Stars don't get smaller with distance
    vertexColors: true,
    transparent: true,
    opacity: 0.9
  });
  
  const starfield = new THREE.Points(geometry, material);
  return starfield;
}
```

### Magnitude to Visual Size

Brighter stars should appear larger:

```typescript
function magnitudeToSize(magnitude: number): number {
  // Apparent magnitude scale (lower = brighter)
  // Brightest stars: magnitude -1 to 0
  // Dimmest visible: magnitude 6
  
  // Invert so brighter = larger
  const brightness = 6.5 - magnitude;
  
  // Map to pixel size (1-10 pixels)
  const size = Math.max(1.0, Math.min(10.0, brightness * 1.5));
  
  return size;
}
```

### Spectral Type to Color

Stars have different colors based on temperature:

```typescript
function spectralTypeToColor(spectralType: string): THREE.Color {
  // Spectral types: O B A F G K M (hottest to coolest)
  // "Oh Be A Fine Girl/Guy, Kiss Me"
  
  const type = spectralType.charAt(0).toUpperCase();
  
  switch (type) {
    case 'O': return new THREE.Color(0.6, 0.7, 1.0);  // Blue
    case 'B': return new THREE.Color(0.7, 0.8, 1.0);  // Blue-white
    case 'A': return new THREE.Color(0.9, 0.9, 1.0);  // White
    case 'F': return new THREE.Color(1.0, 0.95, 0.9); // Yellow-white
    case 'G': return new THREE.Color(1.0, 0.9, 0.7);  // Yellow (like our Sun)
    case 'K': return new THREE.Color(1.0, 0.8, 0.6);  // Orange
    case 'M': return new THREE.Color(1.0, 0.6, 0.5);  // Red
    default:  return new THREE.Color(1.0, 1.0, 1.0);  // White fallback
  }
}
```

---

## Interactive Features

### Clicking Stars

Stars should be clickable for navigation and information:

```typescript
interface StarClickHandler {
  onStarClick: (star: StarCatalogEntry) => void;
}

function setupStarInteraction(
  camera: THREE.Camera,
  starfield: THREE.Points,
  catalog: StarCatalogEntry[],
  handler: StarClickHandler
): void {
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 50; // Click tolerance in pixels
  
  window.addEventListener('click', (event) => {
    // Convert mouse position to normalized device coordinates
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    // Raycast from camera through mouse position
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(starfield);
    
    if (intersects.length > 0) {
      const intersection = intersects[0];
      const index = intersection.index;
      
      // Get star data from catalog
      const catalogId = starfield.geometry.userData.catalogIds[index];
      const star = catalog.find(s => s.id === catalogId);
      
      if (star) {
        handler.onStarClick(star);
      }
    }
  });
}
```

### Star Information Panel

When a star is clicked, display information:

```typescript
function displayStarInfo(star: StarCatalogEntry): void {
  // Example UI panel content
  const info = `
    ===== STAR INFORMATION =====
    Name: ${star.common_name || star.name}
    Catalog ID: ${star.id}
    
    Distance: ${star.distance_ly.toFixed(2)} light-years
    Spectral Type: ${star.spectral_type}
    Apparent Magnitude: ${star.magnitude.toFixed(2)}
    
    [SET AS NAVIGATION TARGET]
    [CLOSE]
  `;
  
  // Show in HUD overlay
  showInfoPanel(info);
}
```

### Navigation Targeting

Allow players to set stars as destinations:

```typescript
function setNavigationTarget(star: StarCatalogEntry): void {
  // Calculate direction to star
  const direction = celestialToCartesian(star.ra, star.dec, 1.0); // Unit vector
  
  // Update ship's autopilot
  autopilot.setDestination({
    type: 'interstellar',
    targetStar: star.id,
    targetName: star.common_name || star.name,
    direction: direction,
    distance_ly: star.distance_ly,
    eta_days: calculateTravelTime(star.distance_ly)
  });
  
  // Update HUD
  hud.showNavigationTarget(star.common_name || star.name);
}
```

---

## Visual Enhancements

### Phase 0: Minimal

**Keep it simple:**
- White points
- Size varies by magnitude
- No color, no effects

**Benefits:**
- Fast to implement
- Guaranteed performance
- Focuses on gameplay, not visuals

### Phase 1: Color

**Add spectral colors:**
- Blue giants (O, B types)
- Yellow stars like Sol (G type)
- Red dwarfs (M type)

**Implementation:** Use `spectralTypeToColor()` function above

### Phase 2: Subtle Twinkling

**Add atmosphere-like shimmer:**

```glsl
// Vertex shader
varying float vFlicker;

void main() {
  // Pseudo-random flicker based on position and time
  vFlicker = 0.8 + 0.2 * sin(position.x * 1000.0 + uTime * 2.0);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * vFlicker;
}

// Fragment shader
varying float vFlicker;

void main() {
  float alpha = 0.9 * vFlicker;
  gl_FragColor = vec4(color, alpha);
}
```

**Subtlety is key:** Too much twinkling is distracting and unrealistic (stars don't twinkle in space).

### Phase 3: Bloom for Bright Stars

**Post-processing effect:**
- Extract bright stars (magnitude < 2)
- Apply Gaussian blur
- Composite back onto scene

**Note:** This is expensive. Only implement if performance allows.

---

## Orientation and Camera

### Stars Are Static

**Critical point:** Stars don't move in the scene. The camera rotates around the player ship.

**Implementation:**
- Starfield positioned at ship location (but infinitely far away)
- Camera rotation updates, starfield rotates with camera
- Stars never need position updates (zero CPU cost)

### Parallax

**Should stars show parallax as ship moves?**

**Short answer: No.**

Stars are so far away (light-years) that even traveling millions of kilometers produces imperceptible parallax. Only when traveling light-years do star positions noticeably shift.

**Implementation decision:** Stars remain fixed unless/until interstellar travel is implemented. Even then, parallax can be faked by interpolating star positions when switching star systems.

---

## Data Loading and Initialization

### Load Star Catalog

```typescript
async function loadStarCatalog(): Promise<StarCatalogEntry[]> {
  const response = await fetch('/data/stars/hipparcos_visible.json');
  const catalog = await response.json();
  
  // Validate and process
  return catalog.stars.map((star: any) => ({
    id: star.id,
    name: star.name,
    common_name: star.common_name,
    ra: star.ra,
    dec: star.dec,
    magnitude: star.magnitude,
    distance_ly: star.distance_ly,
    spectral_type: star.spectral_type || 'G2V'
  }));
}
```

### Initialization Sequence

```typescript
async function initializeStarfield(): Promise<THREE.Points> {
  // 1. Load catalog
  const catalog = await loadStarCatalog();
  console.log(`Loaded ${catalog.length} stars`);
  
  // 2. Create geometry
  const starfield = createStarfield(catalog);
  
  // 3. Add to scene
  scene.add(starfield);
  
  // 4. Setup interaction
  setupStarInteraction(camera, starfield, catalog, {
    onStarClick: (star) => {
      displayStarInfo(star);
    }
  });
  
  return starfield;
}
```

---

## Performance Considerations

### Rendering Cost

**~9,000 stars as points:**
- Single draw call
- Minimal GPU load (~0.1ms at 1080p)
- No impact on physics simulation

**Bottleneck: None.** This is trivial for modern GPUs.

### Memory Cost

**Star catalog:**
- ~9,000 stars × ~100 bytes/star = ~900 KB
- Geometry buffers: ~200 KB
- Total: ~1.1 MB

**Negligible.**

### Optimization (If Needed)

**Frustum culling:** Not necessary (stars are always visible)  
**LOD:** Not applicable (stars are points)  
**Instancing:** Not needed (already using efficient point rendering)

**Conclusion:** No optimization needed. This is a solved problem.

---

## Future Enhancements

### Phase 2+:

1. **Constellations:** Draw lines between stars to show traditional constellations
2. **Star labels:** Show names for brightest stars (magnitude < 2)
3. **Galactic plane visualization:** Subtle Milky Way band
4. **Nebulae:** Add famous nebulae as textured sprites
5. **Dynamic star positions:** Update positions when traveling interstellar distances

### Phase 3+:

1. **Procedural galaxy:** Generate millions of background stars procedurally
2. **3D star distribution:** Volume rendering for distant stars
3. **Scientific visualization:** Show star temperatures, luminosities, etc.

### Far Future:

1. **Entire galaxy explorable:** Procedurally generate star systems
2. **Stellar evolution:** Stars age and change over very long timescales
3. **VR support:** Immersive star exploration

---

## Data Sources and Tools

### Obtaining Hipparcos Data

**ESA Hipparcos Catalog:**
- https://www.cosmos.esa.int/web/hipparcos
- Direct catalog access (needs processing)

**Pre-processed alternatives:**
- Astronexus HYG Database: https://github.com/astronexus/HYG-Database
- Includes Hipparcos, Yale Bright Star Catalog, Gliese Nearby Star Catalog
- CSV format, easy to convert to JSON

**Recommended:** Use HYG Database v3.7 or later
- Well-maintained
- Already filtered and cleaned
- Includes proper names

### Data Processing Pipeline

```bash
# Example: Convert HYG CSV to JSON subset
cat hygdata_v37.csv | \
  awk -F',' '$14 < 6.5 { print }' | \  # Filter magnitude < 6.5
  jq -R 'split(",") | {
    id: ("HIP_" + .[1]),
    name: (.[6] // ""),
    ra: (.[7] | tonumber),
    dec: (.[8] | tonumber),
    magnitude: (.[13] | tonumber),
    distance_ly: ((.[9] | tonumber) * 3.262),
    spectral_type: (.[15] // "G2V")
  }' | \
  jq -s '{stars: .}' > hipparcos_visible.json
```

---

## Testing Checklist

- [ ] All ~9,000 stars render correctly
- [ ] Star colors match spectral types
- [ ] Brighter stars appear larger
- [ ] Stars clickable with reasonable tolerance
- [ ] Star info panel displays correct data
- [ ] Navigation targeting works
- [ ] Performance: 60fps maintained with starfield
- [ ] No visual glitches when rotating camera
- [ ] Stars remain fixed relative to each other

---

## Example Implementation Stub

```typescript
// File: /src/starfield.ts

import * as THREE from 'three';

export interface StarCatalogEntry {
  id: string;
  name: string;
  common_name?: string;
  ra: number;
  dec: number;
  magnitude: number;
  distance_ly: number;
  spectral_type: string;
}

export class Starfield {
  private points: THREE.Points;
  private catalog: StarCatalogEntry[];
  
  constructor(catalog: StarCatalogEntry[]) {
    this.catalog = catalog;
    this.points = this.createStarfield(catalog);
  }
  
  private createStarfield(catalog: StarCatalogEntry[]): THREE.Points {
    // Implementation as described above
    // ...
  }
  
  public setupInteraction(camera: THREE.Camera, onStarClick: (star: StarCatalogEntry) => void): void {
    // Implementation as described above
    // ...
  }
  
  public getPoints(): THREE.Points {
    return this.points;
  }
}

// Usage:
// const starfield = new Starfield(catalog);
// scene.add(starfield.getPoints());
// starfield.setupInteraction(camera, handleStarClick);
```

---

## Conclusion

The starfield system is **simple, scientifically accurate, and performance-friendly**. It uses real astronomical data, renders efficiently, and provides gameplay-relevant interaction.

**Key takeaways:**
1. Use real star catalog (Hipparcos/HYG)
2. Render as static points (no updates needed)
3. Make stars clickable for navigation
4. Keep visual effects subtle and performant
5. This is a solved problem—don't overthink it

**Next steps:**
1. Obtain/convert star catalog data
2. Implement basic point rendering
3. Add click interaction
4. Enhance visuals iteratively

The starfield is one of the easiest systems to implement well. Stars are distant, static, and well-documented. This is a win.

---

**Status:** Complete design. Ready for implementation in Phase 0.
