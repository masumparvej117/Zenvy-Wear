import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export function CategoryShowcase() {
  const { setActiveCategoryFilter } = useShop();

  const handleCategorySelect = (categoryName: string) => {
    setActiveCategoryFilter(categoryName);
    const el = document.getElementById('featured-products-section') || document.getElementById('collection-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
      {/* 2 Wide Side-by-Side Category Banners matching reference image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* CARD 1: MEN'S COLLECTION */}
        <div className="relative bg-[#101012] rounded-2xl border border-neutral-800/80 p-6 sm:p-7 overflow-hidden group flex items-center justify-between min-h-[160px] sm:min-h-[190px]">
          {/* Subtle 'Z' Watermark Monogram */}
          <div className="absolute right-24 sm:right-32 top-1/2 -translate-y-1/2 text-neutral-800/40 text-8xl sm:text-9xl font-black italic select-none pointer-events-none">
            Z
          </div>

          {/* Left Text & CTA */}
          <div className="z-10 max-w-[60%] space-y-2">
            <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider font-sans">
              MEN'S COLLECTION
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-400 font-medium tracking-wide">
              T-Shirts &nbsp;|&nbsp; Shirts &nbsp;|&nbsp; Pants &nbsp;|&nbsp; More
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleCategorySelect("Men's T-Shirt")}
                className="px-5 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Model Cutout Image */}
          <div className="relative w-32 sm:w-44 h-full shrink-0 flex items-center justify-end">
            <img
              src="/src/assets/images/model_men_tshirt_1792927704671.jpg"
              alt="Men's Collection ZENVY WEAR"
              className="h-32 sm:h-40 w-28 sm:w-36 object-cover object-top rounded-xl border border-neutral-700/60 shadow-lg group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* CARD 2: WOMEN'S COLLECTION */}
        <div className="relative bg-[#101012] rounded-2xl border border-neutral-800/80 p-6 sm:p-7 overflow-hidden group flex items-center justify-between min-h-[160px] sm:min-h-[190px]">
          {/* Subtle 'Z' Watermark Monogram */}
          <div className="absolute right-24 sm:right-32 top-1/2 -translate-y-1/2 text-neutral-800/40 text-8xl sm:text-9xl font-black italic select-none pointer-events-none">
            Z
          </div>

          {/* Left Text & CTA */}
          <div className="z-10 max-w-[60%] space-y-2">
            <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider font-sans">
              WOMEN'S COLLECTION
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-400 font-medium tracking-wide">
              T-Shirts &nbsp;|&nbsp; Dresses &nbsp;|&nbsp; Three-Piece &nbsp;|&nbsp; More
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleCategorySelect("Women's T-Shirt")}
                className="px-5 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Model Cutout Image */}
          <div className="relative w-32 sm:w-44 h-full shrink-0 flex items-center justify-end">
            <img
              src="/src/assets/images/model_women_tshirt_1792927722947.jpg"
              alt="Women's Collection ZENVY WEAR"
              className="h-32 sm:h-40 w-28 sm:w-36 object-cover object-top rounded-xl border border-neutral-700/60 shadow-lg group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
