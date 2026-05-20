import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

// Shared Gemini client utility
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for Gemini analysis
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { droneData, gridData, scenarios } = req.body;
    
    // Construct prompt
    const prompt = `
Actúa como un experto consultor científico ambiental especializado en Cambio Climático, Sostenibilidad Urbana y Planificación de Ciudades Mitigadoras de Islas de Calor para las Olimpíadas de Colombia 2026.
Estamos analizando patrones térmicos usando un Dron Teledirigido dotado de bio-sensores de CO2, Temperatura, Humedad y Altitud, además de una Cámara Térmica.

Presentamos dos conjuntos de datos:

1. DATOS TELEMÉTRICOS DE VUELO DEL DRON:
- Altitud: ${droneData?.altitude ?? 45} metros
- Temperatura Promedio: ${droneData?.temperature ?? 24}°C
- Humedad Relativa: ${droneData?.humidity ?? 60}%
- Niveles de Dióxido de Carbono (CO2): ${droneData?.co2 ?? 415} ppm
- Índice de isla de calor estimado: ${droneData?.heatIndex ?? 'Bajo'}

2. MAPA DE CUADRÍCULA URBANA (SIMULADOR DE MITIGACIÓN):
Un mapa de cuadrícula de ${gridData.rows} x ${gridData.cols} representa el territorio actual.
El recuento de elementos en la cuadrícula es:
- Árboles plantados: ${gridData.stats.trees} (Enfrían y absorben CO2)
- Vegetación/Plantas: ${gridData.stats.plants} (Refrescan moderadamente)
- Casas residenciales: ${gridData.stats.houses} (Emisión térmica leve)
- Edificios de concreto: ${gridData.stats.buildings} (Efecto cañón térmico, absorben calor)
- Plantas de contaminación / Industrias: ${gridData.stats.factories} (Emisiones críticas de CO2 y calor directo)
- Suelos vacíos/asfalto: ${gridData.stats.empty} (Absorbe calor solar)

El escenario de simulación activo es: "${scenarios.activeName}".
La temperatura calculada en el simulador urbano es de un promedio de ${gridData.stats.avgTemp.toFixed(1)}°C (Máxima pico: ${gridData.stats.maxTemp.toFixed(1)}°C).
El índice de CO2 urbano estimado es de ${gridData.stats.avgCo2.toFixed(1)} ppm.

Por favor, genera un análisis ambiental riguroso y didáctico (para jurados de Olimpíadas) en ESPAÑOL, estructurado de la siguiente forma:
1. **Análisis de Patrones Térmicos (Hallazgos)**: Explica cómo interactúan el CO2, la humedad, la altitud y las estructuras con la temperatura registrada por el dron. Identifica los puntos críticos de acumulación de calor (islas de calor).
2. **Propuestas de intervención urbana concretas**: Recomienda exactamente dónde colocar más árboles o plantas, o qué estructuras (como fábricas o edificios) sustituir o reformular para disminuir la isla de calor eficazmente. Sé específico (menciona el balance de elementos).
3. **Estrategia para Colombia 2026**: Proporciona un mensaje inspirador final sobre cómo este modelo tecnológico de dron y simulación puede ser implementado a gran escala en municipios de Colombia para frenar el cambio climático.

Usa viñetas limpias, negrita para destacar métricas clave, y un tono científico, elocuente y motivador. El texto debe estar en formato Markdown directo (sin bloques contenedores markdown redundantes, sólo el markdown listo para renderizar).
`;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables");
      return res.status(200).json({ 
        analysis: "### ⚠️ Clave de API de Gemini No Configurada\n\nEl servidor está funcionando perfectamente, pero no se ha configurado la clave `GEMINI_API_KEY` en los secretos o variables de entorno.\n\n**Análisis Simulado para las Olimpíadas 2026 (Modo offline):**\n\n1. **Patrones Térmicos**: Se ha detectado un comportamiento térmico crítico en las zonas de mayor densidad de **Edificios de Concreto** e **Industrias**. El calor es absorbido y retenido por los materiales cementicios, liberándolo paulatinamente. Esto genera anomalías de hasta **+6.5°C** en comparación con las zonas con áreas verdes.\n\n2. **Propuestas de Mitigación**: Recomendamos implementar un cinturón verde alrededor de las fuentes de calor industriales. Reemplazar al menos un **20%** de los edificios centrales por **Árboles robustos** lograría mitigar hasta **3.2°C** circundantes la temperatura superficial y reducir la retención térmica en un **15%**.\n\n3. **Proyección para Colombia**: Este sistema integral en Colombia serviría para planificar de forma inteligente la adaptación urbana de ciudades de alta densidad calórica como Barranquilla, Cali y Cúcuta, minimizando los riesgos de salud pública."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Error in Gemini API:", error);
    res.status(500).json({ error: error?.message || "Error al procesar el análisis con Gemini" });
  }
});

// Setup Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
