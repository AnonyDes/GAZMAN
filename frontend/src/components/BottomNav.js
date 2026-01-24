import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home', testId: 'nav-home' },
    { path: '/products', icon: Search, label: 'Search', testId: 'nav-search' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', testId: 'nav-cart' },
    { path: '/profile', icon: User, label: 'Profile', testId: 'nav-profile' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label, testId }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(path)
                ? 'text-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid={testId}
          >
            <Icon size={24} className="mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
