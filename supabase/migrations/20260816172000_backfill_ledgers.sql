-- Backfill profiles and ledgers for existing users who don't have them
DO $$
DECLARE
  u RECORD;
  new_ledger_id UUID;
BEGIN
  FOR u IN SELECT * FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles) LOOP
    -- 1. Create Profile
    INSERT INTO public.profiles (id, full_name)
    VALUES (u.id, COALESCE(u.raw_user_meta_data->>'full_name', 'User'));
    
    -- 2. Create Default Ledger
    INSERT INTO public.ledgers (owner_id, name)
    VALUES (u.id, 'Buku Kas Pribadi')
    RETURNING id INTO new_ledger_id;

    -- 3. Add to Ledger Members
    INSERT INTO public.ledger_members (ledger_id, user_id, role)
    VALUES (new_ledger_id, u.id, 'owner');
  END LOOP;
END;
$$;
