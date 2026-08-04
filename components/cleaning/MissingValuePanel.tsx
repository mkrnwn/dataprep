'use client';

import { useMemo, useState, useEffect } from 'react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import {
  Wand2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  Database
} from 'lucide-react';
import FeatureExplainer from '@/components/ui/FeatureExplainer';

export default function MissingValuePanel() {
  const { profiles, handleMissingValues } = useDatasetStore();
  const [selectedColumnName, setSelectedColumnName] = useState<string>('');
  const [method, setMethod] = useState<'drop' | 'mean' | 'median' | 'mode' | 'custom'>('drop');
  const [customValue, setCustomValue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter profiles for columns with missing values
  const missingValueColumns = useMemo(() => {
    return profiles.filter((p) => p.missingCount > 0);
  }, [profiles]);

  // Find profile of selected column
  const selectedProfile = useMemo(() => {
    return profiles.find((p) => p.name === selectedColumnName);
  }, [profiles, selectedColumnName]);

  // Handle setting default column
  useEffect(() => {
    if (missingValueColumns.length > 0) {
      if (!selectedColumnName || !missingValueColumns.find((c) => c.name === selectedColumnName)) {
        setSelectedColumnName(missingValueColumns[0].name);
      }
    } else {
      setSelectedColumnName('');
    }
  }, [missingValueColumns, selectedColumnName]);

  // Adjust selected method if changing to non-numeric columns
  useEffect(() => {
    if (selectedProfile) {
      const isNumeric = selectedProfile.dataType === 'Integer' || selectedProfile.dataType === 'Float';
      if (!isNumeric && (method === 'mean' || method === 'median')) {
        setMethod('drop');
      }
    }
  }, [selectedProfile, method]);

  const handleApplyImputation = () => {
    if (!selectedColumnName) return;

    setIsProcessing(true);
    // Provide brief visual timeout for premium user experience
    setTimeout(() => {
      handleMissingValues(selectedColumnName, method, customValue);
      setIsProcessing(false);
      setCustomValue('');
    }, 600);
  };

  if (missingValueColumns.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
        <div className="p-4 bg-green-50 text-green-600 rounded-full">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">Tidak Ada Baris Kosong</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Selamat! Seluruh sel data pada setiap kolom Anda terisi penuh. Tidak diperlukan perbaikan nilai kosong saat ini.
          </p>
        </div>
      </div>
    );
  }

  const isNumericColumn = selectedProfile
    ? selectedProfile.dataType === 'Integer' || selectedProfile.dataType === 'Float'
    : false;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center space-x-3 bg-slate-50/50">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Wand2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Penanganan Nilai Kosong (Missing Values)</h3>
          <p className="text-xs text-slate-400">Pembersihan baris kosong dan imputasi nilai statistik</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Feature Explainer */}
        <FeatureExplainer
          title="Pembersihan Nilai Kosong (Imputasi)"
          description="Nilai kosong (null/NaN) dapat menggagalkan analisis statistik atau training model machine learning. Metode Hapus disarankan bila jumlah baris kosong minim, Mean/Median ideal untuk kolom numerik, dan Modus cocok untuk data teks/kategori."
        />
        {/* Column Select Dropdown */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Pilih Kolom Bermasalah
          </label>
          <div className="relative">
            <select
              value={selectedColumnName}
              onChange={(e) => setSelectedColumnName(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {missingValueColumns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.missingCount.toLocaleString()} kosong - {col.dataType})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedProfile && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Tipe Kolom</span>
              <p className="font-bold text-slate-700 mt-0.5">{selectedProfile.dataType}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Total Kosong</span>
              <p className="font-bold text-slate-700 mt-0.5">
                {selectedProfile.missingCount.toLocaleString()} baris
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 font-medium">Persentase Kosong</span>
              <p className="font-bold text-red-600 mt-0.5">{selectedProfile.missingPercentage}%</p>
            </div>
          </div>
        )}

        {/* Method Radio Group */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Pilih Metode Penanganan
          </label>

          <div className="space-y-2.5">
            {/* Option: Drop */}
            <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="impute-method"
                checked={method === 'drop'}
                onChange={() => setMethod('drop')}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-700">Drop Rows (Hapus Baris)</span>
                <p className="text-slate-500 mt-0.5">Hapus seluruh baris yang memiliki nilai kosong pada kolom ini.</p>
              </div>
            </label>

            {/* Option: Mean */}
            <label
              className={`flex items-start space-x-3 p-3 border border-gray-200 rounded-lg transition-colors ${
                !isNumericColumn
                  ? 'opacity-40 cursor-not-allowed bg-gray-50'
                  : 'cursor-pointer hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="impute-method"
                disabled={!isNumericColumn}
                checked={method === 'mean'}
                onChange={() => setMethod('mean')}
                className="mt-0.5 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-700">Impute Mean (Rata-rata)</span>
                <span className="text-[10px] ml-2 text-slate-400 italic">(Hanya Numerik)</span>
                <p className="text-slate-500 mt-0.5">
                  Isi sel kosong menggunakan nilai rata-rata dari data valid di kolom ini.
                </p>
              </div>
            </label>

            {/* Option: Median */}
            <label
              className={`flex items-start space-x-3 p-3 border border-gray-200 rounded-lg transition-colors ${
                !isNumericColumn
                  ? 'opacity-40 cursor-not-allowed bg-gray-50'
                  : 'cursor-pointer hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="impute-method"
                disabled={!isNumericColumn}
                checked={method === 'median'}
                onChange={() => setMethod('median')}
                className="mt-0.5 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-700">Impute Median (Nilai Tengah)</span>
                <span className="text-[10px] ml-2 text-slate-400 italic">(Hanya Numerik)</span>
                <p className="text-slate-500 mt-0.5">
                  Isi sel kosong menggunakan nilai tengah data yang telah diurutkan.
                </p>
              </div>
            </label>

            {/* Option: Mode */}
            <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="impute-method"
                checked={method === 'mode'}
                onChange={() => setMethod('mode')}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-700">Impute Mode (Modus / Sering Muncul)</span>
                <p className="text-slate-500 mt-0.5">
                  Isi sel kosong dengan nilai yang paling sering muncul di kolom ini (Teks & Angka).
                </p>
              </div>
            </label>

            {/* Option: Custom Value */}
            <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="impute-method"
                checked={method === 'custom'}
                onChange={() => setMethod('custom')}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs w-full">
                <span className="font-bold text-slate-700">Custom Value (Nilai Khusus)</span>
                <p className="text-slate-500 mt-0.5">
                  Masukkan nilai pengisi kustom secara manual di bawah ini.
                </p>

                {method === 'custom' && (
                  <div className="mt-3 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                    <input
                      type="text"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder="Masukkan nilai kustom..."
                      className="w-full max-w-md px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-800"
                    />
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>
                        Nilai akan otomatis dikonversi ke tipe kolom (<strong>{selectedProfile?.dataType}</strong>).
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleApplyImputation}
            disabled={!selectedColumnName || isProcessing}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all ${
              selectedColumnName && !isProcessing
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 hover:scale-[1.01] hover:shadow-lg cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Memproses Perbaikan...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Terapkan Perbaikan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
