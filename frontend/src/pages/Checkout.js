import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, MapPin, Phone, CreditCard, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    delivery_address: user?.address || '',
    phone: '',
    payment_method: 'cash'
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.items || response.data.items.length === 0) {
        navigate('/cart');
        return;
      }
      
      setCart(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
      navigate('/cart');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = 'Adresse de livraison requise';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Numéro de téléphone requis';
    } else if (!/^\+?237\s?[6-9]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/.test(formData.phone.replace(/\s+/g, ' '))) {
      newErrors.phone = 'Format: +237 6 XX XX XX XX';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setProcessing(true);
    
    try {
      const response = await axios.post(
        `${API}/orders`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Navigate to success page with order ID
      navigate(`/order-success/${response.data.order_id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erreur lors de la création de la commande');
      setProcessing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const finalTotal = cart.subtotal >= 20000 ? cart.subtotal : cart.total;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pb-32">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 pt-6 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
            data-testid="back-button"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Finaliser la Commande</h1>
            <p className="text-blue-200 text-sm">{cart.items.length} article{cart.items.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MapPin size={20} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Adresse de Livraison</h2>
            </div>
            <textarea
              name="delivery_address"
              value={formData.delivery_address}
              onChange={handleChange}
              rows="3"
              placeholder="Ex: 123 Rue de la Paix, Yaoundé, Cameroun"
              className={`w-full px-4 py-3 border-2 ${errors.delivery_address ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none`}
              data-testid="delivery-address-input"
            />
            {errors.delivery_address && (
              <p className="text-red-500 text-sm mt-2">{errors.delivery_address}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Phone size={20} className="text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Téléphone</h2>
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+237 6 XX XX XX XX"
              className={`w-full px-4 py-3 border-2 ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none`}
              data-testid="phone-input"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
            )}
            <p className="text-gray-500 text-xs mt-2">Format Cameroun: +237 6/9 XX XX XX XX</p>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <CreditCard size={20} className="text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Mode de Paiement</h2>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payment_method: 'cash' }))}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  formData.payment_method === 'cash'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                data-testid="payment-cash"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💵</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Paiement à la Livraison</p>
                    <p className="text-sm text-gray-500">Espèces</p>
                  </div>
                </div>
                {formData.payment_method === 'cash' && (
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payment_method: 'mobile_money' }))}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  formData.payment_method === 'mobile_money'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                data-testid="payment-mobile-money"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📱</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Mobile Money</p>
                    <p className="text-sm text-gray-500">MTN, Orange Money</p>
                  </div>
                </div>
                {formData.payment_method === 'mobile_money' && (
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Résumé de la Commande</h2>
            
            {/* Items */}
            <div className="space-y-3 mb-4">
              {cart.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img src={item.product_image} alt={item.product_name} className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{item.product_name}</p>
                      <p className="text-xs text-gray-500">{item.size.toUpperCase()} × {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-semibold">{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frais de livraison</span>
                <span className="font-semibold">
                  {cart.subtotal >= 20000 ? (
                    <span className="text-green-600">Gratuit</span>
                  ) : (
                    formatCurrency(cart.delivery_fee)
                  )}
                </span>
              </div>
              <div className="border-t-2 border-gray-100 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-orange-600" data-testid="checkout-total">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Free Delivery Info */}
          {cart.subtotal >= 20000 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-1">🎉 Livraison Gratuite Activée!</p>
                  <p className="text-xs text-green-700">
                    Économisez 3 500 FCFA sur cette commande
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Fixed Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 shadow-2xl">
        <button
          onClick={handleSubmit}
          disabled={processing}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="confirm-order-button"
        >
          {processing ? 'Traitement en cours...' : `Confirmer la Commande • ${formatCurrency(finalTotal)}`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
