import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events & Solat', path: '/events' },
    { name: 'School Project', path: '/school' },
    { name: 'Donate', path: '/donate' },
  ];

  return (
    <nav className="bg-[#14171d]/95 backdrop-blur-md text-zinc-100 sticky top-0 z-50 shadow-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#c86d51] to-[#e08a6e] border border-[#f5a287]/40 rounded-xl flex items-center justify-center text-zinc-950 font-black text-lg shadow-md shadow-[#e08a6e]/20 group-hover:scale-105 transition-all">
                S
              </div>
              <div>
                <span className="font-bold text-base tracking-wide text-white uppercase block group-hover:text-[#f5a287] transition-colors">
                  Sunnyvale Masjid
                </span>
                <span className="text-[10px] text-[#e08a6e]/80 font-medium block -mt-1 tracking-wider">
                  Abuja Community
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-8 flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-[#2a1a15] text-[#f5a287] font-bold shadow-inner border border-[#e08a6e]/40' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {user ? (
                <div className="flex items-center gap-2.5 ml-4 pl-4 border-l border-zinc-800">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2a1a15] hover:bg-[#382019] text-xs font-bold text-[#f5a287] border border-[#e08a6e]/50 transition-colors shadow"
                      title="Mosque EXCO Admin Portal"
                    >
                      <ShieldCheck size={14} className="text-[#f5a287]" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-sm font-medium text-zinc-100 border border-zinc-700 transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-[#e08a6e]" />
                    <span className="max-w-[110px] truncate">{user.name || 'Member'}</span>
                  </Link>
                  <Link 
                    to="/profile" 
                    className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 hover:text-[#f5a287] transition-colors border border-zinc-700"
                    title="Profile Settings"
                  >
                    <UserIcon size={16} />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl hover:bg-red-950/40 text-zinc-400 hover:text-red-300 transition-colors border border-transparent hover:border-red-800/40 cursor-pointer"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="ml-4 bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#e08a6e]/20 hover:shadow-[#e08a6e]/30 transition-all cursor-pointer"
                >
                  Member Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 focus:outline-none border border-zinc-700"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#14171d] border-t border-zinc-800 px-4 pt-3 pb-5"
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-base font-medium text-zinc-300 hover:bg-zinc-800 hover:text-[#f5a287]"
                >
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <div className="pt-3 mt-3 border-t border-zinc-800 space-y-1">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-base font-bold text-[#f5a287] bg-[#2a1a15] border border-[#e08a6e]/50"
                    >
                      <ShieldCheck size={18} className="text-[#f5a287]" />
                      Mosque EXCO Admin Portal
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-base font-medium text-white bg-zinc-800"
                  >
                    <LayoutDashboard size={18} className="text-[#e08a6e]" />
                    Dashboard ({user.name})
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-base font-medium text-zinc-300 hover:bg-zinc-800"
                  >
                    <UserIcon size={18} />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-base font-medium text-red-400 hover:bg-red-950/40"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-3 mt-3 border-t border-zinc-800">
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-3 rounded-xl text-base font-bold bg-[#e08a6e] hover:bg-[#eb977c] text-zinc-950 shadow-md"
                  >
                    Member Login / Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
