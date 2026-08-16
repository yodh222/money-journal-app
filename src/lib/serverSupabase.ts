import { createClient } from '@supabase/supabase-js';

export function getServerSupabase(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    throw new Error('Missing Authorization header');
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
  
  return supabase;
}

// Helper to get active ledger id on the server side
export async function getServerLedgerId(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('ledger_members')
    .select('ledger_id')
    .eq('user_id', userId)
    .limit(1);
    
  if (error || !data || data.length === 0) {
    throw new Error('Ledger not found or database not setup');
  }
  
  return data[0].ledger_id;
}
