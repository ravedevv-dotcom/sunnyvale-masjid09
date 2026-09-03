import React, { useState, useEffect } from 'react';
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

  return (
    <div className="bg-gradient-to-br from-[#1a1d24] to-[#121419] text-zinc-100 rounded-3xl p-6 md:p-8 shadow-2xl border border-zinc-800 relative overflow-hidden my-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 islamic-pattern opacity-5 pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-[#f5a287] font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles size={14} className="text-[#e08a6e]" /> Daily Solat Schedule
              {isAdmin && (
                <Link
                  to="/admin?tab=prayer-times"
                  className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e08a6e]/20 border border-[#e08a6e]/40 text-[#f5a287] hover:bg-[#e08a6e] hover:text-zinc-950 transition-colors text-[10px] font-bold"
                >
                  <Edit3 size={10} /> Edit in Admin
                </Link>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Prayer Times
            </h2>
            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-[#e08a6e]" /> Sunnyvale Homes Estate, Abuja
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#16181e]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#e08a6e]/30 shadow-sm">
            <Clock size={18} className="text-[#f5a287] animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] text-[#f5a287] uppercase font-semibold">Next Solat</p>
              <p className="text-sm font-bold text-white">
                {prayerSchedule[nextPrayerIndex]?.name} ({prayerSchedule[nextPrayerIndex]?.time})
              </p>
            </div>
          </div>
        </div>

        {/* Special Note if set by Admin */}
        {schedule.specialNote && (
          <div className="mb-6 p-3.5 bg-[#251814] border border-[#e08a6e]/40 rounded-2xl flex items-center gap-2.5 text-xs text-[#fbdcd3]">
            <Sparkles size={15} className="text-[#e08a6e] shrink-0" />
            <span>{schedule.specialNote}</span>
          </div>
        )}

        {/* Prayer Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {prayerSchedule.map((prayer, idx) => {
            const isNext = idx === nextPrayerIndex;
            return (
              <motion.div
                key={prayer.name}
                whileHover={{ y: -3 }}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                  isNext
                    ? 'bg-gradient-to-b from-[#e08a6e] to-[#c86d51] text-zinc-950 shadow-xl ring-2 ring-[#f5a287] scale-105 font-bold shadow-[#e08a6e]/30'
                    : 'bg-[#15171d]/80 hover:bg-[#1c1f26] text-zinc-300 border border-zinc-800 hover:border-[#e08a6e]/30'
                }`}
              >
                <div className={`p-2 rounded-xl mb-2 ${isNext ? 'bg-zinc-950 text-[#f5a287]' : 'bg-[#251814] text-[#f5a287] border border-[#e08a6e]/30'}`}>
                  {prayer.icon}
                </div>
                <span className={`text-xs uppercase tracking-wider font-semibold ${isNext ? 'text-zinc-950 font-black' : 'text-zinc-400'}`}>
                  {prayer.name}
                </span>
                <span className={`text-base font-bold mt-1 ${isNext ? 'text-zinc-950 font-black' : 'text-white'}`}>
                  {prayer.time}
                </span>
                {isNext && (
                  <span className="mt-2 text-[10px] bg-zinc-950 text-[#f5a287] px-2 py-0.5 rounded-full uppercase tracking-widest font-extrabold shadow-sm">
                    Next
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Friday Jumu'ah Notice */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-[#e08a6e] shrink-0" />
            <span>Qibla Direction: <strong className="text-[#f5a287]">68° East-Northeast</strong> from Sunnyvale Estate</span>
          </div>
          <div className="bg-[#2a1a15] px-3.5 py-1.5 rounded-full text-[#f5a287] font-semibold border border-[#e08a6e]/40">
            Jumu'ah Prayer: Khutbah at {schedule.jumuaKhutbah || '12:50 PM'} • Iqamah at {schedule.jumuaIqamah || '01:35 PM'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimes;
