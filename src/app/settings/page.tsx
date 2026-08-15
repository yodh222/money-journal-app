import React from 'react';
import { BookOpen, User, Wallet, Bell, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
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
            <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-400 hover:bg-[#27272A] hover:text-white text-sm font-medium transition-all">📊 Analytics</Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#27272A] text-white text-sm font-medium transition-all">⚙️ Settings</Link>
          </nav>
        </div>
      </aside>

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
                MJ
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Profil Pengguna</h3>
                <p className="text-zinc-400 text-sm">user@example.com</p>
              </div>
            </div>
            
            <div className="p-0">
              <button className="w-full flex items-center justify-between p-4 hover:bg-[#27272A] transition-colors border-b border-[#27272A]">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-zinc-400" />
                  <span className="text-sm font-medium">Data Pribadi</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-[#27272A] transition-colors border-b border-[#27272A]">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-zinc-400" />
                  <span className="text-sm font-medium">Manajemen Dompet</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-[#27272A] transition-colors border-b border-[#27272A]">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-zinc-400" />
                  <span className="text-sm font-medium">Notifikasi</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-[#27272A] transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-zinc-400" />
                  <span className="text-sm font-medium">Keamanan & Privasi</span>
                </div>
              </button>
            </div>
          </div>
          
          <button className="text-red-400 text-sm font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors">
            Keluar dari Aplikasi (Logout)
          </button>
        </div>
      </main>
    </div>
  );
}
