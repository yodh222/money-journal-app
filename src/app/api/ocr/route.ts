import { NextRequest, NextResponse } from 'next/server';
import { ocrService } from '@/services/ocr.service';

export const maxDuration = 60; // Izinkan fungsi berjalan hingga 60 detik

export async function POST(req: NextRequest) {
  try {
    let base64Image = '';
    let mimeType = 'image/jpeg';
    
    // Support for both JSON (Telegram) and FormData (Web UI)
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      if (!body.image) {
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      }
      // body.image format: data:image/jpeg;base64,/9j/4AAQ...
      const parts = body.image.split(',');
      mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      base64Image = parts[1];
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
      mimeType = file.type || 'image/jpeg';
      const arrayBuffer = await file.arrayBuffer();
      base64Image = Buffer.from(arrayBuffer).toString('base64');
    }

    const result = await ocrService.processReceiptImage(base64Image, mimeType);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: 'Gagal memproses struk' }, { status: 500 });
  }
}
