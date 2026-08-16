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

    const { tags, ...transactionData } = body;

    const { data: tx, error: txError } = await supabase.from('transactions').insert({
      ledger_id: ledgerId,
      ...transactionData,
    }).select().single();

    if (txError) throw txError;

    if (tags && tags.length > 0) {
      for (const t of tags) {
        let tagId;
        const { data: existingTag } = await supabase.from('tags')
          .select('id').eq('ledger_id', ledgerId).eq('name', t).single();
        
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const { data: newTag } = await supabase.from('tags').insert({
            ledger_id: ledgerId, name: t
          }).select().single();
          if (newTag) tagId = newTag.id;
        }

        if (tagId) {
          await supabase.from('transaction_tags').insert({
            transaction_id: tx.id,
            tag_id: tagId
          });
        }
      }
    }

    return NextResponse.json(tx);

  } catch (error: any) {
    console.error('API Error /api/transactions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
