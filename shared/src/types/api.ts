/**
 * API request/response types
 */

import type { ShipState } from './ship';
import type { MarketData } from './economy';

// Game state API
export interface GameStateResponse {
  time: string; // ISO date
  ship: ShipState;
  nearbyObjects: unknown[]; // TODO: Define entity types
}

export interface GameActionRequest {
  action: 'thrust' | 'rotate' | 'dock' | 'undock';
  params: unknown; // Action-specific parameters
}

export interface GameActionResponse {
  success: boolean;
  message?: string;
  state: GameStateResponse;
}

// Market API
export interface MarketResponse {
  stationId: string;
  data: MarketData;
}

export interface TradeRequest {
  action: 'buy' | 'sell';
  good: string;
  quantity: number;
}

export interface TradeResponse {
  success: boolean;
  message?: string;
  cost: number;
  newBalance: number;
  newCargo: Record<string, number>;
}

// Mission API
export interface Mission {
  id: string;
  type: 'critical_delivery' | 'bulk_transport';
  issuer: string; // Station ID
  good: string;
  quantity: number;
  destination: string; // Station ID
  deadline: string | null; // ISO date
  reward: number;
  status: 'available' | 'accepted' | 'completed' | 'failed';
}

export interface MissionsResponse {
  stationId: string;
  missions: Mission[];
}

export interface AcceptMissionRequest {
  missionId: string;
}

export interface AcceptMissionResponse {
  success: boolean;
  message?: string;
  mission: Mission;
}
