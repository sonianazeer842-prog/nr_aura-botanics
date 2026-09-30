import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GalleryImageItem } from '../types';

interface ProductImageSliderProps {
  images?: string[];
  galleryItems?: GalleryImageItem[];
  customLabels?: Record<string, string>;
  productName: string;
  inStock?: boolean;
  discountPercentage?: number;
  initialIndex?: number;
}

export const defaultLifestyleImages = [
  '/lifestyle-1.jpg',
  '/lifestyle-2.jpg',
  '/lifestyle-3.jpg',
  '/lifestyle-4.jpg',
  '/lifestyle-5.jpg',
];

export const defaultLifestyleLabels: Record<string, string> = {
  '/lifestyle-1.jpg': 'Fine Micro-Mist Spray',
  '/lifestyle-2.jpg': 'Pure Hydration Splash',
  '/lifestyle-3.jpg': 'Botanical Harvest & Herbs',
  '/lifestyle-4.jpg': 'Floral Blossom Infusion',
  '/lifestyle-5.jpg': 'In-Hand Daily Scalp Routine',
  '/product-original.png': 'Studio Botanical Display',
};

export const ProductImageSlider: React.FC<ProductImageSliderProps> = ({
  images,
  galleryItems,
  customLabels,
  productName,
  inStock = true,
  discountPercentage = 0,
  initialIndex = 0,
}) => {
  // Compute slides array from galleryItems or images prop
  const slides = galleryItems && galleryItems.length > 0
    ? galleryItems.map(item => item.src)
    : (images && images.length > 0 ? images : defaultLifestyleImages);

  const labelMap = {
    ...defaultLifestyleLabels,
    ...(galleryItems?.reduce((acc, item) => ({ ...acc, [item.src]: item.label || item.alt }), {}) || {}),
    ...(customLabels || {})
  };

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = slides.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setDragOffset(0);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setDragOffset(0);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    setDragOffset(0);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - dragStartX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -40) {
      goToNext();
    } else if (dragOffset > 40) {
      goToPrev();
    } else {
      setDragOffset(0);
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -40) {
      goToNext();
    } else if (dragOffset > 40) {
      goToPrev();
    } else {
      setDragOffset(0);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isZoomOpen) {
        if (e.key === 'Escape') setIsZoomOpen(false);
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'ArrowLeft') goToPrev();
        return;
      }
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, isZoomOpen]);

  const activeImage = slides[currentIndex];
  const activeLabel = labelMap[activeImage] || `Lifestyle Placement ${currentIndex + 1}`;

  return (
    <div className="space-y-4 select-none">
      {/* Primary Carousel Frame */}
      <div
        ref={containerRef}
        className="relative aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden bg-white/80 border border-[#D4E7D2] shadow-xs group cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDragging) {
            setIsDragging(false);
            setDragOffset(0);
          }
        }}
      >
        {/* Active Slide Image */}
        <div
          className="w-full h-full flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {slides.map((imgUrl, idx) => {
            const label = labelMap[imgUrl] || `Placement ${idx + 1}`;
            return (
              <div key={idx} className="w-full h-full shrink-0 relative overflow-hidden bg-stone-50">
                <img
                  src={imgUrl}
                  alt={`${productName} - ${label}`}
                  className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>
            );
          })}
        </div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <span className="bg-botanic-leafDark text-white text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded shadow-xs">
            {inStock ? 'In Stock · 250ml Spray Bottle' : 'Out of Stock'}
          </span>
        </div>

        {discountPercentage > 0 && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <span className="bg-botanic-pink text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs">
              Save {discountPercentage}%
            </span>
          </div>
        )}

        {/* Zoom Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomOpen(true);
          }}
          className="absolute top-14 right-4 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-botanic-wood shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 focus:outline-none border border-[#D4E7D2]"
          aria-label="Zoom image"
          title="Zoom full image"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>

        {/* Arrow Controls */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-botanic-wood shadow-md flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 hover:scale-110 focus:outline-none z-20 border border-[#D4E7D2]"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-botanic-wood shadow-md flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 hover:scale-110 focus:outline-none z-20 border border-[#D4E7D2]"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Bottom Placement Label & Slide Counter */}
        {total > 1 && (
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium tracking-wide shadow-xs">
              {activeLabel}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white/90 text-[11px] font-semibold tracking-wider">
              {currentIndex + 1} / {total}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails Navigation Row */}
      {total > 1 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {slides.map((imgUrl, idx) => {
              const label = labelMap[imgUrl] || `Placement ${idx + 1}`;
              const isActive = currentIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 text-left focus:outline-none ${
                    isActive
                      ? 'border-botanic-leaf shadow-sm scale-102 ring-2 ring-botanic-leaf/30'
                      : 'border-[#D4E7D2] opacity-75 hover:opacity-100 bg-white'
                  }`}
                  title={label}
                >
                  <img
                    src={imgUrl}
                    alt={label}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/55 text-[9px] text-white font-medium text-center truncate px-0.5">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-6 h-1.5 bg-botanic-leaf'
                    : 'w-1.5 h-1.5 bg-[#C5DDC3] hover:bg-botanic-leaf/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <p className="text-center text-[11px] text-botanic-woodMuted">
            Swipe left/right or click thumbnails to view all lifestyle placements
          </p>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 text-sm flex items-center gap-1 focus:outline-none"
            >
              <span>Close</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Image */}
            <img
              src={activeImage}
              alt={activeLabel}
              className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />

            {/* Modal Caption & Prev/Next */}
            <div className="mt-4 flex items-center justify-between w-full text-white text-sm px-2">
              <span className="font-medium">{activeLabel}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white"
                >
                  Prev
                </button>
                <span className="text-xs opacity-75">
                  {currentIndex + 1} / {total}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
