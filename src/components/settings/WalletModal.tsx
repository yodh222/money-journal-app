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

export default function WalletModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('CASH');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Anda belum login');

      const { error } = await supabase.from('wallets').insert({
        user_id: session.user.id,
        name: name,
        type: type,
        balance: parseFloat(balance) || 0,
      });

      if (error) throw error;
      
      alert('Dompet berhasil ditambahkan!');
      setIsOpen(false);
      setName('');
      setBalance('');
      setType('CASH');
      window.location.reload(); // Refresh the page to show the new wallet
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium mt-2 transition-colors">
          + Tambah Dompet Baru
        </button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-[#18181B] border-[#27272A] text-white">
        <DialogHeader>
          <DialogTitle>Tambah Dompet Baru</DialogTitle>
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
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181B] border-[#27272A] text-white">
                <SelectItem value="CASH">Tunai (Cash)</SelectItem>
                <SelectItem value="BANK_ACCOUNT">Rekening Bank</SelectItem>
                <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                <SelectItem value="CREDIT_CARD">Kartu Kredit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Saldo Awal (Rp)</Label>
            <Input 
              type="number" 
              required 
              min="0"
              value={balance} 
              onChange={e => setBalance(e.target.value)} 
              className="bg-[#27272A] border-[#27272A] text-white"
              placeholder="Contoh: 1500000"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white mt-4">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Dompet'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
