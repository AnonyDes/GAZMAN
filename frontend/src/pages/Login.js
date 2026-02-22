import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

// Logo URL
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_gazman-ecommerce/artifacts/0uv4ea5b_image_d1e9bce8-c09f-42e8-8c73-a8ca1ab5cbab.png';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get redirect path from state or default to /home
  const from = location.state?.from || '/home';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password, formData.rememberMe);
    
    setLoading(false);

    if (result.success) {
      const userRole = result.user?.role || 'client';
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'driver') {
        navigate('/driver');
      } else {
        navigate(from);
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" data-testid="login-page">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-500 hover:text-[#2563EB] mb-4 transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" />
          {language === 'fr' ? 'Retour' : 'Back'}
        </button>

        {/* Logo/Header */}
        <div className="text-center mb-6">
          <img 
            src={LOGO_URL} 
            alt="GAZMAN" 
            className="w-16 h-16 mx-auto mb-3 object-contain rounded-xl"
          />
          <h1 className="text-2xl font-bold text-[#1E3A5F]">GAZMAN</h1>
          <p className="text-gray-500 text-sm mt-1">
            {language === 'fr' ? 'Content de vous revoir!' : 'Welcome back!'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm" data-testid="error-message">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'fr' ? 'Email' : 'Email'}
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

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'fr' ? 'Mot de passe' : 'Password'}
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
                placeholder={language === 'fr' ? 'Votre mot de passe' : 'Your password'}
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB]"
              />
              <span className="ml-2 text-sm text-gray-600">
                {language === 'fr' ? 'Se souvenir' : 'Remember me'}
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium"
            >
              {language === 'fr' ? 'Oublié?' : 'Forgot?'}
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 rounded-xl font-bold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            data-testid="login-button"
          >
            {loading 
              ? (language === 'fr' ? 'Connexion...' : 'Logging in...') 
              : (language === 'fr' ? 'Se connecter' : 'Login')
            }
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-5 text-sm text-gray-600">
          {language === 'fr' ? "Pas de compte?" : "No account?"}{' '}
          <Link to="/register" className="text-[#2563EB] hover:text-[#1D4ED8] font-bold" data-testid="register-link">
            {language === 'fr' ? "S'inscrire" : 'Sign up'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
