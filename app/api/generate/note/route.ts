import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

function cleanAndParseJSON(text: string) {
  try {
    // Hapus markdown code blocks jika LLM mengembalikannya (misal: ```json ... ```)
    const cleanedText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error('Failed to parse JSON:', text);
    throw new Error('Gagal memproses respons dari AI. Format tidak sesuai.');
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const topic = formData.get('topic') as string || '';
    const provider = formData.get('provider') as string;
    const model = formData.get('model') as string;
    const extractedText = formData.get('extractedText') as string || '';

    // 1. Validasi Input Awal
    if (!provider || !model) {
      return NextResponse.json({ error: 'Provider dan model harus diisi.' }, { status: 400 });
    }

    if (!topic.trim() && !extractedText) {
      return NextResponse.json({ error: 'Topik atau file dokumen harus diberikan.' }, { status: 400 });
    }

    if (provider !== 'groq') {
      return NextResponse.json({ error: 'Endpoint ini hanya untuk Groq.' }, { status: 400 });
    }

    // 2. Konstruksi Prompt
    let finalPrompt = `
      Buatkan catatan komprehensif, terstruktur, dan mendalam tentang topik: "${topic || 'Ringkasan Dokumen'}".
      
      Gunakan gaya bahasa yang tajam, sedikit sarkas, tapi sangat edukatif (seperti gaya penjelasan psikologi kognitif).
      
      Format output HARUS berupa JSON murni dengan struktur persis seperti ini:
      {
        "title": "Judul Catatan yang Menarik",
        "content": "Isi catatan lengkap, gunakan paragraf yang jelas. Boleh pakai bullet points."
      }
    `;

    if (extractedText) {
      finalPrompt += `\n\nGunakan konteks tambahan dari dokumen berikut:\n${extractedText.slice(0, 15000)}\n`;
    }

    let resultJson = null;

    // 3. Eksekusi API Groq
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY belum dikonfigurasi di environment variables.');
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: finalPrompt }],
        response_format: { type: 'json_object' }
      })
    });
    
    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Groq API Error');
      } else {
        const text = await res.text();
        throw new Error(`Groq API Error (${res.status}): ${text.substring(0, 100)}`);
      }
    }
    
    const data = await res.json();
    const text = data.choices[0]?.message?.content || '{}';
    resultJson = cleanAndParseJSON(text);

    // 4. Validasi Output Akhir
    if (!resultJson || !resultJson.title || !resultJson.content) {
      throw new Error('AI tidak mengembalikan format JSON yang sesuai.');
    }

    return NextResponse.json(resultJson);
  } catch (error: any) {
    console.error('Generate Note Error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan internal server.' }, { status: 500 });
  }
}
