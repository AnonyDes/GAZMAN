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
  CheckCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Logo URL
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_gazman-ecommerce/artifacts/0kss4yf8_gazman_icon.png';

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
  const [settings, setSettings] = useState(defaultSettings);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchSettings();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
    if (isAuthenticated) {
      navigate(`/products?category=${categoryValue}`);
    } else {
      navigate('/login', { state: { from: `/products?category=${categoryValue}` } });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (isAuthenticated) {
        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate('/login', { state: { from: `/products?search=${encodeURIComponent(searchQuery)}` } });
      }
    }
  };

  // Category icons and colors based on brand (blue/orange theme)
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
      <header className="bg-gradient-to-r from-[#0F357F] to-[#1a4a9e] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src={LOGO_URL} 
                alt="GAZMAN Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold">GAZMAN</span>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                {language === 'fr' ? 'EN' : 'FR'}
              </button>
              
              {isAuthenticated ? (
                <Link
                  to="/home"
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Mon compte
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white/90 hover:text-white transition-colors font-medium"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#FF6B35] text-white hover:bg-[#e55a2b] px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    Créer un compte
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile menu */}
            <div className="md:hidden flex items-center space-x-3">
              <button
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="text-white/80 text-sm font-medium"
              >
                {language === 'fr' ? 'EN' : 'FR'}
              </button>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="bg-[#FF6B35] text-white px-3 py-1.5 rounded-lg font-bold text-sm"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Blue/White theme */}
      <section className="bg-gradient-to-br from-[#0F357F] via-[#1a4a9e] to-[#007DFF] py-16 md:py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6">
              <img 
                src={LOGO_URL} 
                alt="GAZMAN" 
                className="w-24 h-24 mx-auto object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {settings.hero_title}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
              {settings.hero_subtitle}
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <MapPin size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'fr' ? 'Rechercher "Bouteille de gaz"' : 'Search "Gas Cylinder"'}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/20 bg-white shadow-lg text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#FF6B35] hover:bg-[#e55a2b] text-white p-2 rounded-xl transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* CTA Button */}
            <button
              onClick={handleOrderNow}
              className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>{settings.hero_cta}</span>
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F357F] mb-4">
              {language === 'fr' ? 'Nos Services' : 'Our Services'}
            </h2>
            <p className="text-gray-600 text-lg">
              {language === 'fr' 
                ? 'Tout ce dont vous avez besoin pour votre gaz domestique ou industriel'
                : 'Everything you need for your domestic or industrial gas'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category) => {
              const config = categoryConfig[category.value] || { icon: '🔥', bg: 'bg-gray-50', border: 'border-gray-200' };
              return (
                <button
                  key={category.value}
                  onClick={() => handleCategoryClick(category.value)}
                  className={`${config.bg} ${config.border} border-2 rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-105 group`}
                >
                  <div className="text-4xl mb-3">{config.icon}</div>
                  <p className="font-semibold text-gray-900 group-hover:text-[#0F357F] transition-colors">
                    {t(`category.${category.value}`)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F357F] mb-4">
              {language === 'fr' ? 'Pourquoi choisir GAZMAN?' : 'Why choose GAZMAN?'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100">
              <div className="w-16 h-16 bg-[#007DFF] rounded-2xl flex items-center justify-center mb-6">
                <Truck size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0F357F] mb-3">
                {language === 'fr' ? 'Livraison Rapide' : 'Fast Delivery'}
              </h3>
              <p className="text-gray-600">
                {language === 'fr'
                  ? 'Recevez votre commande en moins de 30 minutes partout à Yaoundé et Douala.'
                  : 'Receive your order in less than 30 minutes anywhere in Yaoundé and Douala.'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border border-orange-100">
              <div className="w-16 h-16 bg-[#FF6B35] rounded-2xl flex items-center justify-center mb-6">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0F357F] mb-3">
                {language === 'fr' ? 'Qualité Garantie' : 'Quality Guaranteed'}
              </h3>
              <p className="text-gray-600">
                {language === 'fr'
                  ? 'Tous nos produits sont certifiés et conformes aux normes de sécurité.'
                  : 'All our products are certified and comply with safety standards.'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-100">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                <Phone size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0F357F] mb-3">
                {language === 'fr' ? 'Support 24/7' : '24/7 Support'}
              </h3>
              <p className="text-gray-600">
                {language === 'fr'
                  ? 'Notre équipe est disponible à tout moment pour répondre à vos questions.'
                  : 'Our team is available at all times to answer your questions.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Status Card */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#0F357F] to-[#007DFF] rounded-3xl p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Clock size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold">{language === 'fr' ? 'Service disponible' : 'Service available'}</p>
                  <p className="text-blue-200">{settings.service_hours}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-300 font-bold text-lg">
                  {language === 'fr' ? 'OUVERT' : 'OPEN'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#FF6B35] to-[#ff8a5c] rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {settings.promo_title}
                </h3>
                <p className="text-white/90 text-lg">
                  {settings.promo_subtitle}
                </p>
              </div>
              <button
                onClick={handleOrderNow}
                className="bg-white hover:bg-gray-100 text-[#FF6B35] px-6 py-3 rounded-xl font-bold transition-colors whitespace-nowrap"
              >
                {language === 'fr' ? 'En profiter' : 'Take advantage'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center space-x-2 text-gray-600">
              <CheckCircle size={24} className="text-green-500" />
              <span className="font-medium">{language === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Star size={24} className="text-[#FF6B35] fill-current" />
              <span className="font-medium">{language === 'fr' ? '+5000 clients satisfaits' : '+5000 satisfied customers'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield size={24} className="text-blue-500" />
              <span className="font-medium">{language === 'fr' ? 'Produits certifiés' : 'Certified products'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F357F] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src={LOGO_URL} 
                  alt="GAZMAN" 
                  className="w-10 h-10 object-contain bg-white rounded-lg p-1"
                />
                <span className="text-2xl font-bold">GAZMAN</span>
              </div>
              <p className="text-blue-200 text-sm">
                {language === 'fr' 
                  ? 'Votre partenaire de confiance pour la livraison de gaz au Cameroun.'
                  : 'Your trusted partner for gas delivery in Cameroon.'}
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold text-lg mb-4">{language === 'fr' ? 'Services' : 'Services'}</h4>
              <ul className="space-y-2 text-blue-200">
                <li>{language === 'fr' ? 'Gaz Domestique' : 'Domestic Gas'}</li>
                <li>{language === 'fr' ? 'Gaz Industriel' : 'Industrial Gas'}</li>
                <li>{language === 'fr' ? 'Recharge' : 'Refill'}</li>
                <li>{language === 'fr' ? 'Installation' : 'Installation'}</li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-lg mb-4">{language === 'fr' ? 'Support' : 'Support'}</h4>
              <ul className="space-y-2 text-blue-200">
                <li>{language === 'fr' ? 'Centre d\'aide' : 'Help Center'}</li>
                <li>{language === 'fr' ? 'Contact' : 'Contact'}</li>
                <li>{language === 'fr' ? 'FAQ' : 'FAQ'}</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-4">{language === 'fr' ? 'Contact' : 'Contact'}</h4>
              <ul className="space-y-2 text-blue-200">
                <li>+237 6XX XXX XXX</li>
                <li>contact@gazman.cm</li>
                <li>Yaoundé, Cameroun</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-300 text-sm">
            © 2026 GAZMAN. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
