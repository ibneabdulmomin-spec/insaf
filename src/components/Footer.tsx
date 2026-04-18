import React from 'react';
import { Home, Info, Phone, UserPlus, Facebook, MessageCircle, MoreVertical, FileText } from 'lucide-react';

export function Footer({ isDarkMode, scrollToSection, openModal }: { isDarkMode: boolean, scrollToSection: (id: string) => void, openModal: (id: string) => void }) {
  return (
    <footer className={`fixed bottom-0 left-0 w-full z-40 py-2 border-t transition-colors duration-500 ${isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white text-[#064E3B] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-1">
          {[
            { onClick: () => scrollToSection('home'), icon: <Home size={20} strokeWidth={2.5} />, label: 'হোম' },
            { onClick: () => scrollToSection('explore'), icon: <Info size={20} strokeWidth={2.5} />, label: 'পরিচিতি' },
            { onClick: () => scrollToSection('contact'), icon: <Phone size={20} strokeWidth={2.5} />, label: 'যোগাযোগ' },
            { onClick: () => openModal('reports-search'), icon: <FileText size={20} strokeWidth={2.5} />, label: 'রিপোর্ট' },
          ].map((item, idx) => (
            <button 
              key={idx} 
              onClick={item.onClick} 
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 p-2 rounded-2xl transition-all text-[#064E3B] text-[10px] font-bold ${isDarkMode ? 'text-gray-300' : ''}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
