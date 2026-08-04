'use client';

import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { useDatasetStore } from '@/stores/useDatasetStore';
import { motion } from 'framer-motion';

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const { setDataset, setLoading, setError, loading, error } = useDatasetStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleFiles(files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFiles(files[0]);
  };

  const handleFiles = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Format tidak didukung. Tolong unggah file .csv');
      return;
    }

    setLoading(true);
    setError(null);

    // MENGATASI BUG SILENT FAIL/FREEZE:
    // 1. Papa.parse sinkronus akan langsung memblokir main thread.
    // Akibatnya state `loading: true` tidak sempat dirender oleh React ke layar!
    // Kita berikan setTimeout() agar UI Loading bisa muncul lebih dulu.
    setTimeout(() => {
      console.log(`Memulai parsing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          console.log(`Parsing selesai! Total baris: ${results.data.length}`);
          
          if (results.errors.length > 0 && results.data.length === 0) {
             setError(`Gagal membaca CSV: ${results.errors[0].message}`);
             setLoading(false);
             return;
          }
          
          const metadata = {
            filename: file.name,
            size: file.size,
            rowCount: results.data.length,
            columnCount: results.meta.fields ? results.meta.fields.length : 0,
          };
          
          setDataset(results.data, metadata);
        },
        error: (err) => {
          console.error('Error saat parsing CSV:', err);
          setError(`Gagal membaca CSV: ${err.message}`);
          setLoading(false);
        }
      });
    }, 150); // Jeda 150ms sangat krusial agar React mengecat ulang (repaint) UI dengan spinner
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border-2 border-slate-200 shadow-sm w-full max-w-2xl animate-pulse">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500"/>
        <p className="font-semibold text-slate-700">Membaca Dataset...</p>
        <p className="text-sm mt-2 text-slate-500">Mengurai puluhan ribu baris data membutuhkan beberapa detik, mohon tunggu.</p>
      </div>
    );
  }

  return (
    <motion.div
      className={`w-full max-w-2xl p-12 border-2 border-dashed rounded-xl text-center cursor-pointer ${
        isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 bg-white'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: 1.01, backgroundColor: '#f8fafc' }}
      whileTap={{ scale: 0.99 }}
      animate={isDragging ? {
        scale: [1.015, 1.025, 1.015],
        boxShadow: [
          '0 0 10px rgba(59, 130, 246, 0.15)',
          '0 0 25px rgba(59, 130, 246, 0.35)',
          '0 0 10px rgba(59, 130, 246, 0.15)'
        ]
      } : { scale: 1, boxShadow: '0px 0px 0px rgba(0,0,0,0)' }}
      transition={isDragging ? {
        repeat: Infinity,
        duration: 1.2,
        ease: "easeInOut"
      } : { duration: 0.2 }}
    >
      <UploadCloud className={`w-14 h-14 mb-4 mx-auto ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
      <h3 className="text-xl font-semibold text-slate-700 mb-2">Unggah Dataset CSV Anda</h3>
      <p className="text-sm text-slate-500 mb-8">Tarik dan lepas file CSV di sini, atau klik tombol di bawah.</p>
      {error && <p className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-md font-medium border border-red-200">{error}</p>}
      
      <label className="cursor-pointer inline-block px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors shadow-sm">
        Pilih File CSV
        <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          onChange={handleFileInput} 
          onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
        />
      </label>
    </motion.div>
  );
}
