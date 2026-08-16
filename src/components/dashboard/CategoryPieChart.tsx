'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CategoryPieChart({ data }: { data: any[] }) {
  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-zinc-500">Belum ada data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px' }}
          itemStyle={{ color: '#FAFAFA' }}
          formatter={(value: any) => [`Rp${value.toLocaleString('id-ID')}`, '']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
