import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

// Logo URL
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_gazman-ecommerce/artifacts/0uv4ea5b_image_d1e9bce8-c09f-42e8-8c73-a8ca1ab5cbab.png';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple password validation - just 6+ characters
  const isPasswordValid = formData.password.length >= 6;
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError(language === 'fr' 
        ? 'Le mot de passe doit contenir au moins 6 caractères' 
        : 'Password must be at least 6 characters');
      return;
    }

    if (!passwordsMatch) {
      setError(language === 'fr' 
        ? 'Les mots de passe ne correspondent pas' 
        : 'Passwords do not match');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);
    
    setLoading(false);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" data-testid="register-page">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-500 hover:text-[#2563EB] mb-4 transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" />
          {language === 'fr' ? 'Retour' : 'Back'}
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <img 
            src={LOGO_URL} 
            alt="GAZMAN" 
            className="w-16 h-16 mx-auto mb-3 object-contain rounded-xl"
          />
          <h1 className="text-2xl font-bold text-[#1E3A5F]">
            {language === 'fr' ? 'Créer un compte' : 'Create Account'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {language === 'fr' ? 'Rejoignez GAZMAN' : 'Join GAZMAN'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm" data-testid="error-message">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'fr' ? 'Nom complet' : 'Full Name'} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              placeholder="Jean Dupont"
              data-testid="name-input"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'fr' ? 'Email' : 'Email'} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              placeholder="votre@email.com"
              data-testid="email-input"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'fr' ? 'Téléphone' : 'Phone'}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              placeholder="+237 6XX XXX XXX"
              data-testid="phone-input"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'fr' ? 'Mot de passe' : 'Password'} *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none pr-12 transition-all"
                placeholder={language === 'fr' ? 'Min. 6 caractères' : 'Min. 6 characters'}
                data-testid="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && formData.password.length < 6 && (
              <p className="text-xs text-orange-500 mt-1">
                {language === 'fr' ? 'Minimum 6 caractères' : 'Minimum 6 characters'}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'fr' ? 'Confirmer' : 'Confirm'} *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              placeholder={language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
              data-testid="confirm-password-input"
            />
            {formData.confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500 mt-1">
                {language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading || !isPasswordValid || !passwordsMatch}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 rounded-xl font-bold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
            data-testid="register-button"
          >
            {loading 
              ? (language === 'fr' ? 'Création...' : 'Creating...') 
              : (language === 'fr' ? 'Créer mon compte' : 'Create Account')
            }
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-5 text-sm text-gray-600">
          {language === 'fr' ? 'Déjà un compte?' : 'Already have an account?'}{' '}
          <Link to="/login" className="text-[#2563EB] hover:text-[#1D4ED8] font-bold" data-testid="login-link">
            {language === 'fr' ? 'Se connecter' : 'Login'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
