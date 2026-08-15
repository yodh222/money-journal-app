import React from 'react';
import { BookOpen, BarChart3, Settings as SettingsIcon, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] grid grid-cols-[240px_1fr] h-screen overflow-hidden">
      
      {/* KOLOM 1: SIDEBAR NAVIGASI */}
      <aside className="bg-[#18181B] border-r border-[#27272A] p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">MoneyJournal</span>
          </div>
          <nav className="space-y-2">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-400 hover:bg-[#27272A] hover:text-white text-sm font-medium transition-all">📌 Dashboard</Link>
            <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#27272A] text-white text-sm font-medium transition-all">📊 Analytics</Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-400 hover:bg-[#27272A] hover:text-white text-sm font-medium transition-all">⚙️ Settings</Link>
          </nav>
        </div>
      </aside>

      {/* KOLOM 2: AREA UTAMA ANALYTICS */}
      <main className="p-8 space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-sm text-zinc-400 mt-1">Insight mendalam dari arus kas Anda.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl hover:border-zinc-700 transition-colors h-[300px] flex flex-col items-center justify-center">
            <PieChart className="h-8 w-8 text-zinc-600 mb-4" />
            <p className="text-zinc-500 text-sm font-medium">[ Area Integrasi Pie Chart Distribusi Kategori ]</p>
          </div>
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl hover:border-zinc-700 transition-colors h-[300px] flex flex-col items-center justify-center">
            <BarChart3 className="h-8 w-8 text-zinc-600 mb-4" />
            <p className="text-zinc-500 text-sm font-medium">[ Area Integrasi Bar Chart Perbandingan Bulan ]</p>
          </div>
        </div>

        <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-6">
          <h3 className="font-semibold text-lg text-white">Top Kategori Pengeluaran</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-[#27272A] pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-[#27272A] rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Makanan & Minuman</p>
                    <p className="text-xs text-zinc-400">24 Transaksi</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-400">-Rp 1.450.000</p>
                  <p className="text-xs text-zinc-400">32% dari total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
