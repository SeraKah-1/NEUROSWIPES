import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { noteContent, provider, model } = await req.json();

    const prompt = `
      Ekstrak informasi dari catatan berikut menjadi 3-5 kartu flashcard (spaced repetition).
      
      Catatan:
      """
      ${noteContent}
      """
      
      Aturan pembuatan kartu:
      1. "hook": Kalimat pendek yang memancing rasa penasaran, anomali, atau pertanyaan (max 2 kalimat).
      2. "content": Penjelasan tajam dan langsung ke intinya (max 3 kalimat).
      3. "type": Pilih salah satu dari: "theory", "joke", "trivia".
      4. "category": Kategori singkat (1-2 kata, misal: "psikologi", "bias", "sains").
      
      Format output HARUS berupa JSON murni (tanpa markdown block) dengan struktur object yang memiliki properti "cards" berisi array of objects persis seperti ini:
      {
        "cards": [
          {
            "hook": "...",
            "content": "...",
            "type": "theory",
            "category": "..."
          }
        ]
      }
    `;

    let resultJson = null;

    if (provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: { 
          responseMimeType: 'application/json'
        }
      });
      
      const text = response.text || '{"cards": []}';
      const parsed = JSON.parse(text);
      resultJson = parsed.cards || parsed;
      
    } else if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          // Groq JSON mode requires the prompt to explicitly mention JSON
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
      // Groq json_object might wrap the array in an object like { "cards": [...] }
      const parsed = JSON.parse(data.choices[0].message.content);
      resultJson = Array.isArray(parsed) ? parsed : (parsed.cards || parsed.data || Object.values(parsed)[0]);
    } else {
      throw new Error('Provider tidak valid');
    }

    return NextResponse.json(resultJson);
  } catch (error: any) {
    console.error('Generate Cards Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
