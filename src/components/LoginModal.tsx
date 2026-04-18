import React, { useState } from 'react';
import { Lock, Phone, User } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (role: 'admin' | 'user', identifier: string) => void;
  onGoogleLogin?: () => void;
  defaultRole?: 'admin' | 'user';
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, onGoogleLogin, defaultRole }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>(defaultRole || 'user');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'admin') {
      if (identifier === '992244') {
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

        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">অথবা</span></div>
          </div>
          
          <button 
            onClick={onGoogleLogin}
            className="w-full py-3 px-4 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors bg-white font-bold text-gray-700"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            গুগল দিয়ে লগইন করুন
          </button>
        </div>
      </div>
    </div>
  );
};
