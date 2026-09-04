import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, ArrowRight, BookOpen, RotateCcw, Check, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface MiniDhikr {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  count: number;
}

const MINI_ADHKAR_LIST: Record<string, MiniDhikr[]> = {
  'post-salah': [
    {
      id: 'subhanallah',
      title: 'Tasbih (33x)',
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'SubhanAllah',
      translation: 'Glory be to Allah',
      count: 33,
    },
    {
      id: 'alhamdulillah',
      title: 'Tahmid (33x)',
      arabic: 'الْحَمْدُ لِلَّهِ',
      transliteration: 'Alhamdulillah',
      translation: 'All praise is for Allah',
      count: 33,
    },
    {
      id: 'allahuakbar',
      title: 'Takbir (33x)',
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allahu Akbar',
      translation: 'Allah is the Greatest',
      count: 33,
    },
    {
      id: 'tahlil',
      title: '100th Completion',
      arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      transliteration: 'La ilaha illallahu wahdahu la shareeka lah...',
      translation: 'None has the right to be worshipped except Allah alone',
      count: 1,
    }
  ],
  'morning': [
    {
      id: 'm-sayyid',
      title: 'Sayyid al-Istighfar',
      arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ...',
      transliteration: 'Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani...',
      translation: 'O Allah, You are my Lord, there is none worthy of worship but You...',
      count: 1,
    },
    {
      id: 'm-bismillah',
      title: 'Protection Du\'a (3x)',
      arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      transliteration: "Bismillahilladhi la yadurru ma'asmihi shay'un...",
      translation: 'In the Name of Allah with Whose Name nothing can cause harm on earth or in the heavens...',
      count: 3,
    }
  ],
  'evening': [
    {
      id: 'e-amsayna',
      title: 'Evening Remembrance',
      arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ',
      transliteration: 'Amsayna wa amsal-mulku lillah, wal-hamdu lillah...',
      translation: 'We have entered the evening, and dominion belongs to Allah...',
      count: 1,
    },
    {
      id: 'e-audhu',
      title: 'Refuge from Evil (3x)',
      arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      transliteration: "A'udhu bi kalimatillahit-tammati min sharri ma khalaq",
      translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created',
      count: 3,
    }
  ]
};

const MiniAzkhar: React.FC = () => {
  const [tab, setTab] = useState<'post-salah' | 'morning' | 'evening'>('post-salah');
  const [counts, setCounts] = useState<Record<string, number>>({});

  const handleTap = (id: string, max: number) => {
    setCounts(prev => {
      const next = (prev[id] || 0) + 1;
      if (next === max) {
        toast.success(`Completed ${max}x remembrance!`);
      }
      return { ...prev, [id]: next };
    });
  };

  const handleReset = (id: string) => {
    setCounts(prev => ({ ...prev, [id]: 0 }));
  };

  const items = MINI_ADHKAR_LIST[tab] || MINI_ADHKAR_LIST['post-salah'];

  return (
    <div className="bg-gradient-to-br from-[#161920] to-[#111317] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-zinc-800 shadow-xl relative overflow-hidden w-full max-w-5xl mx-auto">
      {/* Centered Section Header */}
      <div className="text-center mb-6 pb-4 border-b border-zinc-800/80">
        <span className="inline-flex items-center justify-center gap-1.5 text-[#f5a287] font-bold text-xs uppercase tracking-widest mb-1.5">
          <Sparkles size={14} className="text-[#e08a6e]" /> Daily Spiritual Fortress
        </span>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-2">
          <BookOpen size={22} className="text-[#e08a6e]" />
          <span>Post-Solat & Daily Azkhar</span>
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
          Authentic daily prophetic invocations with digital tap tasbih counters.
        </p>

        {/* Category Switcher - Centered */}
        <div className="flex justify-center mt-4">
          <div className="inline-flex max-w-full bg-[#101216] p-1 rounded-xl border border-zinc-750 text-xs gap-1">
            <button
              type="button"
              onClick={() => setTab('post-salah')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                tab === 'post-salah' ? 'bg-[#e08a6e] text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Post-Solat
            </button>
            <button
              type="button"
              onClick={() => setTab('morning')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                tab === 'morning' ? 'bg-[#e08a6e] text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Morning
            </button>
            <button
              type="button"
              onClick={() => setTab('evening')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                tab === 'evening' ? 'bg-[#e08a6e] text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Evening
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Track of Mini Azkhar items */}
      <div className="w-full relative">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 touch-pan-x cursor-grab">
          {items.map((dhikr) => {
            const current = counts[dhikr.id] || 0;
            const isDone = current >= dhikr.count;

            return (
              <div
                key={dhikr.id}
                className={`w-[260px] sm:w-[300px] md:w-[330px] shrink-0 snap-start p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-[#1a1d24] border-zinc-800 hover:border-[#e08a6e]/40'
                }`}
              >
                <div className="min-w-0 flex flex-col">
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <span className="text-xs font-bold text-[#f5a287] truncate">{dhikr.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-xs text-white font-bold bg-zinc-900 px-2.5 py-0.5 rounded-md border border-zinc-750">
                        {current} / {dhikr.count}
                      </span>
                      {current > 0 && (
                        <button
                          type="button"
                          onClick={() => handleReset(dhikr.id)}
                          className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                          title="Reset"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div dir="rtl" className="text-lg sm:text-xl font-serif text-[#fbdcd3] py-2.5 text-right break-words leading-relaxed min-h-[64px] flex items-center justify-end">
                    {dhikr.arabic}
                  </div>

                  <p className="text-xs text-zinc-400 italic mb-1.5 break-words line-clamp-2">
                    {dhikr.transliteration}
                  </p>
                  <p className="text-xs text-zinc-300 break-words line-clamp-3 leading-normal">
                    {dhikr.translation}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => handleTap(dhikr.id, dhikr.count)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                      isDone
                        ? 'bg-emerald-500 text-zinc-950 font-black'
                        : 'bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 shadow-sm'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 size={15} /> Completed
                      </>
                    ) : (
                      <span>Tap to Count (+1)</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer link to full page */}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-3">
        <span className="text-xs text-zinc-400">
          Fortress of the Muslim (Hisnul Muslim) authentic daily invocations.
        </span>
        <Link
          to="/adhkar-hadith"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f5a287] hover:text-[#fbdcd3] hover:underline shrink-0"
        >
          View Full Adhkar & Hadith Page <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default MiniAzkhar;
