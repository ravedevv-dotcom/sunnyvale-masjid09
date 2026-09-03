import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, Shield, Users, Heart, Sparkles, MessageSquare, Send } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AskImamModal from './AskImamModal';

const About: React.FC = () => {
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('ask') === 'true') {
      setIsAskModalOpen(true);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-[#0f1115] transition-colors">
      <section className="bg-[#14171d] py-16 sm:py-20 relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 islamic-pattern opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 uppercase tracking-wider"
          >
            About <span className="text-[#f5a287]">Sunnyvale Masjid</span>
          </motion.h1>
          <div className="w-16 h-1 bg-[#e08a6e] mx-auto rounded-full"></div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1a1d24] rounded-3xl shadow-xl p-6 sm:p-10 border border-zinc-800 hover:border-[#e08a6e]/30 transition-all mb-8"
          >
            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed mb-6">
              We, the Ummah of SUNNYVALE HOMES MUSLIM COMMUNITY collectively and severally inspired by the philosophy of Islam, believing in the oneness of Almighty Allah and the prophet-hood of Muhammad (PBUH) which was demonstrated through unity.
            </p>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              We established this association to be known and addressed as <strong className="text-[#f5a287]">Sunnyvale Masjid</strong>, aimed at fostering unity, spiritual elevation, and structured Islamic education for our community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#1a1d24] p-6 sm:p-8 rounded-3xl border border-zinc-800 hover:border-[#e08a6e]/40 transition-all group"
            >
              <div className="w-10 h-10 bg-[#251814] rounded-xl flex items-center justify-center text-[#f5a287] mb-4 border border-[#e08a6e]/30 group-hover:border-[#e08a6e]/60 transition-colors">
                <Target size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#f5a287] transition-colors">Our Mission</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                To foster unity and mutual understanding among Muslims and neighbours within the Sunnyvale Homes Estate through dialogue, brotherhood, and joint community service.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#1a1d24] p-6 sm:p-8 rounded-3xl border border-zinc-800 hover:border-[#e08a6e]/40 transition-all group"
            >
              <div className="w-10 h-10 bg-[#251814] rounded-xl flex items-center justify-center text-[#f5a287] mb-4 border border-[#e08a6e]/30 group-hover:border-[#e08a6e]/60 transition-colors">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#f5a287] transition-colors">Community Welfare</h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                To assist and render religious, social, and humanitarian services to Muslims in dire need, ensuring care and dignity for every household.
              </p>
            </motion.div>
          </div>

          {/* Ask the Imam / Committee Callout */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#1f232b] to-[#171a21] border border-zinc-700 hover:border-[#e08a6e]/40 rounded-3xl p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-[#251814] text-[#f5a287] rounded-2xl border border-[#e08a6e]/40 shrink-0">
                <MessageSquare size={26} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Have a Religious or Community Question?</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
                  Submit a confidential inquiry to the Resident Imam or the Mosque EXCO Committee for guidance on Fiqh, marital affairs, or community matters.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAskModalOpen(true)}
              className="px-6 py-3 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#e08a6e]/20 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Send size={15} /> Ask the Imam
            </button>
          </motion.div>
        </div>
      </section>

      {/* Ask Imam Modal */}
      <AskImamModal 
        isOpen={isAskModalOpen} 
        onClose={() => setIsAskModalOpen(false)} 
      />
    </div>
  );
};

export default About;
