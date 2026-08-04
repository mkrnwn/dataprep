'use client';

import { useMemo, useState, useEffect } from 'react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import {
  ArrowRightLeft,
  Check,
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';
import FeatureExplainer from '@/components/ui/FeatureExplainer';

export default function TypeConversionPanel() {
  const { profiles, handleTypeConversion } = useDatasetStore();
  const [selectedColumn, setSelectedColumn] = useState('');
  const [targetType, setTargetType] = useState<'String' | 'Integer' | 'Float' | 'Boolean'>('String');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  // Find selected column profile
  const selectedProfile = useMemo(() => {
    return profiles.find((p) => p.name === selectedColumn);
  }, [profiles, selectedColumn]);

  // Suggest default targetType different from current type
  useEffect(() => {
    if (selectedProfile) {
      setSuccessMsg('');
      const current = selectedProfile.dataType;
      if (current === 'String') setTargetType('Integer');
      else if (current === 'Integer') setTargetType('Float');
      else if (current === 'Float') setTargetType('Integer');
      else if (current === 'Boolean') setTargetType('String');
    }
  }, [selectedProfile]);

  const handleApply = () => {
    if (!selectedColumn || !targetType) return;

    setIsProcessing(true);
    setSuccessMsg('');

    setTimeout(() => {
      handleTypeConversion(selectedColumn, targetType);
      
      setSuccessMsg(`Kolom "${selectedColumn}" berhasil dikonversi ke tipe data ${targetType.toUpperCase()}`);
      setIsProcessing(false);

      // Auto clear success message
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 600);
  };

  if (profiles.length === 0) {
    return null;
  }

  // Type badge styling helper
  const typeBadgeStyles = {
    Integer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Float: 'bg-teal-50 text-teal-700 border-teal-200',
    String: 'bg-blue-50 text-blue-700 border-blue-200',
    Boolean: 'bg-violet-50 text-violet-700 border-violet-200'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center space-x-3 bg-slate-50/50">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <ArrowRightLeft className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Konversi Tipe Data</h3>
          <p className="text-xs text-slate-400">Konversi tipe kolom (casting) secara masal secara aman</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Feature Explainer */}
        <FeatureExplainer
          title="Penyelarasan Tipe Data (Casting)"
          description="Menerapkan tipe data kolom yang tepat (misalnya teks String dikonversikan ke angka Integer/Float) wajib dilakukan agar kolom tersebut dapat dihitung secara matematis dalam analisis data."
        />
        {/* Column Select */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Pilih Kolom
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

        {/* Current State vs Target State Visualizer */}
        {selectedProfile && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tipe Saat Ini</span>
              <div className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${typeBadgeStyles[selectedProfile.dataType]}`}>
                {selectedProfile.dataType}
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-300 shrink-0 mx-4" />

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Pilih Tipe Baru</span>
              <select
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as any);
                  setSuccessMsg('');
                }}
                className="block px-2.5 py-1 text-xs font-semibold bg-white rounded border border-gray-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="String">String (Teks)</option>
                <option value="Integer">Integer (Bulat)</option>
                <option value="Float">Float (Desimal)</option>
                <option value="Boolean">Boolean</option>
              </select>
            </div>
          </div>
        )}

        {/* Conversion warnings or instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3 text-blue-800 text-xs">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold">Informasi Konversi</p>
            <p className="text-blue-700/90">
              Konversi yang tidak valid (misal mengubah teks alfabet menjadi Integer) akan secara aman diubah menjadi nilai kosong/<code>null</code> tanpa merusak baris data lainnya.
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
            disabled={!selectedColumn || !targetType || (selectedProfile?.dataType === targetType) || isProcessing}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all ${
              selectedColumn && targetType && (selectedProfile?.dataType !== targetType) && !isProcessing
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 hover:scale-[1.01] hover:shadow-lg cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Memproses Konversi...</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                <span>Konversi Tipe</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
