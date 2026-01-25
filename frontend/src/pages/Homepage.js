import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { MapPin, Bell, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/products?limit=6`)
      ]);
      
      setCategories(categoriesRes.data.categories);
      setPopularProducts(productsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryValue) => {
    navigate(`/products?category=${categoryValue}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm" data-testid="homepage-header">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm text-gray-500">Hello,</p>
              <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
            </div>
          </div>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            data-testid="notifications-button"
          >
            <Bell size={24} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2 text-sm">
          <MapPin size={16} className="text-orange-500" />
          <span className="text-gray-600">
            {user?.address || 'Add delivery address'}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-white">
        <button
          onClick={() => navigate('/products')}
          className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          data-testid="search-bar"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-gray-500">Search for gas cylinders...</span>
        </button>
      </div>

      {/* Promotional Banner */}
      <div className="px-4 py-4">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg" data-testid="promo-banner">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Fast Gas Delivery</h3>
              <p className="text-sm text-orange-100 mb-3">Get your gas delivered in 15-20 minutes</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors"
                data-testid="order-now-button"
              >
                Order Now
              </button>
            </div>
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop"
                alt="Gas Cylinder"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Service Categories</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-sm text-orange-500 font-semibold flex items-center hover:text-orange-600"
            data-testid="see-more-categories"
          >
            See More
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {categories.slice(0, 6).map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryClick(category.value)}
              className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              data-testid={`category-${category.value}`}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">🔥</span>
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">
                {category.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Gas Products */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Popular Gas Bottles</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-sm text-orange-500 font-semibold flex items-center hover:text-orange-600"
            data-testid="see-more-products"
          >
            See More
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {popularProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              data-testid={`product-${product.id}`}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{product.capacity}</p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-bold">${product.price}</span>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <span>⭐</span>
                    <span>{product.rating}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Homepage;
