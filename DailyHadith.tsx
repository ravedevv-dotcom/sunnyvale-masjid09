import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Share2, Copy, Check, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { DAILY_HADITHS } from './constants';

const DailyHadith: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const hadith = DAILY_HADITHS[currentIndex] || DAILY_HADITHS[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DAILY_HADITHS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + DAILY_HADITHS.length) % DAILY_HADITHS.length);
  };

  const handleCopy = () => {
    const text = `"${hadith.translation}"\n- ${hadith.source}\n(Sunnyvale Muslim Community, Abuja)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Hadith copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#181b22] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl relative overflow-hidden text-zinc-100">
      <div className="absolute top-0 right-0 w-48 h-48 bg-zinc-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase tracking-widest">
          <BookOpen size={16} /> Hadith & Spiritual Reflection
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-2 bg-[#121419] hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-750 transition-colors cursor-pointer"
            title="Previous Reflection"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[11px] text-zinc-400 font-mono px-1">
            {currentIndex + 1} / {DAILY_HADITHS.length}
          </span>
          <button
            onClick={handleNext}
            className="p-2 bg-[#121419] hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-750 transition-colors cursor-pointer"
            title="Next Reflection"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 text-center sm:text-left"
        >
          {/* Arabic Calligraphy */}
          <div 
            dir="rtl" 
            className="text-xl sm:text-2xl font-serif leading-loose text-zinc-200 text-right py-2 font-medium tracking-wide"
            style={{ fontFamily: "'Traditional Arabic', 'Scheherazade New', 'Amiri', serif" }}
          >
            {hadith.arabic}
          </div>

          {/* English Translation */}
          <blockquote className="text-sm sm:text-base text-zinc-200 italic font-sans leading-relaxed border-l-2 border-zinc-500 pl-4">
            "{hadith.translation}"
          </blockquote>

          {/* Reference & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-zinc-800">
            <span className="text-xs text-zinc-400 font-semibold font-mono">
              — {hadith.source}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121419] hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} className="text-zinc-300" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Share Reflection'}</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DailyHadith;
