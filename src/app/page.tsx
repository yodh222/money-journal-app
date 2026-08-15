'use client';

import React, { useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, BookOpen, Loader2 } from 'lucide-react';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import DragDropArea from '@/components/dashboard/DragDropArea';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const { session, loading, totalBalance, incomeThisMonth, expenseThisMonth } = useSupabaseData();

  useEffect(() => {
    // Basic auth protection on client side
    if (!loading && !session) {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (!hash.includes('access_token')) {
        router.push('/login');
      }
    }
  }, [session, loading, router]);

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] grid grid-cols-[240px_1fr_360px] h-screen overflow-hidden">
      
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
            <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#27272A] text-white text-sm font-medium transition-all">📌 Dashboard</a>
            <a href="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-400 hover:bg-[#27272A] hover:text-white text-sm font-medium transition-all">📊 Analytics</a>
            <a href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-400 hover:bg-[#27272A] hover:text-white text-sm font-medium transition-all">⚙️ Settings</a>
          </nav>
        </div>
        
        <div className="space-y-4">
          <DragDropArea />
          
          <div className="text-xs text-zinc-500 border-t border-[#27272A] pt-4 flex items-center justify-between">
            <span>Quick Input</span>
            <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 font-mono text-[10px] text-zinc-300">N</kbd>
          </div>
        </div>
      </aside>

      {/* KOLOM 2: AREA UTAMA (DATA & GRAFIK) */}
      <main className="p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Halo, {session.user?.user_metadata?.full_name?.split(' ')[0] || 'Pengguna'}!</h1>
            <p className="text-sm text-zinc-400 mt-1">Berikut rangkuman arus keuangan Anda bulan ini.</p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
            <Plus className="h-4 w-4" /> Tambah Manual
          </button>
        </div>

        {/* BARIS KARTU SALDO & RINGKASAN */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-3 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-center text-zinc-400 text-xs font-medium">
              Total Saldo Bersih 
              <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{formatIDR(totalBalance || 14250000)}</p>
          </div>
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-3 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-center text-zinc-400 text-xs font-medium">
              Pemasukan Bulan Ini 
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-emerald-400">{formatIDR(incomeThisMonth || 8000000)}</p>
          </div>
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-3 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-center text-zinc-400 text-xs font-medium">
              Pengeluaran Bulan Ini 
              <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-red-400">{formatIDR(expenseThisMonth || 3420000)}</p>
          </div>
        </div>

        {/* MOCKUP AREA GRAFIK UTAMA */}
        <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl h-[340px] hover:border-zinc-700 transition-colors relative">
          <h3 className="text-sm font-semibold tracking-wide text-zinc-300 mb-4 absolute z-10">Arus Kas Bulanan</h3>
          <div className="pt-6 h-full w-full">
            <CashFlowChart />
          </div>
        </div>
      </main>

      {/* KOLOM 3: SIDEBAR PANEL KANAN (JURNAL & ANGGARAN) */}
      <aside className="bg-[#18181B]/50 border-l border-[#27272A] p-6 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-5">🎯 Batas Anggaran</h3>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-zinc-200 flex items-center gap-2">🍔 Jajan & Makanan</span>
                <span className="text-zinc-400">65%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-zinc-200 flex items-center gap-2">🚗 Transportasi</span>
                <span className="text-zinc-400">20%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-zinc-200 flex items-center gap-2">🛒 Belanja Bulanan</span>
                <span className="text-zinc-400">85%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#27272A] pt-6">
          <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-4">📝 Catatan Jurnal Hari Ini</h3>
          <div className="relative group">
            <textarea 
              className="w-full h-32 bg-[#27272A]/50 border border-[#27272A] rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-[#18181B] text-zinc-200 placeholder-zinc-500 resize-none transition-all"
              placeholder="Ada cerita apa di balik pengeluaran atau pemasukanmu hari ini? Tulis refleksi pendekmu di sini..."
            />
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors">
                Simpan
              </button>
            </div>
          </div>
        </div>
      </aside>

    </div>
  );
}
