import React from 'react';

export const metadata = {
  title: 'NR AURA BOTANICS | Botanical Hair Growth Spray Serum (250ml)',
  description:
    'NR AURA BOTANICS - Revitalizes, Strengthens & Stimulates. Premium organic 250ml Botanical Hair Growth Spray Serum with Rosemary, Hibiscus, Amla & Fenugreek. Rs. 700/- with Cash on Delivery across Pakistan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* GoAffPro Affiliate Tracking Loader (Shop ID: eajjgybld) */}
        <script async src="https://api.goaffpro.com/loader.js?shop=eajjgybld"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
