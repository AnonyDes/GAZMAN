import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { ArrowLeft, Search, SlidersHorizontal, Star, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductCatalog = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Get category label
  const getCategoryLabel = () => {
    if (!selectedCategory) return t('products.title');
    const category = categories.find(cat => cat.value === selectedCategory);
    if (category) {
      return t(`category.${category.value}`);
    }
    return t('products.title');
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, sortBy, searchQuery, minPrice, maxPrice]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data.brands);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sort_by', sortBy);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);

      const response = await axios.get(`${API}/products?${params.toString()}`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('name');
  };

  const activeFiltersCount = [selectedCategory, selectedBrand, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{getCategoryLabel()}</h1>
            <p className="text-gray-500 text-sm">
              {products.length} {products.length === 1 ? t('products.product') : t('products.products')} {t('products.available')}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            data-testid="filters-button"
          >
            <SlidersHorizontal size={24} className="text-gray-700" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('products.search')}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 placeholder-gray-400"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white px-4 py-6 shadow-lg mx-4 mt-4 rounded-2xl border border-gray-100">
          {/* Sort By */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">{t('products.sortBy')}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              data-testid="sort-select"
            >
              <option value="name">{t('products.sortName')}</option>
              <option value="price">{t('products.sortPriceAsc')}</option>
              <option value="-price">{t('products.sortPriceDesc')}</option>
              <option value="-rating">{t('products.sortRating')}</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">{t('products.category')}</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              data-testid="category-filter"
            >
              <option value="">{t('products.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {t(`category.${cat.value}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">{t('products.brand')}</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              data-testid="brand-filter"
            >
              <option value="">{t('products.allBrands')}</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">{t('products.priceRange')}</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder={t('products.min')}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                data-testid="min-price-input"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder={t('products.max')}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                data-testid="max-price-input"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="w-full py-3 text-orange-600 font-bold hover:bg-orange-50 rounded-xl transition-colors border-2 border-orange-200"
              data-testid="clear-filters-button"
            >
              {t('products.clearFilters')}
            </button>
          )}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search size={40} className="text-gray-400" />
          </div>
          <p className="text-gray-900 font-bold text-center text-lg mb-2">{t('products.noResults')}</p>
          <p className="text-gray-500 text-center text-sm">
            {t('products.noResultsDesc')}
          </p>
        </div>
      ) : (
        <div className="px-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-2xl shadow-md overflow-hidden text-left hover:shadow-lg transition-all border border-gray-100"
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
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {t(`category.${product.category}`)}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-500 text-xs mb-2 line-clamp-1">{product.brand}</p>
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
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ProductCatalog;
