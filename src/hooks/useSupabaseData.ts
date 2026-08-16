'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { apiClient } from '@/lib/apiClient';

export function useSupabaseData() {
  const [session, setSession] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalBalance, setTotalBalance] = useState(0);
  const [incomeThisMonth, setIncomeThisMonth] = useState(0);
  const [expenseThisMonth, setExpenseThisMonth] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!session) return;
      const data = await apiClient.get('/api/dashboard');
      
      setWallets(data.wallets);
      setCategories(data.categories);
      setBudgets(data.budgets);
      setTransactions(data.transactions);
      
      const total = data.wallets.reduce((sum: number, w: any) => sum + Number(w.balance), 0);
      setTotalBalance(total);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      let income = 0;
      let expense = 0;

      data.transactions.forEach((tx: any) => {
        const d = new Date(tx.transaction_date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          if (tx.categories?.type === 'INCOME') income += Number(tx.amount);
          else if (tx.categories?.type === 'EXPENSE') expense += Number(tx.amount);
        }
      });

      setIncomeThisMonth(income);
      setExpenseThisMonth(expense);
    } catch (error) {
      console.error('API Error in useSupabaseData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  return {
    session,
    loading,
    wallets,
    categories,
    budgets,
    transactions,
    totalBalance,
    incomeThisMonth,
    expenseThisMonth,
    refetch: fetchData
  };
}
