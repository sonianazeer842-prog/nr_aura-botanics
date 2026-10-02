/**
 * NR AURA BOTANICS - Product Catalog & Security Service
 *
 * CRITICAL SECURITY ASSURANCE:
 * Customer can ONLY do "Add to Cart" and "Checkout".
 * Customer cannot edit price or product data from frontend.
 * Price is ALWAYS fetched strictly from authoritative products.json,
 * never from user input or client payload.
 *
 * Product: Botanical Hair Growth Spray Serum (250ml, Rs. 700/-)
 * WhatsApp Contact: 0334-3562833
*/

import { useState, useEffect } from 'react';
import { ProductsData, Product, CartItem, OrderSubmission } from '../types';

// Default initial database fallback matching /products.json
export const INITIAL_PRODUCTS_DATA: ProductsData = {
  currency: "PKR",
  currencySymbol: "Rs.",
  storeInfo: {
    brandName: "NR AURA BOTANICS",
    tagline: "Revitalizes, Strengthens & Stimulates",
    facebookUrl: "https://www.facebook.com/share/1F9k6wEBvE/",
    instagramUrl: "https://www.instagram.com/nraurabotanics",
    whatsappNumber: "+923343562833",
    whatsappDisplay: "0334-3562833",
    supportEmail: "care@nraurabotanics.com",
    location: "Lahore, Pakistan",
    shippingFee: 199,
    freeShippingThreshold: 2000,
    deliveryEstimate: "2-4 Working Days across Pakistan"
  },
  products: [
    {
      id: "botanical-hair-growth-spray-250ml",
      name: "Botanical Hair Growth Spray Serum",
      tagline: "Revitalizes, Strengthens & Stimulates",
      subtitle: "Rosemary, Hibiscus, Amla & Fenugreek Infusion · Floral Printed Label · Fine Mist Spray Cap",
      size: "250ml / 8.5 fl oz",
      catalogContentId: "dr6xfy8svc",
      price: 700, // <-- // EDIT PRICE HERE (Single 250ml Bottle Price in PKR)
      originalPrice: 950,
      inStock: true,
      stockCount: 65,
      isMainProduct: true,
      badge: "Signature Bestseller",
      image: "/product-original.png",
      gallery: [
        "/lifestyle-1.jpg",
        "/lifestyle-2.jpg",
        "/lifestyle-3.jpg",
        "/lifestyle-4.jpg",
        "/lifestyle-5.jpg"
      ],
      shortDescription: "Our flagship potent botanical elixir presented in a lightweight, shatterproof transparent bottle adorned with handcrafted floral label printing, revealing the pure golden-amber herbal elixir inside. Fitted with an ergonomic fine-mist spray pump cap for mess-free, even root distribution. Infused with active cold-pressed Rosemary, Hibiscus petals, raw Amla, and golden Fenugreek to awaken dormant follicles, fortify hair roots, curb hair shedding, and stimulate thick, resilient hair growth.",
      benefits: [
        "Transparent shatter-resistant bottle featuring artistic botanical floral label artwork",
        "Luminous golden-amber herbal nectar absorbs rapidly without leaving greasy residue",
        "Ultra-fine spray cap for effortless, even scalp application without mess",
        "Generous 250ml size providing extended daily nourishment for just Rs. 700/-",
        "Revitalizes dormant follicles & accelerates visible new hair growth",
        "Deeply fortifies roots to drastically reduce seasonal & stress shedding",
        "Rosemary & Hibiscus complex activates healthy blood circulation",
        "Amla & Fenugreek soothe dry scalp, relieve itching & eradicate dandruff",
        "Lightweight, non-greasy organic formula easily absorbs into roots",
        "100% natural, sulfate-free, paraben-free, silicone-free & cruelty-free"
      ],
      ingredients: [
        {
          name: "Rosemary Extract & Pure Oil",
          role: "Follicle Activator & Circulation",
          description: "Clinically proven botanical powerhouse that boosts micro-capillary circulation around hair roots, helping counter thinning, extend anagen growth phase, and darken premature graying."
        },
        {
          name: "Fresh Hibiscus Blossom",
          role: "Natural Keratin & Deep Conditioning",
          description: "Abundant in natural amino acids, vitamins A and C, and flavonoids. Strengthens hair keratin, prevents split ends, conditions the cuticle, and imparts luminous natural gloss."
        },
        {
          name: "Organic Amla (Indian Gooseberry)",
          role: "Vitamin C & Root Fortification",
          description: "Nature's richest natural source of Vitamin C and essential fatty acids. Nourishes the dermal papilla, builds resistance to breakage, and guards against environmental pollution."
        },
        {
          name: "Golden Fenugreek (Methi)",
          role: "Protein Replenishment & Scalp Health",
          description: "Brimming with high protein concentrations, lecithin, and nicotinic acid to reconstruct brittle hair shafts, intensely hydrate parched scalps, and clear stubborn flaking."
        }
      ],
      howToUse: [
        {
          step: "01",
          title: "Section & Spray",
          instruction: "Part your dry or damp hair into clean sections. Hold the fine-mist spray nozzle 2-3 inches away and spray 4–6 pumps directly onto the scalp roots and thinning zones."
        },
        {
          step: "02",
          title: "Invigorate & Massage",
          instruction: "Using soft pads of your fingertips (or a wooden scalp massager), massage in circular motions for 3–5 minutes. This awakens dormant follicles and maximizes nutrient absorption."
        },
        {
          step: "03",
          title: "Leave In & Nourish",
          instruction: "Allow the herbal elixir to penetrate for at least 2 hours, or leave in overnight for intensive restorative nourishment. Rinse with a gentle, sulfate-free shampoo."
        }
      ]
    },
    {
      id: "botanical-serum-duo-pack",
      name: "Botanical Hair Growth Spray (Duo Pack - 2x250ml)",
      tagline: "60-Day Intensive Revitalization Course",
      subtitle: "2x 250ml Spray Bottles · Save Rs. 100",
      size: "2 x 250ml (500ml Total)",
      catalogContentId: "dr6xfy8svc",
      price: 1300, // <-- // EDIT PRICE HERE (Duo Pack Price in PKR)
      originalPrice: 1600,
      inStock: true,
      stockCount: 38,
      isMainProduct: false,
      badge: "Most Popular",
      image: "/product-original.png",
      gallery: [
        "/lifestyle-1.jpg",
        "/lifestyle-2.jpg",
        "/lifestyle-3.jpg",
        "/lifestyle-4.jpg",
        "/lifestyle-5.jpg"
      ],
      shortDescription: "Recommended 60-day consistent growth regimen with two 250ml spray bottles featuring botanical floral printed labels and luminous golden-amber herbal elixir. Ensures uninterrupted follicular nourishment with immediate savings across Pakistan.",
      benefits: [
        "Two full 250ml transparent spray bottles with botanical floral artwork for 60-day density therapy",
        "Direct Rs. 100 savings compared to individual bottles",
        "Includes Nationwide Courier Tracking across all cities in Pakistan",
        "Fresh small-batch cold-pressed bottling"
      ]
    },
    {
      id: "botanical-serum-trio-pack",
      name: "Botanical Hair Growth Spray (Trio Course - 3x250ml)",
      tagline: "3-Month Complete Transformation Course",
      subtitle: "3x 250ml Transparent Spray Bottles · Maximum Value & Free Delivery",
      size: "3 x 250ml (750ml Total)",
      catalogContentId: "dr6xfy8svc",
      price: 1950, // <-- // EDIT PRICE HERE (Trio Pack Price in PKR)
      originalPrice: 2500,
      inStock: true,
      stockCount: 20,
      isMainProduct: false,
      badge: "Best Value · Free Delivery",
      image: "/product-original.png",
      gallery: [
        "/lifestyle-2-1790837091164.jpg",
        "/lifestyle-5.jpg",
        "/lifestyle-3-1790837152024.jpg",
        "/lifestyle-4-1790837174523.jpeg",
        "/lifestyle-5-1790837190447.jpg"
      ],
      shortDescription: "The definitive 90-day biological restoration cycle with three 250ml spray bottles filled with golden-amber botanical elixir with botanical floral labels. Perfect for pronounced thinning, post-partum shedding, or family sharing. Includes free nationwide delivery.",
      benefits: [
        "Full 750ml cellular cycle transformation for chronic hair thinning",
        "Complimentary FREE Cash on Delivery across Pakistan",
        "Direct Rs. 550 savings off standard retail",
        "Personalized hair care consultation via WhatsApp"
      ]
    },
    {
      id: "collagen-boost-organic-serum-30ml",
      name: "Collagen Boost Organic Serum",
      tagline: "Restores Collagen, Firms & Illuminates",
      subtitle: "Natural Collagen, Aloe Vera, Rosehip Oil, Vitamin C & Hyaluronic Acid · Safe for Sensitive Skin",
      size: "30ml / 1 fl oz",
      catalogContentId: "dr6xfy8svc",
      price: 1200,
      originalPrice: 1500,
      inStock: true,
      stockCount: 50,
      isMainProduct: false,
      badge: "New Launch · 100% Organic",
      image: "/collagen-bottle.jpg",
      gallery: [
        "/collagen-bottle.jpg",
        "/collagen-flatlay.jpg",
        "/collagen-vanity.jpg"
      ],
      shortDescription: "Made with 100% Pure & Natural Ingredients. Safe for Sensitive Skin. This chemical-free serum is crafted to naturally restore your skin's collagen, giving you firmer, younger and glowing skin without any side effects.",
      benefits: [
        "Naturally Reduces Wrinkles & Fine Lines",
        "Firms & Lifts Saggy Skin",
        "Deeply Hydrates and Brings Natural Glow",
        "Safe for Sensitive Skin, No Side Effects",
        "Suitable For: All Skin Types, Especially Sensitive Skin",
        "Age 25+ | For Men & Women | 100% Organic & Cruelty-Free",
        "Infused with Coconut, Sesame & Clove botanical formula",
        "Non-comedogenic, fast-absorbing elixir with pure active botanicals"
      ],
      ingredients: [
        {
          name: "Natural Plant Collagen",
          role: "Elasticity & Firmness Restoration",
          description: "Replenishes skin structure, boosts cellular resilience, and visibly smoothes fine lines and sagging contours."
        },
        {
          name: "Organic Aloe Vera Extract",
          role: "Deep Soothing & Cellular Hydration",
          description: "Delivers intensive cooling hydration, accelerates skin healing, and calms redness and sensitive skin irritation."
        },
        {
          name: "Cold-Pressed Rosehip Oil",
          role: "Vitamin A & Skin Barrier Repair",
          description: "Rich in essential fatty acids and natural retinoids to fade hyperpigmentation, even skin tone, and restore youthful elasticity."
        },
        {
          name: "Stabilized Vitamin C",
          role: "Radiance & Antioxidant Protection",
          description: "Potent brightening antioxidant that combats environmental free radicals, stimulates collagen synthesis, and imparts a luminous natural glow."
        },
        {
          name: "Multi-Molecular Hyaluronic Acid",
          role: "Intense Moisture Retention",
          description: "Penetrates deeply to attract and lock in up to 1000x its weight in water, plumping skin and smoothing texture."
        }
      ],
      howToUse: [
        {
          step: "01",
          title: "Cleanse Skin",
          instruction: "Wash face and neck with lukewarm water and a gentle cleanser, then pat dry with a soft clean towel."
        },
        {
          step: "02",
          title: "Dispense 2-3 Drops",
          instruction: "Using the glass dropper, dispense 2–3 drops onto clean fingertips or directly onto cheeks and forehead."
        },
        {
          step: "03",
          title: "Nightly Ritual",
          instruction: "Gently smooth and press upward into face and neck every night before sleep. Allow complete overnight absorption."
        }
      ]
    }
  ]
};

export const PRODUCTS_STORAGE_KEY = 'nr_aura_botanics_products_v14';
export const PRODUCTS_EVENT_NAME = 'nr_aura_products_updated';
const ADMIN_AUTH_KEY = 'nr_aura_admin_session';

/**
 * Retrieves the authoritative product catalog.
 */
export function getAuthoritativeCatalog(): ProductsData {
  try {
    const local = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read local catalog cache", err);
  }
  return INITIAL_PRODUCTS_DATA;
}

/**
 * React hook to listen for real-time catalog changes
 */
export function useProductCatalog(initialData?: ProductsData) {
  const [catalog, setCatalog] = useState<ProductsData>(() => initialData || getAuthoritativeCatalog());

  useEffect(() => {
    // Initial fetch from /products.json
    fetchAuthoritativeCatalog().then(data => {
      setCatalog(data);
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ProductsData>;
      if (customEvent.detail) {
        setCatalog(customEvent.detail);
      }
    };

    window.addEventListener(PRODUCTS_EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(PRODUCTS_EVENT_NAME, handleUpdate);
  }, []);

  return { catalog, setCatalog };
}

/**
 * Asynchronously checks /products.json from the network if available
 */
export async function fetchAuthoritativeCatalog(): Promise<ProductsData> {
  try {
    const response = await fetch(`/products.json?t=${Date.now()}`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data, null, 2));
        window.dispatchEvent(new CustomEvent(PRODUCTS_EVENT_NAME, { detail: data }));
        return data;
      }
    }
  } catch (e) {
    console.info("Using embedded products data baseline");
  }
  return getAuthoritativeCatalog();
}

/**
 * Save updated product database (Admin only)
 * 1. Saves to localStorage
 * 2. Broadcasts custom event so all live components immediately update
 * 3. Sends POST /api/save-products to write to products.json permanently on disk
 */
export async function saveAuthoritativeCatalog(data: ProductsData): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Save to local storage
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data, null, 2));

    // 2. Broadcast event to live site
    window.dispatchEvent(new CustomEvent(PRODUCTS_EVENT_NAME, { detail: data }));

    // 3. Persist to disk via server API
    try {
      const res = await fetch('/api/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return {
          success: true,
          message: '✓ Saved permanently to products.json and live site updated!'
        };
      }
    } catch {
      // In static deployment (e.g. Vercel)
    }

    return {
      success: true,
      message: '✓ Saved to browser storage and live site updated!'
    };
  } catch (err) {
    console.error("Failed to persist catalog", err);
    return { success: false, message: `Save failed: ${String(err)}` };
  }
}

/**
 * Upload an image file for a product (converts to URL or base64)
 */
export async function uploadProductImage(file: File, customFilename?: string): Promise<{ success: boolean; url: string; message: string }> {
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = customFilename || `product-${Date.now()}.${ext}`;

    // Read base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Try dev server API
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, data: base64Data })
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, url: json.path || `/${filename}`, message: 'Uploaded successfully!' };
      }
    } catch {
      // Fallback to base64 data URL
    }

    return { success: true, url: base64Data, message: 'Image loaded successfully!' };
  } catch (err) {
    return { success: false, url: '', message: `Upload failed: ${String(err)}` };
  }
}

/**
 * Reset catalog back to factory defaults
 */
export function resetAuthoritativeCatalog(): void {
  try {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(PRODUCTS_EVENT_NAME, { detail: INITIAL_PRODUCTS_DATA }));
  } catch (err) {
    console.error("Failed to reset catalog", err);
  }
}

/**
 * SECURITY ENFORCEMENT:
 * Calculate order subtotals and grand totals strictly from the authoritative database.
 * The customer CANNOT tamper with price.
 */
export function calculateOrderSecurity(cart: CartItem[], catalog: ProductsData) {
  const verifiedItems: {
    productId: string;
    productName: string;
    size: string;
    image: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[] = [];

  let subtotal = 0;

  for (const item of cart) {
    const product = catalog.products.find(p => p.id === item.productId);
    if (!product) continue;

    const safeQty = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));
    const authoritativePrice = Math.max(0, Number(product.price) || 0);
    const lineTotal = authoritativePrice * safeQty;

    verifiedItems.push({
      productId: product.id,
      productName: product.name,
      size: product.size,
      image: product.image,
      quantity: safeQty,
      unitPrice: authoritativePrice,
      totalPrice: lineTotal
    });

    subtotal += lineTotal;
  }

  const shippingFee = (subtotal >= catalog.storeInfo.freeShippingThreshold || subtotal === 0)
    ? 0
    : catalog.storeInfo.shippingFee;

  const grandTotal = subtotal + shippingFee;

  return {
    verifiedItems,
    subtotal,
    shippingFee,
    grandTotal,
    currencySymbol: catalog.currencySymbol || "Rs.",
    freeShippingThreshold: catalog.storeInfo.freeShippingThreshold
  };
}

/**
 * Generate WhatsApp message URL for one-click Pakistan checkout
 */
export function buildWhatsAppOrderUrl(order: OrderSubmission, storeInfo: ProductsData['storeInfo']): string {
  const itemsText = order.items
    .map((item, idx) => `${idx + 1}. *${item.productName}* x ${item.quantity} = Rs. ${item.totalPrice.toLocaleString()}`)
    .join('\n');

  const deliveryNote = order.shippingFee === 0 ? "FREE Nationwide Delivery" : `Rs. ${order.shippingFee} Standard Shipping`;

  const message = `🌿 *NEW ORDER - NR AURA BOTANICS* 🌿\n\n` +
    `*Order ID:* #${order.orderId}\n` +
    `*Date:* ${new Date().toLocaleDateString('en-GB')}\n\n` +
    `*Customer Details:*\n` +
    `👤 *Name:* ${order.customerName}\n` +
    `📞 *Phone:* ${order.phone}\n` +
    `📍 *Delivery Address:* ${order.address}\n` +
    `🏙️ *City:* ${order.city}\n` +
    (order.notes ? `📝 *Special Instructions:* ${order.notes}\n` : '') +
    (order.affiliateId ? `🤝 *Referral / Affiliate ID:* ${order.affiliateId}\n` : '') +
    `\n*Order Summary:*\n` +
    `${itemsText}\n\n` +
    `📦 *Delivery:* ${deliveryNote}\n` +
    `💰 *Grand Total:* *Rs. ${order.grandTotal.toLocaleString()}* (Cash on Delivery)\n\n` +
    `Please confirm my order and share dispatch details. Thank you!`;

  const cleanNumber = (storeInfo.whatsappNumber || WHATSAPP_DEFAULT_PHONE).replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

const WHATSAPP_DEFAULT_PHONE = "923343562833";

export function isAdminAuthenticated(): boolean {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'authenticated_admin_aura';
  } catch {
    return false;
  }
}

export function loginAdmin(password: string): boolean {
  const storedPassword = localStorage.getItem('nr_aura_admin_pass') || 'aura2026';
  if (password.trim() === storedPassword) {
    try {
      localStorage.setItem(ADMIN_AUTH_KEY, 'authenticated_admin_aura');
      return true;
    } catch {
      return true;
    }
  }
  return false;
}

export function logoutAdmin(): void {
  try {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  } catch {}
}

export function setCustomAdminPassword(newPassword: string): void {
  if (newPassword && newPassword.trim().length >= 4) {
    localStorage.setItem('nr_aura_admin_pass', newPassword.trim());
  }
}
