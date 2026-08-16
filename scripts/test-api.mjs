import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Parse .env.local to get Supabase credentials
const envPath = path.resolve(__dirname, '../.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
  console.error('❌ Gagal membaca .env.local. Pastikan file ada di root proyek.');
  process.exit(1);
}

const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2].trim();
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const API_BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('=== Memulai API Debugging & Testing (Terminal E2E) ===\n');
  
  // Dummy test user credentials
  const email = 'api_tester@dummy.com';
  const password = 'DummyPassword123!';
  
  console.log(`1. Mencoba Login sebagai: ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.session) {
    console.error('\n❌ Login Gagal. User test belum dibuat atau belum dikonfirmasi emailnya.');
    console.log('\n--- CARA MEMPERBAIKI ---');
    console.log('Agar script E2E ini dapat berjalan tanpa mengganggu data produksi Anda:');
    console.log('1. Buka Supabase Dashboard -> Menu "Authentication" -> "Users"');
    console.log(`2. Klik "Add User" -> "Create New User"`);
    console.log(`3. Masukkan Email: ${email}`);
    console.log(`4. Masukkan Password: ${password}`);
    console.log('5. Centang "Auto Confirm User?" dan simpan.');
    console.log('6. Setelah user terbuat, jalankan kembali script ini: `node scripts/test-api.mjs`\n');
    return;
  }

  const token = authData.session.access_token;
  console.log('✅ Login Berhasil! Token Bearer didapatkan.\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    // GET /api/dashboard
    console.log('2. Mengetes (GET /api/dashboard)...');
    const dashRes = await fetch(`${API_BASE_URL}/dashboard`, { headers });
    if (!dashRes.ok) throw new Error(await dashRes.text());
    const dashData = await dashRes.json();
    console.log(`   ✅ Berhasil fetch data dashboard (Wallets: ${dashData.wallets.length}).\n`);

    // POST /api/wallets
    console.log('3. Mengetes (POST /api/wallets)...');
    const walletRes = await fetch(`${API_BASE_URL}/wallets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Dompet Testing', type: 'E_WALLET', balance: 100000 })
    });
    if (!walletRes.ok) throw new Error(await walletRes.text());
    const newWallet = await walletRes.json();
    console.log(`   ✅ Dompet berhasil dibuat (ID: ${newWallet.id}).\n`);

    // POST /api/categories
    console.log('4. Mengetes (POST /api/categories)...');
    const catRes = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Kategori Test', type: 'EXPENSE', budget_limit: 50000 })
    });
    if (!catRes.ok) throw new Error(await catRes.text());
    const newCat = await catRes.json();
    console.log(`   ✅ Kategori berhasil dibuat (ID: ${newCat.id}).\n`);

    // POST /api/transactions
    console.log('5. Mengetes (POST /api/transactions)...');
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
    if (!txRes.ok) throw new Error(await txRes.text());
    const newTx = await txRes.json();
    console.log(`   ✅ Transaksi berhasil dibuat (ID: ${newTx.id}).\n`);

    console.log('🎉 SEMUA API ENDPOINT (BFF) BERJALAN DENGAN SEMPURNA!');

  } catch (err) {
    console.error('❌ E2E API Test Gagal:', err.message);
  }
}

runTests();
