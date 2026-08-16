import { NextResponse } from 'next/server';
import { getServerSupabase, getServerLedgerId } from '@/lib/serverSupabase';

export async function POST(request: Request) {
  try {
    const supabase = getServerSupabase(request);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ledgerId = await getServerLedgerId(supabase, user.id);
    const body = await request.json();

    const { data: catData, error: catError } = await supabase.from('categories').insert({
      ledger_id: ledgerId,
      name: body.name,
      type: body.type,
    }).select().single();

    if (catError) throw catError;

    if (body.budget_limit > 0) {
      await supabase.from('budgets').insert({
        ledger_id: ledgerId,
        category_id: catData.id,
        amount: body.budget_limit,
        period: 'MONTHLY'
      });
    }

    return NextResponse.json(catData);

  } catch (error: any) {
    console.error('API Error /api/categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
