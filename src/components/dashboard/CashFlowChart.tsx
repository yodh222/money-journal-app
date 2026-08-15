'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '1 Aug', income: 4000000, expense: 2400000 },
  { name: '5 Aug', income: 3000000, expense: 1398000 },
  { name: '10 Aug', income: 2000000, expense: 9800000 },
  { name: '15 Aug', income: 2780000, expense: 3908000 },
  { name: '20 Aug', income: 1890000, expense: 4800000 },
  { name: '25 Aug', income: 2390000, expense: 3800000 },
  { name: '31 Aug', income: 3490000, expense: 4300000 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function CashFlowChart() {
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
            formatter={(value: number) => [formatCurrency(value), '']}
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
