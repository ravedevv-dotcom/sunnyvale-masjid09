import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Sun, 
  Moon, 
  Heart, 
  CheckCircle2, 
  Share2, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Volume2,
  Bookmark,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';

export interface DhikrItem {
  id: string;
  title: string;
  category: 'post-prayer' | 'morning' | 'evening' | 'general';
  arabic: string;
  transliteration: string;
  translation: string;
  count: number;
  virtue?: string;
  source: string;
}

export const AUTHENTIC_ADHKAR: DhikrItem[] = [
  // Post-Prayer Adhkar
  {
    id: 'post-istighfar',
    title: 'Seeking Forgiveness & Salam (3 times)',
    category: 'post-prayer',
    arabic: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ. اللَّهُمَّ أَنْتَ السَّلامُ وَمِنْكَ السَّلامُ، تَبَارَكْتَ يَا ذَا الجَلالِ وَالإِكْرَامِ',
    transliteration: 'Astaghfirullah, Astaghfirullah, Astaghfirullah. Allahumma antas-Salamu wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.',
    translation: 'I ask Allah for forgiveness (3 times). O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of majesty and honor.',
    count: 1,
    virtue: 'Recited immediately upon finishing each obligatory prayer.',
    source: 'Sahih Muslim 591'
  },
  {
    id: 'post-ayat-kursi',
    title: 'Ayat al-Kursi (The Throne Verse)',
    category: 'post-prayer',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: "Allahu la ilaha illa Huwal-Hayyul-Qayyum, la ta'khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard...",
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...',
    count: 1,
    virtue: 'The Prophet (ﷺ) said: Whoever recites Ayat al-Kursi after every obligatory prayer, nothing stands between him and entering Paradise except death.',
    source: "Sunan an-Nasa'i 9848, Sahih"
  },
  {
    id: 'post-subhanallah',
    title: 'Tasbih: SubhanAllah (33 times)',
    category: 'post-prayer',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah, free from any imperfection.',
    count: 33,
    virtue: 'Recited 33 times after each prayer followed by Tahmid and Takbir.',
    source: 'Sahih al-Bukhari 843, Sahih Muslim 597'
  },
  {
    id: 'post-alhamdulillah',
    title: 'Tahmid: Alhamdulillah (33 times)',
    category: 'post-prayer',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise and gratitude is due solely to Allah.',
    count: 33,
    virtue: 'Fills the scale with good deeds on the Day of Judgment.',
    source: 'Sahih Muslim 597'
  },
  {
    id: 'post-allahuakbar',
    title: 'Takbir: Allahu Akbar (33 times)',
    category: 'post-prayer',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest.',
    count: 33,
    virtue: 'Completing 99 remembrances after solat.',
    source: 'Sahih Muslim 597'
  },
  {
    id: 'post-tahlil-100',
    title: 'Completing the 100th Dhikr',
    category: 'post-prayer',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamd, wa Huwa ala kulli shay-in qadeer.',
    translation: 'None has the right to be worshipped except Allah alone, without partner. To Him belongs all sovereignty and praise, and He is over all things capable.',
    count: 1,
    virtue: 'Forgives sins even if they were like the foam of the sea.',
    source: 'Sahih Muslim 597'
  },

  // Morning Adhkar
  {
    id: 'morning-sayyid',
    title: 'Sayyid al-Istighfar (The Master Supplication for Forgiveness)',
    category: 'morning',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u laka bidhanbi faghfir li fa-innahu la yaghfirudh-dhunuba illa Anta.",
    translation: 'O Allah, You are my Lord; there is no deity except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done...',
    count: 1,
    virtue: 'If anyone recites this in the morning with conviction and dies that day, he will be among the people of Paradise.',
    source: 'Sahih al-Bukhari 6306'
  },
  {
    id: 'morning-bismillah',
    title: 'Protection in the Name of Allah (3 times)',
    category: 'morning',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: "Bismillahilladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
    translation: "In the name of Allah, with whose name nothing on earth or in the sky can cause harm, and He is the All-Hearing, the All-Knowing.",
    count: 3,
    virtue: 'Nothing will harm him who recites it 3 times morning and evening.',
    source: 'Sunan Abi Dawud 5088, At-Tirmidhi 3388'
  },
  {
    id: 'morning-radheeytu',
    title: 'Contentment with Allah, Islam & Muhammad (ﷺ)',
    category: 'morning',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    transliteration: 'Radheetu billahi Rabba, wa bil-Islami deena, wa bi-Muhammadin sallallahu alayhi wa sallama Nabiyya.',
    translation: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (ﷺ) as my Prophet.',
    count: 3,
    virtue: 'Allah takes upon Himself the promise to make him pleased on the Day of Resurrection.',
    source: 'At-Tirmidhi 3389'
  },

  // Evening Adhkar
  {
    id: 'evening-amsayna',
    title: 'Evening Proclamation of Sovereignty',
    category: 'evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: 'Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la shareeka lah.',
    translation: 'We have entered the evening, and with it all dominion belongs to Allah, and all praise belongs to Allah...',
    count: 1,
    virtue: 'Evening affirmation of Allah’s supreme dominion and seeking protection.',
    source: 'Sahih Muslim 2723'
  },
  {
    id: 'evening-audhu',
    title: 'Refuge in the Perfect Words of Allah (3 times)',
    category: 'evening',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'udhu bi kalimatillahit-tammati min sharri ma khalaq.",
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    count: 3,
    virtue: 'No venomous creature or unexpected calamity will harm him that night.',
    source: 'Sahih Muslim 2709'
  }
];

export interface HadithCollectionItem {
  id: string;
  arabic: string;
  translation: string;
  narrator: string;
  source: string;
  theme: string;
  commentary: string;
}

export const EXPANDED_HADITH_LIBRARY: HadithCollectionItem[] = [
  {
    id: 'hadith-niyyah',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ',
    translation: 'Actions are but by intentions, and every person will have only what they intended. Whoever emigrated for the sake of Allah and His Messenger, his emigration is for what he intended.',
    narrator: 'Narrated by Umar ibn al-Khattab (RA)',
    source: 'Sahih al-Bukhari 1, Sahih Muslim 1907',
    theme: 'Sincerity & Intention (Ikhlas)',
    commentary: 'This Hadith is the cornerstone of all Islamic deeds. Every charity, prayer, or school construction support earns divine reward only in proportion to pure sincerity for Allah alone.'
  },
  {
    id: 'hadith-masjid',
    arabic: 'مَنْ بَنَى مَسْجِدًا لِلَّهِ، بَنَى اللَّهُ لَهُ فِي الْجَنَّةِ مِثْلَهُ',
    translation: 'Whoever builds a mosque for Allah, Allah will build for him a house like it in Paradise.',
    narrator: 'Narrated by Uthman ibn Affan (RA)',
    source: 'Sahih al-Bukhari 450, Sahih Muslim 533',
    theme: 'Mosque Construction & Sadaqah Jariyah',
    commentary: 'Building and maintaining the house of Allah, including our Sunnyvale Masjid and Alhamideen Academy classrooms, is an enduring continuous charity that continues to benefit a believer even after death.'
  },
  {
    id: 'hadith-brotherhood',
    arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    translation: 'None of you truly believes until he loves for his brother what he loves for himself.',
    narrator: 'Narrated by Anas ibn Malik (RA)',
    source: 'Sahih al-Bukhari 13, Sahih Muslim 45',
    theme: 'Mutual Love & Community Unity',
    commentary: 'True Islamic brotherhood means wishing your fellow Sunnyvale neighbours the same peace, provision, security, and guidance that you desire for your own household.'
  },
  {
    id: 'hadith-charity-wealth',
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا، وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلَّا رَفَعَهُ اللَّهُ',
    translation: 'Charity does not decrease wealth; no one forgives another except that Allah increases his honor; and no one humbles himself for Allah except that Allah elevates him.',
    narrator: 'Narrated by Abu Hurairah (RA)',
    source: 'Sahih Muslim 2588',
    theme: 'Blessing of Sadaqah & Humility',
    commentary: 'Giving monthly contributions on the 26th and supporting vulnerable community members brings divine barakah (growth) and cleanses wealth.'
  },
  {
    id: 'hadith-quran',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'The best among you are those who learn the Qur\'an and teach it.',
    narrator: 'Narrated by Uthman ibn Affan (RA)',
    source: 'Sahih al-Bukhari 5027',
    theme: 'Qur\'an Education & Alhamideen Academy',
    commentary: 'Learning, memorizing, and teaching the Holy Book is the highest noble pursuit, which forms the primary mission of Alhamideen Academy at Sunnyvale Masjid.'
  },
  {
    id: 'hadith-kindness',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ',
    translation: 'Whoever believes in Allah and the Last Day should speak good or remain silent; and whoever believes in Allah and the Last Day should honor his neighbour.',
    narrator: 'Narrated by Abu Hurairah (RA)',
    source: 'Sahih al-Bukhari 6018, Sahih Muslim 47',
    theme: 'Good Neighbourliness in Sunnyvale',
    commentary: 'Honoring and caring for neighbours across Sunnyvale Estate is a hallmark of genuine faith.'
  }
];

const AdhkarHadith: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'adhkar' | 'hadith' | 'tasbih'>('adhkar');
  const [adhkarFilter, setAdhkarFilter] = useState<'all' | 'post-prayer' | 'morning' | 'evening'>('all');
  
  // Interactive Tasbih Counters State (mapped by dhikr id)
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [selectedHadithIndex, setSelectedHadithIndex] = useState(0);
  const [isHadithDropdownOpen, setIsHadithDropdownOpen] = useState(false);
  const hadithDropdownRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hadithDropdownRef.current && !hadithDropdownRef.current.contains(event.target as Node)) {
        setIsHadithDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Standalone Digital Tasbih state
  const [standaloneCount, setStandaloneCount] = useState(0);
  const [standaloneTarget, setStandaloneTarget] = useState(33);
  const [standaloneDhikrName, setStandaloneDhikrName] = useState('SubhanAllah (سُبْحَانَ اللَّهِ)');

  const handleIncrement = (id: string, maxCount: number) => {
    setCounters(prev => {
      const current = prev[id] || 0;
      const next = current + 1;
      if (next === maxCount) {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.([50, 50, 50]);
        }
        toast.success(`Completed ${maxCount}x recitation! Alhamdu lillah.`);
      }
      return { ...prev, [id]: next };
    });
  };

  const handleReset = (id: string) => {
    setCounters(prev => ({ ...prev, [id]: 0 }));
  };

  const handleCopyDhikr = (item: DhikrItem) => {
    const text = `${item.title}\n\n${item.arabic}\n\nTransliteration: ${item.transliteration}\n\nTranslation: ${item.translation}\n\nSource: ${item.source} (Sunnyvale Masjid)`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    toast.success('Dhikr text copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyHadith = (h: HadithCollectionItem) => {
    const text = `Hadith: ${h.theme}\n\n${h.arabic}\n\n"${h.translation}"\n- ${h.narrator}, ${h.source}\n\nReflections: ${h.commentary}\n(Sunnyvale Muslim Community, Abuja)`;
    navigator.clipboard.writeText(text);
    setCopiedId(h.id);
    toast.success('Hadith copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAdhkar = adhkarFilter === 'all' 
    ? AUTHENTIC_ADHKAR 
    : AUTHENTIC_ADHKAR.filter(d => d.category === adhkarFilter);

  return (
    <div className="min-h-screen bg-[#0f1115] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Banner */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#251814] border border-[#e08a6e]/40 text-[#f5a287] text-xs font-bold uppercase tracking-widest mb-3 shadow-lg"
          >
            <Sparkles size={14} /> Sacred Remembrance & Prophetic Guidance
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Adhkar & <span className="text-[#f5a287]">Hadith Collection</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto mt-2 leading-relaxed">
            Authentic daily remembrances from Hisnul Muslim and blessed traditions of the Prophet Muhammad (ﷺ) for morning, evening, and following the obligatory solat.
          </p>
        </div>

        {/* Main Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#181b22] p-1.5 rounded-2xl border border-zinc-800 flex gap-1 shadow-xl">
            <button
              onClick={() => setActiveTab('adhkar')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'adhkar'
                  ? 'bg-[#e08a6e] text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Heart size={16} /> Daily Adhkar (الأذكار)
            </button>
            <button
              onClick={() => setActiveTab('hadith')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'hadith'
                  ? 'bg-[#e08a6e] text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen size={16} /> Hadith Library (الحديث)
            </button>
            <button
              onClick={() => setActiveTab('tasbih')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'tasbih'
                  ? 'bg-[#e08a6e] text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <RotateCcw size={16} /> Digital Tasbih Counter
            </button>
          </div>
        </div>

        {/* TAB 1: DAILY ADHKAR */}
        {activeTab === 'adhkar' && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
              {[
                { id: 'all', label: 'All Adhkar', icon: null },
                { id: 'post-prayer', label: 'Post-Prayer (بعد الصلاة)', icon: <CheckCircle2 size={13} /> },
                { id: 'morning', label: 'Morning (أذكار الصباح)', icon: <Sun size={13} /> },
                { id: 'evening', label: 'Evening (أذكار المساء)', icon: <Moon size={13} /> },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAdhkarFilter(f.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    adhkarFilter === f.id
                      ? 'bg-[#251814] text-[#f5a287] border border-[#e08a6e]/50 shadow-sm'
                      : 'bg-[#181b22] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {f.icon}
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            {/* Dhikr Cards List */}
            <div className="grid grid-cols-1 gap-5">
              {filteredAdhkar.map((item) => {
                const currentCount = counters[item.id] || 0;
                const isComplete = currentCount >= item.count;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-[#181b22] rounded-3xl p-6 sm:p-7 border transition-all ${
                      isComplete 
                        ? 'border-emerald-500/40 bg-gradient-to-br from-[#181b22] to-emerald-950/20' 
                        : 'border-zinc-800 hover:border-[#e08a6e]/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-zinc-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#251814] text-[#f5a287] border border-[#e08a6e]/30">
                          {item.category.replace('-', ' ')}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyDhikr(item)}
                          className="p-2 bg-[#121419] hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-750 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                          title="Copy Dhikr"
                        >
                          {copiedId === item.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span className="hidden sm:inline">Copy</span>
                        </button>
                        
                        <button
                          onClick={() => handleReset(item.id)}
                          className="p-2 bg-[#121419] hover:bg-zinc-800 text-zinc-400 hover:text-red-300 rounded-xl border border-zinc-750 transition-colors text-xs"
                          title="Reset count"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <div 
                      dir="rtl" 
                      className="text-2xl sm:text-3xl text-right font-serif text-[#fbdcd3] leading-[2.2] py-2 tracking-wide select-text"
                    >
                      {item.arabic}
                    </div>

                    {/* Transliteration */}
                    <div className="mt-3 text-xs sm:text-sm text-zinc-400 italic">
                      "{item.transliteration}"
                    </div>

                    {/* Translation */}
                    <div className="mt-2 text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                      {item.translation}
                    </div>

                    {/* Virtue & Source */}
                    {item.virtue && (
                      <div className="mt-4 p-3 bg-[#121419] rounded-2xl border border-zinc-800/80 text-[11px] sm:text-xs text-zinc-300 flex items-start gap-2">
                        <Sparkles size={14} className="text-[#e08a6e] shrink-0 mt-0.5" />
                        <div>
                          <strong>Virtue:</strong> {item.virtue}
                          <span className="block text-zinc-500 font-mono mt-0.5">{item.source}</span>
                        </div>
                      </div>
                    )}

                    {/* Interactive Count Bar & Tap Button */}
                    <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex-1 sm:w-48 bg-zinc-900 rounded-full h-3 overflow-hidden border border-zinc-700">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isComplete ? 'bg-emerald-400' : 'bg-[#e08a6e]'
                            }`}
                            style={{ width: `${Math.min(100, (currentCount / item.count) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-xs font-bold text-white">
                          {currentCount} / {item.count}
                        </span>
                      </div>

                      <button
                        onClick={() => handleIncrement(item.id, item.count)}
                        className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isComplete
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-900/30'
                            : 'bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 shadow-[#e08a6e]/20'
                        }`}
                      >
                        {isComplete ? (
                          <>
                            <CheckCircle2 size={16} /> Completed ({item.count}x)
                          </>
                        ) : (
                          <>
                            <span>Tap to Count +1</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: HADITH LIBRARY */}
        {activeTab === 'hadith' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Dropdown Selector for Prophetic Narrations */}
            <div className="bg-[#181b22] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-xl relative" ref={hadithDropdownRef}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-[#e08a6e]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#f5a287]">
                    Selected Prophetic Narrations
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    ({selectedHadithIndex + 1} of {EXPANDED_HADITH_LIBRARY.length})
                  </span>
                </div>

                {/* Quick Prev / Next cycle buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHadithIndex((prev) => (prev - 1 + EXPANDED_HADITH_LIBRARY.length) % EXPANDED_HADITH_LIBRARY.length);
                      setIsHadithDropdownOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-[#121419] hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-750 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Previous Narration"
                  >
                    <ChevronLeft size={14} />
                    <span className="hidden sm:inline">Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHadithIndex((prev) => (prev + 1) % EXPANDED_HADITH_LIBRARY.length);
                      setIsHadithDropdownOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-[#121419] hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-750 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Next Narration"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Dropdown Menu Trigger Button */}
              <div className="relative">
                <button
                  type="button"
                  id="prophetic-narrations-select"
                  onClick={() => setIsHadithDropdownOpen(!isHadithDropdownOpen)}
                  className="w-full text-left bg-[#121419] hover:bg-[#161922] text-zinc-100 p-3.5 sm:p-4 rounded-xl border border-zinc-750 hover:border-[#e08a6e]/60 transition-all flex items-center justify-between gap-3 shadow-inner cursor-pointer"
                  aria-haspopup="listbox"
                  aria-expanded={isHadithDropdownOpen}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        #{selectedHadithIndex + 1}. {EXPANDED_HADITH_LIBRARY[selectedHadithIndex].theme}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#251814] text-[#f5a287] border border-[#e08a6e]/30 shrink-0">
                        {EXPANDED_HADITH_LIBRARY[selectedHadithIndex].source}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate italic">
                      "{EXPANDED_HADITH_LIBRARY[selectedHadithIndex].translation}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <span className="text-xs text-[#f5a287] font-semibold hidden sm:inline">Select Narration</span>
                    <div className={`p-1.5 rounded-lg bg-zinc-800 text-[#f5a287] transition-transform duration-200 ${isHadithDropdownOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </button>

                {/* Dropdown Options List */}
                <AnimatePresence>
                  {isHadithDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.99 }}
                      transition={{ duration: 0.15 }}
                      role="listbox"
                      className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#181b22] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden max-h-[360px] overflow-y-auto no-scrollbar divide-y divide-zinc-800"
                    >
                      {EXPANDED_HADITH_LIBRARY.map((h, idx) => {
                        const isSelected = selectedHadithIndex === idx;
                        return (
                          <button
                            key={h.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedHadithIndex(idx);
                              setIsHadithDropdownOpen(false);
                            }}
                            className={`w-full text-left p-3.5 sm:p-4 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-[#251814] text-white'
                                : 'hover:bg-[#1e222b] text-zinc-300'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold ${isSelected ? 'text-[#f5a287]' : 'text-zinc-200'}`}>
                                  #{idx + 1}. {h.theme}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {h.source}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 line-clamp-1">
                                "{h.translation}"
                              </p>
                              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                                {h.narrator}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-[#e08a6e] text-zinc-950 flex items-center justify-center shrink-0">
                                <Check size={14} className="stroke-[3]" />
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

            {/* Main Hadith Display Panel */}
            <div className="w-full">
              {(() => {
                const h = EXPANDED_HADITH_LIBRARY[selectedHadithIndex];
                return (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#181b22] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
                      <div>
                        <span className="text-xs uppercase font-bold tracking-widest text-[#f5a287] bg-[#251814] px-3 py-1 rounded-full border border-[#e08a6e]/30">
                          {h.theme}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                          Daily Hadith Reflection
                        </h2>
                      </div>

                      <button
                        onClick={() => handleCopyHadith(h)}
                        className="p-2.5 bg-[#121419] hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-750 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedId === h.id ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                        <span>Share Hadith</span>
                      </button>
                    </div>

                    {/* Arabic Calligraphy */}
                    <div
                      dir="rtl"
                      className="text-2xl sm:text-3xl text-right font-serif text-[#fbdcd3] leading-[2.3] py-4 select-text"
                    >
                      {h.arabic}
                    </div>

                    {/* English Translation */}
                    <blockquote className="my-4 p-4 bg-[#121419] rounded-2xl border-l-4 border-[#e08a6e] text-sm sm:text-base text-zinc-100 italic leading-relaxed">
                      "{h.translation}"
                    </blockquote>

                    {/* Narrator & Source */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 py-2 border-b border-zinc-800">
                      <span><strong>Narrator:</strong> {h.narrator}</span>
                      <span className="font-mono text-[#f5a287]">{h.source}</span>
                    </div>

                    {/* Commentary & Sunnyvale Community Application */}
                    <div className="mt-5 p-4 bg-[#14161c] rounded-2xl border border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-2">
                      <h4 className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles size={16} className="text-[#e08a6e]" /> Community Lessons & Application
                      </h4>
                      <p>{h.commentary}</p>
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: STANDALONE DIGITAL TASBIH COUNTER */}
        {activeTab === 'tasbih' && (
          <div className="max-w-md mx-auto">
            <div className="bg-[#181b22] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl text-center">
              <span className="text-xs uppercase font-bold tracking-widest text-[#f5a287] bg-[#251814] px-3 py-1 rounded-full border border-[#e08a6e]/30">
                Interactive Electronic Tasbih
              </span>
              
              {/* Dhikr Target Selector */}
              <div className="mt-4 mb-6">
                <label className="block text-xs text-zinc-400 mb-2">Select Dhikr Formula:</label>
                <select
                  value={standaloneDhikrName}
                  onChange={(e) => {
                    setStandaloneDhikrName(e.target.value);
                    setStandaloneCount(0);
                  }}
                  className="w-full bg-[#121419] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#e08a6e]"
                >
                  <option value="SubhanAllah (سُبْحَانَ اللَّهِ)">SubhanAllah (33 times)</option>
                  <option value="Alhamdulillah (الْحَمْدُ لِلَّهِ)">Alhamdulillah (33 times)</option>
                  <option value="Allahu Akbar (اللَّهُ أَكْبَرُ)">Allahu Akbar (33 times)</option>
                  <option value="Astaghfirullah (أَسْتَغْفِرُ اللَّهَ)">Astaghfirullah (100 times)</option>
                  <option value="La ilaha illallah (لَا إِلَهَ إِلَّا اللَّهُ)">La ilaha illallah (100 times)</option>
                  <option value="Salawat upon Prophet (ﷺ)">Salawat upon Prophet (ﷺ) (100 times)</option>
                </select>

                <div className="flex justify-center gap-2 mt-3">
                  {[33, 99, 100].map(target => (
                    <button
                      key={target}
                      onClick={() => {
                        setStandaloneTarget(target);
                        setStandaloneCount(0);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                        standaloneTarget === target
                          ? 'bg-[#e08a6e] text-zinc-950'
                          : 'bg-[#121419] text-zinc-400 border border-zinc-750'
                      }`}
                    >
                      Goal: {target}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Tap Button */}
              <div className="my-8 flex justify-center">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    setStandaloneCount(c => c + 1);
                    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                      navigator.vibrate?.(30);
                    }
                  }}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-[#2a1a15] to-[#1a1310] border-4 border-[#e08a6e] shadow-2xl shadow-[#e08a6e]/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#f5a287] transition-all group"
                >
                  <span className="text-4xl sm:text-5xl font-mono font-black text-white group-hover:scale-105 transition-transform">
                    {standaloneCount}
                  </span>
                  <span className="text-xs uppercase font-bold text-[#f5a287] tracking-widest mt-2">
                    Target: {standaloneTarget}
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-1">Tap Anywhere</span>
                </motion.button>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setStandaloneCount(0)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#121419] hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold border border-zinc-700 cursor-pointer"
                >
                  <RotateCcw size={14} /> Reset Counter
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdhkarHadith;
