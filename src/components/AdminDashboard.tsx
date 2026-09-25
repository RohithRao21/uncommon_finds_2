import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, TrendingUp, ShoppingBag, Users, 
  Package, Plus, Edit2, Trash2, CheckCircle2, Clock, Search, Filter, 
  ArrowUpRight, ChevronRight, Eye, RefreshCw, AlertTriangle, Box, 
  Sparkles, X, Lock, Unlock, DollarSign, ArrowLeft, Check, Layers,
  BarChart2, FileText, ChevronDown, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product, ProductColor, CategoryType } from '../types';
import { 
  getProductsFromFirestore, 
  createProductInFirestore, 
  updateProductInFirestore, 
  deleteProductFromFirestore, 
  updateProductStockInFirestore 
} from '../lib/productsService';
import { db, collection, getDocs, doc, setDoc, updateDoc } from '../lib/firebase';
import { PriceDisplay } from './PriceDisplay';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import defaultProductImage from '../assets/images/p1/BLACK/p1-black-1.png';

interface AdminDashboardProps {
  onBackToShop: () => void;
  onProductsUpdated?: () => void;
  isDarkMode?: boolean;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: Array<{
    productId: string;
    productName: string;
    selectedColor: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  shippingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  jobId?: string;
  createdAt: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToShop,
  onProductsUpdated,
  isDarkMode = true,
}) => {
  const { currentUser, userProfile, updateUserRole, loginAsDemoUser } = useAuth();

  // Navigation sub-tabs
  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'overview' | 'orders' | 'products'>('analytics');

  // Passcode gate for demo switch
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  // Firestore Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [stockEditProduct, setStockEditProduct] = useState<Product | null>(null);

  // Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check if user is Admin
  const isAdmin = userProfile?.role === 'admin';

  // Load Admin Data from Firestore
  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    const loadAdminData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Products
        const fetchedProducts = await getProductsFromFirestore();
        setProducts(fetchedProducts);

        // 2. Fetch Orders
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const loadedOrders: AdminOrder[] = [];
        ordersSnap.forEach((d) => {
          const data = d.data();
          loadedOrders.push({
            id: d.id,
            orderNumber: data.orderNumber || `UF${100000 + Math.floor(Math.random() * 900)}`,
            userId: data.userId || 'guest',
            userEmail: data.userEmail || 'customer@example.com',
            userName: data.userName || data.shippingAddress?.fullName || 'Customer',
            items: data.items || [],
            shippingAddress: data.shippingAddress || data.shippingDetails,
            subtotal: Number(data.subtotal || data.totals?.subtotal || 0),
            shipping: Number(data.shipping || data.totals?.shippingFee || 0),
            tax: Number(data.tax || data.totals?.gstAmount || 0),
            total: Number(data.total || data.totalINR || data.totals?.grandTotal || 0),
            paymentStatus: data.paymentStatus || 'Paid',
            orderStatus: data.orderStatus || data.status || 'Pending',
            jobId: data.jobId || 'JOB-3D-998',
            createdAt: data.createdAt,
          });
        });

        // Sort orders newest first
        loadedOrders.sort((a, b) => {
          const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
          const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });

        setOrders(loadedOrders);

        // 3. Fetch Users Count
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          setUsersCount(usersSnap.size || 1);
        } catch (e) {
          // Fallback unique email count from orders
          const uniqueEmails = new Set(loadedOrders.map(o => o.userEmail));
          setUsersCount(uniqueEmails.size || 1);
        }
      } catch (err) {
        console.error('Error loading admin dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [isAdmin, refreshKey]);

  // Statistics calculations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  
  // Best selling products calculation from orders
  const bestSellersMap = new Map<string, { id: string; name: string; totalQty: number; revenue: number; image: string }>();
  orders.forEach(o => {
    o.items?.forEach(item => {
      const existing = bestSellersMap.get(item.productId) || {
        id: item.productId,
        name: item.productName || '3D Printed Specimen',
        totalQty: 0,
        revenue: 0,
        image: item.image || '',
      };
      existing.totalQty += item.quantity || 1;
      existing.revenue += (item.price || 0) * (item.quantity || 1);
      bestSellersMap.set(item.productId, existing);
    });
  });

  const bestSellingProducts = Array.from(bestSellersMap.values())
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 5);

  // Handle Elevating Role to Admin
  const handleElevateRole = async () => {
    setIsSwitchingRole(true);
    setPasscodeError('');
    try {
      if (!currentUser) {
        // Log in as demo admin user
        await loginAsDemoUser('admin@voxelform.tech', 'Admin Chief');
      }
      await updateUserRole('admin');
      showToast('Admin rights granted successfully!');
    } catch (err) {
      setPasscodeError('Failed to elevate user role.');
    } finally {
      setIsSwitchingRole(false);
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newOrderStatus: string, newPaymentStatus?: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updatePayload: any = {
        orderStatus: newOrderStatus,
        status: newOrderStatus,
      };
      if (newPaymentStatus) {
        updatePayload.paymentStatus = newPaymentStatus;
      }

      await updateDoc(orderRef, updatePayload);

      // Local state sync
      setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        orderStatus: newOrderStatus, 
        ...(newPaymentStatus ? { paymentStatus: newPaymentStatus } : {}) 
      } : o));

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { 
          ...prev, 
          orderStatus: newOrderStatus, 
          ...(newPaymentStatus ? { paymentStatus: newPaymentStatus } : {}) 
        } : null);
      }

      showToast(`Order status updated to ${newOrderStatus}`);
    } catch (err) {
      console.error('Failed to update order status:', err);
      showToast('Failed to update order status');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProductFromFirestore(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeletingProductId(null);
      if (onProductsUpdated) onProductsUpdated();
      showToast('Product removed from catalog');
    } catch (err) {
      console.error('Failed to delete product:', err);
      showToast('Error deleting product');
    }
  };

  // Handle Stock Update for Variant
  const handleSaveVariantStock = async (product: Product, updatedColors: ProductColor[]) => {
    try {
      await updateProductStockInFirestore(product.id, updatedColors);
      const totalStock = updatedColors.reduce((acc, c) => acc + (c.stock || 0), 0);
      setProducts(prev => prev.map(p => p.id === product.id ? { 
        ...p, 
        colors: updatedColors,
        stockCount: totalStock,
        inStock: totalStock > 0
      } : p));
      setStockEditProduct(null);
      if (onProductsUpdated) onProductsUpdated();
      showToast(`Inventory updated for ${product.name}`);
    } catch (err) {
      console.error('Failed to update stock:', err);
      showToast('Error updating inventory stock');
    }
  };

  // Render Access Protection Screen if NOT Admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070709] text-white py-16 px-4 flex items-center justify-center font-mono-tech">
        <div className="max-w-md w-full bg-[#121216] border border-red-500/30 rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-red-950/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-0" />

          <div className="flex items-center gap-3 text-red-500 mb-6">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-red-400 font-bold">Access Restricted</div>
              <h1 className="text-xl font-bold font-display text-white tracking-wide">ADMIN AUTHENTICATION</h1>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            The Voxelform Admin Dashboard requires <span className="text-white font-bold">role="admin"</span> permissions.
            {currentUser ? (
              <span className="block mt-2 text-slate-300">
                Logged in as: <span className="text-red-400 font-mono">{currentUser.email}</span> (Current Role: <span className="text-amber-400 font-bold">{userProfile?.role || 'customer'}</span>)
              </span>
            ) : (
              <span className="block mt-2 text-amber-400">
                You are currently browsing as a guest.
              </span>
            )}
          </p>

          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Switch Role to Admin
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                To test the Admin Dashboard, elevate your user session to Admin role.
              </p>
              <button
                onClick={handleElevateRole}
                disabled={isSwitchingRole}
                className="w-full py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSwitchingRole ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
                <span>ELEVATE TO ADMIN ROLE</span>
              </button>
            </div>

            <button
              onClick={onBackToShop}
              className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO SHOP</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered lists for orders and products
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.userName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(orderSearch.toLowerCase());
    
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus.toLowerCase() === orderStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#070709] text-white font-mono-tech pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-5 py-3 rounded-xl shadow-2xl shadow-red-600/40 border border-red-400 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <header className="bg-[#0f0f14] border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-xl bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToShop}
              className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Back to Storefront"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[10px] uppercase rounded">
                  PROTECTED ROUTE
                </span>
                <span className="text-xs text-slate-400">ROLE: <strong className="text-white font-bold">ADMIN</strong></span>
              </div>
              <h1 className="text-xl font-bold font-display text-white tracking-wide flex items-center gap-2">
                VOXELFORM COMMAND CENTER
              </h1>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 bg-[#16161f] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveAdminTab('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'analytics'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>ANALYTICS</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('overview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'overview'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>OVERVIEW</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('orders')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'orders'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ORDERS ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('products')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'products'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>PRODUCTS ({products.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
            <p className="text-xs uppercase tracking-widest font-bold">Synchronizing Firestore Telemetry...</p>
          </div>
        ) : (
          <>
            {/* TAB 0: ANALYTICS DASHBOARD */}
            {activeAdminTab === 'analytics' && (
              <AnalyticsDashboard
                orders={orders}
                products={products}
                usersCount={usersCount}
                isDarkMode={isDarkMode}
              />
            )}

            {/* TAB 1: OVERVIEW & DASHBOARD STATISTICS */}
            {activeAdminTab === 'overview' && (
              <div className="space-y-8">
                {/* 4 Hero Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenue Card */}
                  <div className="bg-[#111116] border border-slate-800/90 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-red-500/40 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">TOTAL REVENUE</span>
                      <div className="p-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1">
                      <PriceDisplay amount={totalRevenue} currencySymbol="₹" />
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>Live sales calculated across all completed orders</span>
                    </div>
                  </div>

                  {/* Orders Count Card */}
                  <div className="bg-[#111116] border border-slate-800/90 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-red-500/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">TOTAL ORDERS</span>
                      <div className="p-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1">
                      {totalOrdersCount}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                      <span>{orders.filter(o => o.orderStatus === 'Pending').length} Pending • {orders.filter(o => o.orderStatus === 'Printing').length} Printing</span>
                    </div>
                  </div>

                  {/* Customers Count Card */}
                  <div className="bg-[#111116] border border-slate-800/90 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-red-500/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">TOTAL CUSTOMERS</span>
                      <div className="p-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1">
                      {usersCount}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      Registered customer accounts & guest checkout buyers
                    </div>
                  </div>

                  {/* Catalog Products Card */}
                  <div className="bg-[#111116] border border-slate-800/90 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-red-500/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">ACTIVE PRODUCTS</span>
                      <div className="p-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1">
                      {products.length}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      {products.reduce((acc, p) => acc + (p.colors?.reduce((s, c) => s + (c.stock || 0), 0) || 0), 0)} Total units in stock
                    </div>
                  </div>
                </div>

                {/* Best Selling Products & Recent Orders Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Best Selling Products List (1 col) */}
                  <div className="bg-[#111116] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white">BEST SELLING PRODUCTS</h2>
                      </div>
                      <span className="text-[10px] text-slate-400">By units sold</span>
                    </div>

                    {bestSellingProducts.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No product sales recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-4 flex-1">
                        {bestSellingProducts.map((p, idx) => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-[#181820] border border-slate-800/80 rounded-xl hover:border-red-500/30 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center font-mono">
                                #{idx + 1}
                              </div>
                              {p.image && (
                                <img 
                                  src={p.image} 
                                  alt={p.name} 
                                  onError={(e) => {
                                    const t = e.currentTarget;
                                    if (t.dataset.failed) return;
                                    t.dataset.failed = 'true';
                                    t.src = defaultProductImage;
                                  }}
                                  className="w-10 h-10 object-cover rounded-lg bg-black" 
                                />
                              )}
                              <div>
                                <h3 className="text-xs font-bold text-white line-clamp-1">{p.name}</h3>
                                <p className="text-[10px] text-slate-400 font-mono">{p.totalQty} units sold</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold font-mono text-emerald-400">
                                <PriceDisplay amount={p.revenue} currencySymbol="₹" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Orders Overview Table (2 cols) */}
                  <div className="lg:col-span-2 bg-[#111116] border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-400" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white">RECENT ORDERS</h2>
                      </div>
                      <button
                        onClick={() => setActiveAdminTab('orders')}
                        className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <span>VIEW ALL</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No orders placed in Firestore database.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                              <th className="py-2 px-3">ORDER #</th>
                              <th className="py-2 px-3">CUSTOMER</th>
                              <th className="py-2 px-3">ITEMS</th>
                              <th className="py-2 px-3">TOTAL</th>
                              <th className="py-2 px-3">STATUS</th>
                              <th className="py-2 px-3 text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {orders.slice(0, 6).map((order) => (
                              <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="py-3 px-3 font-mono font-bold text-red-400">
                                  {order.orderNumber}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-bold text-white line-clamp-1">{order.userName}</div>
                                  <div className="text-[10px] text-slate-400 line-clamp-1">{order.userEmail}</div>
                                </td>
                                <td className="py-3 px-3 font-mono text-slate-300">
                                  {order.items?.length || 0} item(s)
                                </td>
                                <td className="py-3 px-3 font-mono font-bold text-white">
                                  <PriceDisplay amount={order.total} currencySymbol="₹" />
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    order.orderStatus === 'Delivered' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                                    order.orderStatus === 'Shipped' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' :
                                    order.orderStatus === 'Printing' ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' :
                                    'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                                  }`}>
                                    {order.orderStatus}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                                    title="View order details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ORDERS MANAGEMENT */}
            {activeAdminTab === 'orders' && (
              <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="bg-[#111116] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search order #, customer name or email..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#181820] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400 uppercase">Status:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="bg-[#181820] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="all">ALL ORDERS ({orders.length})</option>
                      <option value="pending">PENDING</option>
                      <option value="processing">PROCESSING</option>
                      <option value="printing">PRINTING</option>
                      <option value="shipped">SHIPPED</option>
                      <option value="delivered">DELIVERED</option>
                    </select>
                  </div>
                </div>

                {/* Orders List Table */}
                <div className="bg-[#111116] border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                          <th className="py-3 px-4">ORDER NUMBER</th>
                          <th className="py-3 px-4">CUSTOMER & CONTACT</th>
                          <th className="py-3 px-4">ITEMS</th>
                          <th className="py-3 px-4">TOTAL</th>
                          <th className="py-3 px-4">ORDER STATUS</th>
                          <th className="py-3 px-4">PAYMENT STATUS</th>
                          <th className="py-3 px-4 text-right">MANAGE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                              No orders found matching the search filters.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-4 px-4 font-mono font-bold text-red-400">
                                <div>{order.orderNumber}</div>
                                {order.jobId && <div className="text-[10px] text-slate-500">{order.jobId}</div>}
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-bold text-white">{order.userName}</div>
                                <div className="text-[10px] text-slate-400">{order.userEmail}</div>
                                {order.shippingAddress?.phone && (
                                  <div className="text-[10px] text-slate-500">{order.shippingAddress.phone}</div>
                                )}
                              </td>
                              <td className="py-4 px-4 font-mono">
                                <div className="text-white font-bold">{order.items?.length || 0} item(s)</div>
                                <div className="text-[10px] text-slate-400 line-clamp-1">
                                  {order.items?.map(i => i.productName).join(', ')}
                                </div>
                              </td>
                              <td className="py-4 px-4 font-mono font-bold text-white text-sm">
                                <PriceDisplay amount={order.total} currencySymbol="₹" />
                              </td>
                              <td className="py-4 px-4">
                                <select
                                  value={order.orderStatus}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none ${
                                    order.orderStatus === 'Delivered' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' :
                                    order.orderStatus === 'Shipped' ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' :
                                    order.orderStatus === 'Packed' ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' :
                                    order.orderStatus === 'Quality Inspection' ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' :
                                    order.orderStatus === 'Crafting Your Product' || order.orderStatus === 'Printing' ? 'bg-red-500/10 border-red-500/40 text-red-400' :
                                    order.orderStatus === 'Preparing Production' ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' :
                                    'bg-slate-800 border-slate-700 text-slate-300'
                                  }`}
                                >
                                  <option value="Order Confirmed" className="bg-slate-900 text-slate-300">Order Confirmed</option>
                                  <option value="Preparing Production" className="bg-slate-900 text-amber-400">Preparing Production</option>
                                  <option value="Crafting Your Product" className="bg-slate-900 text-red-400">Crafting Your Product</option>
                                  <option value="Quality Inspection" className="bg-slate-900 text-purple-400">Quality Inspection</option>
                                  <option value="Packed" className="bg-slate-900 text-indigo-400">Packed</option>
                                  <option value="Shipped" className="bg-slate-900 text-blue-400">Shipped</option>
                                  <option value="Delivered" className="bg-slate-900 text-emerald-400">Delivered</option>
                                  <option value="Cancelled" className="bg-slate-900 text-slate-500">Cancelled</option>
                                </select>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                                  order.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                  'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>DETAILS</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRODUCTS & STOCK MANAGEMENT */}
            {activeAdminTab === 'products' && (
              <div className="space-y-6">
                {/* Product Search & Create Action Bar */}
                <div className="bg-[#111116] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search products by name..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[#181820] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>

                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="bg-[#181820] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer w-full sm:w-auto"
                    >
                      <option value="all">ALL CATEGORIES</option>
                      <option value="lighter">Lighter Sleeves</option>
                      <option value="desk">Desk Organizers</option>
                      <option value="edc">EDC Accessories</option>
                      <option value="audio">Audio Gear</option>
                      <option value="parametric">Parametric Sculptures</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsCreateProductOpen(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>CREATE NEW PRODUCT</span>
                  </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => {
                    const totalStock = prod.colors?.reduce((s, c) => s + (c.stock || 0), 0) || 0;

                    return (
                      <div key={prod.id} className="bg-[#111116] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-red-500/40 transition-all">
                        {/* Thumbnail Image */}
                        <div className="relative aspect-video bg-black overflow-hidden">
                          <img
                            src={prod.image || prod.colors?.[0]?.images?.[0] || defaultProductImage}
                            alt={prod.name}
                            onError={(e) => {
                              const t = e.currentTarget;
                              if (t.dataset.failed) return;
                              t.dataset.failed = 'true';
                              t.src = defaultProductImage;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-2 py-0.5 bg-black/80 backdrop-blur border border-slate-700 text-white font-bold text-[10px] uppercase rounded">
                              {prod.category}
                            </span>
                            {prod.isBestseller && (
                              <span className="px-2 py-0.5 bg-amber-500/80 text-black font-bold text-[10px] uppercase rounded">
                                BESTSELLER
                              </span>
                            )}
                            {(prod.isSpecialEdition || prod.id === 'soap-bar-lighter-sleeve' || prod.slug?.includes('soap')) && (
                              <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] uppercase rounded">
                                SPECIAL EDITION • FIGHT CLUB
                              </span>
                            )}
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                              totalStock > 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-red-500/20 text-red-400 border-red-500/40'
                            }`}>
                              {totalStock > 0 ? `${totalStock} IN STOCK` : 'OUT OF STOCK'}
                            </span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-white text-base tracking-wide leading-tight">{prod.name}</h3>
                              <span className="font-mono font-bold text-red-400 text-base">
                                <PriceDisplay amount={prod.price} currencySymbol="₹" />
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prod.tagline || prod.description}</p>
                          </div>

                          {/* Color Variants Stock Breakdown */}
                          <div className="bg-[#181820] p-3 rounded-xl border border-slate-800 space-y-2">
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex justify-between">
                              <span>COLOR VARIANTS ({prod.colors?.length || 0})</span>
                              <span>STOCK</span>
                            </div>
                            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                              {prod.colors?.map((c) => (
                                <div key={c.name} className="flex items-center justify-between text-xs py-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span 
                                      className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block"
                                      style={{ backgroundColor: c.hexColor || '#333' }}
                                    />
                                    <span className="text-slate-300 text-[11px]">{c.name}</span>
                                  </div>
                                  <span className={`font-mono text-[11px] font-bold ${c.stock > 0 ? 'text-slate-200' : 'text-red-400'}`}>
                                    {c.stock} units
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                            <button
                              onClick={() => setStockEditProduct(prod)}
                              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Update inventory stock"
                            >
                              <Package className="w-3.5 h-3.5" />
                              <span>STOCK</span>
                            </button>

                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Edit product details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>EDIT</span>
                            </button>

                            <button
                              onClick={() => setDeletingProductId(prod.id)}
                              className="py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold uppercase rounded-lg border border-red-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>DELETE</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL 1: ORDER DETAILS & STATUS UPDATE */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121218] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-white">ORDER DETAILS #{selectedOrder.orderNumber}</h2>
                <p className="text-xs text-slate-400 font-mono">Job ID: {selectedOrder.jobId || 'JOB-3D-PREP'}</p>
              </div>
            </div>

            {/* Quick Status Update Box */}
            <div className="bg-[#181822] p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  UPDATE ORDER STATUS
                </label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full bg-[#0a0a0d] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-red-500 focus:outline-none cursor-pointer"
                >
                  <option value="Order Confirmed">1. Order Confirmed</option>
                  <option value="Preparing Production">2. Preparing Production</option>
                  <option value="Crafting Your Product">3. Crafting Your Product</option>
                  <option value="Quality Inspection">4. Quality Inspection</option>
                  <option value="Packed">5. Packed</option>
                  <option value="Shipped">6. Shipped</option>
                  <option value="Delivered">7. Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  UPDATE PAYMENT STATUS
                </label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, selectedOrder.orderStatus, e.target.value)}
                  className="w-full bg-[#0a0a0d] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-red-500 focus:outline-none cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#181822] p-4 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block mb-2">CUSTOMER DETAILS</span>
                <p className="font-bold text-white text-sm">{selectedOrder.userName}</p>
                <p className="text-slate-300 mt-0.5">{selectedOrder.userEmail}</p>
                <p className="text-slate-400 font-mono mt-0.5">{selectedOrder.shippingAddress?.phone}</p>
              </div>

              <div className="bg-[#181822] p-4 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block mb-2">SHIPPING ADDRESS</span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedOrder.shippingAddress?.addressLine1}
                  {selectedOrder.shippingAddress?.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                  <br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  <br />
                  {selectedOrder.shippingAddress?.country || 'India'}
                </p>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">LINE ITEMS ({selectedOrder.items?.length || 0})</span>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#181822] p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.productName} 
                          onError={(e) => {
                            const t = e.currentTarget;
                            if (t.dataset.failed) return;
                            t.dataset.failed = 'true';
                            t.src = defaultProductImage;
                          }}
                          className="w-12 h-12 object-cover rounded-lg bg-black" 
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-white text-xs">{item.productName}</h4>
                        <p className="text-[10px] text-slate-400">Color Variant: <span className="text-slate-200">{item.selectedColor}</span></p>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-xs text-slate-300">{item.quantity} x <PriceDisplay amount={item.price} currencySymbol="₹" /></p>
                      <p className="text-xs font-bold text-white"><PriceDisplay amount={item.price * item.quantity} currencySymbol="₹" /></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="bg-[#181822] p-4 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span><PriceDisplay amount={selectedOrder.subtotal} currencySymbol="₹" /></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18%):</span>
                <span><PriceDisplay amount={selectedOrder.tax} currencySymbol="₹" /></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping:</span>
                <span><PriceDisplay amount={selectedOrder.shipping} currencySymbol="₹" /></span>
              </div>
              <div className="flex justify-between text-white text-sm font-bold pt-2 border-t border-slate-700">
                <span>GRAND TOTAL:</span>
                <span className="text-red-400"><PriceDisplay amount={selectedOrder.total} currencySymbol="₹" /></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE STOCK PER COLOR VARIANT */}
      {stockEditProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121218] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setStockEditProduct(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-white">UPDATE INVENTORY STOCK</h2>
                <p className="text-xs text-slate-400">{stockEditProduct.name}</p>
              </div>
            </div>

            <div className="space-y-3">
              {stockEditProduct.colors?.map((color, idx) => (
                <div key={color.name} className="flex items-center justify-between bg-[#181822] p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: color.hexColor || '#333' }}
                    />
                    <span className="text-xs font-bold text-white">{color.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newColors = [...stockEditProduct.colors];
                        newColors[idx].stock = Math.max(0, newColors[idx].stock - 1);
                        setStockEditProduct({ ...stockEditProduct, colors: newColors });
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>

                    <input
                      type="number"
                      value={color.stock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const newColors = [...stockEditProduct.colors];
                        newColors[idx].stock = Math.max(0, val);
                        setStockEditProduct({ ...stockEditProduct, colors: newColors });
                      }}
                      className="w-16 bg-[#0a0a0d] border border-slate-700 rounded-lg py-1 px-2 text-center text-xs font-mono font-bold text-white"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const newColors = [...stockEditProduct.colors];
                        newColors[idx].stock = newColors[idx].stock + 1;
                        setStockEditProduct({ ...stockEditProduct, colors: newColors });
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStockEditProduct(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => handleSaveVariantStock(stockEditProduct, stockEditProduct.colors)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/30 cursor-pointer"
              >
                SAVE STOCK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE OR EDIT PRODUCT FORM */}
      {(isCreateProductOpen || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsCreateProductOpen(false);
            setEditingProduct(null);
          }}
          onSave={async (savedData) => {
            if (editingProduct) {
              await updateProductInFirestore(editingProduct.id, savedData);
              setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...savedData } as Product : p));
              showToast('Product updated successfully!');
            } else {
              const newId = await createProductInFirestore(savedData);
              const newProd: Product = {
                id: newId,
                slug: savedData.slug || newId,
                name: savedData.name || 'New Product',
                tagline: savedData.tagline || '',
                description: savedData.description || '',
                price: Number(savedData.price) || 0,
                category: (savedData.category as CategoryType) || 'lighter',
                colors: savedData.colors || [],
                rating: 5.0,
                reviewCount: 0,
                storyHeading: 'Crafted with Precision',
                storyBody: savedData.description || '',
                isNew: true,
                isBestseller: false,
                specs: savedData.specs || {
                  layerHeight: '0.12 mm',
                  infillType: '100% Perimeter',
                  printTime: '2 Hours',
                  weight: '30g',
                  nozzleSize: '0.4mm',
                  durabilityRating: 'Industrial Toughness'
                }
              };
              setProducts(prev => [newProd, ...prev]);
              showToast('New product created successfully!');
            }
            if (onProductsUpdated) onProductsUpdated();
            setIsCreateProductOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* MODAL 4: CONFIRM DELETE PRODUCT */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121218] border border-red-500/40 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-display">DELETE PRODUCT</h3>
              <p className="text-xs text-slate-400 mt-1">Are you sure you want to remove this product from Firestore? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleDeleteProduct(deletingProductId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/30 cursor-pointer"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for Create / Edit Product Modal
interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [price, setPrice] = useState(product?.price?.toString() || '249');
  const [category, setCategory] = useState<string>(product?.category || 'lighter');
  const [tagline, setTagline] = useState(product?.tagline || '');
  const [description, setDescription] = useState(product?.description || '');
  const [isBestseller, setIsBestseller] = useState(product?.isBestseller || false);
  const [isNew, setIsNew] = useState(product?.isNew !== undefined ? product.isNew : true);

  // Variants state
  const [colors, setColors] = useState<ProductColor[]>(
    product?.colors && product.colors.length > 0
      ? product.colors
      : [
          { name: 'Onyx Black', stock: 20, hexColor: '#161616', images: [defaultProductImage] },
          { name: 'Frost White', stock: 15, hexColor: '#f2f2f7', images: [defaultProductImage] }
        ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        price: Number(price) || 0,
        category: category as CategoryType,
        tagline,
        description,
        isBestseller,
        isNew,
        colors,
      });
    } catch (err) {
      console.error('Failed to submit product form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddColorVariant = () => {
    setColors(prev => [
      ...prev,
      { name: 'New Color Variant', stock: 10, hexColor: '#333333', images: [defaultProductImage] }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121218] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative font-mono-tech">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-white">
              {product ? 'EDIT PRODUCT' : 'CREATE NEW PRODUCT'}
            </h2>
            <p className="text-xs text-slate-400">Manage catalog specifications & stock variants</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!product) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                }}
                placeholder="e.g. Ripple Lighter Sleeve"
                className="w-full bg-[#181822] border border-slate-800 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Slug / URL Identifier</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. ripple-lighter-sleeve"
                className="w-full bg-[#181822] border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Price (₹ INR) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="249"
                className="w-full bg-[#181822] border border-slate-800 rounded-xl p-3 text-white font-mono font-bold focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#181822] border border-slate-800 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="lighter">Lighter Sleeves</option>
                <option value="desk">Desk Organizers</option>
                <option value="edc">EDC Accessories</option>
                <option value="audio">Audio Gear</option>
                <option value="parametric">Parametric Sculptures</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short catchy feature highlight..."
              className="w-full bg-[#181822] border border-slate-800 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Full Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of materials, ergonomics and finish..."
              className="w-full bg-[#181822] border border-slate-800 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-6 py-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-[#181822] border-slate-700"
              />
              <span className="text-xs text-slate-300 font-bold">Mark as Bestseller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-[#181822] border-slate-700"
              />
              <span className="text-xs text-slate-300 font-bold">Mark as New Release</span>
            </label>
          </div>

          {/* Color Variants Editor */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                COLOR VARIANTS & INITIAL STOCK
              </label>
              <button
                type="button"
                onClick={handleAddColorVariant}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD VARIANT</span>
              </button>
            </div>

            <div className="space-y-2">
              {colors.map((c, idx) => (
                <div key={idx} className="bg-[#181822] p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Variant Name"
                      value={c.name}
                      onChange={(e) => {
                        const updated = [...colors];
                        updated[idx].name = e.target.value;
                        setColors(updated);
                      }}
                      className="bg-[#0f0f14] border border-slate-700 rounded-lg p-2 text-white text-xs"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={c.hexColor || '#161616'}
                        onChange={(e) => {
                          const updated = [...colors];
                          updated[idx].hexColor = e.target.value;
                          setColors(updated);
                        }}
                        className="w-9 h-9 bg-[#0f0f14] border border-slate-700 rounded-lg p-1 cursor-pointer"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={c.stock}
                        onChange={(e) => {
                          const updated = [...colors];
                          updated[idx].stock = parseInt(e.target.value) || 0;
                          setColors(updated);
                        }}
                        className="w-full bg-[#0f0f14] border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={c.images?.[0] || ''}
                        onChange={(e) => {
                          const updated = [...colors];
                          updated[idx].images = [e.target.value];
                          setColors(updated);
                        }}
                        className="w-full bg-[#0f0f14] border border-slate-700 rounded-lg p-2 text-white text-xs"
                      />
                      {colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setColors(colors.filter((_, i) => i !== idx))}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{product ? 'SAVE CHANGES' : 'CREATE PRODUCT'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
