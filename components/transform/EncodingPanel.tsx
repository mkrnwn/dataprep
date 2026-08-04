'use client';

import { useMemo, useState, useEffect } from 'react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import {
  Binary,
  Check,
  Info,
  Tag,
  ListOrdered
} from 'lucide-react';
import FeatureExplainer from '@/components/ui/FeatureExplainer';

export default function EncodingPanel() {
  const { dataset, profiles, handleTransform } = useDatasetStore();
  const [selectedColumn, setSelectedColumn] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Filter categorical/string columns
  const categoricalColumns = useMemo(() => {
    return profiles.filter((p) => p.dataType === 'String');
  }, [profiles]);

  // Set default column
  useEffect(() => {
    if (categoricalColumns.length > 0) {
      if (!selectedColumn || !categoricalColumns.find((c) => c.name === selectedColumn)) {
        setSelectedColumn(categoricalColumns[0].name);
      }
    } else {
      setSelectedColumn('');
    }
  }, [categoricalColumns, selectedColumn]);

  const selectedProfile = useMemo(() => {
    return profiles.find((p) => p.name === selectedColumn);
  }, [profiles, selectedColumn]);

  // Compute unique values preview
  const encodingPreview = useMemo(() => {
    if (!selectedColumn || !dataset || dataset.length === 0) return [];
    
    const unique = new Set<string>();
    for (let i = 0; i < dataset.length; i++) {
      const val = dataset[i][selectedColumn];
      if (val !== null && val !== undefined && String(val).trim() !== '') {
        unique.add(String(val).trim());
      }
    }

    return Array.from(unique).sort().slice(0, 10);
  }, [dataset, selectedColumn]);

  const handleApply = () => {
    if (!selectedColumn) return;

    setIsProcessing(true);
    setSuccessMsg('');

    setTimeout(() => {
      handleTransform('label-encode', selectedColumn);
      
      setSuccessMsg(`Kolom "${selectedColumn}" berhasil dikodekan menjadi Label-Encoded Integers`);
      setIsProcessing(false);

      // Auto clear success message
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 600);
  };

  if (categoricalColumns.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
        <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
          <Info className="w-12 h-12" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">Tidak Ada Kolom Kategorikal</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Label Encoding memerlukan kolom kategorikal (tipe data String). Seluruh kolom Anda saat ini bertipe numerik atau boolean.
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
          <Tag className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Label Encoding</h3>
          <p className="text-xs text-slate-400">Petakan teks kategori unik menjadi deretan kode angka bulat (0, 1, 2...)</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Feature Explainer */}
        <FeatureExplainer
          title="Label Encoding (Konversi Kategori)"
          description="Mengubah data teks kategorikal menjadi kode angka (0, 1, 2...) agar dapat dimengerti oleh model machine learning atau digunakan dalam perhitungan korelasi statistik numerik."
        />
        {/* Column Select */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Pilih Kolom Kategorikal (Teks)
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => {
              setSelectedColumn(e.target.value);
              setSuccessMsg('');
            }}
            className="w-full pl-3 pr-10 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {categoricalColumns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.dataType} - {col.uniqueCount} unik)
              </option>
            ))}
          </select>
        </div>

        {/* Live Mapping Preview */}
        {selectedColumn && encodingPreview.length > 0 && (
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-slate-400" />
              <span>Simulasi Pemetaan Kode (Label Mapping Preview)</span>
            </label>
            
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 text-[10px] font-bold text-slate-400 border-b border-slate-200 pb-1.5 uppercase">
                <span>Nilai Teks Asli</span>
                <span className="text-right">Kode Hasil Mapping</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {encodingPreview.map((val, idx) => (
                  <div key={val} className="grid grid-cols-2 text-xs text-slate-600 font-medium">
                    <span className="truncate pr-4" title={val}>{val}</span>
                    <span className="text-right font-bold text-slate-800">
                      <code className="bg-slate-200/60 px-2 py-0.5 rounded text-[11px]">{idx}</code>
                    </span>
                  </div>
                ))}
                {selectedProfile && selectedProfile.uniqueCount > 10 && (
                  <p className="text-[10px] text-slate-400 italic pt-1 text-center border-t border-dashed border-slate-200">
                    Menampilkan 10 dari total {selectedProfile.uniqueCount} nilai unik...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instruction Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3 text-blue-800 text-xs">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold">Kegunaan Label Encoding</p>
            <p className="text-blue-700/90">
              Mengubah representasi data teks kategorikal menjadi numerik agar kolom ini dapat dihitung dalam analisis korelasi numerik atau diumpankan ke model matematika.
            </p>
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
                <span>Memproses Encoding...</span>
              </>
            ) : (
              <>
                <Binary className="w-4 h-4" />
                <span>Encode Kolom</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
