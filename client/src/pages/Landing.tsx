import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-transparent py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Nation<span className="text-indigo-400">Forge</span>
              </h1>
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto pt-20 pb-24 px-4 sm:pt-28 sm:pb-32 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-purple-300 mb-8 drop-shadow-xl">
            Forge Your Legacy
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300 leading-relaxed">
            Build, govern, and expand your nation in this immersive strategy game. 
            Shape your country's destiny through diplomacy, economics, and cultural influence.
          </p>
          <div className="mt-12 flex justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center px-8 py-4 border-2 border-indigo-500 bg-indigo-500 hover:bg-indigo-600 hover:border-indigo-600 text-white rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-8 py-4 border-2 border-indigo-300 hover:border-indigo-400 text-indigo-300 hover:text-indigo-400 rounded-lg text-lg font-semibold transition-all duration-200"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* Build Your Nation */}
            <div className="group relative bg-gray-800 bg-opacity-50 p-8 rounded-2xl hover:bg-opacity-70 transition-all duration-200 transform hover:-translate-y-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
              <div className="relative">
                <div className="h-12 w-12 bg-indigo-500 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Build Your Nation</h3>
                <p className="text-gray-300">
                  Design your flag, choose your government type, and establish your nation's core values and principles.
                </p>
              </div>
            </div>

            {/* Manage Resources */}
            <div className="group relative bg-gray-800 bg-opacity-50 p-8 rounded-2xl hover:bg-opacity-70 transition-all duration-200 transform hover:-translate-y-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
              <div className="relative">
                <div className="h-12 w-12 bg-blue-500 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Manage Resources</h3>
                <p className="text-gray-300">
                  Balance your economy, population growth, and environmental sustainability to create a prosperous nation.
                </p>
              </div>
            </div>

            {/* Forge Alliances */}
            <div className="group relative bg-gray-800 bg-opacity-50 p-8 rounded-2xl hover:bg-opacity-70 transition-all duration-200 transform hover:-translate-y-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
              <div className="relative">
                <div className="h-12 w-12 bg-purple-500 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Forge Alliances</h3>
                <p className="text-gray-300">
                  Engage in diplomacy, establish trade routes, and form powerful alliances with other nations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 bg-opacity-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            © 2024 NationForge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 