/**
 * Physics-related types
 */

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * Position relative to a reference body
 * Prevents floating-point precision loss at AU scales
 */
export interface Position {
  referenceBody: string; // ID of nearest significant body
  offset: Vector3; // Meters from reference body center
}

export interface RigidBodyState {
  position: Position;
  velocity: Vector3; // m/s
  rotation: Quaternion;
  angularVelocity: Vector3; // rad/s
  mass: number; // kg
}
