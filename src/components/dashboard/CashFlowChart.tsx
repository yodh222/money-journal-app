'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function CashFlowChart({ data }: { data: any[] }) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717A', fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717A', fontSize: 12 }} 
            tickFormatter={(val) => `Rp${val / 1000000}M`} 
            dx={-10} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px' }}
            itemStyle={{ color: '#FAFAFA' }}
            formatter={(value: any) => [formatCurrency(value), '']}
            labelStyle={{ color: '#A1A1AA', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="#10B981" 
            fillOpacity={1} 
            fill="url(#colorIncome)" 
            name="Pemasukan" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="expense" 
            stroke="#EF4444" 
            fillOpacity={1} 
            fill="url(#colorExpense)" 
            name="Pengeluaran" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
