import { supabase } from '@/lib/supabaseClient';

export const transactionService = {
  async createTransaction(payload: {
    wallet_id: string;
    category_id: string | null;
    amount: number;
    notes?: string;
    tags?: string[];
  }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Anda belum login');

    const { data, error } = await supabase.from('transactions').insert({
      user_id: session.user.id,
      ...payload,
    }).select().single();

    if (error) throw error;
    return data;
  }
};
