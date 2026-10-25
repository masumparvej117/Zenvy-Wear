import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryShowcase } from './components/CategoryShowcase';
import { FeaturedProductsShowcase } from './components/FeaturedProductsShowcase';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { InfoModals } from './components/InfoModals';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import {
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  MessageCircle,
} from 'lucide-react';

function Storefront() {
  const {
    products,
    categories,
    activeCategoryFilter,
    setActiveCategoryFilter,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct,
    settings,
  } = useShop();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      activeCategoryFilter === 'all' ||
      (activeCategoryFilter === 'featured' && prod.isFeatured) ||
      prod.category.toLowerCase() === activeCategoryFilter.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return b.isFeatured ? 1 : -1;
  });

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Categories Showcase */}
        <CategoryShowcase />

        {/* Featured Products & Sidebar (Exact Match to Reference Screenshot) */}
        <FeaturedProductsShowcase />



        {/* Product Catalog Section */}
        <section id="collection-grid" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-neutral-200 pb-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                COMPLETE CATALOG
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 font-display">
                All Collections & Styles
              </h2>
            </div>

            {/* Filter Tabs & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter Buttons (Functional Segmented Control) */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-xl">
                <button
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeCategoryFilter === 'all'
                      ? 'bg-white text-black shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  All ({products.length})
                </button>

                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategoryFilter(c.name)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      activeCategoryFilter.toLowerCase() === c.name.toLowerCase()
                        ? 'bg-white text-black shadow-xs'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}

                <button
                  onClick={() => setActiveCategoryFilter('featured')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeCategoryFilter === 'featured'
                      ? 'bg-white text-black shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Featured
                </button>
              </div>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-2 px-3 text-xs font-medium bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-xl focus:outline-none"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Search Badge */}
          {searchQuery && (
            <div className="mb-6 flex items-center justify-between bg-neutral-100 px-4 py-2 rounded-lg text-xs">
              <span className="text-neutral-700">
                Searching for: <strong className="text-black">"{searchQuery}"</strong> (
                {sortedProducts.length} results)
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-neutral-500 hover:text-black font-semibold uppercase tracking-wider"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Products Grid */}
          {sortedProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-base font-semibold text-neutral-800">No products found</p>
              <p className="text-xs text-neutral-500 mt-1">
                Try selecting a different category or clearing your search keywords.
              </p>
              <button
                onClick={() => {
                  setActiveCategoryFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-xs font-medium"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Promotional Campaign Callout */}
        <section className="bg-neutral-100 border-t border-b border-neutral-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-neutral-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
              <div className="space-y-4 max-w-xl z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  DIRECT ASSISTANCE & CUSTOM ORDERS
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-balance">
                  Need Help Choosing Your Fit or Sizing?
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Our dedicated styling team is available on WhatsApp to answer inquiries regarding sizes, fabric weight, and order delivery schedules.
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      'Hello ZENVY WEAR, I need styling assistance with sizing.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp (+8801757391262)</span>
                  </a>
                </div>
              </div>

              <div className="z-10 text-right space-y-2 border-t md:border-t-0 md:border-l border-neutral-800 pt-6 md:pt-0 md:pl-10 shrink-0">
                <div className="text-xs text-neutral-400">Official Brand Channel</div>
                <div className="text-lg font-bold text-white">facebook.com/zenvywear1</div>
                <div className="text-xs text-neutral-400 font-mono">zenvywear75@gmail.com</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Product Quick View / Purchase Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

function MainAppContent() {
  const { currentRoute, toast } = useShop();

  return (
    <>
      {/* Toast System */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-slideUp">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 max-w-sm ${
              toast.type === 'success'
                ? 'bg-neutral-900 text-white border-neutral-800'
                : toast.type === 'error'
                ? 'bg-red-950 text-red-100 border-red-800'
                : 'bg-neutral-900 text-neutral-200 border-neutral-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Route Router */}
      {currentRoute === 'admin' && <AdminDashboard />}
      {currentRoute === 'admin-login' && <AdminLogin />}
      {currentRoute === 'store' && <Storefront />}

      {/* Global Modals */}
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <CustomerAuthModal />
      <CustomerOrdersModal />
      <InfoModals />
    </>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <MainAppContent />
    </ShopProvider>
  );
}
