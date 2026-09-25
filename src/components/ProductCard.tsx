import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Product, MaterialType } from '../types';
import { PriceDisplay } from './PriceDisplay';
import { useWishlist } from '../context/WishlistContext';
import { PRODUCTS } from '../data/products';

interface ProductCardProps {
  product: Product;
  index?: number;
  onSelectProduct: (product: Product) => void;
  onQuickAdd?: (product: Product, selectedMaterial: MaterialType) => void;
  currencySymbol: string;
  isDarkMode: boolean;
  isFeatured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 1,
  onSelectProduct,
  currencySymbol,
  isDarkMode,
}) => {
  const [activeImageOverride, setActiveImageOverride] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  const formattedIndex = index < 10 ? `0${index}` : `${index}`;

  const activeImage = activeImageOverride || (isHovered && product.secondaryImage ? product.secondaryImage : product.image);
  const isAllOutOfStock = product.colors 
    ? product.colors.every(c => c.stock <= 0)
    : product.inStock === false;

  const colorVariants = product.colors && product.colors.length > 0
    ? product.colors.map(c => ({
        id: c.name,
        name: c.name,
        stock: c.stock,
        hexColor: c.hexColor || '#333333',
        image: c.images && c.images[0] ? c.images[0] : product.image
      }))
    : product.availableMaterials?.map(m => ({
        id: m.id,
        name: m.name,
        stock: 10,
        hexColor: m.hexColor,
        image: m.image
      })) || [];

  return (
    <div
      onClick={() => onSelectProduct(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveImageOverride(null);
      }}
      className="group relative transition-all duration-300 cursor-pointer flex flex-col font-mono-tech"
    >
      {/* Square Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#e5e5e7] mb-3">
        {/* Top-Left Number Badge & Special Edition Marking */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
          <div className="px-2 py-1 bg-[#1c1c1e] text-[#f2f2f7] text-[10px] font-bold font-mono tracking-wider">
            {formattedIndex}
          </div>
          {(product.isSpecialEdition || product.id === 'soap-bar-lighter-sleeve' || product.slug.includes('soap')) && (
            <div className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-extrabold font-mono tracking-wider uppercase shadow-md flex items-center gap-1 border border-pink-300/40">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              SPECIAL EDITION
            </div>
          )}
        </div>

        {/* Wishlist Heart Icon Button (Top-Right) */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute ${isAllOutOfStock ? 'top-10' : 'top-2.5'} right-2.5 z-20 p-2 rounded-full backdrop-blur-md border transition-all duration-200 cursor-pointer ${
            isWishlisted
              ? 'bg-red-500/90 border-red-400 text-white shadow-lg shadow-red-500/30 scale-105'
              : 'bg-black/40 border-white/20 text-white hover:bg-black/70 hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        <img
          src={activeImage}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
            isAllOutOfStock ? 'grayscale opacity-75' : ''
          }`}
        />

        {/* Color swatches overlay on bottom left of card image on hover */}
        {colorVariants.length > 0 && (
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 p-1 bg-black/70 backdrop-blur-sm border border-white/10 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {colorVariants.map((mat) => (
              <span
                key={mat.id}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  if (mat.image) setActiveImageOverride(mat.image);
                }}
                className={`w-3.5 h-3.5 rounded-full border border-white/40 cursor-pointer hover:scale-125 transition-transform inline-block relative ${
                  mat.stock <= 0 ? 'opacity-40' : ''
                }`}
                style={{ backgroundColor: mat.hexColor }}
                title={`${mat.name} (${mat.stock > 0 ? `${mat.stock} in stock` : 'Out of stock'})`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Name & Price Row */}
      <div className="flex items-center justify-between text-sm sm:text-base font-bold font-mono-tech pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`transition-colors tracking-tight ${
            isDarkMode ? 'text-[#ffffff] group-hover:text-[#a1a1a6]' : 'text-slate-900 group-hover:text-slate-600'
          }`}>
            {product.name}
          </span>
          {(product.isSpecialEdition || product.id === 'soap-bar-lighter-sleeve' || product.slug.includes('soap')) && (
            <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
              FIGHT CLUB
            </span>
          )}
        </div>
        <div className={`tracking-tight font-extrabold ml-4 shrink-0 ${
          isDarkMode ? 'text-[#ffffff]' : 'text-slate-900'
        }`}>
          <PriceDisplay 
            amount={product.price} 
            usdClassName={isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'}
          />
        </div>
      </div>

      {/* Fight Club Special Edition Micro Reference */}
      {(product.isSpecialEdition || product.id === 'soap-bar-lighter-sleeve' || product.slug.includes('soap')) && (
        <div className="flex items-center gap-1 text-[10px] font-mono tracking-wider text-rose-400/90 pt-0.5">
          <span className="text-rose-500">★</span>
          <span>{product.specialEditionReference || 'FIGHT CLUB (1999) • PAPER STREET SOAP CO.'}</span>
        </div>
      )}
    </div>
  );
};



