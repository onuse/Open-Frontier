# Planetary Bodies System

**Version:** 0.1  
**Status:** Design Phase

---

## Overview

Planetary bodies in Open Frontier use a **low-polygon aesthetic** inspired by 1993-era space sims (Frontier: Elite II), but with modern rendering quality. Everything is data-driven—planets are defined in JSON files, making them easy to edit, generate, and mod.

This document covers:
- Visual aesthetic and fidelity targets
- Geometry specifications
- Procedural generation from data files
- Rendering approach
- Atmosphere and cloud effects
- Performance considerations

---

## Design Philosophy

### Aesthetic Goals

**"1993 standards, but a bit more":**
- Simple geometric primitives (spheres, displaced vertices)
- Flat or smooth-shaded polygons with vertex colors
- No textures (prevents fidelity arms race)
- Clear, readable silhouettes
- Made with love, not realism

**What this means:**
- Low triangle count (500-1000 triangles per planet)
- Distinct color regions (biomes)
- Subtle geometric variation (mountains, valleys)
- Simple atmospheric effects (gradient shaders)
- Optional cloud layers (flat-bottom style)

**What to AVOID:**
- Photo-realistic textures
- Normal maps or bump maps
- Complex shaders (PBR, SSR, etc.)
- High-poly meshes (breaks aesthetic)
- Dynamic weather or cloud systems

### Data-Driven Everything

**All planets defined in JSON:**
- Radius, mass, rotation period
- Surface biome definitions (colors, elevation)
- Atmosphere properties (color, density)
- Cloud layer properties (if any)
- Orbital parameters

**Benefits:**
- Easy to create new planets
- Modding-friendly
- Tooling can generate/import/export
- No code changes needed for content

---

## Geometry Specifications

### Planet Triangle Budget

**Per planetary body:**

| Component | Triangles | Notes |
|-----------|-----------|-------|
| Base sphere | 500 | IcoSphere with 3 subdivisions |
| Cloud layer | 100 | Optional, lower detail |
| Atmosphere | 200 | Outer shell, transparent |
| **Total** | **~800** | Per planet |

**Rendering 10 planets simultaneously: ~8,000 triangles**  
(Trivial for modern GPUs)

### Base Sphere Geometry

Use **IcoSphere** (subdivided icosahedron) for even triangle distribution:

```typescript
// Three.js geometry
const geometry = new THREE.IcosahedronGeometry(
  radius,        // Planet radius in meters
  3              // Subdivision level (3 = ~500 triangles)
);
```

**Why IcoSphere:**
- Even triangle distribution (no poles like UV sphere)
- Clean geometric look
- Predictable vertex count
- Easy to displace for terrain

**Alternatives:**
- Octahedron subdivided (fewer triangles, more geometric)
- Custom hand-modeled spheres (for unique planets)

### Terrain Displacement

Vertices displaced along their normals to create elevation:

```typescript
function displaceTerrain(
  geometry: THREE.IcosahedronGeometry,
  heightMap: number[]  // One value per vertex (0-1 range)
): void {
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  
  for (let i = 0; i < positions.count; i++) {
    const height = heightMap[i];
    const displacement = (height - 0.5) * maxDisplacement;
    
    positions.setXYZ(
      i,
      positions.getX(i) + normals.getX(i) * displacement,
      positions.getY(i) + normals.getY(i) * displacement,
      positions.getZ(i) + normals.getZ(i) * displacement
    );
  }
  
  geometry.computeVertexNormals();  // Recalculate after displacement
}
```

**Displacement amount:**
- Earth-like: ±5% of radius (±300 km for Earth)
- Mountainous: ±8% of radius
- Smooth/ocean: ±2% of radius

**Keeps geometric look:** Displacement is subtle enough that you can still see the underlying polygon structure.

---

## Data Format

### Planet Definition (JSON)

```json
{
  "id": "earth",
  "name": "Earth",
  "type": "terrestrial",
  
  "physical": {
    "radius_km": 6371,
    "mass_kg": 5.972e24,
    "rotation_period_hours": 24,
    "axial_tilt_degrees": 23.5
  },
  
  "orbit": {
    "parent_body": "Sol",
    "semi_major_axis_km": 149597870,
    "eccentricity": 0.0167,
    "orbital_period_days": 365.25,
    "inclination_degrees": 0.0
  },
  
  "surface": {
    "subdivisions": 3,
    "displacement_percent": 5.0,
    "biomes": [
      {
        "name": "ocean",
        "color": "#1a4d7a",
        "elevation_range": [0.0, 0.45],
        "coverage_percent": 70
      },
      {
        "name": "lowland",
        "color": "#3a7a3a",
        "elevation_range": [0.45, 0.55],
        "coverage_percent": 20
      },
      {
        "name": "highland",
        "color": "#6b5a3a",
        "elevation_range": [0.55, 0.7],
        "coverage_percent": 8
      },
      {
        "name": "mountain",
        "color": "#8a8a8a",
        "elevation_range": [0.7, 1.0],
        "coverage_percent": 2
      }
    ],
    "seed": 42
  },
  
  "atmosphere": {
    "present": true,
    "color": "#6ba3d4",
    "density": 0.3,
    "scale_height_km": 100,
    "radius_percent": 110
  },
  
  "clouds": {
    "present": true,
    "color": "#ffffff",
    "opacity": 0.6,
    "altitude_km": 10,
    "rotation_multiplier": 0.8,
    "coverage_percent": 50,
    "seed": 43
  }
}
```

### Biome System

**Biomes define color by elevation:**
- Ocean: 0.0 - 0.45 elevation (70% of surface)
- Lowland: 0.45 - 0.55 elevation (20% of surface)
- Highland: 0.55 - 0.7 elevation (8% of surface)
- Mountain: 0.7 - 1.0 elevation (2% of surface)

**Vertex colors assigned based on displacement:**
```typescript
function assignBiomeColors(
  geometry: THREE.BufferGeometry,
  biomes: Biome[],
  heightMap: number[]
): void {
  const colors: number[] = [];
  
  for (let i = 0; i < heightMap.length; i++) {
    const height = heightMap[i];
    
    // Find matching biome
    const biome = biomes.find(b => 
      height >= b.elevation_range[0] && 
      height < b.elevation_range[1]
    );
    
    const color = new THREE.Color(biome.color);
    colors.push(color.r, color.g, color.b);
  }
  
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
}
```

**Result:** Distinct color bands at different elevations, like a topographic map made solid.

---

## Procedural Generation

### Height Map Generation

Use **simplex noise** (or similar) to generate terrain:

```typescript
import { createNoise3D } from 'simplex-noise';

function generateHeightMap(
  geometry: THREE.IcosahedronGeometry,
  seed: number,
  octaves: number = 4
): number[] {
  const noise = createNoise3D(() => seed);
  const positions = geometry.attributes.position;
  const heightMap: number[] = [];
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Normalize position to unit sphere
    const nx = x / Math.sqrt(x*x + y*y + z*z);
    const ny = y / Math.sqrt(x*x + y*y + z*z);
    const nz = z / Math.sqrt(x*x + y*y + z*z);
    
    // Multi-octave noise for varied terrain
    let height = 0;
    let amplitude = 1;
    let frequency = 1;
    
    for (let oct = 0; oct < octaves; oct++) {
      height += noise(nx * frequency, ny * frequency, nz * frequency) * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    
    // Normalize to 0-1 range
    height = (height + 1) / 2;
    heightMap.push(height);
  }
  
  return heightMap;
}
```

**Octaves = detail level:**
- 1 octave: smooth blobs
- 4 octaves: varied terrain with detail
- 8 octaves: very detailed (may be too busy)

**Recommended: 3-4 octaves** for good balance.

### Planet Generation Pipeline

```typescript
function generatePlanet(definition: PlanetDefinition): THREE.Group {
  const group = new THREE.Group();
  
  // 1. Create base sphere geometry
  const geometry = new THREE.IcosahedronGeometry(
    definition.physical.radius_km * 1000,  // Convert to meters
    definition.surface.subdivisions
  );
  
  // 2. Generate height map
  const heightMap = generateHeightMap(
    geometry,
    definition.surface.seed,
    4  // octaves
  );
  
  // 3. Displace vertices
  displaceTerrain(
    geometry,
    heightMap,
    definition.physical.radius_km * 1000 * (definition.surface.displacement_percent / 100)
  );
  
  // 4. Assign biome colors
  assignBiomeColors(geometry, definition.surface.biomes, heightMap);
  
  // 5. Create material
  const material = new THREE.MeshPhongMaterial({
    vertexColors: true,
    flatShading: false,  // Smooth shading for "one step further"
    shininess: 10
  });
  
  const planet = new THREE.Mesh(geometry, material);
  group.add(planet);
  
  // 6. Add atmosphere (if present)
  if (definition.atmosphere.present) {
    const atmosphere = createAtmosphere(definition);
    group.add(atmosphere);
  }
  
  // 7. Add clouds (if present)
  if (definition.clouds.present) {
    const clouds = createClouds(definition);
    group.add(clouds);
  }
  
  return group;
}
```

---

## Atmosphere Rendering

### Simple Gradient Shader

Atmosphere as transparent outer sphere with edge glow:

```typescript
function createAtmosphere(definition: PlanetDefinition): THREE.Mesh {
  const radius = definition.physical.radius_km * 1000;
  const atmosRadius = radius * (definition.atmosphere.radius_percent / 100);
  
  const geometry = new THREE.IcosahedronGeometry(atmosRadius, 2);  // Lower detail
  
  const material = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,  // Render inside
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 atmosColor;
      uniform float density;
      varying vec3 vNormal;
      
      void main() {
        // Fresnel-like effect: more opaque at edges
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        gl_FragColor = vec4(atmosColor, intensity * density);
      }
    `,
    uniforms: {
      atmosColor: { value: new THREE.Color(definition.atmosphere.color) },
      density: { value: definition.atmosphere.density }
    }
  });
  
  return new THREE.Mesh(geometry, material);
}
```

**Result:** Soft glow around planet edges, darker toward center. Very cheap to render.

---

## Cloud Layer

### Flat-Bottom Clouds (Frontier Style)

Clouds as semi-transparent sphere with procedural coverage:

```typescript
function createClouds(definition: PlanetDefinition): THREE.Mesh {
  const radius = definition.physical.radius_km * 1000;
  const cloudRadius = radius + (definition.clouds.altitude_km * 1000);
  
  const geometry = new THREE.IcosahedronGeometry(cloudRadius, 2);  // Low detail
  
  // Generate cloud coverage map
  const cloudMap = generateCloudMap(geometry, definition.clouds.seed);
  
  // Assign vertex alpha based on coverage
  const colors: number[] = [];
  const cloudColor = new THREE.Color(definition.clouds.color);
  
  for (let i = 0; i < cloudMap.length; i++) {
    const coverage = cloudMap[i];  // 0-1
    colors.push(cloudColor.r, cloudColor.g, cloudColor.b, coverage * definition.clouds.opacity);
  }
  
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
  
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    side: THREE.FrontSide
  });
  
  const clouds = new THREE.Mesh(geometry, material);
  
  // Clouds rotate at different speed than planet
  clouds.userData.rotationMultiplier = definition.clouds.rotation_multiplier;
  
  return clouds;
}

function generateCloudMap(
  geometry: THREE.IcosahedronGeometry,
  seed: number
): number[] {
  const noise = createNoise3D(() => seed);
  const positions = geometry.attributes.position;
  const cloudMap: number[] = [];
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const nx = x / Math.sqrt(x*x + y*y + z*z);
    const ny = y / Math.sqrt(x*x + y*y + z*z);
    const nz = z / Math.sqrt(x*x + y*y + z*z);
    
    // Single octave for cloud patterns
    let coverage = noise(nx * 3, ny * 3, nz * 3);
    coverage = (coverage + 1) / 2;  // Normalize to 0-1
    
    // Threshold for sparse coverage
    coverage = coverage > 0.5 ? (coverage - 0.5) * 2 : 0;
    
    cloudMap.push(coverage);
  }
  
  return cloudMap;
}
```

**Animation:**
Clouds rotate slowly:
```typescript
function updateClouds(clouds: THREE.Mesh, planetRotation: number, dt: number): void {
  const multiplier = clouds.userData.rotationMultiplier;
  clouds.rotation.y = planetRotation * multiplier;
}
```

---

## Shading and Lighting

### Smooth vs. Flat Shading

**Flat shading (Frontier style):**
```typescript
material.flatShading = true;
```
- Each triangle has uniform color
- Very geometric look
- Shows polygon structure clearly

**Smooth shading ("one step further"):**
```typescript
material.flatShading = false;
geometry.computeVertexNormals();
```
- Gradients across triangles
- Softer appearance
- Still clearly low-poly

**Recommendation: Smooth shading** for that "one step further" feel, while keeping triangle count low enough to preserve geometric aesthetic.

### Lighting Model

**Use Phong lighting:**
```typescript
const material = new THREE.MeshPhongMaterial({
  vertexColors: true,
  flatShading: false,
  shininess: 10,        // Low shininess (matte surface)
  specular: 0x333333    // Subtle specular highlights
});
```

**Why Phong:**
- Simple and fast
- Good balance of realism and performance
- Supports specular highlights (for oceans)

**Avoid:**
- PBR materials (too realistic for aesthetic)
- Lambert (too flat, not enough depth)

### Specular Highlights (Oceans)

**Optional enhancement:**
Ocean biomes can have higher specular:

```typescript
// During biome color assignment, also set specular per vertex
// (Requires custom shader or separate ocean geometry)

// Simple approach: Make ocean biome slightly brighter
const oceanColor = new THREE.Color(0x1a4d7a).multiplyScalar(1.2);
```

---

## Planet Types and Presets

### Common Planet Types

**Terrestrial (Earth-like):**
- Ocean, land, mountains
- Atmosphere present
- Clouds present
- Blue-green-brown color palette

**Desert (Mars-like):**
- Varied reds and browns
- Thin atmosphere (if any)
- No clouds
- Rocky terrain

**Ice World:**
- White and light blue
- Smooth terrain (frozen oceans)
- Thin atmosphere
- No clouds

**Gas Giant:**
- No solid surface (just atmosphere)
- Banded colors (latitudinal stripes)
- No terrain displacement
- Thick atmosphere layer

**Barren/Moon:**
- Gray or brown
- Heavy cratering (high displacement variance)
- No atmosphere
- No clouds

### Preset Definitions

**Example: Mars**
```json
{
  "id": "mars",
  "name": "Mars",
  "type": "desert",
  "physical": {
    "radius_km": 3389.5,
    "mass_kg": 6.39e23,
    "rotation_period_hours": 24.6
  },
  "surface": {
    "subdivisions": 3,
    "displacement_percent": 8.0,
    "biomes": [
      {
        "name": "lowland",
        "color": "#c1440e",
        "elevation_range": [0.0, 0.5],
        "coverage_percent": 60
      },
      {
        "name": "highland",
        "color": "#a0522d",
        "elevation_range": [0.5, 0.8],
        "coverage_percent": 35
      },
      {
        "name": "mountain",
        "color": "#8b4513",
        "elevation_range": [0.8, 1.0],
        "coverage_percent": 5
      }
    ],
    "seed": 1337
  },
  "atmosphere": {
    "present": true,
    "color": "#d4a373",
    "density": 0.1,
    "radius_percent": 105
  },
  "clouds": {
    "present": false
  }
}
```

---

## Level of Detail (LOD)

### Distance-Based Simplification

Planets far from camera can use lower subdivision:

```typescript
function selectPlanetLOD(distanceToCamera: number, planetRadius: number): number {
  const ratio = distanceToCamera / planetRadius;
  
  if (ratio < 10) return 3;      // Close: 500 triangles
  if (ratio < 100) return 2;     // Medium: 125 triangles
  if (ratio < 1000) return 1;    // Far: 32 triangles
  return 0;                      // Very far: 8 triangles (octahedron)
}
```

**Note:** This is optional optimization. With our triangle budget, even rendering all planets at max detail is cheap.

---

## Rendering Order and Transparency

### Render Queue

**Correct rendering order:**
1. Planet surface (opaque)
2. Atmosphere (transparent)
3. Clouds (transparent)

**Implementation:**
```typescript
planet.renderOrder = 0;
atmosphere.renderOrder = 1;
clouds.renderOrder = 2;
```

### Depth Sorting

Three.js handles transparent object sorting automatically, but:
- Render back-to-front
- Atmosphere uses `BackSide` rendering (inside-out)

---

## Performance Considerations

### Triangle Count Budget

**10 planets in view:**
- 10 × 800 triangles = 8,000 triangles
- **Negligible** for modern GPUs (can render 1M+ easily)

### Draw Calls

**Each planet = 3 draw calls:**
1. Surface mesh
2. Atmosphere (if present)
3. Clouds (if present)

**10 planets = ~30 draw calls**
- Acceptable for modern rendering

**Optimization (if needed):**
- Batch planets into single geometry (complex)
- Use instancing for repeated geometry (not applicable here)

**Conclusion:** No optimization needed.

### Memory

**Per planet:**
- Geometry buffers: ~50 KB
- Textures: 0 KB (no textures!)
- Shaders: Shared across all planets

**10 planets: ~500 KB**
- Trivial

---

## Tooling and Workflow

### Planet Editor (Future)

**Desired tool:**
- GUI to edit planet JSON
- Live preview of generated planet
- Tweak colors, displacement, atmosphere
- Export to JSON

**Implementation:**
- Web-based tool (React + Three.js)
- Load planet JSON
- Render preview
- Edit sliders, see updates in real-time
- Export modified JSON

### Import/Export

**Planet mesh export:**
```typescript
function exportPlanetToOBJ(planet: THREE.Mesh): string {
  // Convert geometry to OBJ format
  const exporter = new OBJExporter();
  return exporter.parse(planet);
}
```

**Import custom mesh:**
```typescript
function importCustomPlanetMesh(objData: string): THREE.Mesh {
  const loader = new OBJLoader();
  const mesh = loader.parse(objData);
  // Assign vertex colors, materials, etc.
  return mesh;
}
```

**Use case:** Artists can hand-model planets in Blender, export as OBJ, import into game with colors preserved.

---

## Example Planet Gallery

### Visual Reference

**Earth:**
- 70% blue ocean
- 20% green lowland
- 8% brown highland
- 2% white/gray mountains
- Blue atmosphere
- White clouds (50% coverage)

**Mars:**
- 60% rust-red lowland
- 35% darker red highland
- 5% brown mountains
- Thin orange atmosphere
- No clouds

**Europa (Ice Moon):**
- 80% white ice
- 15% light blue ice
- 5% darker blue cracks
- No atmosphere
- No clouds

**Jupiter:**
- Banded colors (orange, brown, white)
- No terrain (gas giant)
- Thick yellow-orange atmosphere
- No clouds (atmosphere itself is "cloudy")

---

## Testing Checklist

- [ ] Planets render with correct colors
- [ ] Terrain displacement creates visible mountains/valleys
- [ ] Biome colors transition smoothly
- [ ] Atmosphere renders with edge glow
- [ ] Clouds are semi-transparent and rotate
- [ ] Planet rotation works correctly
- [ ] Performance: 60fps with 10 planets visible
- [ ] JSON definitions load correctly
- [ ] Procedural generation is deterministic (same seed = same planet)

---

## Future Enhancements

### Phase 2+:

1. **Surface detail on approach:** More subdivisions when very close
2. **City lights:** Glow on night side of inhabited planets
3. **Ring systems:** For gas giants (Saturn-style)
4. **Asteroid fields:** Procedurally placed rocks around planets
5. **Surface features:** Volcanoes, craters (vertex displacement)

### Phase 3+:

1. **Planetary surface landing:** Transition from orbit to surface view
2. **Biome transitions:** Smooth color blending between biomes
3. **Day/night cycle:** Lighting changes as planet rotates
4. **Eclipse effects:** Shadows from moons/planets

### Far Future:

1. **Plate tectonics:** Very long-term continental drift
2. **Climate simulation:** Biome changes over time
3. **Terraforming:** Player-driven planetary changes

---

## Data File Location

```
/data
  /planets
    earth.json
    mars.json
    europa.json
    jupiter.json
    ...
```

Each file contains complete planet definition as shown in examples above.

---

## Conclusion

The planetary body system balances **aesthetic coherence** with **technical simplicity**:

- Low polygon count maintains geometric look
- Vertex colors avoid texture complexity
- Procedural generation from simple JSON
- Data-driven approach enables modding
- Performance is not a concern (trivial triangle count)

**Key principle:** Restrain fidelity intentionally. More triangles or textures would break the aesthetic. The beauty is in the simplicity and clarity of form.

**Next steps:**
1. Implement basic sphere generation
2. Add terrain displacement
3. Assign biome colors
4. Add atmosphere shader
5. Add cloud layer
6. Create initial planet definitions (Earth, Mars, Moon)
7. Iterate on visual style

The planets should feel like **playful, geometric interpretations** of real worlds, not simulations. Think: "This is what Earth would look like if you made it out of colored cardboard and love."

---

**Status:** Complete design. Ready for implementation in Phase 0.
