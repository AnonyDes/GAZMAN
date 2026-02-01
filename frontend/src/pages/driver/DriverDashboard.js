import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DriverDashboard = () => {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = (fr, en) => language === 'fr' ? fr : en;

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        axios.get(`${API}/driver/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/driver/stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setOrders(ordersRes.data.orders);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('En attente', 'Pending') },
      en_preparation: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('Préparation', 'Preparing') },
      en_livraison: { bg: 'bg-purple-100', text: 'text-purple-800', label: t('En livraison', 'Delivering') },
      livree: { bg: 'bg-green-100', text: 'text-green-800', label: t('Livrée', 'Delivered') },
      echouee: { bg: 'bg-red-100', text: 'text-red-800', label: t('Échouée', 'Failed') }
    };
    const config = statusConfig[status] || statusConfig.en_attente;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const activeOrders = orders.filter(o => ['en_attente', 'en_preparation', 'en_livraison'].includes(o.status));

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('Tableau de bord', 'Dashboard')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('Bienvenue, livreur!', 'Welcome, driver!')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
            <Package size={20} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.total_assigned || 0}</p>
          <p className="text-sm text-gray-500">{t('Total assignées', 'Total Assigned')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
            <Truck size={20} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.in_progress || 0}</p>
          <p className="text-sm text-gray-500">{t('En cours', 'In Progress')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle size={20} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.delivered || 0}</p>
          <p className="text-sm text-gray-500">{t('Livrées', 'Delivered')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mb-3">
            <XCircle size={20} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.failed || 0}</p>
          <p className="text-sm text-gray-500">{t('Échouées', 'Failed')}</p>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white mb-8">
        <p className="text-green-100">{t('Valeur totale livrée', 'Total Delivered Value')}</p>
        <p className="text-3xl font-bold mt-2">{formatCurrency(stats?.total_delivered_value || 0)}</p>
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {t('Livraisons actives', 'Active Deliveries')} ({activeOrders.length})
          </h2>
          <Link 
            to="/driver/orders" 
            className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center"
          >
            {t('Voir tout', 'View all')}
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {activeOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{t('Aucune livraison active', 'No active deliveries')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activeOrders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/driver/orders/${order.id}`}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="mr-1" />
                      <span className="truncate max-w-[200px]">{order.delivery_address}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
