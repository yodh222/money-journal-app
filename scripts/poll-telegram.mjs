import fs from 'fs';
import path from 'path';

// Fungsi sederhana untuk membaca token dari .env.local
function getEnvToken() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/TELEGRAM_BOT_TOKEN=(.*)/);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

const TOKEN = getEnvToken();
const LOCAL_WEBHOOK_URL = 'http://localhost:3000/api/telegram';

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN tidak ditemukan di .env.local');
  process.exit(1);
}

let lastUpdateId = 0;

console.log('🤖 Menjalankan Telegram Polling (Local Dev Mode)...');
console.log(`Meneruskan pesan ke: ${LOCAL_WEBHOOK_URL}`);
console.log('Tekan Ctrl+C untuk berhenti.\n');

async function poll() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    
    if (response.ok) {
      const data = await response.json();
      
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        
        // Teruskan pesan ke API Next.js kita
        if (update.message) {
          console.log(`[Pesan Diterima] Dari: ${update.message.from?.first_name} | Meneruskan ke Webhook...`);
          
          await fetch(LOCAL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update)
          }).catch(err => console.error('Gagal meneruskan ke localhost:', err.message));
        }
      }
    }
  } catch (error) {
    console.error('Polling error:', error.message);
  } finally {
    // Loop terus menerus
    setTimeout(poll, 1000);
  }
}

// Mulai
poll();
