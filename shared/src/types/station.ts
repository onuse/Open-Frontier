/**
 * Station-related types
 */

import type { Position, Quaternion, Vector3 } from './physics';

export interface StationDefinition {
  id: string;
  name: string;
  station_type: 'habitat' | 'refinery' | 'mining' | 'industrial' | 'research';
  description: string;

  // Location
  orbit: {
    parent_body: string;
    altitude_km: number;
    inclination_degrees: number;
    period_hours: number;
    epoch: string; // ISO date
  };

  // Rotation (artificial gravity)
  rotation: {
    rotating: boolean;
    axis: [number, number, number];
    rpm: number;
  };

  // Economy
  inventory: Record<string, number>;
  storage_capacity: Record<string, number>;
  production: ProductionRate[];
  consumption: ConsumptionRate[];

  // Services
  services: string[]; // ['market', 'repair', 'refuel', 'missions', 'shipyard']

  // 3D Model
  model_file: string;
}

export interface ProductionRate {
  good: string;
  unitsPerDay: number;
  requiresInput?: Record<string, number>;
}

export interface ConsumptionRate {
  good: string;
  unitsPerDay: number;
}

export interface DockingPort {
  id: string;
  position: Vector3; // Relative to station center
  orientation: Quaternion; // Port "forward" direction
  size_class: 'small' | 'medium' | 'large';
  type: 'axial' | 'radial';
  occupied: boolean;
  occupied_by?: string; // Player ID
}

export interface StationState {
  definition: StationDefinition;
  position: Position; // Current orbital position
  current_rotation: Quaternion;
  docking_ports: DockingPort[];
  operational: boolean;
}
