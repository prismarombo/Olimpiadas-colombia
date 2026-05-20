import { CellType, Scenario } from "./types";

// Helper to create a grid of empty cells
export const createEmptyGridPattern = (rows: number, cols: number): CellType[][] => {
  return Array(rows).fill(null).map(() => Array(cols).fill('EMPTY'));
};

export const SCENARIOS: Scenario[] = [
  {
    id: "industrial",
    name: "Deforestación Zona Industrial",
    description: "Un sector industrial masivo de alta emisividad térmica, rodeado de edificios de concreto sin vegetación. Altos índices de CO2 y temperatura crítica.",
    gridTypes: [
      ['BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'FACTORY', 'FACTORY', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING'],
      ['BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'FACTORY', 'FACTORY', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING'],
      ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
      ['EMPTY', 'EMPTY', 'HOUSE', 'HOUSE', 'EMPTY', 'EMPTY', 'HOUSE', 'HOUSE', 'EMPTY', 'EMPTY'],
      ['FACTORY', 'EMPTY', 'HOUSE', 'HOUSE', 'EMPTY', 'EMPTY', 'HOUSE', 'HOUSE', 'EMPTY', 'FACTORY'],
      ['FACTORY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'FACTORY'],
      ['BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING'],
      ['BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING'],
      ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
      ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'TREE', 'TREE', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
    ]
  },
  {
    id: "jungle",
    name: "Jungla de Concreto (Suelo Urbano)",
    description: "Zona central metropolitana densamente poblada con edificios de oficinas altos. Retiene calor solar excesivo (asfalto y concreto plano).",
    gridTypes: [
      ['BUILDING', 'BUILDING', 'BUILDING', 'EMPTY', 'BUILDING', 'BUILDING', 'BUILDING', 'EMPTY', 'BUILDING', 'BUILDING'],
      ['BUILDING', 'BUILDING', 'BUILDING', 'EMPTY', 'BUILDING', 'BUILDING', 'BUILDING', 'EMPTY', 'BUILDING', 'BUILDING'],
      ['BUILDING', 'BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'EMPTY', 'BUILDING', 'EMPTY', 'BUILDING', 'BUILDING'],
      ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
      ['BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING'],
      ['BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING'],
      ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
      ['BUILDING', 'BUILDING', 'BUILDING', 'EMPTY', 'BUILDING', 'BUILDING', 'BUILDING', 'EMPTY', 'BUILDING', 'BUILDING'],
      ['BUILDING', 'BUILDING', 'BUILDING', 'EMPTY', 'BUILDING', 'BUILDING', 'BUILDING', 'EMPTY', 'BUILDING', 'BUILDING'],
      ['BUILDING', 'BUILDING', 'BUILDING', 'EMPTY', 'BUILDING', 'BUILDING', 'BUILDING', 'EMPTY', 'BUILDING', 'BUILDING'],
    ]
  },
  {
    id: "oasis",
    name: "Oasis Urbano Sostenible",
    description: "Modelo ideal de mitigación. Áreas verdes intercaladas, techos verdes en hogares e industrias reemplazadas por parques forestales.",
    gridTypes: [
      ['TREE', 'TREE', 'PLANT', 'HOUSE', 'HOUSE', 'PLANT', 'TREE', 'TREE', 'TREE', 'TREE'],
      ['TREE', 'TREE', 'PLANT', 'HOUSE', 'HOUSE', 'PLANT', 'TREE', 'TREE', 'TREE', 'TREE'],
      ['PLANT', 'PLANT', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'PLANT', 'PLANT', 'PLANT', 'PLANT'],
      ['HOUSE', 'HOUSE', 'EMPTY', 'TREE', 'TREE', 'EMPTY', 'HOUSE', 'HOUSE', 'HOUSE', 'HOUSE'],
      ['HOUSE', 'HOUSE', 'EMPTY', 'TREE', 'TREE', 'EMPTY', 'HOUSE', 'HOUSE', 'HOUSE', 'HOUSE'],
      ['PLANT', 'PLANT', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'PLANT', 'PLANT', 'PLANT', 'PLANT'],
      ['TREE', 'TREE', 'PLANT', 'HOUSE', 'HOUSE', 'PLANT', 'TREE', 'TREE', 'TREE', 'TREE'],
      ['TREE', 'TREE', 'PLANT', 'HOUSE', 'HOUSE', 'PLANT', 'TREE', 'TREE', 'TREE', 'TREE'],
      ['TREE', 'TREE', 'TREE', 'TREE', 'TREE', 'TREE', 'TREE', 'TREE', 'TREE', 'TREE'],
      ['TREE', 'TREE', 'TREE', 'TREE', 'TREE', 'TREE', 'TREE', 'TREE', 'TREE', 'TREE'],
    ]
  },
  {
    id: "residential",
    name: "Comunidad Residencial Equilibrada",
    description: "Zona rural-urbana en desarrollo con un balance intermedio. Posee arboledas naturales pero con indicios de expansión urbana que elevan el calor.",
    gridTypes: [
      ['TREE', 'TREE', 'EMPTY', 'EMPTY', 'HOUSE', 'HOUSE', 'EMPTY', 'EMPTY', 'TREE', 'TREE'],
      ['TREE', 'TREE', 'EMPTY', 'EMPTY', 'HOUSE', 'HOUSE', 'EMPTY', 'EMPTY', 'TREE', 'TREE'],
      ['EMPTY', 'EMPTY', 'PLANT', 'PLANT', 'EMPTY', 'EMPTY', 'PLANT', 'PLANT', 'EMPTY', 'EMPTY'],
      ['EMPTY', 'EMPTY', 'BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING', 'EMPTY', 'EMPTY'],
      ['HOUSE', 'HOUSE', 'BUILDING', 'BUILDING', 'EMPTY', 'EMPTY', 'BUILDING', 'BUILDING', 'HOUSE', 'HOUSE'],
      ['HOUSE', 'HOUSE', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HOUSE', 'HOUSE'],
      ['EMPTY', 'EMPTY', 'PLANT', 'PLANT', 'EMPTY', 'EMPTY', 'PLANT', 'PLANT', 'EMPTY', 'EMPTY'],
      ['TREE', 'TREE', 'EMPTY', 'EMPTY', 'HOUSE', 'HOUSE', 'EMPTY', 'EMPTY', 'TREE', 'TREE'],
      ['TREE', 'TREE', 'EMPTY', 'EMPTY', 'HOUSE', 'HOUSE', 'EMPTY', 'EMPTY', 'TREE', 'TREE'],
      ['TREE', 'TREE', 'TREE', 'TREE', 'EMPTY', 'EMPTY', 'TREE', 'TREE', 'TREE', 'TREE'],
    ]
  }
];

// Helper to fully calculate grid metrics based on cell elements
export const calculateGridMetrics = (grid: CellType[][], rows: number, cols: number, baseAlt: number) => {
  const baseTemp = 24.5 - (baseAlt * 0.0065); // Standard temperature lapse rate (-6.5C per 1km altitude)
  const baseHumidity = Math.max(20, Math.min(95, 62 + (baseAlt * 0.015))); 
  const baseCo2 = 412.0;

  // Set up structures
  const cellGrid = Array(rows).fill(null).map((_, r) => 
    Array(cols).fill(null).map((_, c) => ({
      x: r,
      y: c,
      type: grid[r][c],
      temperature: baseTemp,
      co2: baseCo2,
      humidity: baseHumidity
    }))
  );

  // Compute thermal influence using a distance-based formula (pollution, concrete heat dissipation, botanical cooling)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let tempDelta = 0;
      let co2Delta = 0;
      let humDelta = 0;

      // Scan entire grid to calculate influence on current cell (r, c)
      for (let ir = 0; ir < rows; ir++) {
        for (let ic = 0; ic < cols; ic++) {
          const distance = Math.sqrt(Math.pow(r - ir, 2) + Math.pow(c - ic, 2));
          const cellType = grid[ir][ic];

          if (distance === 0) {
            // Local effect
            if (cellType === 'FACTORY') {
              tempDelta += 8.5;
              co2Delta += 220;
              humDelta -= 25;
            } else if (cellType === 'BUILDING') {
              tempDelta += 4.2;
              co2Delta += 15;
              humDelta -= 12;
            } else if (cellType === 'HOUSE') {
              tempDelta += 1.5;
              co2Delta += 5;
              humDelta -= 4;
            } else if (cellType === 'TREE') {
              tempDelta -= 5.5;
              co2Delta -= 35;
              humDelta += 18;
            } else if (cellType === 'PLANT') {
              tempDelta -= 2.2;
              co2Delta -= 12;
              humDelta += 10;
            } else if (cellType === 'EMPTY') {
              tempDelta += 0.8; // urban barren soil absorbs heat
            }
          } else {
            // Diffused effect with distance decay (1 / (distance + 1))
            const weight = 1 / (distance + 0.8);
            if (cellType === 'FACTORY') {
              tempDelta += 3.8 * weight;
              co2Delta += 95 * weight;
              humDelta -= 12 * weight;
            } else if (cellType === 'BUILDING') {
              tempDelta += 1.5 * weight;
              co2Delta += 6 * weight;
              humDelta -= 5 * weight;
            } else if (cellType === 'HOUSE') {
              tempDelta += 0.4 * weight;
              co2Delta += 1.5 * weight;
              humDelta -= 1 * weight;
            } else if (cellType === 'TREE') {
              tempDelta -= 2.2 * weight;
              co2Delta -= 14 * weight;
              humDelta += 8 * weight;
            } else if (cellType === 'PLANT') {
              tempDelta -= 0.8 * weight;
              co2Delta -= 4 * weight;
              humDelta += 3 * weight;
            }
          }
        }
      }

      cellGrid[r][c].temperature = Math.max(14, Math.min(52, baseTemp + tempDelta));
      cellGrid[r][c].co2 = Math.max(300, Math.min(1200, baseCo2 + co2Delta));
      cellGrid[r][c].humidity = Math.max(15, Math.min(98, baseHumidity + humDelta));
    }
  }

  // Aggregate stats
  let totalTemp = 0;
  let totalCo2 = 0;
  let totalHum = 0;
  let maxTemp = -999;
  let trees = 0;
  let plants = 0;
  let houses = 0;
  let buildings = 0;
  let factories = 0;
  let empty = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cellGrid[r][c];
      totalTemp += cell.temperature;
      totalCo2 += cell.co2;
      totalHum += cell.humidity;
      if (cell.temperature > maxTemp) {
        maxTemp = cell.temperature;
      }

      if (cell.type === 'TREE') trees++;
      else if (cell.type === 'PLANT') plants++;
      else if (cell.type === 'HOUSE') houses++;
      else if (cell.type === 'BUILDING') buildings++;
      else if (cell.type === 'FACTORY') factories++;
      else empty++;
    }
  }

  const numCells = rows * cols;
  const avgTemp = totalTemp / numCells;
  const avgCo2 = totalCo2 / numCells;
  const avgHum = totalHum / numCells;

  return {
    cells: cellGrid,
    stats: {
      avgTemp,
      maxTemp,
      avgCo2,
      avgHum,
      trees,
      plants,
      houses,
      buildings,
      factories,
      empty
    }
  };
};
