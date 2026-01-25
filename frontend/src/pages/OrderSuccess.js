import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setLoading(false);
      navigate('/home');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle size={80} className="text-white" />
            </div>
            {/* Animated Ring */}
            <div className="absolute inset-0 w-32 h-32 bg-green-400 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commande Confirmée !
          </h1>
          <p className="text-gray-600">
            Votre commande a été enregistrée avec succès
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Numéro de commande</p>
            <p className="text-xl font-bold text-gray-900 font-mono" data-testid="order-id">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="border-t-2 border-gray-100 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Articles</span>
              <span className="font-semibold text-gray-900">{order.items.length} produit{order.items.length > 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Montant Total</span>
              <span className="text-2xl font-bold text-orange-600" data-testid="order-total">
                {formatCurrency(order.total)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mode de paiement</span>
              <span className="font-semibold text-gray-900">
                {order.payment_method === 'cash' ? '💵 Espèces' : '📱 Mobile Money'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Statut</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                ⏳ En attente
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Package size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Préparation en cours
              </p>
              <p className="text-xs text-blue-700">
                Vous recevrez une notification dès que votre commande sera prête pour la livraison
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/orders/${order.id}`)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2"
            data-testid="track-order-button"
          >
            <Package size={20} />
            <span>Suivre ma Commande</span>
            <ArrowRight size={20} />
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full bg-white text-gray-700 py-4 rounded-2xl font-bold border-2 border-gray-200 hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center space-x-2"
            data-testid="back-to-home-button"
          >
            <Home size={20} />
            <span>Retour à l'Accueil</span>
          </button>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Merci pour votre confiance ! 🙏
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
