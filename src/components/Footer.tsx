import React from 'react';
import { UFLogo } from './UFLogo';

interface FooterProps {
  onOpenCustomStudio: () => void;
  isDarkMode: boolean;
  onNavigateShop?: () => void;
  onNavigateAbout?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ isDarkMode, onNavigateShop, onNavigateAbout }) => {
  return (
    <footer className={`font-mono-tech border-t py-16 px-6 lg:px-10 transition-colors ${
      isDarkMode 
        ? 'bg-[#000000] text-[#f2f2f7] border-[#1c1c1e]' 
        : 'bg-slate-100 text-slate-900 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Left */}
          <div className="md:col-span-6 space-y-3">
            <button 
              onClick={onNavigateShop} 
              className="flex items-center gap-3 text-left transition-colors cursor-pointer group"
            >
              <UFLogo size={28} />
              <div className="flex flex-col justify-center leading-none">
                <span className={`font-bold text-xs tracking-widest uppercase transition-colors ${
                  isDarkMode ? 'text-white group-hover:text-slate-300' : 'text-slate-900 group-hover:text-slate-600'
                }`}>
                  The Uncommon
                </span>
                <span className={`font-bold text-xs tracking-widest uppercase transition-colors mt-0.5 ${
                  isDarkMode ? 'text-white group-hover:text-slate-300' : 'text-slate-900 group-hover:text-slate-600'
                }`}>
                  Finds
                </span>
              </div>
            </button>
            <p className={`text-xs font-sans-clean leading-relaxed max-w-sm ${
              isDarkMode ? 'text-[#8e8e93]' : 'text-slate-600'
            }`}>
              A minimalist store for well-made everyday objects.
            </p>
          </div>

          {/* SHOP Column */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className={`font-bold uppercase tracking-widest text-[11px] ${
              isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
            }`}>SHOP</h4>
            <ul className={`space-y-2 ${isDarkMode ? 'text-[#f2f2f7]' : 'text-slate-800'}`}>
              <li>
                <button 
                  onClick={onNavigateShop} 
                  className={`transition-colors cursor-pointer text-left ${
                    isDarkMode ? 'hover:text-white' : 'hover:text-black'
                  }`}
                >
                  All products
                </button>
              </li>
            </ul>
          </div>

          {/* STORE Column */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className={`font-bold uppercase tracking-widest text-[11px] ${
              isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
            }`}>STORE</h4>
            <ul className={`space-y-2 ${isDarkMode ? 'text-[#f2f2f7]' : 'text-slate-800'}`}>
              <li>
                <button 
                  onClick={onNavigateAbout} 
                  className={`transition-colors cursor-pointer text-left ${
                    isDarkMode ? 'hover:text-white' : 'hover:text-black'
                  }`}
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={onNavigateAbout} 
                  className={`transition-colors cursor-pointer text-left ${
                    isDarkMode ? 'hover:text-white' : 'hover:text-black'
                  }`}
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: © 2026 UF | SHIPPED WORLDWIDE */}
        <div className={`pt-8 border-t flex justify-between items-center text-xs tracking-widest uppercase ${
          isDarkMode ? 'border-[#1c1c1e] text-[#8e8e93]' : 'border-slate-200 text-slate-500'
        }`}>
          <div>© 2026 UF</div>
          <div>SHIPPED WORLDWIDE</div>
        </div>

      </div>
    </footer>
  );
};


