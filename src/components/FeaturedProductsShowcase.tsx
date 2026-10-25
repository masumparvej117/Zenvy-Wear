import React, { useState } from 'react';
import {
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  Headphones,
  Award,
  Facebook,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { buildWhatsAppOrderUrl } from '../utils/shopRules';
import type { Product } from '../types';

export function FeaturedProductsShowcase() {
  const { products, addToCart, setSelectedProduct, settings } = useShop();

  // Find products
  const menTee = products.find((p) => p.category === "Men's T-Shirt") || products[0];
  const womenTee = products.find((p) => p.category === "Women's T-Shirt") || products[1] || products[0];
  const threePiece = products.find((p) => p.category === "Women's Three-Piece") || products[2] || products[0];

  // Selected sizes & colors
  const [menSize, setMenSize] = useState('M');
  const [menColor, setMenColor] = useState('Black');

  const [womenSize, setWomenSize] = useState('M');
  const [womenColor, setWomenColor] = useState('Black');

  const [threePieceSize, setThreePieceSize] = useState('M');
  const [threePieceColor, setThreePieceColor] = useState('Black');

  // Handle WhatsApp order
  const handleWhatsAppOrder = (
    product: Product | undefined,
    size: string,
    color: string,
    customTitle?: string
  ) => {
    if (!product) return;
    const url = buildWhatsAppOrderUrl({
      phone: settings.whatsappNumber,
      items: [
        {
          name: customTitle || product.name,
          size,
          color,
          quantity: 1,
          price: product.discountPrice || product.price,
        },
      ],
      total: product.discountPrice || product.price,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMessengerClick = () => {
    window.open('https://m.me/zenvywear1', '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="featured-products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 font-sans">
          Featured Products
        </h2>
        <p className="text-xs text-neutral-500 mt-1 font-medium">
          Our top picks for your style.
        </p>
      </div>

      {/* Main Grid: 3 Horizontal Cards (9 cols) + Right Sidebar (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left 9 Columns: 3 Horizontal Product Cards */}
        <div className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* ---------------- CARD 1: MEN'S T-SHIRT ---------------- */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-row h-full min-h-[300px]">
            {/* Left Image (approx 46% width) */}
            <div
              className="relative w-[46%] shrink-0 bg-neutral-100 overflow-hidden cursor-pointer"
              onClick={() => menTee && setSelectedProduct(menTee)}
            >
              <img
                src="/src/assets/images/model_men_tshirt_1792927704671.jpg"
                alt="Men's T-Shirt ZENVY WEAR"
                className="w-full h-full object-cover object-top hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  New
                </span>
              </div>
            </div>

            {/* Right Details */}
            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
              <div>
                <h3
                  onClick={() => menTee && setSelectedProduct(menTee)}
                  className="font-bold text-sm text-neutral-950 cursor-pointer hover:underline line-clamp-1"
                >
                  Men's T-Shirt
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Men's Wear
                </p>

                {/* Price Display */}
                <div className="mt-2 text-xs font-medium text-neutral-900 flex items-center gap-1">
                  <span className="font-bengali font-bold text-neutral-900">৳</span>
                  <span className="font-semibold text-xs text-neutral-850">Price Coming Soon</span>
                </div>

                {/* Size Selector */}
                <div className="mt-2.5 flex items-center gap-1 flex-nowrap">
                  {['M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setMenSize(sz)}
                      className={`min-w-[22px] px-1 py-0.5 text-[10px] font-semibold rounded border transition-colors cursor-pointer text-center ${
                        menSize === sz
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {/* Color Selector */}
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-neutral-600">
                  <span className="text-[11px]">Color:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { name: 'Black', hex: '#111111' },
                      { name: 'Grey', hex: '#9CA3AF' },
                      { name: 'Slate', hex: '#4B5563' },
                      { name: 'Blue', hex: '#1D4ED8' },
                    ].map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setMenColor(col.name)}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
                          menColor === col.name
                            ? 'ring-2 ring-black scale-110 border-white'
                            : 'border-neutral-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                        aria-label={`Select ${col.name}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => menTee && addToCart(menTee, menSize, menColor, 1)}
                  className="w-full py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleWhatsAppOrder(menTee, menSize, menColor, "Men's T-Shirt")}
                    className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp Order</span>
                  </button>

                  <button
                    onClick={handleMessengerClick}
                    className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Messenger</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- CARD 2: WOMEN'S T-SHIRT ---------------- */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-row h-full min-h-[300px]">
            {/* Left Image (approx 46% width) */}
            <div
              className="relative w-[46%] shrink-0 bg-neutral-100 overflow-hidden cursor-pointer"
              onClick={() => womenTee && setSelectedProduct(womenTee)}
            >
              <img
                src="/src/assets/images/model_women_tshirt_1792927722947.jpg"
                alt="Women's T-Shirt ZENVY WEAR"
                className="w-full h-full object-cover object-top hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Popular
                </span>
              </div>
            </div>

            {/* Right Details */}
            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
              <div>
                <h3
                  onClick={() => womenTee && setSelectedProduct(womenTee)}
                  className="font-bold text-sm text-neutral-950 cursor-pointer hover:underline line-clamp-1"
                >
                  Women's T-Shirt
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Women's Wear
                </p>

                {/* Price Display */}
                <div className="mt-2 text-xs font-medium text-neutral-900 flex items-center gap-1">
                  <span className="font-bengali font-bold text-neutral-900">৳</span>
                  <span className="font-semibold text-xs text-neutral-850">Price Coming Soon</span>
                </div>

                {/* Size Selector */}
                <div className="mt-2.5 flex items-center gap-1 flex-nowrap">
                  {['S', 'M', 'L', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setWomenSize(sz)}
                      className={`min-w-[22px] px-1 py-0.5 text-[10px] font-semibold rounded border transition-colors cursor-pointer text-center ${
                        womenSize === sz
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {/* Color Selector */}
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-neutral-600">
                  <span className="text-[11px]">Color:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { name: 'Black', hex: '#111111' },
                      { name: 'Lavender', hex: '#D8B4E2' },
                      { name: 'Pink', hex: '#F472B6' },
                      { name: 'Blue', hex: '#2563EB' },
                    ].map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setWomenColor(col.name)}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
                          womenColor === col.name
                            ? 'ring-2 ring-black scale-110 border-white'
                            : 'border-neutral-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                        aria-label={`Select ${col.name}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => womenTee && addToCart(womenTee, womenSize, womenColor, 1)}
                  className="w-full py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleWhatsAppOrder(womenTee, womenSize, womenColor, "Women's T-Shirt")}
                    className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp Order</span>
                  </button>

                  <button
                    onClick={handleMessengerClick}
                    className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Messenger</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- CARD 3: WOMEN'S THREE-PIECE ---------------- */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-row h-full min-h-[300px]">
            {/* Left Image (approx 46% width) */}
            <div
              className="relative w-[46%] shrink-0 bg-neutral-100 overflow-hidden cursor-pointer"
              onClick={() => threePiece && setSelectedProduct(threePiece)}
            >
              <img
                src="/src/assets/images/model_women_threepiece_suit_1792927746547.jpg"
                alt="Women's Three-Piece ZENVY WEAR"
                className="w-full h-full object-cover object-top hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Bestseller
                </span>
              </div>
            </div>

            {/* Right Details */}
            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
              <div>
                <h3
                  onClick={() => threePiece && setSelectedProduct(threePiece)}
                  className="font-bold text-xs sm:text-sm text-neutral-950 cursor-pointer hover:underline leading-snug"
                >
                  Women's Three-Piece
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Women's Wear
                </p>

                {/* Price Display */}
                <div className="mt-2 text-xs font-medium text-neutral-900 flex items-center gap-1">
                  <span className="font-bengali font-bold text-neutral-900">৳</span>
                  <span className="font-semibold text-xs text-neutral-850">Price Coming Soon</span>
                </div>

                {/* Size Selector */}
                <div className="mt-2.5 flex items-center gap-1 flex-nowrap">
                  {['S', 'M', 'L', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setThreePieceSize(sz)}
                      className={`min-w-[22px] px-1 py-0.5 text-[10px] font-semibold rounded border transition-colors cursor-pointer text-center ${
                        threePieceSize === sz
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {/* Color Selector */}
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-neutral-600">
                  <span className="text-[11px]">Color:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { name: 'Black', hex: '#111111' },
                      { name: 'Plum', hex: '#4A0E2E' },
                      { name: 'Emerald', hex: '#065F46' },
                    ].map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setThreePieceColor(col.name)}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
                          threePieceColor === col.name
                            ? 'ring-2 ring-black scale-110 border-white'
                            : 'border-neutral-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                        aria-label={`Select ${col.name}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => threePiece && addToCart(threePiece, threePieceSize, threePieceColor, 1)}
                  className="w-full py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleWhatsAppOrder(threePiece, threePieceSize, threePieceColor, "Women's Three-Piece")}
                    className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp Order</span>
                  </button>

                  <button
                    onClick={handleMessengerClick}
                    className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Messenger</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- RIGHT SIDEBAR WIDGETS ---------------- */}
        <div className="lg:col-span-3 space-y-4">
          {/* Widget 1: Service Highlights */}
          <div className="bg-[#f9fafb] border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            {/* Item 1 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-neutral-300 bg-white flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-neutral-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-950">Fast & Reliable Delivery</p>
                <p className="text-[11px] text-neutral-500">Across Bangladesh</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-neutral-300 bg-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-neutral-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-950">Secure Shopping</p>
                <p className="text-[11px] text-neutral-500">Your data is safe with us</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-neutral-300 bg-white flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4 text-neutral-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-950">24/7 Support</p>
                <p className="text-[11px] text-neutral-500">We're here to help</p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-neutral-300 bg-white flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-neutral-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-950">Premium Quality</p>
                <p className="text-[11px] text-neutral-500">Trendy & Comfortable</p>
              </div>
            </div>
          </div>

          {/* Widget 2: Follow Us on Facebook */}
          <div className="bg-[#f9fafb] border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Facebook className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-950">Follow Us on Facebook</h4>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-snug">
              Stay updated with our latest collection, offers and more.
            </p>

            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Follow Page</span>
            </a>
          </div>

          {/* Widget 3: Contact Us */}
          <div className="bg-[#f9fafb] border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div>
              <h4 className="text-xs font-bold text-neutral-950">Contact Us</h4>
              <p className="text-[11px] text-neutral-500">We're always here for you.</p>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                title="WhatsApp Order"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>

              <a
                href="https://m.me/zenvywear1"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                title="Messenger"
              >
                <MessageCircle className="w-3 h-3" />
                <span>Messenger</span>
              </a>

              <a
                href={`mailto:${settings.businessEmail}`}
                className="py-2 px-1 bg-neutral-900 hover:bg-black text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                title="Email Us"
              >
                <Mail className="w-3 h-3" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
