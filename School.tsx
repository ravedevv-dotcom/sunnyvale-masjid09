import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building2, Heart, ArrowRight, BookOpen, Users, Sparkles } from 'lucide-react';

const School: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f1115] transition-colors">
      {/* Hero Section */}
      <section className="bg-[#14171d] py-16 sm:py-20 relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 islamic-pattern opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-[#251814] border border-[#e08a6e]/40 rounded-2xl flex items-center justify-center text-[#f5a287] mx-auto mb-4 shadow-lg shadow-[#e08a6e]/20"
          >
            <GraduationCap size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight"
          >
            Expansion of School & <span className="text-[#f5a287]">Learning Center</span>
          </motion.h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto">
            Building the future of our community through the Alhamideen Academy and the new Adult Learning Center.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1a1d24] rounded-3xl shadow-xl p-6 sm:p-10 border border-zinc-800 hover:border-[#e08a6e]/30 transition-all"
          >
            <div className="space-y-6 text-zinc-200 text-sm sm:text-base leading-relaxed">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Building2 className="text-[#f5a287]" /> A Message from the EXCO
              </h2>
              
              <div className="p-4 bg-[#121419] rounded-2xl border-l-4 border-[#e08a6e] italic text-zinc-300">
                "Assalamu Alaikum muslim brothers and sisters, we the EXCO members of Sunnyvale Masjid announce the construction of the school as seen when entering the masjid."
              </div>

              <p>
                Please note that this facility is not only for children, but will also house an <strong className="text-[#f5a287]">adult learning center</strong> for Islamic education and Tajweed. As we know, community projects require our collective participation — so we invite the entire Sunnyvale Muslim Ummah to support this construction.
              </p>

              <div className="bg-[#121419] border border-zinc-800 p-6 rounded-2xl">
                <p className="text-[#f5a287] font-bold mb-2 flex items-center gap-2 text-sm">
                  <Heart size={16} className="text-[#e08a6e]" /> Continuous Charity (Sadaqah Jariyah)
                </p>
                <p className="text-xs sm:text-sm text-zinc-400">
                  As the Prophet Muhammad (ﷺ) said: 
                  <span className="block mt-2 italic font-serif text-white">
                    "Whoever builds a mosque for Allah, Allah will build for him a house in Paradise."
                  </span>
                </p>
              </div>

              <p>
                Every contribution brings us closer to completing this vital center for our children and adults. Even funding for a single bag of cement or block makes an enduring difference.
              </p>

              <div className="flex justify-center pt-6">
                <Link 
                  to="/donate" 
                  className="bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#e08a6e]/25 transition-all flex items-center gap-2"
                >
                  Donate to School Construction <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default School;
