import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''; // Copy from .env.local
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Copy from .env.local

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const API_BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('=== Memulai API Debugging & Testing ===');
  
  // 1. Authenticate to get Access Token
  // Ganti dengan email & password test anda
  const EMAIL = 'test@example.com';
  const PASSWORD = 'password123';
  
  console.log(`\n1. Login sebagai ${EMAIL}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

  if (authError || !authData.session) {
    console.error('❌ Login Gagal. Pastikan kredensial benar dan .env disetup di script ini.', authError);
    return;
  }

  const token = authData.session.access_token;
  console.log('✅ Login Berhasil! Token didapatkan.');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. GET /api/dashboard
  console.log('\n2. Mengambil data Dashboard (GET /api/dashboard)...');
  const dashRes = await fetch(`${API_BASE_URL}/dashboard`, { headers });
  if (!dashRes.ok) {
    console.error('❌ GET /api/dashboard Gagal:', await dashRes.text());
    return;
  }
  const dashData = await dashRes.json();
  console.log('✅ Berhasil fetch data dashboard. Jumlah Wallet:', dashData.wallets.length);

  // 3. POST /api/wallets (Create Wallet)
  console.log('\n3. Mengetes Pembuatan Dompet Baru (POST /api/wallets)...');
  const walletRes = await fetch(`${API_BASE_URL}/wallets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Dompet Testing API',
      type: 'E_WALLET',
      balance: 100000
    })
  });
  if (!walletRes.ok) {
    console.error('❌ POST /api/wallets Gagal:', await walletRes.text());
    return;
  }
  const newWallet = await walletRes.json();
  console.log('✅ Dompet berhasil dibuat dengan ID:', newWallet.id);

  // 4. POST /api/categories (Create Category)
  console.log('\n4. Mengetes Pembuatan Kategori Baru (POST /api/categories)...');
  const catRes = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Kategori Test API',
      type: 'EXPENSE',
      budget_limit: 50000
    })
  });
  if (!catRes.ok) {
    console.error('❌ POST /api/categories Gagal:', await catRes.text());
    return;
  }
  const newCat = await catRes.json();
  console.log('✅ Kategori berhasil dibuat dengan ID:', newCat.id);

  // 5. POST /api/transactions (Create Transaction)
  console.log('\n5. Mengetes Pencatatan Transaksi Baru (POST /api/transactions)...');
  const txRes = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      wallet_id: newWallet.id,
      category_id: newCat.id,
      amount: -10000,
      notes: 'Test API Transaction',
      tags: ['api-test']
    })
  });
  if (!txRes.ok) {
    console.error('❌ POST /api/transactions Gagal:', await txRes.text());
    return;
  }
  const newTx = await txRes.json();
  console.log('✅ Transaksi berhasil dibuat dengan ID:', newTx.id);

  console.log('\n🎉 SEMUA API ENDPOINT BERJALAN DENGAN BAIK!');
}

runTests();
