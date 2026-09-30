/**
 * NR AURA BOTANICS
 * How to Use Section
 * 3-Step Botanical Wellness Spray Ritual
*/

import React from 'react';
import { ImageItem } from '../types';
import { useSiteImages } from '../services/imageService';

interface HowToUseSectionProps {
  image?: ImageItem;
}

export const HowToUseSection: React.FC<HowToUseSectionProps> = ({ image: propImage }) => {
  const { images } = useSiteImages();
  const howToUseImage = propImage || images.howToUse;

  const steps = [
    {
      number: "01",
      title: "Section & Spray",
      summary: "Direct Fine Mist Scalp Application",
      description: "Ensure your hair is dry or lightly towel-damp. Part your hair into 4–5 manageable sections. Hold the floral-labeled spray bottle 2 to 3 inches away and apply 4 to 6 pumps of the golden-amber botanical elixir directly onto the scalp roots, hairline, crown, and areas experiencing thinning.",
      tip: "The micro-spray head provides uniform coverage without excess liquid dripping down your neck."
    },
    {
      number: "02",
      title: "Stimulating Scalp Massage",
      summary: "3–5 Minutes Circular Activation",
      description: "Using the soft pads of your clean fingertips (or an organic wooden scalp massager), massage your scalp in gentle, circular patterns for 3 to 5 minutes. This immediately elevates blood capillary flow, warmth, and nutrient transport to dormant follicles.",
      tip: "Avoid aggressive scratching with fingernails; gentle circular pressure works best."
    },
    {
      number: "03",
      title: "Deep Absorption & Nourish",
      summary: "Overnight or 2+ Hours",
      description: "Leave the herbal elixir on your scalp for at least 2 to 3 hours to allow cellular absorption. For the most intensive root revitalization, leave it in overnight and rinse the next morning using a gentle, sulfate-free herbal shampoo.",
      tip: "Use 3 to 4 times weekly for the initial 6 weeks for optimal hair density results."
    }
  ];

  return (
    <section id="how-to-use" className="py-16 md:py-24 bg-white/70 backdrop-blur-xs border-b border-[#DCE8DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-botanic-leaf font-bold block mb-2">
            The Daily Hair Care Ritual
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-botanic-wood text-balance">
            How to Use the Spray for Best Results
          </h2>
          <p className="mt-3 text-sm sm:text-base text-botanic-woodMuted">
            The fine mist spray nozzle delivers pure botanical actives directly to your scalp with zero mess.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Spray Texture Image Showcase */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden border border-[#DCE8DB] shadow-md bg-botanic-sand/50 group">
              <img
                src={howToUseImage.src}
                alt={howToUseImage.alt}
                className="w-full h-80 sm:h-96 md:h-[460px] object-cover object-center transition-transform duration-700 group-hover:scale-103"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-botanic-wood/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#FCEEF2]">Micro-Mist Technology</span>
                  <p className="font-serif text-lg font-medium">Uniform root penetration, fast absorbing, and naturally refreshing.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Steps */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-botanic-sand/40 border border-[#DCE8DB] hover:border-botanic-leaf/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-botanic-leaf tabular-nums shrink-0">
                    {st.number}
                  </span>
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="font-serif text-lg sm:text-xl font-semibold text-botanic-wood">
                        {st.title}
                      </h3>
                      <span className="text-xs font-medium text-botanic-leaf">
                        {st.summary}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-botanic-wood/80 leading-relaxed">
                      {st.description}
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-xs text-botanic-woodMuted italic">
                      <svg className="w-4 h-4 text-botanic-leaf shrink-0 not-italic" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Pro-Tip: {st.tip}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default HowToUseSection;
