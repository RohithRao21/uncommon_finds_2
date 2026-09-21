import React from 'react';

interface AboutPageProps {
  isDarkMode: boolean;
  onNavigateShop: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ isDarkMode, onNavigateShop }) => {
  return (
    <div className={`min-h-[70vh] flex flex-col justify-center px-6 lg:px-16 py-20 lg:py-32 font-mono-tech ${
      isDarkMode ? 'bg-black text-[#f2f2f7]' : 'bg-white text-slate-900'
    }`}>
      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        {/* Eyebrow / Breadcrumb */}
        <div className={`text-xs tracking-widest uppercase font-mono-tech flex items-center gap-2 ${
          isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
        }`}>
          <span className={isDarkMode ? 'text-[#6c6c70]' : 'text-slate-400'}>/</span>
          <span>STORE</span>
        </div>

        {/* Main Display Headline */}
        <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] font-mono-tech ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          Fewer things.<br />
          Better ones.
        </h1>

        {/* Story & Philosophy Paragraphs */}
        <div className={`space-y-6 text-sm sm:text-base leading-relaxed font-sans-clean max-w-2xl pt-2 ${
          isDarkMode ? 'text-[#a1a1a6]' : 'text-slate-700'
        }`}>
          <p>
            UF is a small, independent store. We pick a short list of objects worth owning and stand behind each one — no filler, no clutter.
          </p>

          <p>
            Every order is checked and packed by hand. If something's not right, tell us and we'll make it right.
          </p>

          <p className={isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'}>
            Our objects are crafted using precision 3D additive manufacturing and engineered polymers. We focus on ergonomic utility, tactile matte finishes, and modular longevity — objects built to be used every day.
          </p>
        </div>

        {/* Action button back to store */}
        <div className="pt-6">
          <button
            onClick={onNavigateShop}
            className={`px-6 py-3 border font-bold text-xs uppercase tracking-widest transition-all cursor-pointer font-mono-tech ${
              isDarkMode 
                ? 'border-white/20 bg-white text-black hover:bg-[#e5e5ea]' 
                : 'border-slate-900 bg-slate-900 text-white hover:bg-black'
            }`}
          >
            EXPLORE CATALOG
          </button>
        </div>

      </div>
    </div>
  );
};
