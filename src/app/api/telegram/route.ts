import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { telegramService } from '@/services/telegram.service';

export const maxDuration = 60; // Izinkan fungsi berjalan hingga 60 detik (batas maksimal Vercel Hobby)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Pastikan ini dari Telegram
    if (body.message) {
      // Menggunakan fitur next/server `after()` agar Vercel mengeksekusi 
      // ini di latar belakang tanpa memblokir balasan 200 OK ke Telegram.
      after(async () => {
        try {
          await telegramService.handleIncomingMessage(body.message);
        } catch (e) {
          console.error("Background error:", e);
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
