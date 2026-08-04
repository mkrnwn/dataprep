'use client';

import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import {
  BarChart3,
  Wand2,
  Settings2,
  Maximize2,
  LineChart,
  Shield,
  ArrowRight,
  Database,
  CheckCircle,
  Code
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <Link href="/workspace" className="hover:text-slate-900 transition-colors">
              Workspace
            </Link>
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Fitur
            </a>
            <a href="#about" className="hover:text-slate-900 transition-colors">
              Tentang
            </a>
          </nav>

          {/* CTA Right */}
          <div>
            <Link
              href="/workspace"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 bg-white">
        {/* Radial Background Decorative Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-full text-xs font-medium text-slate-600 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Pemrosesan Lokal di Browser Anda</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Persiapan Dataset <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Cepat, Aman,</span> & Tanpa Kode
          </h1>

          {/* Sub-headline */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-500 leading-relaxed">
            Unggah file CSV Anda dan lakukan pembersihan data, pengisian sel kosong, penskalaan fitur, serta visualisasi grafik instan. Semua proses berjalan langsung di komputer Anda tanpa upload ke server luar.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/workspace"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 hover:scale-[1.01] transition-all shadow-md group"
            >
              <span>Buka Workspace</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-slate-600 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              Pelajari Fitur
            </a>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-10 text-xs text-slate-400 font-medium">
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Privasi Terjamin</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Tanpa Batasan Kuota</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Satu Klik Ekspor CSV</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-slate-50 border-t border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* Section title */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Alur Kerja Persiapan Data Lengkap
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              Segala alat yang Anda butuhkan untuk memproses data mentah hingga siap dianalisis atau dimasukkan ke model machine learning.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Profiling */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Dataset Profiling</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Analisis otomatis tipe data, distribusi nilai kosong, keunikan nilai, dan statistik deskriptif untuk seluruh kolom secara instan saat data dimuat.
              </p>
            </div>

            {/* Feature 2: Cleaning */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Data Cleaning Studio</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Hapus duplikasi baris, bersihkan pencilan (outliers) dengan metode IQR, dan imputasi nilai kosong menggunakan rata-rata, median, modus, atau nilai kustom.
              </p>
            </div>

            {/* Feature 3: Columns */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                <Settings2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Manipulasi Kolom</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Ubah nama kolom target atau hapus kolom tidak relevan dari skema dataset dengan mudah dalam sekali klik tanpa memengaruhi integritas sisa baris.
              </p>
            </div>

            {/* Feature 4: Transformation */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl w-fit">
                <Maximize2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Normalisasi & Encoding</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Skalakan fitur numerik menggunakan metode Min-Max (skala 0-1) dan Z-score (standardisasi), atau ubah data teks kategorikal menjadi Label Encoding.
              </p>
            </div>

            {/* Feature 5: Charts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl w-fit">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Visualisasi Interaktif</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Gambarkan distribusi data kategorikal Anda dalam bentuk Bar Chart atau plot korelasi dua kolom numerik menggunakan Scatter Plot berkinerja tinggi.
              </p>
            </div>

            {/* Feature 6: Privacy */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl w-fit">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Keamanan Lokal</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Kami peduli dengan data rahasia Anda. Karena semua kode pemrosesan dieksekusi di thread browser lokal Anda, data tidak pernah di-upload ke server mana pun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-white border-t border-slate-200 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium gap-y-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">DataPrep Studio</span>
            <span>•</span>
            <span>Versi MVP</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} DataPrep. Hak Cipta Dilindungi Undang-Undang.
          </div>
        </div>
      </footer>
    </div>
  );
}
