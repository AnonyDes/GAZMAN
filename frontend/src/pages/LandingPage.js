import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { 
  MapPin, 
  Search, 
  Clock, 
  Shield, 
  Truck, 
  Phone,
  ChevronRight,
  Star,
  CheckCircle,
  ShoppingCart
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Logo URL - Blue background version
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_gazman-ecommerce/artifacts/0uv4ea5b_image_d1e9bce8-c09f-42e8-8c73-a8ca1ab5cbab.png';

// Default site settings
const defaultSettings = {
  hero_title: 'Votre gaz livré en un clic',
  hero_subtitle: 'Commandez votre bouteille de gaz et recevez-la chez vous en moins de 30 minutes, partout à Yaoundé et Douala.',
  hero_cta: 'Commander maintenant',
  promo_title: 'Livraison Express',
  promo_subtitle: 'Livraison gratuite pour toute commande supérieure à 20 000 FCFA',
  service_hours: 'Lun - Dim, 8h00 - 22h00'
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/products`)
      ]);
      setCategories(categoriesRes.data.categories);
      setProducts(productsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      if (response.data) {
        setSettings({ ...defaultSettings, ...response.data });
      }
    } catch (error) {
      console.log('Using default settings');
    }
  };

  const handleOrderNow = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/login', { state: { from: '/home' } });
    }
  };

  const handleCategoryClick = (categoryValue) => {
    navigate(`/products?category=${categoryValue}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleBuyNow = (e, productId) => {
    e.stopPropagation();
    if (isAuthenticated) {
      navigate(`/products/${productId}`);
    } else {
      navigate('/login', { state: { from: `/products/${productId}` } });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Category icons and colors
  const categoryConfig = {
    domestic: { icon: '🏠', bg: 'bg-blue-50', border: 'border-blue-200' },
    industrial: { icon: '🏭', bg: 'bg-slate-50', border: 'border-slate-200' },
    refill: { icon: '♻️', bg: 'bg-green-50', border: 'border-green-200' },
    rental: { icon: '🔄', bg: 'bg-purple-50', border: 'border-purple-200' },
    installation: { icon: '🔧', bg: 'bg-orange-50', border: 'border-orange-200' },
    emergency: { icon: '🚨', bg: 'bg-red-50', border: 'border-red-200' }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#2563EB] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src={LOGO_URL} 
                alt="GAZMAN Logo" 
                className="w-12 h-12 object-contain rounded-lg"
              />
              <span className="text-2xl font-bold hidden sm:block">GAZMAN</span>
            </div>

            {/* Nav */}
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium px-2 py-1 rounded"
              >
                {language === 'fr' ? 'EN' : 'FR'}
              </button>
              
              {isAuthenticated ? (
                <Link
                  to="/home"
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                >
                  {language === 'fr' ? 'Mon compte' : 'My Account'}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white/90 hover:text-white transition-colors font-medium text-sm hidden sm:block"
                  >
                    {language === 'fr' ? 'Se connecter' : 'Login'}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#F59E0B] text-white hover:bg-[#D97706] px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                  >
                    {language === 'fr' ? 'Créer un compte' : 'Sign Up'}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] py-12 md:py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {settings.hero_title}
              </h1>
              <p className="text-lg text-blue-100 mb-6 max-w-xl">
                {settings.hero_subtitle}
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-md mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'fr' ? 'Rechercher un produit...' : 'Search products...'}
                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-[#F59E0B]/50 outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#F59E0B] hover:bg-[#D97706] text-white p-2 rounded-lg transition-colors"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </form>

              <button
                onClick={handleOrderNow}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
              >
                <span>{settings.hero_cta}</span>
                <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Hero Image/Logo */}
            <div className="flex-shrink-0">
              <img 
                src={LOGO_URL} 
                alt="GAZMAN" 
                className="w-48 h-48 md:w-64 md:h-64 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-2">
              {language === 'fr' ? 'Nos Services' : 'Our Services'}
            </h2>
            <p className="text-gray-600">
              {language === 'fr' 
                ? 'Sélectionnez une catégorie pour voir nos produits'
                : 'Select a category to view our products'}
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {categories.map((category) => {
              const config = categoryConfig[category.value] || { icon: '🔥', bg: 'bg-gray-50', border: 'border-gray-200' };
              return (
                <button
                  key={category.value}
                  onClick={() => handleCategoryClick(category.value)}
                  className={`${config.bg} ${config.border} border-2 rounded-xl p-4 hover:shadow-md transition-all hover:scale-105 group`}
                >
                  <div className="text-3xl mb-2">{config.icon}</div>
                  <p className="font-semibold text-gray-900 group-hover:text-[#2563EB] transition-colors text-sm">
                    {t(`category.${category.value}`)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Section - PUBLIC */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F]">
                {language === 'fr' ? 'Nos Produits' : 'Our Products'}
              </h2>
              <p className="text-gray-600">
                {language === 'fr' ? 'Découvrez notre gamme de produits' : 'Discover our product range'}
              </p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold flex items-center"
            >
              {language === 'fr' ? 'Voir tout' : 'View all'}
              <ChevronRight size={20} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.slice(0, 8).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all group cursor-pointer border border-gray-100"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="relative">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300&h=200&fit=crop'}
                      alt={product.name}
                      className="w-full h-36 md:h-44 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <span className="text-xs font-medium text-gray-700">{t(`category.${product.category}`)}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-1">{product.brand}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#2563EB] font-bold text-lg">{formatCurrency(product.price)}</span>
                      <button
                        onClick={(e) => handleBuyNow(e, product.id)}
                        className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-3 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center space-x-1"
                      >
                        <ShoppingCart size={16} />
                        <span>{language === 'fr' ? 'Acheter' : 'Buy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-[#2563EB] rounded-xl flex items-center justify-center mb-4">
                <Truck size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">
                {language === 'fr' ? 'Livraison Rapide' : 'Fast Delivery'}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'fr'
                  ? 'Livraison en moins de 30 minutes'
                  : 'Delivery in less than 30 minutes'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-[#F59E0B] rounded-xl flex items-center justify-center mb-4">
                <Shield size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">
                {language === 'fr' ? 'Qualité Garantie' : 'Quality Guaranteed'}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'fr'
                  ? 'Produits certifiés et conformes'
                  : 'Certified and compliant products'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                <Phone size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">
                {language === 'fr' ? 'Support 24/7' : '24/7 Support'}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === 'fr'
                  ? 'Assistance disponible à tout moment'
                  : 'Support available at all times'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Status + Promo */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          {/* Service Status */}
          <div className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-bold">{language === 'fr' ? 'Service disponible' : 'Service available'}</p>
                  <p className="text-blue-200 text-sm">{settings.service_hours}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-300 font-bold">
                  {language === 'fr' ? 'OUVERT' : 'OPEN'}
                </span>
              </div>
            </div>
          </div>

          {/* Promo Banner */}
          <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-white mb-1">{settings.promo_title}</h3>
                <p className="text-white/90">{settings.promo_subtitle}</p>
              </div>
              <button
                onClick={handleOrderNow}
                className="bg-white hover:bg-gray-100 text-[#D97706] px-6 py-2 rounded-xl font-bold transition-colors"
              >
                {language === 'fr' ? 'En profiter' : 'Get it now'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <CheckCircle size={20} className="text-green-500" />
              <span className="font-medium text-sm">{language === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Star size={20} className="text-[#F59E0B] fill-current" />
              <span className="font-medium text-sm">{language === 'fr' ? '+5000 clients' : '+5000 customers'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield size={20} className="text-[#2563EB]" />
              <span className="font-medium text-sm">{language === 'fr' ? 'Certifié' : 'Certified'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E3A5F] text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src={LOGO_URL} alt="GAZMAN" className="w-10 h-10 object-contain rounded"/>
                <span className="text-xl font-bold">GAZMAN</span>
              </div>
              <p className="text-gray-400 text-sm">
                {language === 'fr' 
                  ? 'Votre partenaire de confiance pour la livraison de gaz.'
                  : 'Your trusted partner for gas delivery.'}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">{language === 'fr' ? 'Services' : 'Services'}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>{language === 'fr' ? 'Gaz Domestique' : 'Domestic Gas'}</li>
                <li>{language === 'fr' ? 'Gaz Industriel' : 'Industrial Gas'}</li>
                <li>{language === 'fr' ? 'Recharge' : 'Refill'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">{language === 'fr' ? 'Support' : 'Support'}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>{language === 'fr' ? 'Centre d\'aide' : 'Help Center'}</li>
                <li>FAQ</li>
                <li>{language === 'fr' ? 'Contact' : 'Contact'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">{language === 'fr' ? 'Contact' : 'Contact'}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>+237 6XX XXX XXX</li>
                <li>contact@gazman.cm</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
            © 2026 GAZMAN. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
