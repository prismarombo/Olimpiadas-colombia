import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Link, HelpCircle, Check, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { DroneTelemetry } from '../types';

interface ExcelConnectionInfoProps {
  onImportData: (data: Partial<DroneTelemetry>) => void;
  currentTelemetry: DroneTelemetry;
}

export default function ExcelConnectionInfo({ onImportData, currentTelemetry }: ExcelConnectionInfoProps) {
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/18BbPiCLO1RQQ1UbGyfL5iZJ2kX_EqWLgR-Whvk8dm8k/edit?usp=sharing');
  const [loading, setLoading] = useState(false);
  const [pastedData, setPastedData] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  // Quick mathematical index formula for Klimatic Threat (IVC)
  const calculateIVC = (temp: number, co2: number, hum: number) => {
    // Standard Bogotá climate offset: temperatures above normal + higher co2 + lower humidity indicates high vulnerability
    const val = ((temp * 1.5) + (co2 * 0.08) - (hum * 0.3)) / 10;
    return Math.max(0, Math.min(10, parseFloat(val.toFixed(2))));
  };

  const fetchSheetData = async (targetUrl: string, autoApplyLatest = true) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      let csvUrl = targetUrl;
      const sheetIdMatch = targetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (sheetIdMatch && sheetIdMatch[1]) {
        const id = sheetIdMatch[1];
        csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
      }

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('No se pudo acceder al enlace de transmisión en Drive. Verifica que esté compartido de forma pública ("Cualquier persona con el enlace puede leer")');
      }

      const text = await response.text();
      // Parse CSV
      const rows = text.split('\n')
        .map(row => row.split(','))
        .filter(row => row.length > 0 && row[0].trim() !== '');

      if (rows.length < 2) {
        throw new Error('El archivo del Drive no contiene suficientes registros.');
      }

      const headers = rows[0].map(h => h.trim().toLowerCase());
      
      const parsedRecords = rows.slice(1).map((row, index) => {
        const getRowVal = (possibleNames: string[], defaultVal: number): number => {
          for (const name of possibleNames) {
            const idx = headers.findIndex(h => h.includes(name));
            if (idx !== -1 && row[idx] && row[idx].trim()) {
              const parsed = parseFloat(row[idx].trim());
              if (!isNaN(parsed)) return parsed;
            }
          }
          return defaultVal;
        };

        const altitude = getRowVal(['altitud', 'altitude', 'altura', 'm'], currentTelemetry.altitude);
        const temperature = getRowVal(['temperatura', 'temp', 'c'], currentTelemetry.temperature);
        const humidity = getRowVal(['humedad', 'humidity', 'hum', '%'], currentTelemetry.humidity);
        const co2 = getRowVal(['co2', 'dioxido', 'carbono', 'ppm'], currentTelemetry.co2);

        return {
          id: index + 1,
          altitude,
          temperature,
          humidity,
          co2,
          ivc: calculateIVC(temperature, co2, humidity)
        };
      });

      const validRecords = parsedRecords.filter(r => !isNaN(r.temperature) && !isNaN(r.humidity));
      setRecords(validRecords);

      if (validRecords.length > 0) {
        const recordToApply = validRecords[validRecords.length - 1];
        
        if (autoApplyLatest) {
          onImportData({
            altitude: recordToApply.altitude,
            temperature: recordToApply.temperature,
            humidity: recordToApply.humidity,
            co2: recordToApply.co2
          });
          setSelectedRecordId(recordToApply.id);
          setSuccessMsg(`¡Último registro de Drive inyectado! Fila ${recordToApply.id}: Temp: ${recordToApply.temperature}°C, IVC: ${recordToApply.ivc.toFixed(2)}`);
        } else {
          setSuccessMsg(`Datos extraídos correctamente. Encontrados ${validRecords.length} registros para análisis y graficación.`);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al conectar con Google Sheets. Asegúrate de configurar el archivo para compartir de forma pública.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData(sheetUrl, true);
  }, []);

  const handleFetchSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl) {
      setErrorMsg('Por favor introduce un enlace de Google Sheets/Drive.');
      return;
    }
    await fetchSheetData(sheetUrl, true);
  };

  const handleImportPastedCSV = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!pastedData.trim()) {
      setErrorMsg('Por favor pega datos en formato CSV.');
      return;
    }

    try {
      const rows = pastedData.trim().split('\n').map(row => row.split(','));
      if (rows.length < 2) {
        throw new Error('Formato inválido. Debe contener al menos una fila de encabezados.');
      }

      const headers = rows[0].map(h => h.trim().toLowerCase());
      const dataRow = rows[1].map(d => d.trim());

      const getVal = (possibleNames: string[], defaultVal: number): number => {
        for (const name of possibleNames) {
          const idx = headers.findIndex(h => h.includes(name));
          if (idx !== -1 && dataRow[idx]) {
            const parsed = parseFloat(dataRow[idx]);
            if (!isNaN(parsed)) return parsed;
          }
        }
        return defaultVal;
      };

      const importedTelemetry: Partial<DroneTelemetry> = {
        altitude: getVal(['altitud', 'altitude', 'altura', 'm'], currentTelemetry.altitude),
        temperature: getVal(['temperatura', 'temp', 'c'], currentTelemetry.temperature),
        humidity: getVal(['humedad', 'humidity', 'hum', '%'], currentTelemetry.humidity),
        co2: getVal(['co2', 'dioxido', 'carbono', 'ppm'], currentTelemetry.co2),
      };

      onImportData(importedTelemetry);
      
      const computedIvc = calculateIVC(
        importedTelemetry.temperature || currentTelemetry.temperature,
        importedTelemetry.co2 || currentTelemetry.co2,
        importedTelemetry.humidity || currentTelemetry.humidity
      );

      // Append manually entered row to records list
      const manualId = records.length + 1;
      const parsedManual = {
        id: manualId,
        altitude: importedTelemetry.altitude || currentTelemetry.altitude,
        temperature: importedTelemetry.temperature || currentTelemetry.temperature,
        humidity: importedTelemetry.humidity || currentTelemetry.humidity,
        co2: importedTelemetry.co2 || currentTelemetry.co2,
        ivc: computedIvc
      };

      setRecords(prev => [...prev, parsedManual]);
      setSelectedRecordId(manualId);
      
      setSuccessMsg(`¡CSV procesado con éxito! Se calculó un IVC de: ${computedIvc.toFixed(2)}.`);
      setPastedData('');
    } catch (err: any) {
      setErrorMsg('Error al parsear el CSV. Asegúrate de usar comas (,) y tener una fila de encabezados.');
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = 
`altitud,temperatura,humedad,co2,marca_tiempo
${currentTelemetry.altitude},${currentTelemetry.temperature.toFixed(1)},${currentTelemetry.humidity.toFixed(1)},${currentTelemetry.co2.toFixed(1)},"${new Date().toISOString()}"
${currentTelemetry.altitude + 5},${(currentTelemetry.temperature + 4.5).toFixed(1)},${(currentTelemetry.humidity - 8).toFixed(1)},${(currentTelemetry.co2 + 85).toFixed(1)},"${new Date(Date.now() + 10000).toISOString()}"
${currentTelemetry.altitude + 12},${(currentTelemetry.temperature + 9.2).toFixed(1)},${(currentTelemetry.humidity - 16).toFixed(1)},${(currentTelemetry.co2 + 190).toFixed(1)},"${new Date(Date.now() + 20000).toISOString()}"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `olimpiadas_colombia_dron_telem_real.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="excel-connection" className="bg-white rounded-lg border border-slate-200 p-5 space-y-6">
      
      {/* Visual Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-2 bg-[#10b981]/10 rounded text-[#10b981] shrink-0">
          <FileSpreadsheet className="w-5.5 h-5.5" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
            Sincronización Excel y Drive
          </h2>
          <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
            Teledetección celular IoT • Olimpíadas Colombia 2026
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Project Context */}
        <div className="bg-emerald-50/50 rounded p-4 border border-emerald-100 text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-emerald-800 uppercase tracking-widest text-[9px] mb-1">Candidatura Colombia 2026</p>
          En condiciones reales de vuelo, el dron envía telemetría de teledetección a un libro de Excel en **Google Drive**. Conecta tu Sheets o procesa un CSV manual para analizar el riesgo e inyectar registros directamente al simulador.
        </div>

        {/* Dynamic Sheets connection */}
        <form onSubmit={handleFetchSheet} className="space-y-2.5">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Enlace de Google Sheets en Línea:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="sheet-url-input"
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded focus:outline-none focus:border-slate-450 bg-slate-50 focus:bg-white font-mono text-[11px]"
              />
            </div>
            <button
              id="sheet-connect-btn"
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Leyendo' : 'Conectar'}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 flex items-start gap-1 leading-normal italic">
            <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
            <span>Soporta cualquier copia de Google Sheets compartida de manera pública ("Cualquier persona con el enlace").</span>
          </p>
        </form>

        {/* Live records list display and SVG Graph */}
        {records.length > 0 && (
          <div className="space-y-4 pt-1">
            
            {/* IVC Formula Block */}
            <div className="bg-slate-50 border border-slate-205 rounded p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                  🧪 FÓRMULA DE RETENCIÓN DE CALOR (IVC)
                </span>
                <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded font-mono">
                  IVC 0-10
                </span>
              </div>
              
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Calculamos el **Índice de Vulnerabilidad Climática (IVC)** de cada muestra: 
                <span className="block my-2 p-2 bg-slate-100 rounded text-center text-xs font-mono text-indigo-700 font-bold border border-slate-200">
                  IVC = ((Temp * 1.5) + (CO₂ * 0.08) - (Hum * 0.3)) / 10
                </span>
                La ponderación de temperatura y dióxido de carbono actúa como factor desfavorable, mientras que la humedad vegetal actúa como sumidero térmico disipador.
              </p>

              <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-mono">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded p-1.5 font-bold">
                  IVC &lt; 4.5
                  <div className="font-sans font-normal text-[8.5px] text-slate-500 mt-0.5">Ecológico</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded p-1.5 font-bold">
                  IVC 4.5 - 7.5
                  <div className="font-sans font-normal text-[8.5px] text-slate-500 mt-0.5">Alerta Leve</div>
                </div>
                <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded p-1.5 font-bold">
                  IVC &gt; 7.5
                  <div className="font-sans font-normal text-[8.5px] text-slate-500 mt-0.5">Calor Crítico</div>
                </div>
              </div>
            </div>

            {/* HIGHLY INTERACTIVE CUSTOM SVG PLOTTER */}
            <div className="bg-slate-900 text-white rounded-lg border border-slate-800 p-4 space-y-3.5 shadow-sm">
              <div className="flex justify-between items-center pb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Gráfica Térmica y Amenaza (Excel)
                </span>
                <span className="text-[8.5px] bg-slate-805 text-indigo-300 font-mono px-2 py-0.5 rounded font-bold border border-indigo-900 border-dashed">
                  Visualizador Integrado
                </span>
              </div>

              {/* Pure SVG Line Charts */}
              {(() => {
                const width = 500;
                const height = 180;
                const padL = 40;
                const padR = 20;
                const padT = 15;
                const padB = 30;

                const chartW = width - padL - padR;
                const chartH = height - padT - padB;

                // Value ranges for plotting
                const minTemp = 10;
                const maxTemp = 50;

                const minIvc = 0;
                const maxIvc = 10;

                // Scale formulas
                const getX = (idx: number) => {
                  if (records.length <= 1) return padL + chartW / 2;
                  return padL + (idx / (records.length - 1)) * chartW;
                };

                const getYTemp = (temp: number) => {
                  const norm = (temp - minTemp) / (maxTemp - minTemp);
                  return height - padB - norm * chartH;
                };

                const getYIvc = (ivc: number) => {
                  const norm = (ivc - minIvc) / (maxIvc - minIvc);
                  return height - padB - norm * chartH;
                };

                // Generate points
                const pts = records.map((r, idx) => ({
                  x: getX(idx),
                  yTemp: getYTemp(r.temperature),
                  yIvc: getYIvc(r.ivc),
                  record: r
                }));

                // SVG Path Generation
                const tempPath = pts.length > 1
                  ? `M ${pts.map(p => `${p.x.toFixed(1)},${p.yTemp.toFixed(1)}`).join(' L ')}`
                  : '';
                const ivcPath = pts.length > 1
                  ? `M ${pts.map(p => `${p.x.toFixed(1)},${p.yIvc.toFixed(1)}`).join(' L ')}`
                  : '';

                return (
                  <div className="space-y-2">
                    <div className="relative">
                      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                        
                        {/* Horizontal Guide Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                          const y = padT + ratio * chartH;
                          return (
                            <line
                              key={`gl-y-${i}`}
                              x1={padL}
                              y1={y}
                              x2={width - padR}
                              y2={y}
                              stroke="#334155"
                              strokeWidth="0.8"
                              strokeDasharray="4,4"
                            />
                          );
                        })}

                        {/* Temp axis ticks */}
                        <text x={padL - 10} y={getYTemp(45) + 3} fill="#ef4444" textAnchor="end" className="text-[8px] font-mono font-bold">45°</text>
                        <text x={padL - 10} y={getYTemp(30) + 3} fill="#ef4444" textAnchor="end" className="text-[8px] font-mono font-bold">30°</text>
                        <text x={padL - 10} y={getYTemp(15) + 3} fill="#ef4444" textAnchor="end" className="text-[8px] font-mono font-bold">15°C</text>

                        {/* Plot lines */}
                        {tempPath && (
                          <path
                            d={tempPath}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            className="drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]"
                          />
                        )}

                        {tempPath && (
                          <path
                            d={ivcPath}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="drop-shadow-[0_2px_4px_rgba(99,102,241,0.5)]"
                          />
                        )}

                        {/* Node points with click handler */}
                        {pts.map((p, idx) => {
                          const isSel = selectedRecordId === p.record.id;
                          return (
                            <g key={`marker-node-${idx}`} className="group">
                              {/* vertical indicator line on hover or selected */}
                              <line
                                x1={p.x}
                                y1={padT}
                                x2={p.x}
                                y2={height - padB}
                                stroke={isSel ? "#6366f1" : "#334155"}
                                strokeWidth={isSel ? "1.5" : "0.5"}
                                strokeDasharray={isSel ? "none" : "2,2"}
                                className="group-hover:stroke-slate-100 group-hover:stroke-[1.2] transition-colors"
                              />

                              {/* Temperature Circle */}
                              <circle
                                cx={p.x}
                                cy={p.yTemp}
                                r={isSel ? 5 : 3}
                                fill="#ef4444"
                                stroke="#1e293b"
                                strokeWidth="1"
                                className="transition-all hover:r-[6px]"
                                onClick={() => {
                                  onImportData({
                                    altitude: p.record.altitude,
                                    temperature: p.record.temperature,
                                    humidity: p.record.humidity,
                                    co2: p.record.co2
                                  });
                                  setSelectedRecordId(p.record.id);
                                  setSuccessMsg(`Simulador sincronizado Fila #${p.record.id}: Temp=${p.record.temperature}°C, IVC=${p.record.ivc.toFixed(2)}`);
                                }}
                              />

                              {/* IVC Circle */}
                              <circle
                                cx={p.x}
                                cy={p.yIvc}
                                r={isSel ? 5.5 : 3.5}
                                fill="#6366f1"
                                stroke="#ffffff"
                                strokeWidth={isSel ? "1.5" : "0.5"}
                                className="transition-all hover:r-[6px]"
                                onClick={() => {
                                  onImportData({
                                    altitude: p.record.altitude,
                                    temperature: p.record.temperature,
                                    humidity: p.record.humidity,
                                    co2: p.record.co2
                                  });
                                  setSelectedRecordId(p.record.id);
                                  setSuccessMsg(`Simulador sincronizado Fila #${p.record.id}: Temp=${p.record.temperature}°C, IVC=${p.record.ivc.toFixed(2)}`);
                                }}
                              />

                              {/* Label tick for Row number */}
                              <text
                                x={p.x}
                                y={height - padB + 15}
                                fill={isSel ? "#a5b4fc" : "#64748b"}
                                textAnchor="middle"
                                className={`text-[8.5px] font-mono ${isSel ? "font-black" : "font-normal"} group-hover:fill-slate-100 transition-colors`}
                              >
                                {`F#${p.record.id}`}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Chart legends */}
                    <div className="flex justify-center gap-6 text-[9.5px] font-mono pt-2 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] block" />
                        <span>Temperatura de Sonda (°C)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] block" />
                        <span>Índice IVC Climático (0-10)</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* List with detail results */}
            <div className="bg-slate-50 border border-slate-205 rounded p-3.5 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Muestreo Satélite y Severidad ({records.length})
                </span>
                <span className="text-[8.5px] bg-emerald-100 text-emerald-800 font-bold uppercase px-2 py-0.5 rounded">
                  TRANSMITIENDO
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto border border-slate-200 bg-white rounded divide-y divide-slate-100 shadow-inner">
                {records.map((r) => {
                  let badgeStyling = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                  let statusLabel = 'Estable / Seguro';
                  if (r.ivc > 7.5) {
                    badgeStyling = 'bg-rose-50 text-rose-800 border-rose-100 border';
                    statusLabel = 'Peligro Crítico';
                  } else if (r.ivc > 4.5) {
                    badgeStyling = 'bg-amber-50 text-amber-800 border-amber-100 border';
                    statusLabel = 'Alerta Intermedia';
                  }

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        onImportData({
                          altitude: r.altitude,
                          temperature: r.temperature,
                          humidity: r.humidity,
                          co2: r.co2
                        });
                        setSelectedRecordId(r.id);
                        setSuccessMsg(`Simulador configurado a Fila #${r.id}: Temp: ${r.temperature}°C, IVC calculada: ${r.ivc.toFixed(2)}`);
                      }}
                      className={`w-full text-left px-3.5 py-3 text-[10px] font-mono hover:bg-slate-50 flex items-center justify-between transition-colors ${
                        selectedRecordId === r.id ? 'bg-indigo-50 text-indigo-900 font-bold border-l-4 border-indigo-600' : 'text-slate-650'
                      }`}
                      title="Haz clic para cargar estos coeficientes en el simulador"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-sans font-black text-slate-800 uppercase tracking-tight text-[10.5px]">Fila #{r.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-sans font-bold uppercase ${badgeStyling}`}>
                          IVC {r.ivc.toFixed(1)} • {statusLabel}
                        </span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="flex gap-2.5 justify-end font-bold text-slate-800 text-[10.5px]">
                          <span>🌡️ {r.temperature}°C</span>
                          <span>🧪 {r.co2} PPM</span>
                        </div>
                        <div className="flex gap-2.5 justify-end text-slate-400 text-[9px]">
                          <span>🏔️ ALT: {r.altitude}m</span>
                          <span>💧 HUM: {r.humidity}%</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[9px] text-slate-400 italic">
                * Pulsa en cualquier registro para sincronizar sus valores meteorológicos al simulador de calor de forma automática.
              </p>
            </div>

          </div>
        )}

        {/* Feedback messages */}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-850 text-xs p-3.5 rounded border border-emerald-100 flex items-start gap-2.5">
            <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold uppercase text-[9px] tracking-wider">Lectura Conectada</p>
              <p className="mt-0.5 text-slate-705 leading-relaxed">{successMsg}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 text-rose-900 text-xs p-3.5 rounded border border-rose-100 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className="font-bold uppercase text-[9px] tracking-wider">Fallo de Comunicación</p>
              <p className="mt-0.5 text-slate-750 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Custom manual CSV Paste */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Ingreso de Muestras Manual (CSV)</h3>
          <div className="space-y-3">
            <textarea
              id="raw-csv-textarea"
              rows={2}
              placeholder="altitud,temperatura,humedad,co2&#10;85,32.4,52.8,495"
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              className="w-full text-[10px] p-2.5 font-mono border border-slate-250 bg-slate-50 focus:bg-white rounded focus:ring-0 focus:border-slate-400"
            />
            <div className="flex justify-between items-center gap-2">
              <button
                id="download-sample-btn"
                type="button"
                onClick={downloadSampleCSV}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-850 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Descargar una planilla con datos corregidos de prueba"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar Plantilla CSV
              </button>
              <button
                id="parse-csv-btn"
                type="button"
                onClick={handleImportPastedCSV}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Procesar Raw Data
              </button>
            </div>
          </div>
        </div>

        {/* Transmission guidelines */}
        <div className="bg-slate-50 rounded p-3.5 border border-slate-200 text-[11px] text-slate-650 leading-relaxed font-mono">
          <p className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-1">REGLAS DE TELEDETECCIÓN:</p>
          <ul className="list-decimal pl-4 space-y-1 text-[10px]">
            <li>La antena de transmisión remota del dron actualiza la hoja de cálculo de Google por canal IoT.</li>
            <li>Al reforestar árboles se enfría el microclima circundante decayendo el calor de asfalto en Bogotá.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
