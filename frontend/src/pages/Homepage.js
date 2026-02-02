import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { MapPin, Bell, Search, Clock, ChevronRight, Star } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/products`)
      ]);
      setCategories(categoriesRes.data.categories);
      setProducts(productsRes.data.slice(0, 6)); // Get first 6 products for display
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryValue) => {
    navigate(`/products?category=${categoryValue}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Category icons mapping with images/emojis
  const categoryIcons = {
    domestic: '🏠',
    industrial: '🏭',
    refill: '♻️',
    rental: '🔄',
    installation: '🔧',
    emergency: '🚨'
  };

  // Category background colors
  const categoryColors = {
    domestic: 'bg-orange-50',
    industrial: 'bg-blue-50',
    refill: 'bg-green-50',
    rental: 'bg-purple-50',
    installation: 'bg-yellow-50',
    emergency: 'bg-red-50'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Section */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-gray-500 text-sm">{t('home.hello')}</p>
              <p className="text-gray-900 font-bold text-lg">{user?.name || t('home.user')}</p>
            </div>
          </div>
          <button
            className="relative p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            data-testid="notifications-button"
          >
            <Bell size={22} className="text-gray-700" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2 mb-6">
          <MapPin size={18} className="text-orange-500 flex-shrink-0" />
          <span className="text-gray-700 text-sm flex-1 truncate">
            {user?.address || t('home.addDeliveryAddress')}
          </span>
        </div>

        {/* What Service Question */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('home.whatService')}</h2>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="w-full pl-4 pr-12 py-4 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 placeholder-gray-400"
            data-testid="search-input"
          />
          <button 
            type="submit"
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
          >
            <Search size={20} className="text-gray-400" />
          </button>
        </form>
      </div>

      {/* Promotional Banner */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 shadow-lg relative overflow-hidden" data-testid="hero-section">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 right-20 w-20 h-20 bg-white/10 rounded-full mb-2"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-white text-xl font-bold mb-1">
                {t('home.fastBites')}
              </h3>
              <p className="text-orange-100 text-sm mb-4">
                {t('home.upTo3Times')}
              </p>
              <button
                onClick={() => navigate('/products')}
                className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                data-testid="hero-cta-button"
              >
                {t('home.orderNow')}
              </button>
            </div>
            <div className="w-24 h-24 flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=200&h=200&fit=crop"
                alt="Gas Cylinder"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{t('home.serviceCategories')}</h2>
          <button 
            onClick={() => navigate('/products')}
            className="text-orange-500 text-sm font-semibold hover:text-orange-600"
          >
            {t('home.seeMore')}
          </button>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.slice(0, 4).map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryClick(category.value)}
              className="flex flex-col items-center min-w-[70px]"
              data-testid={`category-${category.value}`}
            >
              <div className={`w-16 h-16 ${categoryColors[category.value] || 'bg-gray-100'} rounded-2xl flex items-center justify-center mb-2 shadow-sm hover:shadow-md transition-all`}>
                <span className="text-2xl">{categoryIcons[category.value] || '🔥'}</span>
              </div>
              <p className="text-xs font-medium text-gray-700 text-center leading-tight">
                {t(`category.${category.value}`)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Products */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{t('home.popularProducts')}</h2>
          <button 
            onClick={() => navigate('/products')}
            className="text-orange-500 text-sm font-semibold hover:text-orange-600"
          >
            {t('home.seeMore')}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.slice(0, 4).map((product) => (
            <button
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="bg-white rounded-2xl shadow-md overflow-hidden text-left hover:shadow-lg transition-all"
              data-testid={`product-${product.id}`}
            >
              <div className="relative">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300&h=200&fit=crop'}
                  alt={product.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
                  <Clock size={12} className="text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">{product.delivery_time || '15-20 min'}</span>
                </div>
                <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-gray-500 text-xs mb-2 line-clamp-1">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-bold">{formatCurrency(product.price)}</span>
                  <div className="flex items-center space-x-1">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">{product.rating || '4.8'}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Service Status Card */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">{t('home.serviceAvailable')}</p>
                <p className="text-blue-200 text-sm">{t('home.serviceHours')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-300 font-bold text-sm flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                {t('home.open')}
              </p>
              <p className="text-blue-200 text-xs">{t('home.fastDelivery')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Free Delivery Banner */}
      <div className="px-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-xl">🚚</span>
          </div>
          <div className="flex-1">
            <p className="text-green-800 font-semibold text-sm">{t('home.freeDelivery')}</p>
            <p className="text-green-600 text-xs">{t('home.freeDeliveryDesc')}</p>
          </div>
          <ChevronRight size={20} className="text-green-500" />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Homepage;
