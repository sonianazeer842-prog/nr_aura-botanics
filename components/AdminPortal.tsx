/**
 * NR AURA BOTANICS
 * Hidden Admin Portal (/admin)
 *
 * Provides password-protected local authentication for the store owner.
 * Allows editing product prices (// EDIT PRICE HERE), stock counts,
 * descriptions, and exporting updated products.json.
*/

import React, { useState, useEffect } from 'react';
import { ProductsData, Product } from '../types';
import {
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
  saveAuthoritativeCatalog,
  resetAuthoritativeCatalog,
  setCustomAdminPassword,
  uploadProductImage
} from '../services/productService';

interface AdminPortalProps {
  catalog: ProductsData;
  onUpdateCatalog: (newCatalog: ProductsData) => void;
  onExitAdmin: () => void;
  onSelectProductForPreview?: (productId: string) => void;
}

interface NewProductFormState {
  name: string;
  tagline: string;
  size: string;
  price: number | '';
  originalPrice: number | '';
  stockStatus: 'In Stock' | 'Out of Stock' | 'Available' | 'Sold Out';
  stockCount: number | '';
  category: string;
  catalogContentId: string;
  shortDescription: string;
  description: string;
  image: string;
  imagePreview: string;
  enableAddToCart: boolean;
  badge: string;
}

const initialNewProductForm: NewProductFormState = {
  name: '',
  tagline: '',
  size: '30ml / 1 fl oz',
  price: '',
  originalPrice: '',
  stockStatus: 'In Stock',
  stockCount: 50,
  category: 'Skin Care',
  catalogContentId: 'dr6xfy8svc',
  shortDescription: '',
  description: '',
  image: '',
  imagePreview: '',
  enableAddToCart: true,
  badge: 'New Arrival'
};

export const AdminPortal: React.FC<AdminPortalProps> = ({
  catalog,
  onUpdateCatalog,
  onExitAdmin,
  onSelectProductForPreview
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  
  // Local editable copy of the catalog
  const [editableCatalog, setEditableCatalog] = useState<ProductsData>(catalog);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [recentlyAddedProductId, setRecentlyAddedProductId] = useState<string | null>(null);
  
  // New password modal
  const [showPassModal, setShowPassModal] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [passChangeSuccess, setPassChangeSuccess] = useState<string>('');

  // Add Product modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newProductForm, setNewProductForm] = useState<NewProductFormState>(initialNewProductForm);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
    setEditableCatalog(catalog);
  }, [catalog]);

  const handleOpenAddModal = () => {
    setNewProductForm({
      ...initialNewProductForm,
      price: '',
      originalPrice: '',
      stockCount: 50
    });
    setShowAddModal(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      setNewProductForm(prev => ({
        ...prev,
        imagePreview: reader.result as string,
        image: prev.image || (reader.result as string)
      }));
    };
    reader.readAsDataURL(file);

    // Upload to server
    const uploadRes = await uploadProductImage(file);
    if (uploadRes.success && uploadRes.url) {
      setNewProductForm(prev => ({
        ...prev,
        image: uploadRes.url,
        imagePreview: uploadRes.url
      }));
    }
    setIsUploadingImage(false);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) {
      alert("Please enter a product name.");
      return;
    }
    if (!newProductForm.price || Number(newProductForm.price) <= 0) {
      alert("Please enter a valid selling price in PKR.");
      return;
    }

    setIsSubmittingProduct(true);

    const priceNum = Math.round(Number(newProductForm.price));
    const originalPriceNum = newProductForm.originalPrice
      ? Math.round(Number(newProductForm.originalPrice))
      : Math.round(priceNum * 1.25);
    const stockCountNum = newProductForm.stockCount !== '' ? Math.max(0, Number(newProductForm.stockCount)) : 50;

    const baseSlug = newProductForm.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'product';
    const uniqueId = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const finalImage = newProductForm.image.trim() || newProductForm.imagePreview || '/product-original.png';

    const isAvailable = newProductForm.enableAddToCart &&
      (newProductForm.stockStatus === 'In Stock' || newProductForm.stockStatus === 'Available') &&
      stockCountNum > 0;

    const newProd: Product = {
      id: uniqueId,
      name: newProductForm.name.trim(),
      tagline: newProductForm.tagline.trim() || "100% Pure Botanical Formulation",
      size: newProductForm.size.trim() || "30ml / 1 fl oz",
      price: priceNum,
      originalPrice: originalPriceNum,
      inStock: isAvailable,
      stockStatus: newProductForm.stockStatus,
      stockCount: stockCountNum,
      category: newProductForm.category.trim() || "Skin Care",
      catalogContentId: newProductForm.catalogContentId.trim() || "dr6xfy8svc",
      badge: newProductForm.badge.trim() || (isAvailable ? "New Arrival" : "Sold Out"),
      image: finalImage,
      gallery: [finalImage],
      shortDescription: newProductForm.shortDescription.trim() || newProductForm.name.trim(),
      description: newProductForm.description.trim() || newProductForm.shortDescription.trim(),
      benefits: [
        "100% pure organic active botanicals",
        "Cruelty-free, sulfate-free & silicone-free",
        "Safe for sensitive skin & all skin types",
        "Nationwide Cash on Delivery across Pakistan"
      ]
    };

    const updatedCatalog: ProductsData = {
      ...editableCatalog,
      products: [newProd, ...editableCatalog.products]
    };

    setEditableCatalog(updatedCatalog);
    await saveAuthoritativeCatalog(updatedCatalog);
    onUpdateCatalog(updatedCatalog);

    setRecentlyAddedProductId(newProd.id);
    setIsSubmittingProduct(false);
    setShowAddModal(false);
    setSaveSuccessMsg(`✓ "${newProd.name}" added successfully and published live on storefront!`);
    setTimeout(() => {
      setSaveSuccessMsg('');
      setRecentlyAddedProductId(null);
    }, 10000);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from your catalog?`)) {
      return;
    }
    const updatedProducts = editableCatalog.products.filter(p => p.id !== id);
    const updatedCatalog = {
      ...editableCatalog,
      products: updatedProducts
    };
    setEditableCatalog(updatedCatalog);
    await saveAuthoritativeCatalog(updatedCatalog);
    onUpdateCatalog(updatedCatalog);
    setSaveSuccessMsg(`✓ "${name}" removed from catalog.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(passwordInput)) {
      setIsAuthenticated(true);
      setLoginError('');
      setPasswordInput('');
    } else {
      setLoginError('Incorrect password. Default is "aura2026".');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  const handleProductFieldChange = (
    index: number,
    field: keyof Product,
    value: any
  ) => {
    const updatedProducts = [...editableCatalog.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setEditableCatalog({
      ...editableCatalog,
      products: updatedProducts
    });
  };

  const handleStoreInfoChange = (field: string, value: any) => {
    setEditableCatalog({
      ...editableCatalog,
      storeInfo: {
        ...editableCatalog.storeInfo,
        [field]: value
      }
    });
  };

  const handleSaveChanges = () => {
    saveAuthoritativeCatalog(editableCatalog);
    onUpdateCatalog(editableCatalog);
    setSaveSuccessMsg('✓ All changes saved successfully! Storefront has been updated in real-time.');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(editableCatalog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "products.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(editableCatalog, null, 2));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleResetCatalog = () => {
    if (window.confirm("Are you sure you want to reset all product data back to factory defaults?")) {
      resetAuthoritativeCatalog();
      window.location.reload();
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length >= 4) {
      setCustomAdminPassword(newPassword.trim());
      setPassChangeSuccess('Admin password changed successfully!');
      setTimeout(() => {
        setPassChangeSuccess('');
        setShowPassModal(false);
        setNewPassword('');
      }, 1500);
    }
  };

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-botanic-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E5DDD2] shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-botanic-wood text-[#FAF8F5] mx-auto flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl font-bold text-botanic-wood">
              NR AURA BOTANICS
            </h1>
            <p className="text-xs text-botanic-woodMuted">
              Protected Admin Portal (/admin)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-botanic-wood mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Enter admin password (default: aura2026)"
                className="w-full px-4 py-3 text-sm border border-[#D9D1C3] rounded-xl focus:outline-none focus:ring-2 focus:ring-botanic-leaf bg-white"
              />
              {loginError && (
                <p className="text-red-500 text-xs mt-1.5">{loginError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-botanic-wood text-white font-semibold text-sm rounded-xl hover:bg-[#3F2B1F] transition-colors shadow-sm"
            >
              Sign In to Admin Dashboard
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={onExitAdmin}
              className="text-xs text-botanic-woodMuted hover:text-botanic-wood underline"
            >
              ← Return to Public Storefront
            </button>
          </div>

          <div className="p-3 bg-botanic-sand/50 rounded-xl text-[11px] text-botanic-woodMuted text-center">
            Default credentials: <span className="font-mono text-botanic-wood font-bold">aura2026</span>
          </div>

        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#F6F3EE] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Bar */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5DDD2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-botanic-leaf"></span>
              <span className="text-xs uppercase tracking-widest text-botanic-leaf font-bold">
                Admin Control Room
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-botanic-wood mt-1">
              NR AURA BOTANICS Catalog Manager
            </h1>
            <p className="text-xs text-botanic-woodMuted">
              Manage product pricing, stock availability, and export authoritative products.json.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowPassModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-botanic-wood bg-botanic-sand hover:bg-[#EAE4DC] rounded-lg transition-colors"
            >
              Change Password
            </button>
            <button
              onClick={onExitAdmin}
              className="px-4 py-2 text-xs font-semibold text-botanic-wood border border-[#D9D1C3] hover:bg-botanic-sand rounded-lg transition-colors"
            >
              View Live Store
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Global Action / Save Bar */}
        <div className="sticky top-4 z-30 bg-botanic-wood text-white rounded-2xl p-4 shadow-lg border border-[#3E271C] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs">
            <span className="font-bold block text-sm">Product Database Manager</span>
            <span className="text-white/70">Modify prices below and click 'Save Changes' to update the store immediately.</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleCopyJson}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
            >
              {copyFeedback ? '✓ Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
              title="Download products.json file"
            >
              Download JSON
            </button>
            <button
              onClick={handleSaveChanges}
              className="flex-1 sm:flex-none px-6 py-2 bg-botanic-leaf hover:bg-botanic-leafDark text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-4 bg-[#EAF7EE] border border-[#BCE7C6] rounded-xl text-botanic-leaf text-sm font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>{saveSuccessMsg}</span>
            </div>
            {recentlyAddedProductId && (
              <button
                type="button"
                onClick={() => {
                  if (onSelectProductForPreview) {
                    onSelectProductForPreview(recentlyAddedProductId);
                  } else {
                    onExitAdmin();
                  }
                }}
                className="px-4 py-2 bg-botanic-leaf hover:bg-botanic-leafDark text-white text-xs font-bold rounded-xl shadow-xs transition-transform hover:scale-102 flex items-center gap-1.5"
              >
                <span>View on Live Site Preview</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Product Cards Editor */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E1D5]">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-botanic-wood">
                Products in Catalog ({editableCatalog.products.length})
              </h2>
              <span className="text-xs text-botanic-woodMuted">
                Real-time inventory and storefront product manager
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-botanic-leaf hover:bg-botanic-leafDark text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Add New Product</span>
            </button>
          </div>

          {editableCatalog.products.map((prod, idx) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DDD2] shadow-xs space-y-6 relative group"
            >
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E1D5]">
                <div className="flex items-center gap-4">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E0D7CB] bg-botanic-sand/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-botanic-woodMuted">ID: {prod.id}</span>
                      {prod.category && (
                        <span className="text-[10px] font-bold text-botanic-leaf bg-botanic-leafSoft px-2 py-0.5 rounded">
                          {prod.category}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-botanic-wood">{prod.name}</h3>
                    <span className="text-xs text-botanic-pinkDark font-serif italic">{prod.tagline}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectProductForPreview) {
                        onSelectProductForPreview(prod.id);
                      } else {
                        onExitAdmin();
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-botanic-wood bg-botanic-sand/70 hover:bg-botanic-sand rounded-lg border border-[#D9D1C3] transition-colors flex items-center gap-1.5"
                    title={`View ${prod.name} on Live Storefront`}
                  >
                    <svg className="w-3.5 h-3.5 text-botanic-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View on Store</span>
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-botanic-wood">
                    <input
                      type="checkbox"
                      checked={prod.inStock}
                      onChange={e => handleProductFieldChange(idx, 'inStock', e.target.checked)}
                      className="rounded text-botanic-leaf focus:ring-botanic-leaf w-4 h-4"
                    />
                    <span>{prod.inStock ? 'In Stock (Active)' : 'Out of Stock (Disabled)'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(prod.id, prod.name)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-2"
                    title={`Delete ${prod.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* PRICE (PKR) - CRITICAL EDIT FIELD */}
                <div className="p-3 bg-botanic-sand/50 rounded-xl border border-[#E5DDD2]">
                  <label className="block text-xs font-bold text-botanic-wood mb-1 text-botanic-leaf">
                    // EDIT PRICE HERE (PKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-botanic-woodMuted">Rs.</span>
                    <input
                      type="number"
                      value={prod.price}
                      onChange={e => handleProductFieldChange(idx, 'price', Number(e.target.value) || 0)}
                      className="w-full pl-10 pr-3 py-2 text-sm font-bold text-botanic-wood border border-[#D9D1C3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-botanic-leaf tabular-nums"
                    />
                  </div>
                  <span className="text-[10px] text-botanic-woodMuted block mt-1">Authoritative Selling Price</span>
                </div>

                {/* ORIGINAL PRICE (PKR) */}
                <div className="p-3 bg-botanic-sand/50 rounded-xl border border-[#E5DDD2]">
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Original Price (PKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-botanic-woodMuted">Rs.</span>
                    <input
                      type="number"
                      value={prod.originalPrice}
                      onChange={e => handleProductFieldChange(idx, 'originalPrice', Number(e.target.value) || 0)}
                      className="w-full pl-10 pr-3 py-2 text-sm text-botanic-wood border border-[#D9D1C3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-botanic-leaf tabular-nums"
                    />
                  </div>
                  <span className="text-[10px] text-botanic-woodMuted block mt-1">Strikethrough comparison</span>
                </div>

                {/* STOCK COUNT */}
                <div className="p-3 bg-botanic-sand/50 rounded-xl border border-[#E5DDD2]">
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={prod.stockCount}
                    onChange={e => handleProductFieldChange(idx, 'stockCount', Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-botanic-wood border border-[#D9D1C3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-botanic-leaf tabular-nums"
                  />
                  <span className="text-[10px] text-botanic-woodMuted block mt-1">Units available for checkout</span>
                </div>

                {/* BOTTLE SIZE */}
                <div className="p-3 bg-botanic-sand/50 rounded-xl border border-[#E5DDD2]">
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Bottle Volume / Size
                  </label>
                  <input
                    type="text"
                    value={prod.size}
                    onChange={e => handleProductFieldChange(idx, 'size', e.target.value)}
                    className="w-full px-3 py-2 text-sm text-botanic-wood border border-[#D9D1C3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-botanic-leaf"
                  />
                  <span className="text-[10px] text-botanic-woodMuted block mt-1">e.g. 50ml / 1.7 fl oz</span>
                </div>

              </div>

              {/* Title & Tagline Edits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={prod.name}
                    onChange={e => handleProductFieldChange(idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-botanic-leaf"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={prod.tagline}
                    onChange={e => handleProductFieldChange(idx, 'tagline', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-botanic-leaf"
                  />
                </div>
              </div>

              {/* Category & Meta Catalog Content ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Category / Collection
                  </label>
                  <input
                    type="text"
                    value={prod.category || ''}
                    onChange={e => handleProductFieldChange(idx, 'category', e.target.value)}
                    placeholder="e.g. Skin Care, Hair Care"
                    className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-botanic-leaf"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Meta Catalog Content ID (SKU)
                  </label>
                  <input
                    type="text"
                    value={prod.catalogContentId || 'dr6xfy8svc'}
                    onChange={e => handleProductFieldChange(idx, 'catalogContentId', e.target.value)}
                    placeholder="dr6xfy8svc"
                    className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-botanic-leaf font-mono text-botanic-wood"
                  />
                  <span className="text-[10px] text-botanic-woodMuted block mt-0.5">Catalog Match ID: [dr6xfy8svc]</span>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-botanic-wood mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={prod.shortDescription}
                  onChange={e => handleProductFieldChange(idx, 'shortDescription', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-botanic-leaf"
                />
              </div>

            </div>
          ))}
        </div>

        {/* Store Shipping & Contact Settings */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DDD2] shadow-xs space-y-6">
          <h2 className="font-serif text-xl font-semibold text-botanic-wood pb-3 border-b border-[#E8E1D5]">
            Store Contact & Shipping Configuration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-botanic-wood mb-1">
                WhatsApp Order Number
              </label>
              <input
                type="text"
                value={editableCatalog.storeInfo.whatsappNumber}
                onChange={e => handleStoreInfoChange('whatsappNumber', e.target.value)}
                placeholder="+923343562833"
                className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-lg bg-white"
              />
              <span className="text-[10px] text-botanic-woodMuted">Include +92 country code</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-botanic-wood mb-1">
                Facebook Page Link
              </label>
              <input
                type="text"
                value={editableCatalog.storeInfo.facebookUrl}
                onChange={e => handleStoreInfoChange('facebookUrl', e.target.value)}
                placeholder="https://www.facebook.com/..."
                className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-botanic-wood mb-1">
                Standard Shipping Fee (PKR)
              </label>
              <input
                type="number"
                value={editableCatalog.storeInfo.shippingFee}
                onChange={e => handleStoreInfoChange('shippingFee', Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-botanic-wood mb-1">
                Free Shipping Threshold (PKR)
              </label>
              <input
                type="number"
                value={editableCatalog.storeInfo.freeShippingThreshold}
                onChange={e => handleStoreInfoChange('freeShippingThreshold', Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-botanic-wood mb-1">
                Delivery Estimate Text
              </label>
              <input
                type="text"
                value={editableCatalog.storeInfo.deliveryEstimate}
                onChange={e => handleStoreInfoChange('deliveryEstimate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/50 rounded-2xl p-6 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-red-800">Reset Catalog to Factory Defaults</h3>
            <p className="text-xs text-red-600">Reverts all modified prices and stocks back to the initial database state.</p>
          </div>
          <button
            onClick={handleResetCatalog}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors shrink-0"
          >
            Reset Database
          </button>
        </div>

      </div>

      {/* Add New Product Modal (Shopify-Style) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#E5DDD2] shadow-2xl overflow-hidden my-8 animate-fade-in-up flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-botanic-wood text-white flex items-center justify-between border-b border-[#3E271C] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-botanic-leaf/20 border border-botanic-leaf/40 flex items-center justify-center text-botanic-leaf">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold">Add New Botanical Product</h3>
                  <p className="text-xs text-white/70">Shopify-style product creation with instant live storefront sync</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateProduct} className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* SECTION 1: Product Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-botanic-wood mb-1">
                    Product Name / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductForm.name}
                    onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    placeholder="e.g. Organic Rosehip & Hibiscus Facial Elixir"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#D9D1C3] rounded-xl focus:ring-2 focus:ring-botanic-leaf/30 focus:border-botanic-leaf outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanic-wood mb-1">
                    Category / Collection <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductForm.category}
                    onChange={e => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    placeholder="e.g. Skin Care, Hair Care"
                    list="category-suggestions"
                    className="w-full px-3.5 py-2.5 text-sm border border-[#D9D1C3] rounded-xl focus:ring-2 focus:ring-botanic-leaf/30 focus:border-botanic-leaf outline-none"
                  />
                  <datalist id="category-suggestions">
                    <option value="Skin Care" />
                    <option value="Hair Care" />
                    <option value="Facial Serums" />
                    <option value="Body Oils" />
                    <option value="Special Bundles" />
                  </datalist>
                </div>
              </div>

              {/* Subtitle / Bottle Size / Meta Catalog ID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Subtitle / Formulation Tagline
                  </label>
                  <input
                    type="text"
                    value={newProductForm.tagline}
                    onChange={e => setNewProductForm({ ...newProductForm, tagline: e.target.value })}
                    placeholder="e.g. 100% Pure & Natural Cold-Pressed Actives"
                    className="w-full px-3.5 py-2 text-sm border border-[#D9D1C3] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Bottle Volume / Size
                  </label>
                  <input
                    type="text"
                    value={newProductForm.size}
                    onChange={e => setNewProductForm({ ...newProductForm, size: e.target.value })}
                    placeholder="e.g. 30ml / 1 fl oz or 250ml"
                    className="w-full px-3.5 py-2 text-sm border border-[#D9D1C3] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Meta Catalog Content ID
                  </label>
                  <input
                    type="text"
                    value={newProductForm.catalogContentId}
                    onChange={e => setNewProductForm({ ...newProductForm, catalogContentId: e.target.value })}
                    placeholder="dr6xfy8svc"
                    className="w-full px-3.5 py-2 text-sm border border-[#D9D1C3] rounded-xl font-mono text-botanic-wood"
                  />
                  <span className="text-[10px] text-botanic-woodMuted block mt-0.5">Catalog Match ID: [dr6xfy8svc]</span>
                </div>
              </div>

              {/* SECTION 2: Image Upload with Live Preview */}
              <div className="p-4 bg-botanic-sand/30 rounded-2xl border border-[#E5DDD2] space-y-3">
                <label className="block text-xs font-bold text-botanic-wood">
                  Product Image Upload (with preview) <span className="text-red-500">*</span>
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Image Preview Box */}
                  <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-[#D4E7D2] bg-white overflow-hidden flex items-center justify-center shrink-0 relative group shadow-xs">
                    {newProductForm.imagePreview || newProductForm.image ? (
                      <img
                        src={newProductForm.imagePreview || newProductForm.image}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <svg className="w-7 h-7 mx-auto text-botanic-woodMuted mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] text-botanic-woodMuted block leading-tight">No image chosen</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2 bg-botanic-leaf hover:bg-botanic-leafDark text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>{isUploadingImage ? 'Uploading...' : 'Choose Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>

                      {(newProductForm.imagePreview || newProductForm.image) && (
                        <button
                          type="button"
                          onClick={() => setNewProductForm({ ...newProductForm, image: '', imagePreview: '' })}
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Remove image
                        </button>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] text-botanic-woodMuted block mb-1">
                        Or enter direct image path / URL:
                      </span>
                      <input
                        type="text"
                        value={newProductForm.image}
                        onChange={e => setNewProductForm({
                          ...newProductForm,
                          image: e.target.value,
                          imagePreview: e.target.value || newProductForm.imagePreview
                        })}
                        placeholder="e.g. /product-original.png or https://..."
                        className="w-full px-3 py-1.5 text-xs border border-[#D9D1C3] rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Descriptions (Short and Long) */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-botanic-wood mb-1">
                    Product Description (Short Overview) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newProductForm.shortDescription}
                    onChange={e => setNewProductForm({ ...newProductForm, shortDescription: e.target.value })}
                    placeholder="Brief 1-2 sentence description shown in collection cards and fast preview..."
                    className="w-full px-3.5 py-2 text-sm border border-[#D9D1C3] rounded-xl outline-none focus:border-botanic-leaf"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanic-wood mb-1">
                    Product Description (Detailed / Long)
                  </label>
                  <textarea
                    rows={4}
                    value={newProductForm.description}
                    onChange={e => setNewProductForm({ ...newProductForm, description: e.target.value })}
                    placeholder="Full in-depth product details, active botanicals, skin results, suitability, scent profile..."
                    className="w-full px-3.5 py-2 text-sm border border-[#D9D1C3] rounded-xl outline-none focus:border-botanic-leaf"
                  />
                </div>
              </div>

              {/* SECTION 4: Pricing (Price & Compare Price) */}
              <div className="p-4 bg-botanic-sand/20 rounded-2xl border border-[#E5DDD2] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-botanic-leaf mb-1">
                    Product Price (PKR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-botanic-woodMuted">Rs.</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newProductForm.price}
                      onChange={e => setNewProductForm({
                        ...newProductForm,
                        price: e.target.value === '' ? '' : Number(e.target.value)
                      })}
                      placeholder="850"
                      className="w-full pl-10 pr-3 py-2 text-sm font-bold text-botanic-wood border border-[#D9D1C3] rounded-xl bg-white tabular-nums outline-none focus:border-botanic-leaf"
                    />
                  </div>
                  <span className="text-[10px] text-botanic-woodMuted block mt-1">Selling price charged at checkout</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Compare Price (Original Price PKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-botanic-woodMuted">Rs.</span>
                    <input
                      type="number"
                      min={0}
                      value={newProductForm.originalPrice}
                      onChange={e => setNewProductForm({
                        ...newProductForm,
                        originalPrice: e.target.value === '' ? '' : Number(e.target.value)
                      })}
                      placeholder="1200"
                      className="w-full pl-10 pr-3 py-2 text-sm text-botanic-wood border border-[#D9D1C3] rounded-xl bg-white tabular-nums outline-none focus:border-botanic-leaf"
                    />
                  </div>
                  <span className="text-[10px] text-botanic-woodMuted block mt-1">Shown crossed-out to highlight discount</span>
                </div>
              </div>

              {/* SECTION 5: Stock Status & Inventory & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Stock Status Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-botanic-wood mb-1">
                    Stock Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProductForm.stockStatus}
                    onChange={e => setNewProductForm({
                      ...newProductForm,
                      stockStatus: e.target.value as any
                    })}
                    className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-xl bg-white outline-none focus:border-botanic-leaf font-medium"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>

                {/* Quantity / Inventory Number */}
                <div>
                  <label className="block text-xs font-bold text-botanic-wood mb-1">
                    Quantity / Inventory Number
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newProductForm.stockCount}
                    onChange={e => setNewProductForm({
                      ...newProductForm,
                      stockCount: e.target.value === '' ? '' : Number(e.target.value)
                    })}
                    placeholder="50"
                    className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-xl bg-white outline-none focus:border-botanic-leaf tabular-nums"
                  />
                </div>

                {/* Badge Tag */}
                <div>
                  <label className="block text-xs font-semibold text-botanic-wood mb-1">
                    Ribbon Badge
                  </label>
                  <input
                    type="text"
                    value={newProductForm.badge}
                    onChange={e => setNewProductForm({ ...newProductForm, badge: e.target.value })}
                    placeholder="e.g. New Launch · 100% Organic"
                    className="w-full px-3 py-2 text-sm border border-[#D9D1C3] rounded-xl bg-white outline-none focus:border-botanic-leaf"
                  />
                </div>
              </div>

              {/* SECTION 6: Add to Cart Button Automatically Enabled */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Add to Cart Button Automatically Enabled
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      When enabled, customers can instantly add this item to their cart and proceed to Cash on Delivery checkout.
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={newProductForm.enableAddToCart}
                    onChange={e => setNewProductForm({ ...newProductForm, enableAddToCart: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-[#E8E1D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-botanic-wood hover:bg-botanic-sand/50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-6 py-2.5 bg-botanic-leaf hover:bg-botanic-leafDark text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all hover:scale-102 active:scale-98 flex items-center gap-2"
                >
                  {isSubmittingProduct ? (
                    <span>Publishing...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save & Publish Product</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#E5DDD2] shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-botanic-wood">Change Admin Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                required
                minLength={4}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new admin password"
                className="w-full px-3.5 py-2.5 text-sm border border-[#D9D1C3] rounded-lg"
              />
              {passChangeSuccess && (
                <p className="text-xs text-botanic-leaf font-semibold">{passChangeSuccess}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="px-3.5 py-2 text-xs text-botanic-wood"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-botanic-wood text-white text-xs font-semibold rounded-lg"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
