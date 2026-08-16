'use client';
import React, { useMemo } from 'react';
import { BookOpen, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import CategoryPieChart from '@/components/dashboard/CategoryPieChart';
import MonthlyBarChart from '@/components/dashboard/MonthlyBarChart';
import AppSidebar from '@/components/layout/AppSidebar';

export default function AnalyticsPage() {
  const { transactions, loading } = useSupabaseData();

  const { pieData, barData, topCategories, topWallets } = useMemo(() => {
    if (!transactions) return { pieData: [], barData: [], topCategories: [], topWallets: [] };
    
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

    // Process Wallet Data
    const walletAnalyticsMap: Record<string, { id: string; name: string; txCount: number; totalExpense: number; categories: Record<string, number> }> = {};

    transactions.forEach((tx: any) => {
      const d = new Date(tx.transaction_date);
      const mKey = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthMap[mKey]) {
        if (tx.categories?.type === 'INCOME') monthMap[mKey].income += Number(tx.amount);
        else if (tx.categories?.type === 'EXPENSE') monthMap[mKey].expense += Number(tx.amount);
      }

      if (tx.categories?.type === 'EXPENSE') {
        const cName = tx.categories?.name || 'Uncategorized';
        if (!catMap[cName]) catMap[cName] = { name: cName, value: 0, count: 0, type: 'EXPENSE' };
        catMap[cName].value += Number(tx.amount);
        catMap[cName].count += 1;
      }

      // Wallet processing
      if (tx.wallet_id && tx.wallets) {
        const wId = tx.wallet_id;
        if (!walletAnalyticsMap[wId]) {
          walletAnalyticsMap[wId] = { id: wId, name: tx.wallets.name, txCount: 0, totalExpense: 0, categories: {} };
        }
        walletAnalyticsMap[wId].txCount += 1;
        
        if (tx.categories?.type === 'EXPENSE') {
          walletAnalyticsMap[wId].totalExpense += Number(tx.amount);
          const cName = tx.categories?.name || 'Uncategorized';
          walletAnalyticsMap[wId].categories[cName] = (walletAnalyticsMap[wId].categories[cName] || 0) + 1;
        }
      }
    });

    const bData = Object.values(monthMap).sort((a, b) => a.sortKey - b.sortKey);
    const pData = Object.values(catMap).sort((a, b) => b.value - a.value);
    
    // Sort wallets by transaction count descending
    const wData = Object.values(walletAnalyticsMap).sort((a, b) => b.txCount - a.txCount).map(w => {
      // Find top category for this wallet
      let topCat = '-';
      let maxCatCount = 0;
      for (const [cName, cCount] of Object.entries(w.categories)) {
        if (cCount > maxCatCount) {
          maxCatCount = cCount;
          topCat = cName;
        }
      }
      return { ...w, topCategory: topCat };
    });

    return { pieData: pData, barData: bData, topCategories: pData.slice(0, 5), topWallets: wData };
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
      <AppSidebar />

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

        <div className="grid grid-cols-2 gap-6">
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

          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-6">
            <h3 className="font-semibold text-lg text-white">Analitik Penggunaan Dompet</h3>
            <div className="space-y-4">
              {topWallets && topWallets.length > 0 ? topWallets.map((wallet, i) => (
                <div key={i} className="flex items-center justify-between border-b border-[#27272A] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{wallet.name}</p>
                      <p className="text-xs text-zinc-400">{wallet.txCount} Total Transaksi • Sering: {wallet.topCategory}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Total Keluar</p>
                    <p className="font-bold text-red-400">-Rp {wallet.totalExpense.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-zinc-500">Belum ada data penggunaan dompet.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
