'use client';

import { useState } from 'react';
import StatisticsPanel from './StatisticsPanel';
import ChartPanel from './ChartPanel';
import { Calculator, BarChart3 } from 'lucide-react';

export default function AnalysisDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'charts'>('stats');

  return (
    <div className="w-full h-full flex flex-col space-y-6 overflow-hidden">
      {/* Title Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Analytics Studio</h2>
          <p className="text-sm text-slate-500 mt-1">
            Analisis statistik deskriptif dan visualisasikan korelasi data Anda secara langsung.
          </p>
        </div>

        {/* Tab Selector pills */}
        <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Statistik Deskriptif</span>
          </button>
          
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'charts'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Visualisasi Grafik</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'stats' ? (
          <div className="max-w-4xl">
            <StatisticsPanel />
          </div>
        ) : (
          <div className="h-full min-h-[400px]">
            <ChartPanel />
          </div>
        )}
      </div>
    </div>
  );
}
