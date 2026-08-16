'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function MonthlyBarChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-zinc-500">Belum ada data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 12 }} tickFormatter={(val) => `Rp${val/1000}K`} dx={-10} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px' }}
          itemStyle={{ color: '#FAFAFA' }}
          formatter={(value: any) => [`Rp${value.toLocaleString('id-ID')}`, '']}
          cursor={{fill: '#27272A', opacity: 0.4}}
        />
        <Legend />
        <Bar dataKey="income" name="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
