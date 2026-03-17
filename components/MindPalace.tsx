'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { CardData } from '@/lib/data';

interface MindPalaceProps {
  savedCards: CardData[];
}

export default function MindPalace({ savedCards }: MindPalaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<{from: string, to: string}[]>([]);
  const [drawingFrom, setDrawingFrom] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [positions, setPositions] = useState<{x: number, y: number}[]>([]);

  useEffect(() => {
    // Simulate loading time for the skeleton to be visible
    const timer = setTimeout(() => {
      setPositions(savedCards.map(() => ({
        x: Math.random() * 200 + 50,
        y: Math.random() * 300 + 100
      })));
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [savedCards]);

  if (isLoading) {
    return (
      <div className="relative w-full h-full overflow-hidden p-8">
        <div className="absolute top-8 left-8 z-20 pointer-events-none">
          <div className="h-8 bg-indigo-900/20 rounded-md w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-indigo-900/10 rounded-md w-64 animate-pulse"></div>
        </div>
        
        {/* Skeleton Cards */}
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="absolute w-48 p-4 rounded-2xl backdrop-blur-md bg-white/40 border border-white/50 shadow-lg animate-pulse"
            style={{
              top: `${Math.random() * 60 + 20}%`,
              left: `${Math.random() * 60 + 10}%`,
            }}
          >
            <div className="h-3 bg-indigo-400/30 rounded-md w-1/2 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-indigo-900/20 rounded-md w-full"></div>
              <div className="h-3 bg-indigo-900/20 rounded-md w-5/6"></div>
              <div className="h-3 bg-indigo-900/20 rounded-md w-4/5"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (savedCards.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <h2 className="text-3xl font-space font-bold text-indigo-900 mb-4 tracking-tighter">Mind Palace Kosong.</h2>
          <p className="text-indigo-700/70 font-medium">Lu belum narik satupun kartu ke sini. Takut capek?</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden" ref={containerRef}>
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <h2 className="text-2xl font-space font-bold text-indigo-900 tracking-tighter">Mind Palace</h2>
        <p className="text-xs text-indigo-700/70 font-medium uppercase tracking-widest mt-1">
          Hubungkan titik-titiknya. Kalau bisa.
        </p>
      </div>

      {/* SVG for drawing lines between cards could go here, simplified for now */}
      
      {savedCards.map((card, i) => (
        <motion.div
          key={card.id}
          drag
          dragConstraints={containerRef}
          dragMomentum={false}
          initial={{ 
            x: positions[i]?.x || 100, 
            y: positions[i]?.y || 100,
            scale: 0 
          }}
          animate={{ scale: 1 }}
          className="absolute w-48 p-4 rounded-2xl backdrop-blur-md bg-white/40 border border-white/50 shadow-lg cursor-grab active:cursor-grabbing"
        >
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">{card.category}</div>
          <p className="text-sm font-medium text-indigo-900 leading-tight line-clamp-4">{card.hook}</p>
        </motion.div>
      ))}
    </div>
  );
}
