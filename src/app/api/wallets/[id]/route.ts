import { NextResponse } from 'next/server';
import { getServerSupabase, getServerLedgerId } from '@/lib/serverSupabase';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getServerSupabase(request);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ledgerId = await getServerLedgerId(supabase, user.id);
    const body = await request.json();

    const { data, error } = await supabase.from('wallets')
      .update({
        name: body.name,
        type: body.type,
        balance: body.balance
      })
      .eq('id', id)
      .eq('ledger_id', ledgerId)
      .select().single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServerSupabase(request);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ledgerId = await getServerLedgerId(supabase, user.id);

    const { error } = await supabase.from('wallets')
      .delete()
      .eq('id', id)
      .eq('ledger_id', ledgerId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
