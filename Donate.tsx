import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  BANK_DETAILS, 
  DONATION_PURPOSES, 
  PRESET_AMOUNTS 
} from './constants';
import { 
  Zap, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  History, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Building2,
  HeartHandshake,
  Calculator,
  FileCheck
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { db } from './firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import ZakatCalculator from './ZakatCalculator';

const Donate: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab State: 'bank' (manual transfer & bank details) vs 'zakat' (calculator)
  const [activeTab, setActiveTab] = useState<'bank' | 'zakat'>('bank');

  // Interactive selected bank helper
  const [selectedPurpose, setSelectedPurpose] = useState<string>('Monthly Contribution');
  const [selectedAmount, setSelectedAmount] = useState<number>(10000);

  // UI helpers
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [hasDonated, setHasDonated] = useState<boolean>(false);

  // Parse URL search params (e.g. ?tab=zakat or ?purpose=zakat)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const purposeParam = params.get('purpose');
    const amountParam = params.get('amount');

    if (tabParam === 'zakat') {
      setActiveTab('zakat');
    } else if (tabParam === 'bank') {
      setActiveTab('bank');
    }

    if (purposeParam) {
      if (purposeParam.toLowerCase().includes('zakat')) {
        setSelectedPurpose('Zakat Al-Maal');
      }
    }

    if (amountParam && Number(amountParam) > 0) {
      setSelectedAmount(Number(amountParam));
    }
  }, [location.search]);

  // Check if donor has prior donations
  useEffect(() => {
    async function checkHistory() {
      if (user && user.uid) {
        try {
          const q = query(collection(db, 'donations'), where('userId', '==', user.uid), limit(1));
          const snapshot = await getDocs(q);
          setHasDonated(!snapshot.empty);
        } catch (err) {
          console.warn('Check history error:', err);
        }
      }
    }
    checkHistory();
  }, [user]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-400">Loading...</div>;
  }
  if (!user) return <Navigate to="/auth?redirect=donate" />;

  const copyToClipboard = (text: string, index: number, bankName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    const label = bankName.toLowerCase().includes('aedc') ? 'meter number' : 'account number';
    toast.success(`${bankName} ${label} copied to clipboard!`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-[#0d0f12] text-white transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2a1a15] border border-[#e08a6e]/40 rounded-full text-xs font-bold text-[#f5a287] mb-3 shadow-inner">
            <Sparkles size={14} className="text-[#e08a6e]" />
            <span>Official Mosque Accounts & Giving Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Support <span className="text-[#f5a287]">Sunnyvale Masjid</span>
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Contribute directly to our verified bank accounts and submit your transfer confirmation to receive official member credit and digital receipts.
          </p>
        </motion.div>

        {/* Quick History Link Banner if User Donated */}
        {hasDonated && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-[#181b22] border border-[#e08a6e]/30 rounded-2xl flex items-center justify-between shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="bg-[#2a1a15] p-2 rounded-xl text-[#f5a287] border border-[#e08a6e]/40">
                <History size={18} />
              </div>
              <div>
                <p className="text-white font-bold text-xs sm:text-sm">Your Contribution History</p>
                <p className="text-zinc-400 text-xs">View all your completed bank transfer donation receipts.</p>
              </div>
            </div>
            <Link 
              to="/dashboard" 
              className="px-4 py-2 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow shadow-[#e08a6e]/20"
            >
              <Search size={13} /> View Dashboard
            </Link>
          </motion.div>
        )}

        {/* Main Mode Selector Tabs */}
        <div className="flex items-center justify-center p-1.5 bg-[#181b22] border border-zinc-800 rounded-2xl mb-8 max-w-md mx-auto shadow-lg gap-2">
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'bank'
                ? 'bg-[#e08a6e] text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Building2 size={16} /> Bank Accounts & Details
          </button>
          <button
            onClick={() => setActiveTab('zakat')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'zakat'
                ? 'bg-[#e08a6e] text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Calculator size={16} /> Zakat Calculator
          </button>
        </div>

        {/* TAB 1: VERIFIED BANK ACCOUNTS */}
        {activeTab === 'bank' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Guide Info Banner */}
            <div className="bg-[#181b22] border border-zinc-750 rounded-2xl p-5 flex items-start gap-3.5 shadow-md">
              <div className="bg-[#2a1a15] p-2.5 rounded-xl text-[#f5a287] shrink-0 border border-[#e08a6e]/40">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="text-[#f5a287] font-bold text-sm mb-1 uppercase tracking-wider">Direct Bank Transfer Instructions</h3>
                <p className="text-zinc-300 text-xs leading-relaxed">
                  Make a transfer to any official Mosque account below using your mobile banking app, USSD, or internet banking. After sending funds, click <strong className="text-[#fbdcd3]">"Submit Bank Transfer Confirmation"</strong> below to notify the Mosque EXCO and record your donation.
                </p>
              </div>
            </div>

            {/* Bank Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BANK_DETAILS.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.05 }}
                  className="bg-[#181b22] rounded-2xl p-5 shadow-md border border-zinc-800 hover:border-[#e08a6e]/50 relative group overflow-hidden flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[#f5a287] font-bold text-xs uppercase tracking-widest">{item.bank}</h3>
                      {item.bank.includes('AEDC') ? <Zap size={18} className="text-amber-400" /> : <Building2 size={18} className="text-[#e08a6e]" />}
                    </div>
                    
                    <p className="text-zinc-400 text-[11px] mb-1 font-medium">
                      {item.bank.includes('AEDC') ? 'Meter Number' : 'NUBAN Account Number'}
                    </p>
                    
                    <div className="flex items-center justify-between gap-2 mb-3 bg-[#121419] p-2.5 rounded-xl border border-zinc-750 group-hover:border-[#e08a6e]/30 transition-colors">
                      <span className="text-lg sm:text-xl font-mono font-bold text-white tracking-tight select-all">{item.accountNumber}</span>
                      <button 
                        onClick={() => copyToClipboard(item.accountNumber, idx, item.bank)}
                        className="p-2 bg-zinc-800 hover:bg-[#2a1a15] text-zinc-300 hover:text-[#f5a287] rounded-lg transition-all border border-zinc-700 hover:border-[#e08a6e]/40 cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === idx ? <Check size={14} className="text-[#f5a287]" /> : <Copy size={14} />}
                      </button>
                    </div>
                    
                    <div>
                      <p className="text-zinc-400 text-[10px] uppercase font-semibold">Account Name</p>
                      <p className="text-zinc-200 font-medium text-xs mt-0.5 leading-snug">{item.accountName}</p>
                    </div>
                  </div>

                  {copiedIndex === idx && (
                    <div className="mt-3 bg-[#e08a6e] text-zinc-950 text-[10px] py-1 text-center rounded font-bold shadow-md animate-fade-in">
                      COPIED TO CLIPBOARD!
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Suggested Giving Categories & Pledges */}
            <div className="bg-[#181b22] rounded-3xl p-6 sm:p-7 border border-zinc-800 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <HeartHandshake size={18} className="text-[#f5a287]" />
                <h3 className="text-sm sm:text-base font-bold text-white">Suggested Donation Causes & Purposes</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DONATION_PURPOSES.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#121419] rounded-xl border border-zinc-800 hover:border-[#e08a6e]/30 transition-all"
                  >
                    <p className="text-xs font-bold text-[#fbdcd3] mb-0.5">{item.label}</p>
                    <p className="text-[11px] text-zinc-400 leading-snug">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation Form Callout */}
            <div className="bg-gradient-to-br from-[#202530] to-[#181b22] rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-700 text-center">
              <div className="p-3 bg-[#2a1a15] text-[#f5a287] rounded-2xl w-fit mx-auto mb-3 border border-[#e08a6e]/40">
                <FileCheck size={28} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Completed Your Bank Transfer?</h2>
              <p className="text-zinc-300 text-xs sm:text-sm max-w-xl mx-auto mb-6 leading-relaxed">
                Please submit the confirmation form with your transfer details or proof of payment so the Mosque committee can verify and credit your profile.
              </p>
              <Link 
                to="/confirm" 
                className="inline-flex items-center gap-2 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#e08a6e]/20 transition-all cursor-pointer"
              >
                Submit Bank Transfer Confirmation <ArrowRight size={16} />
              </Link>
            </div>

            {/* Trust & Security Notes */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] text-zinc-400 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-zinc-400" /> Transparent Committee Financial Auditing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-zinc-400" /> Direct Transfer to Official Mosque NUBANs
              </span>
              <span className="flex items-center gap-1.5">
                <Info size={14} className="text-zinc-400" /> Official Receipts Logged to Member Dashboard
              </span>
            </div>
          </motion.div>
        )}

        {/* TAB 2: DIGITAL ZAKAT CALCULATOR */}
        {activeTab === 'zakat' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ZakatCalculator 
              onPayZakat={(amount) => {
                setActiveTab('bank');
                toast.success(`Zakat amount ₦${amount.toLocaleString()} noted. Please transfer to Jaiz Bank or Zenith Bank below.`);
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Donate;
