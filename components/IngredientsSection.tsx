/**
 * NR AURA BOTANICS
 * Ingredients Section
 * 4 Columns: Rosemary, Hibiscus, Amla & Fenugreek
*/

import React from 'react';

export const IngredientsSection: React.FC = () => {
  const ingredients = [
    {
      name: "Rosemary",
      scientificName: "Rosmarinus officinalis",
      role: "Follicle Activator & Circulation",
      accentColor: "border-botanic-leaf/30 bg-botanic-leafSoft/60",
      iconSvg: (
        <svg className="w-6 h-6 text-botanic-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      benefits: [
        "Stimulates blood micro-circulation in dermal capillaries around roots",
        "Counteracts hormonal follicle miniaturization to arrest hair thinning",
        "Extends the active anagen hair growth phase for thicker strands",
        "Naturally helps prevent premature greying with potent antioxidants"
      ]
    },
    {
      name: "Hibiscus",
      scientificName: "Hibiscus rosa-sinensis",
      role: "Keratin Synthesis & Gloss",
      accentColor: "border-botanic-pink/30 bg-botanic-pinkLight/60",
      iconSvg: (
        <svg className="w-6 h-6 text-botanic-pinkDark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0a9 9 0 01-9-9c0-4.97 4.03-9 9-9" />
          <circle cx="12" cy="12" r="3" strokeWidth="1.75" />
        </svg>
      ),
      benefits: [
        "Rich in natural amino acids that synthesize structural hair keratin",
        "Deeply conditions hair shafts, smoothing frizz and sealing split ends",
        "Imparts radiant, mirror-like natural shine without oily residue",
        "Calms scalp inflammation and maintains natural pH balance"
      ]
    },
    {
      name: "Amla (Gooseberry)",
      scientificName: "Phyllanthus emblica",
      role: "Vitamin C & Root Fortification",
      accentColor: "border-botanic-leaf/30 bg-botanic-leafSoft/60",
      iconSvg: (
        <svg className="w-6 h-6 text-botanic-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth="1.75" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 3v18M3 12h18" />
        </svg>
      ),
      benefits: [
        "Contains 20x more Vitamin C than oranges for cellular protection",
        "Deeply strengthens hair bulbs, significantly reducing wash-day shedding",
        "Guards delicate follicle cells against oxidative pollution and UV damage",
        "Enhances natural hair pigmentation and builds structural resilience"
      ]
    },
    {
      name: "Fenugreek (Methi)",
      scientificName: "Trigonella foenum-graecum",
      role: "Protein Matrix & Dandruff Relief",
      accentColor: "border-[#D9C4A6]/50 bg-[#FBF7F0]",
      iconSvg: (
        <svg className="w-6 h-6 text-botanic-woodMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      benefits: [
        "High concentration of plant proteins and essential nicotinic acid",
        "Reconstructs damaged cuticle layers and repairs heat-stressed shafts",
        "Potent antifungal properties quickly clear flaky scalp and dandruff",
        "Provides intense, long-lasting moisture to parched roots"
      ]
    }
  ];

  return (
    <section id="ingredients" className="py-16 md:py-24 bg-botanic-cream/60 backdrop-blur-xs border-b border-[#DCE8DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-botanic-leaf font-bold block mb-2">
            Purity You Can Feel · 250ml Botanical Spray
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-botanic-wood text-balance">
            Four Botanical Powerhouses
          </h2>
          <p className="mt-3 text-sm sm:text-base text-botanic-woodMuted">
            Each droplet of NR AURA BOTANICS is extracted using low-temperature cold-press methods to preserve 100% of bioactive phytonutrients.
          </p>
        </div>

        {/* Botanical Ingredients Photography Banner */}
        <div className="mb-14 rounded-2xl overflow-hidden border border-[#DCE8DB] shadow-md relative bg-white group">
          <img
            src="/ingredients.png"
            alt="Rosemary, Hibiscus, Amla, and Fenugreek raw organic ingredients"
            className="w-full h-64 sm:h-80 md:h-96 object-cover object-center transition-transform duration-700 group-hover:scale-103"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-botanic-wood/80 via-botanic-wood/30 to-transparent flex items-end p-6 sm:p-8">
            <div className="text-white max-w-2xl">
              <span className="text-xs uppercase tracking-widest text-[#FDF0F3] font-semibold">Clean Organic Formulation</span>
              <p className="font-serif text-xl sm:text-2xl font-medium mt-1">
                Zero Dilution. Zero Mineral Oils. Pure Herbaceous Spray Integrity.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Columns for the 4 Ingredients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {ingredients.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/90 rounded-2xl p-6 sm:p-7 border border-[#DCE8DB] shadow-2xs hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              {/* Ingredient Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.accentColor}`}>
                  {item.iconSvg}
                </div>
                <span className="text-xs font-serif italic text-botanic-woodMuted">
                  0{idx + 1}
                </span>
              </div>

              <h3 className="font-serif text-xl font-semibold text-botanic-wood">
                {item.name}
              </h3>
              <span className="text-[11px] font-sans italic text-botanic-woodMuted block mb-2">
                {item.scientificName}
              </span>
              <div className="text-xs font-semibold text-botanic-leaf uppercase tracking-wider mb-4 pb-3 border-b border-[#E3EDE1]">
                {item.role}
              </div>

              {/* Benefits list */}
              <ul className="space-y-2.5 text-xs text-botanic-wood/80 flex-grow">
                {item.benefits.map((b, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2">
                    <span className="text-botanic-leaf font-bold shrink-0">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default IngredientsSection;
