/**
 * NR AURA BOTANICS
 * Store Constants & Editorial Content
 *
 * NOTE FOR ADMIN:
 * Product prices and catalog are dynamically read from /products.json.
 * Each 250ml bottle is priced as 700/- PKR.
 * WhatsApp contact: 0334-3562833
*/

import { CustomerReview } from './types';

export const BRAND_NAME = "NR AURA BOTANICS";
export const BRAND_DOMAIN = "www.nraurabotanics.com";
export const BRAND_TAGLINE = "Revitalizes, Strengthens & Stimulates";
export const BRAND_HERO_HEADING = "Nature's Secret to Stronger Hair";

export const FACEBOOK_PAGE_URL = "https://www.facebook.com/share/1F9k6wEBvE/";
export const INSTAGRAM_URL = "https://www.instagram.com/nraurabotanics";
export const WHATSAPP_NUMBER = "+923343562833"; // Updated WhatsApp number
export const WHATSAPP_DISPLAY = "0334-3562833";

// Editorial Customer Reviews / Testimonials Slider
export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    name: "Zainab Malik",
    city: "Lahore",
    rating: 5,
    date: "14 February 2026",
    verifiedBuyer: true,
    title: "Love the spray head! So easy to reach the scalp",
    comment: "The new spray head makes application so mess-free! Just 4-5 spritzes directly onto my roots and a quick massage. The 250ml bottle is huge and lasts months, and at Rs. 700 it is incredible value. I noticed baby hairs filling in after 4 weeks of use.",
    resultTime: "4 Weeks Result",
    purchasedProduct: "Botanical Hair Growth Spray (250ml)"
  },
  {
    id: "rev-2",
    name: "Ayesha Siddiqui",
    city: "Karachi",
    rating: 5,
    date: "28 January 2026",
    verifiedBuyer: true,
    title: "Hair fall reduced by almost 80%",
    comment: "Karachi's hard water ruined my hair roots. The combination of amla, hibiscus and rosemary in this spray mist transformed my scalp moisture. The fine mist spray distributes evenly without making my hair look oily or weighed down. Just ordered the Duo Pack on WhatsApp!",
    resultTime: "2 Weeks Result",
    purchasedProduct: "Botanical Spray (Duo Pack - 2x250ml)"
  },
  {
    id: "rev-3",
    name: "Mariam Tariq",
    city: "Islamabad",
    rating: 5,
    date: "10 March 2026",
    verifiedBuyer: true,
    title: "Legit natural ingredients with great bottle size",
    comment: "Most brands charge thousands for tiny 30ml bottles. Getting a 250ml spray bottle for only Rs. 700 with genuine cold-pressed rosemary and hibiscus is amazing. Delivery to Islamabad arrived in 2 days via Cash on Delivery.",
    resultTime: "6 Weeks Result",
    purchasedProduct: "Complete 3x250ml Course"
  },
  {
    id: "rev-4",
    name: "Hina Rehan",
    city: "Rawalpindi",
    rating: 5,
    date: "02 February 2026",
    verifiedBuyer: true,
    title: "Solved my dry winter dandruff and itchiness",
    comment: "The fenugreek and rosemary blend completely calmed my irritated scalp. The spray nozzle is high quality and creates a light mist that absorbs immediately. 10/10 recommendation for anyone looking for clean organic beauty.",
    resultTime: "3 Weeks Result",
    purchasedProduct: "Botanical Hair Growth Spray (250ml)"
  },
  {
    id: "rev-5",
    name: "Sana Farooq",
    city: "Faisalabad",
    rating: 5,
    date: "20 January 2026",
    verifiedBuyer: true,
    title: "Visible difference in hairline thickness",
    comment: "I spray my scalp every night before bed and massage for 3 minutes. My parting line looks significantly fuller and healthier. Super responsive customer service on WhatsApp 0334-3562833.",
    resultTime: "5 Weeks Result",
    purchasedProduct: "Botanical Hair Growth Spray (250ml)"
  }
];

// Major Pakistan Cities for rapid checkout selection
export const PAKISTAN_MAJOR_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Abbottabad",
  "Sukkur",
  "Other City"
];

// Frequently Asked Questions
export const FAQ_LIST = [
  {
    q: "How does the fine mist spray head bottle work?",
    a: "Our ergonomic spray head bottle dispenses an ultra-fine, even micro-mist directly onto your scalp roots and hair partings without drip or mess. Simply part your hair, hold 2-3 inches away, and spray 4–6 pumps before gently massaging with your fingertips."
  },
  {
    q: "What is the size and price of each bottle?",
    a: "Every bottle is a generous 250ml (8.5 fl. oz.) and is priced at only Rs. 700/-. We also offer value bundles for 60-day and 90-day courses with free delivery options."
  },
  {
    q: "How soon can I expect to see visible hair growth results?",
    a: "Most customers notice a substantial reduction in daily hair fall and soothing of dry scalp within 10–14 days. New follicular sprouting and baby hair density along the hairline typically become noticeable between 4 to 6 weeks of regular 3-to-4 times weekly application."
  },
  {
    q: "How does Cash on Delivery (COD) work across Pakistan?",
    a: "We offer secure Cash on Delivery across all cities and towns in Pakistan. You only pay the courier when the package arrives at your doorstep in safe, sealed packaging. Standard delivery takes 2 to 4 business days."
  },
  {
    q: "Can I order directly through WhatsApp?",
    a: "Yes! You can contact us directly on WhatsApp at 0334-3562833. Click any 'Order on WhatsApp' button on the website and your order details will be pre-filled automatically."
  }
];
