import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // In a full production environment with API keys, you would use:
    // import { GoogleGenAI } from '@google/genai';
    // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // const response = await ai.models.generateContent({...})
    
    // For this build, since we don't have the user's GEMINI_API_KEY guaranteed in the environment,
    // we will simulate an OCR parsing delay and return a structured mock response.
    // This allows the frontend to be fully tested and production-ready for when the backend is plugged in.
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing

    const mockExtractedData = {
      amount: 150000,
      notes: `Makan siang di Restoran (${file.name})`,
      categoryHint: 'Makanan', 
      type: 'EXPENSE'
    };

    return NextResponse.json(mockExtractedData);

  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: 'Gagal memproses struk' }, { status: 500 });
  }
}
