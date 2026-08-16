'use client';
import React, { useMemo } from 'react';
import { BookOpen, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import CategoryPieChart from '@/components/dashboard/CategoryPieChart';
import MonthlyBarChart from '@/components/dashboard/MonthlyBarChart';

export default function AnalyticsPage() {
  const { transactions, loading } = useSupabaseData();

  const { pieData, barData, topCategories } = useMemo(() => {
    if (!transactions) return { pieData: [], barData: [], topCategories: [] };
    
    // Process Bar Data (Last 6 months)
    const monthMap: Record<string, any> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStr = d.toLocaleString('id-ID', { month: 'short' });
      monthMap[`${d.getFullYear()}-${d.getMonth()}`] = { name: mStr, income: 0, expense: 0, sortKey: d.getTime() };
    }

    // Process Pie Data & Top Categories
    const catMap: Record<string, { name: string; value: number; count: number; type: string }> = {};

    transactions.forEach((tx: any) => {
      const d = new Date(tx.transaction_date);
      const mKey = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthMap[mKey]) {
        if (tx.categories?.type === 'INCOME') monthMap[mKey].income += Number(tx.amount);
        else if (tx.categories?.type === 'EXPENSE') monthMap[mKey].expense += Number(tx.amount);
      }

      // For category distribution, let's just use EXPENSE
      if (tx.categories?.type === 'EXPENSE') {
        const cName = tx.categories?.name || 'Uncategorized';
        if (!catMap[cName]) catMap[cName] = { name: cName, value: 0, count: 0, type: 'EXPENSE' };
        catMap[cName].value += Number(tx.amount);
        catMap[cName].count += 1;
      }
    });

    const bData = Object.values(monthMap).sort((a, b) => a.sortKey - b.sortKey);
    const pData = Object.values(catMap).sort((a, b) => b.value - a.value);
    
    return { pieData: pData, barData: bData, topCategories: pData.slice(0, 5) };
  }, [transactions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

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
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl h-[340px] relative hover:border-zinc-700 transition-colors">
            <h3 className="text-sm font-semibold tracking-wide text-zinc-300 mb-4 absolute z-10">Distribusi Pengeluaran</h3>
            <div className="pt-6 h-full w-full">
              <CategoryPieChart data={pieData} />
            </div>
          </div>
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl h-[340px] relative hover:border-zinc-700 transition-colors">
            <h3 className="text-sm font-semibold tracking-wide text-zinc-300 mb-4 absolute z-10">Arus Kas (6 Bulan Terakhir)</h3>
            <div className="pt-6 h-full w-full">
              <MonthlyBarChart data={barData} />
            </div>
          </div>
        </div>

        <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-6">
          <h3 className="font-semibold text-lg text-white">Top Kategori Pengeluaran</h3>
          <div className="space-y-4">
            {topCategories.length > 0 ? topCategories.map((cat, i) => (
              <div key={i} className="flex items-center justify-between border-b border-[#27272A] pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-[#27272A] rounded-lg flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{cat.name}</p>
                    <p className="text-xs text-zinc-400">{cat.count} Transaksi</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-400">-Rp {cat.value.toLocaleString('id-ID')}</p>
                </div>
              </div>
            )) : (
              <div className="text-sm text-zinc-500">Belum ada data pengeluaran.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
