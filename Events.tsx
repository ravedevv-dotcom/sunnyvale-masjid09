import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, User, Sparkles, Filter, BookOpen, Compass, Heart, PlusCircle, Sun } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import DailyHadith from './DailyHadith';
import QiblaCompass from './QiblaCompass';
import PrayerTimes from './PrayerTimes';

export interface EventItem {
  id: string;
  title: string;
  category: string;
  time: string;
  frequency: string;
  speaker: string;
  location: string;
  description: string;
  featured?: boolean;
  createdAt?: any;
}

export const BASELINE_EVENTS: EventItem[] = [
  {
    id: 'friday-khutbah',
    title: "Weekly Friday Jumu'ah Khutbah",
    category: 'Khutbah',
    time: '12:50 PM – 1:35 PM',
    frequency: 'Every Friday (Before Friday Prayers)',
    speaker: 'Resident Imam',
    location: 'Main Prayer Hall',
    description: 'Weekly Friday sermon delivered by the Imam prior to Jumu\'ah prayer, providing spiritual guidance, Qur\'anic insights, and community direction.',
    featured: true,
  },
  {
    id: 'fajr-khutbah',
    title: 'Daily Post-Fajr Khutbah & Reflection',
    category: 'Khutbah',
    time: 'Immediately after Salatul Fajr',
    frequency: 'Daily (7 days a week)',
    speaker: 'Resident Imam',
    location: 'Main Prayer Hall',
    description: 'A brief daily Khutbah and spiritual reminder immediately following morning Fajr prayers to start the day with remembrance of Allah.',
    featured: true,
  },
  {
    id: 'sunday-qa',
    title: 'Sunday Islamic Q&A Class',
    category: 'Class',
    time: '10:30 AM – 11:45 AM',
    frequency: 'Every Sunday',
    speaker: 'Imam & Guest Scholars',
    location: 'Community Hall / Main Musalla',
    description: 'An open, interactive Question & Answer session held every Sunday morning where community members can ask questions on Fiqh, personal ethics, and daily life.',
    featured: true,
  },
  {
    id: 'weekend-quran',
    title: 'Weekend Qur\'an & Tajweed School',
    category: 'Class',
    time: '10:00 AM – 1:00 PM',
    frequency: 'Saturdays & Sundays',
    speaker: 'Certified Qur\'an Teachers',
    location: 'Education Wing',
    description: 'Comprehensive Qur\'an recitation, memorization, and Tajweed classes structured for children and adults of all proficiency levels.',
  },
  {
    id: 'friday-halaqa',
    title: 'Weekly Community Halaqa',
    category: 'Weekly Program',
    time: '8:00 PM (After Isha Prayer)',
    frequency: 'Every Friday Night',
    speaker: 'Imam & Youth Leaders',
    location: 'Main Prayer Hall',
    description: 'Weekly evening gathering focusing on Islamic history, Seerah of the Prophet (ﷺ), and strengthening bonds within the community.',
  }
];

const Events: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [viewTab, setViewTab] = useState<'schedule' | 'solat' | 'hadith' | 'qibla'>('schedule');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [eventsList, setEventsList] = useState<EventItem[]>(BASELINE_EVENTS);

  // Sync real-time events from Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'events'));
      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: EventItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as EventItem);
          });
          // Sort featured first, then newest
          list.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return 0;
          });
          setEventsList(list);
        } else {
          // If no custom events yet in Firestore, use baseline
          setEventsList(BASELINE_EVENTS);
        }
      }, (err) => {
        console.warn('Events real-time sync note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Error setting up events listener:', e);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'qibla') {
      setViewTab('qibla');
    } else if (tabParam === 'hadith') {
      setViewTab('hadith');
    } else if (tabParam === 'solat') {
      setViewTab('solat');
    }
  }, [location.search]);

  // Derive categories dynamically
  const uniqueCategories = Array.from(new Set(eventsList.map(e => e.category).filter(Boolean)));
  const categories = ['All', ...uniqueCategories];

  const filteredEvents = selectedCategory === 'All'
    ? eventsList
    : eventsList.filter(e => e.category === selectedCategory);

  const featuredEvent = eventsList.find(e => e.featured);

  return (
    <div className="min-h-screen bg-[#0f1115] pt-12 pb-20 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2a1a15] border border-[#e08a6e]/40 text-[#f5a287] font-bold text-xs tracking-wider uppercase shadow-lg">
                <Sparkles size={14} className="text-[#e08a6e]" />
                Spiritual & Community Center
              </span>
              {isAdmin && (
                <Link
                  to="/admin?tab=events"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#e08a6e] text-zinc-950 font-bold text-xs shadow hover:bg-[#eb977c] transition-all"
                >
                  <PlusCircle size={13} /> Add / Manage Events
                </Link>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              Events, Solat & <span className="text-[#f5a287]">Islamic Tools</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
              Join us for daily spiritual reflections, weekly Friday Khutbahs, live prayer times, and educational classes in Sunnyvale Estate, Abuja.
            </p>
          </div>

          {/* Main View Switcher */}
          <div className="flex flex-wrap items-center justify-center p-1.5 bg-[#181b22] border border-zinc-800 rounded-2xl mb-10 max-w-2xl mx-auto shadow-lg gap-1">
            <button
              onClick={() => setViewTab('schedule')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewTab === 'schedule'
                  ? 'bg-[#e08a6e] text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Calendar size={15} /> Programs ({eventsList.length})
            </button>
            <button
              onClick={() => setViewTab('solat')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewTab === 'solat'
                  ? 'bg-[#e08a6e] text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Sun size={15} /> Solat Times
            </button>
            <button
              onClick={() => setViewTab('hadith')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewTab === 'hadith'
                  ? 'bg-[#e08a6e] text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <BookOpen size={15} /> Daily Hadith
            </button>
            <button
              onClick={() => setViewTab('qibla')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewTab === 'qibla'
                  ? 'bg-[#e08a6e] text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Compass size={15} /> Qibla Direction
            </button>
          </div>

          {/* TAB 1: SCHEDULE */}
          {viewTab === 'schedule' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Featured Highlight Card */}
              {featuredEvent && (
                <div className="mb-10 bg-gradient-to-br from-[#1d2028] to-[#14171d] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-zinc-800 hover:border-[#e08a6e]/40 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <span className="px-3 py-1 bg-[#e08a6e] text-zinc-950 font-bold text-xs rounded-full uppercase tracking-wider shadow-sm">
                      Featured Program
                    </span>
                    <span className="text-zinc-400 text-xs font-medium flex items-center gap-1">
                      <MapPin size={14} className="text-[#e08a6e]" /> {featuredEvent.location}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
                    {featuredEvent.title}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 bg-[#121419]/90 p-4 rounded-2xl border border-zinc-750">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#251814] rounded-xl text-[#f5a287] border border-[#e08a6e]/30">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-medium">Timing & Schedule</p>
                        <p className="text-sm font-bold text-white">{featuredEvent.time}</p>
                        <p className="text-xs text-zinc-400/80">({featuredEvent.frequency})</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#251814] rounded-xl text-[#f5a287] border border-[#e08a6e]/30">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400 font-medium">Delivered By</p>
                        <p className="text-sm font-bold text-white">{featuredEvent.speaker}</p>
                        <p className="text-xs text-zinc-400/80">{featuredEvent.category}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {featuredEvent.description}
                  </p>
                </div>
              )}

              {/* Category Filter */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-[#e08a6e]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Filter Schedule:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#e08a6e] text-zinc-950 shadow-md font-bold'
                          : 'bg-[#181b22] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-750'
                      }`}
                    >
                      {cat === 'All' ? 'All Schedule' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Events Grid */}
              <div className="grid gap-4">
                {filteredEvents.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#181b22] rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2a1a15] text-[#f5a287] border border-[#e08a6e]/40">
                          {item.category}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {item.frequency}
                        </span>
                        {item.featured && (
                          <span className="px-2 py-0.2 bg-[#e08a6e] text-zinc-950 text-[10px] font-black rounded-full uppercase">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 w-fit">
                        <Clock size={13} className="text-zinc-400" />
                        <span>{item.time}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1.5">
                      {item.title}
                    </h3>

                    <p className="text-zinc-400 text-xs sm:text-sm mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-3 border-t border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-[#e08a6e]" />
                        <span>{item.speaker}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#e08a6e]" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 2: SOLAT / PRAYER TIMES */}
          {viewTab === 'solat' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PrayerTimes />
            </motion.div>
          )}

          {/* TAB 3: DAILY HADITH */}
          {viewTab === 'hadith' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DailyHadith />
            </motion.div>
          )}

          {/* TAB 4: QIBLA COMPASS */}
          {viewTab === 'qibla' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <QiblaCompass />
            </motion.div>
          )}

          {/* Quick Notice Banner */}
          <div className="mt-10 bg-[#181b22] p-5 rounded-2xl border border-zinc-800 text-center">
            <p className="text-xs sm:text-sm text-zinc-300 font-medium">
              ✨ <span className="font-bold text-white">Open to All:</span> All khutbahs, reflections, and educational programs are open to all community members and visitors.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Events;
