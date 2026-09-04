import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, BookOpen, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { DAILY_HADITHS } from './constants';

const DailyHadith: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hadith = DAILY_HADITHS[currentIndex] || DAILY_HADITHS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      {/* Header & Dropdown Section */}
      <div className="mb-6 pb-4 border-b border-zinc-800" ref={dropdownRef}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-[#f5a287] font-bold text-xs uppercase tracking-widest">
            <BookOpen size={16} /> Selected Prophetic Narrations
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={handlePrev}
              className="p-2 bg-[#121419] hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-750 transition-colors cursor-pointer active:scale-95"
              title="Previous Reflection"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] text-zinc-400 font-mono px-2">
              {currentIndex + 1} / {DAILY_HADITHS.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2 bg-[#121419] hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-750 transition-colors cursor-pointer active:scale-95"
              title="Next Reflection"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full text-left bg-[#121419] hover:bg-[#161922] p-3 sm:p-3.5 rounded-xl border border-zinc-750 hover:border-[#e08a6e]/50 transition-all flex items-center justify-between gap-3 cursor-pointer shadow-inner"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">
                  #{currentIndex + 1}. {hadith.source}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate italic mt-0.5">
                "{hadith.translation}"
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
              <span className="text-[11px] font-medium hidden sm:inline">Change</span>
              <div className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                <ChevronDown size={16} className="text-[#f5a287]" />
              </div>
            </div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.99 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#181b22] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar divide-y divide-zinc-800"
              >
                {DAILY_HADITHS.map((item, idx) => {
                  const isSelected = currentIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left p-3 sm:p-3.5 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-[#251814] text-white'
                          : 'hover:bg-[#1e222b] text-zinc-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#f5a287]' : 'text-zinc-200'}`}>
                          #{idx + 1}. {item.source}
                        </span>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          "{item.translation}"
                        </p>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#e08a6e] text-zinc-950 flex items-center justify-center shrink-0">
                          <Check size={12} className="stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
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
