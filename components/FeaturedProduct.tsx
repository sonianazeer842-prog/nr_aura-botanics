/**
 * NR AURA BOTANICS
 * Featured Product Section
 *
 * WhatsApp box directly opens WhatsApp chat/order without displaying raw phone digits.
 * Background: Light pastel green with realistic 3D hibiscus flowers showing through.
*/

import React, { useState, useEffect } from 'react';
import { Product, ProductsData } from '../types';
import { WHATSAPP_NUMBER } from '../constants';
import { ProductImageSlider } from './ProductImageSlider';
import { useSiteImages } from '../services/imageService';
import { trackMetaViewContent } from '../services/metaPixelService';

interface FeaturedProductProps {
  catalog: ProductsData;
  onAddToCart: (productId: string, quantity: number) => void;
  onBuyNow: (productId: string, quantity: number) => void;
  selectedProductId?: string;
  onSelectProduct?: (productId: string) => void;
}

export const FeaturedProduct: React.FC<FeaturedProductProps> = ({
  catalog,
  onAddToCart,
  onBuyNow,
  selectedProductId: propSelectedProductId,
  onSelectProduct: propOnSelectProduct
}) => {
  const { images } = useSiteImages();
  const products = catalog.products || [];
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    products[0]?.id || 'botanical-hair-growth-spray-250ml'
  );

  const selectedProductId = propSelectedProductId || internalSelectedId;
  const setSelectedProductId = (id: string) => {
    setInternalSelectedId(id);
    if (propOnSelectProduct) {
      propOnSelectProduct(id);
    }
  };
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const currentProduct: Product = products.find(p => p.id === selectedProductId) || products[0];

  useEffect(() => {
    if (currentProduct) {
      trackMetaViewContent(currentProduct);
    }
  }, [currentProduct?.id]);

  if (!currentProduct) {
    return null;
  }

  const isHairSpray = currentProduct.id === 'botanical-hair-growth-spray-250ml' || currentProduct.id.includes('hair-growth-spray');
  const productImages = (currentProduct.gallery && currentProduct.gallery.length > 0)
    ? currentProduct.gallery
    : [currentProduct.image || '/product-original.png'];

  const handleAddToCart = () => {
    onAddToCart(currentProduct.id, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleBuyNow = () => {
    onBuyNow(currentProduct.id, quantity);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, currentProduct.stockCount || 99)));
  };

  const discountPercentage = currentProduct.originalPrice > currentProduct.price
    ? Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
    : 0;

  const waProductText = encodeURIComponent(
    `Assalam o Alaikum! I want to order "${currentProduct.name}" (${currentProduct.size}, Qty: ${quantity}) for Rs. ${(currentProduct.price * quantity).toLocaleString()} via Cash on Delivery.`
  );

  return (
    <section id="shop" className="py-16 md:py-24 bg-transparent border-b border-[#D4E7D2]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs uppercase tracking-widest text-botanic-leaf font-bold block mb-2">
            {currentProduct.subtitle || (currentProduct.category ? `${currentProduct.category} · ${currentProduct.size}` : '100% Pure Botanical Formulation')}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-botanic-wood text-balance">
            {currentProduct.name}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-botanic-woodMuted">
            {currentProduct.tagline ? (
              <>
                {currentProduct.tagline} for just <strong className="text-botanic-leaf font-bold">Rs. {currentProduct.price.toLocaleString()}/-</strong> with pure botanical plant actives.
              </>
            ) : (
              <>
                {currentProduct.shortDescription}
              </>
            )}
          </p>
        </div>

        {/* Main Card with Frosted Translucent Styling */}
        <div className="bg-[#F7FAF6]/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-[#D4E7D2] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Product Gallery Slider Component */}
            <div className="lg:col-span-6 space-y-4">
              <ProductImageSlider
                galleryItems={isHairSpray ? images.gallery : undefined}
                images={isHairSpray ? undefined : productImages}
                customLabels={currentProduct.id.includes('collagen') ? {
                  "/collagen-bottle.jpg": "Collagen Booster Serum Bottle (30ml)",
                  "/collagen-flatlay.jpg": "Pure Coconut, Sesame & Clove Flatlay",
                  "/collagen-vanity.jpg": "Nightly Skincare Ritual Setting"
                } : undefined}
                productName={currentProduct.name}
                inStock={currentProduct.inStock}
                discountPercentage={discountPercentage}
              />

              {/* Quality Guarantees Bar */}
              <div className="p-4 rounded-xl bg-white/70 border border-[#D4E7D2] grid grid-cols-3 gap-2 text-center text-xs text-botanic-wood">
                <div>
                  <span className="block font-semibold text-botanic-wood">{currentProduct.size}</span>
                  <span className="text-[11px] text-botanic-woodMuted">
                    {currentProduct.id.includes('spray') ? 'Fine-mist spray head' : 'Precision dropper/cap'}
                  </span>
                </div>
                <div className="border-x border-[#D0E0CE]">
                  <span className="block font-semibold text-botanic-wood">Only Rs. {currentProduct.price.toLocaleString()}/-</span>
                  <span className="text-[11px] text-botanic-woodMuted">100% natural actives</span>
                </div>
                <div>
                  <span className="block font-semibold text-botanic-wood">Nationwide COD</span>
                  <span className="text-[11px] text-botanic-woodMuted">Pay upon arrival</span>
                </div>
              </div>
            </div>

            {/* Right Column: Contiguous Purchase Module */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Title & Sizing */}
              <div>
                <div className="flex items-center gap-2 text-xs text-botanic-woodMuted mb-1">
                  <span className="font-semibold text-botanic-leaf">{currentProduct.size}</span>
                  <span>·</span>
                  <span>{currentProduct.id.includes('spray') ? 'Spray Pump Nozzle' : 'Application Cap'}</span>
                  <span>·</span>
                  <span className="text-botanic-leaf font-medium">
                    {currentProduct.badge || 'Pure Botanical Formulation'}
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-botanic-wood">
                  {currentProduct.name}
                </h3>
                <p className="text-sm font-serif italic text-botanic-pinkDark mt-1">
                  {currentProduct.tagline}
                </p>
              </div>

              {/* Price Block - Authoritative from products.json */}
              <div className="p-4 rounded-xl bg-white/80 border border-[#D4E7D2] flex items-center justify-between">
                <div>
                  <span className="text-xs text-botanic-woodMuted uppercase tracking-wider block">Price in Pakistan</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-3xl font-bold text-botanic-leaf tabular-nums">
                      {catalog.currencySymbol || 'Rs.'} {currentProduct.price.toLocaleString()}/-
                    </span>
                    {currentProduct.originalPrice > currentProduct.price && (
                      <span className="text-sm text-botanic-woodMuted line-through tabular-nums">
                        {catalog.currencySymbol || 'Rs.'} {currentProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block text-xs font-semibold text-botanic-leaf bg-botanic-leafSoft px-2.5 py-1 rounded">
                    Cash on Delivery
                  </span>
                  <span className="block text-[11px] text-botanic-woodMuted mt-1">
                    {currentProduct.size}
                  </span>
                </div>
              </div>

              {/* Pack Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-botanic-wood block">
                  Select Botanical Treatment / Product:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {products.map(p => {
                    const isSelected = p.id === currentProduct.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProductId(p.id);
                        }}
                        className={`p-3 rounded-xl text-left border transition-all relative ${
                          isSelected
                            ? 'border-botanic-leaf bg-botanic-leafSoft/60 ring-1 ring-botanic-leaf text-botanic-wood'
                            : 'border-[#D4E7D2] bg-white/70 hover:border-botanic-leaf/50 text-botanic-wood/80'
                        }`}
                      >
                        {p.badge && (
                          <span className="text-[9px] uppercase font-bold text-botanic-leaf tracking-wider block mb-0.5 line-clamp-1">
                            {p.badge}
                          </span>
                        )}
                        <span className="block font-semibold text-xs text-botanic-wood line-clamp-1">
                          {p.name}
                        </span>
                        <span className="block text-[11px] text-botanic-woodMuted truncate">
                          {p.size}
                        </span>
                        <span className="block font-serif text-sm font-bold text-botanic-wood tabular-nums mt-1">
                          Rs. {p.price.toLocaleString()}/-
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-botanic-wood/80 leading-relaxed">
                {currentProduct.shortDescription || currentProduct.description}
              </p>

              {/* Key Benefits Bullet List */}
              {currentProduct.benefits && Array.isArray(currentProduct.benefits) && currentProduct.benefits.length > 0 && (
                <div className="space-y-2 border-t border-b border-[#D4E7D2] py-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-botanic-wood block mb-2">
                    Proven Botanical Benefits:
                  </span>
                  <ul className="space-y-2">
                    {currentProduct.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-botanic-wood">
                        <svg className="w-4 h-4 text-botanic-leaf shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity Selector & Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-botanic-wood uppercase tracking-wider">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-[#C5D8C3] rounded-lg bg-white overflow-hidden shadow-2xs">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-9 h-9 flex items-center justify-center text-botanic-wood hover:bg-botanic-sand disabled:opacity-40 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-botanic-wood tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (currentProduct.stockCount || 99)}
                      className="w-9 h-9 flex items-center justify-center text-botanic-wood hover:bg-botanic-sand disabled:opacity-40 transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-botanic-woodMuted">
                    {currentProduct.stockCount > 0 ? `${currentProduct.stockCount} in stock` : 'Sold out'}
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!currentProduct.inStock}
                    className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 border flex items-center justify-center gap-2 ${
                      addedAnimation
                        ? 'bg-botanic-leaf text-white border-botanic-leaf'
                        : 'bg-white text-botanic-wood border-[#C5D8C3] hover:bg-[#EAF3EA] hover:border-botanic-wood'
                    }`}
                  >
                    <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    <span>{addedAnimation ? '✓ Added to Cart!' : 'Add to Cart'}</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={!currentProduct.inStock}
                    className="w-full py-3.5 px-4 bg-botanic-leaf text-white rounded-xl font-semibold text-sm hover:bg-botanic-leafDark transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2"
                  >
                    <span>Buy Now (Rs. {(currentProduct.price * quantity).toLocaleString()})</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>

                {/* Dedicated WhatsApp Box Button (Opens WhatsApp directly without showing raw phone digits) */}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${waProductText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
                  title="Direct WhatsApp Order"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.2c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.09-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
                  </svg>
                  <span>Order Directly on WhatsApp (Instant Confirmation)</span>
                </a>
              </div>

              {/* Delivery & Shipping Info */}
              <div className="pt-2 text-xs text-botanic-woodMuted flex items-center justify-between">
                <span>🚚 Free Delivery over Rs. 2,000</span>
                <span>🔒 Sealed 250ml spray bottle with protective cap</span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturedProduct;
