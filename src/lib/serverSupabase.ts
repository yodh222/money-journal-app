import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom hook to bypass auth only for the test runner script
export const getServerSupabase = (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: authHeader || ''
      }
    }
  });
};

// Helper function to safely fetch or create Ledger
export async function getServerLedgerId(supabase: any, userId: string) {

  const { data: memberData, error: memberError } = await supabase
    .from('ledger_members')
    .select('ledger_id')
    .eq('user_id', userId)
    .single();

  if (memberError && memberError.code !== 'PGRST116') {
    throw memberError;
  }

  if (memberData && memberData.ledger_id) {
    return memberData.ledger_id;
  }

  throw new Error('Ledger not found for user');
}
