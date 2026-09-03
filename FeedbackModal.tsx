import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquarePlus, X, Send, CheckCircle2, ShieldCheck, User, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { MOSQUE_EMAIL } from './constants';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEEDBACK_CATEGORIES = [
  { id: 'facilities', label: 'Mosque Facilities & Maintenance', icon: '🕌' },
  { id: 'prayers', label: 'Prayer & Tarawih Arrangements', icon: '🤲' },
  { id: 'youth', label: 'Youth, Sisters & Islamic Academy', icon: '📖' },
  { id: 'welfare', label: 'Community Welfare & Da’wah Outreach', icon: '🤝' },
  { id: 'ramadan', label: 'Ramadan, Iftar & Special Events', icon: '🌙' },
  { id: 'general', label: 'General Masjid Suggestion', icon: '💡' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState('facilities');
  const [title, setTitle] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !suggestion.trim()) {
      toast.error('Please provide a title and your suggestion details.');
      return;
    }

    setIsSubmitting(true);
    const categoryObj = FEEDBACK_CATEGORIES.find(c => c.id === category);
    const categoryLabel = categoryObj ? categoryObj.label : category;

    try {
      // 1. Store in Firestore collection 'feedback'
      await addDoc(collection(db, 'feedback'), {
        title: title.trim(),
        suggestion: suggestion.trim(),
        category: category,
        categoryLabel: categoryLabel,
        isAnonymous: isAnonymous,
        name: isAnonymous ? 'Anonymous Community Member' : (name.trim() || user?.name || 'Community Member'),
        email: isAnonymous ? '' : (email.trim() || user?.email || ''),
        phone: isAnonymous ? '' : (phone.trim() || user?.phone || ''),
        userId: isAnonymous ? null : (user?.uid || null),
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // 2. Dispatch an email notification to Sunnyvaleabujamasjid@gmail.com
      try {
        const formData = new FormData();
        formData.append('Subject', `[Masjid Suggestion] ${title.trim()} (${categoryLabel})`);
        formData.append('Category', categoryLabel);
        formData.append('Suggestion Title', title.trim());
        formData.append('Suggestion Details', suggestion.trim());
        formData.append('Submitted By', isAnonymous ? 'Anonymous Member' : (name.trim() || user?.name || 'Member'));
        formData.append('Contact Email', isAnonymous ? 'Anonymous' : (email.trim() || user?.email || 'N/A'));
        formData.append('Contact Phone', isAnonymous ? 'Anonymous' : (phone.trim() || user?.phone || 'N/A'));
        formData.append('_subject', `New Suggestion: ${title.trim()}`);
        formData.append('_captcha', 'false');
        formData.append('_cc', 'rave.devv@gmail.com');
        if (!isAnonymous && email.trim()) {
          formData.append('_replyto', email.trim());
        }

        await fetch(`https://formsubmit.co/ajax/${MOSQUE_EMAIL.toLowerCase()}`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
      } catch (emailErr) {
        console.warn('FormSubmit notification note:', emailErr);
      }

      setSubmitted(true);
      toast.success('Your suggestion has been submitted to the Mosque EXCO Committee.');
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      toast.error('Could not submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setTitle('');
    setSuggestion('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#181b22] text-zinc-100 max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-[#121419] border border-zinc-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-zinc-800 text-zinc-200 rounded-full flex items-center justify-center mx-auto border border-zinc-700">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold text-white">Jazakumullahu Khairan!</h3>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
              Your suggestion has been securely recorded and sent to the <strong>Sunnyvale Masjid EXCO Administration</strong> at <em>{MOSQUE_EMAIL}</em>.
            </p>
            <div className="p-4 bg-[#121419] border border-zinc-800 rounded-2xl max-w-sm mx-auto text-xs text-zinc-400">
              <p>The Executive Committee reviews suggestions weekly to continuously enhance our Masjid facilities, programs, and community welfare.</p>
            </div>
            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 bg-zinc-200 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest mb-1.5">
              <Sparkles size={16} /> Community Voice & Shura
            </div>
            <h2 className="text-2xl font-bold text-white mb-1.5 flex items-center gap-2">
              <MessageSquarePlus className="text-zinc-300" size={24} />
              Suggestion Box
            </h2>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Have an idea to improve our Mosque facilities, educational programs, or community welfare? Share your thoughts directly with the Sunnyvale Masjid Administration.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category Selector */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-2">Select Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        category === cat.id
                          ? 'bg-zinc-800 border-zinc-500 text-white shadow-sm'
                          : 'bg-[#121419] border-zinc-800 text-zinc-400 hover:bg-zinc-800/60'
                      }`}
                    >
                      <span className="text-base mb-1">{cat.icon}</span>
                      <span className="text-[11px] font-semibold leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Idea / Suggestion Title <span className="text-zinc-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar inverter upgrade for daytime Quran classes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 text-xs transition-colors"
                />
              </div>

              {/* Detailed Suggestion */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Detailed Suggestion & Recommendations <span className="text-zinc-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your idea, what benefits it brings to our Jama'ah, and any practical steps you recommend..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="w-full p-3 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 text-xs transition-colors"
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="p-3 bg-[#121419] rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">Submit Anonymously</span>
                  <span className="text-[11px] text-zinc-400">Your personal details will not be attached to this submission.</span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-300 bg-[#181b22] border-zinc-700 focus:ring-zinc-400 cursor-pointer"
                />
              </div>

              {/* Contact info if not anonymous */}
              {!isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Your Email</label>
                    <input
                      type="email"
                      placeholder="Email for follow-up"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-zinc-200 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <Send size={15} />
                  {isSubmitting ? 'Submitting to Mosque Committee...' : 'Submit Suggestion to EXCO'}
                </button>
                <p className="text-[10px] text-center text-zinc-400 mt-2">
                  All submissions are delivered directly to {MOSQUE_EMAIL} and archived for EXCO review.
                </p>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default FeedbackModal;
