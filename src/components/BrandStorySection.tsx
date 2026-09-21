import React from 'react';

interface BrandStorySectionProps {
  isDarkMode: boolean;
}

export const BrandStorySection: React.FC<BrandStorySectionProps> = ({ isDarkMode }) => {
  return (
    <section className={`py-24 sm:py-32 px-6 font-mono-tech border-y transition-colors ${
      isDarkMode 
        ? 'bg-[#0a0a0c] text-white border-[#1c1c1e]' 
        : 'bg-[#f9f9f9] text-[#000000] border-slate-200'
    }`}>
      <div className="max-w-4xl mx-auto text-center space-y-6">
        {/* / NOTE Tag */}
        <div className={`text-xs tracking-widest uppercase ${
          isDarkMode ? 'text-[#8e8e93]' : 'text-[#6c6c70]'
        }`}>
          / NOTE
        </div>

        {/* Large Monospace Quote */}
        <h2 className={`text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight font-mono-tech ${
          isDarkMode ? 'text-white' : 'text-[#000000]'
        }`}>
          "If it's on the shelf, we'd own it ourselves."
        </h2>

        {/* Author Tag */}
        <div className={`text-xs tracking-widest uppercase pt-2 ${
          isDarkMode ? 'text-[#8e8e93]' : 'text-[#6c6c70]'
        }`}>
          — UF
        </div>
      </div>
    </section>
  );
};


