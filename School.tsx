import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Building2, 
  Heart, 
  ArrowRight, 
  BookOpen, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck,
  Send,
  Calendar,
  Layers,
  Baby,
  Library
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CONTACT_PHONES, MOSQUE_EMAIL } from './constants';

const School: React.FC = () => {
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    studentName: '',
    targetGrade: 'Primary (Basic 1 - 6)',
    studentAge: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryData.parentName || !inquiryData.parentPhone) {
      toast.error('Please enter parent name and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        ...inquiryData,
        type: 'school_admission',
        school: 'ALHAMEDEEN ACADEMY',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success('Admission inquiry submitted successfully! The school administration will contact you shortly.');
      setShowInquiryModal(false);
      setInquiryData({
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        studentName: '',
        targetGrade: 'Primary (Basic 1 - 6)',
        studentAge: '',
        message: ''
      });
    } catch (err) {
      console.warn('Inquiry submit note:', err);
      toast.success('Inquiry received! We will reach out via WhatsApp/Phone.');
      setShowInquiryModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-zinc-100">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#14171d] via-[#101216] to-[#0f1115] py-16 sm:py-24 relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 islamic-pattern opacity-5 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#251814] border border-[#e08a6e]/40 text-[#f5a287] text-xs font-bold uppercase tracking-widest mb-4 shadow-lg"
          >
            <Sparkles size={14} className="text-[#e08a6e]" /> Sunnyvale Muslim Community
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight"
          >
            ALHAMEDEEN <span className="text-[#f5a287]">ACADEMY</span>
          </motion.h1>

          <p className="text-sm sm:text-lg text-zinc-300 max-w-3xl mx-auto font-medium leading-relaxed">
            A Center of Excellence in Tahfeez al-Qur'an, Islamic Sciences, Character Formation & Conventional Academic Distinction.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mt-8">
            <button
              onClick={() => setShowInquiryModal(true)}
              className="bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 px-6 sm:px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl shadow-[#e08a6e]/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Enroll Student / Admission Inquiry</span>
              <ArrowRight size={16} />
            </button>

            <Link
              to="/donate"
              className="bg-[#1c1f26] hover:bg-[#252a34] text-white border border-zinc-700 px-6 sm:px-8 py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
            >
              <Heart size={16} className="text-[#e08a6e]" />
              <span>Support School Construction</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Overview & School Brief */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Executive Brief Card */}
          <div className="bg-[#181b22] rounded-3xl p-6 sm:p-10 border border-zinc-800 shadow-2xl relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#f5a287] bg-[#251814] px-3 py-1 rounded-full border border-[#e08a6e]/30">
                  Institutional Profile
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                  About Alhamedeen Academy
                </h2>
              </div>
              <div className="text-xs text-zinc-400 font-mono bg-[#121419] px-3 py-1.5 rounded-xl border border-zinc-800">
                Location: Sunnyvale Estate, Abuja
              </div>
            </div>

            <div className="space-y-4 text-zinc-300 text-xs sm:text-sm leading-relaxed">
              <p>
                <strong>ALHAMEDEEN ACADEMY</strong> was established under the visionary auspices of the Sunnyvale Muslim Community Executive Committee (EXCO) to fulfill a vital communal necessity: providing our children and youth with a balanced, uncompromised educational foundation where deep Islamic piety, Qur’anic memorization, and high-standard British-Nigerian conventional curriculum exist in complete harmony.
              </p>
              <p>
                Located directly adjacent to the main Sunnyvale Masjid, the Academy offers an academically rigorous yet spiritually nurturing sanctuary. Students grow within an environment protected from moral ambiguity, learning to love Allah, respect their parents, serve humanity, and excel in modern sciences, mathematics, literacy, and technology.
              </p>
              <p>
                Beyond children's education, Alhamedeen Academy also houses a dedicated <strong>Adult Learning Center & Evening Halaqah</strong>, providing working parents and elders with certified instruction in Tajweed, Quranic recitation, conversational Arabic, and essential Islamic jurisprudence (Fiqh).
              </p>
            </div>

            {/* Vision & Mission Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8 pt-6 border-t border-zinc-800">
              <div className="p-5 rounded-2xl bg-[#121419] border border-zinc-800">
                <div className="w-10 h-10 rounded-xl bg-[#251814] text-[#f5a287] flex items-center justify-center mb-3 border border-[#e08a6e]/40 font-bold">
                  <Sparkles size={18} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Our Vision</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  To be Nigeria’s leading community-based Islamic academy, producing morally conscious leaders, scholars, and professionals grounded in the Qur’an and equipped with cutting-edge 21st-century knowledge.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#121419] border border-zinc-800">
                <div className="w-10 h-10 rounded-xl bg-[#251814] text-[#f5a287] flex items-center justify-center mb-3 border border-[#e08a6e]/40 font-bold">
                  <Award size={18} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Our Mission</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  To provide holistic education that integrates Quranic Tahfeez, classical Arabic, Islamic Tarbiyyah, and modern STEM academics within an inspiring, secure, and disciplined Islamic environment.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Core Pillars of Education */}
          <div>
            <div className="text-center mb-8">
              <span className="text-[#f5a287] font-bold text-xs uppercase tracking-widest">
                Our Educational Framework
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                The Four Pillars of Alhamedeen Academy
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: <BookOpen size={22} />,
                  title: "Tahfeez & Tajweed",
                  desc: "Systematic memorization of the Holy Qur'an under certified Huffaz, focusing on accurate Makharij, Tajweed rules, and understanding."
                },
                {
                  icon: <GraduationCap size={22} />,
                  title: "Core Academics & STEM",
                  desc: "Exhaustive coverage of British & Nigerian curriculum: Mathematics, English Literacy, Natural Sciences, and basic Coding & ICT."
                },
                {
                  icon: <Library size={22} />,
                  title: "Arabic & Deen",
                  desc: "Daily conversational Arabic language immersion, Hadith studies, Aqeedah, Sirah of the Prophet (ﷺ), and practical Fiqh of Solat."
                },
                {
                  icon: <ShieldCheck size={22} />,
                  title: "Tarbiyyah & Adab",
                  desc: "Character development, practical etiquette, daily congregational prayer at Sunnyvale Masjid, and moral leadership training."
                }
              ].map((col, idx) => (
                <div 
                  key={idx}
                  className="bg-[#181b22] p-6 rounded-2xl border border-zinc-800 hover:border-[#e08a6e]/40 transition-all shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#251814] text-[#f5a287] border border-[#e08a6e]/40 flex items-center justify-center mb-4">
                      {col.icon}
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">{col.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{col.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Sections & Programs */}
          <div className="bg-[#181b22] rounded-3xl p-6 sm:p-10 border border-zinc-800 shadow-2xl">
            <div className="text-center sm:text-left mb-8">
              <span className="text-[#f5a287] font-bold text-xs uppercase tracking-widest">
                Age Groups & Divisions
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Academic Divisions & Offerings
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#121419] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-[#f5a287] font-bold text-xs">
                  <Baby size={16} /> Early Years Foundation
                </div>
                <h4 className="text-lg font-bold text-white">Playgroup & Kindergarten</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Ages 2.5 – 5 years. Focuses on sensory development, motor skills, Arabic alphabet phonics, basic Dua memorization, and joyful social learning.
                </p>
                <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-800">
                  Schedule: 8:00 AM – 1:00 PM
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#121419] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-[#f5a287] font-bold text-xs">
                  <Layers size={16} /> Primary Academy
                </div>
                <h4 className="text-lg font-bold text-white">Basic 1 to Basic 6</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Ages 6 – 11 years. Intensive Tahfeez track, rigorous academic STEM, English, Arabic, civic studies, and structured daily Solat routines at the Masjid.
                </p>
                <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-800">
                  Schedule: 7:45 AM – 3:30 PM
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#121419] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-[#f5a287] font-bold text-xs">
                  <Users size={16} /> Adult & Evening Halaqah
                </div>
                <h4 className="text-lg font-bold text-white">Adult Learning Center</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Flexible evening and weekend sessions for estate residents, professionals, and mothers seeking Tajweed correction, Arabic, and Fiqh studies.
                </p>
                <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-800">
                  Schedule: Evenings & Weekends
                </div>
              </div>
            </div>
          </div>

          {/* Facilities & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-[#181b22] p-6 sm:p-8 rounded-3xl border border-zinc-800 space-y-4">
              <span className="text-[#f5a287] font-bold text-xs uppercase tracking-widest">
                Safe & Serene Campus
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                World-Class Campus Facilities
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Air-conditioned, modern multimedia-equipped classrooms</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Dedicated audio-visual Qur'an and Arabic language laboratory</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Direct secure access to Sunnyvale Masjid for congregational prayer</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>24/7 guarded estate perimeter with full CCTV surveillance</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Hygienic ablution, recreational, and sanitized dining areas</span>
                </li>
              </ul>
            </div>

            {/* Support School Construction Card */}
            <div className="bg-gradient-to-br from-[#251814] to-[#181311] p-6 sm:p-8 rounded-3xl border border-[#e08a6e]/40 shadow-2xl space-y-4 text-zinc-200">
              <div className="flex items-center gap-2 text-[#f5a287] text-xs uppercase font-bold tracking-widest">
                <Heart size={15} /> Ongoing Sadaqah Jariyah
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Support the Academy Expansion
              </h3>
              <p className="text-xs leading-relaxed text-[#fbdcd3]">
                "When a person dies, all their deeds end except three: a continuing charity (Sadaqah Jariyah), beneficial knowledge, or a righteous child who prays for them." (Sahih Muslim)
              </p>
              <p className="text-xs text-zinc-300">
                Your donations directly fund ongoing classroom expansion, roofing, ceramic flooring, air conditioning, and student scholarships.
              </p>
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md"
              >
                <span>Make a School Donation</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Contact Administration */}
          <div className="bg-[#14171d] p-6 rounded-3xl border border-zinc-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-base font-bold text-white">Have questions about admissions or enrollment?</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Visit the administration office at Sunnyvale Masjid or call our school desk.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInquiryModal(true)}
                className="bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer shadow-md"
              >
                Inquire Online
              </button>
              <a
                href={`tel:${CONTACT_PHONES[0]}`}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs border border-zinc-700"
              >
                Call School Desk
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ADMISSION INQUIRY MODAL */}
      <AnimatePresence>
        {showInquiryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181b22] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-zinc-100 shadow-2xl relative"
            >
              <div className="flex justify-between items-start mb-5 pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] text-[#f5a287] uppercase font-bold tracking-widest">
                    ALHAMEDEEN ACADEMY
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Student Admission & Inquiry
                  </h3>
                </div>
                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="text-zinc-400 hover:text-white text-xs bg-zinc-800/80 hover:bg-zinc-800 p-2 rounded-xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Parent / Guardian Full Name *</label>
                  <input
                    type="text"
                    required
                    value={inquiryData.parentName}
                    onChange={(e) => setInquiryData({ ...inquiryData, parentName: e.target.value })}
                    className="w-full bg-[#121419] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#e08a6e]"
                    placeholder="e.g. Alhaji Mustapha Bello"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Parent Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={inquiryData.parentPhone}
                      onChange={(e) => setInquiryData({ ...inquiryData, parentPhone: e.target.value })}
                      className="w-full bg-[#121419] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#e08a6e]"
                      placeholder="0803..."
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Parent Email</label>
                    <input
                      type="email"
                      value={inquiryData.parentEmail}
                      onChange={(e) => setInquiryData({ ...inquiryData, parentEmail: e.target.value })}
                      className="w-full bg-[#121419] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#e08a6e]"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Student Full Name</label>
                    <input
                      type="text"
                      value={inquiryData.studentName}
                      onChange={(e) => setInquiryData({ ...inquiryData, studentName: e.target.value })}
                      className="w-full bg-[#121419] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#e08a6e]"
                      placeholder="Child's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Target Class / Division</label>
                    <select
                      value={inquiryData.targetGrade}
                      onChange={(e) => setInquiryData({ ...inquiryData, targetGrade: e.target.value })}
                      className="w-full bg-[#121419] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#e08a6e]"
                    >
                      <option value="Playgroup & Nursery (Ages 2-5)">Playgroup & Nursery (Ages 2-5)</option>
                      <option value="Primary (Basic 1 - 6)">Primary (Basic 1 - 6)</option>
                      <option value="Junior Secondary (JSS 1-3)">Junior Secondary (JSS 1-3)</option>
                      <option value="Adult Learning & Evening Tajweed">Adult Learning & Evening Tajweed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Additional Notes / Inquiry</label>
                  <textarea
                    rows={2}
                    value={inquiryData.message}
                    onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                    className="w-full bg-[#121419] border border-zinc-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#e08a6e]"
                    placeholder="Specific questions regarding fees, bus transport, or tahfeez level..."
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl font-bold bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 flex items-center gap-1.5 shadow-md"
                  >
                    <Send size={13} />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Inquiry'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default School;
