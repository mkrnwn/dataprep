'use client';

import { useMemo, useState, useEffect } from 'react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import {
  Settings2,
  Trash2,
  Edit3,
  AlertTriangle,
  Check
} from 'lucide-react';

export default function ColumnOpsPanel() {
  const { profiles, handleColumnOperation } = useDatasetStore();
  const [selectedColumn, setSelectedColumn] = useState('');
  const [mode, setMode] = useState<'rename' | 'delete'>('rename');
  const [newName, setNewName] = useState('');
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

  const handleApply = () => {
    if (!selectedColumn) return;
    if (mode === 'rename' && !newName.trim()) return;

    setIsProcessing(true);
    setSuccessMsg('');

    setTimeout(() => {
      handleColumnOperation(mode, selectedColumn, newName);
      
      const prevCol = selectedColumn;
      const prevMode = mode;
      
      if (mode === 'rename') {
        setSuccessMsg(`Kolom "${prevCol}" berhasil diubah namanya menjadi "${newName.trim()}"`);
        setSelectedColumn(newName.trim());
      } else {
        setSuccessMsg(`Kolom "${prevCol}" berhasil dihapus dari dataset`);
      }

      setNewName('');
      setIsProcessing(false);

      // Auto clear success message
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 600);
  };

  if (profiles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center space-x-3 bg-slate-50/50">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Settings2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Operasi Kolom</h3>
          <p className="text-xs text-slate-400">Ubah nama atau hapus kolom dari struktur dataset</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Column selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Pilih Kolom Target
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => {
              setSelectedColumn(e.target.value);
              setSuccessMsg('');
            }}
            className="w-full pl-3 pr-10 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {profiles.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} ({p.dataType})
              </option>
            ))}
          </select>
        </div>

        {/* Action Toggle Tab */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Pilih Aksi
          </label>
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
            <button
              onClick={() => {
                setMode('rename');
                setSuccessMsg('');
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'rename'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ubah Nama (Rename)</span>
            </button>
            <button
              onClick={() => {
                setMode('delete');
                setSuccessMsg('');
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'delete'
                  ? 'bg-white text-red-600 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Kolom (Delete)</span>
            </button>
          </div>
        </div>

        {/* Conditional Mode Inputs */}
        {mode === 'rename' ? (
          <div className="space-y-2.5 animate-in slide-in-from-top-2 duration-200">
            <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Nama Kolom Baru
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Masukkan nama kolom baru..."
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
            />
            <p className="text-[10px] text-slate-400">
              Hindari spasi berlebih atau karakter khusus untuk menjaga kompabilitas query data.
            </p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 text-red-800 animate-in slide-in-from-top-2 duration-200">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">PERINGATAN: Tindakan Permanen</p>
              <p className="text-red-700/90 leading-relaxed">
                Menghapus kolom <strong>"{selectedColumn}"</strong> akan melenyapkan kolom tersebut beserta seluruh nilainya dari dataset. Aksi ini tidak dapat di-undo langsung kecuali file dataset diunggah kembali.
              </p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg p-3.5 flex items-center space-x-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-green-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Action Trigger Button */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={handleApply}
            disabled={!selectedColumn || (mode === 'rename' && !newName.trim()) || isProcessing}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all ${
              selectedColumn && (mode === 'delete' || newName.trim()) && !isProcessing
                ? mode === 'delete'
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.01] cursor-pointer'
                  : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.01] cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                {mode === 'delete' ? <Trash2 className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{mode === 'delete' ? 'Hapus Kolom' : 'Ubah Nama'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
