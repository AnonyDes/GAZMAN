import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { Plus, Edit2, Trash2, Package, X, Search } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminProducts = () => {
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'domestic',
    size: 'medium',
    capacity: '12kg',
    price: '',
    stock: '',
    image_url: '',
    description: '',
    delivery_time: '15-20 min'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      category: 'domestic',
      size: 'medium',
      capacity: '12kg',
      price: '',
      stock: '',
      image_url: '',
      description: '',
      delivery_time: '15-20 min'
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      size: product.size,
      capacity: product.capacity,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || '',
      description: product.description || '',
      delivery_time: product.delivery_time || '15-20 min'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await axios.put(
          `${API}/admin/products/${editingProduct.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API}/admin/products`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await fetchProducts();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert(t('admin.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(t('admin.deleteConfirm'))) {
      return;
    }

    try {
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(t('admin.deleteError'));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const categoryOptions = [
    { value: 'domestic', label: t('category.domestic') },
    { value: 'industrial', label: t('category.industrial') },
    { value: 'refill', label: t('category.refill') },
    { value: 'rental', label: t('category.rental') },
    { value: 'installation', label: t('category.installation') },
    { value: 'emergency', label: t('category.emergency') },
  ];

  const sizeOptions = [
    { value: 'small', label: t('size.small') },
    { value: 'medium', label: t('size.medium') },
    { value: 'large', label: t('size.large') },
  ];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === '' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.products')}
          </h1>
          <p className="text-gray-600 mt-1">
            {total} {t('admin.totalProductsCount')}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          <span>{t('common.add')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('products.search')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">{t('category.all')}</option>
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={48} className="text-gray-300" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {t(`category.${product.category}`)}
                </span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {t(`size.${product.size}`)}
                </span>
                <span className="text-xs text-gray-500">{product.capacity}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-bold text-orange-600">{formatCurrency(product.price)}</p>
                <p className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  Stock: {product.stock}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                  <span>{t('common.edit')}</span>
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{t('admin.noProducts')}</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? t('admin.editProduct') : t('admin.newProduct')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.productName')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.productBrand')} *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.productCategory')}
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.productSize')}
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {sizeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.productPrice')} *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.productStock')} *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.productCapacity')}
                </label>
                <input
                  type="text"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="12kg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.productImageUrl')}
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.productDescription')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? t('admin.saving') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
