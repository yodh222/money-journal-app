import { NextResponse } from 'next/server';
import { telegramService } from '@/services/telegram.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Pastikan ini dari Telegram (hanya memproses jika ada message)
    if (body.message) {
      // Pada Vercel Serverless, kita WAJIB melakukan 'await' pada semua proses 
      // sebelum mengembalikan response. Jika tidak, proses akan langsung dimatikan 
      // oleh Vercel secara paksa sebelum bot sempat membalas pesan.
      await telegramService.handleIncomingMessage(body.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
