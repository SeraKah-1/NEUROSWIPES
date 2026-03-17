'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'motion/react';
import { CardData } from '@/lib/data';
import { Brain, Check, X, HelpCircle, ArrowDown, ArrowLeft, Layers, Play, Clock } from 'lucide-react';

interface CardStackProps {
  cards: CardData[];
  onSwipe: (direction: 'paham' | 'lupa' | 'ragu', card: CardData, timeSpent: number) => void;
  onSave: (card: CardData, timeSpent: number) => void;
}

export default function CardStack({ cards, onSwipe, onSave }: CardStackProps) {
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [currentIndexes, setCurrentIndexes] = useState<Record<string, number>>({});
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [deckStats, setDeckStats] = useState<Record<string, { paham: number, lupa: number, ragu: number }>>({});

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeDeckId && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeDeckId, sessionStartTime]);

  const startDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    setSessionStartTime(Date.now());
    setElapsedTime(0);
    setDeckStats(prev => ({ ...prev, [deckId]: { paham: 0, lupa: 0, ragu: 0 } }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Group cards by noteId
  const decks = useMemo(() => {
    const grouped = cards.reduce((acc, card) => {
      const key = card.noteId || 'general';
      if (!acc[key]) {
        acc[key] = {
          id: key,
          title: card.noteTitle || 'Kartu Lepas (General)',
          cards: []
        };
      }
      acc[key].cards.push(card);
      return acc;
    }, {} as Record<string, { id: string, title: string, cards: CardData[] }>);
    return Object.values(grouped);
  }, [cards]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-4xl font-space font-bold text-indigo-900 mb-4 tracking-tighter">Kosong.</h2>
        <p className="text-indigo-700/70 font-medium">Belum ada kartu. Bikin dulu di menu Generator/Notes.</p>
      </div>
    );
  }

  // DECK LIST VIEW
  if (!activeDeckId) {
    return (
      <div className="w-full h-full flex flex-col items-center p-6 overflow-y-auto">
        <div className="w-full max-w-md mb-6">
          <h2 className="text-2xl font-space font-bold text-indigo-950 tracking-tighter">Rak Kartu</h2>
          <p className="text-xs text-indigo-800/60 font-medium uppercase tracking-widest mt-1">Pilih tumpukan untuk belajar</p>
        </div>
        
        <div className="w-full max-w-md grid grid-cols-2 gap-4 pb-24">
          {decks.map(deck => {
            const currentIndex = currentIndexes[deck.id] || 0;
            const remainingCards = deck.cards.length - currentIndex;
            
            if (remainingCards <= 0) return null; // Hide finished decks

            return (
              <div 
                key={deck.id}
                className="relative aspect-[3/4] group cursor-pointer"
                onClick={() => startDeck(deck.id)}
              >
                {/* Stack effect layers - Dynamic fanning out */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm border border-white/40 rounded-2xl origin-bottom-left transition-all duration-300 group-hover:translate-x-4 group-hover:-translate-y-4 group-hover:rotate-6 flex items-start p-4 shadow-sm">
                  {deck.cards[2] && <p className="text-[10px] text-indigo-900/30 font-medium line-clamp-3">{deck.cards[2].hook}</p>}
                </div>
                <div className="absolute inset-0 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl origin-bottom-left transition-all duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:rotate-3 flex items-start p-4 shadow-md">
                  {deck.cards[1] && <p className="text-[10px] text-indigo-900/50 font-medium line-clamp-3">{deck.cards[1].hook}</p>}
                </div>
                
                {/* Main card */}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-300 z-10 group-hover:scale-[1.02]">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Layers size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-800/60 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-full">{remainingCards} Kartu</span>
                    </div>
                    <h3 className="font-bold text-indigo-950 text-sm line-clamp-2 leading-tight mb-2">{deck.title}</h3>
                    {deck.cards[0] && (
                      <div className="bg-white/50 rounded-lg p-2 border border-indigo-50">
                        <p className="text-[10px] text-indigo-900/70 line-clamp-2 italic">"{deck.cards[0].hook}"</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      startDeck(deck.id);
                    }}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors shadow-md active:scale-95"
                  >
                    <Play size={14} fill="currentColor" />
                    Review All
                  </button>
                </div>
              </div>
            );
          })}
          
          {decks.every(d => (d.cards.length - (currentIndexes[d.id] || 0)) <= 0) && (
            <div className="col-span-2 text-center py-12">
              <p className="text-indigo-900/50 font-medium">Semua tumpukan sudah selesai dipelajari!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STUDY VIEW
  const activeDeck = decks.find(d => d.id === activeDeckId);
  if (!activeDeck) {
    setActiveDeckId(null);
    return null;
  }

  const currentIndex = currentIndexes[activeDeckId] || 0;
  
  if (currentIndex >= activeDeck.cards.length) {
    const stats = deckStats[activeDeckId] || { paham: 0, lupa: 0, ragu: 0 };
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 w-full max-w-md mx-auto">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6">
          <Check size={40} />
        </div>
        <h2 className="text-4xl font-space font-bold text-indigo-900 mb-2 tracking-tighter">Selesai!</h2>
        <p className="text-indigo-700/70 font-medium mb-8">Lu udah nyelesaiin tumpukan ini.</p>
        
        <div className="w-full bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm mb-8">
          <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-widest mb-4">Ringkasan Sesi</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/50 rounded-xl p-3 text-left">
              <p className="text-[10px] text-indigo-900/50 font-bold uppercase tracking-wider mb-1">Kartu Direview</p>
              <p className="text-2xl font-space font-bold text-indigo-950">{activeDeck.cards.length}</p>
            </div>
            <div className="bg-white/50 rounded-xl p-3 text-left">
              <p className="text-[10px] text-indigo-900/50 font-bold uppercase tracking-wider mb-1">Waktu Belajar</p>
              <p className="text-2xl font-space font-bold text-indigo-950">{formatTime(elapsedTime)}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg p-2 px-3">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-2"><Check size={14} /> Paham</span>
              <span className="text-sm font-bold text-emerald-900">{stats.paham}</span>
            </div>
            <div className="flex justify-between items-center bg-rose-50/50 rounded-lg p-2 px-3">
              <span className="text-xs font-bold text-rose-700 flex items-center gap-2"><X size={14} /> Lupa</span>
              <span className="text-sm font-bold text-rose-900">{stats.lupa}</span>
            </div>
            <div className="flex justify-between items-center bg-amber-50/50 rounded-lg p-2 px-3">
              <span className="text-xs font-bold text-amber-700 flex items-center gap-2"><HelpCircle size={14} /> Ragu</span>
              <span className="text-sm font-bold text-amber-900">{stats.ragu}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setActiveDeckId(null)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
        >
          <ArrowLeft size={18} />
          Kembali ke Rak
        </button>
      </div>
    );
  }

  const handleCardSwipe = (dir: 'paham' | 'lupa' | 'ragu', card: CardData, time: number) => {
    onSwipe(dir, card, elapsedTime); // Pass total session time
    setCurrentIndexes(prev => ({ ...prev, [activeDeckId]: (prev[activeDeckId] || 0) + 1 }));
    setDeckStats(prev => ({
      ...prev,
      [activeDeckId]: {
        ...prev[activeDeckId],
        [dir]: prev[activeDeckId][dir] + 1
      }
    }));
  };

  const handleCardSave = (card: CardData, time: number) => {
    onSave(card, elapsedTime); // Pass total session time
    setCurrentIndexes(prev => ({ ...prev, [activeDeckId]: (prev[activeDeckId] || 0) + 1 }));
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden perspective-1000">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-900/5 z-50">
        <motion.div 
          className="h-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / activeDeck.cards.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header for Study View */}
      <div className="absolute top-0 left-0 w-full p-6 pt-8 z-50 flex items-center justify-between">
        <button 
          onClick={() => setActiveDeckId(null)}
          className="w-10 h-10 bg-white/50 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center text-indigo-900 hover:bg-white/80 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="bg-white/50 backdrop-blur-md border border-white/50 rounded-full px-3 py-1.5 shadow-sm flex items-center gap-1.5">
            <Clock size={12} className="text-indigo-900/50" />
            <p className="text-[10px] font-bold text-indigo-900/70 tracking-wider font-mono">
              {formatTime(elapsedTime)}
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur-md border border-white/50 rounded-full px-3 py-1.5 shadow-sm">
            <p className="text-[10px] font-bold text-indigo-900/70 uppercase tracking-wider">
              {currentIndex + 1} / {activeDeck.cards.length}
            </p>
          </div>
        </div>
      </div>

      {activeDeck.cards.map((card, index) => {
        if (index < currentIndex) return null;
        if (index > currentIndex + 2) return null; // Only render top 3 cards

        const isFront = index === currentIndex;
        return (
          <SwipeableCard
            key={card.id}
            card={card}
            isFront={isFront}
            index={index - currentIndex}
            onSwipe={(dir, time) => handleCardSwipe(dir, card, time)}
            onSave={(time) => handleCardSave(card, time)}
          />
        );
      })}
    </div>
  );
}

interface SwipeableCardProps {
  card: CardData;
  isFront: boolean;
  index: number;
  onSwipe: (direction: 'paham' | 'lupa' | 'ragu', timeSpent: number) => void;
  onSave: (timeSpent: number) => void;
}

function SwipeableCard({ card, isFront, index, onSwipe, onSave }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const scale = useTransform(y, [0, 300], [1, 0.85]);
  
  // Indicators opacity
  const pahamOpacity = useTransform(x, [50, 150], [0, 1]);
  const lupaOpacity = useTransform(x, [-50, -150], [0, 1]);
  const raguOpacity = useTransform(y, [-50, -150], [0, 1]);
  const saveOpacity = useTransform(y, [50, 200], [0, 1]);

  const [isFlipped, setIsFlipped] = useState(false);
  const startTime = useRef(0);

  useEffect(() => {
    if (isFront) {
      startTime.current = Date.now();
    }
  }, [isFront]);

  const handleDragEnd = (e: any, info: PanInfo) => {
    const timeSpent = Date.now() - startTime.current;
    const threshold = 120;
    const saveThreshold = 180;

    if (info.offset.x > threshold) {
      onSwipe('paham', timeSpent);
    } else if (info.offset.x < -threshold) {
      onSwipe('lupa', timeSpent);
    } else if (info.offset.y < -threshold) {
      onSwipe('ragu', timeSpent);
    } else if (info.offset.y > saveThreshold) {
      onSave(timeSpent);
    } else {
      // Reset position if threshold not met
      x.set(0);
      y.set(0);
    }
  };

  // Visual stacking effect
  const yOffset = index * 20;
  const scaleOffset = 1 - index * 0.05;

  return (
    <motion.div
      style={{
        x: isFront ? x : 0,
        y: isFront ? y : yOffset,
        rotate: isFront ? rotate : 0,
        scale: isFront ? scale : scaleOffset,
        zIndex: 10 - index,
      }}
      drag={isFront ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      // High resistance for dragging down (saving) to trigger IKEA effect
      dragElastic={{ top: 0.2, bottom: 0.05, left: 0.2, right: 0.2 }}
      onDragEnd={handleDragEnd}
      onClick={() => isFront && setIsFlipped(true)}
      className={`absolute w-[90%] max-w-sm aspect-[3/4] rounded-[2rem] p-8 flex flex-col justify-center
        backdrop-blur-xl bg-white/30 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
        ${isFront ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}
        transition-colors duration-500
      `}
    >
      {/* Indicators */}
      {isFront && (
        <>
          <motion.div style={{ opacity: pahamOpacity }} className="absolute top-8 right-8 bg-emerald-400/80 text-white p-3 rounded-full backdrop-blur-md">
            <Check size={32} strokeWidth={3} />
          </motion.div>
          <motion.div style={{ opacity: lupaOpacity }} className="absolute top-8 left-8 bg-rose-400/80 text-white p-3 rounded-full backdrop-blur-md">
            <X size={32} strokeWidth={3} />
          </motion.div>
          <motion.div style={{ opacity: raguOpacity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-amber-400/80 text-white p-3 rounded-full backdrop-blur-md">
            <HelpCircle size={32} strokeWidth={3} />
          </motion.div>
          <motion.div style={{ opacity: saveOpacity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500/80 text-white p-6 rounded-full backdrop-blur-md flex flex-col items-center">
            <Brain size={48} strokeWidth={2} className="mb-2" />
            <span className="font-space font-bold text-sm tracking-widest uppercase">Mind Palace</span>
          </motion.div>
        </>
      )}

      <div className="relative z-10 h-full flex flex-col justify-center">
        {!isFlipped ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="font-space text-4xl md:text-5xl font-bold text-indigo-950 leading-[1.1] tracking-tighter mb-6">
              {card.hook}
            </h2>
            <p className="text-indigo-800/60 font-medium text-sm uppercase tracking-widest animate-pulse mt-12">
              Tap untuk memecahkan ilusi
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="font-sans text-xl md:text-2xl text-indigo-900 font-medium leading-relaxed">
              {card.content}
            </p>
            <div className="mt-12 flex justify-center gap-4 text-indigo-800/40">
              <div className="flex flex-col items-center gap-1">
                <ArrowDown size={20} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Tarik Berat<br/>Simpan</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
