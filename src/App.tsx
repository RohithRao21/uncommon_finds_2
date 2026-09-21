import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CustomPrintStudio } from './components/CustomPrintStudio';
import { BrandStorySection } from './components/BrandStorySection';
import { CheckoutModal } from './components/CheckoutModal';
import { Footer } from './components/Footer';
import { AboutPage } from './components/AboutPage';
import { AuthModal } from './components/AuthModal';
import { UserAccountDrawer } from './components/UserAccountDrawer';
import { CartToastNotification } from './components/CartToastNotification';
import { WishlistPage } from './components/WishlistPage';
import { CheckoutPage } from './components/CheckoutPage';
import { MyOrdersPage } from './components/MyOrdersPage';
import { AdminDashboard } from './components/AdminDashboard';

import { Product, CategoryType, CartItem, MaterialType } from './types';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { getProductsFromFirestore } from './lib/productsService';
import { PRODUCTS } from './data/products';

export default function App() {
  const { currentUser, userProfile } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'shop' | 'about' | 'wishlist' | 'checkout' | 'orders' | 'admin'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [gridCols, setGridCols] = useState<number>(3);
  const [currency, setCurrency] = useState<string>('INR');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState<boolean>(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  // Fetch products from Firestore
  const loadCatalog = async () => {
    try {
      const firestoreProducts = await getProductsFromFirestore();
      if (firestoreProducts && firestoreProducts.length > 0) {
        setProducts(firestoreProducts);
      }
    } catch (err) {
      console.error('Failed to load catalog from Firestore, using local catalog:', err);
      setProducts(PRODUCTS);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Keep selectedProductForModal synced with latest products state
  const activeModalProduct = useMemo(() => {
    if (!selectedProductForModal) return null;
    return products.find(p => p.id === selectedProductForModal.id) || selectedProductForModal;
  }, [products, selectedProductForModal]);

  const currencySymbol = useMemo(() => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '₹';
    }
  }, [currency]);

  // Filter & Sort Products dynamically from Firestore
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        product.name.toLowerCase().includes(q) ||
        (product.tagline && product.tagline.toLowerCase().includes(q)) ||
        product.description.toLowerCase().includes(q) ||
        (product.specs && product.specs.infillType.toLowerCase().includes(q)) ||
        (product.colors && product.colors.some(c => c.name.toLowerCase().includes(q))) ||
        (product.availableMaterials && product.availableMaterials.some(m => m.name.toLowerCase().includes(q)))
      );
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'bestsellers') return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'speed' && a.specs && b.specs) return parseFloat(a.specs.printTime) - parseFloat(b.specs.printTime);
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      return 0; // Default featured
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Quick Add handler from product card
  const handleQuickAdd = (product: Product, selectedMaterial: MaterialType) => {
    const colorObj = product.colors?.find(c => c.name === selectedMaterial) || product.colors?.[0];
    const unitPrice = product.price;
    const stock = colorObj ? colorObj.stock : 99;

    addToCart({
      productId: product.id,
      productName: product.name,
      selectedColor: selectedMaterial,
      price: unitPrice,
      image: colorObj?.images?.[0] || product.image,
      quantity: 1,
      maxStock: stock,
      product: product,
    });
  };

  const getGridClass = () => {
    if (gridCols === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (gridCols === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'; // Default 4 Bento Grid
  };

  return (
    <div className={`relative min-h-screen font-sans-clean transition-colors duration-300 ${
      isDarkMode ? 'bg-[#000000] text-[#e2e8f0]' : 'bg-[#ffffff] text-slate-900'
    }`}>
      
      {/* Stationary White/Dark Dot Matrix Background (Nothing Tech Style) */}
      <div 
        className={`fixed inset-0 pointer-events-none z-20 opacity-60 mix-blend-difference ${
          isDarkMode ? 'bg-stationary-dots' : 'bg-stationary-dots-light'
        }`}
      />
      
      {/* Sticky Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomStudio={() => setIsCustomStudioOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveTab('shop');
          const el = document.getElementById('catalog-grid');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currency={currency}
        onChangeCurrency={setCurrency}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAccount={() => setIsAccountDrawerOpen(true)}
      />

      {activeTab === 'admin' ? (
        <AdminDashboard
          onBackToShop={() => {
            loadCatalog();
            setActiveTab('shop');
          }}
          onProductsUpdated={loadCatalog}
          isDarkMode={isDarkMode}
        />
      ) : activeTab === 'checkout' ? (
        <CheckoutPage
          onBackToShop={() => setActiveTab('shop')}
          onViewOrders={() => setActiveTab('orders')}
          currencySymbol={currencySymbol}
          isDarkMode={isDarkMode}
          currentUser={currentUser}
          discountAmount={appliedDiscount}
        />
      ) : activeTab === 'orders' ? (
        <MyOrdersPage
          onBackToShop={() => setActiveTab('shop')}
          isDarkMode={isDarkMode}
        />
      ) : activeTab === 'about' ? (
        <AboutPage
          isDarkMode={isDarkMode}
          onNavigateShop={() => setActiveTab('shop')}
        />
      ) : activeTab === 'wishlist' ? (
        <WishlistPage
          products={products}
          onSelectProduct={(p) => setSelectedProductForModal(p)}
          onOpenShop={() => setActiveTab('shop')}
          currencySymbol={currencySymbol}
          isDarkMode={isDarkMode}
        />
      ) : (
        <>
          {/* Hero Banner Section */}
          <HeroBanner
            onExploreClick={() => {
              const el = document.getElementById('catalog-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenCustomStudio={() => setIsCustomStudioOpen(true)}
            isDarkMode={isDarkMode}
          />

          {/* Category Filter & View Controls */}
          <div id="catalog-grid">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              gridCols={gridCols}
              onGridColsChange={setGridCols}
              totalCount={filteredProducts.length}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Product Catalog Grid */}
          <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 font-mono-tech">
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="space-y-3">
                    <div className={`aspect-square w-full ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-slate-200'}`} />
                    <div className={`h-4 w-3/4 ${isDarkMode ? 'bg-white/10' : 'bg-slate-300'}`} />
                    <div className={`h-4 w-1/4 ${isDarkMode ? 'bg-white/10' : 'bg-slate-300'}`} />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={`border border-dashed p-12 sm:p-20 text-center space-y-4 max-w-2xl mx-auto my-6 font-mono-tech ${
                isDarkMode 
                  ? 'border-[#2c2c2e] bg-[#000000]/50 text-white' 
                  : 'border-slate-300 bg-slate-50 text-slate-900'
              }`}>
                <div className={`text-xs tracking-widest uppercase ${
                  isDarkMode ? 'text-[#8e8e93]' : 'text-slate-500'
                }`}>
                  EMPTY CATALOG
                </div>
                <h3 className={`text-2xl sm:text-4xl font-extrabold tracking-tight uppercase ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  No products found
                </h3>
                <p className={`text-xs font-sans-clean leading-relaxed max-w-md mx-auto ${
                  isDarkMode ? 'text-[#8e8e93]' : 'text-slate-600'
                }`}>
                  Tell me in chat what to add first — a name, a short description, and a price. I'll create it in your store.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className={`mt-4 px-6 py-2.5 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'bg-white text-black hover:bg-[#e5e5ea]' 
                      : 'bg-slate-900 text-white hover:bg-black'
                  }`}
                >
                  RESET ALL FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={idx + 1}
                    onSelectProduct={(p) => setSelectedProductForModal(p)}
                    onQuickAdd={handleQuickAdd}
                    currencySymbol={currencySymbol}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Brand Genetics Philosophy Section */}
          <BrandStorySection isDarkMode={isDarkMode} />
        </>
      )}

      {/* Footer */}
      <Footer
        onOpenCustomStudio={() => setIsCustomStudioOpen(true)}
        isDarkMode={isDarkMode}
        onNavigateShop={() => setActiveTab('shop')}
        onNavigateAbout={() => setActiveTab('about')}
      />

      {/* Global Toast Alert Notification when items are added to cart */}
      <CartToastNotification
        onOpenCart={() => setIsCartOpen(true)}
        isDarkMode={isDarkMode}
      />

      {/* Interactive Apple-Style Product Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setSelectedProductForModal(null)}
        onOpenCart={() => setIsCartOpen(true)}
        currencySymbol={currencySymbol}
        isDarkMode={isDarkMode}
      />

      {/* DailyObjects Side Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={(discount) => {
          setAppliedDiscount(discount);
          setIsCartOpen(false);
          setActiveTab('checkout');
        }}
        currencySymbol={currencySymbol}
        isDarkMode={isDarkMode}
      />

      {/* Custom Print CAD Studio Modal */}
      <CustomPrintStudio
        isOpen={isCustomStudioOpen}
        onClose={() => setIsCustomStudioOpen(false)}
        currencySymbol={currencySymbol}
        isDarkMode={isDarkMode}
      />

      {/* Live Print Order Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        discountAmount={appliedDiscount}
        currencySymbol={currencySymbol}
        isDarkMode={isDarkMode}
        currentUser={currentUser}
      />

      {/* Optional User Login/Register Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* User Account & Order History Drawer */}
      <UserAccountDrawer
        isOpen={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}
