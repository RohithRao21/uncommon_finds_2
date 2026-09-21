import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, ShieldCheck, Cpu, CreditCard, Truck, ArrowRight, Printer, Sparkles, 
  RefreshCw, MapPin, Plus, Star, Phone, ChevronRight, ShoppingBag, Trash2, 
  ArrowLeft, CheckCircle2, Clock, Box, Zap, Leaf, AlertCircle, FileText, Package
} from 'lucide-react';
import { CartItem, Address } from '../types';
import { PriceDisplay } from './PriceDisplay';
import { formatINR } from '../utils/currency';
import { User, db, collection, addDoc, getDocs, serverTimestamp } from '../lib/firebase';
import { useCart } from '../context/CartContext';
import { useAddress } from '../context/AddressContext';
import { AddressFormModal } from './AddressFormModal';
import { ProductionTracker } from './ProductionTracker';
import { openRazorpayCheckout, getRazorpayKeyId } from '../lib/razorpay';
import { PRODUCTS } from '../data/products';

interface CheckoutPageProps {
  onBackToShop: () => void;
  onViewOrders?: () => void;
  currencySymbol: string;
  isDarkMode: boolean;
  currentUser?: User | null;
  discountAmount?: number;
}

export type CheckoutStep = 1 | 2 | 3 | 4 | 5;

interface DeliveryOption {
  id: string;
  name: string;
  tagline: string;
  price: number;
  estDays: string;
  icon: any;
  badge?: string;
}

const COLOR_MAP: Record<string, string> = {
  'PETG-CF': '#27272a',
  'PLA-CARBON': '#18181b',
  'TITANIUM-GREY': '#64748b',
  'TRANSLUCENT-FROST': '#e2e8f0',
  'BRASS-PLA': '#d97706',
  'MATTE-ONYX': '#09090b',
  'BLACK': '#0f172a',
  'WHITE': '#f8fafc',
  'ORANGE': '#ea580c',
  'PINK': '#ec4899',
  'DARK BLUE': '#1e3a8a',
  'NEON GREEN': '#22c55e',
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToShop,
  onViewOrders,
  currencySymbol = '₹',
  isDarkMode = true,
  currentUser,
  discountAmount: initialDiscount = 0,
}) => {
  const { cartItems, subtotal, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const { addresses, defaultAddress, validatePincode } = useAddress();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(initialDiscount);
  const [promoApplied, setPromoApplied] = useState<boolean>(initialDiscount > 0);
  const [promoError, setPromoError] = useState('');

  // Step 2: Shipping Address
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isCustomAddressMode, setIsCustomAddressMode] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [shippingError, setShippingError] = useState<string>('');

  const [formData, setFormData] = useState({
    name: currentUser?.displayName || 'Rahul Sharma',
    email: currentUser?.email || 'rahul.sharma@voxelform.in',
    phone: '+91 9876543210',
    address: 'Flat 302, Cyber Heights, MG Road',
    addressLine2: 'Near Indiranagar Metro Station',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    zip: '560001',
  });

  // Step 3: Delivery Method
  const deliveryOptions: DeliveryOption[] = useMemo(() => [
    {
      id: 'standard',
      name: 'Standard Air Shipping',
      tagline: 'Reliable express air dispatch across India',
      price: subtotal > 1499 ? 0 : 99,
      estDays: '3 - 5 Business Days',
      icon: Truck,
      badge: subtotal > 1499 ? 'FREE' : 'MOST POPULAR',
    },
    {
      id: 'priority',
      name: 'Priority Air Express',
      tagline: 'Blazing fast priority dispatch from print farm',
      price: 199,
      estDays: '1 - 2 Business Days',
      icon: Zap,
      badge: 'FASTEST',
    },
    {
      id: 'eco',
      name: 'Eco Carbon-Neutral Delivery',
      tagline: 'Sustainable ground transit with 100% recycled packaging',
      price: 49,
      estDays: '4 - 6 Business Days',
      icon: Leaf,
      badge: 'ZERO CARBON',
    },
  ], [subtotal]);

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('standard');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  const selectedDeliveryOption = useMemo(() => {
    return deliveryOptions.find((d) => d.id === selectedDeliveryId) || deliveryOptions[0];
  }, [deliveryOptions, selectedDeliveryId]);

  // Step 5: Payment method selection preview
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [upiId, setUpiId] = useState('rahul@upi');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  // Order Placement state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [createdOrderNum, setCreatedOrderNum] = useState('');
  const [jobId, setJobId] = useState('');

  // Sync address with list
  useEffect(() => {
    if (addresses.length > 0 && !isCustomAddressMode) {
      const active = addresses.find((a) => a.id === selectedAddressId) || defaultAddress || addresses[0];
      if (active) {
        setSelectedAddressId(active.id);
        setFormData({
          name: active.fullName || currentUser?.displayName || '',
          email: currentUser?.email || 'rahul.sharma@voxelform.in',
          phone: active.phone || '',
          address: active.addressLine1 || '',
          addressLine2: active.addressLine2 || '',
          city: active.city || '',
          state: active.state || '',
          country: active.country || 'India',
          zip: active.pincode || '',
        });
      }
    }
  }, [addresses, defaultAddress, selectedAddressId, isCustomAddressMode, currentUser]);

  // Handle Promo Code Application
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'FORMA10' || code === 'VOXEL10') {
      setDiscountAmount(10);
      setPromoApplied(true);
      setPromoError('');
    } else if (code === 'VIP20') {
      const val = Math.round(subtotal * 0.2);
      setDiscountAmount(val);
      setPromoApplied(true);
      setPromoError('');
    } else if (code.length > 0) {
      setPromoError('Invalid coupon. Try "FORMA10" for ₹10 off or "VIP20" for 20% off.');
    }
  };

  // Financial Calculations
  const shippingFee = selectedDeliveryOption.price;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const gstAmount = Math.round(taxableSubtotal * 0.18); // 18% GST
  const grandTotal = taxableSubtotal + shippingFee + gstAmount;

  // Step Navigators with Validation
  const handleNextFromStep1 = () => {
    if (cartItems.length === 0) return;
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    setShippingError('');
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.city.trim() || !formData.zip.trim()) {
      setShippingError('Please complete all required shipping fields marked with *');
      return;
    }

    const pinCheck = validatePincode(formData.zip);
    if (!pinCheck.isValid) {
      setShippingError(pinCheck.message || 'Please enter a valid 6-digit Indian Pincode');
      return;
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep3 = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep4 = () => {
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Place Order Action with Razorpay Integration
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    const newJobId = `JOB-${Math.floor(100000 + Math.random() * 900000)}`;
    setJobId(newJobId);

    // Generate human readable order number e.g. UF100001
    let generatedNum = 'UF100001';
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const nextSeq = 100001 + ordersSnap.size;
      generatedNum = `UF${nextSeq}`;
    } catch (countErr) {
      console.warn('Could not fetch existing orders count, using fallback offset:', countErr);
      generatedNum = `UF${100001 + Math.floor(Math.random() * 500)}`;
    }
    setCreatedOrderNum(generatedNum);

    const saveOrderToDatabase = async (paymentStatus: string, razorpayPaymentId?: string) => {
      try {
        const orderData = {
          orderNumber: generatedNum,
          userId: currentUser?.uid || 'guest',
          userEmail: formData.email,
          userName: formData.name,
          userPhone: formData.phone,
          items: cartItems.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            selectedColor: item.selectedColor,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            image: item.image,
          })),
          shippingAddress: {
            fullName: formData.name,
            phone: formData.phone,
            addressLine1: formData.address,
            addressLine2: formData.addressLine2 || '',
            city: formData.city,
            state: formData.state,
            country: formData.country || 'India',
            pincode: formData.zip,
          },
          subtotal: subtotal,
          shipping: shippingFee,
          tax: gstAmount,
          total: grandTotal,
          totalINR: grandTotal,
          paymentStatus,
          orderStatus: 'Order Confirmed',
          status: 'Order Confirmed',
          deliveryMethod: {
            id: selectedDeliveryOption.id,
            name: selectedDeliveryOption.name,
            price: selectedDeliveryOption.price,
            estDays: selectedDeliveryOption.estDays,
          },
          paymentMethod,
          razorpayPaymentId: razorpayPaymentId || null,
          priceBreakdown: {
            subtotal,
            discountAmount,
            taxableSubtotal,
            shippingFee,
            gstAmount,
            gstRate: '18%',
            grandTotal,
          },
          jobId: newJobId,
          createdAt: serverTimestamp(),
        };

        const orderRef = await addDoc(collection(db, 'orders'), orderData);
        setCreatedOrderId(orderRef.id);
        setOrderComplete(true);
        clearCart();
      } catch (err) {
        console.error('Error saving order to Firestore:', err);
        const fallbackNum = `UF${100001 + Math.floor(Math.random() * 900)}`;
        setCreatedOrderNum(fallbackNum);
        setCreatedOrderId(`ORD-${Date.now().toString().slice(-6)}`);
        setOrderComplete(true);
        clearCart();
      } finally {
        setIsSubmitting(false);
      }
    };

    // Cash on Delivery direct flow
    if (paymentMethod === 'cod') {
      await saveOrderToDatabase('Pending (COD)');
      return;
    }

    // Razorpay Online Gateway Flow (UPI, Card, NetBanking, Razorpay)
    await openRazorpayCheckout({
      amountINR: grandTotal,
      orderNumber: generatedNum,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      description: `Order ${generatedNum} - VoxelForm Precision 3D Printed Artifacts`,
      onSuccess: async (response) => {
        console.info('Razorpay Payment Succeeded:', response);
        await saveOrderToDatabase('Paid (Razorpay)', response.razorpay_payment_id);
      },
      onFailure: (err) => {
        console.error('Razorpay Payment Failed/Cancelled:', err);
        setIsSubmitting(false);
      },
      onDismiss: () => {
        console.info('Razorpay checkout modal closed by user');
        setIsSubmitting(false);
      }
    });
  };


  const handlePrintReceipt = () => {
    window.print();
  };

  // Dynamic Hex Color preview
  const getHexForColor = (colorName: string) => {
    const key = colorName.toUpperCase();
    return COLOR_MAP[key] || '#334155';
  };

  // Render Step Status Bar Header (Inspired by Apple & DailyObjects)
  const stepsHeader = [
    { num: 1, title: 'Review Cart' },
    { num: 2, title: 'Shipping Address' },
    { num: 3, title: 'Delivery Method' },
    { num: 4, title: 'Order Summary' },
    { num: 5, title: 'Proceed to Payment' },
  ];

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-12 font-sans-clean transition-colors ${
      isDarkMode ? 'bg-[#000000] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <button
            onClick={onBackToShop}
            className={`flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider font-bold transition-all cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO SHOP</span>
          </button>

          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-mono-tech uppercase tracking-widest text-slate-400">
              VOXELFORM LAB CHECKOUT • ENCRYPTED
            </span>
          </div>
        </div>

        {!orderComplete ? (
          <>
            {/* Multi-Step Stepper Bar (Apple / DailyObjects style) */}
            <div className={`p-4 rounded-2xl border backdrop-blur-md overflow-x-auto ${
              isDarkMode ? 'bg-[#0b0d10]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between min-w-[600px] font-mono-tech text-xs">
                {stepsHeader.map((s) => {
                  const isActive = currentStep === s.num;
                  const isCompleted = currentStep > s.num;

                  return (
                    <React.Fragment key={s.num}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isCompleted) setCurrentStep(s.num as CheckoutStep);
                        }}
                        className={`flex items-center gap-2.5 transition-all cursor-pointer ${
                          isActive
                            ? 'text-white font-bold'
                            : isCompleted
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isActive
                            ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isDarkMode
                            ? 'bg-white/5 border border-white/10 text-slate-500'
                            : 'bg-slate-100 border border-slate-300 text-slate-500'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                        </div>
                        <span className="uppercase tracking-wider text-[11px] whitespace-nowrap">
                          {s.title}
                        </span>
                      </button>

                      {s.num < 5 && (
                        <div className={`h-[1px] flex-1 mx-2 ${
                          currentStep > s.num ? 'bg-emerald-500/50' : 'bg-white/10'
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Step Layout: Main Content + Right Sticky Order Summary Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Main Step Body (Columns 1 to 7/8) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">

                {/* STEP 1: REVIEW CART */}
                {currentStep === 1 && (
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
                    isDarkMode ? 'bg-[#0f1116] border-white/10' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div>
                        <h2 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight">
                          STEP 1: REVIEW CART
                        </h2>
                        <p className="text-xs text-slate-400 font-mono-tech mt-1">
                          Verify quantities, materials, and custom specifications before proceeding.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono-tech font-bold uppercase">
                        {cartItems.length} ITEMS
                      </span>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="py-12 text-center space-y-4">
                        <ShoppingBag className="w-12 h-12 mx-auto text-slate-600" />
                        <h3 className="font-display font-bold text-lg">YOUR CART IS EMPTY</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Add 3D printed EDC gear or desk accessories from our catalog to proceed with checkout.
                        </p>
                        <button
                          onClick={onBackToShop}
                          className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          EXPLORE CATALOG
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cartItems.map((item) => {
                          const itemPrice = item.price || item.unitPrice || 0;
                          const lineSubtotal = itemPrice * item.quantity;
                          const colorHex = getHexForColor(item.selectedColor);

                          return (
                            <div
                              key={item.id}
                              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center gap-4 ${
                                isDarkMode ? 'bg-black/50 border-white/10' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              {/* Product Thumbnail Image */}
                              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
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
                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur text-[9px] font-mono-tech text-white border border-white/20">
                                  3D PRINT
                                </div>
                              </div>

                              {/* Item Description */}
                              <div className="flex-1 space-y-1 text-center sm:text-left">
                                <h4 className="font-bold text-sm tracking-wide uppercase">
                                  {item.productName}
                                </h4>

                                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 font-mono-tech">
                                  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-white/40 inline-block"
                                      style={{ backgroundColor: colorHex }}
                                    />
                                    <span className="uppercase text-[11px] font-bold text-slate-200">
                                      COLOR: {item.selectedColor}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-xs text-slate-400 font-mono-tech pt-0.5">
                                  UNIT PRICE: <PriceDisplay amount={itemPrice} usdClassName="text-slate-400" />
                                </div>
                              </div>

                              {/* Quantity Stepper & Price */}
                              <div className="flex flex-col items-center sm:items-end gap-2 shrink-0 font-mono-tech">
                                <div className="flex items-center border border-white/20 rounded-xl overflow-hidden bg-black/40">
                                  <button
                                    type="button"
                                    onClick={() => decreaseQuantity(item.id)}
                                    className="px-2.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="px-3 py-1 text-xs font-bold text-white min-w-[28px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => increaseQuantity(item.id)}
                                    className="px-2.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="text-right">
                                  <span className="text-[10px] text-slate-500 uppercase block">SUBTOTAL</span>
                                  <span className="font-bold text-sm text-white">
                                    <PriceDisplay amount={lineSubtotal} usdClassName="text-slate-300" />
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-red-400 hover:text-red-300 text-[10px] uppercase tracking-wider underline cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>REMOVE</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Promo Code Box */}
                        <div className={`p-4 rounded-2xl border font-mono-tech space-y-2 ${
                          isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            PROMO / COUPON CODE
                          </label>
                          <form onSubmit={handleApplyPromo} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. FORMA10 or VIP20"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              className={`flex-1 px-3 py-2 rounded-xl border text-xs outline-none uppercase font-bold tracking-wider ${
                                isDarkMode ? 'bg-black border-white/20 text-white' : 'bg-white border-slate-300 text-black'
                              }`}
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all cursor-pointer"
                            >
                              APPLY
                            </button>
                          </form>
                          {promoApplied && (
                            <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Coupon Applied! Saved {formatINR(discountAmount)}.
                            </p>
                          )}
                          {promoError && <p className="text-[11px] text-red-400 font-bold">{promoError}</p>}
                        </div>

                        {/* Continue Button */}
                        <div className="pt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={handleNextFromStep1}
                            className="px-8 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono-tech font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-red-500/20"
                          >
                            <span>CONTINUE TO SHIPPING ADDRESS</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: SHIPPING ADDRESS */}
                {currentStep === 2 && (
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
                    isDarkMode ? 'bg-[#0f1116] border-white/10' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div>
                        <h2 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight">
                          STEP 2: SHIPPING ADDRESS
                        </h2>
                        <p className="text-xs text-slate-400 font-mono-tech mt-1">
                          Provide your delivery location in India for express 3D print dispatch.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddressToEdit(null);
                          setIsAddressModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono-tech font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-red-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD NEW ADDRESS</span>
                      </button>
                    </div>

                    {shippingError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono-tech text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{shippingError}</span>
                      </div>
                    )}

                    {/* Saved Addresses Selector */}
                    {addresses.length > 0 && (
                      <div className="space-y-3 font-mono-tech">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          SAVED ADDRESSES ({addresses.length})
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {addresses.map((addr) => {
                            const isSelected = !isCustomAddressMode && selectedAddressId === addr.id;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => {
                                  setSelectedAddressId(addr.id);
                                  setIsCustomAddressMode(false);
                                  setShippingError('');
                                  setFormData({
                                    name: addr.fullName,
                                    email: formData.email,
                                    phone: addr.phone,
                                    address: addr.addressLine1,
                                    addressLine2: addr.addressLine2 || '',
                                    city: addr.city,
                                    state: addr.state,
                                    country: addr.country || 'India',
                                    zip: addr.pincode,
                                  });
                                }}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-red-500 bg-red-500/10 text-white shadow-lg shadow-red-500/10'
                                    : isDarkMode
                                    ? 'bg-black/40 border-white/10 hover:border-white/30 text-slate-300'
                                    : 'bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-800'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-xs uppercase tracking-wide truncate max-w-[160px]">
                                      {addr.fullName}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-red-500 text-white flex items-center gap-1">
                                        <Star className="w-2.5 h-2.5 fill-current" />
                                        <span>DEFAULT</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-300 font-sans">{addr.addressLine1}</p>
                                  {addr.addressLine2 && <p className="text-xs text-slate-400 font-sans">{addr.addressLine2}</p>}
                                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                                    {addr.city}, {addr.state} - <span className="font-mono text-white font-bold">{addr.pincode}</span>
                                  </p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {addr.phone}
                                  </span>
                                  {isSelected && <CheckCircle2 className="w-4 h-4 text-red-500" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIsCustomAddressMode(!isCustomAddressMode)}
                            className="text-xs text-slate-400 hover:text-white underline font-bold uppercase cursor-pointer"
                          >
                            {isCustomAddressMode ? '← USE SAVED ADDRESS' : '+ ENTER CUSTOM ADDRESS FOR THIS ORDER'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Address Form */}
                    {(addresses.length === 0 || isCustomAddressMode) && (
                      <div className="space-y-4 font-mono-tech text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              FULL NAME *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Rahul Sharma"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors ${
                                isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              PHONE NUMBER *
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="+91 9876543210"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors ${
                                isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            EMAIL ADDRESS FOR TELEMETRY NOTIFICATIONS *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="rahul@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors ${
                              isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            STREET ADDRESS (FLAT / HOUSE NO. / BUILDING) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Flat 302, Cyber Heights, MG Road"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors ${
                              isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            ADDRESS LINE 2 (LANDMARK - OPTIONAL)
                          </label>
                          <input
                            type="text"
                            placeholder="Near Indiranagar Metro Station"
                            value={formData.addressLine2}
                            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                            className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors ${
                              isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              CITY / TOWN *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Bengaluru"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className={`w-full px-3 py-2.5 rounded-xl border outline-none transition-colors ${
                                isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              INDIAN PINCODE * (6 DIGITS)
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              placeholder="560001"
                              value={formData.zip}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setFormData({ ...formData, zip: val });
                              }}
                              className={`w-full px-3 py-2.5 rounded-xl border outline-none font-mono tracking-widest transition-colors ${
                                isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 rounded-xl border border-white/20 text-slate-300 hover:bg-white/10 font-mono-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        BACK TO CART
                      </button>
                      <button
                        type="button"
                        onClick={handleNextFromStep2}
                        className="px-8 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono-tech font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-red-500/20"
                      >
                        <span>CONTINUE TO DELIVERY METHOD</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: DELIVERY METHOD */}
                {currentStep === 3 && (
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
                    isDarkMode ? 'bg-[#0f1116] border-white/10' : 'bg-white border-slate-200'
                  }`}>
                    <div className="pb-4 border-b border-white/10">
                      <h2 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight">
                        STEP 3: DELIVERY METHOD
                      </h2>
                      <p className="text-xs text-slate-400 font-mono-tech mt-1">
                        Select how fast you want your precision 3D printed components dispatched.
                      </p>
                    </div>

                    <div className="space-y-4 font-mono-tech">
                      {deliveryOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = selectedDeliveryId === opt.id;

                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedDeliveryId(opt.id)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                              isSelected
                                ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10 text-white'
                                : isDarkMode
                                ? 'bg-black/40 border-white/10 hover:border-white/30 text-slate-300'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-800'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl ${
                                isSelected ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-400'
                              }`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm tracking-wide uppercase">{opt.name}</h4>
                                  {opt.badge && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-white/10 text-white border border-white/20">
                                      {opt.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 font-sans mt-0.5">{opt.tagline}</p>
                                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-2">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{opt.estDays}</span>
                                </div>
                              </div>
                            </div>

                            <div className="sm:text-right shrink-0">
                              <span className="text-[10px] text-slate-500 uppercase block">SHIPPING RATE</span>
                              <span className="font-bold text-lg text-white">
                                {opt.price === 0 ? (
                                  <span className="text-emerald-400">FREE</span>
                                ) : (
                                  <PriceDisplay amount={opt.price} usdClassName="text-slate-200" />
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono-tech">
                        DELIVERY INSTRUCTIONS (OPTIONAL)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Leave package with security guard at reception"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none font-mono-tech transition-colors ${
                          isDarkMode ? 'bg-black/60 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-between font-mono-tech">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="px-6 py-3 rounded-xl border border-white/20 text-slate-300 hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        BACK TO ADDRESS
                      </button>
                      <button
                        type="button"
                        onClick={handleNextFromStep3}
                        className="px-8 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-red-500/20"
                      >
                        <span>CONTINUE TO ORDER SUMMARY</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: ORDER SUMMARY */}
                {currentStep === 4 && (
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
                    isDarkMode ? 'bg-[#0f1116] border-white/10' : 'bg-white border-slate-200'
                  }`}>
                    <div className="pb-4 border-b border-white/10">
                      <h2 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight">
                        STEP 4: ORDER SUMMARY & REVIEW
                      </h2>
                      <p className="text-xs text-slate-400 font-mono-tech mt-1">
                        Please inspect all order details, tax calculations, and delivery address before proceeding to payment.
                      </p>
                    </div>

                    {/* Delivery & Shipping Info Preview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-tech text-xs">
                      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            DELIVERY ADDRESS
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="text-red-400 hover:text-red-300 underline font-bold uppercase text-[10px] cursor-pointer"
                          >
                            EDIT
                          </button>
                        </div>
                        <p className="font-bold text-white text-sm uppercase">{formData.name}</p>
                        <p className="text-slate-300 mt-1">{formData.address}</p>
                        {formData.addressLine2 && <p className="text-slate-400">{formData.addressLine2}</p>}
                        <p className="text-slate-400">
                          {formData.city}, {formData.state} - {formData.zip}
                        </p>
                        <p className="text-slate-400 pt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {formData.phone}
                        </p>
                      </div>

                      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            SHIPPING METHOD
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="text-red-400 hover:text-red-300 underline font-bold uppercase text-[10px] cursor-pointer"
                          >
                            EDIT
                          </button>
                        </div>
                        <p className="font-bold text-white text-sm uppercase">{selectedDeliveryOption.name}</p>
                        <p className="text-emerald-400 font-bold text-xs mt-1">
                          ESTIMATED DELIVERY: {selectedDeliveryOption.estDays}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          RATE: {selectedDeliveryOption.price === 0 ? 'FREE' : formatINR(selectedDeliveryOption.price)}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Product Table */}
                    <div className="space-y-3 font-mono-tech">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        ITEMIZED BREAKDOWN ({cartItems.length})
                      </h4>
                      <div className="space-y-2">
                        {cartItems.map((item) => {
                          const itemPrice = item.price || item.unitPrice || 0;
                          return (
                            <div
                              key={item.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                isDarkMode ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-white/10"
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
                                <div>
                                  <p className="font-bold text-xs text-white uppercase">{item.productName}</p>
                                  <p className="text-[10px] text-slate-400">
                                    Color: {item.selectedColor} • Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-xs text-white">
                                  <PriceDisplay amount={itemPrice * item.quantity} usdClassName="text-slate-300" />
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {item.quantity} × <PriceDisplay amount={itemPrice} usdClassName="text-slate-500" />
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between font-mono-tech">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="px-6 py-3 rounded-xl border border-white/20 text-slate-300 hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        BACK TO DELIVERY
                      </button>
                      <button
                        type="button"
                        onClick={handleNextFromStep4}
                        className="px-8 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-red-500/20"
                      >
                        <span>PROCEED TO PAYMENT</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: PROCEED TO PAYMENT */}
                {currentStep === 5 && (
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
                    isDarkMode ? 'bg-[#0f1116] border-white/10' : 'bg-white border-slate-200'
                  }`}>
                    <div className="pb-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight">
                          STEP 5: PROCEED TO PAYMENT
                        </h2>
                        <p className="text-xs text-slate-400 font-mono-tech mt-1">
                          Secured via Razorpay Payment Gateway (UPI, Cards, NetBanking, COD)
                        </p>
                      </div>

                      {getRazorpayKeyId() ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono-tech font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>RAZORPAY LIVE GATEWAY</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-mono-tech font-bold">
                          <Zap className="w-4 h-4 text-blue-400" />
                          <span>RAZORPAY DEMO MODE</span>
                        </div>
                      )}
                    </div>

                    {/* Notice Banner */}
                    {getRazorpayKeyId() ? (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono-tech text-xs flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase">OFFICIAL RAZORPAY GATEWAY CONNECTED</span>
                          <p className="text-[11px] text-emerald-200/80 mt-0.5">
                            Your transaction will be processed through Razorpay's 256-bit encrypted checkout popup with support for UPI, GPay, PhonePe, Cards, NetBanking, and Wallets.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono-tech text-xs flex items-start gap-3">
                        <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase">RAZORPAY INTEGRATION READY (SANDBOX DEMO MODE)</span>
                          <p className="text-[11px] text-blue-200/80 mt-0.5">
                            The Razorpay checkout flow is fully integrated. To accept real payments, add <code className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">VITE_RAZORPAY_KEY_ID</code> to your environment variables. You can test placing orders right now in sandbox simulation mode.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Payment Mode Selector */}
                    <div className="space-y-3 font-mono-tech">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        SELECT PAYMENT METHOD
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Razorpay Gateway (Default) */}
                        <div
                          onClick={() => setPaymentMethod('upi')}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            paymentMethod === 'upi' || paymentMethod === 'card' || paymentMethod === 'netbanking'
                              ? 'border-red-500 bg-red-500/10 text-white shadow-md shadow-red-500/10'
                              : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs uppercase flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-red-400" />
                              <span>RAZORPAY (UPI, CARD, NETBANKING)</span>
                            </span>
                            {(paymentMethod === 'upi' || paymentMethod === 'card' || paymentMethod === 'netbanking') && (
                              <CheckCircle2 className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">Instant checkout via GPay, PhonePe, Paytm, Visa/Mastercard & All Indian Banks</p>
                        </div>

                        {/* Cash on Delivery */}
                        <div
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            paymentMethod === 'cod'
                              ? 'border-red-500 bg-red-500/10 text-white shadow-md shadow-red-500/10'
                              : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs uppercase flex items-center gap-1.5">
                              <Box className="w-3.5 h-3.5 text-amber-400" />
                              <span>CASH ON DELIVERY (COD)</span>
                            </span>
                            {paymentMethod === 'cod' && <CheckCircle2 className="w-4 h-4 text-red-500" />}
                          </div>
                          <p className="text-[11px] text-slate-400">Pay cash upon parcel delivery to your shipping address</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between font-mono-tech">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="px-6 py-3 rounded-xl border border-white/20 text-slate-300 hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        BACK TO SUMMARY
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handlePlaceOrder}
                        className={`px-8 py-4 rounded-2xl font-mono-tech font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xl ${
                          isSubmitting
                            ? 'bg-slate-700 text-slate-400 cursor-wait'
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>LAUNCHING RAZORPAY...</span>
                          </>
                        ) : paymentMethod === 'cod' ? (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>CONFIRM COD ORDER ({formatINR(grandTotal)})</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>PAY VIA RAZORPAY ({formatINR(grandTotal)})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Pinned Order Summary Panel */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className={`p-6 rounded-3xl border shadow-2xl space-y-5 sticky top-24 ${
                  isDarkMode ? 'bg-[#0f1116] border-white/10' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="font-display font-bold text-base uppercase tracking-wider pb-3 border-b border-white/10 flex items-center justify-between">
                    <span>ORDER TOTAL</span>
                    <span className="text-xs font-mono-tech text-slate-400 font-normal">
                      {cartItems.length} ITEMS
                    </span>
                  </h3>

                  {/* Financial Breakdown Table */}
                  <div className="space-y-2.5 font-mono-tech text-xs">
                    {/* Item Subtotal */}
                    <div className="flex justify-between items-center text-slate-400">
                      <span>SUBTOTAL</span>
                      <span className="text-white font-bold">
                        <PriceDisplay amount={subtotal} usdClassName="text-slate-300" />
                      </span>
                    </div>

                    {/* Applied Discount */}
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-400">
                        <span>PROMO DISCOUNT</span>
                        <span className="font-bold">-{formatINR(discountAmount)}</span>
                      </div>
                    )}

                    {/* Shipping Cost */}
                    <div className="flex justify-between items-center text-slate-400">
                      <span>SHIPPING ({selectedDeliveryOption.name.split(' ')[0]})</span>
                      <span className="text-white font-bold">
                        {shippingFee === 0 ? (
                          <span className="text-emerald-400">FREE</span>
                        ) : (
                          <PriceDisplay amount={shippingFee} usdClassName="text-slate-300" />
                        )}
                      </span>
                    </div>

                    {/* GST (18%) */}
                    <div className="flex justify-between items-center text-slate-400">
                      <span>GST (18% GOODS & SERVICES TAX)</span>
                      <span className="text-white font-bold">
                        <PriceDisplay amount={gstAmount} usdClassName="text-slate-300" />
                      </span>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-sm text-white uppercase block">TOTAL AMOUNT</span>
                        <span className="text-[10px] text-slate-500">INCLUDES ALL APPLICABLE TAXES</span>
                      </div>
                      <span className="font-bold text-2xl text-white font-mono">
                        <PriceDisplay amount={grandTotal} usdClassName="text-slate-300" />
                      </span>
                    </div>
                  </div>

                  {/* Trust Badge Guarantees */}
                  <div className="pt-3 border-t border-white/10 space-y-2 text-[11px] font-mono-tech text-slate-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>100% Quality Inspection Guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-red-500 shrink-0" />
                      <span>Printed with Aerospace PETG & Carbon Fiber</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Express Air Shipping with Parcel Tracking</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </>
        ) : (
          /* ORDER COMPLETE SUCCESS SCREEN */
          <div className={`p-6 sm:p-10 rounded-3xl border shadow-2xl space-y-8 max-w-4xl mx-auto ${
            isDarkMode ? 'bg-[#0b0d12] border-white/10' : 'bg-white border-slate-200'
          }`}>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/10 border border-red-500/40 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/10">
                <Check className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono-tech font-bold uppercase tracking-widest">
                  YOUR UNCOMMON FIND IS CONFIRMED
                </span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight uppercase text-white">
                  THANK YOU FOR YOUR ORDER!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-sans">
                  Crafted specifically for you using advanced precision manufacturing. Every piece is produced on demand to ensure custom craftsmanship and uncompromised quality.
                </p>
                <div className="pt-2 text-xs text-slate-400 font-mono-tech flex items-center justify-center gap-3">
                  <span>Order Number: <strong className="text-white font-mono bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-lg">{createdOrderNum || 'UF100001'}</strong></span>
                  {jobId && <span>Job Ref: <strong className="text-red-400 font-mono">{jobId}</strong></span>}
                </div>
              </div>
            </div>

            {/* Production Progress & Manufacturing Status Card */}
            <ProductionTracker
              currentStatus="Order Confirmed"
              orderNumber={createdOrderNum || 'UF100001'}
              estimatedDispatch={selectedDeliveryOption.estDays}
              deliveryAddress={`${formData.name}, ${formData.addressLine1}, ${formData.city} ${formData.zip}`}
              totalPaid={grandTotal}
              isDarkMode={isDarkMode}
              showCardDetails={true}
            />

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono-tech">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/20 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>PRINT INVOICE</span>
              </button>

              {onViewOrders && (
                <button
                  type="button"
                  onClick={onViewOrders}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>TRACK PRODUCTION STAGE</span>
                </button>
              )}

              <button
                type="button"
                onClick={onBackToShop}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
              >
                <span>RETURN TO SHOP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
