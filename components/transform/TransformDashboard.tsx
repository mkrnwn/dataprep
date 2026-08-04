'use client';

import { useState } from 'react';
import NormalizationPanel from './NormalizationPanel';
import EncodingPanel from './EncodingPanel';
import CleaningHistoryLog from '../cleaning/CleaningHistoryLog';
import { Maximize2, Tag } from 'lucide-react';

export default function TransformDashboard() {
  const [activeTool, setActiveTool] = useState<'normalize' | 'encode'>('normalize');

  return (
    <div className="w-full h-full flex flex-col space-y-6 overflow-hidden">
      {/* Title Header */}
      <div className="shrink-0">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Feature Transformation Studio</h2>
        <p className="text-sm text-slate-500 mt-1">
          Skalakan fitur numerik dan representasikan teks kategorikal sebagai angka untuk kebutuhan pemodelan.
        </p>
      </div>

      {/* Main Grid: Tools Panel (Left) & Audit Trail Sidebar (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden min-h-0">
        {/* Left Section: Active Tool panel */}
        <div className="lg:col-span-2 flex flex-col space-y-4 overflow-y-auto pr-1 min-h-0">
          {/* Internal sub-tab selector (Pills) */}
          <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start shrink-0">
            <button
              onClick={() => setActiveTool('normalize')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTool === 'normalize'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Normalisasi (Scaling)</span>
            </button>
            
            <button
              onClick={() => setActiveTool('encode')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTool === 'encode'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Encoding Kategorikal</span>
            </button>
          </div>

          {/* Active Tool Area */}
          <div className="flex-1 min-h-0">
            {activeTool === 'normalize' ? <NormalizationPanel /> : <EncodingPanel />}
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
