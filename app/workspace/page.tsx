'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import FileUploader from '@/components/upload/FileUploader';
import DataTable from '@/components/dataset/DataTable';
import DatasetOverview from '@/components/dataset/DatasetOverview';
import CleaningDashboard from '@/components/cleaning/CleaningDashboard';
import TransformDashboard from '@/components/transform/TransformDashboard';
import AnalysisDashboard from '@/components/analysis/AnalysisDashboard';
import { useDatasetStore } from '@/stores/useDatasetStore';
import { exportToCSV } from '@/lib/csv/exporter';
import {
  LayoutDashboard,
  Table,
  Wand2,
  Shuffle,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkspacePage() {
  const { dataset, metadata, clearDataset } = useDatasetStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'cleaning' | 'transform' | 'analysis'>('overview');

  const handleClearDataset = () => {
    clearDataset();
    setActiveTab('overview');
  };

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="hover:opacity-90 transition-opacity block">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            disabled={!metadata}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } ${!metadata ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Overview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('data')}
            disabled={!metadata}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'data'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } ${!metadata ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Table className="w-4 h-4 shrink-0" />
            <span>Data Preview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('cleaning')}
            disabled={!metadata}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'cleaning'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } ${!metadata ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Wand2 className="w-4 h-4 shrink-0" />
            <span>Data Cleaning</span>
          </button>
          
          <button
            onClick={() => setActiveTab('transform')}
            disabled={!metadata}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'transform'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } ${!metadata ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Shuffle className="w-4 h-4 shrink-0" />
            <span>Transform</span>
          </button>
          
          <button
            onClick={() => setActiveTab('analysis')}
            disabled={!metadata}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'analysis'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } ${!metadata ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Analytics</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
           <div className="text-sm text-slate-500 truncate mr-4">
             Dataset: <span className="font-semibold text-slate-800">{metadata ? metadata.filename : 'Belum ada file'}</span>
           </div>
           <div className="flex space-x-3 shrink-0">
             {metadata && (
               <button onClick={handleClearDataset} className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100 transition-colors cursor-pointer">
                 Tutup File
               </button>
             )}
              <button
                disabled={!metadata || dataset.length === 0}
                onClick={() => metadata && exportToCSV(dataset, metadata.filename)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  metadata && dataset.length > 0
                    ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-250'
                }`}
              >
                Export CSV
              </button>
           </div>
        </header>

        <div className={`p-6 flex-1 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 flex flex-col ${!metadata ? 'items-center justify-center' : ''}`}>
          {!metadata ? (
             <FileUploader />
          ) : (
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.15 }}
                 className="flex-1 flex flex-col min-h-0 overflow-hidden"
               >
                 {activeTab === 'overview' && <DatasetOverview />}
                 {activeTab === 'data' && <DataTable />}
                 {activeTab === 'cleaning' && <CleaningDashboard />}
                 {activeTab === 'transform' && <TransformDashboard />}
                 {activeTab === 'analysis' && <AnalysisDashboard />}
               </motion.div>
             </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
