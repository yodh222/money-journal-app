'use client';
import React from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Loader2 } from 'lucide-react';
import WalletModal from '@/components/settings/WalletModal';

export default function WalletsPage() {
  const { wallets, loading } = useSupabaseData();

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
            <h1 className="text-2xl font-bold tracking-tight">Dompet Saya</h1>
            <p className="text-sm text-zinc-400 mt-1">Kelola semua sumber dana Anda di sini.</p>
          </div>
          <WalletModal />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {wallets && wallets.length > 0 ? (
            wallets.map(w => (
              <div key={w.id} className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-3 hover:border-zinc-700 transition-colors relative overflow-hidden group">
                <div className="flex justify-between items-center text-zinc-400 text-xs font-medium">
                  {w.type === 'CASH' ? 'Tunai' : w.type === 'BANK_ACCOUNT' ? 'Rekening Bank' : w.type === 'E_WALLET' ? 'E-Wallet' : 'Lainnya'}
                </div>
                <h3 className="text-lg font-semibold text-white">{w.name}</h3>
                <p className="text-2xl font-bold tracking-tight text-emerald-400">
                  Rp {Number(w.balance).toLocaleString('id-ID')}
                </p>
                <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:bg-indigo-500/20 transition-colors" />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center p-12 border border-dashed border-[#27272A] rounded-xl text-zinc-500">
              Belum ada dompet. Tambahkan dompet pertama Anda.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
