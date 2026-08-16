-- Fix infinite recursion in ledger_members policy

DROP POLICY IF EXISTS "View ledger members" ON public.ledger_members;

-- The simplest and safest policy to avoid recursion: 
-- A user can view their own membership records.
CREATE POLICY "View ledger members" ON public.ledger_members 
FOR SELECT USING (auth.uid() = user_id);

-- Also fix "View ledgers" if it has the same issue, though it queries ledger_members 
-- from ledgers, which is fine as long as ledger_members doesn't query back.
