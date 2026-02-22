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
  ArrowRight,
  DollarSign,
  Activity,
  BarChart3,
  Calendar
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
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('En attente', 'Pending'), icon: Clock },
      en_preparation: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('Préparation', 'Preparing'), icon: Package },
      en_livraison: { bg: 'bg-purple-100', text: 'text-purple-800', label: t('Livraison', 'Delivering'), icon: Truck },
      livree: { bg: 'bg-green-100', text: 'text-green-800', label: t('Livrée', 'Delivered'), icon: CheckCircle },
      annulee: { bg: 'bg-red-100', text: 'text-red-800', label: t('Annulée', 'Cancelled'), icon: XCircle },
      echouee: { bg: 'bg-red-100', text: 'text-red-800', label: t('Échouée', 'Failed'), icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig.en_attente;
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        <config.icon size={12} className="mr-1" />
        {config.label}
      </span>
    );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  // Calculate percentages
  const totalOrders = stats?.orders?.total || 0;
  const deliveredPercent = totalOrders > 0 ? Math.round((stats?.orders?.delivered || 0) / totalOrders * 100) : 0;
  const pendingPercent = totalOrders > 0 ? Math.round((stats?.orders?.pending || 0) / totalOrders * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {t('Tableau de bord', 'Dashboard')}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {t('Bienvenue! Voici un aperçu de votre activité.', 'Welcome! Here\'s an overview of your activity.')}
        </p>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {t('Total', 'Total')}
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold">{formatCurrency(stats?.revenue || 0)}</p>
          <p className="text-blue-200 text-sm mt-1">{t('Revenus', 'Revenue')}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} className="text-orange-600" />
            </div>
            <Link to="/admin/orders" className="text-xs text-gray-400 hover:text-gray-600">
              {t('Voir', 'View')} →
            </Link>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats?.orders?.total || 0}</p>
          <p className="text-gray-500 text-sm mt-1">{t('Commandes', 'Orders')}</p>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
            <Link to="/admin/users" className="text-xs text-gray-400 hover:text-gray-600">
              {t('Voir', 'View')} →
            </Link>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats?.users || 0}</p>
          <p className="text-gray-500 text-sm mt-1">{t('Utilisateurs', 'Users')}</p>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-purple-600" />
            </div>
            <Link to="/admin/products" className="text-xs text-gray-400 hover:text-gray-600">
              {t('Voir', 'View')} →
            </Link>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats?.products || 0}</p>
          <p className="text-gray-500 text-sm mt-1">{t('Produits', 'Products')}</p>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Order Status Cards */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <Activity size={18} className="mr-2 text-[#2563EB]" />
            {t('Statut des commandes', 'Order Status')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/admin/orders?status=en_attente" className="bg-yellow-50 rounded-xl p-4 hover:bg-yellow-100 transition-colors">
              <div className="flex items-center space-x-2 mb-2">
                <Clock size={18} className="text-yellow-600" />
                <span className="text-yellow-800 font-medium text-sm">{t('En attente', 'Pending')}</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{stats?.orders?.pending || 0}</p>
            </Link>
            
            <Link to="/admin/orders?status=en_preparation" className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-2 mb-2">
                <Package size={18} className="text-blue-600" />
                <span className="text-blue-800 font-medium text-sm">{t('Préparation', 'Preparing')}</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats?.orders?.preparing || 0}</p>
            </Link>
            
            <Link to="/admin/orders?status=en_livraison" className="bg-purple-50 rounded-xl p-4 hover:bg-purple-100 transition-colors">
              <div className="flex items-center space-x-2 mb-2">
                <Truck size={18} className="text-purple-600" />
                <span className="text-purple-800 font-medium text-sm">{t('Livraison', 'Delivery')}</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">{stats?.orders?.delivering || 0}</p>
            </Link>
            
            <Link to="/admin/orders?status=livree" className="bg-green-50 rounded-xl p-4 hover:bg-green-100 transition-colors">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle size={18} className="text-green-600" />
                <span className="text-green-800 font-medium text-sm">{t('Livrées', 'Delivered')}</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{stats?.orders?.delivered || 0}</p>
            </Link>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 size={18} className="mr-2 text-[#2563EB]" />
            {t('Performance', 'Performance')}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{t('Taux de livraison', 'Delivery Rate')}</span>
                <span className="font-bold text-green-600">{deliveredPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all" 
                  style={{ width: `${deliveredPercent}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{t('En attente', 'Pending')}</span>
                <span className="font-bold text-yellow-600">{pendingPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all" 
                  style={{ width: `${pendingPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('Commandes échouées', 'Failed Orders')}</span>
                <span className="font-bold text-red-600">{stats?.orders?.failed || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center">
            <Calendar size={18} className="mr-2 text-[#2563EB]" />
            {t('Commandes récentes', 'Recent Orders')}
          </h3>
          <Link 
            to="/admin/orders" 
            className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-sm flex items-center"
          >
            {t('Voir tout', 'View all')}
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">{t('Aucune commande récente', 'No recent orders')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{order.user?.name || t('Client', 'Customer')}</p>
                  </div>
                </div>
                <div className="text-center hidden md:block">
                  <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 mb-1">{formatCurrency(order.total)}</p>
                  {getStatusBadge(order.status)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link 
          to="/admin/products" 
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl p-4 text-center transition-colors"
        >
          <Package size={24} className="mx-auto mb-2" />
          <span className="font-medium text-sm">{t('Gérer produits', 'Manage Products')}</span>
        </Link>
        <Link 
          to="/admin/orders" 
          className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl p-4 text-center transition-colors"
        >
          <ShoppingCart size={24} className="mx-auto mb-2" />
          <span className="font-medium text-sm">{t('Voir commandes', 'View Orders')}</span>
        </Link>
        <Link 
          to="/admin/users" 
          className="bg-green-500 hover:bg-green-600 text-white rounded-xl p-4 text-center transition-colors"
        >
          <Users size={24} className="mx-auto mb-2" />
          <span className="font-medium text-sm">{t('Utilisateurs', 'Users')}</span>
        </Link>
        <Link 
          to="/admin/settings" 
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl p-4 text-center transition-colors"
        >
          <BarChart3 size={24} className="mx-auto mb-2" />
          <span className="font-medium text-sm">{t('Paramètres', 'Settings')}</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
