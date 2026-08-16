import { supabase } from '@/lib/supabaseClient';
import { ledgerService } from './ledger.service';

export const walletService = {
  async createWallet(payload: {
    name: string;
    type: string;
    balance: number;
  }) {
    const ledgerId = await ledgerService.getActiveLedgerId();
    if (!ledgerId) throw new Error('Tidak dapat menemukan Buku Kas (Ledger).');

    const { data, error } = await supabase.from('wallets').insert({
      ledger_id: ledgerId,
      ...payload,
    }).select().single();

    if (error) throw error;
    return data;
  },

  async getFirstWalletId() {
    const ledgerId = await ledgerService.getActiveLedgerId();
    if (!ledgerId) return null;

    const { data, error } = await supabase.from('wallets')
      .select('id')
      .eq('ledger_id', ledgerId)
      .limit(1);
    
    if (error) throw error;
    return data?.[0]?.id || null;
  }
};
