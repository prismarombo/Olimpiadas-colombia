import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Layers, 
  FileSpreadsheet, 
  Cpu, 
  Flame, 
  Award, 
  Info,
  Calendar
} from 'lucide-react';
import { DroneTelemetry, GridCell } from './types';
import GridCalculationExplain from './components/GridCalculationExplain';
import HeatIslandGrid from './components/HeatIslandGrid';
import GeminiAdvisor from './components/GeminiAdvisor';
import ExcelConnectionInfo from './components/ExcelConnectionInfo';

export default function App() {
  // Shared state for the drone's active telemetry
  const [telemetry, setTelemetry] = useState<DroneTelemetry>({
    altitude: 45,
    temperature: 28.5,
    humidity: 58,
    co2: 412,
    heatIndex: 44.5,
    heatLevel: 'Normal',
    thermalCamera: Array(5).fill(null).map(() => Array(5).fill(28.5))
  });

  // Shared state for the grid urban simulator stats
  const [gridStats, setGridStats] = useState<{
    avgTemp: number;
    maxTemp: number;
    avgCo2: number;
    treesCount: number;
    factoriesCount: number;
    rawGrid: GridCell[][];
  } | null>(null);

  // Tracks active scenario name to inform Gemini
  const [activeScenarioName, setActiveScenarioName] = useState('Deforestación Zona Industrial');

  // Callback when altitude gets changed inside grid calculation explain slider
  const handleAltitudeChange = (newAlt: number) => {
    setTelemetry(prev => ({ ...prev, altitude: newAlt }));
  };

  // Callback when drone telemetry gets updated by simulator or manuals
  const handleTelemetryChange = (newTelemetry: DroneTelemetry) => {
    setTelemetry(newTelemetry);
  };

  // Callback when grid layout changes
  const handleGridUpdate = (stats: {
    avgTemp: number;
    maxTemp: number;
    avgCo2: number;
    treesCount: number;
    factoriesCount: number;
    rawGrid: GridCell[][];
  }) => {
    setGridStats(stats);
    
    // Dynamically derive active scenario based on elements
    if (stats.treesCount > 35) {
      setActiveScenarioName('Oasis Urbano Altamente Reforestado');
    } else if (stats.factoriesCount > 4) {
      setActiveScenarioName('Zona Industrial con Altas Emisiones de Calor');
    } else if (stats.treesCount === 0 && stats.factoriesCount === 0) {
      setActiveScenarioName('Suelo Despejado / Asfalto Urbano');
    } else {
      setActiveScenarioName('Diseño Urbano Personalizado');
    }
  };

  // Callback when a sheet or CSV imports new telemetry parameters
  const handleImportTelemetry = (imported: Partial<DroneTelemetry>) => {
    setTelemetry(prev => {
      const merged = { ...prev, ...imported };
      
      // Re-evaluate level
      let score = (merged.temperature * 0.4) + (merged.co2 * 0.05) - (merged.humidity * 0.1);
      let heatLvl: 'Excelente' | 'Normal' | 'Precaución' | 'Crítico' = 'Normal';
      if (score > 60) heatLvl = 'Crítico';
      else if (score > 48) heatLvl = 'Precaución';
      else if (score < 35) heatLvl = 'Excelente';

      merged.heatIndex = parseFloat(score.toFixed(1));
      merged.heatLevel = heatLvl;
      return merged;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      
      {/* Top Colombian Flag Accent Tab */}
      <div className="w-full h-1 flex shrink-0">
        <div className="w-1/2 bg-[#FCD116]"></div>
        <div className="w-1/4 bg-[#003893]"></div>
        <div className="w-1/4 bg-[#CE1126]"></div>
      </div>

      {/* Geometric Balance Top Header */}
      <header className="bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between px-8 py-3 sm:py-0 sm:h-16 shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xl shrink-0">Ω</div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight uppercase text-slate-900">
              Olimpíadas Colombia 2026
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              PROYECTO: DRON-ECO-SCAN / ISLAS DE CALOR
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
              Live Google Sheets Sync
            </span>
          </div>
          
          <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
          
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded border border-amber-200">
            Fase Final • Bogotá
          </span>
        </div>
      </header>

      {/* Main Container Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Project Info Block in Symmetrical Outline Panel */}
        <div className="bg-white border-2 border-slate-200 rounded-lg p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start gap-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 shrink-0 hidden md:block">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-sm tracking-widest text-indigo-900 uppercase">
              Candidatura Olímpica • Teledetección de Microclima Urbano
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-5xl">
              Nuestra propuesta académica para las <strong>Olimpíadas de Colombia 2026</strong> integra transmisión de sensores por aire en tiempo real directamente a un archivo en línea de <strong>Google Drive / Sheets</strong>. El simulador de cuadrícula permite mitigar la retención de calor reemplazando fábricas y asfalto por árboles de sombra y plantas. 
            </p>
          </div>
        </div>

        {/* Symmetrical Left/Right Multi-Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Data Telemetry or Playboard (Takes 7 cols for prominent viewing) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Gridded heatmap urban playground */}
            <HeatIslandGrid 
              droneAltitude={telemetry.altitude} 
              onGridUpdate={handleGridUpdate} 
            />

            {/* AI Advisor reports */}
            <GeminiAdvisor 
              droneTelemetry={telemetry} 
              gridStats={gridStats} 
              activeScenarioName={activeScenarioName}
            />
          </div>

          {/* RIGHT COLUMN: Real-Time Sonda status (Takes 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Grid Calculation Explanation block */}
            <GridCalculationExplain 
              altitude={telemetry.altitude} 
              onAltitudeChange={handleAltitudeChange}
              avgTemp={gridStats?.avgTemp}
              avgCo2={gridStats?.avgCo2}
            />

            {/* Google Sheets / Spreadsheet Sync card */}
            <ExcelConnectionInfo 
              onImportData={handleImportTelemetry} 
              currentTelemetry={telemetry}
            />
          </div>

        </div>

      </main>

      {/* Symmetrical Status Bar Footer */}
      <footer className="h-auto md:h-9 bg-slate-900 text-slate-400 flex flex-col md:flex-row items-center justify-between px-6 py-2.5 md:py-0 text-[10px] font-mono tracking-widest uppercase border-t border-slate-800 shrink-0 gap-2">
        <div className="text-center md:text-left text-slate-200">
          DRONE_ID: COL-2026-DRN-04 // LAT: 4.7110° N, LONG: 74.0721° W // ALTITUD: {telemetry.altitude}M
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span>CO₂: {telemetry.co2} PPM</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span>BATTERY: 94%</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span>SIGNAL: EXCELLENT</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="animate-pulse text-emerald-400 font-bold">● RECORDING ONLINE</span>
        </div>
      </footer>

    </div>
  );
}
