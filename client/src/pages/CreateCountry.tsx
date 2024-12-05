import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  name: string;
  government: string;
  values: string[];
  flag: {
    backgroundColor: string;
    pattern: string;
    patternColor: string;
  };
}

const governmentTypes = [
  'Democracy',
  'Monarchy',
  'Republic',
  'Oligarchy',
  'Theocracy',
  'Socialist',
  'Communist',
  'Dictatorship',
];

const possibleValues = [
  'Freedom',
  'Equality',
  'Justice',
  'Prosperity',
  'Innovation',
  'Tradition',
  'Harmony',
  'Power',
  'Knowledge',
  'Honor',
];

const flagPatterns = [
  { id: 'solid', name: 'Solid' },
  { id: 'stripe', name: 'Horizontal Stripe' },
  { id: 'vertical-stripe', name: 'Vertical Stripe' },
  { id: 'cross', name: 'Cross' },
  { id: 'diagonal', name: 'Diagonal' },
  { id: 'circle', name: 'Circle' },
  { id: 'star', name: 'Star' },
  { id: 'triangle', name: 'Triangle' },
];

const flagColors = [
  { id: 'red', color: '#EF4444', name: 'Red' },
  { id: 'blue', color: '#3B82F6', name: 'Blue' },
  { id: 'green', color: '#10B981', name: 'Green' },
  { id: 'yellow', color: '#F59E0B', name: 'Yellow' },
  { id: 'purple', color: '#8B5CF6', name: 'Purple' },
  { id: 'white', color: '#FFFFFF', name: 'White' },
  { id: 'black', color: '#1F2937', name: 'Black' },
  { id: 'orange', color: '#F97316', name: 'Orange' },
];

const CreateCountry: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    government: '',
    values: [],
    flag: {
      backgroundColor: '#3B82F6',
      pattern: 'solid',
      patternColor: '#FFFFFF',
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleGovernmentChange = (type: string) => {
    setFormData({ ...formData, government: type });
  };

  const handleValueToggle = (value: string) => {
    const newValues = formData.values.includes(value)
      ? formData.values.filter(v => v !== value)
      : [...formData.values, value];
    
    if (newValues.length <= 3) {
      setFormData({ ...formData, values: newValues });
    }
  };

  const handleFlagChange = (field: keyof FormData['flag'], value: string) => {
    setFormData({
      ...formData,
      flag: {
        ...formData.flag,
        [field]: value,
      },
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5003/api/countries', formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create country');
    }
  };

  const renderFlag = () => {
    const { backgroundColor, pattern, patternColor } = formData.flag;
    let patternStyle = {};

    switch (pattern) {
      case 'stripe':
        patternStyle = {
          background: `linear-gradient(180deg, 
            ${backgroundColor} 0%, 
            ${backgroundColor} 40%, 
            ${patternColor} 40%, 
            ${patternColor} 60%, 
            ${backgroundColor} 60%, 
            ${backgroundColor} 100%)`
        };
        break;
      case 'vertical-stripe':
        patternStyle = {
          background: `linear-gradient(90deg, 
            ${backgroundColor} 0%, 
            ${backgroundColor} 40%, 
            ${patternColor} 40%, 
            ${patternColor} 60%, 
            ${backgroundColor} 60%, 
            ${backgroundColor} 100%)`
        };
        break;
      case 'cross':
        patternStyle = {
          backgroundColor,
          backgroundImage: `linear-gradient(0deg, ${patternColor} 45%, transparent 45%, transparent 55%, ${patternColor} 55%),
                           linear-gradient(90deg, ${patternColor} 45%, transparent 45%, transparent 55%, ${patternColor} 55%)`
        };
        break;
      case 'diagonal':
        patternStyle = {
          background: `linear-gradient(45deg, 
            ${backgroundColor} 0%, 
            ${backgroundColor} 45%, 
            ${patternColor} 45%, 
            ${patternColor} 55%, 
            ${backgroundColor} 55%, 
            ${backgroundColor} 100%)`
        };
        break;
      case 'circle':
        patternStyle = {
          backgroundColor,
          position: 'relative',
        };
        return (
          <div style={patternStyle} className="w-full h-full rounded-lg relative overflow-hidden">
            <div
              style={{
                backgroundColor: patternColor,
                width: '40%',
                height: '40%',
                borderRadius: '50%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        );
      case 'star':
        patternStyle = {
          backgroundColor,
          position: 'relative',
        };
        return (
          <div style={patternStyle} className="w-full h-full rounded-lg relative overflow-hidden">
            <div
              style={{
                color: patternColor,
                fontSize: '4rem',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              ★
            </div>
          </div>
        );
      case 'triangle':
        patternStyle = {
          backgroundColor,
          position: 'relative',
        };
        return (
          <div style={patternStyle} className="w-full h-full rounded-lg relative overflow-hidden">
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '50px solid transparent',
                borderRight: '50px solid transparent',
                borderBottom: `100px solid ${patternColor}`,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        );
      default:
        patternStyle = { backgroundColor };
    }

    return <div style={patternStyle} className="w-full h-full rounded-lg" />;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">Design Your Flag</h3>
            <p className="text-gray-300 mb-6">
              Create a unique flag that represents your nation's identity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="aspect-w-3 aspect-h-2 mb-6">
                  <div className="w-full h-full bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                    {renderFlag()}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Background Color
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {flagColors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => handleFlagChange('backgroundColor', color.color)}
                          className={`w-full aspect-w-1 aspect-h-1 rounded-lg border-2 transition-all duration-200 ${
                            formData.flag.backgroundColor === color.color
                              ? 'border-indigo-500 scale-110'
                              : 'border-transparent hover:border-gray-400'
                          }`}
                        >
                          <div
                            className="rounded-md"
                            style={{ backgroundColor: color.color }}
                            title={color.name}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pattern
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {flagPatterns.map((pattern) => (
                        <button
                          key={pattern.id}
                          onClick={() => handleFlagChange('pattern', pattern.id)}
                          className={`p-2 rounded-lg border text-sm transition-all duration-200 ${
                            formData.flag.pattern === pattern.id
                              ? 'border-indigo-500 bg-indigo-500 bg-opacity-20 text-white'
                              : 'border-gray-600 text-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {pattern.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {formData.flag.pattern !== 'solid' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Pattern Color
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {flagColors.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => handleFlagChange('patternColor', color.color)}
                            className={`w-full aspect-w-1 aspect-h-1 rounded-lg border-2 transition-all duration-200 ${
                              formData.flag.patternColor === color.color
                                ? 'border-indigo-500 scale-110'
                                : 'border-transparent hover:border-gray-400'
                            }`}
                          >
                            <div
                              className="rounded-md"
                              style={{ backgroundColor: color.color }}
                              title={color.name}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">Name Your Nation</h3>
            <p className="text-gray-300 mb-6">
              Choose a unique name that reflects your nation's identity.
            </p>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Nation Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                className="mt-1 block w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter your nation's name"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">Choose Government Type</h3>
            <p className="text-gray-300 mb-6">
              Select the form of government that will lead your nation.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {governmentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleGovernmentChange(type)}
                  className={`p-4 rounded-lg border ${
                    formData.government === type
                      ? 'border-indigo-500 bg-indigo-500 bg-opacity-20'
                      : 'border-gray-600 hover:border-indigo-400'
                  } transition-colors duration-200`}
                >
                  <p className="font-medium text-white">{type}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">Select National Values</h3>
            <p className="text-gray-300 mb-6">
              Choose up to 3 core values that define your nation's principles.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {possibleValues.map((value) => (
                <button
                  key={value}
                  onClick={() => handleValueToggle(value)}
                  className={`p-4 rounded-lg border ${
                    formData.values.includes(value)
                      ? 'border-indigo-500 bg-indigo-500 bg-opacity-20'
                      : 'border-gray-600 hover:border-indigo-400'
                  } transition-colors duration-200`}
                  disabled={formData.values.length >= 3 && !formData.values.includes(value)}
                >
                  <p className="font-medium text-white">{value}</p>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
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

        {/* Form */}
        <div className="relative z-10 max-w-2xl mx-auto pt-20 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4].map((number) => (
                  <div key={number} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= number
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {number}
                    </div>
                    {number < 4 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          step > number ? 'bg-indigo-500' : 'bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded relative mb-6">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {renderStep()}

            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border border-gray-600 rounded-lg text-white hover:border-indigo-400 transition-colors duration-200"
                >
                  Back
                </button>
              )}
              <div className="ml-auto">
                {step < 4 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={
                      (step === 2 && !formData.name) ||
                      (step === 3 && !formData.government)
                    }
                    className="px-6 py-3 bg-indigo-500 rounded-lg text-white hover:bg-indigo-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={formData.values.length === 0}
                    className="px-6 py-3 bg-indigo-500 rounded-lg text-white hover:bg-indigo-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Nation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCountry; 