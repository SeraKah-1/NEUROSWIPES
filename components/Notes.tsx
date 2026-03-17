'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, Layers, BookOpen, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CardData } from '@/lib/data';

const GEMINI_MODELS = [
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
  { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash-Lite' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' }
];

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function Notes({ onCardsGenerated }: { onCardsGenerated: (cards: CardData[]) => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [provider, setProvider] = useState<'gemini' | 'groq'>('gemini');
  const [model, setModel] = useState(GEMINI_MODELS[0].id);
  const [groqModels, setGroqModels] = useState<{id: string}[]>([]);

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

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setNotes(data || []);
    } catch (err: any) {
      if (err.message.includes('FetchError')) {
        setError('Koneksi ke Supabase gagal. Pastikan URL dan Key di .env sudah benar.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error: dbError } = await supabase.from('notes').delete().eq('id', id);
      if (dbError) throw dbError;
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const handleExtractCards = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setGeneratingId(note.id);
    
    try {
      const res = await fetch('/api/generate/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          noteContent: note.content, 
          provider: provider, 
          model: model 
        })
      });

      const contentType = res.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server error (${res.status}). Silakan coba lagi nanti.`);
      }

      if (!res.ok) throw new Error(data.error || 'Gagal ekstrak kartu');

      // Tambahkan ID unik ke setiap kartu
      const cardsWithId = data.map((c: any) => ({
        ...c,
        id: `gen-${note.id}-${Math.random().toString(36).substr(2, 9)}`,
        noteId: note.id,
        noteTitle: note.title
      }));

      // Opsional: Simpan ke tabel generated_cards di Supabase
      // await supabase.from('generated_cards').insert(
      //   cardsWithId.map(c => ({ note_id: note.id, hook: c.hook, content: c.content, type: c.type, category: c.category }))
      // );

      onCardsGenerated(cardsWithId);
      alert(`${cardsWithId.length} kartu berhasil diekstrak dan ditambahkan ke Feed!`);
      
    } catch (err: any) {
      alert('Gagal ekstrak: ' + err.message);
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center p-6 overflow-y-auto">
        <div className="w-full max-w-md mb-6">
          <h2 className="text-2xl font-space font-bold text-indigo-950 tracking-tighter">Notes</h2>
          <p className="text-xs text-indigo-800/60 font-medium uppercase tracking-widest mt-1">Arsip Memori</p>
        </div>
        <div className="w-full max-w-md space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-5 shadow-lg animate-pulse">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="h-6 bg-indigo-900/20 rounded-md w-2/3"></div>
                <div className="h-6 w-6 bg-indigo-900/10 rounded-md shrink-0"></div>
              </div>
              <div className="h-3 bg-indigo-900/10 rounded-md w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center p-6 overflow-y-auto">
      <div className="w-full max-w-md mb-6">
        <h2 className="text-2xl font-space font-bold text-indigo-950 tracking-tighter">Notes</h2>
        <p className="text-xs text-indigo-800/60 font-medium uppercase tracking-widest mt-1">Arsip Memori</p>
      </div>

      {error && (
        <div className="w-full max-w-md mb-4 p-4 bg-red-100/80 text-red-800 text-sm rounded-2xl flex items-start gap-3 backdrop-blur-sm border border-red-200">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Database Error</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

      {notes.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
          <BookOpen size={48} className="mb-4 text-indigo-900" />
          <p className="font-medium text-indigo-900">Belum ada catatan.</p>
          <p className="text-xs mt-1">Gunakan Generator buat bikin catatan baru.</p>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4 pb-24">
          {notes.map((note) => (
            <motion.div 
              key={note.id}
              layout
              onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
              className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-5 shadow-lg cursor-pointer hover:bg-white/50 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-bold text-indigo-950 leading-tight">{note.title}</h3>
                <button 
                  onClick={(e) => handleDelete(note.id, e)}
                  className="text-rose-400 hover:text-rose-600 p-1 shrink-0 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <p className="text-xs text-indigo-900/40 mt-2 font-mono">
                {new Date(note.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>

              {expandedId === note.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-indigo-900/10"
                >
                  <div className="text-sm text-indigo-900/80 leading-relaxed whitespace-pre-wrap mb-6">
                    {note.content}
                  </div>
                  
                  <div className="mb-4 p-3 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl">
                    <p className="text-[10px] font-bold text-indigo-900/70 uppercase tracking-wider mb-2">Pengaturan Ekstraksi</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-indigo-900/50 uppercase tracking-wider mb-1">Provider</label>
                        <select 
                          value={provider}
                          onChange={(e) => {
                            e.stopPropagation();
                            setProvider(e.target.value as 'gemini' | 'groq');
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-white/50 border border-indigo-100 rounded-md p-1.5 text-xs text-indigo-950 focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
                        >
                          <option value="gemini">Gemini</option>
                          <option value="groq">Groq</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-indigo-900/50 uppercase tracking-wider mb-1">Model</label>
                        <select 
                          value={model}
                          onChange={(e) => {
                            e.stopPropagation();
                            setModel(e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-white/50 border border-indigo-100 rounded-md p-1.5 text-xs text-indigo-950 focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
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
                  </div>
                  
                  <button 
                    onClick={(e) => handleExtractCards(note, e)}
                    disabled={generatingId === note.id}
                    className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    {generatingId === note.id ? (
                      <span className="animate-pulse">Mengekstrak...</span>
                    ) : (
                      <>
                        <Layers size={16} />
                        Ekstrak ke Kartu
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
