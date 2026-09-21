import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { CategoryType } from '../types';

interface CategoryFilterProps {
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  gridCols: number;
  onGridColsChange: (cols: number) => void;
  totalCount: number;
  isDarkMode: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  totalCount,
  isDarkMode,
}) => {
  const categories: { id: CategoryType; label: string; code: string }[] = [
    { id: 'all', label: 'All Products', code: '00' },
    { id: 'lighter', label: 'Lighter Sleeves', code: '01' },
    { id: 'desk', label: 'Desk Architecture', code: '02' },
    { id: 'edc', label: 'EDC & Tools', code: '03' },
    { id: 'audio', label: 'Audio Gear', code: '04' },
    { id: 'parametric', label: 'Archive', code: '05' },
  ];

  return (
    <div className={`pt-16 pb-8 border-b font-mono-tech transition-colors ${
      isDarkMode 
        ? 'bg-[#000000] border-[#1c1c1e] text-[#f2f2f7]' 
        : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-8">
        
        {/* Section Header Matching Screenshot 1 */}
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6 ${
          isDarkMode ? 'border-[#1c1c1e]' : 'border-slate-200'
        }`}>
          <div>
            <div className={`text-xs tracking-widest uppercase mb-2 ${
              isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
            }`}>
              / CATALOG
            </div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight uppercase font-mono-tech ${
              isDarkMode ? 'text-[#f2f2f7]' : 'text-slate-900'
            }`}>
              Featured products
            </h2>
          </div>

          <button
            onClick={() => onSelectCategory('all')}
            className={`text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors ${
              isDarkMode ? 'text-[#8e8e93] hover:text-white' : 'text-slate-500 hover:text-black'
            }`}
          >
            <span>VIEW ALL ({totalCount}) →</span>
          </button>
        </div>

        {/* Category Pills & Sort Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 text-xs font-mono-tech uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                  selectedCategory === cat.id
                    ? (isDarkMode 
                        ? 'bg-[#f2f2f7] text-[#000000] font-bold border-[#f2f2f7]' 
                        : 'bg-slate-900 text-white font-bold border-slate-900')
                    : (isDarkMode 
                        ? 'bg-[#161616] text-[#8e8e93] border-[#2c2c2e] hover:text-white hover:border-[#f2f2f7]' 
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-black hover:border-slate-400')
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className={`flex items-center gap-2 text-xs shrink-0 ${
            isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
          }`}>
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className={`px-3 py-1.5 border text-xs font-mono-tech outline-none cursor-pointer uppercase ${
                isDarkMode 
                  ? 'bg-[#161616] border-[#2c2c2e] text-[#f2f2f7]' 
                  : 'bg-slate-100 border-slate-300 text-slate-900'
              }`}
            >
              <option value="featured">FEATURED FIRST</option>
              <option value="bestsellers">BESTSELLERS</option>
              <option value="price-low">PRICE: LOW TO HIGH</option>
              <option value="price-high">PRICE: HIGH TO LOW</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};

