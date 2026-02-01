import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isPreview, setIsPreview] = React.useState(false);

  // Check if user is admin and get environment
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
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
    if (window.confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir vous déconnecter?' : 'Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: language === 'fr' ? 'Tableau de bord' : 'Dashboard', end: true },
    { path: '/admin/orders', icon: ShoppingCart, label: language === 'fr' ? 'Commandes' : 'Orders' },
    { path: '/admin/products', icon: Package, label: language === 'fr' ? 'Produits' : 'Products' },
    { path: '/admin/users', icon: Users, label: language === 'fr' ? 'Utilisateurs' : 'Users' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-blue-900 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">GAZ MAN Admin</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Preview Environment Warning */}
      {isPreview && (
        <div className="bg-yellow-500 text-black px-4 py-2 text-center font-medium">
          <div className="flex items-center justify-center space-x-2">
            <AlertTriangle size={20} />
            <span>
              {language === 'fr' 
                ? 'ENVIRONNEMENT DE PRÉVISUALISATION - Les données peuvent ne pas être réelles' 
                : 'PREVIEW ENVIRONMENT - Data may not be real'}
            </span>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-blue-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo */}
          <div className="p-6 border-b border-blue-800">
            <h1 className="text-2xl font-bold">GAZ MAN</h1>
            <p className="text-blue-300 text-sm">Administration</p>
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
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
            <div className="mb-4">
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-blue-300 text-sm">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              <span>{language === 'fr' ? 'Déconnexion' : 'Logout'}</span>
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

export default AdminLayout;
