import React, { useState } from 'react';
import { Sparkles, Brain, Loader, CheckCircle, RefreshCw, Send, HelpCircle } from 'lucide-react';
import { DroneTelemetry, GridCell } from '../types';

interface GeminiAdvisorProps {
  droneTelemetry: DroneTelemetry;
  gridStats: {
    avgTemp: number;
    maxTemp: number;
    avgCo2: number;
    treesCount: number;
    factoriesCount: number;
    rawGrid: GridCell[][];
  } | null;
  activeScenarioName: string;
}

export default function GeminiAdvisor({ droneTelemetry, gridStats, activeScenarioName }: GeminiAdvisorProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const loadingMessages = [
    "Iniciando red neuronal Gemini...",
    "Correlacionando niveles de CO₂ con temperatura registrada por el dron...",
    "Buscando puntos críticos de acumulación calórica (focos calientes)...",
    "Analizando el balance de árboles y plantas en tu territorio...",
    "Calculando las ubicaciones ideales para sembrar pulmones verdes urbanos...",
    "Estructurando propuestas científicas para las Olimpíadas de Colombia 2026..."
  ];

  // Rotate loading messages during API calls
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const triggerAIAnalysis = async () => {
    if (!gridStats) return;
    setLoading(true);
    setAnalysis('');
    
    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          droneData: {
            altitude: droneTelemetry.altitude,
            temperature: droneTelemetry.temperature,
            humidity: droneTelemetry.humidity,
            co2: droneTelemetry.co2,
            heatIndex: droneTelemetry.heatIndex,
            heatLevel: droneTelemetry.heatLevel
          },
          gridData: {
            rows: 10,
            cols: 10,
            stats: {
              avgTemp: gridStats.avgTemp,
              maxTemp: gridStats.maxTemp,
              avgCo2: gridStats.avgCo2,
              trees: gridStats.treesCount,
              plants: gridStats.treesCount * 0.5, // simulated plants estimation for statistics
              houses: 12, // simulated counts
              buildings: 15,
              factories: gridStats.factoriesCount,
              empty: 100 - (gridStats.treesCount + gridStats.factoriesCount)
            }
          },
          scenarios: {
            activeName: activeScenarioName
          },
          customQuestion: customQuestion.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo completar el análisis del servidor.');
      }

      const data = await response.json();
      setAnalysis(data.analysis || 'No se recibió un informe consistente de la IA.');
    } catch (err: any) {
      console.error(err);
      setAnalysis(`### ❌ Error de Conexión\n\nNo fue posible procesar el reporte con Gemini. Mensaje: ${err.message || 'Error de red'}.\n\nPor favor, verifica el estado del servidor e inténtalo de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  // Convert Gemini Markdown output to simple styled HTML strings securely
  const renderMarkdown = (text: string) => {
    if (!text) return null;

    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('###')) {
        return <h4 key={idx} className="text-base font-bold text-slate-800 mt-4 mb-2 flex items-center gap-2">{trimmed.replace('###', '')}</h4>;
      }
      if (trimmed.startsWith('##')) {
        return <h3 key={idx} className="text-lg font-bold text-slate-800 mt-5 border-b border-indigo-50 pb-1 mb-2.5">{trimmed.replace('##', '')}</h3>;
      }
      if (trimmed.startsWith('#')) {
        return <h2 key={idx} className="text-xl font-black text-slate-900 mt-6 mb-3">{trimmed.replace('#', '')}</h2>;
      }

      // Checklists/Bulletpoints
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const itemContent = trimmed.substring(1).trim();
        return (
          <li key={idx} className="ml-5 list-disc text-sm text-slate-700 leading-relaxed mb-1.5">
            {formatBoldText(itemContent)}
          </li>
        );
      }

      // Standard paragraphs
      if (trimmed.length > 0) {
        return <p key={idx} className="text-sm text-slate-600 leading-relaxed mb-3">{formatBoldText(trimmed)}</p>;
      }

      return <div key={idx} className="h-2" />;
    });
  };

  // Basic formatter for bold text (**)
  const formatBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-slate-900 font-bold">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div id="ai-pattern-analyzer" className="bg-white border border-slate-200 rounded-lg p-5 space-y-6">
      
      {/* Advisor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded text-white shrink-0">
            <Brain className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Consultor Inteligente IA</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Análisis Térmico Avanzado • Gemini</p>
          </div>
        </div>

        <button
          id="trigger-ai-btn"
          onClick={triggerAIAnalysis}
          disabled={loading || !gridStats}
          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {loading ? 'Analizando...' : 'Analizar'}
        </button>
      </div>

      {/* Main content display */}
      <div className="bg-slate-50 rounded border border-slate-200 p-4 min-h-[180px] flex flex-col justify-between">
        
        {loading ? (
          /* Animated loading states */
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="p-3 bg-slate-200/60 text-slate-850 rounded-full animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-705">Procesando Variables Científicas...</p>
              <p className="text-xs text-slate-500 font-mono italic">
                "{loadingMessages[placeholderIndex]}"
              </p>
            </div>
          </div>
        ) : analysis ? (
          /* Report representation with formatted markdown */
          <div className="prose prose-slate max-w-none">
            <div className="flex items-center gap-2 text-[#10b981] font-bold text-[10px] uppercase tracking-widest mb-3">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Auditoría Térmica e Ingeniería de Mitigación Integrada
            </div>
            <div className="space-y-1">
              {renderMarkdown(analysis)}
            </div>
          </div>
        ) : (
          /* Landing state */
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-3">
            <Sparkles className="w-10 h-10 text-slate-300" />
            <div className="max-w-md">
              <p className="text-xs font-black uppercase tracking-widest text-slate-700">Listo para Analizar Patrones de Calor</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Haz clic en <strong>"Analizar"</strong> para que la Inteligencia Artificial analice la cuadrícula urbana activa, la disipación térmica del dron y genere un reporte científico para las Olimpíadas 2026.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Interactive custom questions to Gemini */}
      <div className="bg-slate-50 rounded border border-slate-200 p-3.5 space-y-3">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <HelpCircle className="w-3.5 h-3.5" />
          Preguntar al Asistente Científico (Opcional)
        </div>
        <div className="flex gap-2">
          <input
            id="ai-custom-prompt"
            type="text"
            placeholder="Ej: ¿Cómo influyen el dióxido de carbono en la retención del asfalto?"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-slate-450 bg-white"
          />
          <button
            id="send-custom-prompt-btn"
            onClick={triggerAIAnalysis}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
            title="Enviar pregunta científica a la IA"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 italic">
          La IA adaptará el reporte científico respondiendo de forma integrada a tu interrogante ecológica.
        </p>
      </div>

      {/* Colombia 2026 motivation */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 text-center">
        “Teledetección aérea para salvaguardar el microclima andino” • 2026
      </div>

    </div>
  );
}
