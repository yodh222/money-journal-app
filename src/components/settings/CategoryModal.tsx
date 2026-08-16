'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

import { categoryService } from '@/services/category.service';

interface CategoryModalProps {
  editMode?: boolean;
  initialData?: { id: string; name: string; type: string; budget_limit?: number };
  triggerElement?: React.ReactElement;
}

export default function CategoryModal({ editMode = false, initialData, triggerElement }: CategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'EXPENSE');
  const [budgetLimit, setBudgetLimit] = useState(initialData?.budget_limit ? initialData.budget_limit.toString() : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode && initialData) {
        await categoryService.updateCategory(initialData.id, {
          name, type, budget_limit: parseFloat(budgetLimit) || 0,
        });
        toast.success('Kategori berhasil diperbarui!');
      } else {
        await categoryService.createCategory({
          name, type, budget_limit: parseFloat(budgetLimit) || 0,
        });
        toast.success('Kategori berhasil ditambahkan!');
      }
      
      setIsOpen(false);
      if (!editMode) {
        setName('');
        setBudgetLimit('');
        setType('EXPENSE');
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
            + Tambah Kategori Baru
          </button>
        )
      } />
      <DialogContent className="sm:max-w-[425px] bg-[#18181B] border-[#27272A] text-white">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
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
                <SelectValue placeholder="Pilih tipe">
                  {type === 'EXPENSE' ? 'Pengeluaran' : type === 'INCOME' ? 'Pemasukan' : ''}
                </SelectValue>
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
              value={budgetLimit} 
              onChange={e => setBudgetLimit(e.target.value)} 
              className="bg-[#27272A] border-[#27272A] text-white"
              placeholder="Contoh: 2000000 (Kosongkan jika tidak dibatasi)"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white mt-4">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editMode ? 'Simpan Perubahan' : 'Simpan Kategori')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
