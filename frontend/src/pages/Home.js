import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Welcome to GAZ MAN</h1>
              <p className="text-gray-600 mt-2">
                Hello, <span className="font-semibold">{user?.name}</span>!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              data-testid="logout-button"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Profile</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 font-medium">Email:</span>
              <span className="ml-2 text-gray-900">{user?.email}</span>
            </div>
            {user?.address && (
              <div>
                <span className="text-gray-600 font-medium">Address:</span>
                <span className="ml-2 text-gray-900">{user?.address}</span>
              </div>
            )}
            {user?.state && (
              <div>
                <span className="text-gray-600 font-medium">State:</span>
                <span className="ml-2 text-gray-900">{user?.state}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600 font-medium">Language:</span>
              <span className="ml-2 text-gray-900">{user?.language === 'en' ? 'English' : 'Français'}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Role:</span>
              <span className="ml-2 text-blue-900 font-semibold capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-orange-900 mb-2">
            🚀 Phase 2 & 3 Coming Soon!
          </h3>
          <p className="text-orange-700">
            Product catalog, shopping cart, orders, and delivery tracking are under development.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
