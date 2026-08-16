import { supabase } from '@/lib/supabaseClient';
import { ledgerService } from './ledger.service';

export interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  actionable_steps: any[];
  is_read: boolean;
  created_at: string;
}

export const aiInsightService = {
  async getInsights(): Promise<AIInsight[]> {
    const ledgerId = await ledgerService.getActiveLedgerId();
    if (!ledgerId) return [];

    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('ledger_id', ledgerId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('Could not find the table')) return [];
      throw error;
    }
    return data || [];
  },

  async markAsRead(insightId: string) {
    const { error } = await supabase
      .from('ai_insights')
      .update({ is_read: true })
      .eq('id', insightId);
      
    if (error) throw error;
  },

  // Mocking the generation of insights for demonstration
  async generateMockInsightIfNeeded() {
    const ledgerId = await ledgerService.getActiveLedgerId();
    if (!ledgerId) return;

    try {
      const { data: existing, error } = await supabase
        .from('ai_insights')
        .select('id')
        .eq('ledger_id', ledgerId)
        .limit(1);

      if (error) {
        if (error.message.includes('Could not find the table')) {
          console.warn('ai_insights table missing, skipping insights generation.');
          return;
        }
        throw error;
      }

      if (!existing || existing.length === 0) {
        await supabase.from('ai_insights').insert({
          ledger_id: ledgerId,
          insight_type: 'SAVING_OPPORTUNITY',
          title: 'Pengeluaran Makanan Terlalu Tinggi',
          description: 'Anda telah menghabiskan 40% lebih banyak dari bulan lalu untuk kategori Makanan. Cobalah memasak di rumah minggu ini.',
          actionable_steps: [
            { label: 'Setel Target Anggaran Makanan', action: 'SET_BUDGET' }
          ]
        });
      }
    } catch (err) {
      console.error('generateMockInsightIfNeeded error:', err);
    }
  }
};
