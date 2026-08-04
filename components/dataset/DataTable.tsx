'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useDatasetStore } from '@/stores/useDatasetStore';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function DataTable() {
  const { dataset, metadata } = useDatasetStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Batasi data preview di memori komponen
  const previewData = useMemo(() => {
    if (!dataset) return [];
    return dataset.slice(0, 500);
  }, [dataset]);

  const columns = useMemo(() => {
    if (!previewData || previewData.length === 0) return [];
    
    const firstRow = previewData[0];
    const keys = Object.keys(firstRow);
    
    return keys.map((key) => ({
      id: key, // WAJIB ada ID jika menggunakan accessorFn
      // PENTING: Gunakan accessorFn! 
      // Jika menggunakan accessorKey, Tanstack Table akan gagal (crash) 
      // jika header kolom CSV memiliki titik (misal: "Player.Name") 
      // karena dianggap sebagai nested object path.
      accessorFn: (row: any) => row[key], 
      header: key,
      cell: (info: any) => {
        const val = info.getValue();
        if (val === null || val === undefined || val === '') return <span className="text-slate-300 italic">null</span>;
        if (typeof val === 'boolean') return val ? 'True' : 'False';
        return String(val);
      }
    }));
  }, [previewData]);

  const table = useReactTable({
    data: previewData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  if (!mounted || !dataset || dataset.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-slate-700">Preview Data <span className="text-sm font-normal text-slate-500 ml-2">(Menampilkan maks. 500 baris pertama)</span></h3>
        <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border shadow-sm">
          {metadata?.columnCount} Kolom
        </span>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4 font-semibold whitespace-nowrap border-b border-r last:border-r-0">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-slate-50 transition-colors">
                {row.getVisibleCells().map((cell) => {
                  const val = cell.getValue();
                  const tooltip = val !== null && val !== undefined ? String(val) : '';
                  return (
                    <td key={cell.id} title={tooltip} className="px-6 py-3 border-r last:border-r-0 whitespace-nowrap text-slate-600 max-w-[200px] truncate">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50 shrink-0">
        <div className="flex items-center text-sm text-gray-500 font-medium">
          Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount().toLocaleString()}
          <span className="ml-4 pl-4 border-l">Preview: {previewData.length} baris</span>
          <span className="ml-4 pl-4 border-l font-semibold text-slate-800">Total Keseluruhan: {metadata?.rowCount.toLocaleString()} baris</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-40 transition-colors"><ChevronsLeft className="w-5 h-5" /></button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-40 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-40 transition-colors"><ChevronRight className="w-5 h-5" /></button>
          <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-40 transition-colors"><ChevronsRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
