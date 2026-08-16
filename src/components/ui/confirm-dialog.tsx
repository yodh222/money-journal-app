'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
}

export function ConfirmDialog({ isOpen, onOpenChange, title, description, onConfirm, loading = false }: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#18181B] border-[#27272A] text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={loading} 
            className="bg-transparent border-[#27272A] text-zinc-300 hover:bg-[#27272A] hover:text-white"
          >
            Batal
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={loading} 
            className="bg-red-500 hover:bg-red-600 text-white min-w-[80px]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hapus'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
