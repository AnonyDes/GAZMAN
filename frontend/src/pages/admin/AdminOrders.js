import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { Search, Filter, ChevronRight, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminOrders = () => {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  const t = (fr, en) => language === 'fr' ? fr : en;

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', '50');
      
      const response = await axios.get(`${API}/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('En attente', 'Pending') },
      en_preparation: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('Préparation', 'Preparing') },
      en_livraison: { bg: 'bg-purple-100', text: 'text-purple-800', label: t('Livraison', 'Delivering') },
      livree: { bg: 'bg-green-100', text: 'text-green-800', label: t('Livrée', 'Delivered') },
      annulee: { bg: 'bg-red-100', text: 'text-red-800', label: t('Annulée', 'Cancelled') }
    };
    const config = statusConfig[status] || statusConfig.en_attente;
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const statusOptions = [
    { value: '', label: t('Tous', 'All') },
    { value: 'en_attente', label: t('En attente', 'Pending') },
    { value: 'en_preparation', label: t('Préparation', 'Preparing') },
    { value: 'en_livraison', label: t('Livraison', 'Delivering') },
    { value: 'livree', label: t('Livrée', 'Delivered') },
    { value: 'annulee', label: t('Annulée', 'Cancelled') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('Commandes', 'Orders')}
        </h1>
        <p className="text-gray-600 mt-1">
          {total} {t('commandes au total', 'total orders')}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('Commande', 'Order')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('Client', 'Customer')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('Date', 'Date')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('Statut', 'Status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('Total', 'Total')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('Articles', 'Items')}
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono font-semibold text-gray-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{order.items?.length || 0}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center"
                    >
                      {t('Détails', 'Details')}
                      <ChevronRight size={16} className="ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{t('Aucune commande trouvée', 'No orders found')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
