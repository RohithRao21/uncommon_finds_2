import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Cpu, CreditCard, Truck, ArrowRight, Printer, Sparkles, RefreshCw, MapPin, Plus, Star, Phone } from 'lucide-react';
import { CartItem, Address } from '../types';
import { PriceDisplay } from './PriceDisplay';
import { formatINR, formatUSD } from '../utils/currency';
import { User, db, collection, addDoc, serverTimestamp } from '../lib/firebase';
import { useCart } from '../context/CartContext';
import { useAddress } from '../context/AddressContext';
import { AddressFormModal } from './AddressFormModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems?: CartItem[];
  discountAmount: number;
  onClearCart?: () => void;
  currencySymbol: string;
  isDarkMode: boolean;
  currentUser?: User | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems: propCartItems,
  discountAmount,
  onClearCart,
  currencySymbol,
  isDarkMode,
  currentUser,
}) => {
  const { cartItems: contextCartItems, clearCart: contextClearCart } = useCart();
  const { addresses, defaultAddress, validatePincode } = useAddress();
  const cartItems = propCartItems || contextCartItems;
  const clearCart = onClearCart || contextClearCart;

  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isCustomAddressMode, setIsCustomAddressMode] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [shippingError, setShippingError] = useState<string>('');

  const [formData, setFormData] = useState({
    name: currentUser?.displayName || 'Rahul Sharma',
    email: currentUser?.email || 'rahul.sharma@voxelform.in',
    phone: '+91 9876543210',
    address: 'Flat 302, Cyber Heights, MG Road',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    zip: '560001',
    cardNumber: '•••• •••• •••• 4242',
  });

  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setShippingError('');
    }
  }, [isOpen]);

  // Sync selected address with addresses list or default address
  useEffect(() => {
    if (addresses.length > 0 && !isCustomAddressMode) {
      const active = addresses.find((a) => a.id === selectedAddressId) || defaultAddress || addresses[0];
      if (active) {
        setSelectedAddressId(active.id);
        setFormData((prev) => ({
          ...prev,
          name: active.fullName || prev.name,
          phone: active.phone || prev.phone,
          address: active.addressLine1 || prev.address,
          addressLine2: active.addressLine2 || '',
          city: active.city || prev.city,
          state: active.state || prev.state,
          country: active.country || 'India',
          zip: active.pincode || prev.zip,
        }));
      }
    }
  }, [addresses, defaultAddress, selectedAddressId, isCustomAddressMode]);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName || prev.name,
        email: currentUser.email || prev.email,
      }));
    }
  }, [currentUser]);

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setIsCustomAddressMode(false);
    setShippingError('');
    setFormData((prev) => ({
      ...prev,
      name: addr.fullName,
      phone: addr.phone,
      address: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      country: addr.country || 'India',
      zip: addr.pincode,
    }));
  };

  const handleProceedToPayment = () => {
    setShippingError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.address.trim() || !formData.city.trim() || !formData.zip.trim()) {
      setShippingError('Please fill in all required shipping fields.');
      return;
    }

    // Validate Indian pincode
    const pinCheck = validatePincode(formData.zip);
    if (!pinCheck.isValid) {
      setShippingError(pinCheck.message || 'Please enter a valid 6-digit Indian Pincode.');
      return;
    }

    setStep('payment');
  };

  const [jobId, setJobId] = useState('');
  const [simulatedLayer, setSimulatedLayer] = useState(12);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || item.unitPrice || 0) * item.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount);

  const handleCompleteOrder = async () => {
    const generatedJobId = `JOB-X1C-${Math.floor(1000 + Math.random() * 9000)}`;
    setJobId(generatedJobId);

    // Save order to Firestore
    try {
      await addDoc(collection(db, 'orders'), {
        userId: currentUser?.uid || 'guest',
        userEmail: formData.email,
        userName: formData.name,
        items: cartItems.map(item => ({
          name: item.productName || item.product?.name || '3D Print Component',
          quantity: item.quantity,
          unitPrice: item.price || item.unitPrice || 0,
          selectedMaterial: item.selectedColor || item.selectedMaterial || 'Default',
        })),
        totalINR: total,
        status: 'DISPATCHED',
        createdAt: new Date().toISOString(),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
        }
      });
    } catch (err) {
      console.error('Failed to record order to Firestore:', err);
    }

    setStep('confirmation');
    clearCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col ${
        isDarkMode ? 'bg-[#0f1115] border-white/15 text-white' : 'bg-white border-black/15 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-white/10 bg-black/40 text-white' : 'border-slate-200 bg-slate-100 text-slate-900'
        }`}>
          <div className="flex items-center gap-2 font-mono-tech text-xs">
            <Cpu className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
            <span className="font-bold">FORMA PRINT LAB CHECKOUT</span>
          </div>
          {step !== 'confirmation' && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-black hover:bg-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className={`px-6 py-2.5 border-b font-mono-tech text-[10px] flex items-center justify-between ${
          isDarkMode ? 'border-white/10 bg-black/20 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}>
          <span className={step === 'details' ? (isDarkMode ? 'text-white font-bold' : 'text-slate-900 font-bold') : ''}>1. SHIPPING</span>
          <span>→</span>
          <span className={step === 'payment' ? (isDarkMode ? 'text-white font-bold' : 'text-slate-900 font-bold') : ''}>2. PAYMENT</span>
          <span>→</span>
          <span className={step === 'confirmation' ? 'text-emerald-500 font-bold' : ''}>3. LIVE PRINT STATUS</span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          
          {/* STEP 1: Shipping Details */}
          {step === 'details' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className={`font-display font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Shipping Address
                </h3>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="px-2.5 py-1 rounded bg-red-500 hover:bg-red-600 text-white font-mono-tech font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-red-500/20"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ADD ADDRESS</span>
                  </button>
                )}
              </div>

              {shippingError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono-tech text-xs flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" />
                  <span>{shippingError}</span>
                </div>
              )}

              {/* Saved Addresses Selector */}
              {addresses.length > 0 && (
                <div className="space-y-2 font-mono-tech">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    SAVED ADDRESSES ({addresses.length})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {addresses.map((addr) => {
                      const isSelected = !isCustomAddressMode && selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-xs relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-red-500 bg-red-500/10 text-white shadow-md shadow-red-500/10'
                              : isDarkMode
                              ? 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-400'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold uppercase tracking-wide truncate max-w-[140px]">
                                {addr.fullName}
                              </span>
                              {addr.isDefault && (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-red-500 text-white">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] opacity-80 truncate">{addr.addressLine1}</p>
                            <p className="text-[10px] opacity-80">
                              {addr.city}, {addr.pincode}
                            </p>
                          </div>
                          <div className="mt-2 text-[9px] opacity-60 font-mono flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{addr.phone}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsCustomAddressMode(!isCustomAddressMode)}
                      className="text-[10px] text-slate-400 hover:text-white underline font-bold uppercase cursor-pointer"
                    >
                      {isCustomAddressMode ? '← USE SAVED ADDRESS' : '+ ENTER A DIFFERENT ADDRESS'}
                    </button>
                  </div>
                </div>
              )}

              {/* Address Input Form */}
              {(addresses.length === 0 || isCustomAddressMode) && (
                <div className="space-y-3 font-mono-tech text-xs">
                  <div>
                    <label className={`block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>FULL NAME *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border outline-none transition-colors ${
                        isDarkMode 
                          ? 'bg-black/60 border-white/15 text-white focus:border-slate-400' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 focus:bg-white'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>EMAIL *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border outline-none transition-colors ${
                          isDarkMode 
                            ? 'bg-black/60 border-white/15 text-white focus:border-slate-400' 
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 focus:bg-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>PHONE NUMBER *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border outline-none transition-colors ${
                          isDarkMode 
                            ? 'bg-black/60 border-white/15 text-white focus:border-slate-400' 
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 focus:bg-white'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>STREET ADDRESS *</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat 302, Cyber Heights, MG Road"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border outline-none transition-colors ${
                        isDarkMode 
                          ? 'bg-black/60 border-white/15 text-white focus:border-slate-400' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 focus:bg-white'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>CITY / TOWN *</label>
                      <input
                        type="text"
                        required
                        placeholder="Bengaluru"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl border outline-none transition-colors ${
                          isDarkMode 
                            ? 'bg-black/60 border-white/15 text-white focus:border-slate-400' 
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 focus:bg-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>INDIAN PINCODE * (6 DIGITS)</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="560001"
                        value={formData.zip}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setFormData({ ...formData, zip: val });
                          setShippingError('');
                        }}
                        className={`w-full px-3 py-2 rounded-xl border outline-none font-mono tracking-widest transition-colors ${
                          isDarkMode 
                            ? 'bg-black/60 border-white/15 text-white focus:border-slate-400' 
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900 focus:bg-white'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className={`px-6 py-3 rounded-xl font-mono-tech font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                    isDarkMode 
                      ? 'bg-white text-black hover:bg-slate-200' 
                      : 'bg-slate-900 text-white hover:bg-black'
                  }`}
                >
                  <span>CONTINUE TO PAYMENT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Add Address Modal */}
              <AddressFormModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                isDarkMode={isDarkMode}
                onSaved={(newId) => {
                  setSelectedAddressId(newId);
                  setIsCustomAddressMode(false);
                }}
              />
            </div>
          )}

          {/* STEP 2: Payment Simulation */}
          {step === 'payment' && (
            <div className="space-y-4">
              <h3 className={`font-display font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Payment Method
              </h3>
              
              <div className={`p-4 rounded-xl border space-y-3 font-mono-tech text-xs ${
                isDarkMode ? 'bg-black/40 border-white/15' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`flex items-center justify-between ${isDarkMode ? 'text-white' : 'text-slate-900 font-bold'}`}>
                  <span className="font-bold">CREDIT CARD / APPLE PAY / UPI</span>
                  <CreditCard className="w-4 h-4" />
                </div>

                <div>
                  <label className={`block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>CARD NUMBER</label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border outline-none transition-colors ${
                      isDarkMode 
                        ? 'bg-black/60 border-white/15 text-white focus:border-slate-400' 
                        : 'bg-white border-slate-300 text-slate-900 focus:border-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>EXPIRY</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      className={`w-full px-3 py-2 rounded-xl border outline-none ${
                        isDarkMode ? 'bg-black/60 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>CVC</label>
                    <input
                      type="text"
                      defaultValue="888"
                      className={`w-full px-3 py-2 rounded-xl border outline-none ${
                        isDarkMode ? 'bg-black/60 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Order Total Review */}
              <div className={`p-3 rounded-xl border font-mono-tech text-xs flex justify-between items-center ${
                isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
              }`}>
                <span>TOTAL DUE NOW:</span>
                <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <PriceDisplay amount={total} usdClassName={isDarkMode ? 'text-slate-300' : 'text-slate-500'} />
                </span>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => setStep('details')}
                  className={`px-4 py-2.5 rounded-xl border font-mono-tech text-xs cursor-pointer ${
                    isDarkMode ? 'border-white/20 text-slate-300 hover:text-white' : 'border-slate-300 text-slate-700 hover:text-black'
                  }`}
                >
                  BACK
                </button>
                <button
                  onClick={handleCompleteOrder}
                  className={`px-6 py-3 rounded-xl font-mono-tech font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xl ridge-button ${
                    isDarkMode ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AUTHORIZE & DISPATCH PRINT ({formatINR(total)} / ~{formatUSD(total)})</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Live Order Confirmation & Print Status Simulator */}
          {step === 'confirmation' && (
            <div className="space-y-6 text-center py-4">
              
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className={`px-3 py-1 rounded-full font-mono-tech text-xs font-bold ${
                  isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900'
                }`}>
                  PRINT JOB DISPATCHED
                </span>
                <h3 className={`font-display font-bold text-2xl mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Order Dispatched to Bambu Lab X1C Array!
                </h3>
                <p className={`text-xs font-sans-clean mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Thank you, {formData.name}. Confirmation sent to <span className={isDarkMode ? 'text-white font-bold' : 'text-slate-900 font-bold'}>{formData.email}</span>.
                </p>
              </div>

              {/* Live Print Progress Simulator Box */}
              <div className={`p-5 rounded-2xl border text-left space-y-4 font-mono-tech text-xs ${
                isDarkMode ? 'bg-black/60 border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}>
                
                <div className={`flex justify-between items-center border-b pb-3 ${
                  isDarkMode ? 'border-white/10' : 'border-slate-200'
                }`}>
                  <div>
                    <span className={`block text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>PRINT JOB ID</span>
                    <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{jobId}</span>
                  </div>
                  <div className="text-right">
                    <span className={`block text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ASSIGNED PRINTER</span>
                    <span className="font-bold text-emerald-500">Bambu Lab X1C #09</span>
                  </div>
                </div>

                {/* Progress Animation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Printer className={`w-3.5 h-3.5 animate-pulse ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
                      <span>HEATING BED & EXTRUDER...</span>
                    </span>
                    <span className="text-emerald-500 font-bold">LAYER {simulatedLayer} / 480</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div className={`h-full animate-pulse ${
                      isDarkMode ? 'bg-white' : 'bg-slate-900'
                    }`} style={{ width: '25%' }} />
                  </div>
                </div>

                <div className={`grid grid-cols-3 gap-2 text-[10px] pt-2 border-t ${
                  isDarkMode ? 'text-slate-400 border-white/10' : 'text-slate-500 border-slate-200'
                }`}>
                  <div>EXTRUDER: <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>255°C</span></div>
                  <div>HEATBED: <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>60°C</span></div>
                  <div>EST. SHIPPED: <span className="text-emerald-500 font-bold">TOMORROW 10 AM</span></div>
                </div>

              </div>

              <button
                onClick={onClose}
                className={`px-8 py-3.5 rounded-xl font-mono-tech font-bold text-xs transition-all cursor-pointer shadow-xl ${
                  isDarkMode ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                RETURN TO FORMA CATALOG
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
