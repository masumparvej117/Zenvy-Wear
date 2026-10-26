import React, { useEffect, useState } from 'react';
import { X, Package, Clock, MessageCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { api } from '../utils/api';
import type { Order } from '../types';
import { subscribeUserOrders } from '../firebase/firestoreService';

export function CustomerOrdersModal() {
  const { isMyOrdersOpen, setIsMyOrdersOpen, user, settings } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isMyOrdersOpen || !user) return;

    setIsLoading(true);
    setError(null);

    // Initial load from API
    api
      .getMyOrders()
      .then((data) => {
        if (data && data.length > 0) setOrders(data);
      })
      .catch((err) => setError(err.message || 'Failed to load order history'))
      .finally(() => setIsLoading(false));

    // Live subscription from Firestore
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribeUserOrders(
        user.id,
        (fbOrders) => {
          if (fbOrders && fbOrders.length > 0) {
            setOrders(fbOrders);
            setIsLoading(false);
          }
        },
        () => {}
      );
    } catch {
      // ignore
    }

    return () => {
      if (unsub) unsub();
    };
  }, [isMyOrdersOpen, user]);

  if (!isMyOrdersOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Confirmed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Success':
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-neutral-950 font-display">
              My Order History
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Private order records for {user?.email}
            </p>
          </div>
          <button
            onClick={() => setIsMyOrdersOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-black rounded-lg transition-colors"
            aria-label="Close orders"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {isLoading ? (
            <div className="py-16 text-center text-neutral-500 flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-800" />
              <p className="text-xs font-medium">Loading your private orders...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600 text-xs">{error}</div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 space-y-2">
              <Package className="w-12 h-12 text-neutral-300 stroke-1 mx-auto" />
              <p className="text-base font-semibold text-neutral-800">No orders placed yet</p>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Once you place an order with your account, you can track fulfillment status and reference details right here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/80 pb-3">
                    <div>
                      <span className="text-[11px] text-neutral-500 uppercase tracking-wider block">
                        Order Reference
                      </span>
                      <span className="font-mono font-bold text-neutral-950 text-sm">
                        {ord.orderRef}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getStatusColor(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                      <span className="text-sm font-bold text-neutral-950 tabular-nums">
                        <span className="font-bengali">৳</span>{ord.total.toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-2">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-neutral-700">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900">{item.productName}</span>
                          <span className="text-neutral-500">
                            ({item.size}, {item.color}) × {item.quantity}
                          </span>
                        </div>
                        <span className="tabular-nums font-semibold text-neutral-900">
                          <span className="font-bengali">৳</span>{item.totalPrice.toLocaleString('en-US')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span aria-hidden="true">·</span>
                      <span>Payment: Cash on Delivery (COD)</span>
                    </div>

                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hello ZENVY WEAR, I would like an update on my order *${ord.orderRef}*.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Track via WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
