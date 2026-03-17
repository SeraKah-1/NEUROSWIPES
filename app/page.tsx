'use client';

import { useState } from 'react';
import CardStack from '@/components/CardStack';
import MindPalace from '@/components/MindPalace';
import ProfileReceipt from '@/components/ProfileReceipt';
import Navigation from '@/components/Navigation';
import Generator from '@/components/Generator';
import Notes from '@/components/Notes';
import { MOCK_CARDS, CardData } from '@/lib/data';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'feed' | 'palace' | 'profile' | 'generator' | 'notes'>('feed');
  const [deck, setDeck] = useState<CardData[]>(MOCK_CARDS);
  const [savedCards, setSavedCards] = useState<CardData[]>([]);
  const [stats, setStats] = useState({
    swipes: { paham: 0, lupa: 0, ragu: 0 },
    timeSpent: {} as Record<string, number>,
    savedCategories: {} as Record<string, number>
  });

  const handleSwipe = (direction: 'paham' | 'lupa' | 'ragu', card: CardData, elapsedTime: number) => {
    setStats(prev => ({
      ...prev,
      swipes: {
        ...prev.swipes,
        [direction]: prev.swipes[direction] + 1
      },
      timeSpent: {
        ...prev.timeSpent,
        [card.id]: elapsedTime // Now stores total session time at the moment of swipe
      }
    }));

    // Algoritma Space Repetition Sederhana
    if (direction === 'lupa') {
      setDeck(prev => {
        const newDeck = [...prev];
        newDeck.push({ ...card, id: `${card.id}-review-${Date.now()}` }); 
        return newDeck;
      });
    } else if (direction === 'ragu') {
      setDeck(prev => {
        const newDeck = [...prev];
        newDeck.push({ ...card, id: `${card.id}-review-${Date.now()}` });
        return newDeck;
      });
    }
  };

  const handleSave = (card: CardData, elapsedTime: number) => {
    if (!savedCards.find(c => c.hook === card.hook)) {
      setSavedCards(prev => [...prev, card]);
    }
    setStats(prev => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [card.id]: elapsedTime // Now stores total session time at the moment of save
      },
      savedCategories: {
        ...prev.savedCategories,
        [card.category]: (prev.savedCategories[card.category] || 0) + 1
      }
    }));
  };

  const handleCardsGenerated = (newCards: CardData[]) => {
    // Tambahkan kartu baru ke awal antrean (setelah kartu yang sedang aktif)
    setDeck(prev => {
      // Untuk MVP, kita taruh di akhir deck saja biar gampang, 
      // atau bisa di-insert di index tertentu kalau mau langsung muncul.
      return [...prev, ...newCards];
    });
    setActiveTab('feed'); // Otomatis pindah ke feed buat nge-swipe kartu baru
  };

  return (
    <main className="h-screen w-full bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] overflow-hidden flex flex-col font-sans relative">
      {/* Pastel animated background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-pink-200/40 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-teal-100/40 blur-[80px] animate-pulse pointer-events-none" style={{ animationDelay: '4s' }} />

      <div className="flex-1 relative overflow-hidden z-10">
        {activeTab === 'feed' && (
          <CardStack 
            cards={deck} 
            onSwipe={handleSwipe} 
            onSave={handleSave} 
          />
        )}
        {activeTab === 'palace' && (
          <MindPalace savedCards={savedCards} />
        )}
        {activeTab === 'generator' && (
          <Generator onNoteCreated={() => setActiveTab('notes')} />
        )}
        {activeTab === 'notes' && (
          <Notes onCardsGenerated={handleCardsGenerated} />
        )}
        {activeTab === 'profile' && (
          <ProfileReceipt stats={stats} />
        )}
      </div>
      
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}
