import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { MOSQUE_EMAIL } from './constants';

interface AskImamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AskImamModal: React.FC<AskImamModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [subject, setSubject] = useState('Religious / Fatawa Question');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
        userId: user?.uid || null,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Dispatch notification to Sunnyvaleabujamasjid@gmail.com
      try {
        const formData = new FormData();
        formData.append('Subject', `[Ask Imam Inquiry] ${subject.trim()}`);
        formData.append('Name', name.trim());
        formData.append('Email', email.trim());
        formData.append('Phone', phone.trim() || 'N/A');
        formData.append('Topic', subject.trim());
        formData.append('Question / Message', message.trim());
        formData.append('_subject', `New Inquiry from ${name.trim()}: ${subject.trim()}`);
        formData.append('_captcha', 'false');
        formData.append('_cc', 'rave.devv@gmail.com');
        if (email.trim()) {
          formData.append('_replyto', email.trim());
        }

        await fetch(`https://formsubmit.co/ajax/${MOSQUE_EMAIL.toLowerCase()}`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
      } catch (eErr) {
        console.warn('Inquiry notification note:', eErr);
      }

      setSubmitted(true);
      toast.success('Your inquiry has been submitted to the Imam.');
    } catch (err: any) {
      console.error('Error submitting inquiry:', err);
      toast.error('Could not submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#181b22] text-zinc-100 max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-xl bg-[#121419] border border-zinc-700 transition-colors"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 bg-zinc-800 text-zinc-200 rounded-full flex items-center justify-center mx-auto border border-zinc-750">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="text-xl font-bold text-white">Inquiry Received</h3>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
              Jazakallahu Khayran. Your question has been forwarded to the Imam and Sunnyvale Masjid Secretariat. We will respond to <strong>{email}</strong>.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setMessage('');
                onClose();
              }}
              className="px-6 py-2.5 bg-zinc-200 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold transition-all shadow"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest mb-1">
              <MessageSquare size={16} /> Confidential Inquiry
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Ask the Imam / Committee</h2>
            <p className="text-xs text-zinc-400 mb-5">
              Submit your religious queries, marriage counseling requests, or community questions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Brother Yusuf"
                    className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="080 1234 5678"
                    className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Email Address (For reply) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Inquiry Topic</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 cursor-pointer"
                >
                  <option value="Religious / Fatawa Question">Religious / Fatawa Question</option>
                  <option value="Marriage / Nikah Inquiry">Marriage / Nikah Inquiry</option>
                  <option value="Community Welfare / Sadaqah">Community Welfare / Sadaqah</option>
                  <option value="Sunnyvale Estate Solat / Facility">Sunnyvale Estate Solat / Facility</option>
                  <option value="Other Inquiries">Other Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Your Question or Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full p-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white outline-none focus:border-zinc-400 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <ShieldCheck size={14} className="text-zinc-400" />
                  <span>Confidential to Mosque Leadership</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-zinc-200 hover:bg-white text-zinc-950 font-bold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send size={13} /> {isSubmitting ? 'Submitting...' : 'Send Inquiry'}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export { AskImamModal };
export default AskImamModal;
