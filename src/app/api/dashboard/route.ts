import { NextResponse } from 'next/server';
import { getServerSupabase, getServerLedgerId } from '@/lib/serverSupabase';

export async function GET(request: Request) {
  try {
    const supabase = getServerSupabase(request);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ledgerId = await getServerLedgerId(supabase, user.id);

    // Parallel fetch for all dashboard data
    const [walletsRes, categoriesRes, budgetsRes, transactionsRes] = await Promise.all([
      supabase.from('wallets').select('*').eq('ledger_id', ledgerId),
      supabase.from('categories').select('*').eq('ledger_id', ledgerId),
      supabase.from('budgets').select('*, categories(name)').eq('ledger_id', ledgerId),
      supabase.from('transactions').select('*, categories(name, type), wallets!wallet_id(name)').eq('ledger_id', ledgerId).order('transaction_date', { ascending: false })
    ]);

    if (walletsRes.error) throw walletsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;
    if (budgetsRes.error) throw budgetsRes.error;
    if (transactionsRes.error) throw transactionsRes.error;

    return NextResponse.json({
      wallets: walletsRes.data,
      categories: categoriesRes.data,
      budgets: budgetsRes.data,
      transactions: transactionsRes.data,
      ledgerId
    });

  } catch (error: any) {
    console.error('API Error /api/dashboard:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
