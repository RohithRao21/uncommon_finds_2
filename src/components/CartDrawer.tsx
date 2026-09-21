import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Truck, Cpu, Check, AlertCircle } from 'lucide-react';
import { PriceDisplay } from './PriceDisplay';
import { formatINR } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (appliedDiscount: number) => void;
  currencySymbol: string;
  isDarkMode: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
  currencySymbol,
  isDarkMode,
}) => {
  const {
    cartItems,
    cartCount,
    subtotal,
    shippingCost,
    estimatedTotal,
    amountNeededForFreeShipping,
    freeShippingProgress,
    stockError,
    clearStockError,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'FORMA10') {
      setDiscountAmount(10);
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid code. Try "FORMA10" for ₹10 off.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      
      {/* Overlay Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className={`relative w-full max-w-md h-full flex flex-col z-10 shadow-2xl transition-all border-l ${
        isDarkMode ? 'bg-[#0e1014] border-white/15 text-white' : 'bg-white border-black/15 text-slate-900'
      }`}>
        
        {/* Drawer Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-white/10 bg-black/40 text-white' : 'border-slate-200 bg-slate-100 text-slate-900'
        }`}>
          <div className="flex items-center gap-2">
            <ShoppingBag className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
            <h2 className="font-display font-bold text-lg">PRINT QUEUE CART</h2>
            <span className={`px-2 py-0.5 rounded-full font-mono-tech text-xs font-bold ${
              isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {cartCount} ITEMS
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stock Error Notice */}
        {stockError && (
          <div className="px-6 py-2.5 bg-amber-500/20 border-b border-amber-500/40 text-amber-300 font-mono-tech text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{stockError}</span>
            </div>
            <button onClick={clearStockError} className="p-0.5 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Free Shipping Progress Bar */}
        <div className={`px-6 py-3 border-b font-mono-tech text-xs ${
          isDarkMode ? 'border-white/10 bg-black/20 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
        }`}>
          <div className="flex justify-between items-center mb-1 text-[11px]">
            <span className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <Truck className={`w-3.5 h-3.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
              <span>EXPRESS AIR SHIPPING</span>
            </span>
            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {amountNeededForFreeShipping === 0
                ? 'FREE SHIPPING UNLOCKED!'
                : `ADD ${formatINR(amountNeededForFreeShipping)} FOR FREE`}
            </span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div
              className={`h-full transition-all duration-500 ${
                isDarkMode ? 'bg-white' : 'bg-slate-900'
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${
                isDarkMode ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                <Cpu className={`w-8 h-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} />
              </div>
              <div>
                <h3 className={`font-display font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Your Print Queue is Empty
                </h3>
                <p className={`text-xs font-sans-clean mt-1 max-w-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Explore our precision 3D-printed EDC gear, desk mounts, and architectural sculptures.
                </p>
              </div>
              <button
                onClick={onClose}
                className={`px-6 py-2.5 rounded-xl font-mono-tech text-xs font-bold transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-white text-black hover:bg-slate-200' 
                    : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                BROWSE CATALOG
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemPrice = item.price || item.unitPrice || 0;
              const itemImage = item.image || item.product?.image || '';
              const itemName = item.productName || item.product?.name || '3D Printed Component';
              const maxStock = typeof item.maxStock === 'number' ? item.maxStock : 99;
              const isAtMaxStock = item.quantity >= maxStock;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex gap-3.5 items-start relative group transition-all ${
                    isDarkMode 
                      ? 'bg-black/30 border-white/10 hover:border-white/20' 
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Item Thumbnail */}
                  {itemImage ? (
                    <img
                      src={itemImage}
                      alt={itemName}
                      className={`w-16 h-16 rounded-lg object-cover shrink-0 border ${
                        isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-slate-200 border-slate-300'
                      }`}
                      onError={(e) => {
                        const t = e.currentTarget;
                        if (t.dataset.hasError) return;
                        t.dataset.hasError = 'true';
                        const defaultImg = (item.productId || '').includes('ripple') ? PRODUCTS[1].image : PRODUCTS[0].image;
                        if (t.src !== defaultImg) {
                          t.src = defaultImg;
                        }
                      }}
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-lg shrink-0 border flex items-center justify-center font-mono-tech text-xs font-bold ${
                      isDarkMode ? 'bg-slate-900 border-white/10 text-slate-500' : 'bg-slate-200 border-slate-300 text-slate-600'
                    }`}>
                      3D
                    </div>
                  )}

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-display font-bold text-sm truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {itemName}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 text-[9px] font-mono-tech">
                      <span className={`px-1.5 py-0.2 rounded ${
                        isDarkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        COLOR: {item.selectedColor || item.selectedMaterial}
                      </span>
                      {item.selectedLayerHeight && (
                        <span className={`px-1.5 py-0.2 rounded ${
                          isDarkMode ? 'bg-white/10 text-slate-200' : 'bg-slate-200 text-slate-800'
                        }`}>
                          RES: {item.selectedLayerHeight}
                        </span>
                      )}
                      {item.customEngraving && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-700 dark:text-amber-300">
                          ENGRAVED: "{item.customEngraving}"
                        </span>
                      )}
                      {maxStock < 99 && (
                        <span className={`px-1.5 py-0.2 rounded ${
                          isAtMaxStock 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {maxStock} IN STOCK
                        </span>
                      )}
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="pt-2 flex items-center justify-between">
                      <div className={`flex items-center border rounded-md p-0.5 font-mono-tech text-xs ${
                        isDarkMode ? 'border-white/20 bg-black/60 text-white' : 'border-slate-300 bg-white text-slate-900'
                      }`}>
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer ${
                            isDarkMode ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold">{item.quantity}</span>
                        <button
                          disabled={isAtMaxStock}
                          onClick={() => increaseQuantity(item.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center ${
                            isAtMaxStock 
                              ? 'opacity-30 cursor-not-allowed' 
                              : 'cursor-pointer hover:bg-white/10 text-slate-300'
                          }`}
                          title={isAtMaxStock ? `Max stock (${maxStock}) reached` : 'Increase quantity'}
                        >
                          +
                        </button>
                      </div>

                      <div className={`font-mono-tech text-sm font-bold ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        <PriceDisplay 
                          amount={itemPrice * item.quantity} 
                          usdClassName={isDarkMode ? 'text-slate-400' : 'text-slate-500'}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className={`p-6 border-t space-y-4 ${
            isDarkMode ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-100'
          }`}>
            
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo Code (Try 'FORMA10')"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-mono-tech uppercase outline-none focus:border-slate-400 ${
                  isDarkMode 
                    ? 'bg-black/60 border-white/15 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <button
                type="submit"
                className={`px-3 py-1.5 rounded-lg font-mono-tech text-xs cursor-pointer ${
                  isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                }`}
              >
                APPLY
              </button>
            </form>

            {promoApplied && (
              <div className="text-[10px] font-mono-tech text-emerald-500 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>PROMO APPLIED: DISCOUNT ACTIVE</span>
              </div>
            )}
            {promoError && (
              <div className="text-[10px] font-mono-tech text-rose-500">
                {promoError}
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 font-mono-tech text-xs">
              <div className={`flex justify-between items-center ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>SUBTOTAL</span>
                <PriceDisplay amount={subtotal} usdClassName={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-500">
                  <span>PROMO DISCOUNT</span>
                  <span>-<PriceDisplay amount={discountAmount} usdClassName="text-emerald-400" /></span>
                </div>
              )}
              <div className={`flex justify-between items-center ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>ESTIMATED SHIPPING</span>
                <span>
                  {amountNeededForFreeShipping === 0 ? 'FREE' : <PriceDisplay amount={shippingCost} usdClassName={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />}
                </span>
              </div>
              <div className={`flex justify-between items-center text-sm font-bold pt-2 border-t ${
                isDarkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'
              }`}>
                <span>TOTAL</span>
                <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                  <PriceDisplay 
                    amount={finalTotal + shippingCost} 
                    usdClassName={isDarkMode ? 'text-slate-400' : 'text-slate-600'}
                  />
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => onProceedToCheckout(discountAmount)}
              className={`w-full py-3.5 rounded-xl font-mono-tech font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
                isDarkMode ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'
              }`}
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className={`text-[10px] font-mono-tech text-center flex items-center justify-center gap-1 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-500'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>SECURE ENCRYPTED 3D PRINT LAB CHECKOUT</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

