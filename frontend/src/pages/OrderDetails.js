import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, Package, MapPin, Phone, CreditCard, Clock, CheckCircle2, Truck, Home, XCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Commande introuvable');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: 'Espèces à la livraison',
      mobile_money: 'Mobile Money',
      card: 'Carte bancaire'
    };
    return methods[method] || method;
  };

  // Order status timeline configuration
  const statusSteps = [
    { key: 'en_attente', label: 'Commande reçue', icon: CheckCircle2, description: 'Votre commande a été confirmée' },
    { key: 'en_preparation', label: 'En préparation', icon: Package, description: 'Nous préparons votre commande' },
    { key: 'en_livraison', label: 'En livraison', icon: Truck, description: 'Votre commande est en route' },
    { key: 'livree', label: 'Livrée', icon: Home, description: 'Commande livrée avec succès' }
  ];

  const getStatusIndex = (status) => {
    if (status === 'annulee') return -1;
    const index = statusSteps.findIndex(step => step.key === status);
    return index >= 0 ? index : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pb-20">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 pt-6 pb-8 rounded-b-3xl shadow-xl">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Détails Commande</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <XCircle size={64} className="text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Retour aux commandes
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'annulee';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 pt-6 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
            data-testid="back-button"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div className="flex-1">
            <p className="text-blue-200 text-sm">Commande</p>
            <h1 className="text-xl font-bold text-white font-mono">
              #{order.id.slice(0, 8).toUpperCase()}
            </h1>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Package size={24} className="text-white" />
          </div>
        </div>
        <p className="text-blue-200 text-sm">
          Passée le {formatDate(order.created_at)}
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Order Status Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-6" data-testid="order-timeline">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Suivi de Commande</h2>
          
          {isCancelled ? (
            <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={24} className="text-red-600" />
              </div>
              <div>
                <p className="font-bold text-red-800">Commande Annulée</p>
                <p className="text-sm text-red-600">Cette commande a été annulée</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const StepIcon = step.icon;
                
                return (
                  <div key={step.key} className="relative flex items-start pb-8 last:pb-0">
                    {/* Vertical Line */}
                    {index < statusSteps.length - 1 && (
                      <div 
                        className={`absolute left-6 top-12 w-0.5 h-full -ml-px ${
                          index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    
                    {/* Icon Circle */}
                    <div 
                      className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500' 
                          : 'bg-white border-gray-200'
                      } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                    >
                      <StepIcon 
                        size={20} 
                        className={isCompleted ? 'text-white' : 'text-gray-400'} 
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="ml-4 flex-1">
                      <p className={`font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                        {step.description}
                      </p>
                      {isCurrent && (
                        <span className="inline-flex items-center mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          <Clock size={12} className="mr-1" /> En cours
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Informations de Livraison</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Adresse de livraison</p>
                <p className="font-semibold text-gray-900">{order.delivery_address}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-semibold text-gray-900">{order.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mode de paiement</p>
                <p className="font-semibold text-gray-900">{getPaymentMethodLabel(order.payment_method)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Articles ({order.items.length})
          </h2>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.product_name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-lg font-medium">
                      {item.size.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">x{item.quantity}</span>
                  </div>
                </div>
                <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sous-total</span>
              <span className="font-semibold text-gray-900">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Frais de livraison</span>
              <span className="font-semibold text-gray-900">
                {order.delivery_fee === 0 ? (
                  <span className="text-green-600">Gratuit</span>
                ) : (
                  formatCurrency(order.delivery_fee)
                )}
              </span>
            </div>
            <div className="border-t-2 border-gray-100 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-orange-600" data-testid="order-total">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-blue-900 mb-1">Besoin d&apos;aide ?</p>
          <p className="text-xs text-blue-700">
            Contactez notre service client au +237 6XX XXX XXX pour toute question concernant votre commande.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default OrderDetails;
