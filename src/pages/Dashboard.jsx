import React from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return 'Hari Ini';
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Kemarin';
  }
  
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const Dashboard = ({ balance, transactions }) => {
  // Calculate this month's income and expense
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    const tDate = new Date(t.date);
    if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
      if (t.type === 'INCOME') income += t.amount;
      else expense += t.amount;
    }
  });

  return (
    <div className="app-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-secondary">Selamat Datang,</p>
          <h1 className="text-xl font-bold">Yodha Agasthya</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-white flex justify-center items-center shadow-sm">
          <BellIcon className="w-6 h-6 text-primary" style={{ width: 24 }} />
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6" style={{ background: 'linear-gradient(135deg, #3498DB 0%, #6C5CE7 100%)', color: 'white' }}>
        <p className="text-sm font-medium mb-1 opacity-90">Total Saldo</p>
        <h2 className="text-3xl font-bold mb-4">{formatRupiah(balance)}</h2>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span>Semua Dompet</span>
        </div>
      </div>

      {/* Income & Expense Summary */}
      <div className="flex gap-4 mb-8">
        {/* Income Box */}
        <div className="flex-1 bg-white rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex justify-center items-center">
              <ArrowTrendingUpIcon className="text-income" style={{ width: 18 }} />
            </div>
            <p className="text-xs text-secondary font-medium">Pemasukan</p>
          </div>
          <p className="font-bold text-lg text-primary">{formatRupiah(income)}</p>
        </div>
        
        {/* Expense Box */}
        <div className="flex-1 bg-white rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex justify-center items-center">
              <ArrowTrendingDownIcon className="text-expense" style={{ width: 18 }} />
            </div>
            <p className="text-xs text-secondary font-medium">Pengeluaran</p>
          </div>
          <p className="font-bold text-lg text-primary">{formatRupiah(expense)}</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Aktivitas Terakhir</h3>
          <span className="text-xs text-accent font-medium cursor-pointer">Lihat Semua</span>
        </div>

        <div className="flex flex-col gap-3 mb-24">
          {transactions.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm text-secondary">
              <p className="text-sm">Belum ada transaksi.</p>
            </div>
          ) : (
            transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex justify-center items-center ${t.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {t.type === 'INCOME' ? 
                      <ArrowTrendingUpIcon className="text-income" style={{ width: 20 }} /> : 
                      <ArrowTrendingDownIcon className="text-expense" style={{ width: 20 }} />
                    }
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.category}</p>
                    <p className="text-xs text-secondary">{t.note || formatDate(t.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${t.type === 'INCOME' ? 'text-income' : 'text-primary'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                  </p>
                  <p className="text-xs text-secondary">{formatDate(t.date)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
