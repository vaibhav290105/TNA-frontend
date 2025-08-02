import React, { useState, useCallback } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    if (message) setMessage(''); // Clear message when user starts typing
  }, [message]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const res = await API.post('/auth/request-reset', { email: email.trim() });
      setMessage(res.data.msg);
      setIsSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Failed to send reset link');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const handleBackToLogin = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 hover:shadow-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <span className="text-2xl text-white">🔐</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h2>
          <p className="text-gray-600">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                placeholder="Enter your registered email"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-lg">📧</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                📤 Send Reset Link
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              ← Back to Login
            </span>
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-xl border ${
            isSuccess 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {isSuccess ? '✅' : '❌'}
              </span>
              <p className="text-sm font-medium">{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;