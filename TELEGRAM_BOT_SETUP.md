# 🤖 Panduan Setup Bot Telegram via Google Apps Script (GAS)

Dokumen ini berisi panduan dan *source code* lengkap untuk menjalankan Bot Telegram Money Journal Anda menggunakan Google Apps Script (GAS). Pendekatan ini dipilih karena GAS berjalan di server Google, 100% gratis, dan memiliki batas waktu eksekusi yang panjang (hingga 6 menit), sangat ideal untuk pemrosesan AI OCR Gemini yang butuh waktu lebih dari 10 detik.

---

## 1. Persiapan Kunci API
Sebelum memulai, pastikan Anda telah mengumpulkan informasi rahasia berikut:
- **TELEGRAM_TOKEN**: Token bot dari BotFather (contoh: `870271...`).
- **SUPABASE_URL**: URL proyek Supabase Anda (berawalan `https://...supabase.co`).
- **SUPABASE_SERVICE_KEY**: Kunci rahasia JWT Supabase Anda (berawalan `eyJhbGciOi...`). Ini BUKAN anon key.
- **GEMINI_API_KEY**: Kunci API Google Gemini Anda.

## 2. Pembuatan Proyek di Google Apps Script
1. Buka browser dan pergi ke [script.google.com](https://script.google.com/).
2. Klik tombol **New Project** (Proyek Baru) di sebelah kiri atas.
3. Hapus semua kode bawaan `function myFunction() {}` yang ada di editor.
4. Salin (copy) kode di bawah ini dan tempel (paste) ke editor GAS tersebut.
5. Ganti variabel konfigurasi di bagian paling atas kode dengan kunci rahasia milik Anda sendiri.

```javascript
// ==========================================
// KONFIGURASI (ISI DENGAN KUNCI ANDA)
// ==========================================
const TELEGRAM_TOKEN = "MASUKKAN_TOKEN_TELEGRAM_DI_SINI";
const SUPABASE_URL = "MASUKKAN_URL_SUPABASE_DI_SINI";
const SUPABASE_SERVICE_KEY = "MASUKKAN_SERVICE_ROLE_KEY_SUPABASE_DI_SINI";
const GEMINI_API_KEY = "MASUKKAN_KUNCI_GEMINI_DI_SINI";
const WEBHOOK_URL = "MASUKKAN_URL_WEB_APP_SETELAH_DEPLOY_DI_SINI"; 

// ==========================================
// KODE UTAMA (Jangan diubah kecuali paham)
// ==========================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.message) {
      handleMessage(data.message);
    }
  } catch (err) {
    console.error(err);
  }
  return ContentService.createTextOutput("OK");
}

function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || '';
  
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    if (parts.length > 1) {
      return linkAccount(chatId, parts[1], message.from.username);
    }
    return sendMessage(chatId, 'Selamat datang! Tautkan akun Anda via Web terlebih dahulu.');
  }

  const link = supabaseQuery('telegram_links', `telegram_chat_id=eq.${chatId}&select=user_id`);
  if (!link || link.length === 0) {
    return sendMessage(chatId, 'Akun belum terhubung! Silakan tautkan akun Anda.');
  }
  const userId = link[0].user_id;

  if (message.photo && message.photo.length > 0) {
    sendMessage(chatId, 'Menganalisis struk Anda menggunakan AI Google... ⏳');
    try {
      processReceipt(message.photo, chatId, userId);
    } catch (err) {
      sendMessage(chatId, '❌ Gagal memproses struk: ' + err.message);
    }
    return;
  }

  sendMessage(chatId, 'Kirimkan foto struk belanja Anda untuk dicatat otomatis!');
}

function processReceipt(photos, chatId, userId) {
  const fileId = photos[photos.length - 1].file_id;
  
  const fileRes = UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`);
  const filePath = JSON.parse(fileRes.getContentText()).result.file_path;
  const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
  
  const imageBlob = UrlFetchApp.fetch(fileUrl).getBlob();
  const base64Image = Utilities.base64Encode(imageBlob.getBytes());
  const mimeType = imageBlob.getContentType();

  const prompt = `Anda adalah asisten keuangan profesional. Baca struk belanja dari gambar ini.
Ekstrak dalam format JSON MURNI TANPA MARKDOWN:
{
  "total_amount": 150000,
  "merchant_name": "Nama Toko",
  "date": "YYYY-MM-DD"
}`;

  const geminiPayload = {
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { data: base64Image, mimeType: mimeType } }
      ]
    }],
    config: { responseMimeType: "application/json" }
  };

  const geminiRes = UrlFetchApp.fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(geminiPayload),
    muteHttpExceptions: true
  });

  const geminiData = JSON.parse(geminiRes.getContentText());
  if (geminiData.error) throw new Error(geminiData.error.message);
  
  let parsedData = JSON.parse(geminiData.candidates[0].content.parts[0].text);
  const amount = parsedData.total_amount || 0;

  const ledgers = supabaseQuery('ledgers', `user_id=eq.${userId}&select=id&limit=1`);
  if (!ledgers || ledgers.length === 0) throw new Error('Buku kas tidak ditemukan.');
  const ledgerId = ledgers[0].id;

  const wallets = supabaseQuery('wallets', `ledger_id=eq.${ledgerId}&select=id,name,balance&limit=1`);
  if (!wallets || wallets.length === 0) throw new Error('Dompet tidak ditemukan.');
  const wallet = wallets[0];

  const txPayload = {
    ledger_id: ledgerId,
    wallet_id: wallet.id,
    amount: amount,
    transaction_date: parsedData.date ? new Date(parsedData.date).toISOString() : new Date().toISOString(),
    notes: `🤖 [Telegram] Struk: ${parsedData.merchant_name || 'Tidak diketahui'}`,
  };
  
  supabaseInsert('transactions', txPayload);
  supabasePatch('wallets', `id=eq.${wallet.id}`, { balance: wallet.balance - amount });

  sendMessage(chatId, `✅ **Transaksi Berhasil Dicatat!**\n\nToko: ${parsedData.merchant_name || '?'}\nTotal: Rp ${amount.toLocaleString('id-ID')}\nDompet: ${wallet.name}`);
}

function linkAccount(chatId, userId, username) {
  const payload = {
    user_id: userId,
    telegram_chat_id: chatId,
    telegram_username: username || ""
  };
  
  const existing = supabaseQuery('telegram_links', `telegram_chat_id=eq.${chatId}&select=id`);
  if (existing && existing.length > 0) {
    supabasePatch('telegram_links', `telegram_chat_id=eq.${chatId}`, payload);
  } else {
    supabaseInsert('telegram_links', payload);
  }
  
  sendMessage(chatId, '✅ Akun berhasil terhubung!\nKirimkan foto struk sekarang.');
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function sendMessage(chatId, text) {
  UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' })
  });
}

function supabaseQuery(table, query) {
  const res = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` }
  });
  return JSON.parse(res.getContentText());
}

function supabaseInsert(table, data) {
  UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'post',
    headers: { 
      'apikey': SUPABASE_SERVICE_KEY, 
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    payload: JSON.stringify(data)
  });
}

function supabasePatch(table, query, data) {
  UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: 'patch',
    headers: { 
      'apikey': SUPABASE_SERVICE_KEY, 
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(data)
  });
}

function setWebhook() {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${WEBHOOK_URL}`;
  const response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}
```

## 3. Langkah Publikasi (Deploy) & Mengaktifkan Webhook
1. Klik tombol biru **Deploy** di kanan atas editor GAS -> Pilih **New deployment**.
2. Pada jenis (*type*), pilih ⚙️ **Web app**.
3. Di bagian akses (*Who has access*), pastikan Anda memilih **Anyone** (Siapa saja).
4. Klik **Deploy**. Jika Google meminta izin akses: klik *Review Permissions* -> Pilih akun Anda -> klik *Advanced* di bagian bawah -> pilih *Go to Untitled Project (unsafe)* -> *Allow*.
5. Salin URL **Web app URL** yang muncul.
6. Tempel (paste) URL tersebut ke dalam variabel `WEBHOOK_URL` di kode Anda (baris paling atas).
7. Di *toolbar* atas (samping tombol Run/Debug), pilih fungsi **setWebhook** dari kotak *dropdown*.
8. Klik **Run** (Jalankan).
9. Selesai! Bot Anda sekarang online sepenuhnya dan siap memproses struk kapan pun.
