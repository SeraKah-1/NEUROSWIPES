'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { GoogleGenAI, Type } from '@google/genai';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const extractTextFromPDF = async (file: File) => {
  const pdfjsLib = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
    if (fullText.length > 20000) {
      fullText = fullText.slice(0, 20000);
      break;
    }
  }
  return fullText;
};

const GEMINI_MODELS = [
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
  { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash-Lite' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' }
];

export default function Generator({ onNoteCreated }: { onNoteCreated: () => void }) {
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'groq'>('gemini');
  const [model, setModel] = useState(GEMINI_MODELS[0].id);
  const [groqModels, setGroqModels] = useState<{id: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (provider === 'groq' && groqModels.length === 0) {
      fetch('/api/models/groq')
        .then(async res => {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return res.json();
          } else {
            const text = await res.text();
            throw new Error(`Server error (${res.status})`);
          }
        })
        .then(data => {
          if (data.data) {
            setGroqModels(data.data);
            setModel(data.data[0].id);
          } else if (data.error) {
            setError(data.error);
          }
        })
        .catch(() => setError('Gagal mengambil model Groq. Pastikan GROQ_API_KEY sudah di-set.'));
    } else if (provider === 'gemini') {
      setModel(GEMINI_MODELS[0].id);
    }
  }, [provider, groqModels.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFileName(selectedFile.name);
    setFile(selectedFile);
    setError('');
  };

  const handleGenerate = async () => {
    if (!topic && !file) {
      setError('Isi topik atau upload file dulu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let generatedTitle = '';
      let generatedContent = '';

      if (provider === 'gemini') {
        const promptText = `
          Buatkan catatan komprehensif, terstruktur, dan mendalam tentang topik: "${topic || 'Ringkasan Dokumen'}".
          
          Gunakan gaya bahasa yang tajam, sedikit sarkas, tapi sangat edukatif (seperti gaya penjelasan psikologi kognitif).
          
          Format output HARUS berupa JSON murni dengan struktur persis seperti ini:
          {
            "title": "Judul Catatan yang Menarik",
            "content": "Isi catatan lengkap, gunakan paragraf yang jelas. Boleh pakai bullet points."
          }
        `;

        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });
        const parts: any[] = [{ text: promptText }];
        
        if (file) {
          const base64 = await fileToBase64(file);
          const base64Data = base64.split(',')[1];
          const mimeType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'text/plain');
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType
            }
          });
        }

        const response = await ai.models.generateContent({
          model: model,
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Judul Catatan yang Menarik" },
                content: { type: Type.STRING, description: "Isi catatan lengkap, gunakan paragraf yang jelas. Boleh pakai bullet points." }
              },
              required: ["title", "content"]
            }
          }
        });

        const text = response.text || '{}';
        const cleanedText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const resultJson = JSON.parse(cleanedText);
        generatedTitle = resultJson.title;
        generatedContent = resultJson.content;

      } else if (provider === 'groq') {
        let extractedText = '';
        if (file) {
          if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            extractedText = await extractTextFromPDF(file);
          } else {
            extractedText = await file.text();
          }
        }

        const formData = new FormData();
        formData.append('topic', topic);
        formData.append('provider', provider);
        formData.append('model', model);
        if (extractedText) {
          formData.append('extractedText', extractedText);
        }

        const res = await fetch('/api/generate/note', {
          method: 'POST',
          body: formData
        });

        const contentType = res.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          if (res.status === 413) {
            throw new Error('File terlalu besar. Maksimal ukuran file adalah 4MB.');
          }
          throw new Error(`Server error (${res.status}). Silakan coba lagi nanti.`);
        }

        if (!res.ok) throw new Error(data.error || 'Gagal generate catatan');
        
        generatedTitle = data.title;
        generatedContent = data.content;
      }

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('notes')
        .insert([{ title: generatedTitle, content: generatedContent, topic }]);

      if (dbError) {
        console.error('Supabase error:', dbError);
        // Fallback or show warning if Supabase is not configured
        if (dbError.message.includes('FetchError')) {
          throw new Error('Supabase belum dikonfigurasi. Cek .env lu.');
        }
        throw new Error(dbError.message);
      }

      setTopic('');
      setFile(null);
      setFileName('');
      onNoteCreated();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl p-6 font-sans animate-pulse"
        >
          <div className="mb-6 text-center">
            <div className="h-8 bg-indigo-900/20 rounded-md w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-indigo-900/10 rounded-md w-1/3 mx-auto"></div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="h-4 bg-indigo-900/10 rounded-md w-1/4 mb-2"></div>
              <div className="h-24 bg-indigo-900/5 rounded-xl w-full"></div>
            </div>

            <div>
              <div className="h-4 bg-indigo-900/10 rounded-md w-1/3 mb-2"></div>
              <div className="h-16 bg-indigo-900/5 rounded-xl w-full"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-indigo-900/10 rounded-md w-1/2 mb-2"></div>
                <div className="h-10 bg-indigo-900/5 rounded-xl w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-indigo-900/10 rounded-md w-1/2 mb-2"></div>
                <div className="h-10 bg-indigo-900/5 rounded-xl w-full"></div>
              </div>
            </div>

            <div className="h-12 bg-indigo-600/50 rounded-xl w-full mt-4"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl p-6 font-sans"
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-space font-bold text-indigo-950 tracking-tighter">Generator</h2>
          <p className="text-xs text-indigo-800/60 font-medium uppercase tracking-widest mt-1">Suntikkan Pengetahuan</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100/80 text-red-800 text-xs rounded-xl flex items-start gap-2 backdrop-blur-sm border border-red-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-wider mb-2">Topik / Prompt</label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Jelaskan Stoicism untuk anak gen Z..."
              className="w-full bg-white/50 border border-indigo-100 rounded-xl p-3 text-sm text-indigo-950 placeholder:text-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 resize-none h-24"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-wider mb-2">Upload Konteks (Opsional)</label>
            <div className="relative">
              <input 
                type="file" 
                accept=".txt,.md,.csv,.pdf" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full bg-white/50 border border-indigo-100 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-indigo-900/50 hover:bg-white/70 transition-colors">
                {fileName ? (
                  <>
                    <FileText size={24} className="mb-2 text-indigo-500" />
                    <span className="text-xs font-medium truncate max-w-[200px]">{fileName}</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="mb-2" />
                    <span className="text-xs font-medium">Klik atau Drag file (.txt, .md, .pdf)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-wider mb-2">Otak (Provider)</label>
              <select 
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'gemini' | 'groq')}
                className="w-full bg-white/50 border border-indigo-100 rounded-xl p-2.5 text-sm text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              >
                <option value="gemini">Gemini</option>
                <option value="groq">Groq</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-900/70 uppercase tracking-wider mb-2">Kapasitas (Model)</label>
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-white/50 border border-indigo-100 rounded-xl p-2.5 text-sm text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              >
                {provider === 'gemini' ? (
                  GEMINI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)
                ) : (
                  groqModels.length > 0 ? (
                    groqModels.map(m => <option key={m.id} value={m.id}>{m.id}</option>)
                  ) : (
                    <option value="">Loading...</option>
                  )
                )}
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
          >
            {loading ? (
              <span className="animate-pulse">Mengekstrak...</span>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Catatan
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
