/**
 * NR AURA BOTANICS
 * Our Story & Botanical Craftsmanship
*/

import React from 'react';
import { useSiteImages } from '../services/imageService';

export const OurStorySection: React.FC = () => {
  const { images } = useSiteImages();
  return (
    <section id="story" className="py-16 md:py-24 bg-transparent border-b border-[#D4E7D2]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Emblem & Quality Pillars */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#F7FAF6]/90 backdrop-blur-md border border-[#D4E7D2] space-y-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border-2 border-[#D4AF37]/80 bg-[#163821] flex items-center justify-center">
                <img
                  src={images.logo.src}
                  alt={images.logo.alt}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-serif text-2xl font-semibold text-botanic-wood">
                Formulated Without Compromise
              </h3>
              <p className="text-sm text-botanic-wood/80 leading-relaxed">
                Modern hair care is saturated with mineral oils, synthetic silicones, and artificial fragrance that create an illusion of softness while suffocating the scalp. We built NR AURA BOTANICS to return to authentic biological nourishment.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-semibold text-botanic-wood">
                  <span className="w-2 h-2 rounded-full bg-botanic-leaf"></span>
                  <span>Pure Cold-Pressed Bioactive Extraction</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-botanic-wood">
                  <span className="w-2 h-2 rounded-full bg-botanic-leaf"></span>
                  <span>Zero Parabens, Sulfates, or Phthalates</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-botanic-wood">
                  <span className="w-2 h-2 rounded-full bg-botanic-leaf"></span>
                  <span>Small-Batch Bottling for Maximum Freshness</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-botanic-wood">
                  <span className="w-2 h-2 rounded-full bg-botanic-leaf"></span>
                  <span>Cruelty-Free & Environmentally Mindful</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-widest text-botanic-leaf font-bold block">
              The Origin of NR AURA BOTANICS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-botanic-wood leading-[1.2] text-balance">
              Where Ancient Botanical Science Meets Modern Scalp Biology
            </h2>
            
            <p className="text-sm sm:text-base text-botanic-wood/80 leading-relaxed">
              NR AURA BOTANICS was founded on a simple realization: your hair's strength is a direct reflection of your scalp's ecosystem. When environmental pollution, hard water, and hormonal stress induce follicular inflammation, chemical shortcuts only mask the damage.
            </p>

            <p className="text-sm sm:text-base text-botanic-wood/80 leading-relaxed">
              By harmonizing <strong className="text-botanic-wood font-semibold">Rosemary</strong> (nature’s clinically acknowledged micro-circulation catalyst) with the natural amino acid wealth of <strong className="text-botanic-wood font-semibold">Hibiscus</strong>, the deep antioxidant density of <strong className="text-botanic-wood font-semibold">Amla</strong>, and the protein restorative strength of <strong className="text-botanic-wood font-semibold">Fenugreek</strong>, we created a lightweight restorative elixir engineered specifically for South Asian hair dynamics and climates.
            </p>

            <div className="p-6 rounded-2xl bg-botanic-sand/50 border-l-4 border-botanic-wood italic font-serif text-botanic-wood text-base">
              "We believe that real hair transformation begins when you respect the natural growth cycle of the scalp, feeding it unadulterated nutrients from the earth."
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OurStorySection;
