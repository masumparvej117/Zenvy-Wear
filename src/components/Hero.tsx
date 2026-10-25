import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export function Hero() {
  const { setActiveCategoryFilter } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      kicker: 'NEW COLLECTION',
      titleLine1: 'STYLE FOR',
      titleLine2: 'EVERY YOU.',
      subtitle: 'Discover modern fashion for men and women.',
      cta: 'Shop Now',
      scriptText: 'Fashion for Everyone',
      image: '/src/assets/images/hero_fashion_zenvy_1792926441073.jpg',
      category: 'all',
    },
    {
      kicker: 'MEN’S ESSENTIALS 2026',
      titleLine1: 'TIMELESS',
      titleLine2: 'BLACK WEAR.',
      subtitle: 'Heavyweight 240 GSM drop-shoulder streetwear tees.',
      cta: 'Explore Men',
      scriptText: 'Wear Your Style',
      image: '/src/assets/images/model_men_tshirt_1792927704671.jpg',
      category: "Men's T-Shirt",
    },
    {
      kicker: 'CONTEMPORARY LUXURY',
      titleLine1: 'ELEGANCE',
      titleLine2: 'IN DETAIL.',
      subtitle: 'Monochrome tailored three-piece sets and relaxed tees.',
      cta: 'Explore Women',
      scriptText: 'Modern Fashion',
      image: '/src/assets/images/hero_fashion_zenvy_1792926441073.jpg',
      category: "Women's T-Shirt",
    },
  ];

  const handleShopNow = (cat = 'all') => {
    setActiveCategoryFilter(cat);
    const el = document.getElementById('featured-products-section') || document.getElementById('collection-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const active = slides[currentSlide];

  return (
    <section className="relative bg-[#0d0d0e] text-white overflow-hidden select-none">
      {/* Background Hero Banner Container */}
      <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center">
        {/* Background Image with Models */}
        <div className="absolute inset-0 z-0">
          <img
            src={active.image}
            alt="ZENVY WEAR Campaign"
            className="w-full h-full object-cover object-center brightness-90 filter transition-opacity duration-700"
          />
          {/* Subtle Dark Vignette / Gradient Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/75 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 flex items-center justify-between">
          {/* Left Vertical Slide Indicators + Arrow */}
          <div className="hidden md:flex flex-col items-center gap-6 text-xs mr-8 lg:mr-12">
            <div className="flex flex-col items-center gap-3 font-mono">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all cursor-pointer ${
                    currentSlide === idx
                      ? 'text-white font-bold scale-110 text-sm border-b-2 border-white pb-0.5'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </button>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer mt-2"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Main Hero Copy (Left-Aligned) */}
          <div className="max-w-xl space-y-4 sm:space-y-5">
            {/* Kicker */}
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-neutral-300 font-semibold">
              {active.kicker}
            </p>

            {/* Huge Bold Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[0.95] font-sans">
              <span>{active.titleLine1}</span>
              <br />
              <span>{active.titleLine2}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md font-normal leading-relaxed">
              {active.subtitle}
            </p>

            {/* Shop Now CTA Button (Exact Pill matching reference) */}
            <div className="pt-2">
              <button
                onClick={() => handleShopNow(active.category)}
                className="px-6 py-2.5 sm:px-7 sm:py-3 bg-white text-black hover:bg-neutral-200 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-2 cursor-pointer group"
              >
                <span>{active.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Overlay: Cursive Calligraphy "Fashion for Everyone" */}
          <div className="hidden lg:flex flex-col items-end justify-center pr-6 select-none pointer-events-none">
            <span
              className="text-4xl xl:text-5xl text-white/95 -rotate-12 font-serif italic tracking-wide drop-shadow-md"
              style={{ fontFamily: "'Playfair Display', cursive, serif" }}
            >
              {active.scriptText}
            </span>
          </div>

          {/* Right Arrow */}
          <div className="hidden md:flex items-center">
            <button
              onClick={nextSlide}
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
