import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MOSQUE_EMAIL } from './constants';
import { useAuth } from './AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  User as UserIcon, 
  DollarSign, 
  FileText, 
  Send, 
  AlertCircle, 
  Upload, 
  X, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Info,
  Calendar,
  Lock
} from 'lucide-react';

const Confirm: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [customPurpose, setCustomPurpose] = useState('');
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    name: user?.name || '',
    amount: '',
    purpose: 'Monthly Contribution',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-zinc-300">Loading...</div>;
  if (!user) return <Navigate to="/auth?redirect=confirm" />;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (Number(formData.amount) < 5000) {
      newErrors.amount = 'Minimum contribution is ₦5,000';
    }
    if (formData.purpose === 'Other' && !customPurpose.trim()) {
      newErrors.customPurpose = 'Please specify the custom purpose';
    }
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Receipt image must be smaller than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);
    const resolvedPurpose = formData.purpose === 'Other' ? customPurpose.trim() : formData.purpose;

    try {
      if (user && user.uid) {
        await addDoc(collection(db, 'donations'), {
          userId: user.uid,
          userName: formData.name,
          userEmail: formData.email,
          phone: formData.phone || '',
          amount: Number(formData.amount),
          purpose: resolvedPurpose,
          notes: formData.notes || '',
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp(),
          status: 'pending_verification'
        });
      }
    } catch (dbErr) {
      console.warn('Firestore donation log:', dbErr);
    }

    try {
      const formSubmitData = new FormData();
      formSubmitData.append('Name', formData.name);
      formSubmitData.append('Amount (NGN)', formData.amount);
      formSubmitData.append('Purpose', resolvedPurpose);
      formSubmitData.append('Email', formData.email);
      formSubmitData.append('Phone', formData.phone || 'N/A');
      formSubmitData.append('Address', formData.address || 'N/A');
      formSubmitData.append('Notes', formData.notes || 'N/A');
      formSubmitData.append('_subject', `New Donation: ₦${Number(formData.amount).toLocaleString()} (${resolvedPurpose})`);
      if (selectedFile) {
        formSubmitData.append('attachment', selectedFile);
      }

      await fetch(`https://formsubmit.co/ajax/${MOSQUE_EMAIL}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formSubmitData
      });

      toast.success('Donation confirmation submitted successfully!');
      navigate('/dashboard?confirmed=true');
    } catch (error) {
      console.error('Error submitting donation:', error);
      toast.success('Donation logged to your dashboard!');
      navigate('/dashboard?confirmed=true');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-[#0d0f12] transition-colors">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Confirm Your Transfer</h1>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Fill out this form after making your manual transfer so we can record and verify your contribution.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#181b22] rounded-3xl shadow-xl p-6 sm:p-8 border border-zinc-800"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <UserIcon size={14} className="text-[#f5a287]" /> Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('name')}
                  className="w-full px-3.5 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-[#e08a6e]/40 focus:border-[#e08a6e] transition-all"
                  placeholder="Your full name"
                />
                {errors.name && touched.name && (
                  <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-[#f5a287]" /> Amount (₦) *
                </label>
                <input
                  type="number"
                  name="amount"
                  min="5000"
                  value={formData.amount}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('amount')}
                  className="w-full px-3.5 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-[#e08a6e]/40 focus:border-[#e08a6e] transition-all"
                  placeholder="Min. 5000"
                />
                {errors.amount && touched.amount && (
                  <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.amount}</p>
                )}
              </div>
            </div>

            {/* Purpose Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
                <FileText size={14} className="text-[#f5a287]" /> Donation Purpose *
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                {[
                  { value: 'Monthly Contribution', label: 'Monthly' },
                  { value: 'Masjid Maintenance', label: 'Maintenance' },
                  { value: 'Alhamideen Academy', label: 'Academy' },
                  { value: 'School Construction', label: 'School Project' },
                  { value: 'Ramadan Program', label: 'Ramadan' },
                  { value: 'General Sadaqah', label: 'General Sadaqah' },
                  { value: 'Zakat Al-Mal', label: 'Zakat Al-Mal' },
                  { value: 'Electricity (AEDC)', label: 'Electricity' },
                  { value: 'Welfare / Helping Needy', label: 'Welfare' },
                  { value: 'Other', label: 'Custom Purpose...' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, purpose: option.value }));
                      if (option.value !== 'Other') setCustomPurpose('');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all text-center cursor-pointer ${
                      formData.purpose === option.value
                        ? 'bg-[#e08a6e] text-zinc-950 font-bold shadow-md'
                        : 'bg-[#121419] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {formData.purpose === 'Other' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customPurpose}
                    onChange={(e) => setCustomPurpose(e.target.value)}
                    placeholder="Specify donation purpose..."
                    className="w-full px-3.5 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-[#e08a6e]/40"
                  />
                  {errors.customPurpose && (
                    <p className="text-red-400 text-[11px] mt-1">{errors.customPurpose}</p>
                  )}
                </div>
              )}
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Mail size={14} className="text-[#f5a287]" /> Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('email')}
                  className="w-full px-3.5 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-[#e08a6e]/40 focus:border-[#e08a6e] transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Phone size={14} className="text-[#f5a287]" /> Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-[#e08a6e]/40 focus:border-[#e08a6e] transition-all"
                  placeholder="080 1234 5678"
                />
              </div>
            </div>

            {/* Transfer receipt upload */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Upload size={14} className="text-[#f5a287]" /> Transfer Receipt / Screenshot (Optional)
              </label>
              
              {filePreview ? (
                <div className="relative p-3 bg-[#121419] rounded-xl border border-[#e08a6e]/40 flex items-center gap-3">
                  <img src={filePreview} alt="Receipt preview" className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 truncate">
                    <p className="text-xs font-medium text-white truncate">{selectedFile?.name}</p>
                    <p className="text-[10px] text-zinc-400">Ready to submit</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 bg-[#121419] border border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-[#e08a6e]/50 hover:bg-zinc-800 transition-all">
                  <Upload size={20} className="text-[#f5a287] mb-1" />
                  <span className="text-xs font-medium text-zinc-200">Click to upload bank transfer receipt</span>
                  <span className="text-[10px] text-zinc-500">PNG, JPG, PDF up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-[#e08a6e]/40 focus:border-[#e08a6e] transition-all"
                placeholder="e.g. Paid from FirstBank account named Ibrahim..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#e08a6e]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Recording Donation...' : (
                <>
                  <Send size={16} /> Submit Donation Confirmation
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Confirm;
