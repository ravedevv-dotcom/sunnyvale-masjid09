import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { BANK_DETAILS, MOSQUE_EMAIL } from './constants';
import { 
  LayoutDashboard, 
  Heart, 
  History, 
  Settings, 
  Copy, 
  CheckCircle, 
  Calendar as CalendarIcon, 
  Search, 
  ArrowUpDown, 
  Filter, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  X, 
  CreditCard, 
  FileText,
  Mail,
  ShieldCheck,
  Clock,
  Send,
  RefreshCw,
  AlertCircle,
  Calculator,
  Compass,
  ArrowRight,
  Megaphone,
  MessageSquarePlus,
  MessageSquare,
  Bell,
  Radio,
  MapPin,
  Users
} from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { FeedbackModal } from './FeedbackModal';
import { AskImamModal } from './AskImamModal';

interface DonationRecord {
  id: string;
  amount: number | string;
  purpose: string;
  timestamp: any;
  userEmail: string;
  userName?: string;
  reference?: string;
  paymentMethod?: string;
  status?: string;
}

interface MosqueAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'khutbah' | 'urgent' | 'event' | 'general';
  createdAt?: any;
  date?: string;
  speaker?: string;
  time?: string;
}

const DEFAULT_ANNOUNCEMENTS: MosqueAnnouncement[] = [
  {
    id: 'khutbah-1',
    title: "This Friday's Jumu'ah Khutbah: Sincerity & Sadaqah Jariyah",
    content: "Join us this Friday by 1:15 PM for an inspiring Khutbah on building lasting investments for the Akhirah. Please arrive early for Tahiyyatul Masjid.",
    category: 'khutbah',
    time: '1:15 PM - 2:00 PM',
    speaker: 'Chief Imam, Sunnyvale Central Masjid'
  },
  {
    id: 'event-1',
    title: 'Weekly Community Quran & Tafsir Circle',
    content: 'Every Sunday after Asr Solat at the Main Prayer Hall. Open to all brothers and sisters with designated seating.',
    category: 'event',
    time: 'Every Sunday after Asr (4:45 PM)',
    speaker: 'Ustadh & Islamic Affairs Committee'
  },
  {
    id: 'event-2',
    title: 'Sunnyvale Youth Academy & Weekend Halaqa',
    content: 'Registration is ongoing for children ages 6-16 for Tajweed, Arabic literacy, and Islamic manners fundamentals.',
    category: 'event',
    time: 'Saturdays & Sundays 10:00 AM - 1:00 PM',
    speaker: 'Youth & Education Directorate'
  },
  {
    id: 'urgent-1',
    title: 'Mosque Facility Maintenance & Solar Backup Optimization',
    content: 'Upgrades to the continuous power inverters are progressing smoothly to ensure unhindered ventilation during all 5 daily prayers.',
    category: 'urgent',
    time: 'Ongoing Project'
  }
];

const Dashboard: React.FC = () => {
  const { user, isAdmin, isApproved, isLoading, sendVerificationEmail, reloadUserStatus } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isConfirmed = queryParams.get('confirmed') === 'true';
  const [history, setHistory] = useState<DonationRecord[]>([]);
  const [announcements, setAnnouncements] = useState<MosqueAnnouncement[]>(DEFAULT_ANNOUNCEMENTS);
  const [announcementCategory, setAnnouncementCategory] = useState<'all' | 'khutbah' | 'event' | 'urgent'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPurpose, setFilterPurpose] = useState('All');
  const [selectedReceipt, setSelectedReceipt] = useState<DonationRecord | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [isRefreshingVerification, setIsRefreshingVerification] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAskImamOpen, setIsAskImamOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: 'timestamp' | 'amount'; direction: 'asc' | 'desc' }>({
    key: 'timestamp',
    direction: 'desc'
  });

  const handleResendVerification = async () => {
    setIsResendingEmail(true);
    try {
      await sendVerificationEmail();
      toast.success('Verification email sent! Please check your inbox and spam folder.');
    } catch (err: any) {
      toast.error(err.message || 'Could not send verification email.');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleRefreshVerification = async () => {
    setIsRefreshingVerification(true);
    try {
      await reloadUserStatus();
      toast.success('Status refreshed.');
    } catch (err) {
      toast.error('Could not refresh status.');
    } finally {
      setIsRefreshingVerification(false);
    }
  };

  useEffect(() => {
    if (user && user.uid) {
      const q = query(
        collection(db, 'donations'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const records: DonationRecord[] = [];
        snapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() } as DonationRecord);
        });
        
        const sortedRecords = records.sort((a, b) => {
          const timeA = a.timestamp?.seconds || (new Date(a.timestamp).getTime() / 1000) || 0;
          const timeB = b.timestamp?.seconds || (new Date(b.timestamp).getTime() / 1000) || 0;
          return timeB - timeA;
        });

        if (isConfirmed && sortedRecords.length === 1) {
          toast.success("Congratulations on your first recorded donation! Jazakumullahu Khairan.");
        }
        
        setHistory(sortedRecords);
      }, (error) => {
        console.error("Dashboard history sync note:", error);
      });

      return () => unsubscribe();
    }
  }, [user, isConfirmed]);

  // Real-time Announcements Listener
  useEffect(() => {
    try {
      const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
        if (!snapshot.empty) {
          const list: MosqueAnnouncement[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as MosqueAnnouncement);
          });
          list.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
          setAnnouncements(list);
        } else {
          setAnnouncements(DEFAULT_ANNOUNCEMENTS);
        }
      }, (err) => {
        console.warn('Announcements sync fallback to defaults:', err);
        setAnnouncements(DEFAULT_ANNOUNCEMENTS);
      });

      return () => unsubAnnouncements();
    } catch (e) {
      setAnnouncements(DEFAULT_ANNOUNCEMENTS);
    }
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-zinc-300">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;

  const totalDonations = history.reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recent';
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    return new Date(timestamp).toLocaleDateString();
  };

  const formatFullDate = (timestamp: any) => {
    if (!timestamp) return new Date().toLocaleString();
    if (timestamp.toDate) return timestamp.toDate().toLocaleString();
    return new Date(timestamp).toLocaleString();
  };

  const purposes = ['All', ...new Set(history.map(item => item.purpose))];

  const filteredAndSortedHistory = history
    .filter(record => {
      const matchesSearch = record.purpose.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            record.amount.toString().includes(searchTerm) ||
                            (record.reference && record.reference.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterPurpose === 'All' || record.purpose === filterPurpose;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'timestamp') {
        const timeA = a.timestamp?.seconds || (new Date(a.timestamp).getTime() / 1000) || 0;
        const timeB = b.timestamp?.seconds || (new Date(b.timestamp).getTime() / 1000) || 0;
        return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
      } else {
        const amountA = Number(a.amount);
        const amountB = Number(b.amount);
        return sortConfig.direction === 'asc' ? amountA - amountB : amountB - amountA;
      }
    });

  const toggleSort = (key: 'timestamp' | 'amount') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] py-8 px-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="text-zinc-400 font-bold text-xs uppercase tracking-wider block mb-1">Member Dashboard</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Assalamu Alaikum, {user.name || 'Member'}</h1>
            <p className="text-zinc-400 text-xs sm:text-sm">Manage your donations and verified receipts.</p>
          </div>
          <Link 
            to="/donate" 
            className="bg-zinc-200 hover:bg-white text-zinc-950 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Heart size={16} /> New Donation
          </Link>
        </div>

        {/* SCROLLING ANNOUNCEMENT MARQUEE TICKER */}
        {announcements.length > 0 && (
          <div className="mb-6 bg-[#181b22] border border-zinc-800 rounded-2xl p-2 sm:p-2.5 shadow-xl flex items-center overflow-hidden gap-3 group">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200 text-zinc-950 rounded-xl text-xs font-black shrink-0 tracking-wider shadow-sm uppercase">
              <Megaphone size={14} className="animate-bounce" />
              <span className="hidden sm:inline">Mosque Live</span> Updates
            </div>

            <div className="overflow-hidden whitespace-nowrap w-full relative py-1">
              <div className="animate-marquee text-xs text-zinc-200 font-medium">
                {[...announcements, ...announcements].map((a, idx) => (
                  <span key={`${a.id || 'ann'}-${idx}`} className="inline-flex items-center gap-2 mx-6">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      a.category === 'urgent' ? 'bg-red-950 text-red-300 border border-red-800' :
                      a.category === 'khutbah' ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' :
                      'bg-[#121419] text-zinc-300 border border-zinc-700'
                    }`}>
                      {a.category === 'khutbah' ? "Jumu'ah Khutbah" : a.category === 'urgent' ? 'Important Notice' : 'Community Event'}
                    </span>
                    <strong className="text-white">{a.title}</strong>
                    {a.time && <span className="text-zinc-400 font-mono">({a.time})</span>}
                    <span className="text-zinc-400 font-normal">{a.content}</span>
                    <span className="text-zinc-600 ml-4">•</span>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 bg-[#121419] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              <MessageSquarePlus size={13} /> Suggest Idea
            </button>
          </div>
        )}

        {/* EMAIL VERIFICATION NOTICE BANNER IF NOT VERIFIED */}
        {!user.emailVerified && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-950/80 border border-amber-600/80 text-amber-100 p-4 sm:p-5 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-900/90 rounded-xl text-amber-300 shrink-0 mt-0.5">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Please Verify Your Email Address</h3>
                <p className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">
                  We sent a confirmation link to <strong className="text-white">{user.email}</strong> to protect our community against bots and fake accounts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRefreshVerification}
                disabled={isRefreshingVerification}
                className="flex-1 sm:flex-initial px-3 py-2 bg-[#121419] hover:bg-black/60 text-amber-200 border border-amber-700/60 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} className={isRefreshingVerification ? 'animate-spin' : ''} />
                I've Verified
              </button>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResendingEmail}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send size={13} />
                {isResendingEmail ? 'Sending...' : 'Resend Link'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ADMIN SHORTCUT BAR IF ADMIN */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-purple-950/80 to-[#181b22] p-4 rounded-2xl border border-purple-800/80 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-900/80 text-purple-300 rounded-xl">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">You are an Authorized Mosque EXCO Admin</span>
                <span className="text-[11px] text-purple-300/80">Manage member registrations, view all donation records & post Khutbah topics.</span>
              </div>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              Open EXCO Admin Portal <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {isConfirmed && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-800 border border-zinc-600 text-zinc-100 p-4 rounded-2xl mb-8 flex items-center gap-3"
          >
            <CheckCircle className="text-zinc-200 shrink-0" size={20} />
            <p className="text-xs sm:text-sm font-medium">Your donation confirmation has been recorded successfully. Jazakumullahu Khairan!</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#181b22] p-6 rounded-2xl border border-zinc-800 shadow-sm">
                <p className="text-zinc-400 text-xs mb-1 uppercase tracking-wider font-semibold">Account Status & Approval</p>
                <div className="flex items-center gap-2 mt-1">
                  {user.approvalStatus === 'approved' || isAdmin ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-200 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
                      <CheckCircle2 size={15} className="text-zinc-300" /> Verified Member
                    </span>
                  ) : user.approvalStatus === 'rejected' ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-300 bg-red-950 px-2.5 py-1 rounded-lg border border-red-800">
                      <X size={15} /> Application Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-700 animate-pulse">
                      <Clock size={15} /> Pending Admin Approval
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-2">
                  {user.approvalStatus === 'approved' || isAdmin 
                    ? 'Full member privileges active.' 
                    : 'Your profile has been submitted to Mosque EXCO for validation.'}
                </p>
              </div>

              <div className="bg-[#181b22] p-6 rounded-2xl border border-zinc-800 shadow-sm">
                <p className="text-zinc-400 text-xs mb-1 uppercase tracking-wider font-semibold">Total Recorded Contributions</p>
                <p className="text-xl font-bold text-zinc-200 font-mono">
                  ₦{totalDonations.toLocaleString()}
                </p>
                <p className="text-[11px] text-zinc-400 mt-2">
                  {history.length} transaction(s) on record
                </p>
              </div>
            </div>

            {/* DEDICATED ANNOUNCEMENTS & UPCOMING COMMUNITY EVENTS SECTION */}
            <div className="bg-[#181b22] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">
                    <Radio size={15} className="animate-pulse text-zinc-300" /> Live Bulletin
                  </div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Megaphone size={20} className="text-zinc-300" />
                    Masjid Announcements & Upcoming Events
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Official notices, Jumu'ah Khutbah details, and community development schedules.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-[#121419] rounded-xl border border-zinc-800">
                  <button
                    onClick={() => setAnnouncementCategory('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      announcementCategory === 'all' ? 'bg-zinc-200 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    All ({announcements.length})
                  </button>
                  <button
                    onClick={() => setAnnouncementCategory('khutbah')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      announcementCategory === 'khutbah' ? 'bg-zinc-200 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Khutbah
                  </button>
                  <button
                    onClick={() => setAnnouncementCategory('event')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      announcementCategory === 'event' ? 'bg-zinc-200 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Events
                  </button>
                  <button
                    onClick={() => setAnnouncementCategory('urgent')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      announcementCategory === 'urgent' ? 'bg-zinc-200 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Notices
                  </button>
                </div>
              </div>

              {/* Announcement Cards Grid */}
              <div className="grid grid-cols-1 gap-3.5">
                {announcements
                  .filter(a => announcementCategory === 'all' || a.category === announcementCategory)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 bg-[#121419] rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all space-y-2 group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            item.category === 'urgent' ? 'bg-red-950 text-red-300 border border-red-800' :
                            item.category === 'khutbah' ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' :
                            'bg-[#181b22] text-zinc-300 border border-zinc-700'
                          }`}>
                            {item.category === 'khutbah' ? "Jumu'ah Topic" : item.category === 'urgent' ? 'Urgent Notice' : 'Community Event'}
                          </span>
                          {item.time && (
                            <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                              <Clock size={12} /> {item.time}
                            </span>
                          )}
                        </div>

                        {item.speaker && (
                          <span className="text-[11px] text-zinc-400 font-medium">
                            Speaker: <strong className="text-white">{item.speaker}</strong>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-zinc-300 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {item.content}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <MapPin size={11} /> Sunnyvale Main Prayer Hall / Estate Center
                        </span>
                        <button
                          onClick={() => setIsFeedbackOpen(true)}
                          className="text-[11px] text-zinc-400 font-semibold hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquarePlus size={13} /> Suggest program idea
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Donation History Section */}
            <div className="bg-[#181b22] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <History size={18} className="text-zinc-300" /> Past Donations & Receipts
                  </h2>
                  <p className="text-zinc-400 text-xs mt-0.5">Click any record to view or download its official receipt.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                    <input 
                      type="text"
                      placeholder="Search donations / refs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-[#121419] border border-zinc-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-zinc-400 text-white w-full sm:w-48"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
                    <select
                      value={filterPurpose}
                      onChange={(e) => setFilterPurpose(e.target.value)}
                      className="pl-7 pr-3 py-1.5 bg-[#121419] border border-zinc-700 rounded-lg text-xs outline-none text-white appearance-none cursor-pointer"
                    >
                      {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {filteredAndSortedHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
                        <th className="pb-3 font-semibold">
                          <button 
                            onClick={() => toggleSort('timestamp')}
                            className="flex items-center gap-1 hover:text-white cursor-pointer"
                          >
                            Date <ArrowUpDown size={11} />
                          </button>
                        </th>
                        <th className="pb-3 font-semibold">Purpose & Channel</th>
                        <th className="pb-3 font-semibold text-right">
                          <button 
                            onClick={() => toggleSort('amount')}
                            className="flex items-center gap-1 ml-auto hover:text-white cursor-pointer"
                          >
                            Amount <ArrowUpDown size={11} />
                          </button>
                        </th>
                        <th className="pb-3 font-semibold text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredAndSortedHistory.map((record) => (
                        <tr 
                          key={record.id} 
                          onClick={() => setSelectedReceipt(record)}
                          className="text-xs hover:bg-[#121419] transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 text-zinc-300">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon size={13} className="text-zinc-400 shrink-0" />
                              <span>{formatDate(record.timestamp)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 font-medium text-white">
                            <div>
                              <span>{record.purpose}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#121419] text-zinc-300 border border-zinc-700">
                                  {record.paymentMethod || 'Bank Transfer'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-right font-bold text-zinc-200 font-mono">
                            ₦{Number(record.amount).toLocaleString()}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReceipt(record);
                              }}
                              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-[11px] font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <FileText size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-[#121419] rounded-2xl border border-zinc-800">
                  <p className="text-zinc-400 text-xs">
                    {history.length > 0 ? 'No results match your search filter.' : 'No recorded donations yet.'}
                  </p>
                  {history.length === 0 && (
                    <Link to="/donate" className="text-zinc-200 font-bold hover:underline mt-2 inline-block text-xs">
                      Make your first contribution online
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Bank Details Section */}
            <div className="bg-[#181b22] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-md">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <LayoutDashboard size={18} className="text-zinc-300" /> Mosque Bank Accounts
              </h2>
              <p className="text-zinc-400 mb-6 text-xs leading-relaxed">
                For manual bank transfers, use the official verified details below.
              </p>
              
              <div className="space-y-3">
                {BANK_DETAILS.map((item, idx) => (
                  <div key={idx} className="bg-[#121419] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-zinc-800">
                    <div>
                      <p className="text-zinc-400 font-bold text-[11px] uppercase tracking-wider">{item.bank}</p>
                      <p className="text-lg font-mono font-bold text-white">{item.accountNumber}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">{item.accountName}</p>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(item.accountNumber);
                        toast.success(`${item.bank} account number copied!`);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                    >
                      <Copy size={14} /> Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <History size={16} className="text-zinc-300" /> Recent Activity
              </h3>
              <div className="space-y-3">
                {history.slice(0, 4).map(record => (
                  <div key={record.id} className="border-l-2 border-zinc-400 pl-3 py-0.5">
                    <p className="text-xs font-bold text-white">Donated ₦{Number(record.amount).toLocaleString()}</p>
                    <p className="text-[11px] text-zinc-400">{record.purpose}</p>
                  </div>
                ))}
                <div className="border-l-2 border-zinc-400 pl-3 py-0.5">
                  <p className="text-xs font-bold text-white">Member Account Active</p>
                  <p className="text-[11px] text-zinc-400">Welcome to Sunnyvale Masjid portal</p>
                </div>
              </div>
            </div>

            {/* Islamic Services & Utilities Card */}
            <div className="bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-zinc-300" /> Modern Mosque Tools
              </h3>

              <div className="space-y-2 text-xs">
                <Link
                  to="/donate?tab=zakat"
                  className="p-3 bg-[#121419] hover:bg-zinc-800 rounded-2xl border border-zinc-800 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-zinc-800 text-zinc-300 rounded-xl">
                      <Calculator size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-zinc-300">Zakat Al-Mal Calculator</p>
                      <p className="text-[10px] text-zinc-400">2.5% Wealth Purification</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/events?tab=qibla"
                  className="p-3 bg-[#121419] hover:bg-zinc-800 rounded-2xl border border-zinc-800 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-zinc-800 text-zinc-300 rounded-xl">
                      <Compass size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-zinc-300">Live Qibla Compass</p>
                      <p className="text-[10px] text-zinc-400">68° ENE from Abuja</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={() => setIsAskImamOpen(true)}
                  className="w-full text-left p-3 bg-[#121419] hover:bg-zinc-800 rounded-2xl border border-zinc-800 flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-zinc-800 text-zinc-300 rounded-xl">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-zinc-300">Ask the Imam / Committee</p>
                      <p className="text-[10px] text-zinc-400">Confidential inquiries</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="w-full text-left p-3 bg-[#121419] hover:bg-zinc-800 rounded-2xl border border-zinc-800 flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-zinc-800 text-zinc-300 rounded-xl">
                      <MessageSquarePlus size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-zinc-300 flex items-center gap-1.5">
                        Suggestion Box <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 text-[9px] rounded font-bold">New</span>
                      </p>
                      <p className="text-[10px] text-zinc-400">Share ideas with Mosque EXCO</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Settings size={16} className="text-zinc-300" /> Account Details
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-zinc-400 text-[10px] uppercase font-semibold">Email</p>
                  <p className="text-zinc-200 font-medium truncate">{user.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-[10px] uppercase font-semibold">Phone</p>
                  <p className="text-zinc-200 font-medium">{user.phone || 'Not provided'}</p>
                </div>
                <Link to="/profile" className="text-zinc-300 text-xs font-bold hover:underline inline-block mt-2">
                  Edit Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RECEIPT VIEW MODAL */}
        <AnimatePresence>
          {selectedReceipt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#181b22] border border-zinc-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center"
              >
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="w-14 h-14 bg-zinc-800 text-zinc-200 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-700">
                  <CheckCircle2 size={32} className="text-zinc-200" />
                </div>

                <span className="px-3 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded-full uppercase tracking-wider border border-zinc-700">
                  Official Donation Receipt
                </span>

                <h2 className="text-xl font-bold text-white mt-2 mb-1">
                  Sunnyvale Homes Muslim Community Masjid
                </h2>
                <p className="text-[11px] text-zinc-400 mb-5">
                  Tax Deductible & Verified Mosque Contribution
                </p>

                <div className="bg-[#121419] border border-zinc-800 rounded-2xl p-4 text-left space-y-2.5 mb-6 font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <span className="text-zinc-400 font-sans text-[10px] uppercase">Amount</span>
                    <span className="text-base font-bold text-zinc-200">₦{Number(selectedReceipt.amount).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 font-sans text-[10px] uppercase">Purpose</span>
                    <span className="text-white font-sans text-xs font-semibold">{selectedReceipt.purpose}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 font-sans text-[10px] uppercase">Donor Name</span>
                    <span className="text-white font-sans text-xs">{selectedReceipt.userName || user.name || 'Member'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 font-sans text-[10px] uppercase">Reference</span>
                    <span className="text-zinc-300 text-[11px] select-all font-mono">
                      {selectedReceipt.reference || selectedReceipt.id.slice(0, 12)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 font-sans text-[10px] uppercase">Payment Method</span>
                    <span className="text-zinc-300 text-xs font-sans">
                      {selectedReceipt.paymentMethod || 'Verified Transfer'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-800 pt-2 text-[10px] text-zinc-400 font-sans">
                    <span>Date Issued</span>
                    <span>{formatFullDate(selectedReceipt.timestamp)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 px-4 bg-zinc-200 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download size={14} /> Print Receipt
                  </button>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="py-2.5 px-4 bg-[#121419] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FEEDBACK & SUGGESTION BOX MODAL */}
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
        />

        {/* ASK THE IMAM MODAL */}
        <AskImamModal
          isOpen={isAskImamOpen}
          onClose={() => setIsAskImamOpen(false)}
        />
      </div>
    </div>
  );
};

export default Dashboard;
