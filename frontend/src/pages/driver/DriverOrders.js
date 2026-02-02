import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { Package, MapPin, Phone, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DriverOrders = () => {
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/driver/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('driver.pending') },
      en_preparation: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('driver.preparing') },
      en_livraison: { bg: 'bg-purple-100', text: 'text-purple-800', label: t('driver.delivering') },
      livree: { bg: 'bg-green-100', text: 'text-green-800', label: t('status.livree') },
      echouee: { bg: 'bg-red-100', text: 'text-red-800', label: t('status.echouee') }
    };
    const config = statusConfig[status] || statusConfig.en_attente;
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const statusOptions = [
    { value: '', label: t('common.all'), count: stats.total },
    { value: 'en_attente', label: t('driver.pending'), count: stats.pending },
    { value: 'en_preparation', label: t('driver.preparing'), count: stats.preparing },
    { value: 'en_livraison', label: t('driver.delivering'), count: stats.delivering },
    { value: 'livree', label: t('driver.delivered'), count: stats.delivered },
    { value: 'echouee', label: t('driver.failed'), count: stats.failed },
  ];

  const filteredOrders = statusFilter 
    ? orders.filter(o => o.status === statusFilter)
    : orders;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('driver.myDeliveries')}
        </h1>
        <p className="text-gray-600 mt-1">
          {stats.total || 0} {t('driver.assignedDeliveries')}
        </p>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === option.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label} {option.count !== undefined && `(${option.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{t('driver.noDeliveriesFound')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              to={`/driver/orders/${order.id}`}
              className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono font-bold text-gray-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(order.status)}
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span className="line-clamp-2">{order.delivery_address}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                  <span>{order.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">{t('Client', 'Customer')}</p>
                  <p className="font-semibold text-gray-900">{order.customer?.name || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{t('Total', 'Total')}</p>
                  <p className="font-bold text-green-600">{formatCurrency(order.total)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverOrders;
