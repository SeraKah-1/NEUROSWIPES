'use client';

import { Layers, BrainCircuit, Fingerprint, Sparkles, BookOpen } from 'lucide-react';

interface NavigationProps {
  activeTab: 'feed' | 'palace' | 'profile' | 'generator' | 'notes';
  setActiveTab: (tab: 'feed' | 'palace' | 'profile' | 'generator' | 'notes') => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="flex items-center justify-between p-2 rounded-full backdrop-blur-xl bg-white/40 border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
        <NavButton 
          active={activeTab === 'feed'} 
          onClick={() => setActiveTab('feed')}
          icon={<Layers size={20} />}
          label="Feed"
        />
        <NavButton 
          active={activeTab === 'palace'} 
          onClick={() => setActiveTab('palace')}
          icon={<BrainCircuit size={20} />}
          label="Palace"
        />
        <NavButton 
          active={activeTab === 'generator'} 
          onClick={() => setActiveTab('generator')}
          icon={<Sparkles size={20} />}
          label="Generator"
        />
        <NavButton 
          active={activeTab === 'notes'} 
          onClick={() => setActiveTab('notes')}
          icon={<BookOpen size={20} />}
          label="Notes"
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
          icon={<Fingerprint size={20} />}
          label="Profile"
        />
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 ${
        active ? 'bg-indigo-950 text-white shadow-md scale-110' : 'text-indigo-900/50 hover:bg-white/50 hover:text-indigo-900'
      }`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
