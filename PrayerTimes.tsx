import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Compass, Sun, Sunrise, Sunset, Moon, Sparkles, Edit3 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from './firebase';
import { useAuth } from './AuthContext';

export interface PrayerScheduleData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jumuaKhutbah?: string;
  jumuaIqamah?: string;
  specialNote?: string;
  updatedAt?: any;
  updatedBy?: string;
}

export const DEFAULT_PRAYER_TIMES: PrayerScheduleData = {
  fajr: '05:15 AM',
  sunrise: '06:30 AM',
  dhuhr: '12:45 PM',
  asr: '04:15 PM',
  maghrib: '06:55 PM',
  isha: '08:15 PM',
  jumuaKhutbah: '12:50 PM',
  jumuaIqamah: '01:35 PM',
  specialNote: ''
};

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const timePart = clean.replace(/[^\d:]/g, '');
  const parts = timePart.split(':');
  if (parts.length < 2) return 0;
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10) || 0;
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

interface PrayerTimeDisplay {
  name: string;
  time: string;
  icon: React.ReactNode;
}

const PrayerTimes: React.FC = () => {
  const { isAdmin } = useAuth();
  const [schedule, setSchedule] = useState<PrayerScheduleData>(DEFAULT_PRAYER_TIMES);
  const [nextPrayerIndex, setNextPrayerIndex] = useState<number>(2);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Real-time Firestore sync
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'prayerTimes'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PrayerScheduleData;
          setSchedule(prev => ({
            ...prev,
            ...data
          }));
        }
      }, (err) => {
        console.warn('Prayer times real-time sync note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Error setting up prayer times listener:', e);
    }
  }, []);

  const prayerSchedule: PrayerTimeDisplay[] = [
    { name: 'Fajr', time: schedule.fajr, icon: <Sunrise size={18} /> },
    { name: 'Sunrise', time: schedule.sunrise, icon: <Sun size={18} /> },
    { name: 'Dhuhr', time: schedule.dhuhr, icon: <Sun size={18} /> },
    { name: 'Asr', time: schedule.asr, icon: <Sun size={18} /> },
    { name: 'Maghrib', time: schedule.maghrib, icon: <Sunset size={18} /> },
    { name: 'Isha', time: schedule.isha, icon: <Moon size={18} /> },
  ];

  // 2. Dynamic Next Prayer Calculation
  useEffect(() => {
    const updateNextPrayer = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const timesInMinutes = [
        parseTimeToMinutes(schedule.fajr),
        parseTimeToMinutes(schedule.sunrise),
        parseTimeToMinutes(schedule.dhuhr),
        parseTimeToMinutes(schedule.asr),
        parseTimeToMinutes(schedule.maghrib),
        parseTimeToMinutes(schedule.isha),
      ];

      let nextIndex = timesInMinutes.findIndex(t => t > currentMinutes);
      if (nextIndex === -1) nextIndex = 0; // Loops around to Fajr next morning
      setNextPrayerIndex(nextIndex);
    };

    updateNextPrayer();
    const interval = setInterval(updateNextPrayer, 30000);
    return () => clearInterval(interval);
  }, [schedule]);

  // Scroll the upcoming prayer card into the front view on mount / update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current && nextPrayerIndex >= 0) {
        const container = scrollRef.current;
        const cards = container.children;
        if (cards && cards[nextPrayerIndex]) {
          const targetCard = cards[nextPrayerIndex] as HTMLElement;
          const targetScroll = Math.max(0, targetCard.offsetLeft - 8);
          container.scrollTo({ left: targetScroll, behavior: 'smooth' });
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [nextPrayerIndex]);

  return (
    <div className="text-zinc-100 py-3 sm:py-6 relative my-2 sm:my-4 w-full">
      {/* Centered Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 text-[#f5a287] font-bold text-xs uppercase tracking-widest mb-1.5">
          <Sparkles size={14} className="text-[#e08a6e]" /> Daily Solat Timetable
          {isAdmin && (
            <Link
              to="/admin?tab=prayer-times"
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e08a6e]/20 border border-[#e08a6e]/40 text-[#f5a287] hover:bg-[#e08a6e] hover:text-zinc-950 transition-colors text-[10px] font-bold"
            >
              <Edit3 size={10} /> Edit in Admin
            </Link>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <Clock size={24} className="text-[#f5a287]" />
          <span>Prayer Times</span>
        </h2>

        <p className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1">
          <MapPin size={12} className="text-[#e08a6e]" /> Sunnyvale Homes Estate, Abuja
        </p>

        {/* Upcoming Solat Highlight Pill */}
        <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 rounded-full bg-[#251814] border border-[#e08a6e]/40 text-xs shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#f5a287] animate-pulse"></span>
          <span className="text-zinc-300">Upcoming:</span>
          <strong className="text-[#f5a287] font-bold">
            {prayerSchedule[nextPrayerIndex]?.name} ({prayerSchedule[nextPrayerIndex]?.time})
          </strong>
        </div>
      </div>

      {/* Prayer Cards - Clean Horizontal Track with Touch Scrolling */}
      <div className="relative px-1 sm:px-3">
        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-6 gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 touch-pan-x cursor-grab"
        >
          {prayerSchedule.map((prayer, idx) => {
            const isNext = idx === nextPrayerIndex;
            return (
              <motion.div
                key={prayer.name}
                whileHover={{ y: -2 }}
                className={`w-[calc(50%-6px)] min-w-[calc(50%-6px)] max-w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] sm:min-w-[calc(33.333%-8px)] sm:max-w-none md:w-auto md:min-w-0 md:max-w-none snap-start shrink-0 p-4 sm:p-3.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                  isNext
                    ? 'bg-gradient-to-b from-[#e08a6e] to-[#c86d51] text-zinc-950 shadow-xl ring-2 ring-[#f5a287] font-bold shadow-[#e08a6e]/40 z-10'
                    : 'bg-[#16181f] hover:bg-[#1d2029] text-zinc-300 border border-zinc-800 hover:border-[#e08a6e]/30'
                }`}
              >
                <div
                  className={`p-3 sm:p-2.5 rounded-xl mb-2 sm:mb-1.5 ${
                    isNext
                      ? 'bg-zinc-950 text-[#f5a287]'
                      : 'bg-[#251814] text-[#f5a287] border border-[#e08a6e]/30'
                  }`}
                >
                  {prayer.icon}
                </div>
                <span
                  className={`text-xs sm:text-[11px] uppercase tracking-wider font-bold ${
                    isNext ? 'text-zinc-950 font-black' : 'text-zinc-400'
                  }`}
                >
                  {prayer.name}
                </span>
                <span
                  className={`text-lg sm:text-base md:text-base font-black mt-1 tracking-tight ${
                    isNext ? 'text-zinc-950 font-black' : 'text-white'
                  }`}
                >
                  {prayer.time}
                </span>
                {isNext ? (
                  <span className="mt-2 text-[10px] sm:text-[9px] bg-zinc-950 text-[#f5a287] px-2.5 py-0.5 rounded-full uppercase tracking-widest font-extrabold shadow-sm">
                    Upcoming
                  </span>
                ) : (
                  <span className="mt-2 text-[10px] sm:text-[9px] text-zinc-500 uppercase tracking-wider font-medium">
                    Daily
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Swipe Hint & Quick Jumu'ah Notice */}
        <div className="md:hidden mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 px-1">
          <span className="text-zinc-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e08a6e]/60"></span>
            Swipe horizontally for all 6 prayers
          </span>
          <span className="text-[#f5a287] font-semibold">
            Jumu'ah: {schedule.jumuaKhutbah || '12:50 PM'}
          </span>
        </div>
      </div>

      {/* Friday Jumu'ah Notice - Centered at bottom */}
      <div className="hidden md:flex mt-6 pt-4 border-t border-zinc-800/80 flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-[#e08a6e] shrink-0" />
          <span>Qibla Direction: <strong className="text-[#f5a287]">68° East-Northeast</strong> from Sunnyvale Estate</span>
        </div>
        <div className="bg-[#2a1a15] px-3.5 py-1.5 rounded-full text-[#f5a287] font-semibold border border-[#e08a6e]/40">
          Jumu'ah Prayer: Khutbah at {schedule.jumuaKhutbah || '12:50 PM'} • Iqamah at {schedule.jumuaIqamah || '01:35 PM'}
        </div>
      </div>
    </div>
  );
};

export default PrayerTimes;

