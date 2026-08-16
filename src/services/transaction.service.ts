import { supabase } from '@/lib/supabaseClient';
import { ledgerService } from './ledger.service';

export const transactionService = {
  async createTransaction(payload: {
    wallet_id: string;
    category_id: string | null;
    amount: number;
    notes?: string;
    tags?: string[];
  }) {
    const ledgerId = await ledgerService.getActiveLedgerId();
    if (!ledgerId) throw new Error('Tidak dapat menemukan Buku Kas (Ledger).');

    // Due to the new schema, tags are not an array in transactions, they are managed via transaction_tags.
    // For simplicity right now, we can extract tags and just insert transaction.
    // Then we insert tags into `tags` and link them in `transaction_tags`.
    
    const { tags, ...transactionData } = payload;

    const { data: tx, error: txError } = await supabase.from('transactions').insert({
      ledger_id: ledgerId,
      ...transactionData,
    }).select().single();

    if (txError) throw txError;

    if (tags && tags.length > 0) {
      // Process tags
      for (const t of tags) {
        // Find or create tag
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

    return tx;
  }
};
