import React from 'react';
import { Eye, ShoppingBag, MessageCircle } from 'lucide-react';
import type { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { buildWhatsAppOrderUrl } from '../utils/shopRules';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { setSelectedProduct, addToCart, settings } = useShop();

  const isDiscounted =
    typeof product.discountPrice === 'number' &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;

  const currentPrice = isDiscounted ? product.discountPrice! : product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    const defaultSize = product.sizes[0] || 'Standard';
    const defaultColor = product.colors[0]?.name || 'Standard';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes[0] || 'Standard';
    const defaultColor = product.colors[0]?.name || 'Standard';
    const waUrl = buildWhatsAppOrderUrl({
      phone: settings.whatsappNumber,
      items: [
        {
          name: product.name,
          size: defaultSize,
          color: defaultColor,
          quantity: 1,
          price: currentPrice,
        },
      ],
      total: currentPrice,
    });
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-neutral-900 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Product Image Box */}
      <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
        <img
          src={product.images[0] || '/src/assets/images/category_men_tshirt_1792926459237.jpg'}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Quiet Discount or New Tag (Single subtle text badge, no colored pill cluster) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.isNewArrival && (
            <span className="text-[11px] font-semibold tracking-wider uppercase bg-black text-white px-2 py-0.5 rounded">
              New Arrival
            </span>
          )}
          {isDiscounted && (
            <span className="text-[11px] font-semibold tracking-wider uppercase bg-neutral-100 text-neutral-900 border border-neutral-300 px-2 py-0.5 rounded">
              Save Tk. {product.price - product.discountPrice!}
            </span>
          )}
        </div>

        {/* Quick View Hover Overlay Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="flex-1 py-2 bg-white/95 backdrop-blur hover:bg-black hover:text-white text-xs font-semibold rounded-lg text-neutral-900 shadow-md transition-colors flex items-center justify-center gap-1.5"
            aria-label={`View details for ${product.name}`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>

          <button
            onClick={handleWhatsAppClick}
            className="p-2 bg-white/95 backdrop-blur hover:bg-green-600 hover:text-white text-neutral-900 rounded-lg shadow-md transition-colors"
            title="Inquire on WhatsApp"
            aria-label="Inquire on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Quiet Unboxed Metadata with · separator */}
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium mb-1 flex items-center gap-1.5">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>SKU: {product.sku}</span>
          </div>

          <h3 className="text-sm font-semibold text-neutral-950 group-hover:underline line-clamp-1 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Price & Cart Action */}
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-neutral-950 tabular-nums">
              <span className="font-bengali">৳</span>{currentPrice.toLocaleString('en-US')}
            </span>
            {isDiscounted && (
              <span className="text-xs text-neutral-400 line-through tabular-nums">
                <span className="font-bengali">৳</span>{product.price.toLocaleString('en-US')}
              </span>
            )}
          </div>

          {product.stock > 0 ? (
            <button
              onClick={handleQuickAdd}
              className="p-2 text-neutral-700 hover:text-white hover:bg-black rounded-lg transition-colors border border-neutral-200 hover:border-black"
              title="Add to shopping bag"
              aria-label={`Add ${product.name} to bag`}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[11px] font-medium text-neutral-400">Sold Out</span>
          )}
        </div>
      </div>
    </div>
  );
}
