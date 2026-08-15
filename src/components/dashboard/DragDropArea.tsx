'use client';

import React, { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

export default function DragDropArea() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      console.log('File dropped:', file.name);
      // TODO: Implement local OCR or API logic here
    }
  }, []);

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center ${
        isDragging 
          ? 'border-indigo-500 bg-indigo-500/10' 
          : 'border-[#27272A] bg-[#18181B] hover:border-zinc-600'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <UploadCloud className={`h-8 w-8 mb-2 ${isDragging ? 'text-indigo-400' : 'text-zinc-500'}`} />
      <p className="text-xs font-medium text-zinc-400">
        Drop struk/bukti transfer ke sini <br/> untuk diproses otomatis.
      </p>
    </div>
  );
}
