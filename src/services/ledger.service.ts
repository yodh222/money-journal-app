import { supabase } from '@/lib/supabaseClient';

export const ledgerService = {
  /**
   * Mendapatkan ledger pertama yang diakses oleh pengguna yang sedang login.
   * Dalam skenario yang lebih kompleks, ini bisa disesuaikan untuk mengambil 
   * ledger aktif yang dipilih pengguna dari dropdown.
   */
  async getActiveLedgerId() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Anda belum login');

    // Cari dari ledger_members
    const { data, error } = await supabase
      .from('ledger_members')
      .select('ledger_id')
      .eq('user_id', session.user.id)
      .limit(1);

    if (error) throw error;
    return data?.[0]?.ledger_id || null;
  }
};
