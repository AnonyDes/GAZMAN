import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/admin/orders?limit=5`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.orders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const t = (fr, en) => language === 'fr' ? fr : en;

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
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const statCards = [
    { 
      icon: ShoppingCart, 
      label: t('Total Commandes', 'Total Orders'), 
      value: stats?.orders?.total || 0, 
      color: 'bg-blue-500',
      link: '/admin/orders'
    },
    { 
      icon: Clock, 
      label: t('En attente', 'Pending'), 
      value: stats?.orders?.pending || 0, 
      color: 'bg-yellow-500',
      link: '/admin/orders?status=en_attente'
    },
    { 
      icon: Truck, 
      label: t('En livraison', 'Delivering'), 
      value: stats?.orders?.delivering || 0, 
      color: 'bg-purple-500',
      link: '/admin/orders?status=en_livraison'
    },
    { 
      icon: CheckCircle, 
      label: t('Livrées', 'Delivered'), 
      value: stats?.orders?.delivered || 0, 
      color: 'bg-green-500',
      link: '/admin/orders?status=livree'
    },
    { 
      icon: Users, 
      label: t('Utilisateurs', 'Users'), 
      value: stats?.users || 0, 
      color: 'bg-indigo-500',
      link: '/admin/users'
    },
    { 
      icon: Package, 
      label: t('Produits', 'Products'), 
      value: stats?.products || 0, 
      color: 'bg-orange-500',
      link: '/admin/products'
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('Tableau de bord', 'Dashboard')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('Vue d\'ensemble de votre boutique', 'Overview of your store')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100">{t('Revenus totaux (commandes livrées)', 'Total Revenue (delivered orders)')}</p>
            <p className="text-4xl font-bold mt-2">{formatCurrency(stats?.revenue || 0)}</p>
          </div>
          <TrendingUp size={48} className="text-orange-200" />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {t('Commandes récentes', 'Recent Orders')}
          </h2>
          <Link 
            to="/admin/orders" 
            className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center"
          >
            {t('Voir tout', 'View all')}
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              to={`/admin/orders/${order.id}`}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{order.user?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                {getStatusBadge(order.status)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
