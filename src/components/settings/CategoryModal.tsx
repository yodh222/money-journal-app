'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function CategoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Anda belum login');

      const { error } = await supabase.from('categories').insert({
        user_id: session.user.id,
        name: name,
        type: type,
        budget_limit: parseFloat(budgetLimit) || 0,
      });

      if (error) throw error;
      
      toast.success('Kategori berhasil ditambahkan!');
      setIsOpen(false);
      setName('');
      setBudgetLimit('');
      setType('EXPENSE');
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
        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium mt-2 transition-colors">
          + Tambah Kategori Baru
        </button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-[#18181B] border-[#27272A] text-white">
        <DialogHeader>
          <DialogTitle>Tambah Kategori Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Nama Kategori</Label>
            <Input 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="bg-[#27272A] border-[#27272A] text-white"
              placeholder="Contoh: Makanan, Transportasi, Gaji"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipe Kategori</Label>
            <Select value={type} onValueChange={(val) => setType(val || 'EXPENSE')}>
              <SelectTrigger className="bg-[#27272A] border-[#27272A] text-white">
                <span className="flex flex-1 text-left line-clamp-1">
                  {type === 'EXPENSE' ? 'Pengeluaran' : type === 'INCOME' ? 'Pemasukan' : 'Pilih tipe'}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-[#18181B] border-[#27272A] text-white">
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Batas Anggaran (Rp) - Opsional</Label>
            <Input 
              type="number" 
              min="0"
              value={budgetLimit} 
              onChange={e => setBudgetLimit(e.target.value)} 
              className="bg-[#27272A] border-[#27272A] text-white"
              placeholder="Contoh: 2000000 (Kosongkan jika tidak dibatasi)"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white mt-4">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Kategori'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
