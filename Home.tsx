import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Heart, Users, BookOpen, Calendar, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import PrayerTimes from './PrayerTimes';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#0f1115]">
      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-[#0f1115]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070" 
            alt="Mosque Architecture" 
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1115]/85 via-[#0f1115]/95 to-[#0f1115]"></div>
          <div className="absolute inset-0 islamic-pattern opacity-5"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2a1a15] border border-[#e08a6e]/40 text-[#f5a287] text-xs font-bold uppercase tracking-widest mb-6 shadow-lg"
          >
            <Sparkles size={14} className="text-[#f5a287]" /> Sunnyvale Muslim Ummah
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#fbdcd3] to-[#e08a6e]">Sunnyvale Masjid</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-base sm:text-lg text-zinc-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Inspired by the philosophy of Islam, believing in the oneness of Almighty Allah and the prophet-hood of Muhammad (PBUH).
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              to="/donate" 
              className="bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-xl shadow-[#e08a6e]/20 flex items-center justify-center gap-2"
            >
              Support the Masjid <Heart size={18} />
            </Link>
            <Link 
              to="/events" 
              className="bg-zinc-800/90 text-zinc-200 border border-zinc-700 hover:border-[#e08a6e]/50 hover:text-[#f5a287] px-8 py-3.5 rounded-xl font-bold text-base hover:bg-zinc-750 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              View Prayer & Events <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Prayer Times Section */}
      <section className="bg-[#0f1115] py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <PrayerTimes />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#14171d] border-t border-b border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Our Community Pillars</h2>
            <div className="w-16 h-1 bg-[#e08a6e] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: <Users className="text-[#f5a287]" size={28} />, 
                title: "Unity & Brotherhood", 
                desc: "Fostering unity and mutual understanding among Muslims and neighbours within Sunnyvale Estate." 
              },
              { 
                icon: <BookOpen className="text-[#f5a287]" size={28} />, 
                title: "Islamic Education", 
                desc: "Nurturing children and adults through Alhamideen Academy and Qur'an study circles." 
              },
              { 
                icon: <Heart className="text-[#f5a287]" size={28} />, 
                title: "Welfare & Charity", 
                desc: "Assisting vulnerable families and rendering religious and social support." 
              },
              { 
                icon: <Calendar className="text-[#f5a287]" size={28} />, 
                title: "Spiritual Programs", 
                desc: "Weekly Friday Khutbahs, Sunday Q&A classes, and Ramadan community gatherings." 
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -6 }}
                className="p-8 bg-[#1a1d24] rounded-2xl border border-zinc-800 hover:border-[#e08a6e]/40 flex flex-col items-start transition-all shadow-lg group"
              >
                <div className="mb-5 p-3.5 bg-[#251814] rounded-xl border border-[#e08a6e]/30 group-hover:border-[#e08a6e]/60 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#f5a287] transition-colors">{feature.title}</h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* School Construction & Support Feature */}
      <section className="py-20 bg-[#0f1115]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#1a1d24] to-[#14171d] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 hover:border-[#e08a6e]/30 transition-all flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
              <span className="text-[#f5a287] font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#e08a6e]" /> Sadaqah Jariyah Project
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Support the New School & Adult Learning Center
              </h2>
              <p className="text-zinc-300 mb-6 text-sm leading-relaxed">
                The EXCO has embarked on constructing the new Alhamideen Academy and Adult Education Center to benefit all generations in Sunnyvale Homes.
              </p>
              
              <ul className="space-y-3 mb-8 text-xs sm:text-sm text-zinc-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#e08a6e] rounded-full"></div>
                  <span>Direct bank transfers with transparent record tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#e08a6e] rounded-full"></div>
                  <span>Accepts AEDC electricity credits for mosque power</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#e08a6e] rounded-full"></div>
                  <span>Real-time confirmation receipts in your member dashboard</span>
                </li>
              </ul>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/donate" 
                  className="bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#e08a6e]/20 transition-all"
                >
                  Make a Donation
                </Link>
                <Link 
                  to="/school" 
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-[#f5a287] px-6 py-3 rounded-xl font-bold text-sm border border-zinc-700 hover:border-[#e08a6e]/40 transition-all"
                >
                  Project Details
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative min-h-[320px]">
              <img 
                src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=2070" 
                alt="Community Gathering" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-30"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#1a1d24] via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
