'use client';

import { useDatasetStore } from '@/stores/useDatasetStore';
import { History, Clock, ArrowDownToLine, Sparkles } from 'lucide-react';

export default function CleaningHistoryLog() {
  const { cleaningHistory } = useDatasetStore();

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const getOperationBadge = (type: string) => {
    switch (type) {
      case 'remove_duplicates':
        return {
          label: 'Hapus Duplikat',
          style: 'bg-indigo-50 text-indigo-700 border-indigo-150',
        };
      case 'drop_missing':
        return {
          label: 'Hapus Baris Kosong',
          style: 'bg-rose-50 text-rose-700 border-rose-150',
        };
      case 'impute_missing':
        return {
          label: 'Imputasi Nilai',
          style: 'bg-emerald-50 text-emerald-700 border-emerald-150',
        };
      default:
        return {
          label: 'Operasi Pembersihan',
          style: 'bg-slate-50 text-slate-700 border-slate-150',
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center space-x-3 bg-slate-50/50 shrink-0">
        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Riwayat Pembersihan</h3>
          <p className="text-xs text-slate-400">Jejak audit operasi data cleaning</p>
        </div>
      </div>

      {/* List */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {cleaningHistory.length > 0 ? (
          <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-6">
            {cleaningHistory.map((op) => {
              const badge = getOperationBadge(op.type);
              return (
                <div key={op.id} className="relative group">
                  {/* Circle indicator */}
                  <div className="absolute -left-[25px] top-1 bg-slate-400 group-hover:bg-blue-500 rounded-full w-2.5 h-2.5 border-2 border-white ring-4 ring-slate-50 group-hover:ring-blue-50 transition-all" />
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.style}`}>
                        {badge.label}
                      </span>
                      <div className="flex items-center space-x-1 text-[9px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(op.timestamp)}</span>
                        {formatDate(op.timestamp) && (
                          <span className="ml-0.5">({formatDate(op.timestamp)})</span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      {op.description}
                    </p>
                    
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-medium pt-0.5">
                      <ArrowDownToLine className="w-3 h-3 text-slate-400" />
                      <span>{op.affectedRows} baris terdampak</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 py-16 text-slate-400 my-auto">
            <Sparkles className="w-9 h-9 text-slate-300 mb-3 animate-pulse" />
            <p className="font-semibold text-slate-500 text-xs">Belum Ada Riwayat</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[150px] mx-auto leading-relaxed">
              Jejak operasi pembersihan akan dicatat secara otomatis di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
