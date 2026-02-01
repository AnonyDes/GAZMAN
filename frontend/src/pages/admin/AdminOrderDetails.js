import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  CreditCard, 
  User,
  Package,
  CheckCircle
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { language } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const t = (fr, en) => language === 'fr' ? fr : en;

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
      alert(t('Erreur lors de la mise à jour', 'Error updating status'));
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: t('Espèces à la livraison', 'Cash on Delivery'),
      mobile_money: 'Mobile Money',
      card: t('Carte bancaire', 'Credit Card')
    };
    return methods[method] || method;
  };

  const statusOptions = [
    { value: 'en_attente', label: t('En attente', 'Pending'), color: 'bg-yellow-500' },
    { value: 'en_preparation', label: t('En préparation', 'Preparing'), color: 'bg-blue-500' },
    { value: 'en_livraison', label: t('En livraison', 'Delivering'), color: 'bg-purple-500' },
    { value: 'livree', label: t('Livrée', 'Delivered'), color: 'bg-green-500' },
    { value: 'annulee', label: t('Annulée', 'Cancelled'), color: 'bg-red-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('Commande non trouvée', 'Order not found')}</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
        >
          {t('Retour aux commandes', 'Back to orders')}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/admin/orders')}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('Commande', 'Order')} #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-600">{formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t('Mettre à jour le statut', 'Update Status')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateStatus(option.value)}
                  disabled={updating || order.status === option.value}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    order.status === option.value
                      ? `${option.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {order.status === option.value && <CheckCircle size={16} />}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t('Articles', 'Items')} ({order.items?.length || 0})
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-14 h-14 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.product_name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {item.size?.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">×{item.quantity}</span>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Sous-total', 'Subtotal')}</span>
                <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Livraison', 'Delivery')}</span>
                <span className="font-semibold">
                  {order.delivery_fee === 0 ? t('Gratuit', 'Free') : formatCurrency(order.delivery_fee)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-bold">{t('Total', 'Total')}</span>
                <span className="text-lg font-bold text-orange-600">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Delivery Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t('Client', 'Customer')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.user?.name}</p>
                  <p className="text-sm text-gray-500">{order.user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t('Livraison', 'Delivery')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('Adresse', 'Address')}</p>
                  <p className="font-medium text-gray-900">{order.delivery_address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('Téléphone', 'Phone')}</p>
                  <p className="font-medium text-gray-900">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard size={18} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('Paiement', 'Payment')}</p>
                  <p className="font-medium text-gray-900">{getPaymentMethodLabel(order.payment_method)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
