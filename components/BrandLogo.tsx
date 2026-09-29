/**
 * NR AURA BOTANICS
 * Official Brand Logo & Botanical Emblem
 * 
 * Features the official golden droplet emblem with lush botanical leaves & rosemary,
 * matched to the user's official brand picture.
*/

import React from 'react';

interface BrandLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  textColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
  textColor
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-14 h-14'
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Golden Droplet & Botanical Leaves Emblem from Shared Brand Logo */}
      <div
        className={`${iconDimensions} rounded-full overflow-hidden bg-[#163821] flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 shrink-0 border-2 border-[#D4AF37]/90 ring-2 ring-[#163821]/20`}
        title="NR AURA BOTANICS Official Logo"
      >
        <img
          src="/logo.png"
          alt="NR AURA BOTANICS Official Logo"
          className="w-full h-full object-cover object-center scale-105"
          loading="eager"
          referrerPolicy="no-referrer"
        />
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left">
          <span className={`font-serif text-lg sm:text-xl font-bold tracking-tight ${textColor || 'text-botanic-wood'}`}>
            NR AURA BOTANICS
          </span>
          <span className={`text-[10px] uppercase tracking-widest font-semibold ${textColor ? 'text-white/70' : 'text-botanic-leafDark'}`}>
            Organic Botanical Hair Growth
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;

