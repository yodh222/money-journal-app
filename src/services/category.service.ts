import { supabase } from '@/lib/supabaseClient';
import { ledgerService } from './ledger.service';

export const categoryService = {
  async createCategory(payload: {
    name: string;
    type: string;
    budget_limit: number;
  }) {
    const ledgerId = await ledgerService.getActiveLedgerId();
    if (!ledgerId) throw new Error('Tidak dapat menemukan Buku Kas (Ledger).');

    // Currently we map budget_limit locally to insert to categories if we want backward compat 
    // or we insert to budgets table. The new schema keeps budgets in a separate table, but for now 
    // we only have category table logic. Wait, in the new schema, I removed `budget_limit` from categories! 
    // No, wait, did I? Let me check the new schema. 
    // In the new schema, `budget_limit` is in `budgets` table. 
    // So here we insert category, then insert budget.

    const { data: catData, error: catError } = await supabase.from('categories').insert({
      ledger_id: ledgerId,
      name: payload.name,
      type: payload.type,
    }).select().single();

    if (catError) throw catError;

    if (payload.budget_limit > 0) {
      await supabase.from('budgets').insert({
        ledger_id: ledgerId,
        category_id: catData.id,
        amount: payload.budget_limit,
        period: 'MONTHLY'
      });
    }

    return catData;
  },

  async findCategoryByName(name: string) {
    const ledgerId = await ledgerService.getActiveLedgerId();
    if (!ledgerId) return null;

    const { data, error } = await supabase.from('categories')
      .select('id')
      .eq('ledger_id', ledgerId)
      .ilike('name', name)
      .limit(1);
      
    if (error) throw error;
    return data?.[0]?.id || null;
  },
  
  async getAnyCategory() {
    const ledgerId = await ledgerService.getActiveLedgerId();
    if (!ledgerId) return null;

    const { data, error } = await supabase.from('categories')
      .select('id')
      .eq('ledger_id', ledgerId)
      .limit(1);
      
    if (error) throw error;
    return data?.[0]?.id || null;
  }
};
