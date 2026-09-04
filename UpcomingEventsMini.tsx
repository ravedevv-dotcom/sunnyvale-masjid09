import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, User, ArrowRight, Sparkles, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { EventItem, BASELINE_EVENTS } from './Events';

const UpcomingEventsMini: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>(BASELINE_EVENTS.slice(0, 3));

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'events'), (snapshot) => {
        if (!snapshot.empty) {
          const list: EventItem[] = [];
          snapshot.forEach(d => {
            list.push({ id: d.id, ...d.data() } as EventItem);
          });
          setEvents(list.slice(0, 3));
        } else {
          setEvents(BASELINE_EVENTS.slice(0, 3));
        }
      }, (err) => {
        console.warn('Events sync warning:', err);
        setEvents(BASELINE_EVENTS.slice(0, 3));
      });
      return () => unsub();
    } catch (e) {
      setEvents(BASELINE_EVENTS.slice(0, 3));
    }
  }, []);

  return (
    <div className="bg-[#14171d] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[#f5a287] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-[#e08a6e]" /> Community Calendar
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Calendar size={22} className="text-[#e08a6e]" /> Upcoming Masjid Events & Classes
          </h3>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#251814] hover:bg-[#321f1a] text-[#f5a287] border border-[#e08a6e]/40 text-xs font-bold transition-all shadow-sm"
        >
          <span>All Events & Khutbahs</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Events Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {events.map((evt) => (
          <motion.div
            key={evt.id}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-[#1a1d24] border border-zinc-800 hover:border-[#e08a6e]/40 transition-all flex flex-col justify-between shadow-lg group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#251814] text-[#f5a287] border border-[#e08a6e]/30">
                  {evt.category || 'Program'}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                  <Clock size={11} className="text-[#e08a6e]" /> {evt.time}
                </span>
              </div>

              <h4 className="text-base font-bold text-white group-hover:text-[#f5a287] transition-colors line-clamp-2 mb-2">
                {evt.title}
              </h4>

              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                {evt.description}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-1.5 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <User size={12} className="text-[#e08a6e] shrink-0" />
                <span className="truncate">{evt.speaker || 'Resident Imam'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-zinc-500 shrink-0" />
                <span className="truncate">{evt.location || 'Sunnyvale Masjid'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEventsMini;
