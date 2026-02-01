import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Package, 
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Truck
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DriverLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const t = (fr, en) => language === 'fr' ? fr : en;

  // Check if user is driver and get environment
  useEffect(() => {
    if (user && user.role !== 'driver') {
      navigate('/home');
    }
    
    // Check environment
    const checkEnvironment = async () => {
      try {
        const response = await axios.get(`${API}/environment`);
        setIsPreview(response.data.is_preview);
      } catch (error) {
        console.error('Error checking environment:', error);
      }
    };
    checkEnvironment();
  }, [user, navigate]);

  const handleLogout = () => {
    if (window.confirm(t('Êtes-vous sûr de vouloir vous déconnecter?', 'Are you sure you want to logout?'))) {
      logout();
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/driver', icon: LayoutDashboard, label: t('Tableau de bord', 'Dashboard'), end: true },
    { path: '/driver/orders', icon: Package, label: t('Mes Livraisons', 'My Deliveries') },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Preview Warning Banner */}
      {isPreview && (
        <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium flex items-center justify-center space-x-2">
          <AlertTriangle size={16} />
          <span>{t('Environnement de prévisualisation - Les données peuvent ne pas être réelles', 'Preview environment - Data may not be real')}</span>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-green-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck size={24} />
          <h1 className="text-xl font-bold">GAZ MAN Driver</h1>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-green-800 text-white
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isPreview ? 'top-10 lg:top-0' : ''}
        `}>
          {/* Logo */}
          <div className="p-6 border-b border-green-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Truck size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold">GAZ MAN</h1>
                <p className="text-green-300 text-sm">{t('Livreur', 'Driver')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-orange-500 text-white' 
                    : 'text-green-200 hover:bg-green-700 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-700">
            <div className="mb-4">
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-green-300 text-sm">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              <span>{t('Déconnexion', 'Logout')}</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
