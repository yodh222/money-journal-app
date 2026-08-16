'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

import { toast } from 'sonner';

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
      if (session) {
        fetchData(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchData(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async (user: any) => {
    setLoading(true);
    try {
      // 1. Dapatkan ledger_id (buku kas) aktif
      const { data: ledgerMember, error: ledgerError } = await supabase
        .from('ledger_members')
        .select('ledger_id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (ledgerError) {
        if (ledgerError.message.includes('Could not find the table')) {
          console.error('DATABASE NOT SETUP:', ledgerError.message);
          toast.error('Gagal: Tabel database belum dibuat. Silakan jalankan SQL migration di Supabase Dashboard Anda.');
        } else {
          console.error('Ledger Error:', ledgerError);
        }
        setLoading(false);
        return;
      }

      const ledgerId = ledgerMember?.[0]?.ledger_id;

      if (!ledgerId) {
        setLoading(false);
        return;
      }

      // 2. Fetch Wallets berdasarkan ledger_id
      const { data: walletsData } = await supabase
        .from('wallets')
        .select('*')
        .eq('ledger_id', ledgerId);
      
      if (walletsData) {
        setWallets(walletsData);
        const balance = walletsData.reduce((acc, curr) => acc + Number(curr.balance), 0);
        setTotalBalance(balance);
      }

      // 3. Fetch Categories berdasarkan ledger_id
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('ledger_id', ledgerId);
      
      if (categoriesData) setCategories(categoriesData);

      // 4. Fetch Budgets berdasarkan ledger_id
      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*, categories(name)')
        .eq('ledger_id', ledgerId);
      
      if (budgetsData) setBudgets(budgetsData);

      // 5. Fetch Transactions berdasarkan ledger_id
      const { data: txData } = await supabase
        .from('transactions')
        .select(`*, categories(type, name)`)
        .eq('ledger_id', ledgerId)
        .order('transaction_date', { ascending: false });

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
    budgets,
    transactions,
    totalBalance,
    incomeThisMonth,
    expenseThisMonth,
    refetch: () => session?.user && fetchData(session.user)
  };
}
