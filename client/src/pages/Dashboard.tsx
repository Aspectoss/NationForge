import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import FlagEditor, { renderFlag } from '../components/FlagEditor';
import Buildings from '../components/Buildings';

interface Country {
  _id: string;
  name: string;
  government: string;
  values: string[];
  flag: {
    backgroundColor: string;
    pattern: string;
    patternColor: string;
  };
  resources: {
    population: number;
    economy: number;
    environment: number;
  };
  buildings: Array<{
    type: string;
    count: number;
  }>;
  constructionQueue: Array<{
    buildingType: string;
    startedAt: string;
    completesAt: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingFlag, setIsEditingFlag] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [error, setError] = useState('');
  const [production, setProduction] = useState<{
    population: number;
    economy: number;
    environment: number;
  } | null>(null);

  const fetchCountry = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/countries/my-country');
      setCountry(response.data);
      
      // Calculate production rates
      const productionResponse = await axios.get('http://localhost:5000/api/countries/production');
      setProduction(productionResponse.data);
    } catch (error) {
      console.error('Failed to fetch country:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.hasCountry) {
      fetchCountry();
      const interval = setInterval(fetchCountry, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user?.hasCountry]);

  const handleFlagUpdate = async (newFlag: Country['flag']) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/countries/${country?._id}`, {
        flag: newFlag,
      });
      setCountry(response.data);
      setIsEditingFlag(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update flag');
    }
  };

  const handleDeleteCountry = async () => {
    if (!country || deleteConfirmation !== country.name) {
      setError('Please type your country name correctly to confirm deletion');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/countries/${country._id}`);
      window.location.reload();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete country');
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
      <nav className="bg-gray-900 bg-opacity-50 shadow border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-white">
                  Nation<span className="text-indigo-400">Forge</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-white">Loading...</div>
          </div>
        ) : !country ? (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Your Nation Dashboard</h2>
                <p className="text-gray-300 mb-6">You haven't created your nation yet!</p>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
                  onClick={() => navigate('/create-country')}
                >
                  Create Your Nation
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl">
              {/* Header with flag */}
              <div className="border-b border-gray-800 px-6 py-4">
                <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <div className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                      {renderFlag(country.flag)}
                    </div>
                    <button
                      onClick={() => setIsEditingFlag(!isEditingFlag)}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
                    >
                      <span className="text-white text-sm font-medium">Edit Flag</span>
                    </button>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{country.name}</h2>
                    <p className="text-gray-300 text-lg">{country.government}</p>
                  </div>
                </div>
              </div>

              {/* Flag Editor */}
              {isEditingFlag && (
                <div className="border-b border-gray-800 px-6 py-4">
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Edit Flag</h3>
                    <button
                      onClick={() => setIsEditingFlag(false)}
                      className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                  <FlagEditor
                    flag={country.flag}
                    onChange={handleFlagUpdate}
                  />
                </div>
              )}

              {/* Stats Grid */}
              <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Population */}
                <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-400 truncate">Population</dt>
                    <dd className="mt-1 text-3xl font-semibold text-white">
                      {formatNumber(country.resources.population)}
                    </dd>
                    {production && (
                      <div className="mt-2 text-sm">
                        <span className={production.population >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {production.population > 0 ? '+' : ''}{formatNumber(production.population)}/hour
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Economy */}
                <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-400 truncate">Economy</dt>
                    <dd className="mt-1 text-3xl font-semibold text-white">
                      ${formatNumber(country.resources.economy)}
                    </dd>
                    {production && (
                      <div className="mt-2 text-sm">
                        <span className={production.economy >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {production.economy > 0 ? '+' : ''}${formatNumber(production.economy)}/hour
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Environment */}
                <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-400 truncate">Environment</dt>
                    <dd className="mt-1 text-3xl font-semibold text-white">
                      {country.resources.environment}%
                    </dd>
                    {production && (
                      <div className="mt-2 text-sm">
                        <span className={production.environment >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {production.environment > 0 ? '+' : ''}{production.environment}%/hour
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Values */}
              <div className="border-t border-gray-800 px-6 py-4">
                <h3 className="text-lg font-medium text-white mb-3">National Values</h3>
                <div className="flex flex-wrap gap-2">
                  {country.values.map((value) => (
                    <span
                      key={value}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-900 text-indigo-200"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>

              {/* Buildings */}
              <div className="border-t border-gray-800 px-6 py-4">
                <h3 className="text-lg font-medium text-white mb-4">Buildings</h3>
                <Buildings
                  onUpdate={fetchCountry}
                  resources={country.resources}
                />
              </div>

              {/* Delete Country */}
              <div className="border-t border-gray-800 px-6 py-4">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-200"
                >
                  Delete Country
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-gray-900 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-800">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    Delete Country
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-300">
                      This action cannot be undone. To confirm, please type your country name:
                      <span className="font-bold text-white"> {country?.name}</span>
                    </p>
                    {error && (
                      <p className="mt-2 text-sm text-red-400">{error}</p>
                    )}
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="mt-4 block w-full bg-gray-800 border border-gray-700 rounded-lg shadow-sm px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Type country name to confirm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleDeleteCountry}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm transition-colors duration-200"
                >
                  Delete Country
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                    setError('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-700 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 