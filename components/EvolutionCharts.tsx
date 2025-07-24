import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UniversityData, Metric } from '../types';

interface EvolutionChartsProps {
  data: UniversityData[];
  metrics: Metric[];
  allYears: number[];
}

const COLORS = ['#06b6d4', '#f59e0b', '#84cc16', '#ec4899', '#8b5cf6'];

const getDynamicPercentageDomain = (values: number[]): [number, number] => {
  if (!values || values.length === 0) {
    return [0, 100];
  }
  const minVal = Math.min(...values);
  if (minVal < 50) {
    return [0, 100];
  }
  const domainMin = Math.floor((minVal - 10) / 5) * 5;
  return [Math.max(0, domainMin), 100];
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg text-sm">
        <p className="label font-bold text-slate-900">{`Año: ${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value}${pld.unit || ''}`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-80">
        <h3 className="font-bold text-center text-slate-800 mb-4">{title}</h3>
        {children}
    </div>
);

const EvolutionCharts: React.FC<EvolutionChartsProps> = ({ data, metrics, allYears }) => {
  
  const universityNames = [...new Set(data.map(d => d.name))];

  const chartDataByMetric = metrics.map(metric => {
    const processedData = allYears.sort((a,b) => a - b).map(year => {
      const yearEntry: {[key: string]: string | number} = { year: year.toString() };
      universityNames.forEach(name => {
        const uniDataForYear = data.find(d => d.name === name && d.year === year);
        yearEntry[name] = uniDataForYear ? uniDataForYear[metric.key] as number : 0;
      });
      return yearEntry;
    });

    let domain: [number | 'auto', number | 'auto'] = ['auto', 'auto'];
    if (metric.isPercentage) {
        const values = data
            .map(d => d[metric.key] as number)
            .filter(v => v > 0);
        domain = getDynamicPercentageDomain(values);
    }

    return { metric, processedData, domain };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {chartDataByMetric.map(({ metric, processedData, domain }) => (
        <ChartCard title={metric.label} key={metric.key}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                domain={domain} 
                unit={metric.isPercentage ? '%' : ''} />
              <Tooltip content={<CustomTooltip unit={metric.isPercentage ? '%' : ''} />} cursor={{ stroke: 'rgba(203, 213, 225, 0.8)' }}/>
              <Legend formatter={(value, entry, index) => {
                  const uni = universityNames.find(name => name === value);
                  return uni ? (data.find(d => d.name === uni)?.abbreviation || value) : value;
              }} wrapperStyle={{ bottom: -5, left: 20, fontSize: '12px' }} />
              {universityNames.map((name, index) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      ))}
    </div>
  );
};

export default EvolutionCharts;