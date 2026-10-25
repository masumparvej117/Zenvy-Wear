import React, { useState } from 'react';
import { X, ShoppingBag, MessageCircle, Check, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import type { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { buildWhatsAppOrderUrl } from '../utils/shopRules';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart, settings } = useShop();

  const [selectedImage, setSelectedImage] = useState(product.images[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.name || 'Standard'
  );
  const [quantity, setQuantity] = useState(1);

  const isDiscounted =
    typeof product.discountPrice === 'number' &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;

  const currentPrice = isDiscounted ? product.discountPrice! : product.price;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  const handleWhatsAppOrder = () => {
    const waUrl = buildWhatsAppOrderUrl({
      phone: settings.whatsappNumber,
      items: [
        {
          name: product.name,
          size: selectedSize,
          color: selectedColor,
          quantity,
          price: currentPrice,
        },
      ],
      total: currentPrice * quantity,
    });
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-black bg-white/80 hover:bg-neutral-100 rounded-full transition-colors"
          aria-label="Close product modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img
                src={selectedImage || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Thumbnails if multiple images */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-black ring-2 ring-black/20'
                        : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Quiet Unboxed Metadata */}
              <div className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-2 mb-2">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>SKU: {product.sku}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 font-display">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tabular-nums">
                  <span className="font-bengali">৳</span>{currentPrice.toLocaleString('en-US')}
                </span>
                {isDiscounted && (
                  <>
                    <span className="text-base text-neutral-400 line-through tabular-nums">
                      <span className="font-bengali">৳</span>{product.price.toLocaleString('en-US')}
                    </span>
                    <span className="text-xs font-semibold uppercase text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      Save Tk. {(product.price - product.discountPrice!).toLocaleString('en-US')}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-2 text-xs font-medium">
                {product.stock > 10 ? (
                  <span className="text-emerald-700">In Stock ({product.stock} units ready to ship)</span>
                ) : product.stock > 0 ? (
                  <span className="text-amber-700">Only {product.stock} left in stock — order soon</span>
                ) : (
                  <span className="text-red-600">Currently Sold Out</span>
                )}
              </div>

              <div className="mt-4 border-t border-neutral-100 pt-4">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mb-2">
                    <span>Select Size</span>
                    <span className="text-neutral-500 font-normal">Bangladeshi Standard Fit</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                          selectedSize === size
                            ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                            : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-semibold text-neutral-900 mb-2">
                    <span>Color: </span>
                    <span className="text-neutral-600 font-normal">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center ${
                          selectedColor === c.name
                            ? 'border-neutral-950 ring-2 ring-neutral-950/20 scale-110'
                            : 'border-neutral-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                        aria-label={`Select ${c.name}`}
                      >
                        {selectedColor === c.name && (
                          <Check
                            className={`w-3.5 h-3.5 ${
                              c.hex.toLowerCase() === '#ffffff' || c.hex.toLowerCase() === '#fafaf9'
                                ? 'text-black'
                                : 'text-white'
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-semibold text-neutral-900">Quantity</span>
                <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-semibold text-neutral-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-full py-3.5 px-4 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{product.stock > 0 ? 'Add to Bag' : 'Sold Out'}</span>
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order on WhatsApp</span>
                </button>
              </div>

              {/* Service Guarantees */}
              <div className="pt-3 grid grid-cols-3 gap-2 text-[11px] text-neutral-500 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-neutral-700" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-neutral-700" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="w-4 h-4 text-neutral-700" />
                  <span>7-Day Exchange</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
