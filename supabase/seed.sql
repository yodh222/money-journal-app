-- seed.sql: Data Awal untuk Aplikasi Money Journal

-- 1. Bersihkan data (Optional, karena db reset otomatis membersihkan schema public, 
-- namun trigger auth kadang menyisakan data di auth.users)
-- (Kita asumsikan auth.users akan diurus dari dashboard jika ini remote, tapi untuk lokal kita bisa seed user)

DO $$ 
DECLARE
  v_user_id UUID := 'd5d9c750-f80e-4363-8a35-24e52b21c430';
  v_ledger_id UUID;
  v_wallet_cash UUID;
  v_wallet_bank UUID;
  v_cat_food UUID;
  v_cat_transport UUID;
  v_cat_salary UUID;
BEGIN
  -- Insert dummy user (Jika di environment lokal).
  -- Untuk remote, jika user sudah ada, ini akan error, jadi gunakan insert ignore atau catch.
  BEGIN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
      'api_tester@dummy.com', crypt('DummyPassword123!', gen_salt('bf')), NOW(), 
      '{"provider":"email","providers":["email"]}', '{"full_name":"API Tester"}', NOW(), NOW()
    );
  EXCEPTION WHEN unique_violation THEN
    -- User sudah ada, lanjut saja
  END;

  -- Trigger akan membuat profile dan ledger secara otomatis.
  -- Ambil ledger_id yang dibuat otomatis
  SELECT id INTO v_ledger_id FROM public.ledgers WHERE owner_id = v_user_id LIMIT 1;

  IF v_ledger_id IS NULL THEN
    RAISE EXCEPTION 'Ledger tidak ditemukan, trigger mungkin gagal.';
  END IF;

  -- 2. Seed Wallets (Dompet)
  INSERT INTO public.wallets (ledger_id, name, type, balance, currency) VALUES
  (v_ledger_id, 'Dompet Tunai', 'CASH', 500000, 'IDR') RETURNING id INTO v_wallet_cash;

  INSERT INTO public.wallets (ledger_id, name, type, balance, currency) VALUES
  (v_ledger_id, 'Rekening BCA', 'BANK_ACCOUNT', 5000000, 'IDR') RETURNING id INTO v_wallet_bank;

  -- 3. Seed Categories (Kategori)
  INSERT INTO public.categories (ledger_id, name, type, icon, color) VALUES
  (v_ledger_id, 'Makanan & Minuman', 'EXPENSE', 'Utensils', '#EF4444') RETURNING id INTO v_cat_food;

  INSERT INTO public.categories (ledger_id, name, type, icon, color) VALUES
  (v_ledger_id, 'Transportasi', 'EXPENSE', 'Car', '#3B82F6') RETURNING id INTO v_cat_transport;

  INSERT INTO public.categories (ledger_id, name, type, icon, color) VALUES
  (v_ledger_id, 'Gaji Bulanan', 'INCOME', 'Wallet', '#10B981') RETURNING id INTO v_cat_salary;

  -- 4. Seed Budgets (Anggaran)
  INSERT INTO public.budgets (ledger_id, category_id, amount, period) VALUES
  (v_ledger_id, v_cat_food, 2000000, 'MONTHLY');
  
  INSERT INTO public.budgets (ledger_id, category_id, amount, period) VALUES
  (v_ledger_id, v_cat_transport, 1000000, 'MONTHLY');

  -- 5. Seed Transactions (Transaksi)
  -- Pemasukan Gaji
  INSERT INTO public.transactions (ledger_id, wallet_id, category_id, amount, type, notes, created_by, transaction_date)
  VALUES (v_ledger_id, v_wallet_bank, v_cat_salary, 5000000, 'INCOME', 'Gaji bulan ini', v_user_id, NOW() - INTERVAL '5 days');

  -- Pengeluaran Makan
  INSERT INTO public.transactions (ledger_id, wallet_id, category_id, amount, type, notes, created_by, transaction_date)
  VALUES (v_ledger_id, v_wallet_cash, v_cat_food, -50000, 'EXPENSE', 'Makan siang Nasi Padang', v_user_id, NOW() - INTERVAL '2 days');

  -- Pengeluaran Transport
  INSERT INTO public.transactions (ledger_id, wallet_id, category_id, amount, type, notes, created_by, transaction_date)
  VALUES (v_ledger_id, v_wallet_bank, v_cat_transport, -150000, 'EXPENSE', 'Isi bensin', v_user_id, NOW() - INTERVAL '1 days');

  -- Transfer
  INSERT INTO public.transactions (ledger_id, wallet_id, destination_wallet_id, amount, type, notes, created_by, transaction_date)
  VALUES (v_ledger_id, v_wallet_bank, v_wallet_cash, -200000, 'TRANSFER', 'Tarik tunai ATM', v_user_id, NOW() - INTERVAL '12 hours');

END $$;
