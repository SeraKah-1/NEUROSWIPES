'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface ProfileReceiptProps {
  stats: {
    swipes: { paham: number; lupa: number; ragu: number };
    timeSpent: Record<string, number>;
    savedCategories: Record<string, number>;
  };
}

export default function ProfileReceipt({ stats }: ProfileReceiptProps) {
  const [receiptId, setReceiptId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading time for the skeleton to be visible
    const timer = setTimeout(() => {
      setReceiptId(Math.random().toString(36).substring(7).toUpperCase());
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm bg-white/60 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl p-8 font-mono relative overflow-hidden animate-pulse">
          <div className="text-center mb-8 border-b border-indigo-900/10 pb-6">
            <div className="h-8 bg-indigo-900/20 rounded-md w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-indigo-900/10 rounded-md w-1/4 mx-auto"></div>
          </div>

          <div className="space-y-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-indigo-900/10 rounded-md w-1/2"></div>
                <div className="h-4 bg-indigo-900/20 rounded-md w-8"></div>
              </div>
            ))}
          </div>

          <div className="border-t border-indigo-900/10 pt-6">
            <div className="h-4 bg-indigo-900/10 rounded-md w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-indigo-900/20 rounded-md w-full"></div>
              <div className="h-4 bg-indigo-900/20 rounded-md w-5/6"></div>
              <div className="h-4 bg-indigo-900/20 rounded-md w-4/5"></div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="h-10 bg-indigo-900/20 rounded-full w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalSwipes = stats.swipes.paham + stats.swipes.lupa + stats.swipes.ragu;
  
  // Barnum Effect & Authority Heuristic logic
  const generateRoast = () => {
    if (totalSwipes === 0) return "Sistem belum punya cukup data buat nge-roast lu. Swipe dulu sana.";
    
    const avgTime = Object.values(stats.timeSpent).reduce((a, b) => a + b, 0) / (Object.keys(stats.timeSpent).length || 1);
    
    if (avgTime < 2000) {
      return "Lu butuh kurang dari 2 detik buat 'paham' teori kompleks. Lu resmi lebih delusional dari 94% populasi aplikasi ini. Kurangin overconfidence lu.";
    } else if (stats.swipes.lupa > stats.swipes.paham) {
      return "Rasio 'Lupa' lu mendominasi. Otak lu kayak saringan bocor. Tapi seenggaknya lu jujur, lebih baik dari 60% user yang pura-pura paham.";
    } else if (stats.swipes.ragu > 2) {
      return "Terlalu banyak 'Ragu-ragu'. Lu punya fear of commitment bahkan ke informasi. Berhenti overthinking.";
    }
    
    return "Lu butuh waktu lama buat mencerna kartu soal bias, tapi cepet banget nge-save kartu receh. Prioritas otak lu berantakan, persis kayak 87% manusia modern lainnya.";
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white/60 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl p-8 font-mono text-indigo-950 relative overflow-hidden"
      >
        {/* Receipt zig-zag top/bottom could be added with CSS, using simple border for now */}
        <div className="text-center mb-8 border-b border-indigo-900/20 pb-6">
          <h2 className="text-2xl font-bold tracking-tighter uppercase">Terminal Kognitif</h2>
          <p className="text-xs opacity-60 mt-1">ID: {receiptId}</p>
        </div>

        <div className="space-y-4 text-sm mb-8">
          <div className="flex justify-between">
            <span>TOTAL SWIPES</span>
            <span className="font-bold">{totalSwipes}</span>
          </div>
          <div className="flex justify-between">
            <span>ILUSI PEMAHAMAN (PAHAM)</span>
            <span className="font-bold">{stats.swipes.paham}</span>
          </div>
          <div className="flex justify-between">
            <span>REALITA (LUPA)</span>
            <span className="font-bold">{stats.swipes.lupa}</span>
          </div>
          <div className="flex justify-between">
            <span>CRISIS EKSISTENSIAL (RAGU)</span>
            <span className="font-bold">{stats.swipes.ragu}</span>
          </div>
        </div>

        <div className="border-t border-indigo-900/20 pt-6">
          <h3 className="text-xs font-bold opacity-50 mb-2 uppercase tracking-widest">Analisis Siluman</h3>
          <p className="text-sm leading-relaxed font-medium">
            {generateRoast()}
          </p>
        </div>

        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-indigo-950 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-indigo-900 transition-colors">
            Share Aib Kognitif
          </button>
        </div>
      </motion.div>
    </div>
  );
}
