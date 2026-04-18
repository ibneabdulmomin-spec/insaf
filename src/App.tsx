import React, { useState, useEffect } from 'react';
import { Menu, X, Info, Activity, Target, ShieldCheck, UserPlus, Phone, MessageCircle, Mail, ChevronRight, Send, Facebook, Sun, Moon, Users, Wallet, ExternalLink, Lock, MoreVertical, FileText, PieChart, LogIn, LogOut, User, Settings, Plus, Trash2, Edit, LayoutDashboard, Database, MapPin, Search, FileX } from 'lucide-react';
import { LoginModal } from './components/LoginModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInAnonymously, signOut, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, getDocFromServer, collection, getDocs, updateDoc, query, where } from 'firebase/firestore';

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

interface Task {
  id?: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  createdAt: string;
  creatorId: string;
}

// --- Main Component ---
export default function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
  const [adminTab, setAdminTab] = useState<'overview' | 'analytics' | 'settings' | 'users' | 'reports' | 'notices' | 'gallery' | 'messages' | 'tasks'>('overview');
  const [notices, setNotices] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [reportSearchCode, setReportSearchCode] = useState("");
  const [personalReports, setPersonalReports] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFetchingReports, setIsFetchingReports] = useState(false);
  const [isFetchingNotices, setIsFetchingNotices] = useState(false);
  const [isFetchingGallery, setIsFetchingGallery] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isFetchingTasks, setIsFetchingTasks] = useState(false);
  const [reportForm, setReportForm] = useState({ shareholderCode: '', month: '', amount: 0, premiumAmount: 0 });
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '' });
  const [taskForm, setTaskForm] = useState<Omit<Task, 'id' | 'createdAt' | 'creatorId'>>({
    title: '',
    description: '',
    assigneeId: '',
    assigneeName: '',
    dueDate: '',
    status: 'To Do'
  });
  const [galleryForm, setGalleryForm] = useState({ url: '', caption: '', date: '' });
  const [contactForm, setContactForm] = useState({ name: '', number: '', message: '' });
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [isFetchingMyTasks, setIsFetchingMyTasks] = useState(false);

  const fetchMyTasks = async (uid: string) => {
    setIsFetchingMyTasks(true);
    try {
      const q = query(collection(db, 'tasks'), where('assigneeId', '==', uid));
      const unsub = onSnapshot(q, (snap) => {
        setMyTasks(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task)));
        setIsFetchingMyTasks(false);
      });
      return unsub;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'my-tasks');
      setIsFetchingMyTasks(false);
    }
  };

  useEffect(() => {
    if (user && activeModal === 'my-account') {
      fetchMyTasks(user.uid);
    }
  }, [user, activeModal]);

  const syncOfficialData = async () => {
    try {
      const officialMembers = [
        { code: "1001", name: "মাওঃ সালমান", mobile: "1851992430", total: 24427 },
        { code: "1002", name: "মুহা. লোকমান", mobile: "1887090637", total: 42138 },
        { code: "1003", name: "মাওঃ ইমরান", mobile: "1306070340", total: 29436 },
        { code: "1004", name: "মুহা. নোমান", mobile: "1818685296", total: 15888 },
        { code: "1005", name: "ফারিহা আক্তার মীম", mobile: "1886296261", total: 18766 },
        { code: "1006", name: "ফাহমিদা হোমায়রা", mobile: "1830854739", total: 15724 },
        { code: "1007", name: "নাইমা আক্তার", mobile: "1840491824", total: 6246 },
        { code: "1008", name: "নুসাইবা", mobile: "1840491825", total: 14589 },
        { code: "1009", name: "ওমর ফারুক", mobile: "1849458345", total: 16742 },
        { code: "1010", name: "হুসাইন", mobile: "1612442395", total: 2410 },
        { code: "1011", name: "মোবারক করিম", mobile: "1980433529", total: 11629 },
        { code: "1012", name: "হাঃ আকরাম", mobile: "1745453847", total: 4472 },
        { code: "1013", name: "আহনাফ আবরার", mobile: "1818422650", total: 8448 },
        { code: "1014", name: "মুস্তাফিজুর রহমান ফিজার", mobile: "1644234822", total: 15504 },
        { code: "1015", name: "উসমান গণী", mobile: "1822605746", total: 11135 },
        { code: "1016", name: "রাসেল প্রবাসী", mobile: "1834674421", total: 26894 },
        { code: "1017", name: "আঃ করিম বিন আঃ রহমান", mobile: "1890754244", total: 520 },
        { code: "1018", name: "নাজমুল মাসনবী যশোর", mobile: "1797765502", total: 7588 },
        { code: "1019", name: "রফিকুল্লাহ হাতিয়া", mobile: "1606260501", total: 8716 },
        { code: "1020", name: "নূর আলম", mobile: "1645141199", total: 5663 }
      ];

      for (const m of officialMembers) {
        const uid = "user_" + m.code;
        // Update user profile
        await setDoc(doc(db, 'users', uid), {
          uid,
          identifier: m.mobile,
          displayName: m.name,
          shareholderCode: m.code,
          role: 'shareholder',
          disabled: false,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Add standard report entry if it doesn't exist for this total
        const reportQuery = query(collection(db, 'reports'), where('shareholderCode', '==' , m.code), where('amount', '==', m.total));
        const existing = await getDocs(reportQuery);
        if (existing.empty) {
          await setDoc(doc(collection(db, 'reports')), {
            shareholderCode: m.code,
            month: "প্রারম্ভিক ব্যালেন্স",
            amount: m.total,
            premiumAmount: 0,
            timestamp: new Date().toISOString()
          });
        }
      }
      showToast("অফিসিয়াল ডাটা সিঙ্ক সফল হয়েছে!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'bulk-sync');
    }
  };
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  // Notices Listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notices'), (snap) => {
      const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setNotices(data.filter((n: any) => n.active !== false).sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
    });
    return unsub;
  }, []);

  // Gallery Listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'gallery'), (snap) => {
      const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setGalleryItems(data.filter((i: any) => i.deleted !== true));
    });
    return unsub;
  }, []);

  // Initialize base data if empty
  useEffect(() => {
    const initData = async () => {
      // Users & Reports seeding
      const usersSnap = await getDocs(collection(db, 'users'));
      if (usersSnap.empty) {
        const initialShareholders = [
          { code: "1001", name: "মাওঃ সালমান", mobile: "1851992430", payments: [{ month: "অক্টোবর ২০২৪", amount: 24427 }] },
          { code: "1002", name: "মুহা. লোকমান", mobile: "1887090637", payments: [{ month: "মার্চ ২০২৪", amount: 42138 }] },
          { code: "1003", name: "মাওঃ ইমরান", mobile: "1306070340", payments: [{ month: "এপ্রিল ২০২৪", amount: 29436 }] },
          { code: "1004", name: "মুহা. নোমান", mobile: "1818685296", payments: [{ month: "অক্টোবর ২০২৪", amount: 15888 }] },
          { code: "1005", name: "ফারিহা আক্তার মীম", mobile: "1886296261", payments: [{ month: "জুন ২০২৪", amount: 18766 }] },
          { code: "1006", name: "ফাহমিদা হোমায়রা", mobile: "1830854739", payments: [{ month: "এপ্রিল ২০২৪", amount: 15724 }] },
          { code: "1007", name: "নাইমা আক্তার", mobile: "1840491824", payments: [{ month: "এপ্রিল ২০২৪", amount: 6246 }] },
          { code: "1008", name: "নুসাইবা", mobile: "1840491825", payments: [{ month: "এপ্রিল ২০২৪", amount: 14589 }] },
          { code: "1009", name: "ওমর ফারুক", mobile: "1849458345", payments: [{ month: "এপ্রিল ২০২৪", amount: 16742 }] },
          { code: "1010", name: "হুসাইন", mobile: "1612442395", payments: [{ month: "এপ্রিল ২০২৪", amount: 2410 }] },
          { code: "1011", name: "মোবারক করিম", mobile: "1980433529", payments: [{ month: "এপ্রিল ২০২৪", amount: 11629 }] },
          { code: "1012", name: "হাঃ আকরাম", mobile: "1745453847", payments: [{ month: "এপ্রিল ২০২৪", amount: 4472 }] },
          { code: "1013", name: "আহনাফ আবরার", mobile: "1818422650", payments: [{ month: "এপ্রিল ২০২৪", amount: 8448 }] },
          { code: "1014", name: "মুস্তাফিজুর রহমান ফিজার", mobile: "1644234822", payments: [{ month: "এপ্রিল ২০২৪", amount: 15504 }] },
          { code: "1015", name: "উসমান গণী", mobile: "1822605746", payments: [{ month: "এপ্রিল ২০২৪", amount: 11135 }] },
          { code: "1016", name: "রাসেল প্রবাসী", mobile: "1834674421", payments: [{ month: "এপ্রিল ২০২৪", amount: 26894 }] },
          { code: "1017", name: "আঃ করিম বিন আঃ রহমান", mobile: "1890754244", payments: [{ month: "এপ্রিল ২০২৪", amount: 520 }] },
          { code: "1018", name: "নাজমুল মাসনবী যশোর", mobile: "1797765502", payments: [{ month: "এপ্রিল ২০২৪", amount: 7588 }] },
          { code: "1019", name: "রফিকুল্লাহ হাতিয়া", mobile: "1606260501", payments: [{ month: "এপ্রিল ২০২৪", amount: 8716 }] },
          { code: "1020", name: "নূর আলম", mobile: "1645141199", payments: [{ month: "এপ্রিল ২০২৪", amount: 5663 }] }
        ];

        for (const s of initialShareholders) {
          const uid = "user_" + s.code;
          await setDoc(doc(db, 'users', uid), {
            uid,
            identifier: s.mobile,
            displayName: s.name,
            shareholderCode: s.code,
            role: 'shareholder',
            disabled: false,
            createdAt: new Date().toISOString()
          });

          for (const p of s.payments) {
            await setDoc(doc(collection(db, 'reports')), {
              shareholderCode: s.code,
              month: p.month,
              amount: p.amount,
              premiumAmount: 0,
              timestamp: new Date().toISOString()
            });
          }
        }
      }

      // Notice
      const noticeSnap = await getDocs(collection(db, 'notices'));
      if (noticeSnap.empty) {
        await setDoc(doc(collection(db, 'notices')), {
          title: "স্বাগতম আল-ইনসাফ এ",
          content: "আমাদের লক্ষ্য সামজিক ও অর্থনৈতিক মুক্তি অর্জন। স্বচ্ছতা ও আধুনিকতার মাধ্যমে নতুন দিগন্ত উন্মোচন।",
          date: new Date().toISOString(),
          active: true
        });
      }
      
      // Gallery
      const gallerySnap = await getDocs(collection(db, 'gallery'));
      if (gallerySnap.empty) {
        await setDoc(doc(collection(db, 'gallery')), {
          url: "https://picsum.photos/seed/charity/800/600",
          caption: "শীতার্তদের মাঝে শীতবস্ত্র বিতরণ - ২০২৪",
          date: "জানুয়ারি ২০২৪"
        });
        await setDoc(doc(collection(db, 'gallery')), {
          url: "https://picsum.photos/seed/meeting/800/600",
          caption: "বাৎসরিক সাধারণ সভা - ২০২৩",
          date: "ডিসেম্বর ২০২৩"
        });
      }

      // Sample Report
      const reportSnap = await getDocs(collection(db, 'reports'));
      if (reportSnap.empty) {
        await setDoc(doc(collection(db, 'reports')), {
          shareholderCode: "INS-101",
          month: "ফেব্রুয়ারি ২০২৪",
          amount: 5000,
          premiumAmount: 500,
          timestamp: new Date().toISOString()
        });
      }
    };
    initData();
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    // Set persistence once on mount
    setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence Error:", err));

    const storedProfile = localStorage.getItem('insaf_user_profile');
    if (storedProfile) {
       setUserProfile(JSON.parse(storedProfile));
    }

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
          
          if (currentUser.isAnonymous) {
            const storedProfile = localStorage.getItem('insaf_user_profile');
            if (!storedProfile) {
               // If no profile is stored, sign out the anonymous user
               await signOut(auth);
            }
            setLoading(false);
            return;
          }

          const userEmail = currentUser.email?.toLowerCase() || '';
          
          // Helper to check if email is admin, ignoring dots for Gmail
          const checkIsAdmin = (email: string) => {
            const adminEmails = [
              'ibne.abdul.momin@gmail.com',
              'ibneabdulmomin@gmail.com',
              'alinsaf34@gmail.com',
              'ibne.abdulmomin@gmail.com',
              'ibneabdul.momin@gmail.com'
            ];
            
            const normalized = email.replace(/\./g, '');
            const hasAdminMatch = adminEmails.some(ae => ae.replace(/\./g, '') === normalized);
            return hasAdminMatch;
          };

          const isAdminEmail = checkIsAdmin(userEmail);
          
          console.log("Auth State Changed:", userEmail, "Is Admin:", isAdminEmail);
          
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
            console.log("New profile created as:", newProfile.role);
            setUserProfile(newProfile);
          } else {
            const profileData = userDoc.data();
            console.log("Existing profile role:", profileData.role);
            
            // Auto-upgrade admin if not current
            if (profileData.role !== 'admin' && isAdminEmail) {
              console.log("Upgrading user to admin...");
              await updateDoc(userDocRef, { role: 'admin' });
              profileData.role = 'admin';
            }

            // Force enable if admin (recovery)
            if (profileData.disabled && isAdminEmail) {
              console.log("Admin account was disabled, auto-enabling...");
              await updateDoc(userDocRef, { disabled: false });
              profileData.disabled = false;
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
        const storedProfile = localStorage.getItem('insaf_user_profile');
        if (!storedProfile) {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveContent = async () => {
    if (!editData) return;
    try {
      const contentDocRef = doc(db, 'settings', 'site_content');
      await setDoc(contentDocRef, editData, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(null);
        setEditData(null);
      }, 1500);
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
      showToast("ইউজারের রোল সেভ করা হয়েছে!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { disabled: !currentStatus });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, disabled: !currentStatus } : u));
      showToast(currentStatus ? "ইউজারের একাউন্ট একটিভ করা হয়েছে" : "ইউজারের একাউন্ট লক করা হয়েছে", "success");
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

  const addNotice = async (notice: any) => {
    try {
      const docRef = doc(collection(db, 'notices'));
      await setDoc(docRef, { ...notice, date: new Date().toISOString() });
      showToast("নোটিশ সফলভাবে যোগ করা হয়েছে!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notices');
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      // For simplicity in this mock-friendly environment, we might just update active status
      // but let's assume we can delete if rules allow it
      await setDoc(doc(db, 'notices', id), { active: false }, { merge: true });
      showToast("নোটিশ আর্কাইভ করা হয়েছে", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notices/${id}`);
    }
  };

  const addGalleryItem = async (item: any) => {
    if (!item.url) {
      showToast("দয়া করে ছবি আপলোড করুন বা লিংক দিন", "error");
      return;
    }
    try {
      await setDoc(doc(collection(db, 'gallery')), item);
      setGalleryForm({ url: '', caption: '', date: '' });
      showToast("ছবি গ্যালারিতে যোগ করা হয়েছে!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gallery');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Firestore
        showToast("ছবির সাইজ ১ মেগাবাইটের কম হতে হবে", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryForm({ ...galleryForm, url: reader.result as string });
        showToast("ছবি আপলোড হওয়ার জন্য প্রস্তুত", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const updateUserCode = async (userId: string, code: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { shareholderCode: code });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, shareholderCode: code } : u));
      showToast("শেয়ারহোল্ডার কোড আপডেট হয়েছে!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    try {
      // Implementation of deletion
      await setDoc(doc(db, 'gallery', id), { deleted: true }, { merge: true });
      showToast("ছবি সরানো হয়েছে", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
    }
  };

  const fetchMessages = async () => {
    setIsFetchingMessages(true);
    try {
      const snap = await getDocs(collection(db, 'messages'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(list.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
       handleFirestoreError(error, OperationType.LIST, 'messages');
    } finally {
       setIsFetchingMessages(false);
    }
  };

  // Real-time listener for current user's profile and reports
  useEffect(() => {
    if (!user) {
      setPersonalReports([]);
      return;
    }

    // Listen to user profile for real-time updates (like being disabled or role change)
    const userRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(userRef, (snap) => {
       if (snap.exists()) {
          const profile = snap.data();
          setUserProfile(prev => ({ ...prev, ...profile }));
          
          if (profile.disabled) {
             signOut(auth);
             showToast("আপনার অ্যাকাউন্টটি লক করা হয়েছে", "error");
          }
       }
    });

    return () => unsubProfile();
  }, [user]);

  // Real-time listener for user's personal reports based on their shareholderCode
  useEffect(() => {
    if (!userProfile?.shareholderCode) {
      setPersonalReports([]);
      return;
    }

    const reportQuery = query(
      collection(db, 'reports'),
      where('shareholderCode', '==', userProfile.shareholderCode)
    );

    const unsubReports = onSnapshot(reportQuery, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPersonalReports(list.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, (error) => {
      console.error("Personal Reports Error:", error);
    });

    return () => unsubReports();
  }, [userProfile?.shareholderCode]);

  const normalizeWhatsAppNumber = (num: string) => {
    let cleaned = num.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '88' + cleaned;
    } else if (!cleaned.startsWith('88') && cleaned.length === 10) {
      cleaned = '880' + cleaned;
    }
    return cleaned;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.number || !contactForm.message) {
      showToast("দয়া করে সব ঘর পূরণ করুন", "error");
      return;
    }

    try {
      // 1. Save to Firestore
      await setDoc(doc(collection(db, 'messages')), {
        ...contactForm,
        timestamp: new Date().toISOString()
      });

      // 2. Prepare WhatsApp Link
      const adminWhatsApp = "8801880917816";
      const text = `নাম: ${contactForm.name}\nনাম্বার: ${contactForm.number}\nবার্তা: ${contactForm.message}`;
      const waUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(text)}`;

      showToast("বার্তা পাঠানো হয়েছে!", "success");
      setContactForm({ name: '', number: '', message: '' });

      // Open WhatsApp
      window.open(waUrl, '_blank');
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, 'messages');
       showToast("বার্তা পাঠানো ব্যর্থ হয়েছে", "error");
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      // In a real app we might use deleteDoc, but here we can just delete from list for demo or delete from firestore
      // To keep it consistent with other deletes in this app:
      await setDoc(doc(db, 'messages', id), { deleted: true }, { merge: true });
      setMessages(messages.filter(m => m.id !== id));
      showToast("বার্তাটি মুছে ফেলা হয়েছে", "success");
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, 'messages/' + id);
    }
  };

  const addReport = async (report: any) => {
    try {
      await setDoc(doc(collection(db, 'reports')), { ...report, timestamp: new Date().toISOString() });
      showToast("রিপোর্ট সফলভাবে জমা হয়েছে!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reports');
    }
  };

  const fetchReports = async () => {
    // Reports are now fetched via real-time listener when on reports tab
  };

  const fetchTasks = async () => {
    setIsFetchingTasks(true);
    try {
      const q = query(collection(db, 'tasks'));
      const unsub = onSnapshot(q, (snap) => {
        setTasks(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task)));
        setIsFetchingTasks(false);
      });
      return unsub;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
      setIsFetchingTasks(false);
    }
  };

  const addTask = async () => {
    if (!taskForm.title || !taskForm.assigneeId) {
      showToast("শিরোনাম এবং দায়িত্বপ্রাপ্ত ব্যক্তি নির্বাচন করুন", "error");
      return;
    }
    try {
      const newTask = {
        ...taskForm,
        createdAt: new Date().toISOString(),
        creatorId: user?.uid || 'system'
      };
      await setDoc(doc(collection(db, 'tasks')), newTask);
      showToast("টাস্ক সফলভাবে তৈরি হয়েছে", "success");
      setTaskForm({ title: '', description: '', assigneeId: '', assigneeName: '', dueDate: '', status: 'To Do' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: newStatus });
      showToast("স্ট্যাটাস আপডেট হয়েছে", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      // Logic for deleting task if needed
    } catch (error) {}
  };

  const searchReport = async () => {
    if (!reportSearchCode) {
      showToast("কোড দিন", "error");
      return;
    }
    setIsFetchingReports(true);
    try {
      const q = query(collection(db, 'reports'), where('shareholderCode', '==', reportSearchCode));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setSearchResult(list);
      if (list.length === 0) showToast("কোন রিপোর্ট পাওয়া যায়নি", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `reports?code=${reportSearchCode}`);
    } finally {
      setIsFetchingReports(false);
    }
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
           <p>রিপোর্ট সেকশনটি আপাতত রক্ষণাবেক্ষণাধীন রয়েছে।</p>
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

  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleCustomLogin = async (role: 'admin' | 'user', identifier: string) => {
    try {
      setLoading(true);
      
      // Look for existing user with this identifier
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('identifier', '==', identifier));
      const querySnapshot = await getDocs(q);
      
      let profile: any = null;
      let uid = "";

      if (!querySnapshot.empty) {
        // User exists
        const userDoc = querySnapshot.docs[0];
        profile = { ...userDoc.data(), id: userDoc.id };
        uid = userDoc.id;
        
        if (profile.disabled) {
          showToast("আপনার অ্যাকাউন্টটি লক করা হয়েছে", "error");
          setLoading(false);
          return;
        }
      } else {
        // Create new user
        uid = "user_" + Date.now();
        profile = {
          uid: uid,
          identifier: identifier,
          displayName: role === 'admin' ? 'Admin' : 'Shareholder',
          role: role,
          disabled: role === 'admin' ? false : false, // Default active
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', uid), profile);
      }
      
      setUserProfile(profile);
      localStorage.setItem('insaf_user_profile', JSON.stringify(profile));
      showToast("সফলভাবে লগইন করা হয়েছে!", "success");
      
    } catch (err: any) {
      console.error("Login Error:", err);
      showToast("লগইন ব্যর্থ হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setUserProfile(null);
      localStorage.removeItem('insaf_user_profile');
      await signOut(auth);
      showToast("লগআউট সফল হয়েছে", "info");
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
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -inset-1 border border-dashed border-[#D4AF37] rounded-full" />
              <div className="relative w-11 h-11 bg-[#0a192f] rounded-full overflow-hidden border border-[#D4AF37]/30 flex items-center justify-center shadow-inner">
                <img src={logo} alt="Al-Insaf Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className={`font-serif text-2xl font-bold leading-none tracking-tight ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>আল-ইনসাফ</span>
              <span className={`text-[9px] tracking-[0.1em] uppercase font-bold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Al-Insaf Organization</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {['হোম', 'বিস্তারিত', 'যোগাযোগ'].map((link, idx) => (
              <button 
                key={idx} 
                onClick={() => scrollToSection(link === 'হোম' ? 'home' : link === 'বিস্তারিত' ? 'explore' : 'contact')}
                className={`text-sm font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-gray-600 hover:text-[#064E3B]'}`}
              >
                {link}
              </button>
            ))}
            
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMoreMenuOpen(!isMoreMenuOpen); }}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <MoreVertical size={20} />
              </button>
              
              <AnimatePresence>
                {isMoreMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                    className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border overflow-hidden z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                  >
                    <div className="p-2 space-y-1">
                      <button onClick={() => { openModal('reports-search'); setIsMoreMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                        <div className="w-8 h-8 rounded-lg bg-[#064E3B]/10 text-[#064E3B] flex items-center justify-center"><Search size={18} /></div>
                        <span className="text-sm font-bold">রিপোর্ট সার্চ</span>
                      </button>
                      {userProfile && (
                        <>
                          {(userProfile.role === 'admin' || userProfile.role === 'employee') && (
                            <button onClick={() => { openModal('members-directory'); setIsMoreMenuOpen(false); fetchUsers(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center"><Users size={18} /></div>
                              <span className="text-sm font-bold">মেম্বার ডিরেক্টরি</span>
                            </button>
                          )}
                          <button onClick={() => { openModal('my-account'); setIsMoreMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><User size={18} /></div>
                            <span className="text-sm font-bold">আমার ড্যাশবোর্ড</span>
                          </button>
                        </>
                      )}
                      {userProfile?.role === 'admin' && (
                        <button onClick={() => { openAdminModal(); setIsMoreMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                          <Settings size={18} /><span className="text-sm font-bold text-[#D4AF37]">অ্যাডমিন সেটিংস</span>
                        </button>
                      )}
                      {userProfile ? (
                        <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-500 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'}`}>
                          <LogOut size={18} /><span className="text-sm font-bold">লগআউট</span>
                        </button>
                      ) : (
                        <button onClick={handleLogin} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-[#064E3B] ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <LogIn size={18} /><span className="text-sm font-bold">লগইন করুন</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={toggleDarkMode} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => openModal('join')} className="bg-[#064E3B] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#064E3B]/90 transition-all shadow-md active:scale-95">যুক্ত হোন</button>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <button onClick={toggleDarkMode} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            <button className={`${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className={`fixed inset-y-0 right-0 w-[85%] max-w-sm z-[60] shadow-2xl overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] p-0.5 overflow-hidden bg-white">
                        <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h2 className={`font-serif text-xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>আল-ইনসাফ</h2>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Al-Insaf Organization</p>
                      </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}><X size={24} /></button>
                  </div>

                  <div className={`space-y-1 mb-6 border-b pb-6 ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    {['হোম', 'বিস্তারিত', 'যোগাযোগ'].map((link, idx) => (
                      <button key={idx} onClick={() => { scrollToSection(link === 'হোম' ? 'home' : link === 'বিস্তারিত' ? 'explore' : 'contact'); setIsMobileMenuOpen(false); }} className={`w-full text-left py-3 font-bold text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-[#064E3B] hover:text-[#D4AF37]'}`}>{link}</button>
                    ))}
                  </div>

                  {userProfile ? (
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#064E3B] text-xl font-bold">{userProfile?.displayName?.charAt(0) || 'U'}</div>
                        <div>
                          <h4 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{userProfile?.displayName || 'Shareholder'}</h4>
                          <p className="text-xs text-gray-400 font-medium">{userProfile?.identifier || userProfile?.shareholderCode}</p>
                        </div>
                      </div>
                      <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"><LogOut size={18} /> লগআউট</button>
                    </div>
                  ) : (
                    <button onClick={() => { handleLogin(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-4 bg-gray-50 text-[#064E3B] font-bold rounded-2xl mb-6 border-2 border-dashed border-gray-200"><LogIn size={20} /> লগইন করুন</button>
                  )}

                  <div className="space-y-4 mb-8">
                    <p className="text-[10px] text-gray-400 font-bold leading-tight">আপনার গুরুত্বপূর্ণ তথ্য দেখতে নিচের বাটনগুলো ব্যবহার করুন।</p>
                    
                    <button onClick={() => { openModal('reports-search'); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 group transition-all p-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-400 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37]'}`}><Search size={22} /></div>
                      <span className={`font-bold text-sm ${isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-[#064E3B]'}`}>রিপোর্ট সার্চ</span>
                    </button>

                    {(userProfile?.role === 'admin' || userProfile?.role === 'employee') && (
                      <button onClick={() => { openModal('members-directory'); setIsMobileMenuOpen(false); fetchUsers(); }} className="w-full flex items-center gap-4 group transition-all p-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}><Users size={22} /></div>
                        <span className={`font-bold text-sm ${isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-[#064E3B]'}`}>মেম্বার ডিরেক্টরি</span>
                      </button>
                    )}

                    <button onClick={() => { openModal('my-account'); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 group transition-all p-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}><User size={22} /></div>
                      <span className={`font-bold text-sm ${isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-[#064E3B]'}`}>আমার ড্যাশবোর্ড</span>
                    </button>
                    
                    {userProfile?.role === 'admin' && (
                      <button onClick={() => { openAdminModal(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 group transition-all p-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600'}`}><Settings size={22} /></div>
                        <span className={`font-bold text-sm ${isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-[#064E3B]'}`}>অ্যাডমিন প্যানেল</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button onClick={() => { openModal('join'); setIsMobileMenuOpen(false); }} className="w-full bg-[#064E3B] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-emerald-900/10 active:scale-95 transition-all">যুক্ত হোন</button>
                    <button onClick={() => { openModal('join'); setIsMobileMenuOpen(false); }} className="w-full bg-[#D4AF37] text-[#064E3B] py-4 rounded-xl font-bold text-base shadow-lg shadow-amber-600/10 active:scale-95 transition-all">সদস্য হোন</button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-20">
        {/* Dynamic Notice Ticker */}
        <div className="w-full bg-[#D4AF37] overflow-hidden py-1.5 border-y border-[#064E3B]/10">
          <motion.div 
            className="whitespace-nowrap font-bold text-[#064E3B] flex items-center gap-10" 
            initial={{ x: "100%" }} 
            animate={{ x: "-100%" }} 
            transition={{ repeat: Infinity, duration: notices.length > 0 ? notices.length * 15 : 25, ease: "linear" }}
          >
            {notices.length > 0 ? notices.map((n, i) => (
              <span key={i} className="flex items-center gap-2">
                <Info size={14} className="opacity-50" /> {n.title}: {n.content} <span className="mx-4 opacity-20">|</span>
              </span>
            )) : (
              <span>আমাদের "খেদমতে খলক্ব" ফান্ডে অংশগ্রহণ করে উম্মাহর কল্যাণে এগিয়ে আসুন। — আমাদের "খেদমতে খলক্ব" ফান্ডে অংশগ্রহণ করে উম্মাহর কল্যাণে এগিয়ে আসুন।</span>
            )}
          </motion.div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2 sm:gap-3">
          <motion.a animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} href="https://wa.me/8801880917816" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3.5 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.a>
          <motion.a animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.3, ease: "easeInOut" }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} href="https://www.facebook.com/profile.php?id=61585517853683" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
            <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.a>
          <motion.a animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.6, ease: "easeInOut" }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} href="tel:+8801880917816" className="p-2 sm:p-3.5 bg-[#064E3B] text-white rounded-full shadow-lg hover:bg-[#064E3B]/90 transition-colors">
            <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.a>
        </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {cardData.map((card, idx) => (
                <motion.button key={idx} onClick={() => openModal(card.id)} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-[#D4AF37]/20 shadow-sm'} p-5 sm:p-8 rounded-2xl border transition-all text-left flex flex-col group`}>
                  <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-0 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#064E3B] group-hover:text-white transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : card.color}`}>
                      {React.cloneElement(card.icon as React.ReactElement, { size: 24, className: "sm:w-8 sm:h-8" })}
                    </div>
                    <h3 className={`font-serif text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>{card.title}</h3>
                  </div>
                  <p className={`text-xs sm:text-sm mb-4 sm:mb-6 flex-1 mt-2 sm:mt-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{card.description}</p>
                  <div className="text-[#D4AF37] font-medium text-xs sm:text-sm flex items-center gap-1">বিস্তারিত দেখুন <ChevronRight size={16} /></div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Notice Board Section */}
        {notices.length > 0 && (
          <section className={`py-20 border-t ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                  <h2 className={`font-serif text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>নোটিশ বোর্ড</h2>
                  <div className="w-16 h-1 bg-[#D4AF37] rounded-full"></div>
                </div>
                <p className="text-gray-400 text-sm max-w-md font-medium tracking-wide">আমাদের প্রতিষ্ঠানের সর্বশেষ ঘোষণা ও আপডেটসমূহ এখানে দেখতে পাবেন।</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notices.slice(0, 6).map((notice, idx) => (
                  <motion.div 
                    key={notice.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#FDFCF0] border-[#D4AF37]/20 shadow-sm'} hover:shadow-xl transition-all group`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#064E3B] flex items-center justify-center font-bold text-lg">{idx + 1}</div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(notice.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h3 className={`font-bold text-xl mb-3 ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>{notice.title}</h3>
                    <p className={`text-sm leading-relaxed mb-6 line-clamp-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{notice.content}</p>
                    <button onClick={() => { setActiveModal('notice-detail'); setEditData(notice); }} className="text-[#D4AF37] font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">বিস্তারিত পড়ুন <ChevronRight size={14} /></button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {galleryItems.length > 0 && (
          <section className={`py-20 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-[#FDFCF0] border-gray-100'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className={`font-serif text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-[#064E3B]'}`}>আমাদের কার্যক্রম</h2>
                <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full mb-4"></div>
                <p className="text-gray-500 font-medium">ছবির মাধ্যমে আমাদের কিছু সামাজিক ও সাংগঠনিক কার্যক্রমের এক ঝলক।</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryItems.slice(0, 8).map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`group relative aspect-square rounded-[2rem] overflow-hidden border-2 ${isDarkMode ? 'border-gray-700' : 'border-white'} shadow-lg`}
                  >
                    <img src={item.url} alt={item.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                      <p className="text-white font-bold text-sm mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.caption}</p>
                      <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest transform translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700">{item.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

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
              <div className="bg-[#064E3B] p-6 md:p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group self-center lg:max-w-md ml-auto">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                <h3 className="font-serif text-xl font-bold mb-4 relative z-10">বার্তা পাঠান</h3>
                <form className="space-y-3 relative z-10" onSubmit={handleSendMessage}>
                  <input 
                    type="text" 
                    value={contactForm.name} 
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] transition-all" 
                    placeholder="আপনার নাম" 
                  />
                  <input 
                    type="tel" 
                    value={contactForm.number} 
                    onChange={(e) => setContactForm({...contactForm, number: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] transition-all" 
                    placeholder="আপনার নাম্বার" 
                  />
                  <textarea 
                    rows={3} 
                    value={contactForm.message} 
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] resize-none transition-all" 
                    placeholder="আপনার বার্তা"
                  ></textarea>
                  <button className="w-full bg-[#D4AF37] text-[#064E3B] font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white hover:text-[#064E3B] transition-all text-sm shadow-lg shadow-black/20">বার্তা পাঠান <Send size={16} /></button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#042A1E] text-white pt-20 pb-10 border-t border-[#D4AF37]/10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#0a192f] border border-[#D4AF37]/30 flex items-center justify-center">
                <img src={logo} alt="Logo" className="w-full h-full object-contain scale-110" referrerPolicy="no-referrer" />
              </div>
              <span className="font-serif text-2xl font-bold">আল-<span className="text-[#D4AF37]">ইনসাফ</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              স্বচ্ছতা, ন্যায্যতা এবং পারস্পরিক সহযোগিতার ভিত্তিতে গড়ে ওঠা একটি আর্থ-সামাজিক উদ্যোগ। আমরা সমাজের ক্ষমতায়ন ও নৈতিক অর্থনীতি প্রতিষ্ঠায় অঙ্গীকারবদ্ধ।
            </p>
            <div className="flex gap-3">
               <a href="https://www.facebook.com/profile.php?id=61585517853683" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#064E3B] transition-all"><Facebook size={18} /></a>
               <a href="https://wa.me/8801880917816" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"><MessageCircle size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6 border-b border-[#D4AF37]/20 pb-2 inline-block">গুরুত্বপূর্ণ লিংক</h4>
            <ul className="space-y-4">
              <li><button onClick={() => scrollToSection('home')} className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-2"><ChevronRight size={14} /> হোম</button></li>
              <li><button onClick={() => scrollToSection('explore')} className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-2"><ChevronRight size={14} /> আমাদের সম্পর্কে</button></li>
              <li><button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-2"><ChevronRight size={14} /> যোগাযোগ</button></li>
              <li><a href={siteContent?.reportUrl || "https://tinyurl.com/al-insafreport"} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-2"><ChevronRight size={14} /> ইনভেস্টমেন্ট রিপোর্ট</a></li>
            </ul>
          </div>

          {/* Core Objectives */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-6 border-b border-[#D4AF37]/20 pb-2 inline-block">আমাদের লক্ষ্যসমূহ</h4>
            <ul className="space-y-3">
              {(siteContent?.objectives || [
                "স্বচ্ছতা ও জবাবদিহিতা নিশ্চিত করা",
                "আস্থা ও ভ্রাতৃত্ব বৃদ্ধি করা",
                "ইসলামিক অর্থনীতি বাস্তবায়ন"
              ]).slice(0, 3).map((obj: string, i: number) => (
                <li key={i} className="text-gray-400 text-[11px] leading-relaxed flex gap-2">
                  <span className="text-[#D4AF37] font-bold mt-1">•</span>
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h4 className="font-serif text-lg font-bold mb-2 border-b border-[#D4AF37]/20 pb-2 inline-block">যোগাযোগের ঠিকানা</h4>
            <div className="space-y-4">
              <div className="flex gap-3 text-gray-400">
                <MapPin size={18} className="text-[#D4AF37] shrink-0" />
                <p className="text-sm">ঢাকা, বাংলাদেশ</p>
              </div>
              <div className="flex gap-3 text-gray-400">
                <Phone size={18} className="text-[#D4AF37] shrink-0" />
                <p className="text-sm">01880917816</p>
              </div>
              <div className="flex gap-3 text-gray-400">
                <Mail size={18} className="text-[#D4AF37] shrink-0" />
                <p className="text-sm">alinsaf34@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          <p>&copy; {new Date().getFullYear()} আল-ইনসাফ অর্গানাইজেশন। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-6">
            <button className="hover:text-gray-300">Terms & Conditions</button>
            <button className="hover:text-gray-300">Privacy Policy</button>
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
                    <button onClick={() => { setAdminTab('analytics'); setIsEditing(null); fetchUsers(); }} className={`px-4 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${adminTab === 'analytics' ? 'border-[#D4AF37] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <PieChart size={16} /> অ্যানালিটিক্স
                    </button>
                    <button onClick={() => { setAdminTab('settings'); setIsEditing(null); }} className={`px-4 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${adminTab === 'settings' ? 'border-[#D4AF37] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <Database size={16} /> সাইট কন্টেন্ট
                    </button>
                    <button onClick={() => { setAdminTab('users'); setIsEditing(null); fetchUsers(); }} className={`px-4 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${adminTab === 'users' ? 'border-[#D4AF37] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <Users size={16} /> ইউজার লিস্ট
                    </button>
                    <button onClick={() => { setAdminTab('reports'); setIsEditing(null); fetchReports(); }} className={`px-4 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${adminTab === 'reports' ? 'border-[#D4AF37] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <FileText size={16} /> রিপোর্ট এন্ট্রি
                    </button>
                    <button onClick={() => { setAdminTab('notices'); setIsEditing(null); }} className={`px-4 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${adminTab === 'notices' ? 'border-[#D4AF37] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <Info size={16} /> নোটিশ বোর্ড
                    </button>
                    <button onClick={() => { setAdminTab('gallery'); setIsEditing(null); }} className={`px-4 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${adminTab === 'gallery' ? 'border-[#D4AF37] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <Database size={16} /> গ্যালারি
                    </button>
                    <button onClick={() => { setAdminTab('messages'); setIsEditing(null); fetchMessages(); }} className={`px-4 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${adminTab === 'messages' ? 'border-[#D4AF37] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <Mail size={16} /> মেসেজ
                    </button>
                    <button onClick={() => { setAdminTab('tasks'); setIsEditing(null); fetchTasks(); }} className={`px-4 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${adminTab === 'tasks' ? 'border-[#D4AF37] text-[#064E3B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      <Activity size={16} /> টাস্ক
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
                    ) : adminTab === 'analytics' ? (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                              <h4 className="font-bold text-[#064E3B] mb-4 flex items-center gap-2 text-sm"><Wallet size={16} className="text-[#D4AF37]" /> ফাইন্যান্সিয়াল সামারি</h4>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl">
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">মোট ফান্ড (আনুমানিক)</p>
                                    <h3 className="text-xl font-bold text-green-700">৳ ৫,০০,০০০</h3>
                                  </div>
                                  <div className="w-10 h-10 bg-green-200 text-green-700 rounded-full flex items-center justify-center"><Activity size={18}/></div>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl">
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">চলতি মাসের সংগ্রহ</p>
                                    <h3 className="text-xl font-bold text-blue-700">৳ ৪৫,০০০</h3>
                                  </div>
                                  <div className="w-10 h-10 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center"><PieChart size={18}/></div>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-amber-50 rounded-2xl">
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">বকেয়া পেমেন্ট (আনুমানিক)</p>
                                    <h3 className="text-xl font-bold text-amber-700">৳ ১২,০০০</h3>
                                  </div>
                                  <div className="w-10 h-10 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center"><Info size={18}/></div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                              <h4 className="font-bold text-[#064E3B] mb-4 flex items-center gap-2 text-sm"><Activity size={16} className="text-[#D4AF37]" /> রিটেইল ট্রানজেকশন (Mock)</h4>
                              <div className="flex-1 flex justify-center items-center h-48 py-4">
                               <ResponsiveContainer width="100%" height="100%">
                                   <BarChart data={[
                                    { name: 'জানু', amount: 40000 },
                                    { name: 'ফেব্রু', amount: 30000 },
                                    { name: 'মার্চ', amount: 45000 },
                                    { name: 'এপ্রিল', amount: 25000 },
                                  ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px' }} />
                                    <YAxis hide />
                                    <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={25} fill="#D4AF37" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                          <h4 className="font-bold text-[#064E3B] mb-4 flex items-center gap-2 text-sm"><Users size={16} className="text-[#D4AF37]" /> ডিটেইল্ড ইউজার অ্যাক্টিভিটি লগ</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-gray-100">
                                  <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">রোল</th>
                                  <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">নাম/আইডি</th>
                                  <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">স্ট্যাটাস</th>
                                  <th className="py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">যোগদানের তারিখ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {usersList.slice().sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || '')).map((usr, i) => (
                                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3 px-4">
                                      <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${usr.role === 'admin' ? 'bg-red-100 text-red-600' : usr.role === 'employee' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>{usr.role || 'Shareholder'}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="font-bold text-[#064E3B] text-xs">{usr.displayName || 'Anonymous'}</div>
                                      <div className="text-[10px] text-gray-400">{usr.identifier || usr.email || 'N/A'}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${usr.disabled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{usr.disabled ? 'Locked' : 'Active'}</span>
                                    </td>
                                    <td className="py-3 px-4 text-[11px] text-gray-500 font-medium">
                                      {usr.createdAt ? new Date(usr.createdAt).toLocaleString('bn-BD') : 'অজানা'}
                                    </td>
                                  </tr>
                                ))}
                                {usersList.length === 0 && (
                                  <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-xs italic">কোন তথ্য পাওয়া যায়নি</td></tr>
                                )}
                              </tbody>
                            </table>
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
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">মেম্বার সংখ্যা লেবেল</label><input value={editData.memberCount || ""} onChange={(e) => setEditData({...editData, memberCount: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm font-serif" /></div>
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">রিপোর্ট লিঙ্ক</label><input value={editData.reportUrl || ""} onChange={(e) => setEditData({...editData, reportUrl: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm" /></div>
                                <button 
                                  onClick={handleSaveContent} 
                                  className={`w-full py-4 text-white font-bold rounded-xl mt-4 shadow-lg transition-all ${saveSuccess ? 'bg-green-500 shadow-green-100' : 'bg-[#064E3B] shadow-emerald-100'}`}
                                >
                                  {saveSuccess ? 'সাফল্যের সাথে সেভ হয়েছে!' : 'পরিবর্তন সেভ করুন'}
                                </button>
                              </div>
                            )}

                            {isEditing === 'intro' && (
                              <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">পরিচিতি টেক্সট</label><textarea rows={4} value={editData.introText} onChange={(e) => setEditData({...editData, introText: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none resize-none text-sm leading-relaxed" /></div>
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">মূল বাণী (Quote)</label><textarea rows={2} value={editData.quote} onChange={(e) => setEditData({...editData, quote: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none italic resize-none text-sm" /></div>
                                <button 
                                  onClick={handleSaveContent} 
                                  className={`w-full py-4 text-white font-bold rounded-xl mt-4 shadow-lg transition-all ${saveSuccess ? 'bg-green-500 shadow-green-100' : 'bg-[#064E3B] shadow-emerald-100'}`}
                                >
                                  {saveSuccess ? 'সাফল্যের সাথে সেভ হয়েছে!' : 'পরিবর্তন সেভ করুন'}
                                </button>
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
                                <button 
                                  onClick={handleSaveContent} 
                                  className={`w-full py-4 text-white font-bold rounded-xl mt-4 shadow-lg transition-all ${saveSuccess ? 'bg-green-500 shadow-green-100' : 'bg-[#064E3B] shadow-emerald-100'}`}
                                >
                                  {saveSuccess ? 'সাফল্যের সাথে সেভ হয়েছে!' : 'পরিবর্তন সেভ করুন'}
                                </button>
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
                                <button 
                                  onClick={handleSaveContent} 
                                  className={`w-full py-4 text-white font-bold rounded-xl mt-4 shadow-lg transition-all ${saveSuccess ? 'bg-green-500 shadow-green-100' : 'bg-[#064E3B] shadow-emerald-100'}`}
                                >
                                  {saveSuccess ? 'সাফল্যের সাথে সেভ হয়েছে!' : 'পরিবর্তন সেভ করুন'}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                               <div className="flex items-center gap-3 mb-6">
                                 <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                   <Database size={20} />
                                 </div>
                                 <div>
                                   <h3 className="font-bold text-[#064E3B]">ডাটা ম্যানেজমেন্ট ও সিঙ্ক্রোনাইজেশন</h3>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Update core shareholder records</p>
                                 </div>
                               </div>
                               
                               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 font-sans">
                                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                     অফিসিয়াল ২০ জন শেয়ারহোল্ডারের তথ্য (নাম, মোবাইল নম্বর এবং প্রারম্ভিক জমা) ডাটাবেসে সিঙ্ক করতে নিচের বাটনে ক্লিক করুন। এটি নতুন ইউজারদের জন্য প্রোফাইল তৈরি করবে এবং ব্যালেন্স আপডেট করবে।
                                  </p>
                                  <button 
                                    onClick={syncOfficialData}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all text-sm"
                                  >
                                    <Activity size={16} /> অফিসিয়াল ডাটা সিঙ্ক করুন
                                  </button>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          </div>
                        )}
                      </div>
                    ) : adminTab === 'users' ? (
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
                                    <div className="flex items-center gap-2">
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[7px] font-bold text-gray-400 uppercase ml-1">কোড</label>
                                        <input 
                                          type="text" 
                                          defaultValue={usr.shareholderCode || ''} 
                                          onBlur={(e) => {
                                            if (e.target.value !== (usr.shareholderCode || '')) {
                                              updateUserCode(usr.id, e.target.value);
                                            }
                                          }}
                                          placeholder="INS-101"
                                          className="text-[9px] font-bold px-2 py-1 bg-white border border-gray-100 rounded-lg shadow-sm outline-none w-20"
                                        />
                                      </div>
                                      <select 
                                        value={usr.role || 'shareholder'} 
                                        onChange={(e) => updateUserRole(usr.id, e.target.value)}
                                        className="text-[11px] font-bold p-2.5 bg-white border-none rounded-xl shadow-sm cursor-pointer outline-none focus:ring-1 ring-[#D4AF37] h-10 self-end"
                                      >
                                        <option value="shareholder">শেয়ারহোল্ডার</option>
                                        <option value="employee">কর্মচারী</option>
                                        <option value="admin">অ্যাডমিন</option>
                                      </select>
                                      <button 
                                        onClick={() => toggleUserStatus(usr.id, usr.disabled)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${usr.disabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-red-50 text-red-600 hover:bg-red-100'} mt-auto`}
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
                    ) : adminTab === 'reports' ? (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                          <h3 className="font-serif font-bold text-xl text-[#064E3B] mb-4">নতুন রিপোর্ট এন্ট্রি</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">শেয়ারহোল্ডার কোড</label>
                              <input type="text" value={reportForm.shareholderCode} onChange={(e) => setReportForm({...reportForm, shareholderCode: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none font-bold" placeholder="যেমন: INS-101" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">মাস</label>
                              <input type="text" value={reportForm.month} onChange={(e) => setReportForm({...reportForm, month: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none font-bold" placeholder="যেমন: জানুয়ারি ২০২৪" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">জমা পরিমাণ (৳)</label>
                              <input type="number" value={reportForm.amount} onChange={(e) => setReportForm({...reportForm, amount: Number(e.target.value)})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none font-bold" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">প্রিমিয়াম (৳)</label>
                              <input type="number" value={reportForm.premiumAmount} onChange={(e) => setReportForm({...reportForm, premiumAmount: Number(e.target.value)})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none font-bold" />
                            </div>
                          </div>
                          <button onClick={() => addReport(reportForm)} className="mt-6 w-full py-4 bg-[#064E3B] text-white font-bold rounded-2xl shadow-lg shadow-[#064E3B]/20 hover:bg-[#064E3B]/90 transition-all">রিপোর্ট সেভ করুন</button>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="font-serif font-bold text-lg text-[#064E3B]">সাম্প্রতিক রিপোর্টসমূহ</h3>
                              <button onClick={fetchReports} className="p-2 text-[#D4AF37] hover:bg-gray-50 rounded-xl transition-all"><Activity size={18} /></button>
                           </div>
                           <div className="overflow-x-auto">
                              <table className="w-full">
                                 <thead>
                                    <tr className="text-left border-b border-gray-50">
                                       <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">কোড</th>
                                       <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">মাস</th>
                                       <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">পরিমাণ</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-50">
                                    {reportsList.slice(0, 10).map((r: any) => (
                                       <tr key={r.id}>
                                          <td className="py-3 text-sm font-bold text-[#064E3B]">{r.shareholderCode}</td>
                                          <td className="py-3 text-xs text-gray-500">{r.month}</td>
                                          <td className="py-3 text-sm font-bold text-emerald-600 text-right">৳{r.amount}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                      </div>
                    ) : adminTab === 'tasks' ? (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                          <h3 className="font-serif font-bold text-xl text-[#064E3B] mb-4">নতুন টাস্ক তৈরি করুন</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">টাস্ক শিরোনাম</label>
                              <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none font-bold" placeholder="যেমন: মাসিক রিপোর্ট তৈরি করুন" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">বিস্তারিত বিবরণ</label>
                              <textarea rows={3} value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none font-medium" placeholder="টাস্ক সম্পর্কে বিস্তারিত লিখুন..." />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">দায়িত্বপ্রাপ্ত ব্যক্তি</label>
                              <select 
                                value={taskForm.assigneeId} 
                                onChange={(e) => {
                                  const selectedUser = usersList.find(u => u.uid === e.target.value);
                                  setTaskForm({
                                    ...taskForm, 
                                    assigneeId: e.target.value, 
                                    assigneeName: selectedUser ? (selectedUser.displayName || selectedUser.email) : ''
                                  });
                                }} 
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none font-bold appearance-none"
                              >
                                <option value="">নির্বাচন করুন</option>
                                {usersList.filter(u => u.role === 'admin' || u.role === 'employee').map(u => (
                                  <option key={u.uid} value={u.uid}>{u.displayName || u.email} ({u.role})</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">শেষ সময় (Deadline)</label>
                              <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none font-bold" />
                            </div>
                          </div>
                          <button onClick={addTask} className="mt-6 w-full py-4 bg-[#064E3B] text-white font-bold rounded-2xl shadow-lg shadow-[#064E3B]/20 hover:bg-[#064E3B]/90 transition-all">টাস্ক অ্যাসাইন করুন</button>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                           <h3 className="font-serif font-bold text-lg text-[#064E3B] mb-4">টাস্ক লিস্ট</h3>
                           <div className="space-y-4">
                              {tasks.length === 0 ? (
                                <p className="text-center py-10 text-gray-400 text-xs italic">কোন টাস্ক পাওয়া যায়নি</p>
                              ) : (
                                tasks.map((t) => (
                                  <div key={t.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-[#064E3B]">{t.title}</h4>
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                          t.status === 'Completed' ? 'bg-green-100 text-green-600' : 
                                          t.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                                        }`}>{t.status}</span>
                                      </div>
                                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{t.description}</p>
                                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                        <span className="flex items-center gap-1"><User size={10} /> {t.assigneeName}</span>
                                        <span className="flex items-center gap-1"><Activity size={10} /> {t.dueDate || 'No deadline'}</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <select 
                                        value={t.status} 
                                        onChange={(e) => updateTaskStatus(t.id!, e.target.value as any)}
                                        className="text-[10px] font-bold bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none"
                                      >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                      </select>
                                    </div>
                                  </div>
                                ))
                              )}
                           </div>
                        </div>
                      </div>
                    ) : adminTab === 'notices' ? (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                          <h3 className="font-serif font-bold text-xl text-[#064E3B] mb-4">নতুন নোটিশ যোগ করুন</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">শিরোনাম</label>
                              <input type="text" value={noticeForm.title} onChange={(e) => setNoticeForm({...noticeForm, title: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none font-bold" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">বিস্তারিত</label>
                              <textarea rows={4} value={noticeForm.content} onChange={(e) => setNoticeForm({...noticeForm, content: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none font-medium" />
                            </div>
                          </div>
                          <button onClick={() => addNotice(noticeForm)} className="mt-6 w-full py-4 bg-[#D4AF37] text-[#064E3B] font-bold rounded-2xl shadow-lg shadow-[#D4AF37]/20 hover:bg-[#D4AF37]/90 transition-all">নোটিশ পাবলিশ করুন</button>
                        </div>
                        
                        <div className="space-y-4">
                           <h3 className="font-serif font-bold text-lg text-[#064E3B]">বর্তমান নোটিশসমূহ</h3>
                           {notices.map((n: any) => (
                              <div key={n.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-start gap-4">
                                 <div>
                                    <h4 className="font-bold text-[#064E3B] mb-1">{n.title}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{new Date(n.date).toLocaleDateString('bn-BD')}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">{n.content}</p>
                                 </div>
                                 <button onClick={() => deleteNotice(n.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                              </div>
                           ))}
                        </div>
                      </div>
                    ) : adminTab === 'gallery' ? (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                          <h3 className="font-serif font-bold text-xl text-[#064E3B] mb-4">গ্যালারিতে ছবি যোগ করুন</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">ছবি আপলোড করুন</label>
                              <div className="relative group overflow-hidden">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleImageUpload}
                                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-[#D4AF37]/50 transition-all bg-gray-50/50">
                                  {galleryForm.url ? (
                                    <div className="flex flex-col items-center gap-2">
                                       <img src={galleryForm.url} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-[#D4AF37]/20 shadow-sm" />
                                       <p className="text-[10px] font-bold text-[#D4AF37]">ছবি সিলেক্ট করা হয়েছে (পরিবর্তন করতে ক্লিক করুন)</p>
                                    </div>
                                  ) : (
                                    <>
                                      <Plus size={32} className="text-gray-300 group-hover:text-[#D4AF37]/50 transition-colors" />
                                      <p className="text-xs text-gray-400 font-bold">ছবি সিলেক্ট করতে এখানে ক্লিক করুন</p>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 flex items-center gap-2">
                                <span className="h-px bg-gray-100 flex-1"></span>
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">অথবা লিঙ্ক দিন</span>
                                <span className="h-px bg-gray-100 flex-1"></span>
                              </div>
                              <input 
                                type="text" 
                                value={galleryForm.url} 
                                onChange={(e) => setGalleryForm({...galleryForm, url: e.target.value})} 
                                className="w-full mt-3 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none text-xs" 
                                placeholder="https://..." 
                              />
                            </div>
                            <div>
                               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">তারিখ</label>
                               <input type="text" value={galleryForm.date} onChange={(e) => setGalleryForm({...galleryForm, date: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none" placeholder="যেমন: জানুয়ারি ২০২৪" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">ক্যাপশন</label>
                              <input type="text" value={galleryForm.caption} onChange={(e) => setGalleryForm({...galleryForm, caption: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-[#D4AF37]/20 border-none font-bold" />
                            </div>
                          </div>
                          <button onClick={() => addGalleryItem(galleryForm)} className="mt-6 w-full py-4 bg-[#0a192f] text-[#D4AF37] font-bold rounded-2xl shadow-lg border border-[#D4AF37]/30 hover:bg-black transition-all">গ্যালারিতে যোগ করুন</button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {galleryItems.map((item: any) => (
                              <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                 <img src={item.url} alt={item.caption} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                    <p className="text-white text-[10px] font-bold text-center mb-2">{item.caption}</p>
                                    <button onClick={() => deleteGalleryItem(item.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"><Trash2 size={16} /></button>
                                 </div>
                              </div>
                           ))}
                        </div>
                      </div>
                    ) : adminTab === 'messages' ? (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-serif font-bold text-xl text-[#064E3B]">প্রাপ্ত মেসেজ সমূহ</h3>
                          <button onClick={fetchMessages} className={`p-2 rounded-xl border-2 transition-all ${isFetchingMessages ? 'animate-pulse' : 'hover:bg-gray-100'}`}>
                            <Activity size={16} className="text-[#D4AF37]"/>
                          </button>
                        </div>
                        
                        {isFetchingMessages ? (
                          <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]"></div></div>
                        ) : (
                          <div className="space-y-4">
                             {messages.length === 0 && (
                               <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                 <Mail size={48} className="mx-auto text-gray-200 mb-4" />
                                 <p className="text-gray-400 font-serif italic">কোন মেসেজ পাওয়া যায়নি</p>
                               </div>
                             )}
                             {messages.filter(m => !m.deleted).map((m: any) => (
                               <div key={m.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                 <div className="flex justify-between items-start gap-4">
                                   <div className="flex items-start gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-[#FDFCF0] text-[#064E3B] flex items-center justify-center shrink-0 border border-[#D4AF37]/20">
                                       <User size={20} />
                                     </div>
                                     <div>
                                       <div className="flex items-center gap-2 mb-1">
                                         <p className="font-bold text-[#064E3B]">{m.name}</p>
                                         <span className="text-[10px] text-gray-400 font-bold">•</span>
                                         <p className="text-[10px] text-gray-400 font-bold">{m.number}</p>
                                       </div>
                                       <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-50">{m.message}</p>
                                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                                         <ShieldCheck size={10} className="text-[#D4AF37]" /> {new Date(m.timestamp).toLocaleString('bn-BD')}
                                       </p>
                                     </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                     <a 
                                       href={`https://wa.me/${normalizeWhatsAppNumber(m.number)}`} 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                       title="WhatsApp-এ উত্তর দিন"
                                     >
                                       <MessageCircle size={18} />
                                     </a>
                                     <button 
                                       onClick={() => deleteMessage(m.id)} 
                                       className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                       title="মুছে ফেলুন"
                                     >
                                       <Trash2 size={18} />
                                     </button>
                                   </div>
                                 </div>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4 md:p-6 border-t bg-white flex justify-end shrink-0"><button onClick={closeModal} className="px-10 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors shadow-sm">বন্ধ করুন</button></div>
                </>
              ) : activeModal === 'notice-detail' && editData ? (
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="font-serif text-3xl font-bold text-[#064E3B] mb-2">{editData.title}</h2>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{new Date(editData.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-medium">
                    {editData.content.split('\n').map((para: string, i: number) => (
                      <p key={i} className="mb-4">{para}</p>
                    ))}
                  </div>
                  <div className="mt-10 pt-6 border-t flex justify-end">
                    <button onClick={closeModal} className="px-8 py-2.5 bg-[#064E3B] text-white font-bold rounded-2xl">বন্ধ করুন</button>
                  </div>
                </div>
              ) : activeModal === 'my-account' ? (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-[#064E3B]">আমার ড্যাশবোর্ড</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Personal reports & account details</p>
                    </div>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">প্রোফাইল তথ্য</p>
                       <h3 className="text-xl font-bold text-[#064E3B]">{userProfile?.displayName}</h3>
                       <p className="text-xs text-gray-500 font-medium">কোড: {userProfile?.shareholderCode}</p>
                       <p className="text-xs text-gray-500 font-medium">মোবাইল: {userProfile?.identifier}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner flex flex-col justify-center">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">আপনার কোড</p>
                       <h3 className="text-2xl font-serif font-bold text-[#064E3B]">{userProfile?.shareholderCode || 'নির্ধারিত হয়নি'}</h3>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">মোট জমা (৳)</p>
                       <h3 className="text-3xl font-serif font-bold text-emerald-600">
                          ৳ {personalReports.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('bn-BD')}
                       </h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-[#064E3B] text-sm flex items-center gap-2">
                       <Activity size={16} className="text-[#D4AF37]" /> সাম্প্রতিক পেমেন্ট হিস্ট্রি
                    </h4>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar pr-1">
                       {personalReports.length === 0 && (
                         <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                           <FileX size={40} className="mx-auto text-gray-200 mb-2" />
                           <p className="text-gray-400 italic">এখনও কোন রিপোর্ট পাওয়া যায়নি</p>
                         </div>
                       )}
                       {personalReports.map((r: any) => (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={r.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex justify-between items-center group hover:border-[#D4AF37]/30 transition-all">
                           <div>
                             <p className="font-bold text-[#064E3B]">{r.month}</p>
                             <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(r.timestamp).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-lg font-bold text-emerald-600">৳{r.amount}</p>
                             {r.premiumAmount > 0 && <p className="text-[8px] text-amber-600 font-bold uppercase tracking-tight">প্রিমিয়াম: ৳{r.premiumAmount}</p>}
                           </div>
                         </motion.div>
                       ))}
                    </div>
                  </div>

                  {/* My Tasks Section */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif font-bold text-xl text-[#064E3B]">আমার টাস্কসমূহ</h3>
                      <span className="text-[10px] bg-[#D4AF37]/10 text-[#064E3B] px-3 py-1 rounded-full font-bold uppercase tracking-widest">{myTasks.length} টি টাস্ক</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {myTasks.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                          <p className="text-gray-400 text-sm italic">আপনার জন্য কোন টাস্ক নেই</p>
                        </div>
                      ) : (
                        myTasks.map(t => (
                          <div key={t.id} className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-[#064E3B]">{t.title}</h4>
                              <span className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase ${
                                t.status === 'Completed' ? 'bg-green-100 text-green-600' : 
                                t.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                              }`}>{t.status}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{t.description}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Activity size={12} /> Deadline: {t.dueDate || 'N/A'}</span>
                              </div>
                              <div className="flex gap-2">
                                {t.status !== 'Completed' && (
                                  <button 
                                    onClick={() => updateTaskStatus(t.id!, 'In Progress')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${t.status === 'In Progress' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                  >
                                    শুরু করুন
                                  </button>
                                )}
                                <button 
                                  onClick={() => updateTaskStatus(t.id!, t.status === 'Completed' ? 'In Progress' : 'Completed')}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${t.status === 'Completed' ? 'bg-gray-100 text-gray-400' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                >
                                  {t.status === 'Completed' ? 'পুনর্বার শুরু করুন' : 'শেষ করুন'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t flex justify-end">
                    <button onClick={closeModal} className="px-10 py-2.5 bg-[#064E3B] text-white font-bold rounded-2xl shadow-lg border border-[#064E3B]/20 hover:bg-black transition-all">বন্ধ করুন</button>
                  </div>
                </div>
              ) : activeModal === 'reports-search' ? (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-[#064E3B]">রিপোর্ট সার্চ</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Search payments by code</p>
                    </div>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                  </div>
                  
                  <div className="flex gap-3 mb-8">
                    <input 
                      type="text" 
                      value={reportSearchCode} 
                      onChange={(e) => setReportSearchCode(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && searchReport()}
                      placeholder="শেয়ারহোল্ডার কোড (যেমন: INS-101)" 
                      className="flex-1 p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-[#D4AF37]/30 font-bold"
                    />
                    <button onClick={searchReport} className="px-6 bg-[#D4AF37] text-[#064E3B] font-bold rounded-2xl hover:bg-[#D4AF37]/90 transition-all shadow-lg active:scale-95"><Search size={20} /></button>
                  </div>

                  {isFetchingReports ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]"></div></div>
                  ) : (
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar pb-4">
                      {searchResult.length > 0 ? searchResult.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((r: any) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={r.id} className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex justify-between items-center">
                          <div>
                            <p className="font-bold text-[#064E3B] text-lg">{r.month}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(r.timestamp).toLocaleDateString('bn-BD')}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-2xl font-serif font-bold text-emerald-600">৳{r.amount}</p>
                             {r.premiumAmount > 0 && <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">প্রিমিয়াম: ৳{r.premiumAmount}</p>}
                          </div>
                        </motion.div>
                      )) : reportSearchCode && !isFetchingReports ? (
                        <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                           <FileX size={48} className="mx-auto text-gray-300 mb-4" />
                           <p className="text-gray-400 font-serif italic">কোন তথ্য পাওয়া যায়নি</p>
                        </div>
                      ) : (
                        <div className="text-center py-20 opacity-30">
                           <Search size={48} className="mx-auto text-gray-300 mb-4" />
                           <p className="text-gray-400">আপনার কোড লিখে সার্চ করুন</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-6 pt-6 border-t flex justify-end">
                    <button onClick={closeModal} className="px-8 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-2xl">বন্ধ করুন</button>
                  </div>
                </div>
              ) : activeModal === 'members-directory' ? (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-[#064E3B]">মেম্বার ডিরেক্টরি</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Registered community members</p>
                    </div>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                    {usersList.filter(u => !u.disabled).sort((a,b) => (a.displayName || '').localeCompare(b.displayName || '')).map((u: any) => (
                      <div key={u.id} className="p-4 bg-white border border-gray-50 rounded-2xl flex items-center gap-4 transition-all hover:border-[#D4AF37]/40 hover:shadow-md group">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 text-[#064E3B] flex items-center justify-center font-bold text-lg group-hover:bg-[#D4AF37] group-hover:text-[#064E3B] transition-colors">{u.displayName?.charAt(0) || 'U'}</div>
                        <div>
                          <p className="font-bold text-[#064E3B] text-sm group-hover:text-[#D4AF37] transition-colors">{u.displayName || 'Unnamed Member'}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{u.code || 'ID: ' + u.id.slice(0, 6).toUpperCase()}</p>
                          <span className="inline-block mt-1 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{u.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t flex justify-end">
                    <button onClick={closeModal} className="px-8 py-2.5 bg-[#064E3B] text-white font-bold rounded-2xl">বন্ধ করুন</button>
                  </div>
                </div>
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

      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} onLogin={handleCustomLogin} />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-3 font-bold text-sm ${toast.type === 'success' ? 'bg-[#064E3B] text-white' : toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-white text-gray-800'}`}
          >
            {toast.type === 'success' && <ShieldCheck size={18} />}
            {toast.message}
          </motion.div>
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
