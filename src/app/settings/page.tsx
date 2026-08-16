'use client';
import React, { useState } from 'react';
import { BookOpen, User, Wallet, Bell, Shield, Loader2, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import WalletModal from '@/components/settings/WalletModal';
import CategoryModal from '@/components/settings/CategoryModal';
import { Tag } from 'lucide-react';
import AppSidebar from '@/components/layout/AppSidebar';

export default function SettingsPage() {
  const { session, loading, wallets, categories, budgets } = useSupabaseData();
  const router = useRouter();
  const [openTab, setOpenTab] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || 'Pengguna';
  const email = user?.email || 'user@example.com';
  const initials = fullName.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleTab = (tab: string) => {
    setOpenTab(openTab === tab ? null : tab);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] grid grid-cols-[240px_1fr] h-screen overflow-hidden">
      
      {/* KOLOM 1: SIDEBAR NAVIGASI */}
      <AppSidebar />

      {/* KOLOM 2: AREA UTAMA SETTINGS */}
      <main className="p-8 space-y-8 overflow-y-auto max-w-4xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-sm text-zinc-400 mt-1">Kelola profil, dompet, dan preferensi aplikasi Anda.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden">
            <div className="p-6 flex items-center gap-4 border-b border-[#27272A]">
              <div className="h-16 w-16 bg-indigo-500 rounded-full flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">{fullName}</h3>
                <p className="text-zinc-400 text-sm">{email}</p>
              </div>
            </div>
            
            <div className="p-0">
              <button onClick={() => toggleTab('profile')} className="w-full flex items-center justify-between p-4 hover:bg-[#27272A] transition-colors border-b border-[#27272A]">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-zinc-400" />
                  <span className="text-sm font-medium">Data Pribadi</span>
                </div>
                {openTab === 'profile' ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </button>
              {openTab === 'profile' && (
                <div className="p-4 bg-[#09090B] border-b border-[#27272A]">
                  <p className="text-sm text-zinc-400">Nama: {fullName}</p>
                  <p className="text-sm text-zinc-400 mt-1">Email: {email}</p>
                </div>
              )}

              <button onClick={() => toggleTab('wallet')} className="w-full flex items-center justify-between p-4 hover:bg-[#27272A] transition-colors border-b border-[#27272A]">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-zinc-400" />
                  <span className="text-sm font-medium">Manajemen Dompet</span>
                </div>
                {openTab === 'wallet' ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </button>
              {openTab === 'wallet' && (
                <div className="p-4 bg-[#09090B] border-b border-[#27272A] space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Daftar Dompet</h4>
                  {wallets && wallets.length > 0 ? (
                    wallets.map(w => (
                      <div key={w.id} className="flex justify-between items-center p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                        <span className="text-sm font-medium">{w.name}</span>
                        <span className="text-sm text-emerald-400 font-bold">Rp {Number(w.balance).toLocaleString('id-ID')}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-zinc-500">Belum ada dompet.</div>
                  )}
                  <WalletModal />
                </div>
              )}

              <button onClick={() => toggleTab('category')} className="w-full flex items-center justify-between p-4 hover:bg-[#27272A] transition-colors border-b border-[#27272A]">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-zinc-400" />
                  <span className="text-sm font-medium">Manajemen Kategori</span>
                </div>
                {openTab === 'category' ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </button>
              {openTab === 'category' && (
                <div className="p-4 bg-[#09090B] border-b border-[#27272A] space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Daftar Kategori</h4>
                  {categories && categories.length > 0 ? (
                    categories.map(c => {
                      const budget = budgets?.find(b => b.category_id === c.id);
                      return (
                        <div key={c.id} className="flex justify-between items-center p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{c.name}</span>
                            <span className="text-xs text-zinc-500">{c.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}</span>
                          </div>
                          {budget && (
                            <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded">Limit: Rp {Number(budget.amount).toLocaleString('id-ID')}</span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-zinc-500">Belum ada kategori.</div>
                  )}
                  <CategoryModal />
                </div>
              )}

              <button onClick={() => toggleTab('notif')} className="w-full flex items-center justify-between p-4 hover:bg-[#27272A] transition-colors border-b border-[#27272A]">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-zinc-400" />
                  <span className="text-sm font-medium">Notifikasi</span>
                </div>
                {openTab === 'notif' ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </button>
              {openTab === 'notif' && (
                <div className="p-4 bg-[#09090B] border-b border-[#27272A]">
                  <p className="text-sm text-zinc-500 italic">Fitur ini sedang dalam tahap pengembangan.</p>
                </div>
              )}

              <button onClick={() => toggleTab('security')} className="w-full flex items-center justify-between p-4 hover:bg-[#27272A] transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-zinc-400" />
                  <span className="text-sm font-medium">Keamanan & Privasi</span>
                </div>
                {openTab === 'security' ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </button>
              {openTab === 'security' && (
                <div className="p-4 bg-[#09090B] border-t border-[#27272A]">
                  <p className="text-sm text-zinc-500 italic">Fitur ini sedang dalam tahap pengembangan.</p>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 text-sm font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" /> Keluar dari Aplikasi
          </button>
        </div>
      </main>
    </div>
  );
}
