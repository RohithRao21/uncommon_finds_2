import React, { useEffect } from 'react';
import { CheckCircle2, ShoppingBag, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';

interface CartToastNotificationProps {
  onOpenCart: () => void;
  isDarkMode: boolean;
}

export const CartToastNotification: React.FC<CartToastNotificationProps> = ({ onOpenCart, isDarkMode }) => {
  const { toastAlert, dismissToastAlert, cartCount } = useCart();

  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => {
        dismissToastAlert();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toastAlert, dismissToastAlert]);

  if (!toastAlert) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className={`p-4 rounded-2xl border shadow-2xl flex items-center gap-3 backdrop-blur-xl ${
        isDarkMode 
          ? 'bg-black/90 border-emerald-500/50 text-white shadow-emerald-950/30' 
          : 'bg-white/95 border-emerald-500/60 text-slate-900 shadow-slate-300'
      }`}>
        
        {/* Product Thumbnail or Check Icon */}
        {toastAlert.image ? (
          <div className="relative shrink-0">
            <img 
              src={toastAlert.image} 
              alt={toastAlert.productName} 
              onError={(e) => {
                const target = e.currentTarget;
                if (target.dataset.failed) return;
                target.dataset.failed = 'true';
                const defaultImg = (toastAlert.productName || '').toLowerCase().includes('ripple') ? PRODUCTS[1].image : PRODUCTS[0].image;
                if (target.src !== defaultImg) {
                  target.src = defaultImg;
                }
              }}
              className="w-12 h-12 rounded-xl object-cover border border-white/20 bg-slate-800"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black rounded-full p-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 font-mono-tech">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            <ShoppingBag className="w-3 h-3" />
            <span>ADDED TO CART!</span>
          </div>
          <p className="text-xs font-bold truncate mt-0.5">
            {toastAlert.quantity}x {toastAlert.productName}
          </p>
          {toastAlert.selectedColor && (
            <p className={`text-[10px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Color: {toastAlert.selectedColor}
            </p>
          )}
        </div>

        {/* Action button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              dismissToastAlert();
              onOpenCart();
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 font-mono-tech text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-md"
          >
            <span>VIEW CART ({cartCount})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          
          <button
            onClick={dismissToastAlert}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
