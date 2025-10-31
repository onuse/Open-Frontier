/**
 * Ship-related types
 */

import type { Position, Vector3, Quaternion } from './physics';

export interface ShipDefinition {
  id: string;
  name: string;
  manufacturer: string;
  description: string;

  // Physical
  mass_kg: number;
  cargo_capacity_units: number;
  cargo_mass_per_unit: number;

  // Propulsion
  max_thrust_newtons: number;
  fuel_capacity_units: number;
  fuel_consumption_rate: number;

  // Structure
  hull_integrity_max: number;
  armor_rating: number;

  // Economics
  base_price_credits: number;
  insurance_rate: number;
  repair_cost_per_hp: number;

  // Docking
  docking_size_class: 'small' | 'medium' | 'large';

  // 3D Model
  model_file: string;
}

export interface ShipState {
  shipId: string; // Reference to ShipDefinition

  // Current condition
  hull_integrity: number;
  fuel_current: number;

  // Cargo
  cargo: Record<string, number>; // { goodId: quantity }
  cargo_used: number;

  // Physics
  position: Position;
  velocity: Vector3;
  rotation: Quaternion;
  angular_velocity: Vector3;

  // Status
  docked_at: string | null; // Station ID if docked
  autopilot_target: string | null; // Destination ID if autopilot active
}
