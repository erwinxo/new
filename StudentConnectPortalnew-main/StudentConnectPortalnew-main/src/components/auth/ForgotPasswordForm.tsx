import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { apiService } from '../../services/api';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to send reset email:', error);
      // Still show success message for security
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-600">
            Password reset instructions have been sent to your email address.
          </p>
        </div>
        <p className="text-sm text-gray-600">
          Check your inbox and follow the instructions to reset your password.
        </p>
        <button
          onClick={onBackToLogin}
          className="flex items-center justify-center gap-2 text-pink-500 hover:text-blue-800 font-medium text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            placeholder="Enter your email address"
          />
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-pink-500 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? <LoadingSpinner /> : 'Send Reset Instructions'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center justify-center gap-2 text-pink-500 hover:text-pink-700 font-medium text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;