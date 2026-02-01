import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Star,
  Phone,
  Home,
  Building2,
  CheckCircle
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyAddresses = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    quartier: '',
    description: '',
    phone: '+237 '
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${API}/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingAddress) {
        await axios.put(
          `${API}/addresses/${editingAddress.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API}/addresses`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchAddresses();
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      alert(t('error.generic'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm(t('addresses.deleteConfirm'))) return;

    try {
      await axios.delete(`${API}/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert(t('error.generic'));
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await axios.post(
        `${API}/addresses/${addressId}/set-default`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAddresses();
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  const startEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      city: address.city,
      quartier: address.quartier,
      description: address.description || '',
      phone: address.phone
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setFormData({
      name: '',
      city: '',
      quartier: '',
      description: '',
      phone: '+237 '
    });
  };

  const getAddressIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('maison') || lowerName.includes('home')) {
      return <Home size={20} className="text-blue-600" />;
    }
    if (lowerName.includes('bureau') || lowerName.includes('office') || lowerName.includes('travail')) {
      return <Building2 size={20} className="text-orange-600" />;
    }
    return <MapPin size={20} className="text-green-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 pt-6 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
            data-testid="back-button"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{t('addresses.title')}</h1>
            <p className="text-blue-200 text-sm">
              {addresses.length} {addresses.length === 1 ? 'adresse' : 'adresses'}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <MapPin size={24} className="text-white" />
          </div>
        </div>
      </div>

      {/* Add Address Button */}
      {!showForm && (
        <div className="px-4 -mt-4">
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-white rounded-2xl shadow-lg p-4 flex items-center justify-center space-x-2 text-orange-600 font-semibold hover:shadow-xl transition-all active:scale-98"
            data-testid="add-address-button"
          >
            <Plus size={20} />
            <span>{t('addresses.addNew')}</span>
          </button>
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingAddress ? t('addresses.edit') : t('addresses.addNew')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Address Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('addresses.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('addresses.namePlaceholder')}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  data-testid="address-name-input"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('addresses.city')} *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={t('addresses.cityPlaceholder')}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  data-testid="address-city-input"
                />
              </div>

              {/* Quartier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('addresses.quartier')} *
                </label>
                <input
                  type="text"
                  value={formData.quartier}
                  onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                  placeholder={t('addresses.quartierPlaceholder')}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  data-testid="address-quartier-input"
                />
              </div>

              {/* Description / Landmark */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('addresses.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('addresses.descriptionPlaceholder')}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  data-testid="address-description-input"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('addresses.phone')} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+237 6XX XXX XXX"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  data-testid="address-phone-input"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  data-testid="cancel-button"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  data-testid="save-address-button"
                >
                  {saving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Addresses List */}
      {!showForm && (
        <div className="px-4 mt-6 space-y-4">
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <MapPin size={48} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t('addresses.empty')}</h2>
              <p className="text-gray-500 text-center">{t('addresses.emptyDesc')}</p>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-2xl shadow-lg p-5 relative ${
                  address.is_default ? 'ring-2 ring-orange-500' : ''
                }`}
                data-testid={`address-card-${address.id}`}
              >
                {/* Default Badge */}
                {address.is_default && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Star size={12} fill="currentColor" />
                    <span>{t('addresses.default')}</span>
                  </div>
                )}

                {/* Address Header */}
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getAddressIcon(address.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{address.name}</h3>
                    <p className="text-sm text-gray-600">
                      {address.quartier}, {address.city}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {address.description && (
                  <p className="text-sm text-gray-500 mb-3 pl-13">
                    {address.description}
                  </p>
                )}

                {/* Phone */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <Phone size={14} />
                  <span>{address.phone}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex-1 flex items-center justify-center space-x-1 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      data-testid={`set-default-${address.id}`}
                    >
                      <CheckCircle size={16} />
                      <span>{t('addresses.setDefault')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(address)}
                    className="flex-1 flex items-center justify-center space-x-1 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    data-testid={`edit-${address.id}`}
                  >
                    <Edit2 size={16} />
                    <span>{t('common.edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="flex-1 flex items-center justify-center space-x-1 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    data-testid={`delete-${address.id}`}
                  >
                    <Trash2 size={16} />
                    <span>{t('common.delete')}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default MyAddresses;
