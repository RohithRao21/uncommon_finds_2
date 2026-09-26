import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { PriceDisplay } from './PriceDisplay';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';

interface WishlistPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenShop: () => void;
  currencySymbol: string;
  isDarkMode: boolean;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  products,
  onSelectProduct,
  onOpenShop,
  currencySymbol,
  isDarkMode,
}) => {
  const { wishlistItems, removeFromWishlist, wishlistCount, isLoadingWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Match wishlisted IDs with product objects from catalog
  const wishlistedProducts = products.filter((p) =>
    wishlistItems.some((item) => item.productId === p.id)
  );

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const defaultColor = product.colors && product.colors.length > 0
      ? product.colors[0].name
      : product.availableMaterials && product.availableMaterials.length > 0
      ? product.availableMaterials[0].name
      : 'Default';

    const defaultPrice = product.price;
    const defaultImage = product.image || (product.colors && product.colors[0]?.images[0]) || '';

    addToCart({
      productId: product.id,
      productName: product.name,
      selectedColor: defaultColor,
      quantity: 1,
      price: defaultPrice,
      image: defaultImage,
      product: product,
    });
  };

  const handleRemove = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    await removeFromWishlist(productId);
  };

  return (
    <div className={`min-h-[80vh] py-12 px-6 lg:px-10 max-w-7xl mx-auto font-mono-tech ${
      isDarkMode ? 'text-[#f2f2f7]' : 'text-slate-900'
    }`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b pb-6 mb-8 gap-4 border-slate-200 dark:border-[#1c1c1e]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 mb-1">
            <Heart className="w-4 h-4 fill-current" />
            <span>SAVED ITEMS ({wishlistCount})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
            MY WISHLIST
          </h1>
        </div>

        {wishlistedProducts.length > 0 && (
          <button
            onClick={onOpenShop}
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
            }`}
          >
            <span>CONTINUE SHOPPING</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoadingWishlist && wishlistedProducts.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="animate-pulse bg-slate-800/20 aspect-square rounded-xl"></div>
          ))}
        </div>
      ) : wishlistedProducts.length === 0 ? (
        /* Empty State */
        <div className={`py-20 px-6 rounded-2xl border text-center max-w-xl mx-auto my-12 flex flex-col items-center justify-center ${
          isDarkMode ? 'bg-[#0c0c0e] border-[#1c1c1e]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 border border-red-500/20 shadow-inner">
            <Heart className="w-8 h-8 fill-red-500/20" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-2">
            YOUR WISHLIST IS EMPTY
          </h2>
          <p className={`text-xs max-w-md mx-auto mb-6 leading-relaxed ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Save your favorite 3D-printed EDC gear, mechanical lighters, desk setup accessories, and custom builds to easily view or order them later.
          </p>
          <button
            onClick={onOpenShop}
            className="px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-red-500/20 flex items-center gap-2 rounded-none"
          >
            <Sparkles className="w-4 h-4" />
            <span>EXPLORE CATALOG</span>
          </button>
        </div>
      ) : (
        /* Wishlist Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistedProducts.map((product) => {
            const isOutOfStock = product.colors
              ? product.colors.every((c) => c.stock <= 0)
              : product.inStock === false;

            const wishlistItem = wishlistItems.find((w) => w.productId === product.id);
            const addedDate = wishlistItem?.addedAt
              ? new Date(wishlistItem.addedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              : null;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className={`group relative border transition-all duration-300 cursor-pointer flex flex-col ${
                  isDarkMode 
                    ? 'bg-[#0c0c0e] border-[#1c1c1e] hover:border-slate-700' 
                    : 'bg-white border-slate-200 hover:border-slate-400'
                }`}
              >
                {/* Image Stage */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#e5e5e7]">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.dataset.failed) return;
                      target.dataset.failed = 'true';
                      const defaultImg = product.id.includes('ripple') ? PRODUCTS[1].image : PRODUCTS[0].image;
                      if (target.src !== defaultImg) {
                        target.src = defaultImg;
                      }
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Out of Stock Badge */}
                  {isOutOfStock && (
                    <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                      OUT OF STOCK
                    </div>
                  )}

                  {/* Remove Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, product.id)}
                    title="Remove from wishlist"
                    className="absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-black/60 border border-white/20 text-red-400 hover:text-white hover:bg-red-600 transition-all cursor-pointer shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {addedDate && (
                    <div className="absolute bottom-2 left-2.5 z-10 text-[9px] font-mono tracking-wider px-2 py-0.5 bg-black/70 backdrop-blur-sm text-slate-300 rounded-sm">
                      SAVED {addedDate.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      {product.category}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <h3 className="font-bold text-sm tracking-tight truncate">
                        {product.name}
                      </h3>
                      {(product.isSpecialEdition || product.id === 'soap-bar-lighter-sleeve' || product.slug?.includes('soap')) && (
                        <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
                          SPECIAL EDITION
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm mb-4">
                      <PriceDisplay amount={product.price} />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => handleAddToCart(e, product)}
                      className={`flex-1 py-2.5 px-3 text-[11px] font-mono-tech uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        isOutOfStock
                          ? 'bg-red-600/20 text-red-400 border border-red-500/40 cursor-not-allowed'
                          : isDarkMode
                          ? 'bg-white text-black hover:bg-[#e5e5ea] cursor-pointer'
                          : 'bg-slate-900 text-white hover:bg-black cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
