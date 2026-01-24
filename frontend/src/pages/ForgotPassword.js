import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await forgotPassword(email);
    
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      // For MVP, we're showing the reset token
      setResetToken(result.data.reset_token);
    } else {
      setError(result.error);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8" data-testid="reset-email-sent">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Check Your Email
          </h2>
          <p className="text-center text-gray-600 mb-6">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>

          {/* For MVP - Show reset token */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 font-medium mb-2">Reset Token (for testing):</p>
            <code className="text-xs bg-white p-2 rounded block break-all" data-testid="reset-token">
              {resetToken}
            </code>
          </div>

          {/* Actions */}
          <Link
            to={`/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`}
            className="w-full block text-center bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors mb-3"
            data-testid="reset-password-link"
          >
            Reset Password Now
          </Link>
          <Link
            to="/login"
            className="w-full block text-center text-blue-900 hover:text-orange-500 font-medium"
            data-testid="back-to-login"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8" data-testid="forgot-password-page">
        {/* Back Button */}
        <Link
          to="/login"
          className="inline-flex items-center text-gray-600 hover:text-blue-900 mb-6"
          data-testid="back-button"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Login
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">
            Enter your email and we'll send you instructions to reset your password
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="your@email.com"
              data-testid="email-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            data-testid="submit-button"
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
