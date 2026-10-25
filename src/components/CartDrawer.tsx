import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle, Truck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { buildWhatsAppOrderUrl } from '../utils/shopRules';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartTotal,
    cartDeliveryFee,
    isFreeDelivery,
    freeDeliveryThresholdRemaining,
    settings,
    setIsCheckoutOpen,
    cityZone,
    setCityZone,
  } = useShop();

  if (!isCartOpen) return null;

  const handleWhatsAppCartOrder = () => {
    if (cart.length === 0) return;
    const waUrl = buildWhatsAppOrderUrl({
      phone: settings.whatsappNumber,
      items: cart.map((item) => ({
        name: item.product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      cityZone,
      total: cartTotal,
    });
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-lg font-bold text-neutral-950 font-display">
                Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-black rounded-lg transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 text-xs">
            {isFreeDelivery ? (
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <Truck className="w-4 h-4 shrink-0" />
                <span>You qualify for FREE Delivery across Bangladesh!</span>
              </div>
            ) : (
              <div>
                <p className="text-neutral-700">
                  Add <strong className="text-black tabular-nums">৳{freeDeliveryThresholdRemaining.toLocaleString('en-US')}</strong> more to get <strong className="text-black">FREE delivery</strong>
                </p>
                <div className="mt-2 w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-neutral-900 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (cartSubtotal / settings.freeShippingThreshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-neutral-300 stroke-1 mb-3" />
                <p className="text-base font-semibold text-neutral-800">Your bag is empty</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Discover our modern oversized tees and women's luxury three-pieces to begin styling.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-5 py-2.5 bg-neutral-950 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200"
                >
                  <img
                    src={item.product.images[0] || '/src/assets/images/category_men_tshirt_1792926459237.jpg'}
                    alt={item.product.name}
                    className="w-18 h-22 object-cover rounded-lg bg-neutral-200 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-2">
                        <span>Size: <strong className="text-neutral-800">{item.size}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Color: <strong className="text-neutral-800">{item.color}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200/60">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-300 rounded bg-white overflow-hidden text-xs">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="px-2 py-0.5 hover:bg-neutral-100 text-neutral-700"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 tabular-nums font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="px-2 py-0.5 hover:bg-neutral-100 text-neutral-700"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-xs font-bold text-neutral-950 tabular-nums">
                        <span className="font-bengali">৳</span>{(item.unitPrice * item.quantity).toLocaleString('en-US')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/50 space-y-4">
              {/* Delivery Zone Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Delivery Location:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setCityZone('inside_dhaka')}
                    className={`py-1.5 px-2.5 rounded-lg border text-left transition-colors ${
                      cityZone === 'inside_dhaka'
                        ? 'border-neutral-950 bg-neutral-950 text-white font-medium'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <div>Inside Dhaka</div>
                    <div className="text-[10px] opacity-80">Tk. 70 (or Free &gt; Tk. 2k)</div>
                  </button>

                  <button
                    onClick={() => setCityZone('outside_dhaka')}
                    className={`py-1.5 px-2.5 rounded-lg border text-left transition-colors ${
                      cityZone === 'outside_dhaka'
                        ? 'border-neutral-950 bg-neutral-950 text-white font-medium'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <div>Outside Dhaka</div>
                    <div className="text-[10px] opacity-80">Tk. 130 (or Free &gt; Tk. 2k)</div>
                  </button>
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">
                    <span className="font-bengali">৳</span>{cartSubtotal.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">
                    {cartDeliveryFee === 0 ? 'FREE' : <><span className="font-bengali">৳</span>{cartDeliveryFee}</>}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-extrabold text-neutral-950">
                  <span>Total Amount</span>
                  <span className="tabular-nums"><span className="font-bengali">৳</span>{cartTotal.toLocaleString('en-US')}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleWhatsAppCartOrder}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order Entire Bag via WhatsApp</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-neutral-500">
                Cash on Delivery Available across Bangladesh
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
