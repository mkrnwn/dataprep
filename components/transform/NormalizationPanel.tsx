'use client';

import { useMemo, useState, useEffect } from 'react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import {
  Sparkles,
  Check,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import FeatureExplainer from '@/components/ui/FeatureExplainer';

export default function NormalizationPanel() {
  const { profiles, handleTransform } = useDatasetStore();
  const [selectedColumn, setSelectedColumn] = useState('');
  const [method, setMethod] = useState<'min-max' | 'z-score'>('min-max');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Filter numeric columns
  const numericColumns = useMemo(() => {
    return profiles.filter((p) => p.dataType === 'Integer' || p.dataType === 'Float');
  }, [profiles]);

  // Set default column
  useEffect(() => {
    if (numericColumns.length > 0) {
      if (!selectedColumn || !numericColumns.find((c) => c.name === selectedColumn)) {
        setSelectedColumn(numericColumns[0].name);
      }
    } else {
      setSelectedColumn('');
    }
  }, [numericColumns, selectedColumn]);

  const selectedProfile = useMemo(() => {
    return profiles.find((p) => p.name === selectedColumn);
  }, [profiles, selectedColumn]);

  const handleApply = () => {
    if (!selectedColumn || !method) return;

    setIsProcessing(true);
    setSuccessMsg('');

    setTimeout(() => {
      handleTransform(method, selectedColumn);
      
      const methodLabel = method === 'min-max' ? 'Min-Max (skala 0-1)' : 'Z-Score (standarisasi)';
      setSuccessMsg(`Kolom "${selectedColumn}" berhasil dinormalisasi menggunakan metode ${methodLabel}`);
      setIsProcessing(false);

      // Auto clear success message
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 600);
  };

  if (numericColumns.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
        <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
          <Info className="w-12 h-12" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">Tidak Ada Kolom Numerik</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Normalisasi data memerlukan kolom numerik (tipe data Integer atau Float). Dataset Anda tidak memuat kolom bertipe angka.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center space-x-3 bg-slate-50/50">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Maximize2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Normalisasi Data (Feature Scaling)</h3>
          <p className="text-xs text-slate-400">Skalakan kolom numerik agar memiliki rentang nilai yang seragam</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Feature Explainer */}
        <FeatureExplainer
          title="Normalisasi Data (Feature Scaling)"
          description="Metode Min-Max memetakan angka ke skala [0, 1], sedangkan Z-Score menstandardisasi data agar rata-rata = 0 dan standar deviasi = 1. Ini sangat penting untuk algoritma AI berbasis jarak seperti KNN atau Neural Networks agar tidak bias terhadap skala atribut."
        />
        {/* Column Select */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Pilih Kolom Numerik
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => {
              setSelectedColumn(e.target.value);
              setSuccessMsg('');
            }}
            className="w-full pl-3 pr-10 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {numericColumns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.dataType})
              </option>
            ))}
          </select>
        </div>

        {/* Current Stats summary */}
        {selectedProfile && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Min</span>
              <span className="font-bold text-slate-700 block text-sm mt-0.5">
                {selectedProfile.min !== undefined ? selectedProfile.min.toLocaleString() : '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Max</span>
              <span className="font-bold text-slate-700 block text-sm mt-0.5">
                {selectedProfile.max !== undefined ? selectedProfile.max.toLocaleString() : '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Mean</span>
              <span className="font-bold text-slate-700 block text-sm mt-0.5">
                {selectedProfile.mean !== undefined ? selectedProfile.mean.toLocaleString() : '-'}
              </span>
            </div>
          </div>
        )}

        {/* Method Toggle */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Pilih Metode Normalisasi
          </label>

          <div className="space-y-2.5">
            {/* Min-Max */}
            <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="norm-method"
                checked={method === 'min-max'}
                onChange={() => setMethod('min-max')}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-700">Min-Max Scaling (Rentang 0 - 1)</span>
                <p className="text-slate-500 mt-0.5">
                  Memetakan nilai ke dalam rentang `[0, 1]`. Sangat cocok untuk algoritma pembelajaran mesin seperti KNN atau Neural Networks.
                </p>
              </div>
            </label>

            {/* Z-Score */}
            <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="norm-method"
                checked={method === 'z-score'}
                onChange={() => setMethod('z-score')}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-700">Z-Score Standardization (Mean=0, StdDev=1)</span>
                <p className="text-slate-500 mt-0.5">
                  Menstandardisasi data sehingga nilai rata-rata menjadi 0 dan standar deviasi menjadi 1. Berguna untuk menangani outlier secara moderat.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg p-3.5 flex items-center space-x-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-green-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleApply}
            disabled={!selectedColumn || isProcessing}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all ${
              selectedColumn && !isProcessing
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 hover:scale-[1.01] hover:shadow-lg cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Mentransformasi...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Normalisasikan Kolom</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
