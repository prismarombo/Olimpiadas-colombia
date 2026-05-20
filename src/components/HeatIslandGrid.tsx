import React, { useState, useEffect } from 'react';
import { 
  TreeDeciduous, 
  Sprout, 
  Home, 
  Building2, 
  Factory, 
  Eraser, 
  Thermometer, 
  Layers, 
  Flame, 
  Wind, 
  Sparkles, 
  HelpCircle, 
  TrendingDown, 
  Zap, 
  BarChart2,
  Trash2
} from 'lucide-react';
import { CellType, GridCell } from '../types';
import { SCENARIOS, calculateGridMetrics, createEmptyGridPattern } from '../scenariosData';

interface HeatIslandGridProps {
  droneAltitude: number;
  onGridUpdate: (stats: {
    avgTemp: number;
    maxTemp: number;
    avgCo2: number;
    treesCount: number;
    factoriesCount: number;
    rawGrid: GridCell[][];
  }) => void;
}

export default function HeatIslandGrid({ droneAltitude, onGridUpdate }: HeatIslandGridProps) {
  const [activeScenarioId, setActiveScenarioId] = useState('industrial');
  const [gridPattern, setGridPattern] = useState<CellType[][]>(SCENARIOS[0].gridTypes);
  const [selectedTool, setSelectedTool] = useState<CellType | 'EMPTY'>('TREE');
  const [viewMode, setViewMode] = useState<'hybrid' | 'thermal' | 'structural'>('hybrid');
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);

  const ROWS = 10;
  const COLS = 10;

  // Calculate full statistics and physical effects using our scenariosData algorithms
  const { cells, stats } = calculateGridMetrics(gridPattern, ROWS, COLS, droneAltitude);

  // Trigger update to parent component so GeminiAdvisor has latest variables
  useEffect(() => {
    onGridUpdate({
      avgTemp: stats.avgTemp,
      maxTemp: stats.maxTemp,
      avgCo2: stats.avgCo2,
      treesCount: stats.trees,
      factoriesCount: stats.factories,
      rawGrid: cells
    });
  }, [gridPattern, droneAltitude]);

  // Handle cell clicking to paint/apply selected element
  const handleCellClick = (r: number, c: number) => {
    const updatedPattern = gridPattern.map((row, rIdx) => 
      row.map((cellType, cIdx) => {
        if (rIdx === r && cIdx === c) {
          return selectedTool;
        }
        return cellType;
      })
    );
    setGridPattern(updatedPattern);
  };

  // Change Scenario entirely
  const selectScenario = (scenarioId: string) => {
    const scene = SCENARIOS.find(s => s.id === scenarioId);
    if (scene) {
      setActiveScenarioId(scenarioId);
      setGridPattern(scene.gridTypes);
    }
  };

  // Reset grid completely
  const handleClearGrid = () => {
    setGridPattern(createEmptyGridPattern(ROWS, COLS));
    setActiveScenarioId('custom');
  };

  // Paint all trees inside the grid
  const handleForestAll = () => {
    const fullyGreened = Array(ROWS).fill(null).map(() => Array(COLS).fill('TREE' as CellType));
    setGridPattern(fullyGreened);
    setActiveScenarioId('custom');
  };

  // Color mappings for cells depending on local temperature
  const getCellThermalStyle = (temp: number) => {
    // Elegant Thermal Spectrum color map (Blue -> Cyan -> Teal -> Green -> Yellow -> Orange -> Crimson -> Purple)
    if (temp > 44) return { backgroundColor: '#a21caf', color: '#ffffff' }; // Purple (>44°C)
    if (temp > 39) return { backgroundColor: '#e11d48', color: '#ffffff' }; // Crimson (40-44°C)
    if (temp > 34) return { backgroundColor: '#ea580c', color: '#ffffff' }; // Deep Orange (35-39°C)
    if (temp > 29) return { backgroundColor: '#eab308', color: '#0f172a' }; // Warm Yellow (30-34°C)
    if (temp > 25) return { backgroundColor: '#84cc16', color: '#0f172a' }; // Lime Green (26-29°C)
    if (temp > 21) return { backgroundColor: '#0d9488', color: '#ffffff' }; // Pure Teal (22-25°C)
    if (temp > 18) return { backgroundColor: '#0ea5e9', color: '#ffffff' }; // Sky Cyan (19-21°C)
    return { backgroundColor: '#2563eb', color: '#ffffff' }; // Deep Blue (<=18°C)
  };

  // Icon mapping for elements
  const renderCellIcon = (type: CellType) => {
    const iconSize = 22;
    switch (type) {
      case 'TREE':
        return <TreeDeciduous size={iconSize} className="text-emerald-700 font-bold" />;
      case 'PLANT':
        return <Sprout size={iconSize} className="text-lime-500" />;
      case 'HOUSE':
        return <Home size={iconSize} className="text-slate-600" />;
      case 'BUILDING':
        return <Building2 size={iconSize} className="text-slate-800" />;
      case 'FACTORY':
        return <Factory size={iconSize} className="text-slate-900 animate-bounce" />;
      case 'EMPTY':
      default:
        return null;
    }
  };

  // Tool label translations
  const getToolLabel = (type: CellType | 'EMPTY') => {
    switch (type) {
      case 'TREE': return 'Árbol Sombra';
      case 'PLANT': return 'Césped / Planta';
      case 'HOUSE': return 'Hogar';
      case 'BUILDING': return 'Edificio Concreto';
      case 'FACTORY': return 'Planta Industrial';
      case 'EMPTY': return 'Suelo Vacío / Asfalto';
    }
  };

  return (
    <div id="urban-mitigation-sim" className="bg-white rounded-lg border border-slate-200 p-5 space-y-6">
      
      {/* Simulation layout title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">
            Simulador de Entorno Urbano
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Modifica la cuadrícula urbana para sembrar vegetación o reubicar industrias y calcula su impacto ecológico.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200 self-start">
          <button
            id="view-hybrid-btn"
            onClick={() => setViewMode('hybrid')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${viewMode === 'hybrid' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Híbrido
          </button>
          <button
            id="view-thermal-btn"
            onClick={() => setViewMode('thermal')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${viewMode === 'thermal' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Térmica
          </button>
          <button
            id="view-struct-btn"
            onClick={() => setViewMode('structural')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${viewMode === 'structural' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Estructuras
          </button>
        </div>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
          Escenarios de Simulación Predeterminados
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SCENARIOS.map((scene) => (
            <button
              key={scene.id}
              id={`scenario-btn-${scene.id}`}
              onClick={() => selectScenario(scene.id)}
              className={`p-2.5 text-left rounded border text-xs transition-all ${
                activeScenarioId === scene.id
                  ? 'bg-slate-900 border-slate-950 text-white font-semibold'
                  : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
              }`}
            >
              <div className="font-bold mb-0.5 truncate uppercase tracking-tight text-[11px]">{scene.name}</div>
              <p className={`text-[10px] line-clamp-1 leading-normal ${activeScenarioId === scene.id ? 'text-slate-300' : 'text-slate-400'}`}>
                {scene.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Playboard Grid: 10x10 representation (7 Cols equivalent) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          
          {/* Legend and tips */}
          <div className="w-full flex justify-between text-xs text-slate-500 mb-3 bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
              <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              Haz clic en la cuadrícula para pintar con la estructura seleccionada.
            </span>
          </div>

          <div className="relative border border-slate-300 rounded bg-slate-200 p-[3px] w-full max-w-[400px] aspect-square">
            <div className="grid grid-cols-10 gap-0.5 h-full w-full">
              {cells.map((row, rIdx) => 
                row.map((cell, cIdx) => {
                  const thermalStyle = getCellThermalStyle(cell.temperature);
                  const isThermal = viewMode === 'thermal' || viewMode === 'hybrid';
                  
                  return (
                    <button
                      key={`grid-${rIdx}-${cIdx}`}
                      id={`cell-${rIdx}-${cIdx}`}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={isThermal ? { backgroundColor: thermalStyle.backgroundColor } : {}}
                      className={`relative aspect-square transition-colors flex items-center justify-center rounded-[1px] ${
                        !isThermal ? 'bg-slate-50 hover:bg-slate-200 border border-slate-200' : 'hover:scale-105 hover:z-20 border border-black/5'
                      }`}
                    >
                      {/* Icon layer */}
                      {viewMode !== 'thermal' && (
                        <span className="text-base select-none">
                          {cell.type === 'TREE' && '🌳'}
                          {cell.type === 'PLANT' && '🌱'}
                          {cell.type === 'HOUSE' && '🏠'}
                          {cell.type === 'BUILDING' && '🏢'}
                          {cell.type === 'FACTORY' && '🏭'}
                        </span>
                      )}

                      {/* Temperature value super small display for structural view */}
                      {viewMode === 'structural' && (
                        <span className="absolute bottom-0 text-[8px] font-mono font-bold text-slate-700 bg-white/80 px-0.5 rounded leading-tight">
                          {cell.temperature.toFixed(0)}°
                        </span>
                      )}

                      {/* Severe pollution marker */}
                      {cell.co2 > 550 && viewMode === 'hybrid' && (
                        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-slate-900 rounded-full border border-white animate-pulse" title="Alta concentración de CO2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Scientific thermal scale */}
          <div className="w-full max-w-[400px] mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-[10px] space-y-1.5 font-mono shadow-sm">
            <div className="flex justify-between items-center text-[8px] uppercase font-black text-slate-500 tracking-wider">
              <span>Leyenda Térmica Escaneada</span>
              <span className="text-indigo-600">Resolución Satélite Sonda</span>
            </div>
            <div className="h-3 w-full rounded overflow-hidden flex">
              <div style={{ backgroundColor: '#2563eb' }} className="flex-1 h-full" title="Bajo (<18°C)"></div>
              <div style={{ backgroundColor: '#0ea5e9' }} className="flex-1 h-full" title="Fresco (18-21°C)"></div>
              <div style={{ backgroundColor: '#0d9488' }} className="flex-1 h-full" title="Templado (22-25°C)"></div>
              <div style={{ backgroundColor: '#84cc16' }} className="flex-1 h-full" title="Adecuado (26-29°C)"></div>
              <div style={{ backgroundColor: '#eab308' }} className="flex-1 h-full" title="Cálido (30-34°C)"></div>
              <div style={{ backgroundColor: '#ea580c' }} className="flex-1 h-full" title="Industrial (35-39°C)"></div>
              <div style={{ backgroundColor: '#e11d48' }} className="flex-1 h-full" title="Isla Crítica (40-44°C)"></div>
              <div style={{ backgroundColor: '#a21caf' }} className="flex-1 h-full" title="Peligro (>44°C)"></div>
            </div>
            <div className="flex justify-between text-slate-500 font-bold text-[8.5px] px-0.5">
              <span>&lt;18°</span>
              <span>21°</span>
              <span>25°</span>
              <span>29°</span>
              <span>34°</span>
              <span>39°</span>
              <span>44°</span>
              <span>&gt;45°C</span>
            </div>
          </div>

          {/* Hover tooltips */}
          <div className="w-full mt-3 h-12 flex items-center justify-center bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 shadow-sm">
            {hoveredCell ? (
              <div className="flex items-center gap-4 animate-fade-in font-mono text-[10px] tracking-wide text-slate-800">
                <span>📍 COORD: <strong>[{hoveredCell.x + 1}, {hoveredCell.y + 1}]</strong></span>
                <span className="flex items-center gap-0.5">🌡️ TEMP: <strong className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: getCellThermalStyle(hoveredCell.temperature).backgroundColor }}>{hoveredCell.temperature.toFixed(1)}°C</strong></span>
                <span>🧪 CO₂: <strong>{hoveredCell.co2.toFixed(0)} PPM</strong></span>
                <span>💧 HUM: <strong>{hoveredCell.humidity.toFixed(0)}%</strong></span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest leading-none">Pasa el mouse sobre una celda para ver lecturas satélites</span>
            )}
          </div>
        </div>

        {/* Right tools and counters: 4 Cols equivalent */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Material Picker */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Modificar Celda:
            </h3>
            
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { type: 'TREE', icon: '🌳', label: 'Árbol Sombra (Enfría, frena CO₂)' },
                { type: 'PLANT', icon: '🌱', label: 'Césped / Planta (Templador)' },
                { type: 'HOUSE', icon: '🏠', label: 'Casa Residencial' },
                { type: 'BUILDING', icon: '🏢', label: 'Edificio de Concreto' },
                { type: 'FACTORY', icon: '🏭', label: 'Planta Industrial' },
                { type: 'EMPTY', icon: '🧹', label: 'Suelo Vacío / Asfalto' },
              ].map((tool) => (
                <button
                  key={tool.type}
                  id={`tool-btn-${tool.type}`}
                  onClick={() => setSelectedTool(tool.type as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs rounded border transition-all ${
                    selectedTool === tool.type
                      ? 'bg-slate-900 border-slate-950 text-white font-bold shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-sm shrink-0">{tool.icon}</span>
                  <span className="truncate uppercase font-bold text-[10px] tracking-wide">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rapid commands */}
          <div className="pt-2 border-t border-slate-200 flex gap-2">
            <button
              id="forest-all-btn"
              onClick={handleForestAll}
              className="flex-1 py-1.5 border border-slate-250 hover:border-slate-400 text-slate-800 rounded text-[10px] font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1"
            >
              🌱 Reforestar
            </button>
            <button
              id="clear-grid-btn"
              onClick={handleClearGrid}
              className="flex-1 py-1.5 border border-slate-250 hover:bg-rose-50 hover:border-rose-300 text-rose-700 rounded text-[10px] font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1"
            >
              🧹 Limpiar
            </button>
          </div>

          {/* Quick Metrics display inside simulation */}
          <div className="bg-slate-100 rounded border border-slate-200 p-4 space-y-3.5">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
              Métricas del Territorio
            </h4>

            <div className="space-y-1.5 font-mono text-[11px] text-slate-700">
              <div className="flex justify-between items-center">
                <span>TEMPERATURA PROMEDIO:</span>
                <strong className={stats.avgTemp > 31 ? 'text-red-650 font-bold' : 'text-slate-800'}>
                  {stats.avgTemp.toFixed(1)}°C
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span>PICO DE CALOR MÁXIMO:</span>
                <strong className={stats.maxTemp > 39 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                  {stats.maxTemp.toFixed(1)}°C
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span>CONCENTRACIÓN DE CO₂:</span>
                <strong className={stats.avgCo2 > 520 ? 'text-red-600 font-bold animate-pulse' : 'text-slate-800'}>
                  {stats.avgCo2.toFixed(0)} PPM
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span>HUMEDAD PROMEDIO:</span>
                <strong>
                  {stats.avgHum.toFixed(0)}%
                </strong>
              </div>
            </div>

            <div className="h-px bg-slate-250 my-2"></div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
              <div className="bg-white p-2 border border-slate-255 rounded text-center">
                <span>ÁRBOLES: <strong>{stats.trees}</strong></span>
              </div>
              <div className="bg-white p-2 border border-slate-255 rounded text-center">
                <span>INDUSTRIAS: <strong>{stats.factories}</strong></span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
