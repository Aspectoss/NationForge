import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { login, forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setResetEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-transparent py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 
                onClick={() => navigate('/')} 
                className="text-3xl font-bold text-white drop-shadow-lg cursor-pointer"
              >
                Nation<span className="text-indigo-400">Forge</span>
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
        </div>

        {/* Login/Forgot Password Form */}
        <div className="relative z-10 max-w-md mx-auto pt-20 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-purple-300">
                {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
              </h2>
              <p className="mt-2 text-gray-300">
                {showForgotPassword 
                  ? 'Enter your email to receive reset instructions' 
                  : "Sign in to continue your nation's journey"}
              </p>
            </div>

            {resetEmailSent ? (
              <div className="text-center">
                <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded relative mb-6">
                  Check your email for password reset instructions
                </div>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Return to login
                </button>
              </div>
            ) : (
              <form onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter your email"
                  />
                </div>

                {!showForgotPassword && (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter your password"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-800"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                          Remember me
                        </label>
                      </div>

                      <div className="text-sm">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="font-medium text-indigo-400 hover:text-indigo-300"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading 
                      ? (showForgotPassword ? 'Sending...' : 'Signing in...') 
                      : (showForgotPassword ? 'Send Reset Link' : 'Sign in')}
                  </button>
                </div>
              </form>
            )}

            {!showForgotPassword && !resetEmailSent && (
              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Create account
                  </button>
                </p>
              </div>
            )}

            {showForgotPassword && !resetEmailSent && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Back to login
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;