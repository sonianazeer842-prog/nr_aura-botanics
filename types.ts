/**
 * NR AURA BOTANICS
 * Domain Types & Interfaces
*/

export interface Ingredient {
  name: string;
  role: string;
  description: string;
}

export interface HowToUseStep {
  step: string;
  title: string;
  instruction: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  subtitle?: string;
  size: string;
  price: number; // In PKR
  originalPrice: number;
  inStock: boolean;
  stockCount: number;
  isMainProduct?: boolean;
  badge?: string;
  image: string;
  gallery: string[];
  shortDescription: string;
  benefits: string[];
  ingredients?: Ingredient[];
  howToUse?: HowToUseStep[];
}

export interface StoreInfo {
  brandName: string;
  tagline: string;
  facebookUrl: string;
  instagramUrl: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  supportEmail: string;
  location: string;
  shippingFee: number;
  freeShippingThreshold: number;
  deliveryEstimate: string;
}

export interface ProductsData {
  _comment?: string;
  _instructions?: string;
  _price_guide?: string;
  currency: string;
  currencySymbol: string;
  storeInfo: StoreInfo;
  products: Product[];
}

/**
 * Cart Item stores ONLY the authoritative Product ID and quantity.
 * SECURITY RULE: Customer cannot alter price. Subtotal & Totals are
 * always calculated server-side or from authoritative products.json.
 */
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CustomerReview {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  verifiedBuyer: boolean;
  title: string;
  comment: string;
  resultTime: string;
  purchasedProduct: string;
}

export interface OrderSubmission {
  orderId: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  paymentMethod: 'COD' | 'WHATSAPP';
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  shippingFee: number;
  grandTotal: number;
}

export type ViewType = 'store' | 'product-detail' | 'checkout' | 'admin' | 'admin-images';

export interface ViewState {
  type: ViewType;
  selectedProductId?: string;
}

export interface ImageItem {
  src: string;
  alt: string;
  title?: string;
}

export interface GalleryImageItem extends ImageItem {
  id: string;
  label?: string;
}

export interface SiteImages {
  _comment?: string;
  hero: ImageItem;
  howToUse: ImageItem;
  ingredients: ImageItem;
  logo: ImageItem;
  gallery: GalleryImageItem[];
}
