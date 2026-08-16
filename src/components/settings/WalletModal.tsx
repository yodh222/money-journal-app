'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { walletService } from '@/services/wallet.service';

interface WalletModalProps {
  editMode?: boolean;
  initialData?: { id: string; name: string; type: string; balance: number };
  triggerElement?: React.ReactElement;
}

export default function WalletModal({ editMode = false, initialData, triggerElement }: WalletModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'CASH');
  const [balance, setBalance] = useState(initialData ? initialData.balance.toString() : '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode && initialData) {
        await walletService.updateWallet(initialData.id, {
          name, type, balance: parseFloat(balance) || 0
        });
        toast.success('Dompet berhasil diperbarui!');
      } else {
        await walletService.createWallet({
          name, type, balance: parseFloat(balance) || 0,
        });
        toast.success('Dompet berhasil ditambahkan!');
      }
      
      setIsOpen(false);
      if (!editMode) {
        setName('');
        setBalance('');
        setType('CASH');
      }
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        triggerElement || (
          <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium mt-2 transition-colors">
            + Tambah Dompet Baru
          </button>
        )
      } />
      <DialogContent className="sm:max-w-[425px] bg-[#18181B] border-[#27272A] text-white">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Dompet' : 'Tambah Dompet Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Nama Dompet</Label>
            <Input 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="bg-[#27272A] border-[#27272A] text-white"
              placeholder="Contoh: BCA Pribadi, OVO, Dompet Kulit"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipe Dompet</Label>
            <Select value={type} onValueChange={(val) => setType(val || 'CASH')}>
              <SelectTrigger className="bg-[#27272A] border-[#27272A] text-white">
                <SelectValue placeholder="Pilih tipe">
                  {type === 'CASH' ? 'Tunai (Cash)' : 
                   type === 'BANK_ACCOUNT' ? 'Rekening Bank' : 
                   type === 'E_WALLET' ? 'Dompet Digital (E-Wallet)' : 
                   type === 'CREDIT_CARD' ? 'Kartu Kredit' : 
                   type === 'INVESTMENT' ? 'Investasi' : 
                   type === 'LOAN' ? 'Pinjaman / Hutang' : ''}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#18181B] border-[#27272A] text-white">
                <SelectItem value="CASH">Tunai (Cash)</SelectItem>
                <SelectItem value="BANK_ACCOUNT">Rekening Bank</SelectItem>
                <SelectItem value="E_WALLET">Dompet Digital (E-Wallet)</SelectItem>
                <SelectItem value="CREDIT_CARD">Kartu Kredit</SelectItem>
                <SelectItem value="INVESTMENT">Investasi</SelectItem>
                <SelectItem value="LOAN">Pinjaman / Hutang</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Saldo Awal (Rp)</Label>
            <Input 
              type="number" 
              required 
              value={balance} 
              onChange={e => setBalance(e.target.value)} 
              className="bg-[#27272A] border-[#27272A] text-white"
              placeholder="Contoh: 1500000"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white mt-4">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editMode ? 'Simpan Perubahan' : 'Simpan Dompet')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
