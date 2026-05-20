export type CellType = 'EMPTY' | 'TREE' | 'PLANT' | 'HOUSE' | 'BUILDING' | 'FACTORY';

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  temperature: number; // calculated °C
  co2: number; // calculated ppm
  humidity: number; // calculated %
}

export interface DroneTelemetry {
  altitude: number; // meters
  temperature: number; // °C
  humidity: number; // %
  co2: number; // ppm
  heatIndex: number; // score calculated
  heatLevel: 'Excelente' | 'Normal' | 'Precaución' | 'Crítico';
  thermalCamera: number[][]; // 5x5 subgrid of thermal camera POV
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  gridTypes: CellType[][];
}
