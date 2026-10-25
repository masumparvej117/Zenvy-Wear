import React, { useState } from 'react';
import { X, ShieldCheck, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { api } from '../utils/api';
import { validateBangladeshPhone } from '../utils/shopRules';

export function CheckoutModal() {
  const {
    cart,
    cartSubtotal,
    cartDeliveryFee,
    cartTotal,
    cityZone,
    setCityZone,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    setOrderSuccess,
    user,
    showToast,
  } = useShop();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const phoneValidation = validateBangladeshPhone(customerPhone);
    if (!phoneValidation.isValid) {
      setErrorMessage('Please enter a valid 11-digit Bangladesh phone number (e.g. 01757391262).');
      return;
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 10) {
      setErrorMessage('Please enter your full delivery address (Road, House, Area, District).');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: phoneValidation.formatted,
        deliveryAddress: deliveryAddress.trim(),
        cityZone,
        orderNotes: orderNotes.trim() || undefined,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
      };

      const response = await api.createOrder(orderPayload);
      clearCart();
      setIsCheckoutOpen(false);
      setOrderSuccess(response.order);
      showToast(`Order confirmed! Reference: ${response.order.orderRef}`, 'success');
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-neutral-950 font-display">
              Checkout & Delivery
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Cash on delivery available nationwide across Bangladesh
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-black rounded-lg transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Customer and Shipping Form */}
            <div className="md:col-span-7 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
                1. Delivery Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01757391262"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                    />
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">
                      11-digit Bangladeshi mobile number
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Email Address <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Delivery Zone */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-2">
                    Delivery Zone <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCityZone('inside_dhaka')}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        cityZone === 'inside_dhaka'
                          ? 'border-black bg-neutral-950 text-white'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      <div className="text-xs font-bold">Inside Dhaka</div>
                      <div className="text-[11px] opacity-80 mt-0.5">৳70 (24–48 Hours)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCityZone('outside_dhaka')}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        cityZone === 'outside_dhaka'
                          ? 'border-black bg-neutral-950 text-white'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      <div className="text-xs font-bold">Outside Dhaka</div>
                      <div className="text-[11px] opacity-80 mt-0.5">৳130 (2–4 Days)</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Complete Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House No, Road No, Sector/Block, Area, Thana, District"
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Order Notes <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Please deliver after 3:00 PM"
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-4 border-t border-neutral-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-3">
                  2. Payment Method
                </h3>
                <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-50 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-950">
                      Cash on Delivery (COD)
                    </h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Pay cash to the delivery courier when your package arrives at your doorstep. Inspect your ZENVY WEAR items with 100% peace of mind.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="md:col-span-5 bg-neutral-50 p-5 rounded-2xl border border-neutral-200 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-2 mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 text-xs">
                      <img
                        src={item.product.images[0] || '/src/assets/images/category_men_tshirt_1792926459237.jpg'}
                        alt={item.product.name}
                        className="w-12 h-14 object-cover rounded bg-neutral-200 shrink-0"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-neutral-500 text-[11px] mt-0.5">
                          {item.size} · {item.color} · Qty: {item.quantity}
                        </p>
                        <p className="font-bold text-neutral-950 tabular-nums mt-1">
                          <span className="font-bengali">৳</span>{(item.unitPrice * item.quantity).toLocaleString('en-US')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      <span className="font-bengali">৳</span>{cartSubtotal.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge ({cityZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      {cartDeliveryFee === 0 ? 'FREE' : <><span className="font-bengali">৳</span>{cartDeliveryFee}</>}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-neutral-200 flex justify-between text-base font-extrabold text-neutral-950">
                    <span>Total Amount</span>
                    <span className="tabular-nums"><span className="font-bengali">৳</span>{cartTotal.toLocaleString('en-US')}</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="mt-6 pt-4 border-t border-neutral-200 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Placing Order...</span>
                  ) : (
                    <span>Confirm Order · Tk. {cartTotal.toLocaleString('en-US')}</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Secure order processing · Stock reserved upon confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
