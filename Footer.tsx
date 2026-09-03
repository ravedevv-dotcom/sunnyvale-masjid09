import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import { CONTACT_PHONES, MOSQUE_EMAIL } from './constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0b0d10] text-zinc-300 pt-12 pb-8 border-t border-zinc-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <h3 className="text-base font-bold mb-3 text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-[#c86d51] to-[#e08a6e] rounded-lg flex items-center justify-center text-xs text-zinc-950 font-black">S</span>
              Sunnyvale Masjid
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              We, the Ummah of Sunnyvale Masjid collectively inspired by the philosophy of Islam, believing in the oneness of Almighty Allah and brotherhood.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-bold mb-3 text-[#f5a287] uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-400">
              <li><Link to="/" className="hover:text-[#f5a287] transition-colors">Home & Solat Schedule</Link></li>
              <li><Link to="/about" className="hover:text-[#f5a287] transition-colors">About Us</Link></li>
              <li><Link to="/events" className="hover:text-[#f5a287] transition-colors">Khutbahs & Classes</Link></li>
              <li><Link to="/school" className="hover:text-[#f5a287] transition-colors">School Construction</Link></li>
              <li><Link to="/donate" className="hover:text-[#f5a287] transition-colors">Support & Donate</Link></li>
              <li><Link to="/auth" className="hover:text-[#f5a287] transition-colors">Member Portal</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold mb-3 text-[#f5a287] uppercase tracking-wider">Contact Administration</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#e08a6e] shrink-0 mt-0.5" />
                <span>Sunnyvale Homes Estate, Abuja, Nigeria</span>
              </li>
              {CONTACT_PHONES.map(phone => (
                <li key={phone} className="flex items-center gap-2.5">
                  <Phone size={16} className="text-[#e08a6e] shrink-0" />
                  <a href={`tel:${phone}`} className="hover:text-[#f5a287] transition-colors">{phone}</a>
                </li>
              ))}
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#e08a6e] shrink-0" />
                <a href={`mailto:${MOSQUE_EMAIL}`} className="hover:text-[#f5a287] transition-colors">{MOSQUE_EMAIL}</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Sunnyvale Muslim Community. All rights reserved.
          </p>
          <p className="text-xs text-zinc-500 italic">
            Sunnyvale Masjid Portal
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
