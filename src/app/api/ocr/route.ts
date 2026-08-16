import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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

    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY tidak ditemukan, menggunakan Mock Data');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json({
        total_amount: 150000,
        merchant_name: 'Supermarket Dummy',
        date: new Date().toISOString(),
        notes: `🤖 [Mock] Struk Belanja`,
        categoryHint: 'Makanan', 
        type: 'EXPENSE'
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Anda adalah asisten keuangan profesional. Baca struk belanja dari gambar yang dilampirkan ini, dan ekstrak informasi berikut:
1. Total Harga (angka murni, tanpa simbol mata uang).
2. Nama Toko/Merchant.
3. Tanggal transaksi (format YYYY-MM-DD).

Keluarkan hasil akhir HANYA dalam format JSON dengan struktur ini tanpa markdown apapun:
{
  "total_amount": 150000,
  "merchant_name": "Nama Toko",
  "date": "2023-12-31"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', text);
      return NextResponse.json({ error: 'Gagal mengekstrak data JSON dari gambar' }, { status: 500 });
    }

    // Adaptasi struktur balasan untuk web UI dan Telegram
    return NextResponse.json({
      total_amount: parsedData.total_amount || 0,
      amount: parsedData.total_amount || 0, // Fallback for Web UI
      merchant_name: parsedData.merchant_name || 'Tidak diketahui',
      notes: `🤖 [AI] Struk: ${parsedData.merchant_name || 'Tidak diketahui'}`,
      date: parsedData.date || new Date().toISOString(),
      categoryHint: 'Lainnya',
      type: 'EXPENSE'
    });

  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: 'Gagal memproses struk' }, { status: 500 });
  }
}
