'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function TransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, type]);

  const loadCategories = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', session.user.id)
      .eq('type', type);
    if (data) {
      setCategories(data);
      if (data.length > 0) {
        setCategoryId(data[0].id);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');

      const { data: wallets } = await supabase.from('wallets').select('id').eq('user_id', session.user.id).limit(1);
      const walletId = wallets?.[0]?.id;

      if (!walletId) throw new Error('No wallet found');
      if (!categoryId) throw new Error('No category selected');

      const { error } = await supabase.from('transactions').insert({
        user_id: session.user.id,
        wallet_id: walletId,
        category_id: categoryId,
        amount: parseFloat(amount),
        notes: notes,
      });

      if (error) throw error;
      
      alert('Transaksi berhasil ditambahkan!');
      setIsOpen(false);
      setAmount('');
      setNotes('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
          <Plus className="h-4 w-4" /> Tambah Manual
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-[#18181B] border-[#27272A] text-white">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Tipe Transaksi</Label>
            <Select value={type} onValueChange={(val) => setType(val || 'EXPENSE')}>
              <SelectTrigger className="bg-[#27272A] border-[#27272A]">
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181B] border-[#27272A] text-white">
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')} disabled={categories.length === 0}>
              <SelectTrigger className="bg-[#27272A] border-[#27272A]">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181B] border-[#27272A] text-white">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nominal (Rp)</Label>
            <Input 
              type="number" 
              required 
              min="0"
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="bg-[#27272A] border-[#27272A]"
              placeholder="Contoh: 50000"
            />
          </div>

          <div className="space-y-2">
            <Label>Catatan</Label>
            <Input 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              className="bg-[#27272A] border-[#27272A]"
              placeholder="Makan siang..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white mt-4">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Transaksi'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
