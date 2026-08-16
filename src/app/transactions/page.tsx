'use client';
import React from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Loader2 } from 'lucide-react';
import TransactionModal from '@/components/dashboard/TransactionModal';

export default function TransactionsPage() {
  const { transactions, loading } = useSupabaseData();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] grid grid-cols-[240px_1fr] h-screen overflow-hidden">
      <AppSidebar />
      <main className="p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Semua Transaksi</h1>
            <p className="text-sm text-zinc-400 mt-1">Lihat riwayat lengkap pemasukan dan pengeluaran Anda.</p>
          </div>
          <TransactionModal />
        </div>

        <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-[#27272A]/30 border-b border-[#27272A]">
                <tr>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Kategori</th>
                  <th className="px-6 py-4 font-medium">Catatan Transaksi</th>
                  <th className="px-6 py-4 font-medium text-right">Nominal</th>
                  <th className="px-6 py-4 font-medium text-center">Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-[#27272A]/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                        {new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#27272A] text-zinc-300">
                          {tx.categories?.name || 'Tanpa Kategori'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 max-w-xs truncate">{tx.notes || '-'}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${tx.categories?.type === 'INCOME' ? 'text-emerald-400' : 'text-zinc-200'}`}>
                        {tx.categories?.type === 'INCOME' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {tx.metadata?.receipt_url ? (
                          <a href={tx.metadata.receipt_url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 text-xs font-medium">
                            Lihat
                          </a>
                        ) : (
                          <span className="text-zinc-600 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                      Belum ada transaksi yang tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
