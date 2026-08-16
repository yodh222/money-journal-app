'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { apiClient } from '@/lib/apiClient';

const fetcher = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session');
  
  const data = await apiClient.get('/api/dashboard');
  
  const totalBalance = data.wallets.reduce((sum: number, w: any) => sum + Number(w.balance), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let incomeThisMonth = 0;
  let expenseThisMonth = 0;

  data.transactions.forEach((tx: any) => {
    const d = new Date(tx.transaction_date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      if (tx.categories?.type === 'INCOME') incomeThisMonth += Number(tx.amount);
      else if (tx.categories?.type === 'EXPENSE') expenseThisMonth += Number(tx.amount);
    }
  });

  return {
    ...data,
    totalBalance,
    incomeThisMonth,
    expenseThisMonth
  };
};

export function useSupabaseData() {
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data, error, isLoading, mutate } = useSWR(session ? '/api/dashboard' : null, fetcher, {
    revalidateOnFocus: false, // Prevents reloading when switching tabs/apps
    revalidateIfStale: false, // Prevents reloading on page mount if data is cached
    dedupingInterval: 60000,  // Cache deduplication for 1 minute
  });

  return {
    session,
    loading: sessionLoading || isLoading,
    wallets: (data?.wallets || []) as any[],
    categories: (data?.categories || []) as any[],
    budgets: (data?.budgets || []) as any[],
    transactions: (data?.transactions || []) as any[],
    totalBalance: (data?.totalBalance || 0) as number,
    incomeThisMonth: (data?.incomeThisMonth || 0) as number,
    expenseThisMonth: (data?.expenseThisMonth || 0) as number,
    refetch: mutate
  };
}
