import React, { useState } from 'react';
import { ShoppingBag, Search, Sun, Moon, Menu, X, User as UserIcon, Heart, Shield } from 'lucide-react';
import { CategoryType } from '../types';
import { UFLogo } from './UFLogo';
import { User } from '../lib/firebase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  cartCount?: number;
  onOpenCart: () => void;
  onOpenCustomStudio: () => void;
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  activeTab: 'shop' | 'about' | 'wishlist' | 'checkout' | 'orders' | 'admin';
  onSelectTab: (tab: 'shop' | 'about' | 'wishlist' | 'checkout' | 'orders' | 'admin') => void;
  currency: string;
  onChangeCurrency: (curr: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onOpenAccount?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount: propCartCount,
  onOpenCart,
  onOpenCustomStudio,
  selectedCategory,
  onSelectCategory,
  activeTab,
  onSelectTab,
  isDarkMode,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenAuth,
  onOpenAccount,
}) => {
  const { cartCount: contextCartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { userProfile } = useAuth();
  const effectiveCartCount = typeof propCartCount === 'number' ? propCartCount : contextCartCount;
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formattedCartCount = effectiveCartCount < 10 ? `0${effectiveCartCount}` : `${effectiveCartCount}`;
  const formattedWishlistCount = wishlistCount < 10 ? `0${wishlistCount}` : `${wishlistCount}`;

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
      isDarkMode 
        ? 'bg-[#000000] border-[#1c1c1e] text-[#f2f2f7]' 
        : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between font-mono-tech">
        
        {/* Logo: Uncommon Finds */}
        <button 
          onClick={() => {
            onSelectTab('shop');
            onSelectCategory('all');
          }}
          className="flex items-center gap-3 group text-left cursor-pointer"
        >
          <UFLogo size={32} />
          <div className="flex items-center gap-1.5">
            <span className={`font-bold text-sm tracking-widest uppercase transition-colors ${
              isDarkMode 
                ? 'text-[#f2f2f7] group-hover:text-white' 
                : 'text-slate-900 group-hover:text-black'
            }`}>
              Uncommon
            </span>
            <span className={`font-bold text-sm tracking-widest uppercase transition-colors ${
              isDarkMode 
                ? 'text-[#f2f2f7] group-hover:text-white' 
                : 'text-slate-900 group-hover:text-black'
            }`}>
              Finds
            </span>
          </div>
        </button>

        {/* Navigation Links: SHOP / WISHLIST / ABOUT */}
        <nav className="hidden md:flex items-center gap-8 font-mono-tech text-xs tracking-widest">
          <button
            onClick={() => {
              onSelectTab('shop');
            }}
            className={`uppercase transition-colors cursor-pointer py-1 ${
              isDarkMode
                ? (activeTab === 'shop'
                    ? 'text-[#f2f2f7] font-bold border-b border-white'
                    : 'text-[#8e8e93] hover:text-[#f2f2f7]')
                : (activeTab === 'shop'
                    ? 'text-black font-bold border-b border-black'
                    : 'text-slate-500 hover:text-black')
            }`}
          >
            SHOP
          </button>
          <button
            onClick={() => {
              onSelectTab('wishlist');
            }}
            className={`uppercase transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              isDarkMode
                ? (activeTab === 'wishlist'
                    ? 'text-[#f2f2f7] font-bold border-b border-white'
                    : 'text-[#8e8e93] hover:text-[#f2f2f7]')
                : (activeTab === 'wishlist'
                    ? 'text-black font-bold border-b border-black'
                    : 'text-slate-500 hover:text-black')
            }`}
          >
            <span>WISHLIST</span>
            {wishlistCount > 0 && (
              <span className="px-1.5 py-0.2 bg-red-500 text-white font-bold text-[10px] rounded-full">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              onSelectTab('orders');
            }}
            className={`uppercase transition-colors cursor-pointer py-1 ${
              isDarkMode
                ? (activeTab === 'orders'
                    ? 'text-[#f2f2f7] font-bold border-b border-white'
                    : 'text-[#8e8e93] hover:text-[#f2f2f7]')
                : (activeTab === 'orders'
                    ? 'text-black font-bold border-b border-black'
                    : 'text-slate-500 hover:text-black')
            }`}
          >
            MY ORDERS
          </button>
          <button
            onClick={() => {
              onSelectTab('about');
            }}
            className={`uppercase transition-colors cursor-pointer py-1 ${
              isDarkMode
                ? (activeTab === 'about'
                    ? 'text-[#f2f2f7] font-bold border-b border-white'
                    : 'text-[#8e8e93] hover:text-[#f2f2f7]')
                : (activeTab === 'about'
                    ? 'text-black font-bold border-b border-black'
                    : 'text-slate-500 hover:text-black')
            }`}
          >
            ABOUT
          </button>
          <button
            onClick={() => {
              onSelectTab('admin');
            }}
            className={`uppercase transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              isDarkMode
                ? (activeTab === 'admin'
                    ? 'text-red-400 font-bold border-b border-red-500'
                    : 'text-red-400/80 hover:text-red-400')
                : (activeTab === 'admin'
                    ? 'text-red-600 font-bold border-b border-red-600'
                    : 'text-red-600 hover:text-red-700')
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>ADMIN</span>
          </button>
        </nav>

        {/* Right Tools (Search, Theme Toggle, Cart) */}
        <div className="flex items-center gap-3">
          
          {/* Search bar toggle */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="SEARCH CATALOG..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  className={`px-3 py-1 text-xs font-mono-tech w-36 sm:w-48 outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-[#161616] border-[#2c2c2e] text-[#f2f2f7] placeholder-[#8e8e93]' 
                      : 'bg-slate-100 border-slate-300 text-black placeholder-slate-400'
                  }`}
                />
                <button 
                  onClick={() => { setIsSearchOpen(false); onSearchChange(''); }}
                  className={`p-1 cursor-pointer ${isDarkMode ? 'text-[#8e8e93] hover:text-white' : 'text-slate-500 hover:text-black'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 transition-colors cursor-pointer ${isDarkMode ? 'text-[#8e8e93] hover:text-[#f2f2f7]' : 'text-slate-500 hover:text-black'}`}
                title="Search Products"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Wishlist Header Quick Icon Button */}
          <button
            onClick={() => onSelectTab('wishlist')}
            className={`p-2 border transition-colors cursor-pointer rounded-none relative ${
              activeTab === 'wishlist'
                ? (isDarkMode ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-red-500 bg-red-50 text-red-600')
                : (isDarkMode 
                    ? 'border-[#2c2c2e] bg-transparent text-[#8e8e93] hover:text-[#f2f2f7]' 
                    : 'border-slate-300 bg-transparent text-slate-600 hover:text-black hover:border-slate-400')
            }`}
            title={`Wishlist (${wishlistCount})`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-red-500 text-white font-bold text-[9px] rounded-full min-w-[16px] text-center">
                {formattedWishlistCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`p-2 border transition-colors cursor-pointer rounded-none ${
              isDarkMode 
                ? 'border-[#2c2c2e] bg-transparent text-[#8e8e93] hover:text-[#f2f2f7]' 
                : 'border-slate-300 bg-transparent text-slate-600 hover:text-black hover:border-slate-400'
            }`}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* User Account / Auth Button */}
          {currentUser ? (
            <button
              onClick={onOpenAccount}
              className={`px-3 py-2 border font-mono-tech text-xs tracking-wider cursor-pointer transition-all flex items-center gap-1.5 ${
                isDarkMode 
                  ? 'border-white/30 bg-white/10 text-white hover:bg-white/20' 
                  : 'border-slate-800 bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
              title="Account Settings"
            >
              <UserIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline uppercase max-w-[80px] truncate">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'MAKER'}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`px-3 py-2 border font-mono-tech text-xs tracking-wider cursor-pointer transition-all flex items-center gap-1.5 uppercase ${
                isDarkMode 
                  ? 'border-[#2c2c2e] bg-transparent text-[#8e8e93] hover:text-[#f2f2f7] hover:border-white' 
                  : 'border-slate-300 bg-transparent text-slate-600 hover:text-black hover:border-slate-400'
              }`}
              title="Sign In / Register"
            >
              <UserIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">SIGN IN</span>
            </button>
          )}

          {/* Cart Button: CART [00] */}
          <button
            onClick={onOpenCart}
            className={`px-4 py-2 border uppercase font-mono-tech text-xs tracking-widest cursor-pointer transition-all flex items-center gap-2 ${
              isDarkMode
                ? 'border-[#2c2c2e] bg-[#000000] text-[#f2f2f7] hover:border-white'
                : 'border-slate-900 bg-slate-900 text-white hover:bg-black'
            }`}
          >
            <span>CART [{formattedCartCount}]</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${isDarkMode ? 'text-[#8e8e93] hover:text-[#f2f2f7]' : 'text-slate-600 hover:text-black'}`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className={`md:hidden px-6 py-4 border-t font-mono-tech text-xs space-y-3 ${
          isDarkMode ? 'bg-[#0c0c0e] border-[#2c2c2e]' : 'bg-white border-slate-200'
        }`}>
          <button
            onClick={() => { onSelectTab('shop'); onSelectCategory('all'); setIsMobileMenuOpen(false); }}
            className={`block w-full text-left uppercase py-1.5 ${
              isDarkMode 
                ? (activeTab === 'shop' ? 'text-white font-bold' : 'text-[#8e8e93] hover:text-white')
                : (activeTab === 'shop' ? 'text-black font-bold' : 'text-slate-500 hover:text-black')
            }`}
          >
            SHOP
          </button>
          <button
            onClick={() => { onSelectTab('wishlist'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left uppercase py-1.5 flex items-center justify-between ${
              isDarkMode 
                ? (activeTab === 'wishlist' ? 'text-white font-bold' : 'text-[#8e8e93] hover:text-white')
                : (activeTab === 'wishlist' ? 'text-black font-bold' : 'text-slate-500 hover:text-black')
            }`}
          >
            <span>WISHLIST</span>
            {wishlistCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white font-bold text-[10px] rounded-full">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { onSelectTab('orders'); setIsMobileMenuOpen(false); }}
            className={`block w-full text-left uppercase py-1.5 ${
              isDarkMode 
                ? (activeTab === 'orders' ? 'text-white font-bold' : 'text-[#8e8e93] hover:text-white')
                : (activeTab === 'orders' ? 'text-black font-bold' : 'text-slate-500 hover:text-black')
            }`}
          >
            MY ORDERS
          </button>
          <button
            onClick={() => { onSelectTab('about'); setIsMobileMenuOpen(false); }}
            className={`block w-full text-left uppercase py-1.5 ${
              isDarkMode 
                ? (activeTab === 'about' ? 'text-white font-bold' : 'text-[#8e8e93] hover:text-white')
                : (activeTab === 'about' ? 'text-black font-bold' : 'text-slate-500 hover:text-black')
            }`}
          >
            ABOUT
          </button>
          <button
            onClick={() => { onSelectTab('admin'); setIsMobileMenuOpen(false); }}
            className={`block w-full text-left uppercase py-1.5 font-bold ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`}
          >
            ADMIN DASHBOARD
          </button>
        </div>
      )}
    </header>
  );
};

