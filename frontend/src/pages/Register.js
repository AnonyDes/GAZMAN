import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    state: '',
    password: '',
    confirmPassword: '',
    language: 'fr'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation rules
  const passwordRules = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const isPasswordValid = Object.values(passwordRules).every(rule => rule);
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
        ? 'Le mot de passe ne répond pas à toutes les exigences' 
        : 'Password does not meet all requirements');
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

  const RuleIndicator = ({ met, text }) => (
    <div className="flex items-center space-x-2 text-sm">
      {met ? (
        <Check size={16} className="text-green-500" />
      ) : (
        <X size={16} className="text-gray-400" />
      )}
      <span className={met ? 'text-green-600' : 'text-gray-500'}>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F357F] via-[#007DFF] to-[#0F357F] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 my-8" data-testid="register-page">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-500 hover:text-[#0F357F] mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          {language === 'fr' ? 'Retour' : 'Back'}
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFC800] to-[#FFD84D] rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl">🔥</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0F357F]">
            {language === 'fr' ? 'Créer un compte' : 'Create Account'}
          </h1>
          <p className="text-gray-600 mt-2">
            {language === 'fr' ? 'Rejoignez GAZ MAN aujourd\'hui' : 'Join GAZ MAN today'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4" data-testid="error-message">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'fr' ? 'Nom complet' : 'Full Name'} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none transition-all"
              placeholder="Jean Dupont"
              data-testid="name-input"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'fr' ? 'Adresse Email' : 'Email Address'} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none transition-all"
              placeholder="votre@email.com"
              data-testid="email-input"
            />
          </div>

          {/* Address and State in two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'fr' ? 'Adresse' : 'Physical Address'}
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none transition-all"
                placeholder={language === 'fr' ? 'Bastos, Yaoundé' : '123 Main Street'}
                data-testid="address-input"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'fr' ? 'Région' : 'State/Region'}
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none transition-all"
                placeholder={language === 'fr' ? 'Centre' : 'NY'}
                data-testid="state-input"
              />
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label htmlFor="language" className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'fr' ? 'Langue préférée' : 'Preferred Language'}
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none transition-all"
              data-testid="language-select"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none pr-12 transition-all"
                placeholder={language === 'fr' ? 'Créez un mot de passe fort' : 'Create a strong password'}
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
          </div>

          {/* Password Requirements */}
          {formData.password && (
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {language === 'fr' ? 'Exigences du mot de passe:' : 'Password Requirements:'}
              </p>
              <RuleIndicator met={passwordRules.minLength} text={language === 'fr' ? 'Au moins 8 caractères' : 'At least 8 characters'} />
              <RuleIndicator met={passwordRules.hasUpperCase} text={language === 'fr' ? 'Une lettre majuscule' : 'One uppercase letter'} />
              <RuleIndicator met={passwordRules.hasLowerCase} text={language === 'fr' ? 'Une lettre minuscule' : 'One lowercase letter'} />
              <RuleIndicator met={passwordRules.hasNumber} text={language === 'fr' ? 'Un chiffre' : 'One number'} />
              <RuleIndicator met={passwordRules.hasSpecialChar} text={language === 'fr' ? 'Un caractère spécial' : 'One special character'} />
            </div>
          )}

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm Password'} *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#007DFF] focus:border-transparent outline-none pr-12 transition-all"
                placeholder={language === 'fr' ? 'Confirmez votre mot de passe' : 'Confirm your password'}
                data-testid="confirm-password-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && (
              <div className="mt-2">
                {passwordsMatch ? (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Check size={16} />
                    <span>{language === 'fr' ? 'Les mots de passe correspondent' : 'Passwords match'}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <X size={16} />
                    <span>{language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading || !isPasswordValid || !passwordsMatch}
            className="w-full bg-[#0F357F] hover:bg-[#007DFF] text-white py-4 rounded-xl font-bold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-6 shadow-lg"
            data-testid="register-button"
          >
            {loading 
              ? (language === 'fr' ? 'Création en cours...' : 'Creating Account...') 
              : (language === 'fr' ? 'Créer mon compte' : 'Create Account')
            }
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          {language === 'fr' ? 'Vous avez déjà un compte?' : 'Already have an account?'}{' '}
          <Link to="/login" className="text-[#0F357F] hover:text-[#007DFF] font-bold" data-testid="login-link">
            {language === 'fr' ? 'Se connecter' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
