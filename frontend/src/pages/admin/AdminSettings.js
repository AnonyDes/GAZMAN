import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import axios from 'axios';
import { Save, RotateCcw, Settings, AlertCircle, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default settings
const defaultSettings = {
  hero_title: 'Votre gaz livré en un clic',
  hero_subtitle: 'Commandez votre bouteille de gaz et recevez-la chez vous en moins de 30 minutes, partout à Yaoundé et Douala.',
  hero_cta: 'Commander maintenant',
  promo_title: 'Livraison Express',
  promo_subtitle: 'Livraison gratuite pour toute commande supérieure à 20 000 FCFA',
  service_hours: 'Lun - Dim, 8h00 - 22h00'
};

const AdminSettings = () => {
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      if (response.data) {
        setSettings({ ...defaultSettings, ...response.data });
      }
    } catch (error) {
      console.log('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(`${API}/admin/site-settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({
        type: 'success',
        text: language === 'fr' ? 'Paramètres enregistrés avec succès!' : 'Settings saved successfully!'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({
        type: 'error',
        text: language === 'fr' ? 'Erreur lors de l\'enregistrement' : 'Error saving settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(language === 'fr' 
      ? 'Êtes-vous sûr de vouloir réinitialiser aux valeurs par défaut?' 
      : 'Are you sure you want to reset to default values?')) {
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.delete(`${API}/admin/site-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(defaultSettings);
      setMessage({
        type: 'success',
        text: language === 'fr' ? 'Paramètres réinitialisés!' : 'Settings reset to defaults!'
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      setMessage({
        type: 'error',
        text: language === 'fr' ? 'Erreur lors de la réinitialisation' : 'Error resetting settings'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'fr' ? 'Paramètres du Site' : 'Site Settings'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'fr' 
              ? 'Personnalisez le contenu de la page d\'accueil'
              : 'Customize the homepage content'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RotateCcw size={18} />
            <span>{language === 'fr' ? 'Réinitialiser' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFC800] to-[#FFD84D] rounded-xl flex items-center justify-center">
              <Settings size={20} className="text-[#0F357F]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'fr' ? 'Section Hero' : 'Hero Section'}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'fr' ? 'Titre principal' : 'Main Title'}
              </label>
              <input
                type="text"
                name="hero_title"
                value={settings.hero_title}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none transition-all"
                placeholder={defaultSettings.hero_title}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'fr' ? 'Sous-titre' : 'Subtitle'}
              </label>
              <textarea
                name="hero_subtitle"
                value={settings.hero_subtitle}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none transition-all resize-none"
                placeholder={defaultSettings.hero_subtitle}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'fr' ? 'Texte du bouton CTA' : 'CTA Button Text'}
              </label>
              <input
                type="text"
                name="hero_cta"
                value={settings.hero_cta}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none transition-all"
                placeholder={defaultSettings.hero_cta}
              />
            </div>
          </div>
        </div>

        {/* Promo Banner Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0F357F] to-[#007DFF] rounded-xl flex items-center justify-center">
              <Settings size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'fr' ? 'Bannière Promotionnelle' : 'Promo Banner'}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'fr' ? 'Titre de la promo' : 'Promo Title'}
              </label>
              <input
                type="text"
                name="promo_title"
                value={settings.promo_title}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none transition-all"
                placeholder={defaultSettings.promo_title}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'fr' ? 'Description de la promo' : 'Promo Description'}
              </label>
              <textarea
                name="promo_subtitle"
                value={settings.promo_subtitle}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none transition-all resize-none"
                placeholder={defaultSettings.promo_subtitle}
              />
            </div>
          </div>
        </div>

        {/* Service Hours Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Settings size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'fr' ? 'Heures de Service' : 'Service Hours'}
            </h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'fr' ? 'Horaires d\'ouverture' : 'Opening Hours'}
            </label>
            <input
              type="text"
              name="service_hours"
              value={settings.service_hours}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none transition-all"
              placeholder={defaultSettings.service_hours}
            />
            <p className="text-sm text-gray-500 mt-2">
              {language === 'fr' 
                ? 'Exemple: Lun - Dim, 8h00 - 22h00'
                : 'Example: Mon - Sun, 8am - 10pm'}
            </p>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            {language === 'fr' ? 'Aperçu' : 'Preview'}
          </h3>
          <div className="bg-gradient-to-r from-[#0F357F] to-[#007DFF] rounded-xl p-6 text-center">
            <h4 className="text-2xl font-bold text-white mb-2">{settings.hero_title}</h4>
            <p className="text-blue-100 mb-4 text-sm">{settings.hero_subtitle}</p>
            <button className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg font-bold text-sm">
              {settings.hero_cta}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-[#0F357F] hover:bg-[#007DFF] text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            <span>{saving 
              ? (language === 'fr' ? 'Enregistrement...' : 'Saving...') 
              : (language === 'fr' ? 'Enregistrer' : 'Save Changes')
            }</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
