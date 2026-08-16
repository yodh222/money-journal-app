'use client';

import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { transactionService } from '@/services/transaction.service';
import { useSupabaseData } from '@/hooks/useSupabaseData';

export default function DragDropArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { wallets, categories } = useSupabaseData();

  const processFile = async (file: File) => {
    setIsUploading(true);
    const toastId = toast.loading('Memproses struk dengan AI...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Gagal menganalisis struk');
      const data = await res.json();

      // Find references from local state
      const firstWallet = wallets[0];
      if (!firstWallet) throw new Error('Belum ada dompet aktif.');
      const walletId = firstWallet.id;

      let categoryId = null;
      if (data.categoryHint) {
        const found = categories.find((c: any) => c.name.toLowerCase() === data.categoryHint.toLowerCase());
        if (found) categoryId = found.id;
        else if (categories.length > 0) categoryId = categories[0].id;
      }

      await transactionService.createTransaction({
        wallet_id: walletId,
        category_id: categoryId,
        amount: data.type === 'EXPENSE' ? -data.amount : data.amount,
        notes: data.notes
      });

      toast.success(`Berhasil mencatat Rp${data.amount.toLocaleString('id-ID')} dari struk!`, { id: toastId });
      window.location.reload();
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan saat upload', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  }, [isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [isUploading]);

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
        isDragging 
          ? 'border-indigo-500 bg-indigo-500/10' 
          : 'border-[#27272A] bg-[#18181B] hover:border-zinc-600'
      } ${isUploading ? 'opacity-75 pointer-events-none' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        accept="image/*,.pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
          }
        }}
      />
      {isUploading ? (
        <Loader2 className="h-8 w-8 mb-2 text-indigo-500 animate-spin" />
      ) : (
        <UploadCloud className={`h-8 w-8 mb-2 ${isDragging ? 'text-indigo-400' : 'text-zinc-500'}`} />
      )}
      <p className="text-xs font-medium text-zinc-400">
        {isUploading ? 'Menganalisis...' : (
          <>Drop struk/bukti transfer ke sini <br/> atau klik untuk upload.</>
        )}
      </p>
    </div>
  );
}
