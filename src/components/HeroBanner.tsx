import React from 'react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onOpenCustomStudio: () => void;
  isDarkMode: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onOpenCustomStudio,
  isDarkMode,
}) => {
  return (
    <section className={`relative border-b font-mono-tech transition-colors ${
      isDarkMode 
        ? 'bg-[#000000] border-[#1c1c1e] text-[#f2f2f7]' 
        : 'bg-slate-100 border-slate-200 text-slate-900'
    }`}>
      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-16">
        
        {/* Top Eyebrow Tag: ■ VOL. 01 — NOW IN STOCK */}
        <div className={`flex items-center gap-2 text-xs tracking-widest uppercase mb-8 ${
          isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
        }`}>
          <span className={`inline-block w-2 h-2 ${isDarkMode ? 'bg-[#f2f2f7]' : 'bg-slate-900'}`}></span>
          <span>VOL. 01 — NOW IN STOCK</span>
        </div>

        {/* Big Monospace Headline */}
        <div className="space-y-1 mb-10 text-left">
          <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-none font-mono-tech ${
            isDarkMode ? 'text-[#ffffff]' : 'text-slate-900'
          }`}>
            Fewer things.
          </h1>
          <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-none font-mono-tech ${
            isDarkMode ? 'text-[#6c6c70]' : 'text-slate-400'
          }`}>
            Better ones.
          </h1>
        </div>

        {/* Hero Bottom Row: Subtitle + Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left">
          
          {/* Subtitle Paragraph */}
          <p className={`text-sm sm:text-base max-w-lg font-sans-clean leading-relaxed ${
            isDarkMode ? 'text-[#8e8e93]' : 'text-slate-600'
          }`}>
            A minimalist store for well-made everyday objects. A short list, carefully picked — shipped worldwide.
          </p>

          {/* Action Buttons: SHOP NOW → / ABOUT UF */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={onExploreClick}
              className={`px-8 py-3.5 font-bold uppercase font-mono-tech text-xs tracking-widest cursor-pointer transition-all ${
                isDarkMode 
                  ? 'bg-white text-black hover:bg-[#e5e5ea]' 
                  : 'bg-slate-900 text-white hover:bg-black'
              }`}
            >
              SHOP NOW →
            </button>

            <button
              onClick={onOpenCustomStudio}
              className={`px-8 py-3.5 border font-bold uppercase font-mono-tech text-xs tracking-widest cursor-pointer transition-all ${
                isDarkMode 
                  ? 'border-[#3a3a3c] bg-transparent text-[#f2f2f7] hover:border-white' 
                  : 'border-slate-300 bg-transparent text-slate-900 hover:border-black'
              }`}
            >
              ABOUT UF
            </button>
          </div>
        </div>

      </div>

      {/* 4 Pillars Feature Bar (01 CURATED, 02 QUALITY, 03 SHIPPING, 04 SUPPORT) */}
      <div className={`border-t ${
        isDarkMode ? 'border-[#1c1c1e] bg-[#000000]' : 'border-slate-200 bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono-tech">
          <div>
            <span className={`text-[10px] block uppercase tracking-wider mb-0.5 ${
              isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
            }`}>01 — CURATED</span>
            <span className={`font-bold uppercase tracking-widest ${
              isDarkMode ? 'text-[#f2f2f7]' : 'text-slate-900'
            }`}>A SHORT LIST</span>
          </div>
          <div>
            <span className={`text-[10px] block uppercase tracking-wider mb-0.5 ${
              isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
            }`}>02 — QUALITY</span>
            <span className={`font-bold uppercase tracking-widest ${
              isDarkMode ? 'text-[#f2f2f7]' : 'text-slate-900'
            }`}>CHECKED BY HAND</span>
          </div>
          <div>
            <span className={`text-[10px] block uppercase tracking-wider mb-0.5 ${
              isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
            }`}>03 — SHIPPING</span>
            <span className={`font-bold uppercase tracking-widest ${
              isDarkMode ? 'text-[#f2f2f7]' : 'text-slate-900'
            }`}>WORLDWIDE</span>
          </div>
          <div>
            <span className={`text-[10px] block uppercase tracking-wider mb-0.5 ${
              isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
            }`}>04 — SUPPORT</span>
            <span className={`font-bold uppercase tracking-widest ${
              isDarkMode ? 'text-[#f2f2f7]' : 'text-slate-900'
            }`}>REAL HUMANS</span>
          </div>
        </div>
      </div>
    </section>
  );
};


