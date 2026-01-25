import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Search, SlidersHorizontal, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-40">
        <div className="flex items-center space-x-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex-1">Products</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            data-testid="filters-button"
          >
            <SlidersHorizontal size={24} className="text-gray-700" />
            {activeFiltersCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gas cylinders..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white px-4 py-4 shadow-md">
          {/* Sort By */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              data-testid="sort-select"
            >
              <option value="name">Name</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Rating</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              data-testid="category-filter"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              data-testid="brand-filter"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                data-testid="min-price-input"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                data-testid="max-price-input"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="w-full py-2 text-orange-600 font-semibold hover:bg-orange-50 rounded-lg transition-colors"
              data-testid="clear-filters-button"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-600">
          {products.length} {products.length === 1 ? 'result' : 'results'} found
        </p>
      </div>

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
          <p className="text-gray-600 text-center">No products found</p>
          <p className="text-sm text-gray-500 text-center mt-1">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden text-left"
                data-testid={`product-card-${product.id}`}
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
                    <span className="text-orange-600 font-bold text-base">
                      ${product.price}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span>⭐</span>
                      <span>{product.rating}</span>
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
