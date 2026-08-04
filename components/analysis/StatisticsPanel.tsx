'use client';

import { useMemo, useState, useEffect } from 'react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import {
  Calculator,
  List,
  BarChart,
  Tag,
  Hash
} from 'lucide-react';

export default function StatisticsPanel() {
  const { dataset, profiles } = useDatasetStore();
  const [selectedColumn, setSelectedColumn] = useState('');

  // Set default selected column
  useEffect(() => {
    if (profiles.length > 0) {
      if (!selectedColumn || !profiles.find((p) => p.name === selectedColumn)) {
        setSelectedColumn(profiles[0].name);
      }
    } else {
      setSelectedColumn('');
    }
  }, [profiles, selectedColumn]);

  const selectedProfile = useMemo(() => {
    return profiles.find((p) => p.name === selectedColumn);
  }, [profiles, selectedColumn]);

  // Compute metrics (for Numeric Columns)
  const numericStats = useMemo(() => {
    if (!selectedColumn || !dataset || dataset.length === 0 || !selectedProfile) return null;
    
    const isNumeric = selectedProfile.dataType === 'Integer' || selectedProfile.dataType === 'Float';
    if (!isNumeric) return null;

    const values = dataset
      .map((row) => Number(row[selectedColumn]))
      .filter((num) => !isNaN(num) && num !== null && num !== undefined);

    if (values.length === 0) return null;

    let min = values[0];
    let max = values[0];
    let sum = 0;

    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      if (val < min) min = val;
      if (val > max) max = val;
      sum += val;
    }

    const mean = sum / values.length;

    // Median
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // StdDev
    const varianceSum = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    const stdDev = Math.sqrt(varianceSum / values.length);

    return {
      min: parseFloat(min.toFixed(4)),
      max: parseFloat(max.toFixed(4)),
      mean: parseFloat(mean.toFixed(4)),
      median: parseFloat(median.toFixed(4)),
      stdDev: parseFloat(stdDev.toFixed(4)),
      count: values.length
    };
  }, [dataset, selectedColumn, selectedProfile]);

  // Compute frequencies (for Categorical Columns)
  const categoricalStats = useMemo(() => {
    if (!selectedColumn || !dataset || dataset.length === 0 || !selectedProfile) return null;
    
    const isCategorical = selectedProfile.dataType === 'String' || selectedProfile.dataType === 'Boolean';
    if (!isCategorical) return null;

    const counts: Record<string, number> = {};
    let totalValid = 0;

    for (let i = 0; i < dataset.length; i++) {
      const val = dataset[i][selectedColumn];
      if (val !== null && val !== undefined && String(val).trim() !== '') {
        const key = String(val).trim();
        counts[key] = (counts[key] || 0) + 1;
        totalValid++;
      }
    }

    const sortedFreq = Object.entries(counts)
      .map(([value, count]) => ({
        value,
        count,
        percentage: totalValid > 0 ? parseFloat(((count / totalValid) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Limit to top 10 and group the rest
    if (sortedFreq.length > 10) {
      const top10 = sortedFreq.slice(0, 10);
      const otherCount = sortedFreq.slice(10).reduce((sum, item) => sum + item.count, 0);
      const otherPercentage = totalValid > 0 ? parseFloat(((otherCount / totalValid) * 100).toFixed(2)) : 0;
      
      top10.push({
        value: 'Lainnya (Gabungan)',
        count: otherCount,
        percentage: otherPercentage
      });
      return { items: top10, totalUnique: sortedFreq.length, totalValid };
    }

    return { items: sortedFreq, totalUnique: sortedFreq.length, totalValid };
  }, [dataset, selectedColumn, selectedProfile]);

  if (profiles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center space-x-3 bg-slate-50/50">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Statistik Deskriptif</h3>
          <p className="text-xs text-slate-400">Ringkasan ukuran statistik pemusatan, penyebaran, dan frekuensi data</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Column Select */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Pilih Kolom Analisis
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="w-full pl-3 pr-10 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {profiles.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} ({p.dataType})
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Panel Display based on selected type */}
        {selectedProfile && selectedProfile.dataType && (
          <div className="space-y-6">
            {/* 1. If NUMERIC COLUMN */}
            {(selectedProfile.dataType === 'Integer' || selectedProfile.dataType === 'Float') && numericStats && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Hash className="w-4 h-4 text-slate-400" />
                  <span>Ukuran Statistik Numerik</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Mean */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Mean (Rata-rata)</span>
                    <span className="text-lg font-bold text-slate-800 mt-1 block">{numericStats.mean.toLocaleString()}</span>
                  </div>

                  {/* Median */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Median (Nilai Tengah)</span>
                    <span className="text-lg font-bold text-slate-800 mt-1 block">{numericStats.median.toLocaleString()}</span>
                  </div>

                  {/* Standard Deviation */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Std Deviation (Penyebaran)</span>
                    <span className="text-lg font-bold text-slate-800 mt-1 block">{numericStats.stdDev.toLocaleString()}</span>
                  </div>

                  {/* Min */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Nilai Minimum</span>
                    <span className="text-lg font-bold text-slate-600 mt-1 block">{numericStats.min.toLocaleString()}</span>
                  </div>

                  {/* Max */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Nilai Maksimum</span>
                    <span className="text-lg font-bold text-slate-600 mt-1 block">{numericStats.max.toLocaleString()}</span>
                  </div>

                  {/* Total Valid Count */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Baris Terisi (Valid)</span>
                    <span className="text-lg font-bold text-slate-600 mt-1 block">{numericStats.count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. If CATEGORICAL COLUMN */}
            {(selectedProfile.dataType === 'String' || selectedProfile.dataType === 'Boolean') && categoricalStats && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span>Distribusi Frekuensi Kategori (Top 10)</span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-50 border-b text-slate-500 font-bold">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Kategori / Nilai</th>
                        <th className="px-5 py-3 font-semibold text-right">Frekuensi</th>
                        <th className="px-5 py-3 font-semibold text-right">Persentase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {categoricalStats.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 truncate max-w-[200px]" title={item.value}>
                            {item.value === '' ? <span className="text-slate-300 italic">Empty String</span> : item.value}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-slate-700">
                            {item.count.toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {item.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 font-medium px-1">
                  <span>Total Kategori Unik: <strong>{categoricalStats.totalUnique}</strong></span>
                  <span>Data Valid: <strong>{categoricalStats.totalValid.toLocaleString()} baris</strong></span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
