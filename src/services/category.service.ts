import { supabase } from '@/lib/supabaseClient';

export const categoryService = {
  async createCategory(payload: {
    name: string;
    type: string;
    budget_limit: number;
  }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Anda belum login');

    const { data, error } = await supabase.from('categories').insert({
      user_id: session.user.id,
      ...payload,
    }).select().single();

    if (error) throw error;
    return data;
  },

  async findCategoryByName(name: string) {
    const { data, error } = await supabase.from('categories')
      .select('id')
      .eq('name', name)
      .limit(1);
      
    if (error) throw error;
    return data?.[0]?.id || null;
  },
  
  async getAnyCategory() {
    const { data, error } = await supabase.from('categories')
      .select('id')
      .limit(1);
      
    if (error) throw error;
    return data?.[0]?.id || null;
  }
};
