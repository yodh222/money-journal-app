'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useSupabaseData() {
  const [session, setSession] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalBalance, setTotalBalance] = useState(0);
  const [incomeThisMonth, setIncomeThisMonth] = useState(0);
  const [expenseThisMonth, setExpenseThisMonth] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch Wallets
      const { data: walletsData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId);
      
      // Fetch Categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`);

      // Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select(`*, categories(type, name)`)
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false });

      if (walletsData) {
        setWallets(walletsData);
        const balance = walletsData.reduce((acc, curr) => acc + Number(curr.balance), 0);
        setTotalBalance(balance);
      }

      if (categoriesData) setCategories(categoriesData);

      if (txData) {
        setTransactions(txData);
        // Calculate this month's stats
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        let inc = 0;
        let exp = 0;

        txData.forEach((tx) => {
          const date = new Date(tx.transaction_date);
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            if (tx.categories?.type === 'INCOME') {
              inc += Number(tx.amount);
            } else if (tx.categories?.type === 'EXPENSE') {
              exp += Number(tx.amount);
            }
          }
        });

        setIncomeThisMonth(inc);
        setExpenseThisMonth(exp);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    loading,
    wallets,
    categories,
    transactions,
    totalBalance,
    incomeThisMonth,
    expenseThisMonth,
    refetch: () => session?.user && fetchData(session.user.id)
  };
}
