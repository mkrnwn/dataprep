'use client';

import { useMemo, useState, useEffect } from 'react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Trash2,
  Info
} from 'lucide-react';
import FeatureExplainer from '@/components/ui/FeatureExplainer';

export default function OutlierPanel() {
  const { dataset, profiles, handleOutliers } = useDatasetStore();
  const [selectedColumn, setSelectedColumn] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Filter numeric columns
  const numericColumns = useMemo(() => {
    return profiles.filter((p) => p.dataType === 'Integer' || p.dataType === 'Float');
  }, [profiles]);

  // Default selected column
  useEffect(() => {
    if (numericColumns.length > 0) {
      if (!selectedColumn || !numericColumns.find((c) => c.name === selectedColumn)) {
        setSelectedColumn(numericColumns[0].name);
      }
    } else {
      setSelectedColumn('');
    }
  }, [numericColumns, selectedColumn]);

  // Compute Outliers on the fly
  const outlierInfo = useMemo(() => {
    if (!selectedColumn || !dataset || dataset.length === 0) {
      return { count: 0, lowerBound: 0, upperBound: 0, iqr: 0 };
    }

    const values = dataset
      .map((row) => Number(row[selectedColumn]))
      .filter((num) => !isNaN(num) && num !== null && num !== undefined)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      return { count: 0, lowerBound: 0, upperBound: 0, iqr: 0 };
    }

    // Calculate Quartiles
    const q1Idx = Math.floor(values.length * 0.25);
    const q3Idx = Math.floor(values.length * 0.75);
    const q1 = values[q1Idx];
    const q3 = values[q3Idx];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Count outliers
    let count = 0;
    for (let i = 0; i < dataset.length; i++) {
      const val = dataset[i][selectedColumn];
      if (val === null || val === undefined || String(val).trim() === '' || isNaN(Number(val))) {
        continue;
      }
      const num = Number(val);
      if (num < lowerBound || num > upperBound) {
        count++;
      }
    }

    return {
      count,
      lowerBound,
      upperBound,
      iqr,
      q1,
      q3
    };
  }, [dataset, selectedColumn]);

  const handleApply = () => {
    if (!selectedColumn || outlierInfo.count === 0) return;

    setIsProcessing(true);
    setSuccessMsg('');

    setTimeout(() => {
      handleOutliers(selectedColumn);
      
      setSuccessMsg(`Berhasil menghapus ${outlierInfo.count} baris pencilan (outlier) dari kolom "${selectedColumn}"`);
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
            Deteksi outlier memerlukan kolom numerik (tipe data Integer atau Float). Dataset Anda tidak memuat kolom bertipe angka saat ini.
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
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Deteksi & Pembersihan Outlier (Pencilan)</h3>
          <p className="text-xs text-slate-400">Identifikasi titik ekstrem menggunakan metode Interquartile Range (IQR)</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Feature Explainer */}
        <FeatureExplainer
          title="Mendeteksi & Mengoreksi Outlier (Pencilan)"
          description="Metode Interquartile Range (IQR) mendeteksi nilai ekstrem dengan menghitung selisih kuartil atas (Q3) dan bawah (Q1). Gunakan tindakan Hapus jika outlier berupa kesalahan pengetikan/alat ukur, atau pertahankan jika anomali tersebut bermakna secara natural."
        />
        {/* Column selection */}
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

        {/* Boundary info */}
        {selectedColumn && outlierInfo.iqr !== undefined && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Kuartil 1 (Q1)</span>
              <span className="font-bold text-slate-700 block text-sm mt-0.5">
                {outlierInfo.q1 !== undefined ? outlierInfo.q1.toLocaleString() : '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Kuartil 3 (Q3)</span>
              <span className="font-bold text-slate-700 block text-sm mt-0.5">
                {outlierInfo.q3 !== undefined ? outlierInfo.q3.toLocaleString() : '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Batas Bawah IQR</span>
              <span className="font-bold text-slate-750 block text-sm mt-0.5">
                {outlierInfo.lowerBound !== undefined ? outlierInfo.lowerBound.toLocaleString() : '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Batas Atas IQR</span>
              <span className="font-bold text-slate-750 block text-sm mt-0.5">
                {outlierInfo.upperBound !== undefined ? outlierInfo.upperBound.toLocaleString() : '-'}
              </span>
            </div>
          </div>
        )}

        {/* Warning or success banner */}
        {outlierInfo.count > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Terdeteksi {outlierInfo.count} Baris Outlier</p>
              <p className="text-amber-700/90 mt-1 leading-relaxed">
                Terdapat <strong>{outlierInfo.count.toLocaleString()} baris data</strong> yang berada di luar batas IQR (di bawah {outlierInfo.lowerBound?.toFixed(2)} atau di atas {outlierInfo.upperBound?.toFixed(2)}). Titik ekstrem ini dapat mempengaruhi representasi rata-rata statistik secara signifikan.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3 text-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Bebas Outlier Terdeteksi</p>
              <p className="text-green-700/90 mt-1 leading-relaxed">
                Luar biasa! Tidak ada data pencilan (outlier) yang terdeteksi di kolom ini berdasarkan batas kriteria IQR.
              </p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg p-3.5 flex items-center space-x-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleApply}
            disabled={outlierInfo.count === 0 || isProcessing}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all ${
              outlierInfo.count > 0 && !isProcessing
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 hover:scale-[1.01] hover:shadow-lg cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Membersihkan Outlier...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Hapus Baris Outlier</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
