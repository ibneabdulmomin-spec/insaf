import React, { useState, useEffect } from 'react';
import { Menu, X, Info, Activity, Target, ShieldCheck, UserPlus, Phone, MessageCircle, Mail, ChevronRight, Send, Facebook, Sun, Moon, Users, Wallet, ExternalLink, Lock, MoreVertical, FileText, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';

const logo = "https://i.postimg.cc/7LLRy4WW/Whats-App-Image-2026-03-16-at-7-29-35-PM.jpg";

// --- Data for Cards & Modals ---
const cardData = [
  {
    id: 'intro',
    title: 'পরিচিতি',
    icon: <Info size={32} />,
    content: (
      <div className="space-y-4 text-gray-700 leading-relaxed">
        <p className="text-lg font-medium text-[#064E3B]">ইনসাফ একটি নৈতিকতা, স্বচ্ছতা এবং পারস্পরিক আস্থার ভিত্তিতে গড়ে ওঠা একটি সামাজিক ও অর্থনৈতিক উদ্যোগ।</p>
        <p>এর মূল লক্ষ্য হলো মানুষের মাঝে ন্যায্যতা প্রতিষ্ঠা করা, হালাল ও সুশৃঙ্খল উপায়ে অর্থনৈতিক কার্যক্রম পরিচালনা করা, এবং একটি টেকসই ও কল্যাণমুখী সমাজ গঠন করা।</p>
        <div className="bg-[#D1FAE5]/30 p-4 rounded-lg border-l-4 border-[#D4AF37] my-6">
          <p className="italic font-medium text-[#064E3B]">"সফলতা শুধু লাভে নয়, বরং ন্যায়, সততা এবং মানুষের উপকারে।"</p>
        </div>
        <p>আমরা এমন একটি প্ল্যাটফর্ম তৈরি করতে চাই, যেখানে প্রত্যেক সদস্য নিরাপদ, সম্মানজনক এবং স্বচ্ছ পরিবেশে যুক্ত থাকতে পারে।</p>
      </div>
    )
  },
  {
    id: 'activities',
    title: 'কার্যক্রম',
    icon: <Activity size={32} />,
    content: (
      <div className="space-y-6 text-gray-700">
        <p>ইনসাফ বিভিন্ন ধরনের কার্যক্রম পরিচালনা করে, যা সময়ের প্রয়োজন অনুযায়ী সম্প্রসারিত হবে:</p>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-[#064E3B] flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> চলমান কার্যক্রম
            </h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>সদস্যভিত্তিক সঞ্চয় ও বিনিয়োগ কার্যক্রম</li>
              <li>অনলাইন ও অফলাইন পণ্যভিত্তিক উদ্যোগ</li>
              <li>ছোট উদ্যোক্তাদের সহায়তা</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-[#064E3B] flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> ভবিষ্যৎ পরিকল্পনা
            </h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>ইসলামিক ফাইন্যান্স ভিত্তিক বড় প্রকল্প</li>
              <li>ই-কমার্স প্ল্যাটফর্ম চালু</li>
              <li>প্রযুক্তিনির্ভর সেবা ও অ্যাপ ডেভেলপমেন্ট</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-[#064E3B] flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> সামাজিক কার্যক্রম
            </h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>দরিদ্র ও অসহায়দের সহায়তা</li>
              <li>শিক্ষামূলক উদ্যোগ</li>
              <li>সচেতনতা ও দাওয়াহ কার্যক্রম</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'goals',
    title: 'লক্ষ্য ও উদ্দেশ্য',
    icon: <Target size={32} />,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="mb-4">ইনসাফের লক্ষ্য শুধুমাত্র একটি প্রতিষ্ঠান গঠন নয়, বরং একটি আদর্শ সিস্টেম তৈরি করা। আমাদের প্রধান উদ্দেশ্যসমূহ:</p>
        <ul className="space-y-3">
          {[
            'একটি স্বচ্ছ ও জবাবদিহিমূলক অর্থনৈতিক প্ল্যাটফর্ম গড়ে তোলা',
            'সদস্যদের মধ্যে আস্থা, ভ্রাতৃত্ব এবং সহযোগিতা বৃদ্ধি করা',
            'হালাল ও ইসলামিক নীতিমালার আলোকে সকল কার্যক্রম পরিচালনা করা',
            'যুবসমাজকে উদ্যোক্তা হিসেবে গড়ে তোলা',
            'দীর্ঘমেয়াদে একটি শক্তিশালী ও টেকসই নেটওয়ার্ক তৈরি করা'
          ].map((goal, idx) => (
            <li key={idx} className="flex items-start gap-3 bg-[#FDFCF0] p-3 rounded-lg border border-[#D4AF37]/20">
              <div className="mt-0.5 text-[#D4AF37]"><ChevronRight size={18} /></div>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  },
  {
    id: 'why',
    title: 'কেন ইনসাফ?',
    icon: <ShieldCheck size={32} />,
    content: (
      <div className="space-y-4 text-gray-700">
        <p className="mb-4">ইনসাফে যুক্ত হওয়ার মাধ্যমে আপনি একটি নিরাপদ ও নৈতিক কমিউনিটির অংশ হবেন:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'স্বচ্ছতা ও জবাবদিহিতা', desc: 'প্রতিটি পদক্ষেপে শতভাগ স্বচ্ছতা নিশ্চিত করা হয়।' },
            { title: 'হালাল ও নৈতিক', desc: 'ইসলামিক নীতিমালার ভিত্তিতে পরিচালিত কার্যক্রম।' },
            { title: 'সম্মিলিত উন্নতি', desc: 'একা নয়, বরং সবাইকে সাথে নিয়ে এগিয়ে যাওয়ার প্রত্যয়।' },
            { title: 'ভবিষ্যৎমুখী', desc: 'দীর্ঘমেয়াদী ও টেকসই পরিকল্পনা নিয়ে কাজ করা।' },
            { title: 'নিরাপদ প্ল্যাটফর্ম', desc: 'সদস্যদের বিনিয়োগ ও তথ্যের সর্বোচ্চ নিরাপত্তা।' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-10 h-10 mx-auto bg-[#D1FAE5] rounded-full flex items-center justify-center text-[#064E3B] mb-2 font-bold">
                {idx + 1}
              </div>
              <h4 className="font-bold text-[#064E3B] mb-1">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'join',
    title: 'সদস্য হোন',
    icon: <UserPlus size={32} />,
    content: (
      <div className="space-y-6 text-gray-700 h-full flex flex-col">
        <div className="bg-[#FDFCF0] p-4 rounded-xl border border-[#D4AF37]/30">
          <h4 className="font-bold text-[#064E3B] mb-2">সদস্য হওয়ার নিয়ম:</h4>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>নির্ধারিত Google Form পূরণ করুন</li>
            <li>সঠিক তথ্য প্রদান করুন এবং রেফারেন্স উল্লেখ করুন</li>
            <li>সাবমিট করার পর কর্তৃপক্ষ যাচাই করবে</li>
            <li>অনুমোদনের পর আপনাকে সদস্য হিসেবে যুক্ত করা হবে</li>
          </ul>
        </div>

        <div className="flex-1 min-h-[400px] relative rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-50">
          <iframe 
            src="https://docs.google.com/forms/d/e/1FAIpQLSeiOKo-2D9sl91lJpDzNwHfl8WZZPqPhhqTFAUsJNzAlg1eBw/viewform?embedded=true" 
            className="absolute inset-0 w-full h-full"
            frameBorder="0" 
            marginHeight={0} 
            marginWidth={0}
            title="AL-INSAF Membership Form"
          >
            Loading form...
          </iframe>
        </div>

        <div className="flex items-center justify-center gap-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="w-24 h-24 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <QRCode 
              value="https://docs.google.com/forms/d/e/1FAIpQLSeiOKo-2D9sl91lJpDzNwHfl8WZZPqPhhqTFAUsJNzAlg1eBw/viewform" 
              size={100}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>
          <div>
            <p className="font-bold text-[#064E3B]">মোবাইল থেকে যুক্ত হোন</p>
            <p className="text-xs text-gray-500 mt-1">QR কোডটি স্ক্যান করে সরাসরি<br/>ফর্মে প্রবেশ করুন।</p>
          </div>
        </div>
      </div>
    )
  }
];

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsMoreMenuOpen(false);
    if (isMoreMenuOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isMoreMenuOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeModal]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const openModal = (id: string) => {
    setActiveModal(id);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const activeCardData = cardData.find(c => c.id === activeModal);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#FDFCF0] text-[#1F2937]'} font-sans selection:bg-[#D4AF37] selection:text-white`}>
      
      {/* --- Header --- */}
      <header className={`fixed top-0 w-full ${isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-[#D4AF37]/20'} backdrop-blur-sm border-b z-40 shadow-sm transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => scrollToSection('home')}
          >
            <div className="relative w-14 h-14 flex items-center justify-center">
              {/* Rotating Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-[#D4AF37] rounded-full"
              />
              {/* Inner Circle with Logo */}
              <div className="relative w-11 h-11 bg-[#0a192f] rounded-full overflow-hidden border border-[#D4AF37]/30 flex items-center justify-center shadow-inner">
                <img 
                  src={logo} 
                  alt="Al-Insaf Logo" 
                  className="w-full h-full object-contain scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className={`font-serif text-2xl md:text-3xl font-bold leading-none tracking-wide ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>
                আল-<span className="text-[#D4AF37]">ইনসাফ</span>
              </span>
              <span className={`text-[10px] tracking-[0.2em] uppercase font-medium mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Al-Insaf Organization
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className={`text-sm font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-gray-600 hover:text-[#064E3B]'}`}>হোম</button>
            <button onClick={() => scrollToSection('explore')} className={`text-sm font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-gray-600 hover:text-[#064E3B]'}`}>বিস্তারিত</button>
            <button onClick={() => scrollToSection('contact')} className={`text-sm font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-gray-600 hover:text-[#064E3B]'}`}>যোগাযোগ</button>
            
            {/* More Menu (Three Dots) */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMoreMenuOpen(!isMoreMenuOpen); }}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                title="আরও"
              >
                <MoreVertical size={20} />
              </button>
              
              <AnimatePresence>
                {isMoreMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                  >
                    <div className={`p-3 border-b border-gray-100 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        আপনি যদি আমাদের একজন সম্মানিত শেয়ারহোল্ডার হয়ে থাকেন তাহলে আপনার নির্দিষ্ট কোড দিয়ে আপনার জমাকৃত প্রিমিয়াম দেখতে এখানে ক্লিক করুন।
                      </p>
                    </div>
                    <div className="p-2">
                      <a 
                        href="https://tinyurl.com/al-insafreport" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#064E3B]/10 text-[#064E3B] flex items-center justify-center">
                          <PieChart size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">রিপোর্ট দেখুন</span>
                        </div>
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title={isDarkMode ? "লাইট মোড" : "ডার্ক মোড"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button onClick={() => openModal('join')} className="bg-[#064E3B] text-white px-5 py-2 rounded-full text-sm font-medium uppercase tracking-wider hover:bg-[#064E3B]/90 transition-all shadow-md hover:shadow-lg">
              যুক্ত হোন
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className={`${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden border-b overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#D4AF37]/20'}`}
            >
              <div className="px-4 py-4 flex flex-col gap-4">
                <button onClick={() => scrollToSection('home')} className={`text-left font-medium py-2 border-b transition-colors ${isDarkMode ? 'text-gray-300 border-gray-800' : 'text-gray-700 border-gray-50'}`}>হোম</button>
                <button onClick={() => scrollToSection('explore')} className={`text-left font-medium py-2 border-b transition-colors ${isDarkMode ? 'text-gray-300 border-gray-800' : 'text-gray-700 border-gray-50'}`}>বিস্তারিত</button>
                <button onClick={() => scrollToSection('contact')} className={`text-left font-medium py-2 border-b transition-colors ${isDarkMode ? 'text-gray-300 border-gray-800' : 'text-gray-700 border-gray-50'}`}>যোগাযোগ</button>
                
                <div className={`py-3 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                  <p className={`text-[11px] leading-relaxed mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    আপনি যদি আমাদের একজন সম্মানিত শেয়ারহোল্ডার হয়ে থাকেন তাহলে আপনার নির্দিষ্ট কোড দিয়ে আপনার জমাকৃত প্রিমিয়াম দেখতে এখানে ক্লিক করুন।
                  </p>
                  <a 
                    href="https://tinyurl.com/al-insafreport" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 py-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <PieChart size={20} className="text-[#D4AF37]" />
                    <span className="font-medium">রিপোর্ট দেখুন</span>
                  </a>
                </div>

                <button onClick={() => { openModal('join'); setIsMobileMenuOpen(false); }} className="bg-[#064E3B] text-white px-5 py-3 rounded-lg text-center font-medium mt-2">
                  যুক্ত হোন
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- Main Content --- */}
      <main className="pt-20">
        
        {/* Hero Section */}
        <section id="home" className="relative bg-[#064E3B] text-white py-24 md:py-32 overflow-hidden">
          {/* Subtle Islamic Geometric Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 z-0 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#FFFFFF" strokeWidth="1"/>
                  <circle cx="30" cy="30" r="15" fill="none" stroke="#FFFFFF" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-pattern)" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              {/* Prominent Logo in Hero */}
              <div className="mb-8 relative">
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border border-[#D4AF37]/30 rounded-full"
                />
                <div className="w-24 h-24 md:w-32 md:w-32 bg-[#0a192f] rounded-full p-2 shadow-2xl border-2 border-[#D4AF37] overflow-hidden flex items-center justify-center">
                  <img 
                    src={logo} 
                    alt="Al-Insaf Logo Large" 
                    className="w-full h-full object-contain scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <span className="text-[#D4AF37] font-medium tracking-widest uppercase text-sm mb-4 block">আল-ইনসাফ এ আপনাকে স্বাগতম</span>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                নৈতিকতা ও আস্থার মাধ্যমে<br/><span className="text-[#D4AF37]">সমাজের ক্ষমতায়ন</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                স্বচ্ছতা, ন্যায্যতা এবং পারস্পরিক সহযোগিতার ভিত্তিতে গড়ে ওঠা একটি আর্থ-সামাজিক উদ্যোগ। একটি টেকসই ও হালাল ইকোসিস্টেম তৈরিতে আমাদের সাথে যুক্ত হোন।
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => openModal('join')}
                  className="bg-[#D4AF37] text-[#064E3B] px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-colors shadow-xl hover:shadow-2xl transform hover:-translate-y-1 duration-300 w-full sm:w-auto"
                >
                  সদস্য হোন
                </button>
                
                {/* Member Count Badge */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-full flex items-center gap-3 shadow-lg w-full sm:w-auto">
                  <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#064E3B]">
                    <Users size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-300 uppercase tracking-wider font-bold">আমাদের পরিবার</p>
                    <p className="text-lg font-bold text-white">২০০+ সদস্য</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Interactive Cards Section */}
        <section id="explore" className={`py-24 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-[#FDFCF0]'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`font-serif text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>আল-ইনসাফ সম্পর্কে জানুন</h2>
              <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
              <p className={`mt-4 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>আমাদের লক্ষ্য, কার্যক্রম এবং কীভাবে আপনি আমাদের ক্রমবর্ধমান কমিউনিটির অংশ হতে পারেন, সে সম্পর্কে বিস্তারিত জানতে নিচের কার্ডগুলোতে ক্লিক করুন।</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {cardData.map((card, idx) => (
                <motion.button
                  key={card.id}
                  onClick={() => openModal(card.id)}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`${isDarkMode ? 'bg-gray-900 border-gray-700 hover:border-[#D4AF37]/50' : 'bg-white border-[#D4AF37]/20 hover:shadow-xl'} p-8 rounded-2xl shadow-sm border transition-all text-left group flex flex-col items-start ${card.id === 'join' ? 'sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-white to-[#D1FAE5]/30 dark:from-gray-900 dark:to-gray-800' : ''}`}
                >
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-[#D4AF37] mb-6 group-hover:bg-[#064E3B] group-hover:text-white transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#FDFCF0] border-[#D4AF37]/30'}`}>
                    {card.icon}
                  </div>
                  <h3 className={`font-serif text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>{card.title}</h3>
                  <p className={`text-sm mb-6 flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {card.id === 'intro' && 'আমাদের সম্পর্কে বিস্তারিত জানুন এবং আমাদের মূলনীতিগুলো সম্পর্কে ধারণা নিন।'}
                    {card.id === 'activities' && 'আমাদের চলমান, ভবিষ্যৎ এবং সামাজিক কার্যক্রমের বিস্তারিত তালিকা।'}
                    {card.id === 'goals' && 'আমাদের দীর্ঘমেয়াদী লক্ষ্য এবং একটি আদর্শ সমাজ গঠনের উদ্দেশ্যসমূহ।'}
                    {card.id === 'why' && 'কেন আপনি আমাদের সাথে যুক্ত হবেন? আমাদের প্ল্যাটফর্মের সুবিধাসমূহ।'}
                    {card.id === 'join' && 'আজই আমাদের সাথে যুক্ত হয়ে একটি সুন্দর ভবিষ্যৎ গড়ার অংশীদার হোন।'}
                  </p>
                  <div className="text-[#D4AF37] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    বিস্তারিত দেখুন <ChevronRight size={16} />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={`py-24 transition-colors duration-500 border-t ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Contact Info */}
              <div>
                <h2 className={`font-serif text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>যোগাযোগ করুন</h2>
                <div className="w-16 h-1 bg-[#D4AF37] rounded-full mb-8"></div>
                <p className={`mb-10 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  আমাদের উদ্যোগ সম্পর্কে কোনো প্রশ্ন আছে বা যুক্ত হতে চান? নিচের যেকোনো মাধ্যমে আমাদের সাথে যোগাযোগ করুন। আমরা সবসময় আপনার সহায়তায় প্রস্তুত।
                </p>
                
                <div className="space-y-6">
                  <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#FDFCF0] border-[#D4AF37]/20'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isDarkMode ? 'bg-gray-900 text-[#D4AF37]' : 'bg-white text-[#064E3B]'}`}>
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>কল করুন (বিকাশ/নগদ পার্সোনাল)</p>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>01880917816</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#FDFCF0] border-[#D4AF37]/20'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isDarkMode ? 'bg-gray-900 text-green-500' : 'bg-white text-green-600'}`}>
                      <MessageCircle size={24} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>হোয়াটসঅ্যাপ</p>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>01880917816</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#FDFCF0] border-[#D4AF37]/20'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isDarkMode ? 'bg-gray-900 text-[#D4AF37]' : 'bg-white text-[#064E3B]'}`}>
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>ইমেইল</p>
                      <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>alinsaf34@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-[#064E3B] p-8 md:p-10 rounded-3xl shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="font-serif text-2xl font-bold mb-6 relative z-10">বার্তা পাঠান</h3>
                <form className="space-y-5 relative z-10" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">আপনার নাম</label>
                    <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="আপনার নাম লিখুন" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">ইমেইল ঠিকানা</label>
                    <input type="email" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] transition-colors" placeholder="আপনার ইমেইল লিখুন" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">বার্তা</label>
                    <textarea rows={4} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none" placeholder="আমরা আপনাকে কীভাবে সাহায্য করতে পারি?"></textarea>
                  </div>
                  <button className="w-full bg-[#D4AF37] text-[#064E3B] font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-white transition-colors">
                    বার্তা পাঠান <Send size={18} />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-[#043326] text-white py-12 border-t border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0a192f] border border-[#D4AF37]/30 flex items-center justify-center">
              <img 
                src={logo} 
                alt="Al-Insaf Logo Footer" 
                className="w-full h-full object-contain scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-serif text-xl md:text-2xl font-bold text-white leading-none tracking-wide">
                আল-<span className="text-[#D4AF37]">ইনসাফ</span>
              </span>
              <span className="text-[9px] text-gray-400 tracking-[0.2em] uppercase font-medium mt-1">
                Al-Insaf Organization
              </span>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} আল-ইনসাফ অর্গানাইজেশন। সর্বস্বত্ব সংরক্ষিত।
          </p>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <span className="text-sm text-[#D4AF37] font-medium">আমাদের ফেসবুক পেইজ:</span>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=61585517853683" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#064E3B] transition-colors cursor-pointer" title="Facebook Page 1">
                <Facebook size={18} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61581553149416" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#064E3B] transition-colors cursor-pointer" title="Facebook Page 2">
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- Modal Overlay --- */}
      <AnimatePresence>
        {activeModal && activeCardData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-[#064E3B]/80 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#FDFCF0]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#064E3B] text-[#D4AF37] flex items-center justify-center">
                    {activeCardData.icon}
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#064E3B]">{activeCardData.title}</h2>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {activeCardData.content}
              </div>
              
              {/* Modal Footer (Optional, mostly for visual balance) */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button 
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global styles for custom scrollbar in modal */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D4AF37; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #AA8C2C; 
        }
      `}} />
    </div>
  );
}
