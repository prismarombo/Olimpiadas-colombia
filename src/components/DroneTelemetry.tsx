import React, { useState, useEffect, useRef } from 'react';
import { Camera, Radio, Compass, Wind, AlertTriangle, Play, Pause, RefreshCw, Layers } from 'lucide-react';
import { DroneTelemetry } from '../types';

interface DroneTelemetryProps {
  telemetry: DroneTelemetry;
  onChangeTelemetry: (data: DroneTelemetry) => void;
}

export default function DroneTelemetryView({ telemetry, onChangeTelemetry }: DroneTelemetryProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [flightPhase, setFlightPhase] = useState<'Aterrizado' | 'Ascenso' | 'Teledetección' | 'Descenso'>('Teledetección');
  const [thermalMode, setThermalMode] = useState<'rainbow' | 'ironbow' | 'monochrome'>('rainbow');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-simulate drone telemetry drift / flight simulation
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        // Drone moves slightly, simulating flight variations over an urban territory
        const altitudeDrifts = (Math.random() - 0.5) * 1.5;
        const newAltitude = Math.max(10, Math.min(150, telemetry.altitude + altitudeDrifts));

        // Inversely proportional temperature with altitude drift, and localized weather variation
        const baseTemp = 25.5 - (newAltitude * 0.0065);
        const temperatureDrifts = (Math.random() - 0.5) * 0.4;
        const newTemperature = Math.max(15, Math.min(42, baseTemp + 4.5 + temperatureDrifts)); // adding 4.5 for cities heat average

        const newHumidity = Math.max(30, Math.min(95, 62 + (newAltitude * 0.012) + (Math.random() - 0.5) * 0.8));
        const newCo2 = Math.max(350, Math.min(850, 415 + (Math.random() - 0.5) * 15 + Math.sin(Date.now() / 30000) * 100));

        // Generate dynamic 5x5 thermal camera POV
        const generatedThermalGrid = Array(5).fill(null).map((_, r) =>
          Array(5).fill(null).map((_, c) => {
            // Hot spots in the center, or randomized heat sources based on simulated structures below
            const centerDistance = Math.sqrt(Math.pow(r - 2, 2) + Math.pow(c - 2, 2));
            const basePixTemp = newTemperature + (3 - centerDistance) * 3 + (Math.random() - 0.5) * 2;
            return parseFloat(basePixTemp.toFixed(1));
          })
        );

        // Derive alarm index
        let score = (newTemperature * 0.4) + (newCo2 * 0.05) - (newHumidity * 0.1);
        let heatLvl: 'Excelente' | 'Normal' | 'Precaución' | 'Crítico' = 'Normal';
        if (score > 60) heatLvl = 'Crítico';
        else if (score > 48) heatLvl = 'Precaución';
        else if (score < 30) heatLvl = 'Excelente';

        setFlightPhase(newAltitude > 100 ? 'Teledetección' : newAltitude > 30 ? 'Ascenso' : 'Descenso');

        onChangeTelemetry({
          altitude: parseFloat(newAltitude.toFixed(1)),
          temperature: parseFloat(newTemperature.toFixed(1)),
          humidity: parseFloat(newHumidity.toFixed(1)),
          co2: parseFloat(newCo2.toFixed(1)),
          heatIndex: parseFloat(score.toFixed(1)),
          heatLevel: heatLvl,
          thermalCamera: generatedThermalGrid
        });
      }, 2000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, telemetry, onChangeTelemetry]);

  // Handle manual sensor modifications
  const updateMetric = (key: keyof DroneTelemetry, val: number) => {
    const updated = { ...telemetry };
    if (key === 'altitude') updated.altitude = val;
    if (key === 'temperature') updated.temperature = val;
    if (key === 'humidity') updated.humidity = val;
    if (key === 'co2') updated.co2 = val;

    // Recalculate level
    let score = (updated.temperature * 0.4) + (updated.co2 * 0.05) - (updated.humidity * 0.1);
    let heatLvl: 'Excelente' | 'Normal' | 'Precaución' | 'Crítico' = 'Normal';
    if (score > 60) heatLvl = 'Crítico';
    else if (score > 48) heatLvl = 'Precaución';
    else if (score < 35) heatLvl = 'Excelente';

    updated.heatIndex = parseFloat(score.toFixed(1));
    updated.heatLevel = heatLvl;

    onChangeTelemetry(updated);
  };

  // Color functions for the thermal viewer
  const getThermalClass = (temp: number) => {
    if (thermalMode === 'rainbow') {
      if (temp > 38) return 'bg-[#ea580c] text-white'; // Deep Orange
      if (temp > 33) return 'bg-[#f59e0b] text-slate-800'; // Amber
      if (temp > 28) return 'bg-[#84cc16] text-slate-800'; // Lime
      if (temp > 23) return 'bg-[#06b6d4] text-white'; // Cyan
      return 'bg-[#2563eb] text-white'; // Blue
    } else if (thermalMode === 'ironbow') {
      if (temp > 38) return 'bg-[#fee2e2] text-[#ef4444] font-bold'; // Pinkish White
      if (temp > 33) return 'bg-[#f43f5e] text-white'; // Hot Pink
      if (temp > 28) return 'bg-[#881337] text-white'; // Purple Burgundy
      if (temp > 23) return 'bg-[#311042] text-[#c084fc]'; // Dark Violet
      return 'bg-[#030712] text-[#818cf8]'; // Midnight Black
    } else {
      // Monochrome grey
      if (temp > 38) return 'bg-slate-100 text-slate-950 font-bold';
      if (temp > 33) return 'bg-slate-350 text-slate-800';
      if (temp > 28) return 'bg-slate-500 text-slate-150';
      if (temp > 23) return 'bg-slate-700 text-slate-100';
      return 'bg-slate-900 text-slate-100';
    }
  };

  return (
    <div id="drone-telemetry" className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-white">
      {/* Header telemetry */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Radio className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Telemetría de Dron Sonda</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs text-slate-400">Sensores Activos • Colombia 2026</span>
            </div>
          </div>
        </div>

        {/* Flight command center */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden md:inline px-2 py-0.5 rounded bg-slate-800/80">
            Modo: Col2026_V1.4
          </span>
          <button
            id="play-pause-flight-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded transition-colors flex items-center justify-center cursor-pointer ${isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'}`}
            title={isPlaying ? 'Pausar simulación del dron' : 'Reanudar telemetría viva'}
          >
            {isPlaying ? 'Pausar' : 'Activar'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Lecturas de Sensores Biométricos</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Temperature card */}
          <div className="bg-slate-950 p-3 rounded border border-slate-850">
            <span className="text-slate-400 text-xs">Temperatura</span>
            <div className="flex items-baseline gap-1 mt-1 font-mono">
              <span className="text-2xl font-bold tracking-tight">{telemetry.temperature}</span>
              <span className="text-sm text-slate-400">°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="0.5"
              value={telemetry.temperature}
              onChange={(e) => updateMetric('temperature', parseFloat(e.target.value))}
              className="w-full h-1 mt-2 bg-slate-750 rounded appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Carbon Dioxide CO2 */}
          <div className="bg-slate-950 p-3 rounded border border-slate-850 font-mono">
            <span className="text-slate-400 text-xs font-sans">Gas CO2</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight">{telemetry.co2}</span>
              <span className="text-xs text-slate-400 font-sans">ppm</span>
            </div>
            <input
              type="range"
              min="350"
              max="950"
              step="5"
              value={telemetry.co2}
              onChange={(e) => updateMetric('co2', parseFloat(e.target.value))}
              className="w-full h-1 mt-2 bg-slate-750 rounded appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Humidity */}
          <div className="bg-slate-950 p-3 rounded border border-slate-850 font-mono">
            <span className="text-slate-400 text-xs font-sans">Hum. Relativa</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight">{telemetry.humidity}</span>
              <span className="text-sm text-slate-400 font-sans">%</span>
            </div>
            <input
              type="range"
              min="20"
              max="98"
              step="1"
              value={telemetry.humidity}
              onChange={(e) => updateMetric('humidity', parseFloat(e.target.value))}
              className="w-full h-1 mt-2 bg-slate-750 rounded appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Altitude */}
          <div className="bg-slate-950 p-3 rounded border border-slate-850 font-mono">
            <span className="text-slate-400 text-xs font-sans">Altitud Sonda</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight">{telemetry.altitude}</span>
              <span className="text-sm text-slate-400 font-sans">m</span>
            </div>
            <input
              type="range"
              min="10"
              max="180"
              step="1"
              value={telemetry.altitude}
              onChange={(e) => updateMetric('altitude', parseFloat(e.target.value))}
              className="w-full h-1 mt-2 bg-slate-750 rounded appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>

        {/* Alarm diagnostic system */}
        <div className={`p-3 rounded border flex items-start gap-3 mt-2 ${
          telemetry.heatLevel === 'Crítico' ? 'bg-rose-950/40 border-rose-800 text-rose-200' :
          telemetry.heatLevel === 'Precaución' ? 'bg-amber-950/40 border-amber-800 text-amber-200' :
          'bg-emerald-950/40 border-emerald-800 text-emerald-200'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
            telemetry.heatLevel === 'Crítico' ? 'text-rose-450' :
            telemetry.heatLevel === 'Precaución' ? 'text-amber-450' :
            'text-emerald-450'
          }`} />
          <div>
            <p className="font-semibold text-xs uppercase tracking-wider text-[11px]">Índice Térmico Dron: {telemetry.heatLevel}</p>
            <p className="text-xs opacity-90 mt-0.5">
              {telemetry.heatLevel === 'Crítico' ? 'Severas anomalías de isla de calor ambiental. Retención de asfalto extrema y altos gases CO2.' :
               telemetry.heatLevel === 'Precaución' ? 'Nivel térmico con sobrepeso cementicio. Requiere intervenciones de reforestación localizada.' :
               'Condiciones balanceadas. Microclima apto con adecuada disipación térmica y aire limpio.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
