'use client';

import React, { useState, useEffect } from 'react';
import { useShortcut } from '@/hooks/useShortcut';
import { Search, PlusCircle, ArrowRightLeft, Settings } from 'lucide-react';
import { parseQuickInput } from '@/lib/parser';
import { transactionService } from '@/services/transaction.service';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [parseResult, setParseResult] = useState<any>(null);

  useShortcut({
    N: () => {
      setIsOpen(true);
    },
    CmdK: () => {
      setIsOpen(true);
    },
    Escape: () => {
      setIsOpen(false);
      setInputValue('');
      setParseResult(null);
    },
    D: () => router.push('/'),
    A: () => router.push('/analytics'),
    S: () => router.push('/settings')
  });

  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById('command-palette-input');
      input?.focus();
    }
  }, [isOpen]);

  // Live parsing
  useEffect(() => {
    if (inputValue.trim().length > 2) {
      setParseResult(parseQuickInput(inputValue));
    } else {
      setParseResult(null);
    }
  }, [inputValue]);

  if (!isOpen) return null;

  const { wallets, categories } = useSupabaseData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parseResult || !parseResult.amount) return;
    
    try {
      // Fetch first wallet
      const firstWallet = wallets[0];

      if (!firstWallet) {
        toast.error('Gagal: Anda belum memiliki dompet/wallet.');
        return;
      }
      const walletId = firstWallet.id;

      // Find or create category
      let categoryId = null;
      if (parseResult.categoryHint) {
        const found = categories.find((c: any) => c.name.toLowerCase() === parseResult.categoryHint.toLowerCase());
        if (found) categoryId = found.id;
        else if (categories.length > 0) categoryId = categories[0].id;
      }

      // Insert transaction
      await transactionService.createTransaction({
        wallet_id: walletId,
        category_id: categoryId,
        amount: parseResult.amount,
        notes: parseResult.notes,
        tags: parseResult.tags,
      });
      
      toast.success(`Tersimpan!\nNominal: Rp ${parseResult.amount}\nKategori: ${parseResult.categoryHint || 'Lainnya'}`);
      window.location.reload();
      
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal menyimpan transaksi: ' + err.message);
    }
    
    setIsOpen(false);
    setInputValue('');
    setParseResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl bg-[#18181B] border border-[#27272A] shadow-2xl ring-1 ring-white/10 transform transition-all">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="relative flex items-center px-4 py-3 border-b border-[#27272A]">
            <Search className="h-5 w-5 text-zinc-500 mr-3" />
            <input
              id="command-palette-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none text-base"
              placeholder="e.g., 50000 jajan sore #makanan"
              autoComplete="off"
            />
            <kbd className="ml-3 hidden sm:inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-400">
              ESC
            </kbd>
          </div>

          {/* Live Parser Preview */}
          {parseResult && (
            <div className="px-4 py-3 bg-indigo-500/10 border-b border-[#27272A] flex flex-col gap-2">
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Preview Transaksi</div>
              <div className="flex flex-wrap gap-2 text-sm text-zinc-300">
                {parseResult.amount && (
                  <span className="bg-[#27272A] px-2 py-1 rounded text-white font-medium">Rp {parseResult.amount.toLocaleString('id-ID')}</span>
                )}
                {parseResult.categoryHint && (
                  <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded capitalize">{parseResult.categoryHint}</span>
                )}
                {parseResult.tags.map((t: string) => (
                  <span key={t} className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">{t}</span>
                ))}
                {parseResult.notes && (
                  <span className="text-zinc-400 italic mt-1 w-full truncate">"{parseResult.notes}"</span>
                )}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">Tekan ENTER untuk menyimpan</div>
            </div>
          )}

          {/* Quick Suggestions / Actions */}
          <div className="p-2 space-y-1 overflow-y-auto max-h-72">
            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Suggestions
            </div>
            
            <button type="button" className="w-full flex items-center px-3 py-2 text-sm text-zinc-300 hover:bg-[#27272A] hover:text-white rounded-md transition-colors text-left">
              <PlusCircle className="mr-3 h-4 w-4 text-indigo-400" />
              Catat Pemasukan / Pengeluaran Cepat
            </button>
            <button type="button" className="w-full flex items-center px-3 py-2 text-sm text-zinc-300 hover:bg-[#27272A] hover:text-white rounded-md transition-colors text-left">
              <ArrowRightLeft className="mr-3 h-4 w-4 text-emerald-400" />
              Transfer Antar Dompet
            </button>
            <button type="button" className="w-full flex items-center px-3 py-2 text-sm text-zinc-300 hover:bg-[#27272A] hover:text-white rounded-md transition-colors text-left">
              <Settings className="mr-3 h-4 w-4 text-zinc-400" />
              Buka Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
