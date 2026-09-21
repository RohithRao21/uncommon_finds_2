import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  Truck, 
  Cpu, 
  ShoppingBag, 
  MapPin, 
  X, 
  RefreshCw, 
  AlertCircle,
  FileText,
  CreditCard,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { db, collection, query, where, getDocs, orderBy, doc, getDoc } from '../lib/firebase';
import { Order, OrderItem } from '../types';
import { PriceDisplay } from './PriceDisplay';
import { ProductionTracker } from './ProductionTracker';

interface MyOrdersPageProps {
  onBackToShop: () => void;
  isDarkMode?: boolean;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({
  onBackToShop,
  isDarkMode = true,
}) => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedOrderNum, setCopiedOrderNum] = useState(false);
  
  // Guest Lookup State
  const [lookupOrderNum, setLookupOrderNum] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Fetch orders on mount or user change
  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      if (currentUser) {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const fetchedOrders: Order[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            orderNumber: data.orderNumber || `UF${100000 + Math.floor(Math.random() * 90000)}`,
            userId: data.userId || '',
            userEmail: data.userEmail || '',
            userName: data.userName || data.shippingAddress?.fullName || '',
            userPhone: data.userPhone || data.shippingAddress?.phone || '',
            items: data.items || [],
            shippingAddress: data.shippingAddress || {
              fullName: '',
              phone: '',
              addressLine1: '',
              city: '',
              state: '',
              country: 'India',
              pincode: '',
            },
            subtotal: data.subtotal || data.priceBreakdown?.subtotal || 0,
            shipping: data.shipping || data.priceBreakdown?.shippingFee || 0,
            tax: data.tax || data.priceBreakdown?.gstAmount || 0,
            total: data.total || data.totalINR || data.priceBreakdown?.grandTotal || 0,
            paymentStatus: data.paymentStatus || 'Pending',
            orderStatus: data.orderStatus || data.status || 'Pending',
            createdAt: data.createdAt,
            deliveryMethod: data.deliveryMethod,
            paymentMethod: data.paymentMethod,
            jobId: data.jobId,
          };
        });

        // Sort by date descending
        fetchedOrders.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        setOrders(fetchedOrders);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Guest Lookup
  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = lookupOrderNum.trim().toUpperCase();
    if (!cleanNum) return;

    setLookupLoading(true);
    setLookupError('');
    try {
      // Query by orderNumber field
      const q = query(collection(db, 'orders'), where('orderNumber', '==', cleanNum));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        const foundOrder: Order = {
          id: docSnap.id,
          orderNumber: data.orderNumber || cleanNum,
          userId: data.userId || '',
          userEmail: data.userEmail || '',
          userName: data.userName || data.shippingAddress?.fullName || '',
          userPhone: data.userPhone || data.shippingAddress?.phone || '',
          items: data.items || [],
          shippingAddress: data.shippingAddress || {
            fullName: '',
            phone: '',
            addressLine1: '',
            city: '',
            state: '',
            country: 'India',
            pincode: '',
          },
          subtotal: data.subtotal || data.priceBreakdown?.subtotal || 0,
          shipping: data.shipping || data.priceBreakdown?.shippingFee || 0,
          tax: data.tax || data.priceBreakdown?.gstAmount || 0,
          total: data.total || data.totalINR || data.priceBreakdown?.grandTotal || 0,
          paymentStatus: data.paymentStatus || 'Pending',
          orderStatus: data.orderStatus || data.status || 'Pending',
          createdAt: data.createdAt,
          deliveryMethod: data.deliveryMethod,
          paymentMethod: data.paymentMethod,
          jobId: data.jobId,
        };

        setSelectedOrder(foundOrder);
        setLookupOrderNum('');
      } else {
        // Try looking up by Firestore Document ID
        const docRef = doc(db, 'orders', cleanNum);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const foundOrder: Order = {
            id: docSnap.id,
            orderNumber: data.orderNumber || `UF100001`,
            userId: data.userId || '',
            userEmail: data.userEmail || '',
            userName: data.userName || data.shippingAddress?.fullName || '',
            userPhone: data.userPhone || data.shippingAddress?.phone || '',
            items: data.items || [],
            shippingAddress: data.shippingAddress || {
              fullName: '',
              phone: '',
              addressLine1: '',
              city: '',
              state: '',
              country: 'India',
              pincode: '',
            },
            subtotal: data.subtotal || 0,
            shipping: data.shipping || 0,
            tax: data.tax || 0,
            total: data.total || data.totalINR || 0,
            paymentStatus: data.paymentStatus || 'Pending',
            orderStatus: data.orderStatus || data.status || 'Pending',
            createdAt: data.createdAt,
            deliveryMethod: data.deliveryMethod,
            paymentMethod: data.paymentMethod,
            jobId: data.jobId,
          };
          setSelectedOrder(foundOrder);
          setLookupOrderNum('');
        } else {
          setLookupError(`No order found matching "${cleanNum}". Check the order number and try again.`);
        }
      }
    } catch (err) {
      console.error('Error looking up order:', err);
      setLookupError('Failed to search for order. Please check connection.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Copy Order Number helper
  const handleCopyOrderNum = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedOrderNum(true);
    setTimeout(() => setCopiedOrderNum(false), 2000);
  };

  // Re-order items back into cart
  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        productId: item.productId,
        productName: item.productName,
        selectedColor: item.selectedColor,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      });
    });
    alert(`${order.items.length} item(s) added back to your cart!`);
  };

  // Format Date Helper
  const formatDate = (rawDate: any) => {
    if (!rawDate) return 'Recently';
    let dateObj: Date;
    if (rawDate?.seconds) {
      dateObj = new Date(rawDate.seconds * 1000);
    } else if (typeof rawDate === 'string') {
      dateObj = new Date(rawDate);
    } else {
      dateObj = new Date();
    }
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((it) => it.productName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.jobId && order.jobId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    return order.orderStatus.toUpperCase() === statusFilter.toUpperCase();
  });

  // Get status color styling
  const getStatusBadge = (status: string) => {
    const st = status.toUpperCase();
    if (st.includes('DELIVERED')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    } else if (st.includes('SHIPPED') || st.includes('PACKED')) {
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    } else if (st.includes('INSPECTION') || st.includes('CRAFTING') || st.includes('PRINTING')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    } else if (st.includes('PREPARING') || st.includes('PROCESSING')) {
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    } else {
      return 'bg-red-500/15 text-red-400 border-red-500/30';
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-12 font-sans-clean transition-colors ${
      isDarkMode ? 'bg-[#000000] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <button
            onClick={onBackToShop}
            className={`flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider font-bold transition-all cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO CATALOG</span>
          </button>

          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-red-500" />
            <span className="text-xs font-mono-tech uppercase tracking-widest text-slate-400">
              VOXELFORM LABS • MY ORDERS
            </span>
          </div>
        </div>

        {/* Page Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-red-500 uppercase tracking-widest font-bold">
              <Cpu className="w-4 h-4" />
              <span>3D PRINTING & ORDER MANAGEMENT</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-5xl tracking-tight uppercase">
              MY ORDERS
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-mono-tech">
              Track manufacturing progress, delivery status, and invoice details for your custom 3D prints.
            </p>
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className={`px-4 py-2 rounded-xl border text-xs font-mono-tech font-bold uppercase transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto ${
              isDarkMode 
                ? 'border-white/20 bg-white/5 text-white hover:bg-white/10' 
                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-sm'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH QUEUE</span>
          </button>
        </div>

        {/* Search & Order Lookup Section */}
        <div className={`p-5 rounded-2xl border backdrop-blur-md space-y-4 ${
          isDarkMode ? 'bg-[#0f1116] border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            
            {/* Filter Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Order # (e.g. UF100001) or Item Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-mono-tech outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-black/60 border-white/15 text-white placeholder-slate-500 focus:border-red-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-black'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-[11px] font-mono-tech">
              {['ALL', 'CONFIRMED', 'PREPARING', 'CRAFTING', 'INSPECTION', 'PACKED', 'SHIPPED', 'DELIVERED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg border font-bold tracking-wider cursor-pointer transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? (isDarkMode ? 'bg-white text-black border-white' : 'bg-slate-900 text-white border-slate-900')
                      : (isDarkMode ? 'bg-transparent text-slate-400 border-white/10 hover:border-white/30 hover:text-white' : 'bg-transparent text-slate-600 border-slate-300 hover:border-slate-400')
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Guest Order Lookup Form */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs font-mono-tech">
            <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              <span>LOOKUP ANY ORDER BY NUMBER</span>
            </span>

            <form onSubmit={handleLookupOrder} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter UF100001..."
                value={lookupOrderNum}
                onChange={(e) => setLookupOrderNum(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono uppercase outline-none w-40 ${
                  isDarkMode ? 'bg-black/80 border-white/20 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}
              />
              <button
                type="submit"
                disabled={lookupLoading || !lookupOrderNum.trim()}
                className={`px-4 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50' 
                    : 'bg-slate-900 text-white hover:bg-black disabled:opacity-50'
                }`}
              >
                {lookupLoading ? 'LOOKING UP...' : 'SEARCH'}
              </button>
            </form>
          </div>

          {lookupError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono-tech flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center space-y-4 font-mono-tech">
            <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
              FETCHING FIRESTORE ORDERS...
            </p>
          </div>
        ) : error ? (
          <div className="py-12 p-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-center space-y-3 font-mono-tech">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm font-bold text-red-300">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs uppercase"
            >
              TRY AGAIN
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className={`py-20 p-8 rounded-3xl border text-center space-y-5 font-mono-tech ${
            isDarkMode ? 'bg-[#0b0d10] border-white/10' : 'bg-white border-slate-200'
          }`}>
            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
              <ShoppingBag className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl uppercase text-white">
                NO ORDERS FOUND
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No orders match your filter criteria. Try clearing search.'
                  : currentUser
                  ? 'You haven\'t placed any custom print orders yet. Complete checkout to start.'
                  : 'Sign in to view your account orders or use the lookup box above to track a guest order.'}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              {(searchQuery || statusFilter !== 'ALL') && (
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                  className="px-5 py-2.5 rounded-xl border border-white/20 text-xs font-bold uppercase hover:bg-white/10"
                >
                  CLEAR FILTERS
                </button>
              )}
              <button
                onClick={onBackToShop}
                className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider"
              >
                EXPLORE CATALOG
              </button>
            </div>
          </div>
        ) : (
          /* Orders List Grid */
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer group space-y-4 ${
                  isDarkMode 
                    ? 'bg-[#0b0d10] border-white/10 hover:border-red-500/50 hover:bg-[#101318]' 
                    : 'bg-white border-slate-200 hover:border-black shadow-sm'
                }`}
              >
                {/* Order Summary Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 font-mono-tech text-xs">
                  
                  {/* Left info */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white font-mono tracking-wide">
                          {order.orderNumber}
                        </span>
                        {order.jobId && (
                          <span className="text-[10px] text-slate-400 border border-white/10 px-2 py-0.5 rounded font-mono">
                            {order.jobId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right badges & Total */}
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">ORDER TOTAL</span>
                      <span className="font-bold text-lg text-white font-mono">
                        <PriceDisplay amount={order.total} usdClassName="text-slate-300" />
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Items Teaser Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono-tech text-slate-400 uppercase font-bold">
                      ITEMS ({order.items.reduce((sum, item) => sum + item.quantity, 0)})
                    </span>
                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded-lg border border-white/10 bg-black/40"
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
                            <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-xs font-bold font-mono">
                              3D
                            </div>
                          )}
                          <div className="text-xs font-mono-tech leading-tight">
                            <p className="font-bold text-slate-200 truncate max-w-[120px]">{item.productName}</p>
                            <p className="text-[10px] text-slate-400">{item.quantity}x • {item.selectedColor}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs font-mono text-slate-400 font-bold">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address snippet */}
                  <div className="text-xs font-mono-tech text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5 flex items-start justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-300 block">SHIP TO:</span>
                      <p className="font-bold text-white truncate">{order.shippingAddress.fullName}</p>
                      <p className="text-[11px] truncate">{order.shippingAddress.addressLine1}, {order.shippingAddress.city} {order.shippingAddress.pincode}</p>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                      className="text-xs text-red-400 font-bold uppercase underline hover:text-red-300 self-center"
                    >
                      DETAILS
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-[#0c0e12] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/30">
                    3D PRINT MANUFACTURING ORDER
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech font-bold uppercase border ${getStatusBadge(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <h2 className="font-display font-bold text-2xl sm:text-3xl font-mono tracking-tight">
                    {selectedOrder.orderNumber}
                  </h2>
                  <button
                    onClick={() => handleCopyOrderNum(selectedOrder.orderNumber)}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                    title="Copy Order Number"
                  >
                    {copiedOrderNum ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs font-mono-tech text-slate-400 mt-1">
                  Placed on {formatDate(selectedOrder.createdAt)} {selectedOrder.jobId ? `• Job ID: ${selectedOrder.jobId}` : ''}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Manufacturing Pipeline & Production Progress */}
            <ProductionTracker
              currentStatus={selectedOrder.orderStatus}
              orderNumber={selectedOrder.orderNumber}
              estimatedDispatch={selectedOrder.deliveryMethod?.estDays || '2-4 Business Days'}
              deliveryAddress={`${selectedOrder.shippingAddress.fullName}, ${selectedOrder.shippingAddress.addressLine1}, ${selectedOrder.shippingAddress.city} - ${selectedOrder.shippingAddress.pincode}`}
              totalPaid={selectedOrder.total}
              isDarkMode={isDarkMode}
              showCardDetails={true}
            />

            {/* Shipping Address & Customer details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono-tech text-xs">
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 font-bold text-slate-300 uppercase pb-1 border-b border-white/10">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>SHIPPING ADDRESS</span>
                </div>
                <p className="font-bold text-white text-sm">{selectedOrder.shippingAddress.fullName}</p>
                <p className="text-slate-300">{selectedOrder.shippingAddress.addressLine1}</p>
                {selectedOrder.shippingAddress.addressLine2 && <p className="text-slate-300">{selectedOrder.shippingAddress.addressLine2}</p>}
                <p className="text-slate-300">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                <p className="text-slate-400 font-mono">Phone: {selectedOrder.shippingAddress.phone}</p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 font-bold text-slate-300 uppercase pb-1 border-b border-white/10">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>PAYMENT & LOGISTICS</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Status:</span>
                    <span className="font-bold text-emerald-400">{selectedOrder.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Method:</span>
                    <span className="font-bold">{selectedOrder.paymentMethod || 'UPI / Card'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shipping Option:</span>
                    <span className="font-bold">{selectedOrder.deliveryMethod?.name || 'Standard Air Express'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Delivery:</span>
                    <span className="font-bold">{selectedOrder.deliveryMethod?.estDays || '3-5 Business Days'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3 font-mono-tech">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                ORDER ITEMS ({selectedOrder.items.length})
              </h4>

              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 text-xs ${
                      isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-lg border border-white/10 bg-black"
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
                        <div className="w-12 h-12 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center font-bold">
                          3D
                        </div>
                      )}
                      <div>
                        <h5 className="font-bold text-white text-sm">{item.productName}</h5>
                        <p className="text-[11px] text-slate-400">
                          Color: <span className="text-slate-200 font-bold">{item.selectedColor}</span> • Qty: <span className="text-slate-200 font-bold">{item.quantity}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">LINE TOTAL</span>
                      <span className="font-bold text-white text-sm font-mono">
                        <PriceDisplay amount={item.subtotal || item.price * item.quantity} usdClassName="text-slate-300" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className={`p-4 rounded-2xl border font-mono-tech text-xs space-y-2 ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white font-bold"><PriceDisplay amount={selectedOrder.subtotal} usdClassName="text-slate-300" /></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span className="text-white font-bold">
                  {selectedOrder.shipping === 0 ? <span className="text-emerald-400">FREE</span> : <PriceDisplay amount={selectedOrder.shipping} usdClassName="text-slate-300" />}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18% Tax)</span>
                <span className="text-white font-bold"><PriceDisplay amount={selectedOrder.tax} usdClassName="text-slate-300" /></span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                <span>TOTAL AMOUNT</span>
                <span className="text-red-400 text-base font-mono">
                  <PriceDisplay amount={selectedOrder.total} usdClassName="text-slate-300" />
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono-tech">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>PRINT INVOICE</span>
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleReorder(selectedOrder)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>REORDER ITEMS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
