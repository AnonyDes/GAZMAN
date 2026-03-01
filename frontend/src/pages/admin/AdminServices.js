import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X,
  Image,
  GripVertical,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Available categories for services
const CATEGORIES = [
  { value: 'domestic', label_fr: 'Gaz Domestique', label_en: 'Domestic Gas' },
  { value: 'industrial', label_fr: 'Gaz Industriel', label_en: 'Industrial Gas' },
  { value: 'refill', label_fr: 'Recharge', label_en: 'Refill' },
  { value: 'rental', label_fr: 'Location', label_en: 'Rental' },
  { value: 'installation', label_fr: 'Installation', label_en: 'Installation' },
  { value: 'emergency', label_fr: 'Urgence', label_en: 'Emergency' },
];

const AdminServices = () => {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name_fr: '',
    name_en: '',
    description_fr: '',
    description_en: '',
    category: 'domestic',
    icon: '',
    image_url: '',
    is_active: true
  });

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data.services || []);
      setError(null);
    } catch (err) {
      setError(language === 'fr' ? 'Erreur lors du chargement des services' : 'Error loading services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  }, [language, token]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const resetForm = () => {
    setFormData({
      name_fr: '',
      name_en: '',
      description_fr: '',
      description_en: '',
      category: 'domestic',
      icon: '',
      image_url: '',
      is_active: true
    });
    setEditingService(null);
    setIsCreating(false);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name_fr: service.name_fr || '',
      name_en: service.name_en || '',
      description_fr: service.description_fr || '',
      description_en: service.description_en || '',
      category: service.category || 'domestic',
      icon: service.icon || '',
      image_url: service.image_url || '',
      is_active: service.is_active !== false
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formData.name_fr || !formData.name_en) {
      setError(language === 'fr' ? 'Le nom est requis en français et en anglais' : 'Name is required in French and English');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isCreating) {
        await axios.post(`${API}/admin/services`, formData, config);
      } else if (editingService) {
        await axios.put(`${API}/admin/services/${editingService.id}`, formData, config);
      }

      await fetchServices();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || (language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving service'));
      console.error('Error saving service:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer ce service ?' : 'Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await axios.delete(`${API}/admin/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchServices();
    } catch (err) {
      setError(err.response?.data?.detail || (language === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting service'));
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await axios.put(`${API}/admin/services/${service.id}`, 
        { is_active: !service.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchServices();
    } catch (err) {
      setError(err.response?.data?.detail || (language === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating service'));
    }
  };

  const getCategoryLabel = (value) => {
    const cat = CATEGORIES.find(c => c.value === value);
    return cat ? (language === 'fr' ? cat.label_fr : cat.label_en) : value;
  };

  return (
    <div className="space-y-6" data-testid="admin-services-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="services-page-title">
            {language === 'fr' ? 'Gestion des Services' : 'Service Management'}
          </h1>
          <p className="text-gray-500 mt-1">
            {language === 'fr' 
              ? 'Gérez les services affichés sur la page d\'accueil'
              : 'Manage services displayed on the homepage'}
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating || editingService}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          data-testid="add-service-btn"
        >
          <Plus size={20} />
          <span>{language === 'fr' ? 'Ajouter un service' : 'Add Service'}</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3" data-testid="error-alert">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingService) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="service-form">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isCreating 
                ? (language === 'fr' ? 'Nouveau Service' : 'New Service')
                : (language === 'fr' ? 'Modifier le Service' : 'Edit Service')}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* French Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'Nom (Français)' : 'Name (French)'} *
              </label>
              <input
                type="text"
                value={formData.name_fr}
                onChange={(e) => setFormData({...formData, name_fr: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Recharge Gaz"
                data-testid="input-name-fr"
              />
            </div>

            {/* English Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'Nom (Anglais)' : 'Name (English)'} *
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Gas Refill"
                data-testid="input-name-en"
              />
            </div>

            {/* French Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'Description (Français)' : 'Description (French)'}
              </label>
              <textarea
                value={formData.description_fr}
                onChange={(e) => setFormData({...formData, description_fr: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Description en français..."
                data-testid="input-desc-fr"
              />
            </div>

            {/* English Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'Description (Anglais)' : 'Description (English)'}
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Description in English..."
                data-testid="input-desc-en"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'Catégorie' : 'Category'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="select-category"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {language === 'fr' ? cat.label_fr : cat.label_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'Icône (emoji)' : 'Icon (emoji)'}
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="🔥"
                data-testid="input-icon"
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'fr' ? 'URL de l\'image' : 'Image URL'}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-image-url"
                />
                {formData.image_url && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'fr' 
                  ? 'Entrez l\'URL d\'une image hébergée (recommandé: 400x400px)'
                  : 'Enter the URL of a hosted image (recommended: 400x400px)'}
              </p>
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  data-testid="checkbox-active"
                />
                <span className="text-sm font-medium text-gray-700">
                  {language === 'fr' ? 'Service actif (visible sur la page d\'accueil)' : 'Service active (visible on homepage)'}
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              data-testid="cancel-btn"
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              data-testid="save-service-btn"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{language === 'fr' ? 'Enregistrer' : 'Save'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200" data-testid="services-list">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Services existants' : 'Existing Services'}
            <span className="ml-2 text-sm font-normal text-gray-500">({services.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center">
            <Image size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {language === 'fr' ? 'Aucun service créé' : 'No services created'}
            </p>
            <button
              onClick={handleCreate}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              {language === 'fr' ? 'Créer votre premier service' : 'Create your first service'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {services.map((service) => (
              <div
                key={service.id}
                className={`p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors ${!service.is_active ? 'opacity-60' : ''}`}
                data-testid={`service-item-${service.id}`}
              >
                {/* Drag Handle (visual only for now) */}
                <div className="text-gray-300 cursor-grab">
                  <GripVertical size={20} />
                </div>

                {/* Image/Icon */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {service.image_url ? (
                    <img 
                      src={service.image_url} 
                      alt={service.name_fr}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{service.icon || '🔥'}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {language === 'fr' ? service.name_fr : service.name_en}
                    </h3>
                    {!service.is_active && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                        {language === 'fr' ? 'Inactif' : 'Inactive'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {getCategoryLabel(service.category)}
                  </p>
                  {(service.description_fr || service.description_en) && (
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {language === 'fr' ? service.description_fr : service.description_en}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`p-2 rounded-lg transition-colors ${
                      service.is_active 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={service.is_active 
                      ? (language === 'fr' ? 'Désactiver' : 'Deactivate')
                      : (language === 'fr' ? 'Activer' : 'Activate')}
                    data-testid={`toggle-active-${service.id}`}
                  >
                    {service.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={language === 'fr' ? 'Modifier' : 'Edit'}
                    data-testid={`edit-service-${service.id}`}
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={language === 'fr' ? 'Supprimer' : 'Delete'}
                    data-testid={`delete-service-${service.id}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          {language === 'fr' ? 'Comment ça marche ?' : 'How does it work?'}
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>{language === 'fr' 
            ? 'Les services actifs sont affichés sur la page d\'accueil publique'
            : 'Active services are displayed on the public homepage'}</li>
          <li>{language === 'fr'
            ? 'Cliquer sur un service redirige vers les produits de cette catégorie'
            : 'Clicking a service redirects to products in that category'}</li>
          <li>{language === 'fr'
            ? 'Vous pouvez utiliser une URL d\'image externe ou un emoji comme icône'
            : 'You can use an external image URL or an emoji as an icon'}</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminServices;
