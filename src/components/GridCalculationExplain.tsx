import React from 'react';
import { Cpu, Info, Thermometer, Wind, Zap, Sliders, Trees, Home, Factory, Building2 } from 'lucide-react';

interface GridCalculationExplainProps {
  altitude: number;
  onAltitudeChange: (alt: number) => void;
  avgTemp?: number;
  avgCo2?: number;
}

export default function GridCalculationExplain({ 
  altitude, 
  onAltitudeChange,
  avgTemp = 28.5,
  avgCo2 = 412
}: GridCalculationExplainProps) {

  // Standard temperature lapse rate (-6.5°C per 1km)
  const baseTemp = 24.5 - (altitude * 0.0065);
  const baseCo2 = 412.0;
  const baseHumidity = Math.max(20, Math.min(95, 62 + (altitude * 0.015)));

  return (
    <div id="grid-calculation-explain" className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-white space-y-6">
      
      {/* Mini Title Section */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2 bg-indigo-500/10 rounded text-indigo-400 shrink-0">
          <Cpu className="w-5.5 h-5.5" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest">
            Fórmulas y Cálculo de Cuadrícula
          </h2>
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
            Algoritmo de Simulación Microclimática • Teledetección
          </p>
        </div>
      </div>

      {/* Altitude Control Slider - Integrado aquí como variable física */}
      <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Control de Altitud de Sonda Aérea</span>
          </div>
          <span className="font-mono text-xs bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-900 font-bold">
            {altitude} m
          </span>
        </div>
        
        <p className="text-[10.5px] text-slate-400 leading-normal">
          Modifica la altura de la sonda para recalcular el gradiente adiabático y ver el efecto directo en el microclima de Bogotá.
        </p>

        <div className="space-y-1">
          <input
            id="explain-altitude-slider"
            type="range"
            min="10"
            max="180"
            step="1"
            value={altitude}
            onChange={(e) => onAltitudeChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>10 m (Mayor calor reflejado)</span>
            <span>180 m (Base fría de montaña)</span>
          </div>
        </div>
      </div>

      {/* Mathematical Breakdown of Grid Calculations */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
          1. Ecuación Meteorológica Base (Gradiente Térmico)
        </h3>
        
        <div className="bg-slate-950 p-3.5 rounded border border-slate-850 font-mono space-y-2 text-xs">
          <div className="text-center py-2 text-indigo-300 text-sm font-bold border-b border-slate-900">
            T_base = 24.5°C - (Altitud × 0.0065)
          </div>
          <ul className="text-[10px] space-y-1.5 text-slate-350 leading-relaxed pt-1">
            <li className="flex justify-between">
              <span>• Altitud Sonda Actual:</span>
              <strong className="text-white">{altitude} m</strong>
            </li>
            <li className="flex justify-between">
              <span>• Gradiente Térmico calculado:</span>
              <strong className="text-emerald-400">-{ (altitude * 0.0065).toFixed(3) } °C</strong>
            </li>
            <li className="flex justify-between">
              <span>• Temperatura Ambiente Base:</span>
              <strong className="text-indigo-400">{baseTemp.toFixed(2)} °C</strong>
            </li>
            <li className="flex justify-between">
              <span>• Humedad Relativa Base:</span>
              <strong className="text-indigo-400">{baseHumidity.toFixed(1)} %</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* Local Impact Matrices */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
          2. Vectores de Emisión y Mitigación Local
        </h3>
        
        <p className="text-[11px] text-slate-400 leading-normal">
          Cada elemento de la cuadrícula genera un impacto térmico y químico en su propio espacio y disipa un porcentaje a los espacios aledaños:
        </p>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Planta Industrial */}
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-855 flex items-start gap-3">
            <div className="p-1.5 bg-rose-950 text-rose-400 rounded shrink-0">
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[11px] uppercase tracking-wide text-rose-300">Factoría Industrial (Calor Crítico)</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Impacto directo: <span className="text-rose-400 font-bold">+8.5°C</span> • CO₂: <span className="text-rose-400 font-bold">+220 PPM</span> • Humedad: <span className="text-rose-400 font-bold">-25%</span>
              </p>
            </div>
          </div>

          {/* Árbol Sombra */}
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-855 flex items-start gap-3">
            <div className="p-1.5 bg-emerald-950 text-emerald-400 rounded shrink-0">
              <Trees className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[11px] uppercase tracking-wide text-emerald-300">Árbol Frondoso (Mitigación Biótica)</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Impacto directo: <span className="text-emerald-400 font-bold">-5.5°C</span> • CO₂: <span className="text-emerald-400 font-bold">-35 PPM</span> • Humedad: <span className="text-emerald-400 font-bold">+18%</span>
              </p>
            </div>
          </div>

          {/* Edificio de concreto */}
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-855 flex items-start gap-3">
            <div className="p-1.5 bg-yellow-950 text-yellow-400 rounded shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[11px] uppercase tracking-wide text-yellow-300">Edificio de Concreto (Retención de Asfalto)</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Impacto directo: <span className="text-yellow-400 font-bold">+4.2°C</span> • CO₂: <span className="text-yellow-400 font-bold">+15 PPM</span> • Humedad: <span className="text-yellow-400 font-bold">-12%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mathematical Decay of distance influence */}
      <div className="space-y-3 border-t border-slate-800 pt-4">
        <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-indigo-400" />
          3. Ley de Disipación por Distancia (Efecto Radial)
        </h3>
        
        <p className="text-[11px] text-slate-400 leading-normal">
          Para simular vientos y transferencia física de energía térmica por convección en Bogotá, aplicamos una ley de decaimiento radial inverso:
        </p>

        <div className="bg-slate-950 p-3.5 rounded border border-slate-850 font-mono text-xs">
          <div className="text-center py-2 text-indigo-300 font-bold">
            Impacto = Impacto_Base / (Distancia + 0.8)
          </div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-sans">
            Donde <strong>Distancia</strong> representa la métrica euclidiana entre la celda origen del calor / bosque y la celda evaluada. Células adyacentes mitigan o calientan con mayor intensidad que las lejanas.
          </p>
        </div>
      </div>

      {/* Real-time verification notice */}
      <div className="rounded p-3 bg-indigo-950/30 border border-indigo-950 text-[10px] text-slate-400 italic font-mono flex gap-2">
        <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
        <div>
          <span>Todos los cambios ejecutados en el Simulador de Cuadrícula calculan recursivamente 10,000 combinaciones de dispersión al instante para renderizar el heatmap en tiempo real.</span>
        </div>
      </div>

    </div>
  );
}
