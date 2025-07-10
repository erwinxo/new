import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import { UserPlus, LogIn, Key, Users } from 'lucide-react';

const LoginPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentForm, setCurrentForm] = useState<'login' | 'signup' | 'forgot'>(() => {
    const path = location.pathname;
    if (path === '/signup') return 'signup';
    if (path === '/forgot-password') return 'forgot';
    return 'login';
  });

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleFormChange = (form: 'login' | 'signup' | 'forgot') => {
    setCurrentForm(form);
    navigate(`/${form === 'login' ? 'login' : form === 'signup' ? 'signup' : 'forgot-password'}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {currentForm === 'login' && 'Welcome Back'}
            {currentForm === 'signup' && 'Join Our Community'}
            {currentForm === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-gray-600">
            {currentForm === 'login' && 'Sign in to your account to continue'}
            {currentForm === 'signup' && 'Create your account to get started'}
            {currentForm === 'forgot' && 'Enter your email to reset your password'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Form Tabs */}
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleFormChange('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                currentForm === 'login'
                  ? 'bg-[#CF8BA9] text-white shadow-sm hover:bg-[#b97a97]'
                  : 'text-gray-600 hover:bg-[#CF8BA9] hover:text-white'
              }`}
            >
              <LogIn className="h-4 w-4" /
              Sign In
            </button>
            <button
              onClick={() => handleFormChange('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                currentForm === 'signup'
                  ? 'bg-[#CF8BA9] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#CF8BA9]'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </button>
          </div>

          {/* Forms */}
          {currentForm === 'login' && <LoginForm onForgotPassword={() => handleFormChange('forgot')} />}
          {currentForm === 'signup' && <SignupForm onSwitchToLogin={() => handleFormChange('login')} />}
          {currentForm === 'forgot' && <ForgotPasswordForm onBackToLogin={() => handleFormChange('login')} />}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;