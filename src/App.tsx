import React, { useState, useEffect } from 'react';
import { Menu, X, Info, Activity, Target, ShieldCheck, UserPlus, Phone, MessageCircle, Mail, ChevronRight, Send, Facebook, Sun, Moon, Users, Wallet, ExternalLink, Lock, MoreVertical, FileText, PieChart, LogIn, LogOut, User, Settings, Plus, Trash2, Edit, LayoutDashboard, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, getDocFromServer, collection, getDocs, updateDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const logo = "https://i.postimg.cc/7LLRy4WW/Whats-App-Image-2026-03-16-at-7-29-35-PM.jpg";

// --- Main Component ---
export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [siteContent, setSiteContent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [adminTab, setAdminTab] = useState<'overview' | 'settings' | 'users'>('overview');

  // Firestore Site Content Listener
  useEffect(() => {
    const contentDocRef = doc(db, 'settings', 'site_content');
    const unsubscribe = onSnapshot(contentDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSiteContent(docSnap.data());
      } else {
        const defaultContent = {
          memberCount: "২০০+",
          introText: "ইনসাফ একটি নৈতিকতা, স্বচ্ছতা এবং পারস্পরিক আস্থার ভিত্তিতে গড়ে ওঠা একটি সামাজিক ও অর্থনৈতিক উদ্যোগ।",
          introQuote: "সফলতা শুধু লাভে নয়, বরং ন্যায়, সততা এবং মানুষের উপকারে।",
          reportUrl: "https://tinyurl.com/al-insafreport",
          reportText: "আপনি যদি আমাদের একজন সম্মানিত শেয়ারহোল্ডার হয়ে থাকেন তাহলে আপনার নির্দিষ্ট কোড দিয়ে আপনার জমাকৃত প্রিমিয়াম দেখতে নিচের বাটনে ক্লিক করুন।",
          activitiesRunning: [
            "সদস্যভিত্তিক সঞ্চয় ও বিনিয়োগ কার্যক্রম",
            "অনলাইন ও অফলাইন পণ্যভিত্তিক উদ্যোগ",
            "ছোট উদ্যোক্তাদের সহায়তা"
          ],
          activitiesFuture: [
            "ইসলামিক ফাইন্যান্স ভিত্তিক বড় প্রকল্প",
            "ই-কমার্স প্ল্যাটফর্ম চালু",
            "প্রযুক্তিনির্ভর সেবা ও অ্যাপ ডেভেলপমেন্ট"
          ],
          activitiesSocial: [
            "দরিদ্র ও অসহায়দের সহায়তা",
            "শিক্ষামূলক উদ্যোগ",
            "সচেতনতা ও দাওয়াহ কার্যক্রম"
          ],
          objectives: [
            "একটি স্বচ্ছ ও জবাবদিহিমূলক অর্থনৈতিক প্ল্যাটফর্ম গড়ে তোলা",
            "সদস্যদের মধ্যে আস্থা, ভ্রাতৃত্ব এবং সহযোগিতা বৃদ্ধি করা",
            "হালাল ও ইসলামিক নীতিমালার আলোকে সকল কার্যক্রম পরিচালনা করা"
          ],
          goals: [
            "যুবসমাজকে উদ্যোক্তা হিসেবে গড়ে তোলা",
            "দীর্ঘমেয়াদে একটি শক্তিশালী ও টেকসই নেটওয়ার্ক তৈরি করা",
            "সামাজিক ও অর্থনৈতিক বৈষম্য দূরীকরণে ভূমিকা রাখা"
          ]
        };
        setSiteContent(defaultContent);
        setDoc(contentDocRef, defaultContent).catch(err => console.error("Error initializing content:", err));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/site_content');
    });
    return () => unsubscribe();
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          const isAdminEmail = currentUser.email === 'ibne.abdul.momin@gmail.com' || 
                               currentUser.email === 'ibneabdulmomin@gmail.com' ||
                               currentUser.email === 'alinsaf34@gmail.com';
          
          if (!userDoc.exists()) {
            const newProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              role: isAdminEmail ? 'admin' : 'shareholder',
              disabled: false,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          } else {
            const profileData = userDoc.data();
            if (profileData.role !== 'admin' && isAdminEmail) {
              await updateDoc(userDocRef, { role: 'admin' });
              profileData.role = 'admin';
            }
            if (profileData.disabled) {
              await signOut(auth);
              setUser(null);
              setUserProfile(null);
              alert("আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। অনুগ্রহ করে কর্তৃপক্ষের সাথে যোগাযোগ করুন।");
              return;
            }
            setUserProfile(profileData);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveContent = async () => {
    if (!editData) return;
    try {
      const contentDocRef = doc(db, 'settings', 'site_content');
      await setDoc(contentDocRef, editData, { merge: true });
      setIsEditing(null);
      setEditData(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/site_content');
    }
  };

  const startEditing = (section: string) => {
    setIsEditing(section);
    setEditData({ ...siteContent });
    if (section === 'users' || adminTab === 'overview') {
      fetchUsers();
    }
  };

  const openAdminModal = () => {
    setAdminTab('overview');
    setActiveModal('admin-settings');
    fetchUsers();
  };

  const fetchUsers = async () => {
    setIsFetchingUsers(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setUsersList(users);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { disabled: !currentStatus });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, disabled: !currentStatus } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const updateArrayField = (field: string, index: number, value: string) => {
    const newData = { ...editData };
    const arr = [...newData[field]];
    arr[index] = value;
    newData[field] = arr;
    setEditData(newData);
  };

  const addArrayItem = (field: string) => {
    const newData = { ...editData };
    newData[field] = [...newData[field], "নতুন আইটেম"];
    setEditData(newData);
  };

  const removeArrayItem = (field: string, index: number) => {
    const newData = { ...editData };
    newData[field] = newData[field].filter((_: any, i: number) => i !== index);
    setEditData(newData);
  };

  const cardData = [
    {
      id: 'intro',
      title: 'পরিচিতি',
      icon: <Info size={32} />,
      color: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50',
      description: 'আমাদের সম্পর্কে বিস্তারিত জানুন এবং আমাদের মূলনীতিগুলো সম্পর্কে ধারণা নিন।',
      content: (
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p className="text-lg font-medium text-[#064E3B]">{siteContent?.introText}</p>
          <div className="bg-[#D1FAE5]/30 p-4 rounded-lg border-l-4 border-[#D4AF37] my-6">
            <p className="italic font-medium text-[#064E3B]">"{siteContent?.introQuote}"</p>
          </div>
          <p>আমরা এমন একটি প্ল্যাটফর্ম তৈরি করতে চাই, যেখানে প্রত্যেক সদস্য নিরাপদ, সম্মানজনক এবং স্বচ্ছ পরিবেশে যুক্ত থাকতে পারে।</p>
        </div>
      )
    },
    {
      id: 'progress',
      title: 'কার্যক্রম',
      icon: <Activity size={32} />,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
      description: 'আমাদের চলমান, ভবিষ্যৎ এবং সামাজিক কার্যক্রমের বিস্তারিত তালিকা।',
      content: (
        <div className="space-y-6 text-gray-700">
          <p>ইনসাফ বিভিন্ন ধরনের কার্যক্রম পরিচালনা করে, যা সময়ের প্রয়োজন অনুযায়ী সম্প্রসারিত হবে:</p>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-[#064E3B] flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> চলমান কার্যক্রম
              </h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {siteContent?.activitiesRunning?.map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-[#064E3B] flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> ভবিষ্যৎ পরিকল্পনা
              </h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {siteContent?.activitiesFuture?.map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-[#064E3B] flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> সামাজিক কার্যক্রম
              </h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                {siteContent?.activitiesSocial?.map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'objectives',
      title: 'উদ্দেশ্য',
      icon: <Target size={32} />,
      color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
      description: 'আমাদের প্রধান উদ্দেশ্যসমূহ এবং একটি আদর্শ সিস্টেম তৈরির পরিকল্পনা।',
      content: (
        <div className="space-y-4 text-gray-700">
          <p className="mb-4">ইনসাফের লক্ষ্য শুধুমাত্র একটি প্রতিষ্ঠান গঠন নয়, বরং একটি আদর্শ সিস্টেম তৈরি করা। আমাদের প্রধান উদ্দেশ্যসমূহ:</p>
          <ul className="space-y-3">
            {siteContent?.objectives?.map((goal: string, idx: number) => (
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
      id: 'goals',
      title: 'লক্ষ্য',
      icon: <Users size={32} />,
      color: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50',
      description: 'আমাদের দীর্ঘমেয়াদী লক্ষ্য এবং একটি টেকসই নেটওয়ার্ক তৈরির প্রত্যয়।',
      content: (
        <div className="space-y-4 text-gray-700">
          <p className="mb-4">আমাদের দীর্ঘমেয়াদী লক্ষ্যসমূহ:</p>
          <ul className="space-y-3">
            {siteContent?.goals?.map((goal: string, idx: number) => (
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
      id: 'report',
      title: 'রিপোর্ট দেখুন',
      icon: <PieChart size={32} />,
      color: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50',
      description: 'শেয়ারহোল্ডারদের মাসিক পেমেন্ট এবং প্রিমিয়াম রিপোর্ট যাচাই করুন।',
      content: (
        <div className="space-y-6 text-gray-700">
          <div className="bg-[#FDFCF0] p-5 rounded-2xl border border-[#D4AF37]/30 shadow-sm">
            <motion.p className="text-sm leading-relaxed mb-6">
              {siteContent?.reportText || "আপনি যদি আমাদের একজন সম্মানিত শেয়ারহোল্ডার হয়ে থাকেন তাহলে আপনার নির্দিষ্ট কোড দিয়ে আপনার জমাকৃত প্রিমিয়াম দেখতে নিচের বাটনে ক্লিক করুন।"}
            </motion.p>
            <motion.a 
              href={siteContent?.reportUrl || "https://tinyurl.com/al-insafreport"} 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#064E3B] text-[#D4AF37] font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#08634b] transition-all shadow-lg group"
            >
              রিপোর্ট দেখুন <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.a>
          </div>
        </div>
      )
    },
    {
      id: 'join',
      title: 'সদস্য হোন',
      icon: <UserPlus size={32} />,
      color: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800/50',
      description: 'আজই আমাদের সাথে যুক্ত হয়ে একটি সুন্দর ভবিষ্যৎ গড়ার অংশীদার হোন।',
      content: (
        <div className="space-y-6 text-gray-700 h-full flex flex-col">
          <div className="bg-[#FDFCF0] p-4 rounded-xl border border-[#D4AF37]/30">
            <h4 className="font-bold text-[#064E3B] mb-2">সদস্য হওয়ার নিয়ম:</h4>
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

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setIsMoreMenuOpen(false);
    if (isMoreMenuOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isMoreMenuOpen]);

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
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollToSection('home')}>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-[#D4AF37] rounded-full" />
              <div className="relative w-11 h-11 bg-[#0a192f] rounded-full overflow-hidden border border-[#D4AF37]/30 flex items-center justify-center shadow-inner">
                <img src={logo} alt="Al-Insaf Logo" className="w-full h-full object-contain scale-110" referrerPolicy="no-referrer" />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className={`font-serif text-2xl md:text-3xl font-bold leading-none tracking-wide ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>আল-<span className="text-[#D4AF37]">ইনসাফ</span></span>
              <span className={`text-[10px] tracking-[0.2em] uppercase font-medium mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Al-Insaf Organization</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className={`text-sm font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-gray-600 hover:text-[#064E3B]'}`}>হোম</button>
            <button onClick={() => scrollToSection('explore')} className={`text-sm font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-gray-600 hover:text-[#064E3B]'}`}>বিস্তারিত</button>
            <button onClick={() => scrollToSection('contact')} className={`text-sm font-medium uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-gray-600 hover:text-[#064E3B]'}`}>যোগাযোগ</button>
            
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMoreMenuOpen(!isMoreMenuOpen); }}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <MoreVertical size={20} />
              </button>
              
              <AnimatePresence>
                {isMoreMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border overflow-hidden z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    {user ? (
                      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#064E3B] font-bold">{user.displayName?.charAt(0) || 'U'}</div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold truncate">{user.displayName}</span>
                            <span className="text-[10px] text-gray-500 truncate">{user.email}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block ${userProfile?.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{userProfile?.role || 'User'}</div>
                      </div>
                    ) : (
                      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}><p className="text-xs text-gray-500">অ্যাকাউন্টে লগইন করুন</p></div>
                    )}
                    <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>আপনার প্রিমিয়াম রিপোর্ট দেখতে এখানে ক্লিক করুন।</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <a href={siteContent?.reportUrl || "https://tinyurl.com/al-insafreport"} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                        <div className="w-8 h-8 rounded-lg bg-[#064E3B]/10 text-[#064E3B] flex items-center justify-center"><PieChart size={18} /></div>
                        <span className="text-sm font-bold">রিপোর্ট দেখুন</span>
                      </a>
                      {userProfile?.role === 'admin' && (
                        <button onClick={() => { openAdminModal(); setIsMoreMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                          <Settings size={18} className="text-[#D4AF37]" /><span className="text-sm font-bold">অ্যাডমিন সেটিংস</span>
                        </button>
                      )}
                      {user ? (
                        <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-500 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'}`}>
                          <LogOut size={18} /><span className="text-sm font-bold">লগআউট</span>
                        </button>
                      ) : (
                        <button onClick={handleLogin} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-blue-500 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}>
                          <LogIn size={18} /><span className="text-sm font-bold">লগইন করুন</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={toggleDarkMode} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => openModal('join')} className="bg-[#064E3B] text-white px-5 py-2 rounded-full text-sm font-medium uppercase hover:bg-[#064E3B]/90 transition-all shadow-md">যুক্ত হোন</button>
          </nav>

          <div className="flex items-center gap-4 md:hidden">
            <button onClick={toggleDarkMode} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            <button className={`${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`md:hidden border-b overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-[#D4AF37]/20'}`}>
              <div className="px-4 py-4 flex flex-col gap-4">
                <button onClick={() => scrollToSection('home')} className={`text-left font-medium py-2 border-b transition-colors ${isDarkMode ? 'text-gray-300 border-gray-800' : 'text-gray-700 border-gray-50'}`}>হোম</button>
                <button onClick={() => scrollToSection('explore')} className={`text-left font-medium py-2 border-b transition-colors ${isDarkMode ? 'text-gray-300 border-gray-800' : 'text-gray-700 border-gray-50'}`}>বিস্তারিত</button>
                <button onClick={() => scrollToSection('contact')} className={`text-left font-medium py-2 border-b transition-colors ${isDarkMode ? 'text-gray-300 border-gray-800' : 'text-gray-700 border-gray-50'}`}>যোগাযোগ</button>
                {user ? (
                  <div className={`py-3 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#064E3B] font-bold">{user.displayName?.charAt(0) || 'U'}</div>
                      <div className="flex flex-col"><span className="text-sm font-bold">{user.displayName}</span><span className="text-[10px] text-gray-500">{user.email}</span></div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {userProfile?.role === 'admin' && (<button onClick={() => { openAdminModal(); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 text-sm font-bold text-[#D4AF37]"><Settings size={16} /> অ্যাডমিন সেটিংস</button>)}
                      <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500"><LogOut size={16} /> লগআউট</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleLogin} className={`flex items-center gap-3 py-3 border-b transition-colors ${isDarkMode ? 'text-gray-300 border-gray-800' : 'text-gray-700 border-gray-50'}`}><LogIn size={20} className="text-blue-500" /><span className="font-medium">লগইন করুন</span></button>
                )}
                <div className={`py-3 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                  <p className={`text-[11px] leading-relaxed mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>আপনার প্রিমিয়াম রিপোর্ট দেখতে এখানে ক্লিক করুন।</p>
                  <a href={siteContent?.reportUrl || "https://tinyurl.com/al-insafreport"} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 py-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}><PieChart size={20} className="text-[#D4AF37]" /><span className="font-medium">রিপোর্ট দেখুন</span></a>
                </div>
                <button onClick={() => { openModal('join'); setIsMobileMenuOpen(false); }} className="bg-[#064E3B] text-white px-5 py-3 rounded-lg text-center font-medium mt-2">যুক্ত হোন</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-20">
        <section id="home" className="relative bg-[#064E3B] text-white py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-10 z-0 pointer-events-none">
            <svg width="100%" height="100%"><defs><pattern id="hero-pattern" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#FFFFFF" strokeWidth="1"/><circle cx="30" cy="30" r="15" fill="none" stroke="#FFFFFF" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#hero-pattern)" /></svg>
          </div>
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center">
              <div className="mb-8 relative">
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 border border-[#D4AF37]/30 rounded-full" />
                <div className="w-24 h-24 md:w-32 bg-[#0a192f] rounded-full p-2 shadow-2xl border-2 border-[#D4AF37] overflow-hidden flex items-center justify-center">
                  <img src={logo} alt="Al-Insaf Logo" className="w-full h-full object-contain scale-110" referrerPolicy="no-referrer" />
                </div>
              </div>
              <span className="text-[#D4AF37] font-medium tracking-widest uppercase text-sm mb-4 block">আল-ইনসাফ এ আপনাকে স্বাগতম</span>
              <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">নৈতিকতা ও আস্থার মাধ্যমে<br/><span className="text-[#D4AF37]">সমাজের ক্ষমতায়ন</span></h1>
              <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-10 font-light leading-relaxed">স্বচ্ছতা, ন্যায্যতা এবং পারস্পরিক সহযোগিতার ভিত্তিতে গড়ে ওঠা একটি আর্থ-সামাজিক উদ্যোগ।</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button onClick={() => openModal('join')} className="bg-[#D4AF37] text-[#064E3B] px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-all transform hover:-translate-y-1 w-full sm:w-auto">সদস্য হোন</button>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-full flex items-center gap-3 shadow-lg w-full sm:w-auto">
                  <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#064E3B]"><Users size={20} /></div>
                  <div className="text-left"><p className="text-xs text-gray-300 uppercase font-bold tracking-wider">আমাদের পরিবার</p><p className="text-lg font-bold text-white">{siteContent?.memberCount || "২০০+"} সদস্য</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="explore" className={`py-24 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-[#FDFCF0]'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`font-serif text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>আল-ইনসাফ সম্পর্কে জানুন</h2>
              <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {cardData.map((card, idx) => (
                <motion.button key={idx} onClick={() => openModal(card.id)} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-[#D4AF37]/20 shadow-sm'} p-8 rounded-2xl border transition-all text-left flex flex-col group`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#064E3B] group-hover:text-white transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : card.color}`}>{card.icon}</div>
                  <h3 className={`font-serif text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>{card.title}</h3>
                  <p className={`text-sm mb-6 flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{card.description}</p>
                  <div className="text-[#D4AF37] font-medium text-sm flex items-center gap-1">বিস্তারিত দেখুন <ChevronRight size={16} /></div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className={`py-24 transition-colors duration-500 border-t ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h2 className={`font-serif text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>যোগাযোগ করুন</h2>
                <div className="w-16 h-1 bg-[#D4AF37] rounded-full mb-8"></div>
                <div className="space-y-6">
                  <div className={`flex items-center gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#FDFCF0] border-[#D4AF37]/20'}`}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-[#064E3B] shadow-sm"><Phone size={24} /></div>
                    <div><p className="text-sm font-medium text-gray-500">কল করুন</p><p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>01880917816</p></div>
                  </div>
                  <div className={`flex items-center gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#FDFCF0] border-[#D4AF37]/20'}`}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-green-600 shadow-sm"><MessageCircle size={24} /></div>
                    <div><p className="text-sm font-medium text-gray-500">হোয়াটসঅ্যাপ</p><p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>01880917816</p></div>
                  </div>
                </div>
              </div>
              <div className="bg-[#064E3B] p-8 md:p-10 rounded-3xl shadow-2xl text-white relative overflow-hidden">
                <h3 className="font-serif text-2xl font-bold mb-6">বার্তা পাঠান</h3>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]" placeholder="আপনার নাম" />
                  <input type="email" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]" placeholder="আপনার ইমেইল" />
                  <textarea rows={4} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] resize-none" placeholder="আপনার বার্তা"></textarea>
                  <button className="w-full bg-[#D4AF37] text-[#064E3B] font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-white transition-colors">বার্তা পাঠান <Send size={18} /></button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#043326] text-white py-12 border-t border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0a192f] border border-[#D4AF37]/30 flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-full h-full object-contain scale-110" referrerPolicy="no-referrer" />
            </div>
            <span className="font-serif text-xl font-bold">আল-<span className="text-[#D4AF37]">ইনসাফ</span></span>
          </div>
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} আল-ইনসাফ অর্গানাইজেশন।</p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/profile.php?id=61585517853683" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#064E3B] transition-colors"><Facebook size={18} /></a>
            <a href="https://www.facebook.com/profile.php?id=61581553149416" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#064E3B] transition-colors"><Facebook size={18} /></a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-[#064E3B]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              {activeModal === 'admin-settings' ? (
                <>
                  <div className="flex items-center justify-between p-6 bg-[#064E3B] text-white shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#D4AF37] text-[#064E3B] flex items-center justify-center transform rotate-3 shadow-lg">
                        <Settings size={28} />
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h2>
                        <p className="text-[10px] text-[#D4AF37]/80 uppercase tracking-widest font-bold font-sans">Organization Control Center</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><X size={24} /></button>
                  </div>

                  <div className="flex border-b shrink-0 bg-white px-2 overflow-x-auto no-scrollbar">
                    <button onClick={() => { setAdminTab('overview'); setIsEditing(null); fetchUsers(); }} className={`px-4 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${adminTab === 'overview' ? 'border-[#D4AF37] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <LayoutDashboard size={16} /> ওভারভিউ
                    </button>
                    <button onClick={() => { setAdminTab('settings'); setIsEditing(null); }} className={`px-4 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${adminTab === 'settings' ? 'border-[#D4AF37] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <Database size={16} /> সাইট কন্টেন্ট
                    </button>
                    <button onClick={() => { setAdminTab('users'); setIsEditing(null); fetchUsers(); }} className={`px-4 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${adminTab === 'users' ? 'border-[#D4AF37] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <Users size={16} /> ইউজার লিস্ট
                    </button>
                  </div>

                  <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-[#FDFCF0]/30 custom-scrollbar">
                    {adminTab === 'overview' ? (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
                            <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">রজিস্ট্রার্ড সদস্য</p><h3 className="text-xl font-serif font-bold text-[#064E3B]">{usersList.length}</h3></div>
                          </div>
                          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Activity size={24} /></div>
                            <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">চলমান প্রজেক্ট</p><h3 className="text-xl font-serif font-bold text-[#064E3B]">{siteContent?.activitiesRunning?.length || 0}</h3></div>
                          </div>
                          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><PieChart size={24} /></div>
                            <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">সামাজিক কাজ</p><h3 className="text-xl font-serif font-bold text-[#064E3B]">{siteContent?.activitiesSocial?.length || 0}</h3></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-[#064E3B] mb-6 flex items-center gap-2 text-sm"><PieChart size={16} className="text-[#D4AF37]" /> ইউজার রোল ডিস্ট্রিবিউশন</h4>
                            <div className="h-60">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                  { name: 'সদস্য', count: usersList.filter(u => !u.role || u.role === 'shareholder').length, color: '#064E3B' },
                                  { name: 'কর্মচারী', count: usersList.filter(u => u.role === 'employee').length, color: '#D4AF37' },
                                  { name: 'অ্যাডমিন', count: usersList.filter(u => u.role === 'admin').length, color: '#10B981' }
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: '600' }} />
                                  <YAxis hide />
                                  <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={35}>
                                    { [1,2,3].map((_, index) => <Cell key={index} fill={['#064E3B', '#D4AF37', '#10B981'][index]} />) }
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-[#064E3B] mb-4 flex items-center gap-2 text-sm"><Activity size={16} className="text-[#D4AF37]" /> সাম্প্রতিক ইউজার অ্যাক্টিভিটি</h4>
                            <div className="space-y-3">
                              {usersList.slice().sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 4).map((usr, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-all">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-[10px] text-[#064E3B] shrink-0">{usr.displayName?.charAt(0) || 'U'}</div>
                                    <div className="overflow-hidden">
                                      <p className="text-[11px] font-bold truncate">{usr.displayName || 'Anonymous'}</p>
                                      <p className="text-[9px] text-gray-400 truncate">{usr.role || 'Member'}</p>
                                    </div>
                                  </div>
                                  <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap shrink-0">{usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : 'New'}</span>
                                </div>
                              ))}
                              {usersList.length === 0 && <p className="text-center py-10 text-gray-400 text-xs italic">কোন তথ্য পাওয়া যায়নি</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : adminTab === 'settings' ? (
                      <div className="space-y-6">
                        {isEditing ? (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <button onClick={() => setIsEditing(null)} className="flex items-center gap-2 mb-6 text-xs font-bold text-[#D4AF37] bg-[#064E3B] px-3 py-1.5 rounded-lg hover:bg-[#064E3B]/90 transition-all shrink-0">← ব্যাক টু সেটিংস</button>
                            
                            {isEditing === 'stats' && (
                              <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">মেম্বার সংখ্যা লেবেল</label><input value={editData.members} onChange={(e) => setEditData({...editData, members: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm font-serif" /></div>
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">রিপোর্ট লিঙ্ক</label><input value={editData.reportUrl} onChange={(e) => setEditData({...editData, reportUrl: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm" /></div>
                                <button onClick={handleSaveContent} className="w-full py-4 bg-[#064E3B] text-white font-bold rounded-xl mt-4 shadow-lg shadow-emerald-100">পরিবর্তন সেভ করুন</button>
                              </div>
                            )}

                            {isEditing === 'intro' && (
                              <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">পরিচিতি টেক্সট</label><textarea rows={4} value={editData.introText} onChange={(e) => setEditData({...editData, introText: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none resize-none text-sm leading-relaxed" /></div>
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">মূল বাণী (Quote)</label><textarea rows={2} value={editData.quote} onChange={(e) => setEditData({...editData, quote: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none italic resize-none text-sm" /></div>
                                <button onClick={handleSaveContent} className="w-full py-4 bg-[#064E3B] text-white font-bold rounded-xl mt-4 shadow-lg shadow-emerald-100">পরিবর্তন সেভ করুন</button>
                              </div>
                            )}

                            {isEditing === 'objectives' && (
                              <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                {['objectives', 'goals'].map((field) => (
                                  <div key={field} className="space-y-3">
                                    <h4 className="font-bold text-[#064E3B] text-sm flex items-center justify-between">{field === 'objectives' ? 'উদ্দেশ্য' : 'লক্ষ্যসমূহ'} <span className="text-[9px] bg-[#D4AF37]/20 text-[#064E3B] px-1.5 py-0.5 rounded-full">{editData[field].length} টি</span></h4>
                                    {editData[field].map((item: string, idx: number) => (
                                      <div key={idx} className="flex gap-2">
                                        <input value={item} onChange={(e) => updateArrayField(field, idx, e.target.value)} className="flex-1 p-2.5 bg-gray-50 border-none rounded-xl text-xs outline-none focus:bg-white focus:ring-1 ring-[#D4AF37]/30 transition-all" />
                                        <button onClick={() => removeArrayItem(field, idx)} className="text-red-300 hover:text-red-500 transition-colors shrink-0"><Trash2 size={18} /></button>
                                      </div>
                                    ))}
                                    <button onClick={() => addArrayItem(field)} className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all">+ আরও একটি পয়েন্ট যোগ করুন</button>
                                  </div>
                                ))}
                                <button onClick={handleSaveContent} className="w-full py-4 bg-[#064E3B] text-white font-bold rounded-xl mt-4 shadow-lg shadow-emerald-100">পরিবর্তন সেভ করুন</button>
                              </div>
                            )}

                            {isEditing === 'progress' && (
                              <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                {['activitiesRunning', 'activitiesFuture', 'activitiesSocial'].map((field) => (
                                  <div key={field} className="space-y-2">
                                    <h4 className="font-bold text-[#064E3B] text-sm mb-2">{field.replace('activities', '')} কার্যক্রম তালিকা</h4>
                                    {editData[field].map((item: string, idx: number) => (
                                      <div key={idx} className="flex gap-2">
                                        <input value={item} onChange={(e) => updateArrayField(field, idx, e.target.value)} className="flex-1 p-2.5 bg-gray-50 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 ring-[#064E3B]/10 transition-all" />
                                        <button onClick={() => removeArrayItem(field, idx)} className="text-red-300 hover:text-red-500 shrink-0"><Trash2 size={18} /></button>
                                      </div>
                                    ))}
                                    <button onClick={() => addArrayItem(field)} className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-2 rounded-lg transition-all">+ নতুন একটি পয়েন্ট যোগ করুন</button>
                                  </div>
                                ))}
                                <button onClick={handleSaveContent} className="w-full py-4 bg-[#064E3B] text-white font-bold rounded-xl mt-4 shadow-lg shadow-emerald-100">পরিবর্তন সেভ করুন</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                            {[
                              { id: 'stats', label: 'মেম্বার সংখ্যা ও রিপোর্ট লিংক', icon: <Database size={18}/> },
                              { id: 'intro', label: 'পরিচিতি ও মূল বাণীসমূহ', icon: <User size={18}/> },
                              { id: 'progress', label: 'কার্যক্রম ও প্রজেক্ট তালিকা', icon: <Activity size={18}/> },
                              { id: 'objectives', label: 'উদ্দেশ্য ও ভিশন-মিশন', icon: <Target size={18}/> }
                            ].map((item) => (
                              <div key={item.id} onClick={() => startEditing(item.id)} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-[#D4AF37] hover:shadow-xl transition-all group cursor-pointer shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-all flex items-center justify-center">{item.icon}</div>
                                    <h4 className="font-bold text-[#064E3B] text-sm">{item.label}</h4>
                                  </div>
                                  <ChevronRight size={18} className="text-gray-200 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="font-serif font-bold text-xl text-[#064E3B]">ইউজার ম্যানেজমেন্ট</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Role based access control</p>
                          </div>
                          <button onClick={fetchUsers} className={`p-2 rounded-xl border-2 transition-all ${isFetchingUsers ? 'animate-pulse' : 'hover:bg-gray-100'}`}><Activity size={16} className="text-[#D4AF37]"/></button>
                        </div>
                        {isFetchingUsers ? (
                          <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]"></div></div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {usersList.length === 0 && <p className="text-center py-20 text-gray-400 font-serif italic">কোন ইউজার ডাটা পাওয়া যায়নি</p>}
                            {usersList.map((usr: any) => (
                              <div key={usr.id} className={`p-5 rounded-[2.5rem] border transition-all ${usr.disabled ? 'bg-red-50/40 border-red-100 opacity-80' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all shadow-inner shrink-0 ${usr.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-[#D4AF37]/10 text-[#064E3B]'}`}>
                                      {usr.displayName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-[#064E3B] truncate">{usr.displayName || 'Unnamed member'}</p>
                                      <p className="text-[10px] text-gray-400 truncate mb-2">{usr.email}</p>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${usr.role === 'admin' ? 'bg-red-500 text-white' : usr.role === 'employee' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{usr.role || 'Member'}</span>
                                        {usr.disabled && <span className="text-[9px] bg-black text-white px-2 py-1 rounded-full font-bold tracking-widest leading-none">LOCKED</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 justify-end shrink-0">
                                    <div className="bg-gray-50 p-1.5 rounded-2xl flex items-center gap-2">
                                      <select 
                                        value={usr.role || 'shareholder'} 
                                        onChange={(e) => updateUserRole(usr.id, e.target.value)}
                                        className="text-[11px] font-bold p-2.5 bg-white border-none rounded-xl shadow-sm cursor-pointer outline-none focus:ring-1 ring-[#D4AF37]"
                                      >
                                        <option value="shareholder">শেয়ারহোল্ডার</option>
                                        <option value="employee">কর্মচারী</option>
                                        <option value="admin">অ্যাডমিন</option>
                                      </select>
                                      <button 
                                        onClick={() => toggleUserStatus(usr.id, usr.disabled)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${usr.disabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                      >
                                        {usr.disabled ? <ShieldCheck size={20} /> : <Lock size={20} />}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-6 border-t bg-white flex justify-end shrink-0"><button onClick={closeModal} className="px-10 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors shadow-sm">বন্ধ করুন</button></div>
                </>
              ) : activeCardData ? (
                <>
                  <div className="flex items-center justify-between p-6 bg-[#FDFCF0] border-b"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-[#064E3B] text-[#D4AF37] rounded-xl flex items-center justify-center">{activeCardData.icon}</div><h2 className="font-serif text-2xl font-bold text-[#064E3B]">{activeCardData.title}</h2></div><button onClick={closeModal} className="text-gray-500"><X size={24} /></button></div>
                  <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">{activeCardData.content}</div>
                  <div className="p-4 border-t flex justify-end"><button onClick={closeModal} className="px-6 py-2 bg-gray-200 rounded-lg">বন্ধ করুন</button></div>
                </>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #AA8C2C; }
      `}} />
    </div>
  );
}
