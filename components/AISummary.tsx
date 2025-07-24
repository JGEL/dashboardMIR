import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UniversityData, Metric } from '../types';
import { SparklesIcon, ClipboardIcon, CheckIcon } from './Icons';

interface AISummaryProps {
  data: UniversityData[];
  mode: 'COMPARISON' | 'EVOLUTION';
  year?: number;
  metrics?: Metric[];
}

const AISummary: React.FC<AISummaryProps> = ({ data, mode, year, metrics }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [cache, setCache] = useState<Record<string, string>>({});
  const [isCopied, setIsCopied] = useState(false);

  const cacheKey = useMemo(() => {
    if (data.length === 0) return '';
    if (mode === 'COMPARISON') {
      return `${mode}-${year}-${data.map(d => d.name).sort().join(',')}`;
    } else { // EVOLUTION
      if (!metrics || metrics.length === 0) return '';
      return `${mode}-${data.map(d => d.name).sort().join(',')}-${metrics.map(m => m.key).sort().join(',')}`;
    }
  }, [data, mode, year, metrics]);

  const summaryLines = useMemo(() => summary.split('\n').map(line => line.trim().replace(/^- /, '')).filter(line => line), [summary]);

  const handleCopySummary = () => {
    if (!summary) return;

    const textToCopy = summary.startsWith('- ') ? summary : summaryLines.map(line => `- ${line}`).join('\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  const handleGenerateSummary = async () => {
    if (cache[cacheKey]) {
      setSummary(cache[cacheKey]);
      setError('');
      return;
    }
    if (!process.env.API_KEY) {
        setError('La API Key de Google Gemini no está configurada.');
        return;
    }
    
    setIsLoading(true);
    setSummary('');
    setError('');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let prompt = '';
    if (mode === 'COMPARISON') {
      const dataForPrompt = data.map(({ year, ...rest }) => rest);
      prompt = `
        Eres un analista de datos experto en educación superior en España.
        Analiza los siguientes datos del examen MIR para el año ${year}.
        Los datos están en formato JSON.
        - Compara el rendimiento de las universidades seleccionadas.
        - Destaca las fortalezas y debilidades de cada una, basándote en los porcentajes de éxito y el número de plazas.
        - Proporciona un resumen conciso en formato de lista de viñetas (usando guiones -). No uses formato markdown.
        
        Datos:
        ${JSON.stringify(dataForPrompt, null, 2)}
      `;
    } else { // EVOLUTION
      const metricLabels = metrics?.map(m => m.label).join(', ') || 'seleccionadas';
      prompt = `
        Eres un analista de datos experto en educación superior en España.
        Analiza la evolución de los datos del examen MIR para las universidades seleccionadas a lo largo de los años.
        Los datos están en formato JSON. Las métricas analizadas son: ${metricLabels}.
        - Describe las tendencias generales (mejora, empeoramiento, estabilidad) para cada universidad.
        - Compara las trayectorias entre las universidades. ¿Alguna está mejorando más rápido que otras?
        - Identifica el mejor y el peor año para cada universidad en las métricas clave.
        - Proporciona un resumen conciso en formato de lista de viñetas (usando guiones -). No uses formato markdown.
        
        Datos:
        ${JSON.stringify(data, null, 2)}
      `;
    }

    try {
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let fullText = '';
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        fullText += chunkText;
        setSummary(fullText);
      }
      
      setCache(prev => ({...prev, [cacheKey]: fullText}));

    } catch (e) {
      console.error(e);
      setError('No se pudo generar el análisis. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasData = data.length > 0 && (mode === 'COMPARISON' || (mode === 'EVOLUTION' && metrics && metrics.length > 0));

  if (!hasData) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <SparklesIcon className="text-cyan-500 w-8 h-8"/>
            <div>
                 <h2 className="text-xl font-bold text-slate-800">Análisis con IA</h2>
                 <p className="text-sm text-gray-500">Obtén un resumen instantáneo de los datos seleccionados.</p>
            </div>
        </div>
        <button
          onClick={handleGenerateSummary}
          disabled={isLoading || !hasData}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                <span>Generando...</span>
            </>
          ) : (
             <>
                <SparklesIcon className="w-5 h-5"/>
                <span>{cache[cacheKey] ? 'Ver Análisis' : 'Generar Análisis'}</span>
            </>
          )}
        </button>
      </div>

      {(summary || error || (isLoading && !summary)) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
             {isLoading && !summary && <p className="text-center text-gray-500">La IA está analizando los datos...</p>}
             {error && <p className="text-center text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
             {summary && !error && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">Resumen de la IA:</h3>
                      <button
                        onClick={handleCopySummary}
                        disabled={isLoading}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 ${
                          isCopied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <ClipboardIcon className="w-4 h-4" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-slate-700 text-sm">
                      <ul className="space-y-2 list-disc list-inside">
                        {summaryLines.map((line, index) => (
                          <li key={index}>{line}</li>
                        ))}
                      </ul>
                      {isLoading && <span className="inline-block w-2 h-4 bg-slate-700 animate-pulse ml-1"></span>}
                    </div>
                </div>
             )}
        </div>
      )}
    </div>
  );
};

export default AISummary;
