import { supabase } from '@/lib/supabaseClient';

export const walletService = {
  async createWallet(payload: {
    name: string;
    type: string;
    balance: number;
  }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Anda belum login');

    const { data, error } = await supabase.from('wallets').insert({
      user_id: session.user.id,
      ...payload,
    }).select().single();

    if (error) throw error;
    return data;
  },

  async getFirstWalletId() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Anda belum login');

    const { data, error } = await supabase.from('wallets')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1);
    
    if (error) throw error;
    return data?.[0]?.id || null;
  }
};
