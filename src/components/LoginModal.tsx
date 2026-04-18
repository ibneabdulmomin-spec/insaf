import React, { useState } from 'react';
import { Lock, Phone, User } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (role: 'admin' | 'user', identifier: string) => void;
  defaultRole?: 'admin' | 'user';
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, defaultRole }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>(defaultRole || 'user');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'admin') {
      if (identifier === '01609434924') {
        onLogin('admin', identifier);
      } else {
        setError('ভুল কোড!');
      }
    } else {
      if (identifier.length >= 10) {
        onLogin('user', identifier);
      } else {
        setError('সঠিক নম্বর দিন!');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"> <span className="text-2xl">×</span></button>
        <h2 className="text-2xl font-bold mb-6 text-[#064E3B]">লগইন করুন</h2>
        
        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('user')} className={`flex-1 py-2 font-bold rounded-lg text-sm ${activeTab === 'user' ? 'bg-[#064E3B] text-white' : 'bg-gray-100'}`}>ব্যবহারকারী</button>
          <button onClick={() => setActiveTab('admin')} className={`flex-1 py-2 font-bold rounded-lg text-sm ${activeTab === 'admin' ? 'bg-[#D4AF37] text-white' : 'bg-gray-100'}`}>অ্যাডমিন</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            {activeTab === 'user' ? <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} /> : <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />}
            <input 
              type={activeTab === 'admin' ? 'password' : 'text'}
              placeholder={activeTab === 'user' ? 'ফোন নম্বর' : 'অ্যাডমিন কোড'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#064E3B]/20"
            />
          </div>
          {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
          <button className="w-full py-4 bg-[#064E3B] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform">প্রবেশ করুন</button>
        </form>
      </div>
    </div>
  );
};
