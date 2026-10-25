import React from 'react';
import {
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Send,
  Heart,
  Shield,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export function Footer() {
  const { settings, setActiveCategoryFilter, setCurrentRoute, setActiveInfoModal } = useShop();

  const handleCategoryClick = (categoryName: string) => {
    setCurrentRoute('store');
    setActiveCategoryFilter(categoryName);
    const el = document.getElementById('featured-products-section') || document.getElementById('collection-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHomeClick = () => {
    setCurrentRoute('store');
    setActiveCategoryFilter('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0b0b0d] text-neutral-300 border-t border-neutral-800 mt-16 sm:mt-24">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          {/* Column 1: Brand & Socials (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <button
              onClick={handleHomeClick}
              className="text-left group flex flex-col cursor-pointer"
            >
              <span className="text-2xl sm:text-3xl font-black tracking-[0.22em] text-white uppercase leading-none font-sans">
                ZENVY
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.45em] text-neutral-400 uppercase mt-1 pl-1">
                WEAR
              </span>
            </button>

            <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
              {settings.tagline}
            </p>

            <div className="pt-2">
              <p className="text-xs font-semibold text-neutral-300 mb-2.5">
                Follow us on
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center text-neutral-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center text-neutral-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center text-neutral-300"
                  aria-label="YouTube"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://m.me/zenvywear1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center text-neutral-300"
                  aria-label="Messenger"
                >
                  <Send className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center text-neutral-300 text-xs font-bold"
                  aria-label="TikTok"
                >
                  <span>♪</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button
                  onClick={handleHomeClick}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('all')}
                  className="hover:text-white transition-colors"
                >
                  Shop All
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick("Men's T-Shirt")}
                  className="hover:text-white transition-colors"
                >
                  Men's Wear
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick("Women's T-Shirt")}
                  className="hover:text-white transition-colors"
                >
                  Women's Wear
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('about')}
                  className="hover:text-white transition-colors"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Service
            </h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button
                  onClick={() => setActiveInfoModal('contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('shipping')}
                  className="hover:text-white transition-colors"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('returns')}
                  className="hover:text-white transition-colors"
                >
                  Return Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('privacy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveInfoModal('contact')}
                  className="hover:text-white transition-colors"
                >
                  FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Contact Information
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {settings.whatsappNumber} (WhatsApp)
                </a>
              </li>

              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <a
                  href={`mailto:${settings.businessEmail}`}
                  className="hover:text-white transition-colors"
                >
                  {settings.businessEmail} (Email)
                </a>
              </li>

              <li className="flex items-center gap-2">
                <Facebook className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors truncate max-w-[210px]"
                >
                  {settings.facebookUrl}
                </a>
              </li>

              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Stylized Signature Graphic (2 cols) */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-end justify-center pt-4 lg:pt-0">
            <div className="text-center lg:text-right space-y-2">
              <div
                className="text-2xl sm:text-3xl text-white font-serif italic tracking-wide"
                style={{ fontFamily: "'Playfair Display', cursive, serif" }}
              >
                <span>Zenvy Wear · ♡</span>
              </div>
              <div className="flex items-center justify-center lg:justify-end gap-1.5 text-[11px] text-neutral-400 tracking-wide">
                <span className="text-neutral-600">———</span>
                <span>Your Style</span>
                <Shield className="w-3 h-3 text-neutral-400" />
                <span>ur Priority</span>
                <span className="text-neutral-600">———</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-neutral-900 bg-[#070708] py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>© 2025 Zenvy Wear. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentRoute('admin-login')}
              className="text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1.5 text-[11px] cursor-pointer"
            >
              <Shield className="w-3 h-3 text-neutral-400" />
              <span>Admin Portal</span>
            </button>
            <span className="text-neutral-700">|</span>
            <p className="flex items-center gap-1">
              <span>Built with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline" />
              <span>for fashion lovers.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
