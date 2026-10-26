import React, { useState } from 'react';
import { X, ShieldCheck, Truck, CheckCircle2, AlertCircle, Copy, Check, Smartphone, Info, CreditCard } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { api } from '../utils/api';
import { validateBangladeshPhone } from '../utils/shopRules';
import { createOrderInFirestore } from '../firebase/firestoreService';

const MFS_NUMBER = '01617115877';

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
  
  // Advance payment method & sender account
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [paymentSenderNumber, setPaymentSenderNumber] = useState('');
  const [paymentTrxId, setPaymentTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(MFS_NUMBER);
    setCopiedNumber(true);
    showToast('Payment number copied: ' + MFS_NUMBER, 'success');
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার পুরো নাম লিখুন (Please enter your full name).');
      return;
    }

    const phoneValidation = validateBangladeshPhone(customerPhone);
    if (!phoneValidation.isValid) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (e.g. 01757391262).');
      return;
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 10) {
      setErrorMessage('অনুগ্রহ করে আপনার পূর্ণ ডেলিভারি ঠিকানা দিন (রোড, বাসা নম্বর, এলাকা, থানা, জেলা)।');
      return;
    }

    // Mandatory payment sender number check
    if (!paymentSenderNumber.trim()) {
      setErrorMessage('যে বিকাশ/নগদ/রকেট নম্বর থেকে ডেলিভারি চার্জ Send Money করেছেন সেই নম্বরটি দেওয়া বাধ্যতামূলক।');
      return;
    }

    const senderPhoneValidation = validateBangladeshPhone(paymentSenderNumber);
    if (!senderPhoneValidation.isValid) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের Send Money একাউন্ট নম্বর দিন (e.g. 01617115877)।');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('আপনার কার্ট খালি রয়েছে (Your cart is empty).');
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
        paymentSenderNumber: senderPhoneValidation.formatted,
        paymentTrxId: paymentTrxId.trim() || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
      };

      const response = await api.createOrder(orderPayload);
      try {
        await createOrderInFirestore(response.order);
      } catch (fbOrderErr) {
        console.warn('Firestore order sync:', fbOrderErr);
      }
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

  const deliveryChargeAmount = cartDeliveryFee > 0 ? cartDeliveryFee : (cityZone === 'inside_dhaka' ? 70 : 130);
  const codPayableAmount = cartSubtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-neutral-950 font-display">
              Checkout & Delivery
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              ZENVY WEAR · অর্ডার কনফার্ম করতে ডেলিভারি চার্জ অগ্রিম পরিশোধ করুন
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-black rounded-lg transition-colors cursor-pointer"
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

        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-8 space-y-6">
          {/* ADVANCE PAYMENT NOTICE BANNER */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-sm">
                ৳
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                    অগ্রিম ডেলিভারি চার্জ বাধ্যতামূলক
                  </span>
                </div>
                <p className="text-xs font-semibold text-neutral-900 mt-1.5 leading-relaxed">
                  অর্ডার নিশ্চিত করতে ডেলিভারি চার্জ (<span className="text-amber-800 font-bold font-bengali">৳{deliveryChargeAmount}</span>) নিম্নের নম্বরে <span className="font-bold underline text-neutral-950">Send Money</span> করতে হবে। বাকি পণ্যের মূল্য (<span className="text-neutral-950 font-bold font-bengali">৳{codPayableAmount.toLocaleString('en-US')}</span>) পণ্য হাতে পেয়ে পরিশোধ করবেন।
                </p>

                {/* Number Box with Copy Action */}
                <div className="mt-3 flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-amber-300 shadow-xs">
                  <div className="flex items-center gap-2 text-xs text-neutral-700">
                    <span className="font-semibold text-neutral-900">Send Money নম্বর (Personal):</span>
                    <span className="font-mono text-base font-extrabold text-black tracking-wider bg-neutral-100 px-2.5 py-1 rounded-lg">
                      {MFS_NUMBER}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    {copiedNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>নম্বর কপি করুন</span>
                      </>
                    )}
                  </button>

                  <div className="text-[11px] font-medium text-neutral-500">
                    (bKash / Nagad / Rocket)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Customer and Shipping Form */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
                  1. Delivery Details (ডেলিভারি ঠিকানা)
                </h3>

                <div className="space-y-4 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Full Name (আপনার নাম) <span className="text-red-500">*</span>
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
                        Phone Number (মোবাইল নম্বর) <span className="text-red-500">*</span>
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
                        ১১ ডিজিটের সচল মোবাইল নম্বর
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1">
                        Email Address <span className="text-neutral-400 font-normal">(ঐচ্ছিক)</span>
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
                      Delivery Zone (ডেলিভারি এলাকা) <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCityZone('inside_dhaka')}
                        className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                          cityZone === 'inside_dhaka'
                            ? 'border-black bg-neutral-950 text-white'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:border-neutral-400'
                        }`}
                      >
                        <div className="text-xs font-bold">Inside Dhaka (ঢাকার ভেতরে)</div>
                        <div className="text-[11px] opacity-90 mt-0.5 font-semibold">
                          ডেলিভারি চার্জ: ৳70 (24–48 Hours)
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCityZone('outside_dhaka')}
                        className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                          cityZone === 'outside_dhaka'
                            ? 'border-black bg-neutral-950 text-white'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:border-neutral-400'
                        }`}
                      >
                        <div className="text-xs font-bold">Outside Dhaka (ঢাকার বাইরে)</div>
                        <div className="text-[11px] opacity-90 mt-0.5 font-semibold">
                          ডেলিভারি চার্জ: ৳130 (2–4 Days)
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Complete Delivery Address (পূর্ণ ঠিকানা) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="বাসা নং, রোড নং, এলাকা/সেক্টর, থানা, জেলা"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Order Notes <span className="text-neutral-400 font-normal">(ঐচ্ছিক নির্দেশনা)</span>
                    </label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. বিকেল ৩টার পর ডেলিভারি করবেন"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT SECTION - ADVANCE PAYMENT OF DELIVERY FEE */}
              <div className="pt-4 border-t border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    2. Payment Method (ডেলিভারি চার্জ পেমেন্ট)
                  </h3>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    ৳{deliveryChargeAmount} অগ্রিম প্রদেয়
                  </span>
                </div>

                {/* MFS Selector: bKash / Nagad / Rocket */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'bkash'
                        ? 'border-[#E2136E] bg-pink-50 ring-2 ring-[#E2136E]/40 text-[#E2136E]'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <div className="text-xs font-black">bKash</div>
                    <div className="text-[10px] mt-0.5 opacity-80">বিকাশ সেন্ড মানি</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'nagad'
                        ? 'border-[#F7931E] bg-orange-50 ring-2 ring-[#F7931E]/40 text-[#F7931E]'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <div className="text-xs font-black">Nagad</div>
                    <div className="text-[10px] mt-0.5 opacity-80">নগদ সেন্ড মানি</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('rocket')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'rocket'
                        ? 'border-[#8C3494] bg-purple-50 ring-2 ring-[#8C3494]/40 text-[#8C3494]'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <div className="text-xs font-black">Rocket</div>
                    <div className="text-[10px] mt-0.5 opacity-80">রকেট সেন্ড মানি</div>
                  </button>
                </div>

                {/* SENDER NUMBER INPUT (REQUIRED) */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-300 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-900 mb-1">
                      যে একাউন্ট থেকে Send Money করেছেন সেই নম্বর (Sender Number) <span className="text-red-500 font-extrabold">* (বাধ্যতামূলক)</span>
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={paymentSenderNumber}
                        onChange={(e) => setPaymentSenderNumber(e.target.value)}
                        placeholder="e.g. 01XXXXXXXXX"
                        className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-mono font-semibold"
                      />
                    </div>
                    <span className="text-[11px] text-neutral-500 mt-1 block">
                      আপনি যে বিকাশ/নগদ/রকেট একাউন্ট থেকে <strong>{MFS_NUMBER}</strong> নম্বরে ৳{deliveryChargeAmount} পাঠিয়েছেন, সেই নম্বরটি দিন।
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Transaction ID (TrxID) <span className="text-neutral-400 font-normal">(ঐচ্ছিক - দিলে দ্রুত ভেরিফাই হবে)</span>
                    </label>
                    <input
                      type="text"
                      value={paymentTrxId}
                      onChange={(e) => setPaymentTrxId(e.target.value)}
                      placeholder="e.g. BL92A8ZK9"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-mono uppercase"
                    />
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

                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
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

                {/* Price Breakdown */}
                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>পণ্যের মূল্য (Subtotal)</span>
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      <span className="font-bengali">৳</span>{cartSubtotal.toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-amber-900 bg-amber-100/70 p-2 rounded-lg font-semibold">
                    <span>ডেলিভারি চার্জ (অগ্রিম পরিশোধ)</span>
                    <span className="tabular-nums font-bold">
                      <span className="font-bengali">৳</span>{deliveryChargeAmount}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between text-xs text-neutral-700">
                    <span>সর্বমোট (Total Value)</span>
                    <span className="font-bold tabular-nums">
                      <span className="font-bengali">৳</span>{(cartSubtotal + deliveryChargeAmount).toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-900 text-white rounded-xl space-y-1 mt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400">এখন অগ্রিম পরিশোধ করবেন:</span>
                      <span className="font-bold text-amber-400 text-sm">৳{deliveryChargeAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-neutral-800">
                      <span className="text-neutral-400">ডেলিভারির সময় ক্যাশ অন ডেলিভারি (COD):</span>
                      <span className="font-bold text-emerald-400 text-sm">৳{codPayableAmount.toLocaleString('en-US')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="mt-6 pt-4 border-t border-neutral-200 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>অর্ডার প্রসেসিং হচ্ছে...</span>
                  ) : (
                    <span>অর্ডার কনফার্ম করুন (Confirm Order)</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Send Money নিশ্চিত করার পর আপনার অর্ডার প্রসেস শুরু হবে</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
