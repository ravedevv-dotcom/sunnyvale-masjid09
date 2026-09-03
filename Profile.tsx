import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Phone, MapPin, Save, Edit2, Heart, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { db } from './firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

interface DonationItem {
  id: string;
  amount: number | string;
  purpose: string;
  timestamp: any;
}

const Profile: React.FC = () => {
  const { user, updateUser, isLoading, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);

  useEffect(() => {
    async function fetchDonations() {
      if (user && user.uid) {
        try {
          const q = query(collection(db, 'donations'), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          const list: DonationItem[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as DonationItem);
          });
          list.sort((a, b) => {
            const tA = a.timestamp?.seconds || (new Date(a.timestamp).getTime() / 1000) || 0;
            const tB = b.timestamp?.seconds || (new Date(b.timestamp).getTime() / 1000) || 0;
            return tB - tA;
          });
          setDonations(list);
        } catch (err) {
          console.warn("Error loading donations:", err);
        } finally {
          setLoadingDonations(false);
        }
      }
    }
    fetchDonations();
  }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-zinc-300">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (user.uid) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          updatedAt: serverTimestamp()
        });
      }
      updateUser({
        ...user,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] py-12 px-4 transition-colors">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#181b22] rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-800"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 text-2xl font-bold">
                {name.charAt(0).toUpperCase() || 'M'}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{name || 'Community Member'}</h1>
                {isAdmin ? (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-950 text-purple-300 border border-purple-700/60 shadow-sm">
                      <ShieldCheck size={13} className="text-purple-400" />
                      Verified Mosque EXCO Admin
                    </span>
                    <Link to="/admin" className="text-[11px] text-purple-400 hover:text-purple-200 underline font-medium">
                      Admin Portal &rarr;
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                    <ShieldCheck size={14} className="text-zinc-400" />
                    Sunnyvale Masjid Member {user.approvalStatus === 'approved' && '(Approved)'}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all cursor-pointer"
            >
              <Edit2 size={14} /> {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none disabled:opacity-60 focus:border-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-zinc-400 text-sm outline-none opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="080 1234 5678"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none disabled:opacity-60 focus:border-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Estate Residence / Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Block C, Flat 4, Sunnyvale"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#121419] border border-zinc-700 rounded-xl text-white text-sm outline-none disabled:opacity-60 focus:border-zinc-400"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-zinc-200 hover:bg-white text-zinc-950 px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Save size={14} /> {isSaving ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            )}
          </form>
        </motion.div>

        {/* Past Donations History */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 bg-[#181b22] rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-800"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800 text-zinc-200 rounded-xl border border-zinc-700">
                <Heart size={18} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Your Past Contributions</h3>
                <p className="text-xs text-zinc-400">Synced directly with your Firebase records</p>
              </div>
            </div>
            <Link 
              to="/dashboard" 
              className="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1"
            >
              Dashboard <ArrowRight size={13} />
            </Link>
          </div>

          {loadingDonations ? (
            <div className="text-center py-6 text-xs text-zinc-400 animate-pulse">Loading contributions...</div>
          ) : donations.length > 0 ? (
            <div className="space-y-2.5">
              {donations.map((item) => (
                <div 
                  key={item.id}
                  className="p-3.5 bg-[#121419] rounded-xl border border-zinc-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-white">{item.purpose}</p>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={11} className="text-zinc-500" />
                      {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleDateString() : 'Recent Record'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-zinc-200 text-sm font-mono">₦{Number(item.amount).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-[#121419] rounded-2xl border border-dashed border-zinc-800">
              <p className="text-xs text-zinc-400 mb-3">No donation records found for this account.</p>
              <Link 
                to="/donate" 
                className="inline-block px-4 py-2 bg-zinc-200 hover:bg-white text-zinc-950 font-bold text-xs rounded-xl shadow transition-all"
              >
                Make a Contribution
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
