'use client';

import React, { useState, useEffect } from 'react';
import { useShortcut } from '@/hooks/useShortcut';
import { Search, PlusCircle, ArrowRightLeft, Settings } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

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
    }
  });

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById('command-palette-input');
      input?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Parsing input:', inputValue);
    // TODO: AI Parser logic
    setIsOpen(false);
    setInputValue('');
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
