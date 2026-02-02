import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { t } = useLanguage();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, size, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      await axios.put(
        `${API}/cart/items/${productId}`,
        { quantity: newQuantity, size },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert(t('cart.updateError'));
    }
    setUpdating(false);
  };

  const removeItem = async (productId, size) => {
    if (!window.confirm(t('cart.removeConfirm'))) return;
    
    setUpdating(true);
    try {
      // Use URL query string directly for better compatibility
      const encodedSize = encodeURIComponent(size);
      await axios.delete(`${API}/cart/items/${productId}?size=${encodedSize}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      alert(t('cart.removeError'));
    }
    setUpdating(false);
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) return;
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{t('cart.title')}</h1>
            <p className="text-gray-500 text-sm">
              {isEmpty ? t('cart.empty') : `${cart.items.length} ${cart.items.length > 1 ? t('cart.items') : t('cart.item')}`}
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <ShoppingBag size={24} className="text-orange-600" />
          </div>
        </div>
      </div>

      {isEmpty ? (
        /* Empty Cart State */
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={64} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h2>
          <p className="text-gray-500 text-center mb-8 px-4">
            {t('cart.emptyDesc')}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95"
            data-testid="browse-products-button"
          >
            {t('cart.browseProducts')}
          </button>
        </div>
      ) : (
        <div className="px-4">
          {/* Cart Items */}
          <div className="mt-6 space-y-4 mb-6">
            {cart.items.map((item, index) => (
              <div
                key={`${item.product_id}-${item.size}-${index}`}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-4"
                data-testid={`cart-item-${item.product_id}`}
              >
                <div className="flex space-x-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-20 h-20 object-contain"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{item.product_name}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-block bg-blue-100 text-blue-900 px-2 py-1 rounded-lg text-xs font-bold">
                        {item.size.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-orange-600 font-bold text-lg mb-3">
                      {formatCurrency(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                          disabled={updating || item.quantity <= 1}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 flex items-center justify-center transition-colors"
                          data-testid={`decrease-${item.product_id}`}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-lg font-bold text-gray-900 w-8 text-center" data-testid={`quantity-${item.product_id}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                          disabled={updating}
                          className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
                          data-testid={`increase-${item.product_id}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.product_id, item.size)}
                        disabled={updating}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`remove-${item.product_id}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Item Total */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('cart.subtotal')}:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Free Delivery Info */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800 mb-1">{t('cart.freeDelivery')}</p>
                <p className="text-xs text-green-700">
                  {t('cart.freeDeliveryInfo')}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('cart.orderSummary')}</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span className="font-semibold text-gray-900">{formatCurrency(cart.subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('cart.deliveryFee')}</span>
                <span className="font-semibold text-gray-900">
                  {cart.subtotal >= 20000 ? (
                    <span className="text-green-600">{t('common.free')}</span>
                  ) : (
                    formatCurrency(cart.delivery_fee)
                  )}
                </span>
              </div>

              <div className="border-t-2 border-gray-100 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">{t('cart.total')}</span>
                  <span className="text-2xl font-bold text-orange-600" data-testid="cart-total">
                    {formatCurrency(cart.subtotal >= 20000 ? cart.subtotal : cart.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Checkout Button */}
      {!isEmpty && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 shadow-2xl">
          <button
            onClick={handleCheckout}
            disabled={updating}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="checkout-button"
          >
            {t('cart.checkout')} • {formatCurrency(cart.subtotal >= 20000 ? cart.subtotal : cart.total)}
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ShoppingCart;
