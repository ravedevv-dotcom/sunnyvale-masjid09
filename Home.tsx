import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Heart, Users, BookOpen, Calendar, Sparkles, Compass, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import PrayerTimes from './PrayerTimes';
import MiniAzkhar from './MiniAzkhar';
import QiblaCompass from './QiblaCompass';
import UpcomingEventsMini from './UpcomingEventsMini';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#0f1115] text-zinc-100">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[#0f1115]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070" 
            alt="Mosque Architecture" 
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1115]/80 via-[#0f1115]/95 to-[#0f1115]"></div>
          <div className="absolute inset-0 islamic-pattern opacity-5"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2a1a15] border border-[#e08a6e]/40 text-[#f5a287] text-xs font-bold uppercase tracking-widest mb-5 shadow-lg"
          >
            <Sparkles size={14} className="text-[#f5a287]" /> Sunnyvale Muslim Ummah • Abuja
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight"
          >
            Welcome to <span className="text-[#f5a287]">Sunnyvale Masjid</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-zinc-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            We, the Ummah of Sunnyvale Masjid collectively inspired by the philosophy of Islam, believing in the oneness of Almighty Allah and the prophet-hood of Muhammad (PBUH).
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-3.5 justify-center"
          >
            <Link 
              to="/donate" 
              className="bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 px-7 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xl shadow-[#e08a6e]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart size={16} /> Support the Masjid
            </Link>
            <Link 
              to="/school" 
              className="bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-[#e08a6e]/50 hover:text-[#f5a287] px-7 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <GraduationCap size={16} /> Alhamedeen Academy
            </Link>
            <Link 
              to="/events" 
              className="bg-[#181b22] text-zinc-300 border border-zinc-750 hover:text-white px-5 py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <Calendar size={16} /> Events & Classes
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Main Home Stream - Cleanly Spaced and Decluttered */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 pb-20 overflow-x-hidden">
        
        {/* 1. Daily Solat & Iqamah Schedule */}
        <section id="prayer-times" className="w-full">
          <PrayerTimes />
        </section>

        {/* 2. Directly Under Prayer Time: Mini Azkhar Section */}
        <section id="daily-azkhar" className="w-full flex justify-center">
          <MiniAzkhar />
        </section>

        {/* 3. Active Qiblah Compass */}
        <section id="qibla-compass" className="w-full flex justify-center">
          <QiblaCompass />
        </section>

        {/* 4. Mini Events Section for New & Upcoming Events */}
        <section id="upcoming-events">
          <UpcomingEventsMini />
        </section>

        {/* 5. Alhamedeen Academy Feature Highlight */}
        <section id="school-academy">
          <div className="bg-gradient-to-br from-[#181b22] to-[#121419] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 hover:border-[#e08a6e]/40 transition-all flex flex-col lg:flex-row">
            <div className="lg:w-7/12 p-6 sm:p-10 flex flex-col justify-center">
              <span className="text-[#f5a287] font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <GraduationCap size={15} className="text-[#e08a6e]" /> Community Education Center
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                ALHAMEDEEN ACADEMY & Adult Learning Center
              </h2>
              <p className="text-zinc-300 mb-6 text-xs sm:text-sm leading-relaxed">
                Constructed adjacent to the Masjid to nurture our children through Tahfeez al-Qur'an, Islamic sciences, and conventional British-Nigerian academic excellence, with evening classes for adults.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs text-zinc-300">
                <div className="flex items-center gap-2 bg-[#121419] p-3 rounded-xl border border-zinc-800">
                  <div className="w-2 h-2 bg-[#e08a6e] rounded-full shrink-0"></div>
                  <span>Early Years to Secondary Education</span>
                </div>
                <div className="flex items-center gap-2 bg-[#121419] p-3 rounded-xl border border-zinc-800">
                  <div className="w-2 h-2 bg-[#e08a6e] rounded-full shrink-0"></div>
                  <span>Adult Evening Tajweed Halaqah</span>
                </div>
                <div className="flex items-center gap-2 bg-[#121419] p-3 rounded-xl border border-zinc-800">
                  <div className="w-2 h-2 bg-[#e08a6e] rounded-full shrink-0"></div>
                  <span>Certified Islamic & STEM Teachers</span>
                </div>
                <div className="flex items-center gap-2 bg-[#121419] p-3 rounded-xl border border-zinc-800">
                  <div className="w-2 h-2 bg-[#e08a6e] rounded-full shrink-0"></div>
                  <span>Ongoing Sadaqah Jariyah Fund</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <Link 
                  to="/school" 
                  className="bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <span>Explore Academy & Waitlist</span>
                  <ArrowRight size={14} />
                </Link>
                <span className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Admissions Ended for Current Session
                </span>
                <Link 
                  to="/donate" 
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm border border-zinc-700 transition-all ml-auto sm:ml-0"
                >
                  Donate to Construction
                </Link>
              </div>
            </div>
            
            <div className="lg:w-5/12 relative min-h-[260px] bg-zinc-900">
              <img 
                src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=1200" 
                alt="Alhamedeen Academy Students" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#181b22] via-transparent to-transparent"></div>
            </div>
          </div>
        </section>

        {/* 6. Community Pillars */}
        <section id="community-pillars">
          <div className="text-center mb-8">
            <span className="text-[#f5a287] font-bold text-xs uppercase tracking-widest">Sunnyvale Mosque Mandate</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Our Core Community Pillars</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { 
                icon: <Users className="text-[#f5a287]" size={24} />, 
                title: "Unity & Brotherhood", 
                desc: "Fostering unity, mutual peace, and support among Muslims and neighbours across Sunnyvale Homes." 
              },
              { 
                icon: <BookOpen className="text-[#f5a287]" size={24} />, 
                title: "Islamic Education", 
                desc: "Structured Qur'an learning, Tajweed, and moral Tarbiyyah for children and adults through Alhamedeen Academy." 
              },
              { 
                icon: <Heart className="text-[#f5a287]" size={24} />, 
                title: "Welfare & Charity", 
                desc: "Monthly 26th donation initiatives, Ramadan iftars, and humanitarian relief for vulnerable residents." 
              },
              { 
                icon: <Calendar className="text-[#f5a287]" size={24} />, 
                title: "Solat & Khutbahs", 
                desc: "Daily 5 congregational prayers, Friday Jumu'ah khutbahs, and Sunday interactive Fiqh classes." 
              }
            ].map((pillar, idx) => (
              <div 
                key={idx}
                className="p-6 bg-[#181b22] rounded-2xl border border-zinc-800 hover:border-[#e08a6e]/40 transition-all flex flex-col items-start"
              >
                <div className="mb-4 p-3 bg-[#251814] rounded-xl border border-[#e08a6e]/30">
                  {pillar.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{pillar.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
