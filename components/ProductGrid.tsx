/**
 * NR AURA BOTANICS
 * Shopify-Style Product Grid Component
 *
 * Renders all products in the authoritative catalog with real-time updates:
 * - Dynamic collection / category filter tabs
 * - High-res image display with hover zoom
 * - Badges, compare prices & savings calculation
 * - Stock status indicators (In Stock / Out of Stock / Available / Sold Out)
 * - Automatic "Add to Cart" button integration
 */

import React, { useState, useMemo } from 'react';
import { Product, ProductsData } from '../types';
import { trackMetaViewContent } from '../services/metaPixelService';

interface ProductGridProps {
  catalog: ProductsData;
  onAddToCart: (productId: string, quantity: number) => void;
  onSelectProduct?: (productId: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  catalog,
  onAddToCart,
  onSelectProduct
}) => {
  const products = catalog.products || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Derive categories from products
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    products.forEach(p => {
      if (p.category) {
        set.add(p.category);
      } else if (p.id.includes('collagen')) {
        set.add('Skin Care');
      } else {
        set.add('Hair Care');
      }
    });
    return Array.from(set);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter(p => {
      const cat = p.category || (p.id.includes('collagen') ? 'Skin Care' : 'Hair Care');
      return cat.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [products, selectedCategory]);

  const handleAddToCartClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    onAddToCart(productId, 1);
    setAddedProductId(productId);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const getStockStatus = (p: Product) => {
    if (p.stockStatus) return p.stockStatus;
    if (p.inStock === false || p.stockCount === 0) return 'Sold Out';
    return 'In Stock';
  };

  const isSoldOut = (p: Product) => {
    const status = getStockStatus(p);
    return status === 'Sold Out' || status === 'Out of Stock';
  };

  return (
    <section id="collection" className="py-16 md:py-24 bg-transparent border-b border-[#D4E7D2]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <span className="text-xs uppercase tracking-widest text-botanic-leaf font-bold block mb-2">
              Shopify-Style Catalog · {products.length} Botanical Formulations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-botanic-wood">
              Our Botanical Collection
            </h2>
            <p className="mt-2 text-sm sm:text-base text-botanic-woodMuted max-w-xl">
              100% natural, sulfate-free & cruelty-free cold-pressed elixirs with Cash on Delivery across Pakistan.
            </p>
          </div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-botanic-leaf text-white shadow-xs'
                        : 'bg-white/80 text-botanic-wood hover:bg-white border border-[#D4E7D2]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((p) => {
            const stockStatus = getStockStatus(p);
            const soldOut = isSoldOut(p);
            const discount = p.originalPrice > p.price
              ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
              : 0;

            const categoryLabel = p.category || (p.id.includes('collagen') ? 'Skin Care' : 'Hair Care');

            return (
              <div
                key={p.id}
                onClick={() => {
                  trackMetaViewContent(p);
                  onSelectProduct && onSelectProduct(p.id);
                }}
                className="group bg-white/85 backdrop-blur-xs rounded-2xl overflow-hidden border border-[#D4E7D2] shadow-xs hover:shadow-xl hover:border-botanic-leaf/60 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Image Frame */}
                <div className="relative aspect-square overflow-hidden bg-botanic-sand/30">
                  <img
                    src={p.image || (p.gallery && p.gallery[0]) || '/product-original.png'}
                    alt={p.name}
                    className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none gap-2">
                    <div className="flex flex-col gap-1.5 items-start">
                      {p.badge && (
                        <span className="px-2.5 py-1 rounded-full bg-botanic-leaf text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          {p.badge}
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-botanic-pink text-white text-[10px] font-bold shadow-xs">
                          Save {discount}%
                        </span>
                      )}
                    </div>

                    {/* Stock Status Pill */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                        soldOut
                          ? 'bg-gray-700 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {stockStatus}
                    </span>
                  </div>

                  {/* Size Pill */}
                  <div className="absolute bottom-3 left-3 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium">
                      {p.size}
                    </span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Category */}
                    <div className="flex items-center justify-between text-xs text-botanic-woodMuted mb-1.5">
                      <span className="text-botanic-leaf font-semibold uppercase tracking-wider text-[10px]">
                        {categoryLabel}
                      </span>
                      {p.stockCount > 0 && (
                        <span className="text-[10px] text-botanic-woodMuted">
                          {p.stockCount} in stock
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-base sm:text-lg font-semibold text-botanic-wood group-hover:text-botanic-leaf transition-colors line-clamp-1">
                      {p.name}
                    </h3>

                    {/* Tagline / Subtitle */}
                    <p className="text-xs text-botanic-woodMuted line-clamp-2 mt-1 leading-relaxed">
                      {p.shortDescription || p.tagline}
                    </p>
                  </div>

                  {/* Price & Add to Cart Action */}
                  <div className="pt-3 border-t border-[#E8E1D5] space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-xl sm:text-2xl font-bold text-botanic-wood tabular-nums">
                          {catalog.currencySymbol || 'Rs.'} {p.price.toLocaleString()}/-
                        </span>
                        {p.originalPrice > p.price && (
                          <span className="text-xs text-botanic-woodMuted line-through tabular-nums">
                            {catalog.currencySymbol || 'Rs.'} {p.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-botanic-leaf bg-botanic-leafSoft px-2 py-0.5 rounded">
                        COD Available
                      </span>
                    </div>

                    {/* Automatically Enabled Add To Cart Button */}
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={(e) => handleAddToCartClick(e, p.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                        soldOut
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : addedProductId === p.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-botanic-leaf hover:bg-botanic-leafDark text-white hover:scale-101 active:scale-98'
                      }`}
                    >
                      {soldOut ? (
                        <span>Out of Stock</span>
                      ) : addedProductId === p.id ? (
                        <>
                          <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
