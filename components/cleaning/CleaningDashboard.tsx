'use client';

import { useState } from 'react';
import DuplicatePanel from './DuplicatePanel';
import MissingValuePanel from './MissingValuePanel';
import ColumnOpsPanel from './ColumnOpsPanel';
import TypeConversionPanel from './TypeConversionPanel';
import OutlierPanel from './OutlierPanel';
import CleaningHistoryLog from './CleaningHistoryLog';
import { Layers, Wand2, Settings2, ArrowRightLeft, SlidersHorizontal } from 'lucide-react';

export default function CleaningDashboard() {
  const [activeTool, setActiveTool] = useState<'duplicates' | 'missing' | 'columnOps' | 'typeConvert' | 'outliers'>('duplicates');

  return (
    <div className="w-full h-full flex flex-col space-y-6 overflow-hidden">
      {/* Title Header */}
      <div className="shrink-0">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Data Cleaning Studio</h2>
        <p className="text-sm text-slate-500 mt-1">
          Deteksi duplikasi data, imputasi nilai kosong, manipulasi kolom, konversi tipe data, dan bersihkan outlier.
        </p>
      </div>

      {/* Main Grid: Tools Panel (Left) & Audit Trail Sidebar (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden min-h-0">
        {/* Left Section: Active Tool panel */}
        <div className="lg:col-span-2 flex flex-col space-y-4 overflow-y-auto pr-1 min-h-0">
          {/* Internal sub-tab selector (Pills) */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start shrink-0">
            <button
              onClick={() => setActiveTool('duplicates')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTool === 'duplicates'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Deteksi Duplikat</span>
            </button>
            
            <button
              onClick={() => setActiveTool('missing')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTool === 'missing'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Missing Values</span>
            </button>

            <button
              onClick={() => setActiveTool('columnOps')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTool === 'columnOps'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Operasi Kolom</span>
            </button>

            <button
              onClick={() => setActiveTool('typeConvert')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTool === 'typeConvert'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Konversi Tipe</span>
            </button>

            <button
              onClick={() => setActiveTool('outliers')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTool === 'outliers'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Deteksi Outlier</span>
            </button>
          </div>

          {/* Active Tool Area */}
          <div className="flex-1 min-h-0">
            {activeTool === 'duplicates' && <DuplicatePanel />}
            {activeTool === 'missing' && <MissingValuePanel />}
            {activeTool === 'columnOps' && <ColumnOpsPanel />}
            {activeTool === 'typeConvert' && <TypeConversionPanel />}
            {activeTool === 'outliers' && <OutlierPanel />}
          </div>
        </div>

        {/* Right Section: Centralized History Log */}
        <div className="lg:col-span-1 h-full overflow-hidden min-h-0">
          <CleaningHistoryLog />
        </div>
      </div>
    </div>
  );
}
