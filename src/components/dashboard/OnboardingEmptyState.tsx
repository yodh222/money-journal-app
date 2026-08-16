'use client';

import React from 'react';
import { Wallet, Tags, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-8 py-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-white">Selamat Datang di Money Journal! 🎉</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Tampaknya Anda belum mengatur dompet atau kategori apa pun. 
          Agar aplikasi ini dapat melacak keuangan Anda dengan sempurna, mari selesaikan 2 langkah kecil berikut.
        </p>
      </div>

      <div className="w-full space-y-4 text-left">
        {/* Step 1 */}
        <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-xl flex items-start gap-4">
          <div className="h-10 w-10 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Wallet className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-white">1. Buat Dompet/Rekening</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tambahkan tempat Anda menyimpan uang, seperti Dompet Tunai, Rekening BCA, e-Wallet, dll.
            </p>
            <Link href="/settings?tab=wallet" className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors mt-2">
              Atur Dompet Sekarang <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-xl flex items-start gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Tags className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-white">2. Tambahkan Kategori</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Beri nama untuk pengeluaran dan pemasukan Anda (misal: Makanan, Gaji, Transportasi) agar AI bisa memberikan analisis yang akurat.
            </p>
            <Link href="/settings?tab=category" className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors mt-2">
              Atur Kategori Sekarang <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
