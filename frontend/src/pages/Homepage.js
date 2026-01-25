import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { MapPin, Bell, ChevronRight, Flame, Clock, ShoppingBag } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const categoriesRes = await axios.get(`${API}/categories`);
      setCategories(categoriesRes.data.categories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryValue) => {
    navigate(`/products?category=${categoryValue}`);
  };

  const categoryIcons = {
    domestic: '🏠',
    industrial: '🏭',
    refill: '♻️',
    rental: '🔄',
    installation: '🔧',
    emergency: '🚨'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pb-20">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 pt-6 pb-8 rounded-b-3xl shadow-xl" data-testid="homepage-header">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-orange-300 text-sm font-medium">Bienvenue,</p>
              <p className="text-white font-bold text-lg">{user?.name || 'Utilisateur'}</p>
            </div>
          </div>
          <button
            className="relative p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
            data-testid="notifications-button"
          >
            <Bell size={22} className="text-white" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-blue-900"></span>
          </button>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
          <MapPin size={18} className="text-orange-400 flex-shrink-0" />
          <span className="text-white text-sm flex-1 truncate">
            {user?.address || 'Ajouter une adresse de livraison'}
          </span>
          <ChevronRight size={16} className="text-white/60" />
        </div>
      </div>

      {/* Hero Section - Strong CTA */}
      <div className="px-4 -mt-6 mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 shadow-2xl relative overflow-hidden" data-testid="hero-section">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-white text-2xl font-bold mb-2">
                  Livraison Express
                </h2>
                <p className="text-orange-100 text-sm mb-4">
                  Votre gaz livré en 15-20 minutes partout à Yaoundé
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center space-x-2"
                  data-testid="hero-cta-button"
                >
                  <ShoppingBag size={18} />
                  <span>Commander Maintenant</span>
                </button>
              </div>
              <div className="w-20 h-20 flex-shrink-0">
                <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Flame size={40} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status/Info Card */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-gray-900 font-semibold">Service disponible</p>
                <p className="text-gray-500 text-sm">Lun - Dim, 8h00 - 22h00</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-600 font-bold text-sm">• OUVERT</p>
              <p className="text-gray-400 text-xs">Livraison rapide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid - Large Icons */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Nos Services</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {categories.slice(0, 6).map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryClick(category.value)}
              className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all active:scale-95"
              data-testid={`category-${category.value}`}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-orange-100 rounded-2xl flex items-center justify-center mb-3 mx-auto">
                <span className="text-4xl">{categoryIcons[category.value] || '🔥'}</span>
              </div>
              <p className="text-xs font-semibold text-gray-800 text-center leading-tight">
                {category.label.replace('Cylinder ', '')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Products - Premium Cards */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Produits Populaires</h2>
            <p className="text-gray-500 text-sm">Les plus demandés</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="text-orange-600 font-semibold text-sm flex items-center hover:text-orange-700"
            data-testid="see-all-products"
          >
            Tout voir
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {popularProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden active:scale-95"
              data-testid={`product-${product.id}`}
            >
              {/* Product Image with Badge */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                {product.rating >= 4.7 && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
                    <span>⭐</span>
                    <span>{product.rating}</span>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-sm text-gray-900 mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3 flex items-center">
                  <span className="mr-1">📦</span>
                  {product.capacity}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price + 2000)}</p>
                    <p className="text-orange-600 font-bold text-base">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className="bg-orange-500 text-white w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-lg">+</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">🎉 Offre Spéciale</p>
              <h3 className="text-white font-bold text-lg mb-2">Livraison Gratuite</h3>
              <p className="text-blue-100 text-sm mb-3">Pour toute commande supérieure à 20 000 FCFA</p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                En profiter
              </button>
            </div>
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-4xl">🚚</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Homepage;
