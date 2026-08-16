'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, Wallet, Tags, Target, LineChart, Sparkles, Settings } from 'lucide-react';
import DragDropArea from '@/components/dashboard/DragDropArea';

const MENUS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallets', label: 'Dompet', icon: Wallet },
  { href: '/budgets', label: 'Kategori & Anggaran', icon: Target },
  { href: '/transactions', label: 'Transaksi', icon: Tags },
  { href: '/analytics', label: 'Analitik', icon: LineChart },
  { href: '/insights', label: 'AI Insights', icon: Sparkles },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-[#18181B] border-r border-[#27272A] p-6 flex flex-col justify-between w-[240px] flex-shrink-0">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">MoneyJournal</span>
        </div>
        
        <nav className="space-y-1">
          {MENUS.map((menu) => {
            const isActive = pathname === menu.href;
            const Icon = menu.icon;
            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#27272A] text-white shadow-sm' 
                    : 'text-zinc-400 hover:bg-[#27272A]/50 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                {menu.label}
              </Link>
            );
          })}
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
  );
}
