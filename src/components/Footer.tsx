import React from 'react';

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
              className={`text-2xl font-bold tracking-widest uppercase text-left transition-colors cursor-pointer ${
                isDarkMode ? 'text-white hover:text-[#a1a1a6]' : 'text-slate-900 hover:text-slate-600'
              }`}
            >
              UF .
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


