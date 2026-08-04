'use client';

import { useMemo, useState, useEffect } from 'react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  BarChart3,
  ScatterChart as ScatterIcon,
  HelpCircle,
  TrendingUp,
  Layout
} from 'lucide-react';

export default function ChartPanel() {
  const { dataset, profiles } = useDatasetStore();
  const [chartType, setChartType] = useState<'bar' | 'scatter'>('bar');

  // State for Bar Chart
  const [barColumn, setBarColumn] = useState('');

  // State for Scatter Plot
  const [scatterX, setScatterX] = useState('');
  const [scatterY, setScatterY] = useState('');

  // Filters profiles for column types
  const categoricalColumns = useMemo(() => {
    return profiles.filter((p) => p.dataType === 'String' || p.dataType === 'Boolean');
  }, [profiles]);

  const numericColumns = useMemo(() => {
    return profiles.filter((p) => p.dataType === 'Integer' || p.dataType === 'Float');
  }, [profiles]);

  // Set default column selections
  useEffect(() => {
    if (categoricalColumns.length > 0 && !barColumn) {
      setBarColumn(categoricalColumns[0].name);
    }
  }, [categoricalColumns, barColumn]);

  useEffect(() => {
    if (numericColumns.length > 0) {
      if (!scatterX) setScatterX(numericColumns[0].name);
      if (!scatterY) {
        setScatterY(numericColumns[1]?.name || numericColumns[0].name);
      }
    }
  }, [numericColumns, scatterX, scatterY]);

  // Calculate Bar Chart data (Top 10 + Other)
  const barChartData = useMemo(() => {
    if (!barColumn || !dataset || dataset.length === 0) return [];

    const counts: Record<string, number> = {};
    let totalValid = 0;

    for (let i = 0; i < dataset.length; i++) {
      const val = dataset[i][barColumn];
      if (val !== null && val !== undefined && String(val).trim() !== '') {
        const key = String(val).trim();
        counts[key] = (counts[key] || 0) + 1;
        totalValid++;
      }
    }

    const sorted = Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

    if (sorted.length > 10) {
      const top10 = sorted.slice(0, 10);
      const otherCount = sorted.slice(10).reduce((sum, item) => sum + item.count, 0);
      
      top10.push({
        value: 'Lainnya',
        count: otherCount
      });
      return top10;
    }

    return sorted;
  }, [dataset, barColumn]);

  // Calculate Scatter Plot data (with 1,000 pt uniform sampler)
  const scatterPlotData = useMemo(() => {
    if (!scatterX || !scatterY || !dataset || dataset.length === 0) return [];

    // Extract valid XY coordinate rows
    const validCoordinates: { x: number; y: number }[] = [];
    for (let i = 0; i < dataset.length; i++) {
      const row = dataset[i];
      const xVal = Number(row[scatterX]);
      const yVal = Number(row[scatterY]);
      if (!isNaN(xVal) && !isNaN(yVal) && row[scatterX] !== null && row[scatterY] !== null) {
        validCoordinates.push({ x: xVal, y: yVal });
      }
    }

    // Performance threshold check: sample at most 1,000 points uniformly
    if (validCoordinates.length > 1000) {
      const sampled: { x: number; y: number }[] = [];
      const step = Math.floor(validCoordinates.length / 1000);
      for (let i = 0; i < validCoordinates.length; i += step) {
        if (sampled.length < 1000) {
          sampled.push(validCoordinates[i]);
        }
      }
      return sampled;
    }

    return validCoordinates;
  }, [dataset, scatterX, scatterY]);

  if (profiles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300 flex flex-col h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Visualisasi Grafik Interaktif</h3>
            <p className="text-xs text-slate-400">Gambarkan pola dan korelasi data secara grafis</p>
          </div>
        </div>

        {/* Switch Chart Type pills */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
              chartType === 'bar'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar Chart</span>
          </button>
          <button
            onClick={() => setChartType('scatter')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
              chartType === 'scatter'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ScatterIcon className="w-3.5 h-3.5" />
            <span>Scatter Plot</span>
          </button>
        </div>
      </div>

      {/* Control selects based on selected chart */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/20 flex flex-wrap gap-4 shrink-0 text-xs">
        {chartType === 'bar' ? (
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="font-semibold text-slate-500 uppercase tracking-wider block">Pilih Kolom Kategori</label>
            <select
              value={barColumn}
              onChange={(e) => setBarColumn(e.target.value)}
              className="w-full max-w-sm px-2.5 py-1.5 bg-white border border-gray-250 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {categoricalColumns.length > 0 ? (
                categoricalColumns.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name} ({col.uniqueCount} unik)
                  </option>
                ))
              ) : (
                <option value="">Tidak ada kolom kategorikal</option>
              )}
            </select>
          </div>
        ) : (
          <div className="flex gap-4 flex-wrap flex-1">
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <label className="font-semibold text-slate-500 uppercase tracking-wider block">Sumbu X (Numerik)</label>
              <select
                value={scatterX}
                onChange={(e) => setScatterX(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-250 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {numericColumns.length > 0 ? (
                  numericColumns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name}
                    </option>
                  ))
                ) : (
                  <option value="">Tidak ada kolom numerik</option>
                )}
              </select>
            </div>
            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <label className="font-semibold text-slate-500 uppercase tracking-wider block">Sumbu Y (Numerik)</label>
              <select
                value={scatterY}
                onChange={(e) => setScatterY(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-250 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {numericColumns.length > 0 ? (
                  numericColumns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name}
                    </option>
                  ))
                ) : (
                  <option value="">Tidak ada kolom numerik</option>
                )}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Chart Rendering Area */}
      <div className="flex-1 p-6 min-h-[300px] flex items-center justify-center bg-slate-50/10">
        {/* Render Bar Chart */}
        {chartType === 'bar' && (
          categoricalColumns.length > 0 && barColumn ? (
            <div className="w-full h-full min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="value"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-xs py-10 flex flex-col items-center">
              <HelpCircle className="w-10 h-10 text-slate-300 mb-2" />
              <span>Gagal memuat grafik. Tidak ada kolom tipe kategorikal.</span>
            </div>
          )
        )}

        {/* Render Scatter Plot */}
        {chartType === 'scatter' && (
          numericColumns.length > 0 && scatterX && scatterY ? (
            <div className="w-full h-full min-h-[280px] flex flex-col justify-between">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="x"
                      type="number"
                      name={scatterX}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="y"
                      type="number"
                      name={scatterY}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    />
                    <Scatter name="Data Point" data={scatterPlotData} fill="#ec4899" shape="circle" fillOpacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Indicator warning */}
              {dataset.length > 1000 && (
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium justify-center pt-2 border-t border-dashed border-slate-200 mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>
                    Sampling aktif: Menampilkan {scatterPlotData.length.toLocaleString()} titik data terdistribusi secara seragam dari total {dataset.length.toLocaleString()} baris untuk kinerja grafis optimal.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 text-xs py-10 flex flex-col items-center">
              <HelpCircle className="w-10 h-10 text-slate-300 mb-2" />
              <span>Gagal memuat grafik. Pastikan Anda memiliki minimal satu kolom tipe numerik.</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
