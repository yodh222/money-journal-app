import { GoogleGenAI } from '@google/genai';

export const ocrService = {
  async processReceiptImage(base64Image: string, mimeType: string) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY tidak ditemukan, menggunakan Mock Data');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        total_amount: 150000,
        merchant_name: 'Supermarket Dummy',
        date: new Date().toISOString(),
        notes: `🤖 [Mock] Struk Belanja`,
        categoryHint: 'Makanan', 
        type: 'EXPENSE'
      };
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
      throw new Error('Gagal mengekstrak data JSON dari gambar');
    }

    return {
      total_amount: parsedData.total_amount || 0,
      amount: parsedData.total_amount || 0, // Fallback for Web UI
      merchant_name: parsedData.merchant_name || 'Tidak diketahui',
      notes: `🤖 [AI] Struk: ${parsedData.merchant_name || 'Tidak diketahui'}`,
      date: parsedData.date || new Date().toISOString(),
      categoryHint: 'Lainnya',
      type: 'EXPENSE'
    };
  }
};
