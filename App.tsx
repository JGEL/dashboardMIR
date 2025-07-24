
import React, { useState, useMemo } from 'react';
import { ALL_UNIVERSITY_DATA, METRICS, UNIVERSITY_DATA_BY_YEAR, customSort } from './constants/data';
import { UniversityData, ViewMode, Metric } from './types';
import Header from './components/Header';
import UniversitySelector from './components/UniversitySelector';
import ComparisonCharts from './components/ComparisonCharts';
import ComparisonTable from './components/ComparisonTable';
import { AnalyticsIcon, TableIcon } from './components/Icons';
import YearSelector from './components/YearSelector';
import ViewModeSwitcher from './components/ViewModeSwitcher';
import EvolutionUniversitySelector from './components/EvolutionUniversitySelector';
import MetricSelector from './components/MetricSelector';
import EvolutionCharts from './components/EvolutionCharts';
import EvolutionTable from './components/EvolutionTable';
import AISummary from './components/AISummary';


const App: React.FC = () => {
  // Common state
  const [viewMode, setViewMode] = useState<ViewMode>('COMPARISON');
  
  const availableYears = useMemo(() => 
    Object.keys(UNIVERSITY_DATA_BY_YEAR).map(Number).sort((a, b) => b - a),
    []
  );
  
  const allUniversities = useMemo(() => {
    const uniqueNames = [...new Set(ALL_UNIVERSITY_DATA.map(d => d.name))];
    const uniqueData = uniqueNames.map(name => ALL_UNIVERSITY_DATA.find(d => d.name === name)!);
    return uniqueData.sort(customSort);
  }, []);

  // State for 'COMPARISON' mode
  const [comparisonSelectedNames, setComparisonSelectedNames] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || new Date().getFullYear());

  // State for 'EVOLUTION' mode
  const [evolutionSelectedNames, setEvolutionSelectedNames] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<Array<keyof UniversityData>>(['placesAwarded', 'percentagePlacesOverPresented']);

  // Memoized data for 'COMPARISON' mode
  const yearlyData = useMemo(() => UNIVERSITY_DATA_BY_YEAR[selectedYear] || [], [selectedYear]);
  const comparisonFilteredData = useMemo(() => yearlyData.filter(u => comparisonSelectedNames.includes(u.name)), [yearlyData, comparisonSelectedNames]);

  // Memoized data for 'EVOLUTION' mode
  const evolutionFilteredData = useMemo(() => {
    return ALL_UNIVERSITY_DATA.filter(u => evolutionSelectedNames.includes(u.name));
  }, [evolutionSelectedNames]);
  
  const evolutionSelectedMetrics = useMemo(() => METRICS.filter(m => selectedMetrics.includes(m.key)), [selectedMetrics]);


  // Handlers
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setComparisonSelectedNames([]);
  };

  const handleComparisonSelectionChange = (name: string) => {
    setComparisonSelectedNames(prev => {
      if (prev.includes(name)) return prev.filter(u => u !== name);
      return prev.length < 5 ? [...prev, name] : prev;
    });
  };

  const handleEvolutionSelectionChange = (name: string) => {
    setEvolutionSelectedNames(prev => {
      if (prev.includes(name)) return prev.filter(u => u !== name);
      return prev.length < 5 ? [...prev, name] : prev;
    });
  };
  
  const handleMetricChange = (metricKey: keyof UniversityData) => {
    setSelectedMetrics(prev => 
      prev.includes(metricKey) 
        ? prev.filter(k => k !== metricKey)
        : [...prev, metricKey]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 space-y-8">
          <ViewModeSwitcher viewMode={viewMode} setViewMode={setViewMode} />

          {viewMode === 'COMPARISON' ? (
            <>
              <YearSelector 
                availableYears={availableYears}
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
              />
              <UniversitySelector
                allUniversities={yearlyData}
                selectedNames={comparisonSelectedNames}
                onSelectionChange={handleComparisonSelectionChange}
              />
               <div className="space-y-6">
                 <AISummary
                  data={comparisonFilteredData}
                  mode="COMPARISON"
                  year={selectedYear}
                />
              </div>
              {comparisonFilteredData.length > 0 ? (
                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3"><AnalyticsIcon />Visualización Comparativa</h2>
                    <ComparisonCharts data={comparisonFilteredData} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3"><TableIcon />Tabla de Datos Detallada</h2>
                    <ComparisonTable data={comparisonFilteredData} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 px-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-800">Seleccione Universidades para Comparar</h3>
                  <p className="mt-2 text-gray-500">Para comenzar, seleccione hasta 5 universidades de la lista superior.</p>
                </div>
              )}
            </>
          ) : (
             <>
                <EvolutionUniversitySelector
                  allUniversities={allUniversities}
                  selectedNames={evolutionSelectedNames}
                  onSelectionChange={handleEvolutionSelectionChange}
                />
                <MetricSelector
                    selectedMetrics={selectedMetrics}
                    onMetricChange={handleMetricChange}
                />
                <div className="space-y-6">
                  <AISummary
                    data={evolutionFilteredData}
                    mode="EVOLUTION"
                    metrics={evolutionSelectedMetrics}
                  />
                </div>
               {evolutionFilteredData.length > 0 && selectedMetrics.length > 0 ? (
                 <div className="space-y-12">
                   <div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3"><AnalyticsIcon />Gráficos de Evolución</h2>
                      <EvolutionCharts 
                        data={evolutionFilteredData} 
                        metrics={evolutionSelectedMetrics} 
                        allYears={availableYears} 
                      />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3"><TableIcon />Tabla de Evolución Anual</h2>
                      <EvolutionTable
                        data={evolutionFilteredData}
                        metrics={evolutionSelectedMetrics}
                      />
                   </div>
                 </div>
                ) : (
                <div className="text-center py-16 px-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-800">Visualice la Evolución Anual</h3>
                  <p className="mt-2 text-gray-500">Seleccione al menos una universidad y una métrica para ver su evolución a través de los años.</p>
                </div>
               )}
             </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
