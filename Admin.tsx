import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  ShieldCheck, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar, 
  PlusCircle, 
  Megaphone, 
  MessageSquare, 
  MessageSquarePlus,
  Trash2, 
  RefreshCw,
  Eye,
  Check,
  AlertTriangle,
  Sparkles,
  BookmarkCheck,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Save,
  RotateCcw,
  Edit3,
  X,
  Radio,
  BookOpen,
  Layers,
  Compass,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  setDoc, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { User, ApprovalStatus, UserRole } from './constants';
import { DEFAULT_PRAYER_TIMES, PrayerScheduleData } from './PrayerTimes';
import { BASELINE_EVENTS, EventItem } from './Events';

interface MemberRecord extends User {
  id: string;
}

interface DonationRecord {
  id: string;
  amount: number | string;
  purpose: string;
  timestamp: any;
  userEmail: string;
  userName?: string;
  reference?: string;
  paymentMethod?: string;
  userId?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'khutbah' | 'urgent' | 'event' | 'general';
  createdAt: any;
  active: boolean;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: any;
  status: 'pending' | 'resolved';
}

interface FeedbackItem {
  id: string;
  title: string;
  suggestion: string;
  category: string;
  categoryLabel?: string;
  isAnonymous?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  status?: 'pending' | 'reviewed' | 'implemented';
  createdAt?: any;
}

const Admin: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'prayer-times' | 'events' | 'announcements' | 'members' | 'donations' | 'inquiries' | 'feedback'>('prayer-times');
  
  // URL tab synchronization
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['prayer-times', 'events', 'announcements', 'members', 'donations', 'inquiries', 'feedback'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [location.search]);

  // Elder-friendly Dropdown Navigation State
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNavDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prayer Times State
  const [prayerSchedule, setPrayerSchedule] = useState<PrayerScheduleData>(DEFAULT_PRAYER_TIMES);
  const [isSavingPrayerTimes, setIsSavingPrayerTimes] = useState(false);
  const [prayerTimesLastUpdated, setPrayerTimesLastUpdated] = useState<string | null>(null);
  const [prayerTimesUpdatedBy, setPrayerTimesUpdatedBy] = useState<string | null>(null);

  // Events State
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('Weekly Program');
  const [eventTime, setEventTime] = useState('');
  const [eventFrequency, setEventFrequency] = useState('');
  const [eventSpeaker, setEventSpeaker] = useState('Resident Imam');
  const [eventLocation, setEventLocation] = useState('Main Prayer Hall');
  const [eventDescription, setEventDescription] = useState('');
  const [eventFeatured, setEventFeatured] = useState(false);

  // Members State
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // Donations State
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [donationSearch, setDonationSearch] = useState('');

  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'khutbah' | 'urgent' | 'event' | 'general'>('khutbah');
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Feedback State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'pending' | 'reviewed' | 'implemented'>('all');

  // Fetch all members
  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const list: MemberRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as MemberRecord);
      });
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setMembers(list);
    } catch (err) {
      console.error('Error fetching members:', err);
      toast.error('Could not load member list.');
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fetch all donations
  const fetchDonations = async () => {
    setLoadingDonations(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'donations'));
      const list: DonationRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as DonationRecord);
      });
      list.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setDonations(list);
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoadingDonations(false);
    }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'announcements'));
      const list: Announcement[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Announcement);
      });
      setAnnouncements(list);
    } catch (err) {
      console.warn('Error fetching announcements:', err);
    }
  };

  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'inquiries'));
      const list: Inquiry[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Inquiry);
      });
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setInquiries(list);
    } catch (err) {
      console.warn('Error fetching inquiries:', err);
    }
  };

  // Fetch feedback & suggestions
  const fetchFeedbacks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'feedback'));
      const list: FeedbackItem[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FeedbackItem);
      });
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setFeedbacks(list);
    } catch (err) {
      console.warn('Error fetching feedback:', err);
    }
  };

  const handleUpdateFeedbackStatus = async (id: string, newStatus: 'pending' | 'reviewed' | 'implemented') => {
    try {
      await updateDoc(doc(db, 'feedback', id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
      toast.success(`Feedback status marked as ${newStatus.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'feedback', id));
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      toast.success('Feedback entry removed.');
    } catch (err) {
      toast.error('Failed to delete feedback.');
    }
  };

  // Fetch Prayer Times
  const fetchPrayerTimes = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'prayerTimes'));
      if (docSnap.exists()) {
        const data = docSnap.data() as PrayerScheduleData;
        setPrayerSchedule(prev => ({
          ...prev,
          ...data
        }));
        if (data.updatedAt?.toDate) {
          setPrayerTimesLastUpdated(data.updatedAt.toDate().toLocaleString());
        } else if (data.updatedAt) {
          setPrayerTimesLastUpdated(new Date(data.updatedAt).toLocaleString());
        }
        if (data.updatedBy) {
          setPrayerTimesUpdatedBy(data.updatedBy);
        }
      }
    } catch (err) {
      console.warn('Error fetching prayer times:', err);
    }
  };

  // Save Prayer Times
  const handleSavePrayerTimes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrayerTimes(true);
    try {
      await setDoc(doc(db, 'settings', 'prayerTimes'), {
        ...prayerSchedule,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || 'Admin'
      }, { merge: true });
      toast.success("Prayer times updated successfully! Live on site immediately.");
      setPrayerTimesLastUpdated('Just now');
      setPrayerTimesUpdatedBy(user?.email || 'Admin');
    } catch (err: any) {
      console.error("Error saving prayer times:", err);
      toast.error("Failed to save prayer times: " + (err.message || 'Check connection'));
    } finally {
      setIsSavingPrayerTimes(false);
    }
  };

  // Reset Prayer Times
  const handleResetPrayerTimes = () => {
    if (window.confirm("Reset prayer times to the standard Abuja baseline schedule?")) {
      setPrayerSchedule(DEFAULT_PRAYER_TIMES);
      toast.info("Reset to default times. Click 'Save & Publish Live' to push changes.");
    }
  };

  // Fetch Events
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const list: EventItem[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as EventItem);
      });
      list.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });
      setEventsList(list);
    } catch (err) {
      console.warn('Error fetching events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Seed default baseline events into Firestore
  const handleSeedDefaultEvents = async () => {
    if (eventsList.length > 0 && !window.confirm("Events already exist. Do you still want to seed baseline programs?")) {
      return;
    }
    try {
      setLoadingEvents(true);
      for (const evt of BASELINE_EVENTS) {
        const { id, ...evtData } = evt;
        await addDoc(collection(db, 'events'), {
          ...evtData,
          createdAt: serverTimestamp(),
          createdBy: user?.email || 'Admin'
        });
      }
      toast.success("Baseline community programs loaded into database!");
      await fetchEvents();
    } catch (err: any) {
      console.error("Error seeding events:", err);
      toast.error("Failed to seed events: " + err.message);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Save Event (Create or Update)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDescription.trim()) {
      toast.error("Please provide both a title and description.");
      return;
    }
    setIsSavingEvent(true);
    try {
      const eventPayload = {
        title: eventTitle.trim(),
        category: eventCategory.trim() || 'Weekly Program',
        time: eventTime.trim() || 'TBD',
        frequency: eventFrequency.trim() || 'Announced Weekly',
        speaker: eventSpeaker.trim() || 'Resident Imam',
        location: eventLocation.trim() || 'Main Prayer Hall',
        description: eventDescription.trim(),
        featured: eventFeatured,
        updatedAt: serverTimestamp(),
        createdBy: user?.email || 'Admin'
      };

      if (editingEventId) {
        await updateDoc(doc(db, 'events', editingEventId), eventPayload);
        toast.success("Event updated successfully!");
      } else {
        await addDoc(collection(db, 'events'), {
          ...eventPayload,
          createdAt: serverTimestamp()
        });
        toast.success("New event published to community schedule!");
      }

      // Reset form
      setEditingEventId(null);
      setEventTitle('');
      setEventCategory('Weekly Program');
      setEventTime('');
      setEventFrequency('');
      setEventSpeaker('Resident Imam');
      setEventLocation('Main Prayer Hall');
      setEventDescription('');
      setEventFeatured(false);

      await fetchEvents();
    } catch (err: any) {
      console.error("Error saving event:", err);
      toast.error("Failed to save event: " + err.message);
    } finally {
      setIsSavingEvent(false);
    }
  };

  // Start editing an event
  const handleStartEditEvent = (evt: EventItem) => {
    setEditingEventId(evt.id);
    setEventTitle(evt.title);
    setEventCategory(evt.category);
    setEventTime(evt.time);
    setEventFrequency(evt.frequency);
    setEventSpeaker(evt.speaker);
    setEventLocation(evt.location);
    setEventDescription(evt.description);
    setEventFeatured(Boolean(evt.featured));
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEditEvent = () => {
    setEditingEventId(null);
    setEventTitle('');
    setEventCategory('Weekly Program');
    setEventTime('');
    setEventFrequency('');
    setEventSpeaker('Resident Imam');
    setEventLocation('Main Prayer Hall');
    setEventDescription('');
    setEventFeatured(false);
  };

  // Delete event
  const handleDeleteEvent = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the event "${title}"?`)) {
      try {
        await deleteDoc(doc(db, 'events', id));
        toast.success("Event removed from community schedule.");
        setEventsList(prev => prev.filter(e => e.id !== id));
        if (editingEventId === id) {
          handleCancelEditEvent();
        }
      } catch (err: any) {
        console.error("Error deleting event:", err);
        toast.error("Failed to delete event: " + err.message);
      }
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPrayerTimes();
      fetchEvents();
      fetchMembers();
      fetchDonations();
      fetchAnnouncements();
      fetchInquiries();
      fetchFeedbacks();
    }
  }, [isAdmin]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-300">Loading admin portal...</div>;
  }

  if (!user) {
    return <Navigate to="/auth?redirect=admin" />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#0d0f12]">
        <div className="max-w-md w-full bg-[#181b22] p-8 rounded-3xl border border-red-900/60 text-center">
          <div className="w-16 h-16 bg-red-950/80 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-800">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Restricted Admin Area</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            This administration portal is strictly reserved for Sunnyvale Masjid EXCO Committee members.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-2.5 bg-zinc-200 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold transition-all"
          >
            Return to Member Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Update Member Approval Status
  const handleUpdateStatus = async (memberId: string, newStatus: ApprovalStatus) => {
    try {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        approvalStatus: newStatus,
        updatedAt: serverTimestamp()
      });
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, approvalStatus: newStatus } : m));
      toast.success(`Member status updated to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      console.error('Status update error:', err);
      toast.error('Failed to update status.');
    }
  };

  // Toggle Admin Role
  const handleToggleRole = async (memberId: string, currentRole?: UserRole) => {
    const newRole: UserRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      toast.success(`User role updated to ${newRole.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to update user role.');
    }
  };

  // Post Announcement
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsPostingAnnouncement(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        active: true,
        createdAt: serverTimestamp()
      });
      toast.success('Announcement published to live mosque board!');
      setNewTitle('');
      setNewContent('');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to post announcement.');
    } finally {
      setIsPostingAnnouncement(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.success('Announcement deleted');
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  // Filtered members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      (m.name && m.name.toLowerCase().includes(memberSearch.toLowerCase())) ||
      (m.email && m.email.toLowerCase().includes(memberSearch.toLowerCase())) ||
      (m.phone && m.phone.includes(memberSearch));
    const matchesFilter = memberFilter === 'all' || (m.approvalStatus || 'pending') === memberFilter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = members.filter(m => (m.approvalStatus || 'pending') === 'pending').length;
  const approvedCount = members.filter(m => m.approvalStatus === 'approved').length;
  const totalDonationSum = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#0d0f12] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#181b22] p-4 sm:p-6 rounded-3xl border border-zinc-800 shadow-xl">
          <div>
            <div className="hidden sm:flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest mb-1">
              <ShieldCheck size={16} /> Mosque EXCO Administration Panel
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white">Sunnyvale Masjid Control Center</h1>
            <p className="hidden sm:block text-xs text-zinc-400 mt-1">
              Logged in as Administrator ({user.email})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchMembers();
                fetchDonations();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#121419] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-zinc-200 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Member View
            </Link>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#181b22] p-5 rounded-2xl border border-zinc-800 shadow-sm">
            <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1">Pending Approvals</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-amber-400 font-mono">{pendingCount}</span>
              <Clock size={20} className="text-amber-400/80" />
            </div>
          </div>

          <div className="bg-[#181b22] p-5 rounded-2xl border border-zinc-800 shadow-sm">
            <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1">Active Verified Members</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-zinc-200 font-mono">{approvedCount}</span>
              <CheckCircle size={20} className="text-zinc-400" />
            </div>
          </div>

          <div className="bg-[#181b22] p-5 rounded-2xl border border-zinc-800 shadow-sm">
            <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1">Total Online Contributions</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white font-mono">₦{totalDonationSum.toLocaleString()}</span>
              <CreditCard size={20} className="text-zinc-400" />
            </div>
          </div>

          <div className="bg-[#181b22] p-5 rounded-2xl border border-zinc-800 shadow-sm">
            <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1">Donation Records</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white font-mono">{donations.length}</span>
              <Calendar size={20} className="text-zinc-400" />
            </div>
          </div>
        </div>

        {/* Navigation Selector: Accessible High-Contrast Dropdown for Elders (No horizontal scrolling) */}
        {(() => {
          const tabOptions = [
            {
              id: 'prayer-times' as const,
              label: "Daily Solat & Iqamah Schedule",
              category: "Prayer & Worship",
              description: "Configure 5 daily prayers, sunrise, Jumu'ah khutbah & iqamah timings",
              icon: Clock,
              badge: null,
              badgeColor: '',
            },
            {
              id: 'events' as const,
              label: `Events & Programs (${eventsList.length})`,
              category: "Community Programs",
              description: "Publish educational classes, community lectures, youth activities & schedules",
              icon: Calendar,
              badge: eventsList.length,
              badgeColor: 'bg-zinc-800 text-zinc-300',
            },
            {
              id: 'announcements' as const,
              label: `Mosque Updates & Khutbah Topics (${announcements.length})`,
              category: "Announcements",
              description: "Post community news, official notices, and upcoming Friday Khutbah topics",
              icon: Megaphone,
              badge: announcements.length,
              badgeColor: 'bg-zinc-800 text-zinc-300',
            },
            {
              id: 'members' as const,
              label: "Member Verification & Approval",
              category: "Administration",
              description: "Review and approve new resident member registration requests",
              icon: Users,
              badge: pendingCount > 0 ? `${pendingCount} pending` : null,
              badgeColor: 'bg-amber-400 text-zinc-950 font-black',
            },
            {
              id: 'donations' as const,
              label: `All Donations & Bank Transfer Logs (${donations.length})`,
              category: "Financials",
              description: "Verify bank payments, member contributions, and financial records",
              icon: CreditCard,
              badge: donations.length,
              badgeColor: 'bg-zinc-800 text-zinc-300',
            },
            {
              id: 'inquiries' as const,
              label: `Ask Imam Inquiries (${inquiries.length})`,
              category: "Religious Guidance",
              description: "Answer private religious queries and fatwa questions from members",
              icon: MessageSquare,
              badge: inquiries.filter(i => i.status === 'pending').length > 0 ? `${inquiries.filter(i => i.status === 'pending').length} unread` : null,
              badgeColor: 'bg-amber-400 text-zinc-950 font-bold',
            },
            {
              id: 'feedback' as const,
              label: `Community Feedback & Suggestions (${feedbacks.length})`,
              category: "Community Input",
              description: "Read suggestions submitted by residents and attendees",
              icon: MessageSquarePlus,
              badge: feedbacks.filter(f => !f.status || f.status === 'pending').length > 0 ? `${feedbacks.filter(f => !f.status || f.status === 'pending').length} new` : null,
              badgeColor: 'bg-[#e08a6e] text-zinc-950 font-black',
            },
          ];

          const currentTabObj = tabOptions.find(t => t.id === activeTab) || tabOptions[0];
          const CurrentTabIcon = currentTabObj.icon;

          return (
            <div ref={dropdownRef} className="relative z-30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 px-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Layers size={14} className="text-[#e08a6e]" />
                  Active Admin Section:
                </label>
                <span className="hidden sm:inline text-xs text-zinc-400 font-medium">
                  Click the box below to switch section (e.g. Events, Members, Donations)
                </span>
              </div>

              {/* Big, High-Contrast Accessible Button for Elders */}
              <button
                type="button"
                onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                className="w-full bg-[#181b22] hover:bg-[#1f232c] border-2 border-[#e08a6e]/60 hover:border-[#e08a6e] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-left transition-all shadow-xl cursor-pointer group"
                aria-expanded={isNavDropdownOpen}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#251814] border border-[#e08a6e]/50 flex items-center justify-center text-[#f5a287] shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    <CurrentTabIcon size={24} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base sm:text-xl font-bold text-white tracking-tight">
                        {currentTabObj.label}
                      </span>
                      {currentTabObj.badge && (
                        <span className={`px-2.5 py-0.5 text-xs font-black rounded-full ${currentTabObj.badgeColor}`}>
                          {currentTabObj.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-[#f5a287] group-hover:text-white transition-colors">
                      {isNavDropdownOpen ? 'Close Menu' : 'Click to Change Section'}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      7 sections available
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/90 border border-zinc-700 flex items-center justify-center text-white group-hover:bg-[#e08a6e] group-hover:text-zinc-950 transition-colors shadow">
                    {isNavDropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </button>

              {/* Smooth Animated Dropdown Menu */}
              <AnimatePresence>
                {isNavDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.99 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 mt-2 bg-[#14161c] border-2 border-[#e08a6e]/40 rounded-2xl shadow-2xl p-2.5 space-y-2 z-40 max-h-[75vh] overflow-y-auto"
                  >
                    <div className="hidden sm:flex px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 justify-between items-center">
                      <span>Select an Admin Section (Tap any to open)</span>
                      <span className="text-[#f5a287] font-semibold">Easy Dropdown View</span>
                    </div>

                    {tabOptions.map((tab) => {
                      const ItemIcon = tab.icon;
                      const isSelected = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsNavDropdownOpen(false);
                          }}
                          className={`w-full p-4 rounded-xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#251814] border-2 border-[#e08a6e] text-white shadow-md'
                              : 'bg-[#181b22] hover:bg-[#202530] border border-zinc-800/90 text-zinc-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#e08a6e] text-zinc-950 font-bold shadow' : 'bg-zinc-800 text-zinc-300'
                            }`}>
                              <ItemIcon size={22} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm sm:text-base font-bold ${isSelected ? 'text-[#fbdcd3]' : 'text-white'}`}>
                                  {tab.label}
                                </span>
                                {tab.badge && (
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${tab.badgeColor}`}>
                                    {tab.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center pl-2">
                            {isSelected ? (
                              <div className="flex items-center gap-1 text-[#e08a6e] text-xs font-bold bg-[#e08a6e]/15 px-2.5 py-1.5 rounded-lg border border-[#e08a6e]/40 whitespace-nowrap">
                                <Check size={14} /> <span className="hidden sm:inline">Currently </span>Open
                              </div>
                            ) : (
                              <span className="text-xs font-semibold text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800/60 border border-zinc-700/60 whitespace-nowrap">
                                Open &rarr;
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}

        {/* TAB 0A: PRAYER TIMES SCHEDULE */}
        {activeTab === 'prayer-times' && (
          <div className="space-y-6">
            {/* Banner */}
            <div className="bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#f5a287] font-bold text-xs uppercase tracking-widest mb-1">
                    <Clock size={15} className="text-[#e08a6e]" /> Official Solat Times Manager
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Daily Solat & Friday Jumu'ah Schedule</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Configure live prayer times and Iqamah timings displayed to the community across Sunnyvale Masjid web pages.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetPrayerTimes}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#121419] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <RotateCcw size={13} /> Reset Baseline
                  </button>
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#251814] hover:bg-[#34221c] text-[#f5a287] border border-[#e08a6e]/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Eye size={13} /> View Live on Site
                  </a>
                </div>
              </div>

              {prayerTimesLastUpdated && (
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Schedule status: <strong className="text-emerald-400">Active & Synchronized</strong></span>
                  <span>Last modified: {prayerTimesLastUpdated} {prayerTimesUpdatedBy && `• by ${prayerTimesUpdatedBy}`}</span>
                </div>
              )}
            </div>

            {/* Form & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Editor Form (7 cols) */}
              <form onSubmit={handleSavePrayerTimes} className="lg:col-span-7 bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Sparkles size={16} className="text-[#e08a6e]" /> 5 Daily Solat Timings (Abuja Time)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Sunrise size={14} className="text-[#e08a6e]" /> Fajr Prayer
                    </label>
                    <input
                      type="text"
                      required
                      value={prayerSchedule.fajr}
                      onChange={(e) => setPrayerSchedule(prev => ({ ...prev, fajr: e.target.value }))}
                      placeholder="e.g. 05:15 AM"
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:border-[#e08a6e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Sun size={14} className="text-amber-400" /> Sunrise (Shuruq)
                    </label>
                    <input
                      type="text"
                      required
                      value={prayerSchedule.sunrise}
                      onChange={(e) => setPrayerSchedule(prev => ({ ...prev, sunrise: e.target.value }))}
                      placeholder="e.g. 06:30 AM"
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:border-[#e08a6e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Sun size={14} className="text-[#e08a6e]" /> Dhuhr Prayer
                    </label>
                    <input
                      type="text"
                      required
                      value={prayerSchedule.dhuhr}
                      onChange={(e) => setPrayerSchedule(prev => ({ ...prev, dhuhr: e.target.value }))}
                      placeholder="e.g. 12:45 PM"
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:border-[#e08a6e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Sun size={14} className="text-[#e08a6e]" /> Asr Prayer
                    </label>
                    <input
                      type="text"
                      required
                      value={prayerSchedule.asr}
                      onChange={(e) => setPrayerSchedule(prev => ({ ...prev, asr: e.target.value }))}
                      placeholder="e.g. 04:15 PM"
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:border-[#e08a6e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Sunset size={14} className="text-[#e08a6e]" /> Maghrib Prayer
                    </label>
                    <input
                      type="text"
                      required
                      value={prayerSchedule.maghrib}
                      onChange={(e) => setPrayerSchedule(prev => ({ ...prev, maghrib: e.target.value }))}
                      placeholder="e.g. 06:55 PM"
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:border-[#e08a6e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                      <Moon size={14} className="text-indigo-400" /> Isha Prayer
                    </label>
                    <input
                      type="text"
                      required
                      value={prayerSchedule.isha}
                      onChange={(e) => setPrayerSchedule(prev => ({ ...prev, isha: e.target.value }))}
                      placeholder="e.g. 08:15 PM"
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:border-[#e08a6e]"
                    />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3 pt-2">
                  <Calendar size={16} className="text-[#e08a6e]" /> Friday Jumu'ah Timings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Jumu'ah Khutbah Starts
                    </label>
                    <input
                      type="text"
                      value={prayerSchedule.jumuaKhutbah || ''}
                      onChange={(e) => setPrayerSchedule(prev => ({ ...prev, jumuaKhutbah: e.target.value }))}
                      placeholder="e.g. 12:50 PM"
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:border-[#e08a6e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Jumu'ah Iqamah / Solat
                    </label>
                    <input
                      type="text"
                      value={prayerSchedule.jumuaIqamah || ''}
                      onChange={(e) => setPrayerSchedule(prev => ({ ...prev, jumuaIqamah: e.target.value }))}
                      placeholder="e.g. 01:35 PM"
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:border-[#e08a6e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Megaphone size={14} className="text-[#e08a6e]" /> Special Notice / Ramadan Prayer Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={prayerSchedule.specialNote || ''}
                    onChange={(e) => setPrayerSchedule(prev => ({ ...prev, specialNote: e.target.value }))}
                    placeholder="e.g. Taraweeh prayer commences immediately after Isha at 8:45 PM • Fast breaking dates and water provided at Maghrib"
                    className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-xs outline-none focus:border-[#e08a6e]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingPrayerTimes}
                  className="w-full py-3 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  {isSavingPrayerTimes ? 'Publishing Schedule...' : 'Save & Publish Live Prayer Times'}
                </button>
              </form>

              {/* Live Preview Column (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Eye size={14} className="text-[#e08a6e]" /> Live Widget Preview
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Instant Sync
                    </span>
                  </div>

                  <div className="bg-[#121419] rounded-2xl p-4 border border-zinc-800 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <MapPin size={12} className="text-[#e08a6e]" /> Sunnyvale Estate, Abuja
                      </span>
                      <span className="text-[#f5a287] font-semibold text-[11px]">Next Solat: Dhuhr</span>
                    </div>

                    {prayerSchedule.specialNote && (
                      <div className="p-2.5 bg-[#251814] border border-[#e08a6e]/30 rounded-xl text-[11px] text-[#fbdcd3]">
                        {prayerSchedule.specialNote}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {[
                        { name: 'Fajr', time: prayerSchedule.fajr },
                        { name: 'Sunrise', time: prayerSchedule.sunrise },
                        { name: 'Dhuhr', time: prayerSchedule.dhuhr },
                        { name: 'Asr', time: prayerSchedule.asr },
                        { name: 'Maghrib', time: prayerSchedule.maghrib },
                        { name: 'Isha', time: prayerSchedule.isha },
                      ].map((p) => (
                        <div key={p.name} className="p-2.5 bg-[#181b22] rounded-xl border border-zinc-700/80 text-center">
                          <p className="text-[10px] text-zinc-400 uppercase font-semibold">{p.name}</p>
                          <p className="text-xs font-bold text-white mt-0.5">{p.time}</p>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-zinc-400 bg-[#181b22] p-2.5 rounded-xl border border-zinc-700/60 mt-3 text-center">
                      Friday Jumu'ah: Khutbah <strong className="text-white">{prayerSchedule.jumuaKhutbah || '12:50 PM'}</strong> • Iqamah <strong className="text-white">{prayerSchedule.jumuaIqamah || '01:35 PM'}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-4 leading-relaxed">
                    💡 <strong>Note for EXCO:</strong> When you hit "Save & Publish", all visitors to the website and community members on mobile will instantly receive these new timings without needing to refresh.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 0B: EVENTS & PROGRAMS */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Banner */}
            <div className="bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#f5a287] font-bold text-xs uppercase tracking-widest mb-1">
                    <Calendar size={15} className="text-[#e08a6e]" /> Community Programs & Lectures
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Events & Educational Schedule</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Add new lectures, classes, khutbah schedules, or youth programs for Sunnyvale Masjid.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSeedDefaultEvents}
                    disabled={loadingEvents}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#121419] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Layers size={13} /> Seed Baseline Programs
                  </button>
                  <Link
                    to="/events"
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#251814] hover:bg-[#34221c] text-[#f5a287] border border-[#e08a6e]/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Eye size={13} /> View Events Page
                  </Link>
                </div>
              </div>
            </div>

            {/* Form & Events List Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Event Form (5 cols) */}
              <form onSubmit={handleSaveEvent} className="lg:col-span-5 bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <PlusCircle size={16} className="text-[#e08a6e]" />
                    {editingEventId ? 'Edit Program Details' : 'Add New Event or Program'}
                  </h3>
                  {editingEventId && (
                    <button
                      type="button"
                      onClick={handleCancelEditEvent}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <X size={12} /> Cancel Edit
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-300 text-xs font-semibold mb-1">Event / Program Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramadan Tafseer Series & Family Night"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-xs outline-none focus:border-[#e08a6e]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">Category</label>
                    <select
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value)}
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-xs outline-none cursor-pointer"
                    >
                      <option value="Weekly Program">Weekly Program</option>
                      <option value="Khutbah">Khutbah</option>
                      <option value="Class">Class / Workshop</option>
                      <option value="Special Event">Special Event</option>
                      <option value="Youth">Youth / Family</option>
                      <option value="Ramadan">Ramadan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">Timing *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:30 AM – 12:00 PM"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-xs outline-none focus:border-[#e08a6e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">Frequency / Date</label>
                    <input
                      type="text"
                      placeholder="e.g. Every Sunday, 15th Ramadan"
                      value={eventFrequency}
                      onChange={(e) => setEventFrequency(e.target.value)}
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-xs outline-none focus:border-[#e08a6e]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">Speaker / Teacher</label>
                    <input
                      type="text"
                      placeholder="e.g. Resident Imam, Dr. Usman"
                      value={eventSpeaker}
                      onChange={(e) => setEventSpeaker(e.target.value)}
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-xs outline-none focus:border-[#e08a6e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 text-xs font-semibold mb-1">Location / Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Prayer Hall, Education Wing"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-xs outline-none focus:border-[#e08a6e]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-xs font-semibold mb-1">Description & Details *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe what community members can expect, topics covered, or any required materials..."
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-xs outline-none focus:border-[#e08a6e]"
                  />
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-[#121419] rounded-xl border border-zinc-700/80">
                  <input
                    type="checkbox"
                    id="eventFeatured"
                    checked={eventFeatured}
                    onChange={(e) => setEventFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#e08a6e] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="eventFeatured" className="text-xs text-zinc-300 font-medium cursor-pointer">
                    Pin as <strong>Featured Highlight</strong> at top of Events page
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSavingEvent}
                  className="w-full py-2.5 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 font-bold rounded-xl shadow transition-all cursor-pointer text-xs"
                >
                  {isSavingEvent ? 'Saving Program...' : editingEventId ? 'Save Event Changes' : 'Publish New Program'}
                </button>
              </form>

              {/* Events List (7 cols) */}
              <div className="lg:col-span-7 bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#e08a6e]" />
                    Active Scheduled Events ({eventsList.length})
                  </span>
                  {eventsList.length === 0 && (
                    <button
                      onClick={handleSeedDefaultEvents}
                      className="text-xs text-[#f5a287] hover:underline"
                    >
                      Populate Defaults
                    </button>
                  )}
                </h3>

                {eventsList.length > 0 ? (
                  <div className="space-y-3">
                    {eventsList.map((evt) => (
                      <div key={evt.id} className="p-4 bg-[#121419] rounded-2xl border border-zinc-800 flex justify-between items-start gap-4 hover:border-zinc-700 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2a1a15] text-[#f5a287] border border-[#e08a6e]/40">
                              {evt.category}
                            </span>
                            {evt.featured && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#e08a6e] text-zinc-950">
                                Featured
                              </span>
                            )}
                            <span className="text-[11px] text-zinc-400">
                              {evt.frequency} • {evt.time}
                            </span>
                          </div>

                          <h4 className="font-bold text-white text-sm">{evt.title}</h4>
                          <p className="text-xs text-zinc-400 line-clamp-2">{evt.description}</p>

                          <div className="text-[11px] text-zinc-500 pt-1 flex items-center gap-3">
                            <span>Speaker: <strong className="text-zinc-300">{evt.speaker}</strong></span>
                            <span>Venue: <strong className="text-zinc-300">{evt.location}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleStartEditEvent(evt)}
                            className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                            title="Edit Program"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(evt.id, evt.title)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-xl transition-colors cursor-pointer"
                            title="Delete Program"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-[#121419] rounded-2xl border border-zinc-800 text-xs text-zinc-400 space-y-3">
                    <p>No community events currently recorded in Firestore.</p>
                    <button
                      onClick={handleSeedDefaultEvents}
                      className="px-4 py-2 bg-[#251814] text-[#f5a287] border border-[#e08a6e]/40 rounded-xl font-bold hover:bg-[#32201a] transition-all cursor-pointer"
                    >
                      Seed Baseline Programs into Database
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: MEMBERS APPROVAL & MANAGEMENT */}
        {activeTab === 'members' && (
          <div className="bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield size={18} className="text-zinc-400" /> Member Verification Directory
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Review new registrations, verify anti-bot emails, and grant community approval status.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search name, email, phone..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-[#121419] border border-zinc-700 rounded-xl text-xs text-white outline-none focus:border-zinc-500 w-full sm:w-56"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
                  <select
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.target.value as any)}
                    className="pl-7 pr-3 py-1.5 bg-[#121419] border border-zinc-700 rounded-xl text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="all">All Members ({members.length})</option>
                    <option value="pending">Pending Approval ({pendingCount})</option>
                    <option value="approved">Approved ({approvedCount})</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {loadingMembers ? (
              <div className="text-center py-12 text-xs text-zinc-400 animate-pulse">
                Loading community members...
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                      <th className="pb-3 font-semibold">Member</th>
                      <th className="pb-3 font-semibold">Email & Anti-Bot Verification</th>
                      <th className="pb-3 font-semibold">Phone / Estate Residence</th>
                      <th className="pb-3 font-semibold">Approval Status</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredMembers.map((m) => {
                      const status = m.approvalStatus || 'pending';
                      return (
                        <tr key={m.id} className="hover:bg-[#121419] transition-colors">
                          <td className="py-4">
                            <div className="font-bold text-white">{m.name || 'Anonymous Member'}</div>
                            <div className="text-[11px] text-zinc-400">{m.email}</div>
                          </td>
                          <td className="py-4">
                            {m.emailVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                                <CheckCircle size={11} className="text-zinc-300" /> Verified Email
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60">
                                <Clock size={11} className="text-amber-400" /> Unverified Email
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-zinc-300">
                            <div>{m.phone || 'No phone'}</div>
                            <div className="text-[11px] text-zinc-400 truncate max-w-[150px]">{m.address || 'Sunnyvale Estate'}</div>
                          </td>
                          <td className="py-4">
                            {status === 'approved' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                                <CheckCircle size={12} /> Approved
                              </span>
                            )}
                            {status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700/80 animate-pulse">
                                <Clock size={12} /> Needs Approval
                              </span>
                            )}
                            {status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-950 text-red-300 border border-red-800">
                                <XCircle size={12} /> Rejected
                              </span>
                            )}
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-[#121419] text-zinc-300 border border-zinc-700'
                            }`}>
                              {m.role === 'admin' ? 'EXCO Admin' : 'Member'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {status !== 'approved' && (
                                <button
                                  onClick={() => handleUpdateStatus(m.id, 'approved')}
                                  className="px-2.5 py-1 bg-zinc-200 hover:bg-white text-zinc-950 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                  title="Approve Member"
                                >
                                  Approve
                                </button>
                              )}
                              {status !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateStatus(m.id, 'rejected')}
                                  className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg font-medium text-[11px] transition-colors cursor-pointer"
                                  title="Reject Profile"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleRole(m.id, m.role)}
                                className="px-2 py-1 bg-[#121419] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg text-[11px] transition-colors cursor-pointer"
                                title={m.role === 'admin' ? 'Demote to Member' : 'Make EXCO Admin'}
                              >
                                {m.role === 'admin' ? 'Demote' : 'Make Admin'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-[#121419] rounded-2xl border border-zinc-800 text-xs text-zinc-400">
                No members found matching your filter.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL DONATIONS & BANK TRANSFER LOGS */}
        {activeTab === 'donations' && (
          <div className="bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard size={18} className="text-zinc-300" /> Mosque Financial & Donation Ledger
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Complete audit log of all verified bank transfer receipts and community donations.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <input
                  type="text"
                  placeholder="Search purpose, donor, ref..."
                  value={donationSearch}
                  onChange={(e) => setDonationSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#121419] border border-zinc-700 rounded-xl text-xs text-white outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {donations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Donor / Email</th>
                      <th className="pb-3 font-semibold">Purpose & Channel</th>
                      <th className="pb-3 font-semibold">Reference</th>
                      <th className="pb-3 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {donations
                      .filter(d => 
                        d.purpose.toLowerCase().includes(donationSearch.toLowerCase()) ||
                        (d.userName && d.userName.toLowerCase().includes(donationSearch.toLowerCase())) ||
                        (d.userEmail && d.userEmail.toLowerCase().includes(donationSearch.toLowerCase())) ||
                        (d.reference && d.reference.toLowerCase().includes(donationSearch.toLowerCase()))
                      )
                      .map((d) => (
                        <tr key={d.id} className="hover:bg-[#121419] transition-colors">
                          <td className="py-3.5 text-zinc-300">
                            {d.timestamp?.toDate ? d.timestamp.toDate().toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="py-3.5">
                            <div className="font-bold text-white">{d.userName || 'Anonymous Donor'}</div>
                            <div className="text-[11px] text-zinc-400">{d.userEmail}</div>
                          </td>
                          <td className="py-3.5">
                            <span className="font-medium text-zinc-100">{d.purpose}</span>
                            <div className="text-[10px] text-zinc-400">{d.paymentMethod || 'Bank Transfer'}</div>
                          </td>
                          <td className="py-3.5 font-mono text-[11px] text-zinc-300 select-all">
                            {d.reference || d.id.slice(0, 10)}
                          </td>
                          <td className="py-3.5 text-right font-bold text-zinc-200 font-mono text-sm">
                            ₦{Number(d.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-[#121419] rounded-2xl border border-zinc-800 text-xs text-zinc-400">
                No recorded donations yet.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANNOUNCEMENTS & KHUTBAH TOPICS */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md">
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <PlusCircle size={16} className="text-zinc-300" /> Post New Mosque Notice
              </h2>
              <p className="text-xs text-zinc-400 mb-4">
                Will be displayed across the website ticker and bulletin board.
              </p>

              <form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none"
                  >
                    <option value="khutbah">Friday Khutbah Topic</option>
                    <option value="urgent">Urgent Announcement</option>
                    <option value="event">Community Event / Solat</option>
                    <option value="general">General Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Headline / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. This Friday's Khutbah: Sincerity in Charity"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Details / Speaker Info</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details, speaker name, time, or guidelines..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPostingAnnouncement}
                  className="w-full py-2.5 bg-zinc-200 hover:bg-white text-zinc-950 font-bold rounded-xl shadow transition-all cursor-pointer"
                >
                  {isPostingAnnouncement ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Megaphone size={16} className="text-zinc-300" /> Active Announcements ({announcements.length})
              </h2>

              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="p-4 bg-[#121419] rounded-2xl border border-zinc-800 flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            a.category === 'urgent' ? 'bg-red-950 text-red-300 border border-red-800' :
                            a.category === 'khutbah' ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' :
                            'bg-[#181b22] text-zinc-300 border border-zinc-700'
                          }`}>
                            {a.category}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString() : 'Active'}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm">{a.title}</h3>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{a.content}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteAnnouncement(a.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-xl transition-colors shrink-0 cursor-pointer"
                        title="Delete Announcement"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#121419] rounded-2xl border border-zinc-800 text-xs text-zinc-400">
                  No announcements published yet. Use the form on the left to add one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ASK THE IMAM INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-zinc-300" /> Community Inquiries & Questions
            </h2>

            {inquiries.length > 0 ? (
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="p-4 bg-[#121419] rounded-2xl border border-zinc-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div>
                        <span className="font-bold text-white text-sm">{inq.subject}</span>
                        <div className="text-xs text-zinc-400">From: {inq.name} ({inq.email}) {inq.phone && `• ${inq.phone}`}</div>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {inq.createdAt?.toDate ? inq.createdAt.toDate().toLocaleString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 bg-[#181b22] p-3 rounded-xl border border-zinc-700 leading-relaxed">
                      {inq.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-[#121419] rounded-2xl border border-zinc-800 text-xs text-zinc-400">
                No inquiries received yet.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: COMMUNITY FEEDBACK & SUGGESTION BOX */}
        {activeTab === 'feedback' && (
          <div className="bg-[#181b22] rounded-3xl p-6 border border-zinc-800 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquarePlus size={18} className="text-zinc-300" /> Community Suggestions & Ideas
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Review ideas submitted by Jama'ah members for Mosque facilities, youth programs, and community welfare.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-semibold">Filter:</span>
                <select
                  value={feedbackFilter}
                  onChange={(e) => setFeedbackFilter(e.target.value as any)}
                  className="bg-[#121419] border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none cursor-pointer"
                >
                  <option value="all">All Feedback ({feedbacks.length})</option>
                  <option value="pending">Pending ({feedbacks.filter(f => !f.status || f.status === 'pending').length})</option>
                  <option value="reviewed">Reviewed ({feedbacks.filter(f => f.status === 'reviewed').length})</option>
                  <option value="implemented">Implemented ({feedbacks.filter(f => f.status === 'implemented').length})</option>
                </select>
              </div>
            </div>

            {feedbacks.length > 0 ? (
              <div className="space-y-4">
                {feedbacks
                  .filter(f => feedbackFilter === 'all' || (f.status || 'pending') === feedbackFilter)
                  .map((item) => (
                    <div key={item.id} className="p-5 bg-[#121419] rounded-2xl border border-zinc-800 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 bg-zinc-800 text-zinc-200 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-zinc-700">
                            {item.categoryLabel || item.category}
                          </span>
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${
                            item.status === 'implemented'
                              ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                              : item.status === 'reviewed'
                              ? 'bg-blue-950 text-blue-300 border-blue-700'
                              : 'bg-amber-950 text-amber-300 border-amber-700'
                          }`}>
                            {item.status || 'pending'}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'Recent'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white">{item.title}</h3>
                        <p className="text-xs text-zinc-300 bg-[#181b22] p-3.5 rounded-xl border border-zinc-700 leading-relaxed mt-2 whitespace-pre-wrap">
                          {item.suggestion}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-zinc-800 text-xs">
                        <div className="text-zinc-400 text-[11px]">
                          Submitted by: <strong className="text-white">{item.isAnonymous ? 'Anonymous Jama\'ah Member' : item.name}</strong>
                          {!item.isAnonymous && item.email && (
                            <span> • <a href={`mailto:${item.email}`} className="text-zinc-200 hover:underline">{item.email}</a></span>
                          )}
                          {!item.isAnonymous && item.phone && (
                            <span> • {item.phone}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {item.status !== 'reviewed' && (
                            <button
                              onClick={() => handleUpdateFeedbackStatus(item.id, 'reviewed')}
                              className="px-2.5 py-1.5 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Mark Reviewed
                            </button>
                          )}
                          {item.status !== 'implemented' && (
                            <button
                              onClick={() => handleUpdateFeedbackStatus(item.id, 'implemented')}
                              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Mark Implemented
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteFeedback(item.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer"
                            title="Delete Feedback"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#121419] rounded-2xl border border-zinc-800 text-xs text-zinc-400">
                No community suggestions submitted yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
