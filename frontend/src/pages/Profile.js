import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { 
  Package, 
  MapPin, 
  LogOut, 
  ChevronRight,
  Settings,
  HelpCircle,
  Shield
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const { t } = useLanguage();
  const [orderStats, setOrderStats] = useState({ total: 0, inProgress: 0, delivered: 0 });

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const response = await axios.get(`${API}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orders = response.data;
        const total = orders.length;
        const inProgress = orders.filter(o => ['en_attente', 'en_preparation', 'en_livraison'].includes(o.status)).length;
        const delivered = orders.filter(o => o.status === 'livree').length;
        setOrderStats({ total, inProgress, delivered });
      } catch (error) {
        console.error('Error fetching order stats:', error);
      }
    };
    
    if (token) {
      fetchOrderStats();
    }
  }, [token]);

  const handleLogout = () => {
    if (window.confirm(t('auth.logout.confirm'))) {
      logout();
      navigate('/login');
    }
  };

  const menuItems = [
    {
      icon: Package,
      labelKey: 'profile.myOrders',
      descKey: 'profile.myOrdersDesc',
      path: '/orders',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      icon: MapPin,
      labelKey: 'profile.myAddresses',
      descKey: 'profile.myAddressesDesc',
      path: '/addresses',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: Settings,
      labelKey: 'profile.settings',
      descKey: 'profile.settingsDesc',
      path: '/settings',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      comingSoon: true
    },
    {
      icon: HelpCircle,
      labelKey: 'profile.help',
      descKey: 'profile.helpDesc',
      path: '/help',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      comingSoon: true
    },
    {
      icon: Shield,
      labelKey: 'profile.privacy',
      descKey: 'profile.privacyDesc',
      path: '/privacy',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      comingSoon: true
    }
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pb-20">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 pt-8 pb-12 rounded-b-3xl shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">{getInitials(user?.name)}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user?.name || 'Utilisateur'}</h1>
            <p className="text-blue-200 text-sm">{user?.email}</p>
            {user?.address && (
              <p className="text-blue-300 text-xs mt-1 flex items-center">
                <MapPin size={12} className="mr-1" /> {user.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600" data-testid="stats-total">{orderStats.total}</p>
            <p className="text-xs text-gray-500">{t('profile.stats.orders')}</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-2xl font-bold text-blue-600" data-testid="stats-in-progress">{orderStats.inProgress}</p>
            <p className="text-xs text-gray-500">{t('profile.stats.inProgress')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600" data-testid="stats-delivered">{orderStats.delivered}</p>
            <p className="text-xs text-gray-500">{t('profile.stats.delivered')}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mt-6 space-y-3">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => !item.comingSoon && navigate(item.path)}
              disabled={item.comingSoon}
              className={`w-full flex items-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all ${
                item.comingSoon ? 'opacity-60 cursor-not-allowed' : 'active:scale-98'
              }`}
              data-testid={`menu-${item.path.slice(1)}`}
            >
              <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center`}>
                <IconComponent size={24} className={item.iconColor} />
              </div>
              <div className="flex-1 ml-4 text-left">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-gray-900">{t(item.labelKey)}</p>
                  {item.comingSoon && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                      {t('common.soon')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{t(item.descKey)}</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors"
          data-testid="logout-button"
        >
          <LogOut size={20} className="text-red-600" />
          <span className="font-semibold text-red-600">{t('auth.logout')}</span>
        </button>
      </div>

      {/* App Version */}
      <div className="text-center mt-8">
        <p className="text-xs text-gray-400">GAZ MAN v1.0.0</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
