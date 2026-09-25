import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, CheckCircle2, ShoppingBag, Heart, AlertCircle } from 'lucide-react';
import { Product, MaterialType } from '../types';
import { PriceDisplay } from './PriceDisplay';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { PRODUCTS } from '../data/products';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCart?: () => void;
  onAddToCart?: (
    product: Product,
    selectedMaterial: MaterialType,
    selectedLayerHeight: string,
    customEngraving: string,
    quantity: number
  ) => void;
  currencySymbol: string;
  isDarkMode: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCart,
  onAddToCart,
  currencySymbol,
  isDarkMode,
}) => {
  const { addToCart, cartCount } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Derive color list from product.colors or product.availableMaterials
  const colorsList = product
    ? (product.colors && product.colors.length > 0
        ? product.colors
        : (product.availableMaterials || []).map(m => ({
            name: m.name,
            stock: product.stockCount ?? 10,
            images: m.galleryImages || (m.image ? [m.image] : []),
            hexColor: m.hexColor,
            priceModifier: m.priceModifier
          })))
    : [];

  const [selectedColorName, setSelectedColorName] = useState<string>('Default');

  // Sync when product changes
  useEffect(() => {
    if (product) {
      const initialColors = product.colors && product.colors.length > 0
        ? product.colors
        : (product.availableMaterials || []).map(m => ({ name: m.name }));
      setSelectedColorName(initialColors[0]?.name || 'Default');
    }
  }, [product?.id]);

  const [quantity, setQuantity] = useState<number>(1);
  const [isFlashing, setIsFlashing] = useState(false);
  const [lastAddedInfo, setLastAddedInfo] = useState<{ productName: string; qty: number; color: string } | null>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const selectedColor = colorsList.find(c => c.name === selectedColorName) || colorsList[0];
  const activeStock = selectedColor ? selectedColor.stock : 0;
  const isOutOfStock = activeStock <= 0;

  const unitPrice = product.price + (selectedColor?.priceModifier || 0);

  const handleAdd = () => {
    if (isOutOfStock) return;
    const colorName = selectedColor?.name || 'Default';
    const colorImage = (selectedColor?.images && selectedColor.images.length > 0)
      ? selectedColor.images[0]
      : product.image;

    const success = addToCart({
      productId: product.id,
      productName: product.name,
      selectedColor: colorName,
      price: unitPrice,
      image: colorImage,
      quantity: quantity,
      maxStock: activeStock,
      selectedLayerHeight: '0.12 mm',
      product: product,
    });

    if (onAddToCart) {
      onAddToCart(product, colorName, '0.12 mm', '', quantity);
    }

    if (success) {
      // Trigger instant button click flash effect (350ms)
      setIsFlashing(true);
      setTimeout(() => {
        setIsFlashing(false);
      }, 350);

      // Show inline alert banner
      setLastAddedInfo({
        productName: product.name,
        qty: quantity,
        color: colorName,
      });
    }
  };

  // Image gallery derived from current selected color or fallback to product images
  const imagesToRender = selectedColor?.images && selectedColor.images.length > 0
    ? selectedColor.images
    : product.galleryImages && product.galleryImages.length > 0 
    ? product.galleryImages 
    : [product.image, product.secondaryImage].filter(Boolean) as string[];

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto font-mono-tech transition-colors duration-300 ${
      isDarkMode ? 'bg-[#000000] text-[#f2f2f7]' : 'bg-white text-slate-900'
    }`}>
      
      {/* Top Header / Breadcrumb Bar */}
      <div className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between ${
        isDarkMode ? 'bg-[#000000]/90 border-[#1c1c1e]' : 'bg-white/90 border-slate-200'
      }`}>
        <button
          onClick={onClose}
          className={`flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest cursor-pointer transition-colors group ${
            isDarkMode ? 'text-[#8e8e93] hover:text-white' : 'text-slate-500 hover:text-black'
          }`}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>SHOP</span>
          <span>/</span>
          <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{product.name}</span>
        </button>

        <button
          onClick={onClose}
          className={`p-1.5 border transition-all cursor-pointer rounded-sm ${
            isDarkMode 
              ? 'border-[#2c2c2e] hover:border-white text-[#8e8e93] hover:text-white' 
              : 'border-slate-300 hover:border-black text-slate-500 hover:text-black'
          }`}
          title="Close Product View (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
        
        {/* Breadcrumb line inside section */}
        <div className={`text-[11px] font-mono-tech uppercase tracking-widest mb-6 sm:mb-8 ${
          isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
        }`}>
          <span>SHOP</span> <span className="mx-1">/</span> <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          
          {/* LEFT COLUMN: Vertical Gallery Stack */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {imagesToRender.map((img, idx) => (
              <div 
                key={idx} 
                className={`relative aspect-square w-full overflow-hidden border ${
                  isDarkMode ? 'bg-[#0a0a0c] border-[#1c1c1e]' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} - ${selectedColor?.name || 'View'} ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: Sticky Info & Buy Box */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-20 space-y-6 sm:space-y-8">
              
              {/* Product Title & In Stock Meta */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    SLUG: {product.slug}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 border border-white/20 uppercase font-mono text-slate-400">
                    {product.category}
                  </span>
                </div>

                <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight uppercase font-mono-tech leading-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {product.name}
                </h1>

                {/* Special Edition Marking Banner for Fight Club reference */}
                {(product.isSpecialEdition || product.id === 'soap-bar-lighter-sleeve' || product.slug.includes('soap')) && (
                  <div className={`p-4 border rounded-none transition-colors ${
                    isDarkMode 
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-200' 
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black font-mono uppercase tracking-widest px-2 py-0.5 bg-rose-600 text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        SPECIAL EDITION
                      </span>
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-rose-400">
                        REF: FIGHT CLUB (1999)
                      </span>
                    </div>
                    <div className="text-xs font-mono font-medium leading-relaxed">
                      <span className="font-bold uppercase tracking-wider text-rose-300">Paper Street Soap Co. Edition</span> — Sculpted in homage to Tyler Durden's iconic pink soap bar from the 1999 cult classic film.
                    </div>
                    <div className="mt-2 text-[10px] font-mono opacity-80 italic border-t border-rose-500/20 pt-1.5">
                      "The first rule of Fight Club is: you do not talk about Fight Club."
                    </div>
                  </div>
                )}
                
                <div className="text-[11px] font-mono-tech uppercase tracking-widest pt-1 flex items-center gap-2">
                  {isOutOfStock ? (
                    <span className="text-red-500 font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      OUT OF STOCK
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      IN STOCK ({activeStock} UNITS)
                    </span>
                  )}
                  <span className="text-slate-600">·</span>
                  <span className={isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'}>SHIPS IN 3-5 DAYS</span>
                </div>
              </div>

              {/* Price */}
              <div className={`text-2xl sm:text-3xl font-extrabold font-mono-tech tracking-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <PriceDisplay 
                  amount={unitPrice} 
                  usdClassName={isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'}
                />
              </div>

              {/* Color Swatch Variant Selector */}
              <div className="space-y-3 pt-2">
                <div className={`text-xs font-mono-tech uppercase tracking-widest flex items-center justify-between ${
                  isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
                }`}>
                  <span>AVAILABLE COLOURS</span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {selectedColor?.name} {isOutOfStock ? '(OUT OF STOCK)' : `(${activeStock} left)`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorsList.map((col) => {
                    const isSelected = selectedColorName === col.name;
                    const colStock = col.stock;
                    const colOutOfStock = colStock <= 0;

                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => {
                          setSelectedColorName(col.name);
                          setQuantity(1);
                        }}
                        className={`flex items-center gap-2.5 px-3.5 py-2 border text-xs font-mono-tech uppercase font-bold tracking-wider cursor-pointer transition-all relative ${
                          colOutOfStock ? 'opacity-60' : ''
                        } ${
                          isSelected
                            ? (isDarkMode 
                                ? 'bg-white text-black border-white ring-1 ring-white' 
                                : 'bg-slate-900 text-white border-slate-900 ring-1 ring-slate-900')
                            : (isDarkMode 
                                ? 'bg-black text-white border-[#2c2c2e] hover:border-white' 
                                : 'bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-900')
                        }`}
                      >
                        <span 
                          className="w-3 h-3 rounded-full border border-black/30 shrink-0 inline-block shadow-sm"
                          style={{ backgroundColor: col.hexColor || '#333333' }}
                        />
                        <span>{col.name}</span>
                        {colOutOfStock && (
                          <span className="text-[9px] px-1 bg-red-600/80 text-white rounded">
                            0
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & Add to Cart Controls */}
              <div className="flex items-center gap-3 font-mono-tech pt-2">
                {/* Quantity Controls */}
                <div className={`flex items-center border ${
                  isDarkMode ? 'border-[#2c2c2e] bg-[#000000] text-white' : 'border-slate-300 bg-slate-100 text-slate-900'
                }`}>
                  <button
                    disabled={isOutOfStock || quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`px-3.5 py-3 transition-colors text-sm font-bold ${
                      isOutOfStock ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'
                    }`}
                  >
                    -
                  </button>
                  <span className="px-4 py-3 text-xs font-bold w-10 text-center">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <button
                    disabled={isOutOfStock || quantity >= activeStock}
                    onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                    className={`px-3.5 py-3 transition-colors text-sm font-bold ${
                      isOutOfStock || quantity >= activeStock ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'
                    }`}
                  >
                    +
                  </button>
                </div>

                {/* Add To Cart Button */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAdd}
                  className={`flex-1 py-3.5 px-6 border text-xs font-mono-tech uppercase font-bold tracking-widest transition-all transform active:scale-95 ${
                    isOutOfStock
                      ? 'bg-red-600/20 text-red-400 border-red-500/40 cursor-not-allowed'
                      : isFlashing
                      ? 'bg-emerald-500 text-black border-emerald-500 scale-95 shadow-lg shadow-emerald-500/50'
                      : (isDarkMode ? 'bg-white text-black border-white hover:bg-[#e5e5ea] cursor-pointer' : 'bg-slate-900 text-white border-slate-900 hover:bg-black cursor-pointer')
                  }`}
                >
                  {isOutOfStock ? 'OUT OF STOCK' : isFlashing ? '✓ ADDED!' : 'ADD TO CART'}
                </button>

                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={async () => {
                    if (product) await toggleWishlist(product.id);
                  }}
                  title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  className={`p-3.5 border transition-all cursor-pointer flex items-center justify-center ${
                    isWishlisted
                      ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20'
                      : (isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-slate-100')
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Inline Added to Cart Alert Banner */}
              {lastAddedInfo && (
                <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono-tech animate-in fade-in slide-in-from-top-2 duration-200 ${
                  isDarkMode 
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold block">✓ Item Added to Cart!</span>
                      <span className={`text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {lastAddedInfo.qty}x {lastAddedInfo.productName} ({lastAddedInfo.color})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenCart) onOpenCart();
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all shrink-0 cursor-pointer shadow-md ${
                      isDarkMode 
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                        : 'bg-emerald-700 text-white hover:bg-emerald-800'
                    }`}
                  >
                    VIEW CART ({cartCount}) →
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className={`border-t ${isDarkMode ? 'border-[#1c1c1e]' : 'border-slate-200'}`}></div>

              {/* Description Section */}
              <div className="space-y-3 font-mono-tech">
                <div className={`text-xs uppercase tracking-widest ${isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'}`}>
                  / DESCRIPTION
                </div>
                <p className={`text-sm leading-relaxed font-sans-clean ${
                  isDarkMode ? 'text-[#d1d1d6]' : 'text-slate-700'
                }`}>
                  {product.description}
                </p>

                {/* Disclaimer Callout Banner */}
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  isDarkMode 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="font-mono-tech text-[11px] leading-snug">
                    <span className="font-bold uppercase tracking-wider block text-amber-400">NOTE / DISCLAIMER</span>
                    <span className="opacity-90">Lighter is not included. This item is a protective 3D printed sleeve/case only.</span>
                  </div>
                </div>
              </div>

              {/* Specs Section if available */}
              {product.specs && (
                <div className="space-y-2 font-mono-tech text-xs pt-2">
                  <div className={`text-xs uppercase tracking-widest mb-2 ${isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'}`}>
                    / TECHNICAL SPECS
                  </div>
                  <div className={`p-3 rounded border space-y-1.5 ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className={`border-t ${isDarkMode ? 'border-[#1c1c1e]' : 'border-slate-200'}`}></div>

              {/* Availability Table */}
              <div className="space-y-3 font-mono-tech text-xs">
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-[#8e8e93] uppercase tracking-widest' : 'text-slate-500 uppercase tracking-widest'}>COLOR STOCK</span>
                  <span className={`font-bold ${isOutOfStock ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isOutOfStock ? '0 Available' : `${activeStock} Available`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-[#8e8e93] uppercase tracking-widest' : 'text-slate-500 uppercase tracking-widest'}>SHIPPING</span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Worldwide</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
