'use client';
import React from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Loader2 } from 'lucide-react';
import CategoryModal from '@/components/settings/CategoryModal';

export default function BudgetsPage() {
  const { categories, budgets, loading } = useSupabaseData();

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
            <h1 className="text-2xl font-bold tracking-tight">Kategori & Anggaran</h1>
            <p className="text-sm text-zinc-400 mt-1">Kelola batas pengeluaran untuk setiap kategori.</p>
          </div>
          <CategoryModal />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {categories && categories.length > 0 ? (
            categories.map(c => {
              const budget = budgets?.find(b => b.category_id === c.id);
              return (
                <div key={c.id} className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-3 hover:border-zinc-700 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{c.name}</span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${c.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {c.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </div>
                  {budget ? (
                    <div className="pt-2 border-t border-[#27272A]">
                      <p className="text-xs text-zinc-400 mb-1">Batas Anggaran Bulanan:</p>
                      <p className="text-lg font-bold text-amber-400">Rp {Number(budget.amount).toLocaleString('id-ID')}</p>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[#27272A]">
                      <p className="text-xs text-zinc-500">Tanpa Batas Anggaran</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center p-12 border border-dashed border-[#27272A] rounded-xl text-zinc-500">
              Belum ada kategori.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
