import { NextResponse } from 'next/server';
import { telegramService } from '@/services/telegram.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Pastikan ini dari Telegram (hanya memproses jika ada message)
    if (body.message) {
      // Jalankan secara asynchronous agar webhook cepat merespons 200 OK ke Telegram
      telegramService.handleIncomingMessage(body.message).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
