import React from 'react';
import { CheckCircle2, MessageCircle, ArrowRight, Printer, MapPin, Phone, PackageCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export function OrderSuccessModal() {
  const { orderSuccess, setOrderSuccess, settings } = useShop();

  if (!orderSuccess) return null;

  const handleWhatsAppInquiry = () => {
    const text = `Hello ZENVY WEAR, I just placed order reference *${orderSuccess.orderRef}* for total ৳${orderSuccess.total}. Please confirm my shipment status!`;
    const url = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded">
            Order Confirmed & Placed
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-display">
            Thank you, {orderSuccess.customerName}!
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Your order has been recorded in our system and stock has been reserved. Our fulfillment team is preparing your package.
          </p>
        </div>

        {/* Order Reference & Payment Summary Box */}
        <div className="my-6 p-4 bg-neutral-900 text-white rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-400">Order Reference</div>
              <div className="text-lg sm:text-xl font-mono font-bold tracking-wider text-white">
                {orderSuccess.orderRef}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-neutral-400">ডেলিভারির সময় প্রদেয় (COD)</div>
              <div className="text-lg sm:text-xl font-bold text-emerald-400 tabular-nums">
                <span className="font-bengali">৳</span>{orderSuccess.subtotal.toLocaleString('en-US')}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-neutral-300 pt-0.5">
            <div>
              <span className="text-neutral-400">অগ্রিম ডেলিভারি চার্জ: </span>
              <span className="font-bold text-amber-400">৳{orderSuccess.deliveryFeeAdvance || orderSuccess.deliveryFee}</span>
              <span className="text-[11px] text-neutral-400"> ({orderSuccess.paymentMethod?.toUpperCase()})</span>
            </div>
            {orderSuccess.paymentSenderNumber && (
              <div className="text-neutral-400">
                Send Money নম্বর: <span className="font-mono text-white font-semibold">{orderSuccess.paymentSenderNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200">
          <div className="space-y-1">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-600" />
              <span>Delivery Address</span>
            </div>
            <p className="text-neutral-600 leading-relaxed pl-5">
              {orderSuccess.deliveryAddress}
            </p>
            <p className="text-[11px] text-neutral-500 pl-5">
              Zone: {orderSuccess.cityZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-600" />
              <span>Contact Phone</span>
            </div>
            <p className="text-neutral-600 pl-5 font-mono">
              {orderSuccess.customerPhone}
            </p>
            <div className="pt-1 pl-5 text-[11px] text-neutral-500 flex items-center gap-1">
              <PackageCheck className="w-3.5 h-3.5 text-neutral-700" />
              <span>
                Estimated Delivery:{' '}
                {orderSuccess.cityZone === 'inside_dhaka' ? '24–48 Hours' : '2–4 Business Days'}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized preview */}
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <div className="text-xs font-semibold text-neutral-900 mb-2">Order Items:</div>
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {orderSuccess.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs text-neutral-700">
                <span>
                  {item.productName} ({item.size}, {item.color}) × {item.quantity}
                </span>
                <span className="font-semibold text-neutral-900 tabular-nums">
                  <span className="font-bengali">৳</span>{item.totalPrice.toLocaleString('en-US')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-neutral-200 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleWhatsAppInquiry}
              className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire / Confirm via WhatsApp</span>
            </button>

            <button
              onClick={() => setOrderSuccess(null)}
              className="py-3 px-4 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handlePrint}
              className="text-xs text-neutral-500 hover:text-black flex items-center gap-1 pt-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
