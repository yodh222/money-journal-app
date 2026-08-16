'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, BookOpen, Loader2 } from 'lucide-react';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import DragDropArea from '@/components/dashboard/DragDropArea';
import TransactionModal from '@/components/dashboard/TransactionModal';
import AIInsights from '@/components/dashboard/AIInsights';
import OnboardingEmptyState from '@/components/dashboard/OnboardingEmptyState';
import AppSidebar from '@/components/layout/AppSidebar';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Dashboard() {
  const router = useRouter();
  const { session, loading, totalBalance, incomeThisMonth, expenseThisMonth, transactions, categories, wallets, budgets } = useSupabaseData();
  const [journalNote, setJournalNote] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('daily_journal');
    if (saved) setJournalNote(saved);
  }, []);

  const handleSaveJournal = () => {
    localStorage.setItem('daily_journal', journalNote);
    toast.success('Catatan berhasil disimpan (lokal).');
  };

  const chartData = useMemo(() => {
    if (!transactions) return [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dataMap: Record<number, any> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      dataMap[i] = { name: `${i} ${new Date().toLocaleString('id-ID', { month: 'short' })}`, income: 0, expense: 0 };
    }
    
    transactions.forEach((tx: any) => {
      const date = new Date(tx.transaction_date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        const day = date.getDate();
        if (tx.categories?.type === 'INCOME') {
          dataMap[day].income += Number(tx.amount);
        } else if (tx.categories?.type === 'EXPENSE') {
          dataMap[day].expense += Number(tx.amount);
        }
      }
    });
    
    return Object.values(dataMap);
  }, [transactions]);

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
      
      <AppSidebar />

      {/* KOLOM 2: AREA UTAMA (DATA & GRAFIK) */}
      <main className="p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Halo, {session.user?.user_metadata?.full_name?.split(' ')[0] || 'Pengguna'}!</h1>
            <p className="text-sm text-zinc-400 mt-1">Berikut rangkuman arus keuangan Anda bulan ini.</p>
          </div>
          <TransactionModal />
        </div>

        {wallets.length === 0 ? (
          <OnboardingEmptyState />
        ) : (
          <>
            <AIInsights />

            {/* BARIS KARTU SALDO & RINGKASAN */}
            <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-3 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-center text-zinc-400 text-xs font-medium">
              Total Saldo Bersih 
              <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{formatIDR(totalBalance)}</p>
          </div>
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-3 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-center text-zinc-400 text-xs font-medium">
              Pemasukan Bulan Ini 
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-emerald-400">{formatIDR(incomeThisMonth)}</p>
          </div>
          <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-3 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-center text-zinc-400 text-xs font-medium">
              Pengeluaran Bulan Ini 
              <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-red-400">{formatIDR(expenseThisMonth)}</p>
          </div>
        </div>

        {/* AREA GRAFIK UTAMA */}
        <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl h-[340px] hover:border-zinc-700 transition-colors relative">
          <h3 className="text-sm font-semibold tracking-wide text-zinc-300 mb-4 absolute z-10">Arus Kas Bulanan</h3>
          <div className="pt-6 h-full w-full">
            <CashFlowChart data={chartData} />
          </div>
        </div>

        {/* TRANSAKSI TERAKHIR */}
        <div className="mt-8">
          <h2 className="text-lg font-bold tracking-tight mb-4">Transaksi Terakhir</h2>
          <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden">
            {transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#27272A]/50 text-zinc-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium">Tanggal</th>
                      <th className="px-6 py-4 font-medium">Kategori</th>
                      <th className="px-6 py-4 font-medium">Catatan Transaksi</th>
                      <th className="px-6 py-4 font-medium text-right">Nominal</th>
                      <th className="px-6 py-4 font-medium text-center">Struk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]">
                    {transactions.slice(0, 10).map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-[#27272A]/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                          {new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#27272A] text-zinc-300">
                            {tx.categories?.name || 'Lainnya'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-300 max-w-xs truncate">
                          {tx.notes || '-'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${tx.categories?.type === 'INCOME' ? 'text-emerald-400' : 'text-zinc-200'}`}>
                          {tx.categories?.type === 'INCOME' ? '+' : '-'} {formatIDR(Number(tx.amount))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {tx.metadata?.receipt_url ? (
                            <a href={tx.metadata.receipt_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 text-xs font-medium">
                              <ArrowUpRight className="h-3 w-3" /> Lihat
                            </a>
                          ) : (
                            <span className="text-zinc-600 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-sm">Belum ada transaksi.</div>
            )}
          </div>
        </div>
          </>
        )}
      </main>

      {/* KOLOM 3: SIDEBAR PANEL KANAN (JURNAL & ANGGARAN) */}
      <aside className="bg-[#18181B]/50 border-l border-[#27272A] p-6 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-5">🎯 Batas Anggaran</h3>
          <div className="space-y-5">
            {budgets && budgets.length > 0 ? budgets.map(budget => {
              const spent = transactions.filter((t: any) => t.category_id === budget.category_id && new Date(t.transaction_date).getMonth() === new Date().getMonth()).reduce((sum: number, t: any) => sum + Number(t.amount), 0);
              const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100);
              let colorClass = 'bg-emerald-500';
              if (percentage > 80) colorClass = 'bg-red-500';
              else if (percentage > 50) colorClass = 'bg-amber-500';

              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-zinc-200 flex items-center gap-2">{budget.categories?.name || 'Total'}</span>
                    <span className="text-zinc-400">{percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="text-[10px] text-zinc-500 text-right">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(spent)} / {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(budget.amount)}
                  </div>
                </div>
              );
            }) : (
              <div className="text-sm text-zinc-500">Belum ada batas anggaran.</div>
            )}
          </div>
        </div>

        <div className="border-t border-[#27272A] pt-6">
          <h3 className="text-xs font-bold tracking-wider text-zinc-500 uppercase mb-4">📝 Catatan Jurnal Hari Ini</h3>
          <div className="relative group">
            <textarea 
              value={journalNote}
              onChange={(e) => setJournalNote(e.target.value)}
              className="w-full h-32 bg-[#27272A]/50 border border-[#27272A] rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-[#18181B] text-zinc-200 placeholder-zinc-500 resize-none transition-all"
              placeholder="Ada cerita apa di balik pengeluaran atau pemasukanmu hari ini? Tulis refleksi pendekmu di sini..."
            />
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={handleSaveJournal} className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors">
                Simpan
              </button>
            </div>
          </div>
        </div>
      </aside>

    </div>
  );
}
