import { supabase } from '@/lib/supabaseClient'; // Make sure this is the admin client or has access if running server-side
import { createClient } from '@supabase/supabase-js';

// We need a service role client to bypass RLS for background processing (like webhooks)
const getAdminSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // fallback to anon if service role missing, though RLS might block
  );
};

export const telegramService = {
  async handleIncomingMessage(message: any) {
    const chatId = message.chat.id;
    const text = message.text || '';
    
    // 1. Tangani perintah /start
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length > 1) {
        const userId = parts[1];
        return await this.linkAccount(chatId, userId, message.from.username);
      }
      return this.sendMessage(chatId, 'Selamat datang di Money Journal Bot! 💰\n\nUntuk menghubungkan akun Anda, kembali ke Web Money Journal, buka Pengaturan, dan klik tombol "Hubungkan Telegram".');
    }

    // Cek apakah akun sudah terhubung
    const supabaseAdmin = getAdminSupabase();
    const { data: link, error } = await supabaseAdmin
      .from('telegram_links')
      .select('user_id')
      .eq('telegram_chat_id', chatId)
      .single();

    if (error || !link) {
      return this.sendMessage(chatId, 'Akun Anda belum terhubung! Silakan tautkan akun Anda terlebih dahulu dari website Money Journal.');
    }

    const userId = link.user_id;

    // 2. Tangani kiriman Foto Struk
    if (message.photo && message.photo.length > 0) {
      await this.sendMessage(chatId, 'Menganalisis struk Anda menggunakan AI... ⏳');
      return await this.processReceipt(message.photo, chatId, userId);
    }

    // Teks biasa
    return this.sendMessage(chatId, 'Kirimkan foto struk belanja Anda, dan AI akan mencatatnya otomatis ke buku kas Anda!');
  },

  async linkAccount(chatId: number, userId: string, username?: string) {
    const supabaseAdmin = getAdminSupabase();
    
    // Cek user ada
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId).catch(() => ({ data: null }));
    
    const { error } = await supabaseAdmin
      .from('telegram_links')
      .upsert({ 
        user_id: userId, 
        telegram_chat_id: chatId,
        telegram_username: username 
      }, { onConflict: 'telegram_chat_id' });

    if (error) {
      console.error('Link Error:', error);
      return this.sendMessage(chatId, 'Gagal menghubungkan akun. Pastikan ID unik yang dimasukkan benar.');
    }

    return this.sendMessage(chatId, '✅ Akun berhasil terhubung!\n\nSekarang Anda bisa langsung mengirimkan foto struk belanja ke sini, dan sistem otomatis akan mencatatnya.');
  },

  async processReceipt(photos: any[], chatId: number, userId: string) {
    try {
      // Ambil resolusi gambar terbesar (elemen terakhir di array)
      const photo = photos[photos.length - 1];
      const fileId = photo.file_id;

      // 1. Dapatkan file_path dari Telegram
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) throw new Error('Token bot tidak dikonfigurasi.');

      const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
      const fileData = await fileRes.json();
      
      if (!fileData.ok) throw new Error('Gagal mendapatkan file dari Telegram');
      
      const filePath = fileData.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

      // 2. Unduh file menjadi ArrayBuffer/Base64
      const imageRes = await fetch(fileUrl);
      const arrayBuffer = await imageRes.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = 'image/jpeg'; // Telegram usually sends JPG

      // 3. Panggil Gemini AI OCR (Gunakan fungsi yang sudah kita buat sebelumnya)
      // We'll construct a mock request to our own API or import the OCR logic.
      // Since it's server-side, it's better to isolate the OCR logic to a reusable function.
      // For now, we'll fetch our absolute internal route, OR abstract OCR logic.
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      const ocrResponse = await fetch(`${appUrl}/api/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: `data:${mimeType};base64,${base64Image}` })
      });

      if (!ocrResponse.ok) {
        throw new Error('Gagal menganalisis gambar dengan AI.');
      }

      const parsedData = await ocrResponse.json();

      // 4. Cari dompet default (atau dompet pertama milik user)
      const supabaseAdmin = getAdminSupabase();
      
      // Karena ini server webhook, kita harus menggunakan service role atau RLS bypass, 
      // kita harus query ledgers berdasarkan user_id, dll.
      // Untuk sederhananya, panggil endpoint internal kita dengan bearer token?
      // Tapi kita tidak punya access token user. Jadi kita query manual di database via admin.
      const { data: ledgers } = await supabaseAdmin.from('ledgers').select('id').eq('user_id', userId).limit(1);
      if (!ledgers || ledgers.length === 0) throw new Error('Buku kas tidak ditemukan.');
      const ledgerId = ledgers[0].id;

      // Cari wallet default
      let { data: wallets } = await supabaseAdmin.from('wallets').select('id, name').eq('ledger_id', ledgerId).limit(1);
      if (!wallets || wallets.length === 0) throw new Error('Tidak ada dompet tersedia. Buat dompet dulu di web.');
      const wallet = wallets[0];

      // Insert Transaksi
      const { data: newTx, error: txError } = await supabaseAdmin.from('transactions').insert({
        ledger_id: ledgerId,
        wallet_id: wallet.id,
        // Default kategori ke UUID sembarang sementara atau biarkan null jika diijinkan? 
        // Skema lama memaksa not-null di UI, tapi database mungkin membolehkan null, atau kita query kategori.
        amount: parsedData.total_amount || 0,
        transaction_date: parsedData.date ? new Date(parsedData.date).toISOString() : new Date().toISOString(),
        notes: `🤖 [Telegram] Struk: ${parsedData.merchant_name || 'Tidak diketahui'}`,
      }).select().single();

      if (txError) throw txError;

      // Kurangi Saldo Wallet
      const amount = parsedData.total_amount || 0;
      await supabaseAdmin.rpc('decrement_wallet_balance', {
        w_id: wallet.id,
        amount: amount
      }); // Fallback if RPC doesn't exist: manually update
      // Actually we'll just read and update
      const { data: wData } = await supabaseAdmin.from('wallets').select('balance').eq('id', wallet.id).single();
      if (wData) {
        await supabaseAdmin.from('wallets').update({ balance: wData.balance - amount }).eq('id', wallet.id);
      }

      return this.sendMessage(chatId, `✅ **Transaksi Berhasil Dicatat!**\n\nToko: ${parsedData.merchant_name || 'Tidak diketahui'}\nTotal: Rp ${amount.toLocaleString('id-ID')}\nDompet: ${wallet.name}`);
      
    } catch (err: any) {
      console.error('Process Receipt Error:', err);
      return this.sendMessage(chatId, `❌ Gagal memproses struk: ${err.message}`);
    }
  },

  async sendMessage(chatId: number, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;
    
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  }
};
