import React, { useState } from 'react';
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  Menu,
  X,
  Shield,
  Heart,
  Facebook,
  Instagram,
  Youtube,
  Package,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export function Navbar() {
  const {
    user,
    isAdmin,
    cartCount,
    wishlistCount,
    setIsCartOpen,
    setAuthModal,
    setIsMyOrdersOpen,
    setActiveCategoryFilter,
    activeCategoryFilter,
    setCurrentRoute,
    currentRoute,
    settings,
    searchQuery,
    setSearchQuery,
    setActiveInfoModal,
    logout,
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleNavClick = (categorySlug: string) => {
    setCurrentRoute('store');
    setActiveCategoryFilter(categorySlug);
    setIsMobileMenuOpen(false);

    // Scroll to products
    const el = document.getElementById('collection-grid') || document.getElementById('featured-products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHomeClick = () => {
    setCurrentRoute('store');
    setActiveCategoryFilter('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* 1. TOP ANNOUNCEMENT BAR (Dark Black #0b0b0b) */}
      <div className="bg-[#0b0b0b] text-neutral-300 text-[11px] sm:text-xs py-2 px-4 sm:px-8 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left notice */}
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span>Free Shipping on Orders Over <span className="font-bengali">৳</span>2000</span>
            <span className="text-neutral-600 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-neutral-400">Wear Your Style. Modern Fashion for Everyone.</span>
          </div>

          {/* Right Socials & Links */}
          <div className="flex items-center gap-3 text-neutral-400">
            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Facebook Page"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="YouTube Channel"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>

            <span className="text-neutral-700">|</span>

            {/* Track Order */}
            <button
              onClick={() => {
                if (user) {
                  setIsMyOrdersOpen(true);
                } else {
                  setAuthModal('login');
                }
              }}
              className="hover:text-white transition-colors text-[11px] font-medium"
            >
              Track Order
            </button>

            <span className="text-neutral-700">|</span>

            {/* Help */}
            <button
              onClick={() => setActiveInfoModal('contact')}
              className="hover:text-white transition-colors text-[11px] font-medium"
            >
              Help
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 border-b border-neutral-100">
        {/* Left: ZENVY WEAR Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleHomeClick}
            className="text-left group flex flex-col items-center justify-center cursor-pointer"
            aria-label="ZENVY WEAR Homepage"
          >
            <span className="text-2xl sm:text-3xl font-black tracking-[0.22em] text-black uppercase leading-none font-sans">
              ZENVY
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.45em] text-neutral-800 uppercase mt-1 pl-1">
              WEAR
            </span>
          </button>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-neutral-800 tracking-wide uppercase">
          <button
            onClick={handleHomeClick}
            className={`transition-colors py-1 relative ${
              activeCategoryFilter === 'all' && !searchQuery
                ? 'text-black font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('all')}
            className="text-neutral-600 hover:text-black transition-colors py-1"
          >
            Shop All
          </button>

          <button
            onClick={() => handleNavClick("Men's T-Shirt")}
            className={`transition-colors py-1 ${
              activeCategoryFilter.toLowerCase().includes('men')
                ? 'text-black font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Men's Wear
          </button>

          <button
            onClick={() => handleNavClick("Women's T-Shirt")}
            className={`transition-colors py-1 ${
              activeCategoryFilter.toLowerCase().includes('women')
                ? 'text-black font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Women's Wear
          </button>

          <button
            onClick={() => setActiveInfoModal('about')}
            className="text-neutral-600 hover:text-black transition-colors py-1"
          >
            About Us
          </button>

          <button
            onClick={() => setActiveInfoModal('contact')}
            className="text-neutral-600 hover:text-black transition-colors py-1"
          >
            Contact Us
          </button>
        </nav>

        {/* Right: Search Pill + Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Pill Input */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-48 md:w-64 bg-neutral-100/90 text-xs text-neutral-900 rounded-full pl-4 pr-9 py-2 border border-neutral-200/70 focus:outline-none focus:border-neutral-400 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute right-3 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-8 top-2.5 text-neutral-400 hover:text-black text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* User Account */}
          <div className="relative">
            <button
              onClick={() => {
                if (user) {
                  setIsUserMenuOpen((prev) => !prev);
                } else {
                  setAuthModal('login');
                }
              }}
              className="p-2 text-neutral-800 hover:text-black transition-colors rounded-full hover:bg-neutral-100 cursor-pointer"
              aria-label={user ? `Account menu for ${user.name}` : 'Login or register'}
            >
              <UserIcon className="w-5 h-5" />
            </button>

            {/* Dropdown for Logged In User */}
            {user && isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50 text-xs"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-neutral-100">
                  <p className="font-bold text-neutral-900">{user.name}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded font-semibold">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={() => setIsMyOrdersOpen(true)}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-neutral-800 flex items-center gap-2 font-medium"
                >
                  <Package className="w-3.5 h-3.5 text-neutral-500" />
                  <span>My Orders</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setCurrentRoute('admin')}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-neutral-950 font-semibold flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-neutral-800" />
                    <span>Admin Dashboard</span>
                  </button>
                )}

                <div className="border-t border-neutral-100 my-1" />
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Wishlist Heart Icon */}
          <button
            onClick={() => {
              if (wishlistCount > 0) {
                // filter by wishlist or jump to products
                setActiveCategoryFilter('all');
                const el = document.getElementById('collection-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="p-2 text-neutral-800 hover:text-black transition-colors rounded-full hover:bg-neutral-100 relative cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-neutral-950 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Bag / Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-neutral-800 hover:text-black transition-colors rounded-full hover:bg-neutral-100 relative cursor-pointer"
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-2 text-neutral-800 hover:text-black lg:hidden rounded-lg hover:bg-neutral-100"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-5 py-4 space-y-4">
          {/* Mobile Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-neutral-100 text-xs rounded-full pl-4 pr-9 py-2.5 border border-neutral-200"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
          </div>

          <nav className="flex flex-col space-y-2 text-sm font-semibold text-neutral-800">
            <button
              onClick={handleHomeClick}
              className="text-left py-2 hover:text-black"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('all')}
              className="text-left py-2 hover:text-black"
            >
              Shop All
            </button>
            <button
              onClick={() => handleNavClick("Men's T-Shirt")}
              className="text-left py-2 hover:text-black"
            >
              Men's Wear
            </button>
            <button
              onClick={() => handleNavClick("Women's T-Shirt")}
              className="text-left py-2 hover:text-black"
            >
              Women's Wear
            </button>
            <button
              onClick={() => {
                setActiveInfoModal('about');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-black"
            >
              About Us
            </button>
            <button
              onClick={() => {
                setActiveInfoModal('contact');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-black"
            >
              Contact Us
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setCurrentRoute('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="text-left py-2 text-neutral-950 font-bold border-t border-neutral-100 pt-3 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
