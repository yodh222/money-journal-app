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

    const { data, error } = await supabase.from('wallets').insert({
      ledger_id: ledgerId,
      name: body.name,
      type: body.type,
      balance: body.balance
    }).select().single();

    if (error) throw error;

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('API Error /api/wallets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
