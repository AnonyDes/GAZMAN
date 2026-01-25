import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, Package, ChevronRight, ShoppingBag } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyOrders = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      en_attente: {
        label: 'En attente',
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: '⏳'
      },
      en_preparation: {
        label: 'En préparation',
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: '📦'
      },
      en_livraison: {
        label: 'En livraison',
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        icon: '🚚'
      },
      livree: {
        label: 'Livrée',
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '✅'
      },
      annulee: {
        label: 'Annulée',
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: '❌'
      }
    };
    return configs[status] || configs.en_attente;
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pb-20">
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
            <h1 className="text-2xl font-bold text-white">Mes Commandes</h1>
            <p className="text-blue-200 text-sm">
              {orders.length} commande{orders.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Package size={24} className="text-white" />
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={64} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucune Commande</h2>
          <p className="text-gray-500 text-center mb-8 px-4">
            Vous n'avez pas encore passé de commande
          </p>
          <button
            onClick={() => navigate('/home')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
            data-testid="start-shopping-button"
          >
            Commencer mes Achats
          </button>
        </div>
      ) : (
        /* Orders List */
        <div className="px-4 mt-6 space-y-4">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <button
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-5 text-left active:scale-98"
                data-testid={`order-${order.id}`}
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Commande</p>
                    <p className="font-bold text-gray-900 font-mono">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>

                {/* Order Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Articles</span>
                    <span className="font-semibold text-gray-900">
                      {order.items.length} produit{order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Montant</span>
                    <span className="text-orange-600 font-bold text-lg">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Product Thumbnails */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 bg-gray-100 rounded-lg border-2 border-white flex items-center justify-center"
                      >
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-orange-500 font-semibold text-sm">
                    Voir détails
                    <ChevronRight size={18} className="ml-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default MyOrders;
