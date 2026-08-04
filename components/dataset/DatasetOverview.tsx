'use client';

import { useMemo, useState } from 'react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import { motion } from 'framer-motion';
import {
  Database,
  Columns,
  Rows,
  AlertCircle,
  CheckCircle2,
  Search,
  ArrowUpDown,
  Filter,
  BarChart3,
  Binary,
  Hash,
  Type,
  ToggleLeft
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15
    }
  }
};

export default function DatasetOverview() {
  const { metadata, profiles } = useDatasetStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'missing' | 'unique'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate global stats
  const globalStats = useMemo(() => {
    if (!metadata || !profiles || profiles.length === 0) {
      return { totalMissing: 0, missingPercentage: 0 };
    }
    const totalCells = metadata.rowCount * metadata.columnCount;
    const totalMissing = profiles.reduce((sum, p) => sum + p.missingCount, 0);
    const missingPercentage = totalCells > 0 ? (totalMissing / totalCells) * 100 : 0;
    
    return {
      totalMissing,
      missingPercentage: parseFloat(missingPercentage.toFixed(2))
    };
  }, [metadata, profiles]);

  // Filter and sort columns
  const filteredAndSortedProfiles = useMemo(() => {
    if (!profiles) return [];
    
    let result = profiles.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || p.dataType.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'missing') {
        comparison = a.missingCount - b.missingCount;
      } else if (sortBy === 'unique') {
        comparison = a.uniqueCount - b.uniqueCount;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [profiles, searchTerm, typeFilter, sortBy, sortOrder]);

  const toggleSort = (field: 'name' | 'missing' | 'unique') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (!metadata || !profiles || profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-4 animate-pulse" />
        <p className="font-semibold text-slate-700">Profil Data Belum Tersedia</p>
        <p className="text-sm mt-2 text-slate-500">Silakan unggah dataset CSV untuk melihat statistik data.</p>
      </div>
    );
  }

  // Map data types to badges styles
  const typeBadgeStyles = {
    Integer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Float: 'bg-teal-50 text-teal-700 border-teal-200',
    String: 'bg-blue-50 text-blue-700 border-blue-200',
    Boolean: 'bg-violet-50 text-violet-700 border-violet-200'
  };

  // Map data types to icons
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Integer':
        return <Hash className="w-3.5 h-3.5" />;
      case 'Float':
        return <Binary className="w-3.5 h-3.5" />;
      case 'Boolean':
        return <ToggleLeft className="w-3.5 h-3.5" />;
      default:
        return <Type className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 overflow-y-auto pr-1">
      {/* Overview Title / Summary Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Dataset Overview & Profiling</h2>
        <p className="text-sm text-slate-500 mt-1">
          Analisis otomatis tipe data, distribusi nilai kosong, dan statistik deskriptif untuk setiap kolom.
        </p>
      </div>

      {/* Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Rows Card */}
        <motion.div variants={cardVariants} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Rows className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Baris</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{metadata.rowCount.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Catatan data masuk</p>
          </div>
        </motion.div>

        {/* Columns Card */}
        <motion.div variants={cardVariants} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Columns className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kolom</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{metadata.columnCount.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Atribut atau fitur dataset</p>
          </div>
        </motion.div>

        {/* Missing Values Card */}
        <motion.div variants={cardVariants} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className={`p-3 rounded-lg ${globalStats.totalMissing > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Nilai Kosong</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{globalStats.totalMissing.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {globalStats.totalMissing > 0 
                ? `${globalStats.missingPercentage}% dari seluruh sel kosong`
                : 'Dataset bersih, tidak ada sel kosong'
              }
            </p>
          </div>
        </motion.div>

        {/* File Size Card */}
        <motion.div variants={cardVariants} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ukuran File</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{formatBytes(metadata.size)}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Format file: CSV</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Control Bar (Filters / Sorting) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kolom berdasarkan nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-medium text-slate-600 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Tipe Data</option>
              <option value="string">String (Teks)</option>
              <option value="integer">Integer (Bulat)</option>
              <option value="float">Float (Desimal)</option>
              <option value="boolean">Boolean</option>
            </select>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-lg border border-gray-200 text-xs">
            <button
              onClick={() => toggleSort('name')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${sortBy === 'name' ? 'bg-white text-slate-800 shadow-sm border border-gray-150' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Nama {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('missing')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${sortBy === 'missing' ? 'bg-white text-slate-800 shadow-sm border border-gray-150' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Missing {sortBy === 'missing' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('unique')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${sortBy === 'unique' ? 'bg-white text-slate-800 shadow-sm border border-gray-150' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Unik {sortBy === 'unique' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Column Profiles */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredAndSortedProfiles.map((p) => {
          const isNumeric = p.dataType === 'Integer' || p.dataType === 'Float';
          const hasMissing = p.missingCount > 0;
          
          return (
            <motion.div
              key={p.name}
              variants={cardVariants}
              className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
            >
              {/* Header Kolom */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50 group-hover:bg-slate-50/80 transition-colors">
                <span className="font-semibold text-slate-700 truncate max-w-[70%]" title={p.name}>
                  {p.name}
                </span>
                
                {/* Type Badge */}
                <div className={`px-2 py-0.5 text-xs font-semibold rounded-full border flex items-center space-x-1 ${typeBadgeStyles[p.dataType] || 'bg-slate-50 text-slate-600'}`}>
                  {getTypeIcon(p.dataType)}
                  <span>{p.dataType}</span>
                </div>
              </div>

              {/* Data Content */}
              <div className="p-4 flex-1 flex flex-col space-y-4">
                {/* Row 1: Missing values & unique values info */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Missing Value details */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nilai Kosong</span>
                    <div className="flex items-baseline space-x-1">
                      <span className={`text-base font-bold ${hasMissing ? 'text-amber-600' : 'text-slate-700'}`}>
                        {p.missingCount.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">({p.missingPercentage}%)</span>
                    </div>
                  </div>

                  {/* Unique values details */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nilai Unik</span>
                    <span className="text-base font-bold text-slate-700 block">
                      {p.uniqueCount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress bar of Missing/Filled */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span className="flex items-center space-x-1 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Distribusi Data
                    </span>
                    <span>{(100 - p.missingPercentage).toFixed(2)}% Terisi</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${100 - p.missingPercentage}%` }}
                      className="bg-blue-500 h-full rounded-l-full"
                    />
                    {hasMissing && (
                      <div
                        style={{ width: `${p.missingPercentage}%` }}
                        className="bg-amber-400 h-full rounded-r-full"
                      />
                    )}
                  </div>
                </div>

                {/* Row 2: Numerical stats (if numeric type) */}
                {isNumeric ? (
                  <div className="space-y-2 mt-auto border-t border-slate-100 pt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Ringkasan Statistik</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white rounded p-1 border border-slate-100 shadow-sm col-span-1">
                        <span className="text-[9px] uppercase font-medium text-slate-400 block">Min</span>
                        <span className="text-xs font-bold text-slate-700 block truncate" title={String(p.min)}>
                          {p.min !== undefined ? p.min.toLocaleString() : '-'}
                        </span>
                      </div>
                      <div className="bg-white rounded p-1 border border-slate-100 shadow-sm col-span-1">
                        <span className="text-[9px] uppercase font-medium text-slate-400 block">Max</span>
                        <span className="text-xs font-bold text-slate-700 block truncate" title={String(p.max)}>
                          {p.max !== undefined ? p.max.toLocaleString() : '-'}
                        </span>
                      </div>
                      <div className="bg-white rounded p-1 border border-slate-100 shadow-sm col-span-1">
                        <span className="text-[9px] uppercase font-medium text-slate-400 block">Mean</span>
                        <span className="text-xs font-bold text-slate-700 block truncate" title={String(p.mean)}>
                          {p.mean !== undefined ? p.mean.toLocaleString() : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50/40 p-3 rounded-lg border border-slate-100/50 flex items-center justify-center space-x-2 text-slate-400 text-xs mt-auto py-5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Statistik numerik tidak tersedia untuk tipe {p.dataType}.</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {filteredAndSortedProfiles.length === 0 && (
          <div className="col-span-full bg-white border rounded-xl p-12 text-center text-slate-500 shadow-sm">
            Tidak ada kolom yang cocok dengan pencarian atau filter Anda.
          </div>
        )}
      </motion.div>
    </div>
  );
}
