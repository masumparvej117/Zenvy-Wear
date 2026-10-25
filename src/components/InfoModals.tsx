import React, { useState } from 'react';
import { X, MessageCircle, Mail, MapPin, Phone, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export function InfoModals() {
  const { activeInfoModal, setActiveInfoModal, settings, showToast } = useShop();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  if (!activeInfoModal) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Thank you! Your message has been received. Our team will contact you shortly.', 'success');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactMsg('');
    setActiveInfoModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setActiveInfoModal(null)}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-black rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. ABOUT US */}
        {activeInfoModal === 'about' && (
          <div className="space-y-4">
            <div className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
              OUR HERITAGE & PHILOSOPHY
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-950 font-display">
              About ZENVY WEAR
            </h2>
            <div className="space-y-3 text-sm text-neutral-600 leading-relaxed">
              <p>
                <strong>ZENVY WEAR</strong> was founded with a singular, unapologetic purpose: <em>Wear Your Style. Modern Fashion for Everyone.</em>
              </p>
              <p>
                Born in Bangladesh, the garment capital of the modern world, ZENVY WEAR bridges contemporary international minimalism with uncompromising craftsmanship. We engineer premium heavyweight combed cotton drop-shoulder t-shirts and elevated monochrome three-piece ensembles tailored for modern life.
              </p>
              <p>
                Every stitch, rib collar, and fabric weight is rigorously developed to resist shrinkage, maintain shape through repeated washes, and deliver a relaxed yet refined silhouette.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <ShieldCheck className="w-5 h-5 text-neutral-800 mx-auto mb-1" />
                <span className="font-bold text-neutral-900 block">Premium Cotton</span>
                <span className="text-[11px] text-neutral-500">210–240 GSM Combed</span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <Truck className="w-5 h-5 text-neutral-800 mx-auto mb-1" />
                <span className="font-bold text-neutral-900 block">Nationwide COD</span>
                <span className="text-[11px] text-neutral-500">Across 64 Districts</span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <RefreshCw className="w-5 h-5 text-neutral-800 mx-auto mb-1" />
                <span className="font-bold text-neutral-900 block">Easy Exchange</span>
                <span className="text-[11px] text-neutral-500">7-Day Guarantee</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. CONTACT US */}
        {activeInfoModal === 'contact' && (
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
                WE ARE HERE FOR YOU
              </div>
              <h2 className="text-2xl font-extrabold text-neutral-950 font-display">
                Contact ZENVY WEAR
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Reach out for customer assistance, wholesale, or order inquiries.
              </p>
            </div>

            {/* Quick Contact Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-50 hover:bg-emerald-100 p-3.5 rounded-xl border border-emerald-200 text-emerald-900 flex flex-col items-center text-center transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="font-bold">WhatsApp Direct</span>
                <span className="text-[11px] font-mono mt-0.5">{settings.whatsappNumber}</span>
              </a>

              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-50 hover:bg-blue-100 p-3.5 rounded-xl border border-blue-200 text-blue-900 flex flex-col items-center text-center transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center font-bold text-base text-blue-700 mb-1">
                  f
                </span>
                <span className="font-bold">Facebook Page</span>
                <span className="text-[11px] mt-0.5">@zenvywear1</span>
              </a>

              <a
                href={`mailto:${settings.businessEmail}`}
                className="bg-neutral-50 hover:bg-neutral-100 p-3.5 rounded-xl border border-neutral-200 text-neutral-900 flex flex-col items-center text-center transition-colors"
              >
                <Mail className="w-5 h-5 text-neutral-700 mb-1" />
                <span className="font-bold">Email Inquiries</span>
                <span className="text-[11px] mt-0.5 truncate max-w-[140px]">
                  {settings.businessEmail}
                </span>
              </a>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContactSubmit} className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Shakib Al Hasan"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="01757391262"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">Message</label>
                <textarea
                  rows={3}
                  required
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  placeholder="How can we assist you with your order?"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
              >
                Send Message
              </button>
            </form>
          </div>
        )}

        {/* 3. SHIPPING POLICY */}
        {activeInfoModal === 'shipping' && (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <h2 className="text-xl font-bold text-neutral-950 font-display">
              Shipping & Delivery Policy
            </h2>
            <div className="space-y-3">
              <p>
                We deliver to all 64 districts across Bangladesh using trusted courier partners (Steadfast, RedX, and Pathao Courier).
              </p>
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex justify-between font-semibold text-neutral-900">
                  <span>Inside Dhaka City:</span>
                  <span>৳70 (Delivery in 24–48 Hours)</span>
                </div>
                <div className="flex justify-between font-semibold text-neutral-900">
                  <span>Outside Dhaka (Sub-districts & Nationwide):</span>
                  <span>৳130 (Delivery in 2–4 Business Days)</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between text-emerald-800 font-bold">
                  <span>Free Shipping:</span>
                  <span>Orders over ৳2,000</span>
                </div>
              </div>
              <p>
                <strong>Cash on Delivery (COD):</strong> You can inspect the outer packaging and pay cash directly to the delivery agent upon receiving your order.
              </p>
            </div>
          </div>
        )}

        {/* 4. RETURN POLICY */}
        {activeInfoModal === 'returns' && (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <h2 className="text-xl font-bold text-neutral-950 font-display">
              Return & Exchange Policy
            </h2>
            <div className="space-y-3">
              <p>
                At ZENVY WEAR, customer satisfaction is our top priority. We offer a <strong>7-Day Easy Exchange Policy</strong> from the date of delivery.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>Items must be unworn, unwashed, and with all original brand tags intact.</li>
                <li>Size mismatches are eligible for immediate replacement upon courier return.</li>
                <li>Any manufacturing defect will be replaced free of charge including delivery fees.</li>
              </ul>
              <p>
                To initiate an exchange, simply message us on WhatsApp with your Order Reference at <strong>+8801757391262</strong>.
              </p>
            </div>
          </div>
        )}

        {/* 5. PRIVACY POLICY */}
        {activeInfoModal === 'privacy' && (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <h2 className="text-xl font-bold text-neutral-950 font-display">
              Privacy & Customer Security Policy
            </h2>
            <div className="space-y-3">
              <p>
                ZENVY WEAR respects your privacy. We strictly safeguard all customer delivery information, phone numbers, and order histories.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>We never sell or disclose your personal contact information to third parties.</li>
                <li>Passwords are encrypted using cryptographic salt and scrypt hashing algorithms.</li>
                <li>Customer order records are strictly private and isolated.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
