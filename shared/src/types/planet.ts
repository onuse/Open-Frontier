/**
 * Planet-related types
 */

export interface PlanetDefinition {
  id: string;
  name: string;
  type: 'terrestrial' | 'desert' | 'ice' | 'gas_giant' | 'barren';

  physical: {
    radius_km: number;
    mass_kg: number;
    rotation_period_hours: number;
    axial_tilt_degrees?: number;
  };

  orbit?: {
    parent_body: string;
    semi_major_axis_km: number;
    eccentricity: number;
    orbital_period_days: number;
    inclination_degrees: number;
  };

  surface: {
    subdivisions: number; // IcoSphere subdivision level
    displacement_percent: number;
    biomes: Biome[];
    seed: number; // For procedural generation
  };

  atmosphere: {
    present: boolean;
    color?: string;
    density?: number;
    scale_height_km?: number;
    radius_percent?: number;
  };

  clouds?: {
    present: boolean;
    color?: string;
    opacity?: number;
    altitude_km?: number;
    rotation_multiplier?: number;
    coverage_percent?: number;
    seed?: number;
  };
}

export interface Biome {
  name: string;
  color: string; // Hex color
  elevation_range: [number, number]; // 0-1 range
  coverage_percent: number;
}
