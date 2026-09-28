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
  setCustomAdminPassword
} from '../services/productService';

interface AdminPortalProps {
  catalog: ProductsData;
  onUpdateCatalog: (newCatalog: ProductsData) => void;
  onExitAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  catalog,
  onUpdateCatalog,
  onExitAdmin
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  
  // Local editable copy of the catalog
  const [editableCatalog, setEditableCatalog] = useState<ProductsData>(catalog);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  
  // New password modal
  const [showPassModal, setShowPassModal] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [passChangeSuccess, setPassChangeSuccess] = useState<string>('');

  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
    setEditableCatalog(catalog);
  }, [catalog]);

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
          <div className="p-4 bg-[#EAF7EE] border border-[#BCE7C6] rounded-xl text-botanic-leaf text-sm font-semibold text-center animate-fade-in-up">
            {saveSuccessMsg}
          </div>
        )}

        {/* Product Cards Editor */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-botanic-wood">
              Products in Catalog ({editableCatalog.products.length})
            </h2>
            <span className="text-xs text-botanic-woodMuted">
              // EDIT PRICE HERE comments embedded in data
            </span>
          </div>

          {editableCatalog.products.map((prod, idx) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DDD2] shadow-xs space-y-6"
            >
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E1D5]">
                <div className="flex items-center gap-4">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E0D7CB]"
                  />
                  <div>
                    <span className="text-[11px] font-mono text-botanic-woodMuted">ID: {prod.id}</span>
                    <h3 className="font-serif text-lg font-bold text-botanic-wood">{prod.name}</h3>
                    <span className="text-xs text-botanic-pinkDark font-serif italic">{prod.tagline}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-botanic-wood">
                    <input
                      type="checkbox"
                      checked={prod.inStock}
                      onChange={e => handleProductFieldChange(idx, 'inStock', e.target.checked)}
                      className="rounded text-botanic-leaf focus:ring-botanic-leaf w-4 h-4"
                    />
                    <span>{prod.inStock ? 'In Stock (Active)' : 'Out of Stock (Disabled)'}</span>
                  </label>
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
