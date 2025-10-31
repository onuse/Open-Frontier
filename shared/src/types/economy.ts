/**
 * Economy-related types
 */

export interface TradeGood {
  id: string;
  name: string;
  category: 'volatiles' | 'fuel' | 'raw_materials' | 'manufactured' | 'luxury' | 'contraband';
  basePrice: number; // Credits per unit
  volumePerUnit: number; // Cubic meters
  massPerUnit: number; // Kilograms
  description: string;
  legal: boolean;
}

export interface MarketData {
  inventory: Record<string, number>;
  prices: Record<
    string,
    {
      buy: number;
      sell: number;
    }
  >;
  trend: Record<string, 'up' | 'down' | 'stable'>;
}

export interface TradeTransaction {
  action: 'buy' | 'sell';
  good: string;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
  timestamp: Date;
}
