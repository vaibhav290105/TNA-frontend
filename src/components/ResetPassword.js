import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const validatePassword = useCallback((pwd) => {
    const lengthCheck = pwd.length >= 8;
    const numberCheck = /\d/.test(pwd);
    const uppercaseCheck = /[A-Z]/.test(pwd);
    const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return lengthCheck && numberCheck && uppercaseCheck && specialCharCheck;
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    if (message) setMessage('');
  }, [message]);

  const handleConfirmPasswordChange = useCallback((e) => {
    setConfirmPassword(e.target.value);
    if (message) setMessage('');
  }, [message]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setMessage('Please enter a password');
      return;
    }

    if (!validatePassword(password)) {
      setMessage('Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.msg);
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Reset failed');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [password, confirmPassword, token, navigate, validatePassword]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const getPasswordStrength = useCallback((pwd) => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;

    const strengthMap = {
      0: { label: 'Very Weak', color: 'bg-red-500' },
      1: { label: 'Weak', color: 'bg-red-400' },
      2: { label: 'Fair', color: 'bg-yellow-500' },
      3: { label: 'Good', color: 'bg-blue-500' },
      4: { label: 'Strong', color: 'bg-green-500' }
    };

    return { strength, ...strengthMap[strength] };
  }, []);

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 hover:shadow-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
            <span className="text-2xl text-white">🔑</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                placeholder="Enter new password"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-lg">🔒</span>
              </div>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="text-gray-400 hover:text-gray-600 text-lg">
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </button>
            </div>
            
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-lg">🔒</span>
              </div>
            </div>
            
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password.trim() || !confirmPassword.trim() || password !== confirmPassword}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Resetting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🔑 Reset Password
              </span>
            )}
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

export default ResetPassword;