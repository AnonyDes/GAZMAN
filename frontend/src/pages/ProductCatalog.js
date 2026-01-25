import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductCatalog = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Get category label
  const getCategoryLabel = () => {
    if (!selectedCategory) return 'Tous les Produits';
    const category = categories.find(cat => cat.value === selectedCategory);
    return category ? category.label : 'Produits';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pb-20">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 pt-6 pb-8 rounded-b-3xl shadow-xl sticky top-0 z-40">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
            data-testid="back-button"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{getCategoryLabel()}</h1>
            <p className="text-blue-200 text-sm">{products.length} produit{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
            data-testid="filters-button"
          >
            <SlidersHorizontal size={24} className="text-white" />
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
            placeholder="Rechercher un produit..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 placeholder-gray-400"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white px-4 py-6 shadow-lg mx-4 mt-4 rounded-2xl">
          {/* Sort By */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              data-testid="sort-select"
            >
              <option value="name">Nom</option>
              <option value="price">Prix: Croissant</option>
              <option value="-price">Prix: Décroissant</option>
              <option value="-rating">Meilleure Note</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              data-testid="category-filter"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Marque</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              data-testid="brand-filter"
            >
              <option value="">Toutes les marques</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2">Plage de Prix (FCFA)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                data-testid="min-price-input"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
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
              Réinitialiser les filtres
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
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Search size={40} className="text-gray-400" />
          </div>
          <p className="text-gray-900 font-bold text-center text-lg mb-2">Aucun produit trouvé</p>
          <p className="text-gray-500 text-center text-sm">
            Essayez d'ajuster vos filtres ou termes de recherche
          </p>
        </div>
      ) : (
        <div className="px-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden text-left active:scale-95"
                data-testid={`product-card-${product.id}`}
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
                  <div className="flex items-center mb-2">
                    <span className="inline-block bg-blue-100 text-blue-900 px-2 py-1 rounded-lg text-xs font-bold mr-2">
                      {product.brand}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 flex items-center">
                    <span className="mr-1">📦</span>
                    {product.capacity}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 font-bold text-lg">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div className="bg-orange-500 text-white w-8 h-8 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold">+</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {product.delivery_time}
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
