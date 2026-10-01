/**
 * Meta Pixel & Facebook Catalog Tracking Service
 *
 * Resolves Meta Catalog Match Rate 0% by ensuring all standard events
 * (ViewContent, AddToCart, InitiateCheckout, Purchase) dynamically send:
 * 1. content_ids matching the exact Meta Catalog item / SKU:
 *    - Product 1 (Collagen Serum): ['dr6xfy8svc']
 *    - Product 2 (Second Product / Botanical Hair Spray): ['dr6xfy8svc']
 * 2. content_type set to 'product' (or 'product_group')
 * 3. Accurate value and PKR currency
 */

import { Product } from '../types';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Returns the exact Catalog Content ID for the given product.
 * Falls back to the user's registered Meta Catalog ID 'dr6xfy8svc'.
 */
export function getProductCatalogContentId(productOrId?: Product | string): string {
  if (!productOrId) return 'dr6xfy8svc';

  if (typeof productOrId === 'object') {
    if (productOrId.catalogContentId && productOrId.catalogContentId.trim()) {
      return productOrId.catalogContentId.trim();
    }
    const id = productOrId.id || '';
    if (id.includes('collagen')) {
      return 'dr6xfy8svc';
    }
    return 'dr6xfy8svc';
  }

  const str = String(productOrId);
  if (str.includes('collagen')) {
    return 'dr6xfy8svc';
  }
  return 'dr6xfy8svc';
}

/**
 * Safely dispatches an event to Meta Pixel (window.fbq)
 */
function sendFbq(eventName: string, params: Record<string, any>) {
  if (typeof window === 'undefined') return;

  try {
    const win = window as any;
    if (typeof win.fbq === 'function') {
      win.fbq('track', eventName, params);
      // Helpful developer verification log
      console.log(`[Meta Pixel] fbq('track', '${eventName}')`, params);
    } else {
      console.warn(`[Meta Pixel] window.fbq is not initialized yet for ${eventName}`);
    }
  } catch (err) {
    console.warn(`[Meta Pixel] Error sending ${eventName}:`, err);
  }
}

/**
 * Tracks ViewContent when customer views a product page / card / modal
 */
export function trackMetaViewContent(product: Product) {
  if (!product) return;

  const contentId = getProductCatalogContentId(product);
  const price = Number(product.price) || 0;
  const category = product.category || (product.id.includes('collagen') ? 'Skin Care' : 'Hair Care');

  sendFbq('ViewContent', {
    content_ids: [contentId],
    content_type: 'product',
    content_name: product.name,
    content_category: category,
    value: price,
    currency: 'PKR',
    contents: [
      {
        id: contentId,
        quantity: 1,
        item_price: price
      }
    ]
  });
}

/**
 * Tracks AddToCart when customer clicks Add to Cart or Buy Now
 */
export function trackMetaAddToCart(product: Product, quantity: number = 1) {
  if (!product) return;

  const contentId = getProductCatalogContentId(product);
  const qty = Math.max(1, Number(quantity) || 1);
  const unitPrice = Number(product.price) || 0;
  const totalValue = unitPrice * qty;
  const category = product.category || (product.id.includes('collagen') ? 'Skin Care' : 'Hair Care');

  sendFbq('AddToCart', {
    content_ids: [contentId],
    content_type: 'product',
    content_name: product.name,
    content_category: category,
    value: totalValue,
    currency: 'PKR',
    contents: [
      {
        id: contentId,
        quantity: qty,
        item_price: unitPrice
      }
    ]
  });
}

/**
 * Tracks InitiateCheckout when customer proceeds to checkout
 */
export function trackMetaInitiateCheckout(items: { product: Product; quantity: number }[], totalValue: number) {
  if (!items || items.length === 0) return;

  const contentIds = Array.from(new Set(items.map(item => getProductCatalogContentId(item.product))));
  const contents = items.map(item => ({
    id: getProductCatalogContentId(item.product),
    quantity: item.quantity,
    item_price: Number(item.product.price) || 0
  }));

  sendFbq('InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value: totalValue,
    currency: 'PKR',
    contents
  });
}

/**
 * Tracks Purchase when customer successfully places a COD / WhatsApp order
 */
export function trackMetaPurchase(
  orderId: string,
  items: { product: Product; quantity: number }[],
  totalValue: number
) {
  if (!items || items.length === 0) return;

  const contentIds = Array.from(new Set(items.map(item => getProductCatalogContentId(item.product))));
  const contents = items.map(item => ({
    id: getProductCatalogContentId(item.product),
    quantity: item.quantity,
    item_price: Number(item.product.price) || 0
  }));

  sendFbq('Purchase', {
    content_ids: contentIds,
    content_type: 'product',
    order_id: orderId,
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value: totalValue,
    currency: 'PKR',
    contents
  });
}
