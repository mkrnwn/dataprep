'use client';

import { useMemo, useState } from 'react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import {
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';

export default function DuplicatePanel() {
  const { dataset, metadata, removeDuplicates } = useDatasetStore();
  const [isCleaning, setIsCleaning] = useState(false);

  // Calculate duplicates count on the fly
  const duplicateCount = useMemo(() => {
    if (!dataset || dataset.length === 0) return 0;
    const seen = new Set<string>();
    let count = 0;
    
    for (let i = 0; i < dataset.length; i++) {
      const row = dataset[i];
      const key = JSON.stringify(row);
      if (seen.has(key)) {
        count++;
      } else {
        seen.add(key);
      }
    }
    
    return count;
  }, [dataset]);

  const handleRemoveDuplicates = () => {
    setIsCleaning(true);
    // Provide a small timeout for visual feedback
    setTimeout(() => {
      removeDuplicates();
      setIsCleaning(false);
    }, 600);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center space-x-3 bg-slate-50/50">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Deteksi Baris Duplikat</h3>
          <p className="text-xs text-slate-400">Pencocokan nilai eksak di semua kolom</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Row info stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Baris Saat Ini</span>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {metadata?.rowCount.toLocaleString() ?? '0'}
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Baris Terduplikasi</span>
            <div className={`text-2xl font-bold mt-1 ${duplicateCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {duplicateCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {duplicateCount > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Baris Duplikat Terdeteksi</p>
              <p className="text-amber-700/90 mt-1 leading-relaxed">
                Terdapat <strong>{duplicateCount} baris</strong> yang memiliki nilai data yang sama persis di seluruh kolom. Duplikasi data dapat menyebabkan bias pada analisis statistik Anda.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3 text-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Dataset Bersih dari Duplikat</p>
              <p className="text-green-700/90 mt-1 leading-relaxed">
                Luar biasa! Tidak ada baris yang terduplikasi secara identik di dalam dataset Anda saat ini.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleRemoveDuplicates}
            disabled={duplicateCount === 0 || isCleaning}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all ${
              duplicateCount > 0 && !isCleaning
                ? 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.01] cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            {isCleaning ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Membersihkan Data...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Hapus Baris Duplikat</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
