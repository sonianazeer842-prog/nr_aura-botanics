/**
 * NR AURA BOTANICS
 * Hero Section
 *
 * WhatsApp box directly opens WhatsApp chat/order without displaying raw phone digits.
*/

import React from 'react';
import { BRAND_HERO_HEADING, BRAND_TAGLINE, WHATSAPP_NUMBER } from '../constants';

interface HeroProps {
  onShopClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick }) => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Assalam o Alaikum, I would like to place an order for NR AURA BOTANICS 250ml Botanical Hair Growth Spray (Rs. 700).")}`;

  return (
    <section id="home" className="relative overflow-hidden bg-transparent border-b border-[#D4E7D2]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-18 lg:py-22">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Brand Story & Call to Action */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Organic Sub-Kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-botanic-leaf">
              <span className="w-6 h-[1.5px] bg-botanic-leaf"></span>
              <span>100% Cold-Pressed Organic Spray Elixir · 250ml</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-botanic-wood leading-[1.15] text-balance">
              {BRAND_HERO_HEADING}
            </h1>

            {/* Tagline */}
            <p className="text-lg md:text-xl font-serif italic text-botanic-pinkDark">
              "{BRAND_TAGLINE}"
            </p>

            {/* Description */}
            <p className="text-base text-botanic-wood/80 leading-relaxed max-w-xl">
              Now in a durable <strong className="text-botanic-wood font-semibold">transparent plastic 250ml spray bottle</strong> adorned with <strong className="text-botanic-wood font-semibold">handcrafted botanical floral label artwork</strong> and a fine mist spray cap, revealing the luminous golden-amber herbal elixir for only <strong className="text-botanic-leaf font-bold text-lg">Rs. 700/-</strong>.
              Imbued with the therapeutic potency of <strong className="text-botanic-wood font-semibold">Rosemary</strong>, <strong className="text-botanic-wood font-semibold">Hibiscus</strong>, <strong className="text-botanic-wood font-semibold">Amla</strong>, and <strong className="text-botanic-wood font-semibold">Fenugreek</strong> to awaken dormant follicles and restore lush density.
            </p>

            {/* Clean Key Feature Highlights */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-botanic-woodMuted">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-botanic-leaf shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Fine Mist Spray Head</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-botanic-leaf shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Full 250ml Bottle</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-botanic-leaf shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Rs. 700/- Cash on Delivery</span>
              </div>
            </div>

            {/* CTA Group with WhatsApp Box */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onShopClick}
                className="px-8 py-3.5 bg-botanic-leaf text-[#FAF8F5] font-semibold text-sm rounded-xl hover:bg-botanic-leafDark transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Order 250ml Spray (Rs. 700)</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              {/* WhatsApp Box Button (Click opens WhatsApp directly without exposing phone digits) */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 hover:scale-102"
                title="Direct WhatsApp Order"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
                </svg>
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Quick Proof Stat Bar */}
            <div className="pt-6 border-t border-[#D4E7D2] flex items-center gap-6 sm:gap-8 text-xs text-botanic-wood">
              <div>
                <span className="block font-serif text-xl sm:text-2xl font-bold text-botanic-wood tabular-nums">96%</span>
                <span className="text-botanic-woodMuted">Reduced Hair Fall</span>
              </div>
              <div className="w-px h-8 bg-[#D4E7D2]" />
              <div>
                <span className="block font-serif text-xl sm:text-2xl font-bold text-botanic-wood tabular-nums">250 ml</span>
                <span className="text-botanic-woodMuted">Large Value Size</span>
              </div>
              <div className="w-px h-8 bg-[#D4E7D2]" />
              <div>
                <span className="block font-serif text-xl sm:text-2xl font-bold text-botanic-leaf tabular-nums">Rs. 700</span>
                <span className="text-botanic-woodMuted">Direct Price</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image with Spray Bottle */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#D4E7D2] bg-white/70 backdrop-blur-xs group">
              <img
                src="/bottle.png"
                alt="NR AURA BOTANICS 250ml Botanical Hair Growth Serum Spray Bottle with Rosemary, Hibiscus, Amla & Fenugreek"
                className="w-full h-auto aspect-16/9 sm:aspect-4/3 object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-botanic-wood/75 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="text-xs uppercase tracking-widest text-[#FCEEF2] font-semibold">Fine Mist Spray Head · Signature Bottle</span>
                  <p className="font-serif text-lg font-medium text-white">250ml Botanical Hair Growth Serum · Rs. 700/-</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
