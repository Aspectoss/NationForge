import React from 'react';

export interface FlagData {
  backgroundColor: string;
  pattern: string;
  patternColor: string;
}

interface FlagEditorProps {
  flag: FlagData;
  onChange: (flag: FlagData) => void;
  className?: string;
}

export const flagPatterns = [
  { id: 'solid', name: 'Solid' },
  { id: 'stripe', name: 'Horizontal Stripe' },
  { id: 'vertical-stripe', name: 'Vertical Stripe' },
  { id: 'cross', name: 'Cross' },
  { id: 'diagonal', name: 'Diagonal' },
  { id: 'circle', name: 'Circle' },
  { id: 'star', name: 'Star' },
  { id: 'triangle', name: 'Triangle' },
];

export const flagColors = [
  { id: 'red', color: '#EF4444', name: 'Red' },
  { id: 'blue', color: '#3B82F6', name: 'Blue' },
  { id: 'green', color: '#10B981', name: 'Green' },
  { id: 'yellow', color: '#F59E0B', name: 'Yellow' },
  { id: 'purple', color: '#8B5CF6', name: 'Purple' },
  { id: 'white', color: '#FFFFFF', name: 'White' },
  { id: 'black', color: '#1F2937', name: 'Black' },
  { id: 'orange', color: '#F97316', name: 'Orange' },
];

export const renderFlag = (flag: FlagData) => {
  const { backgroundColor, pattern, patternColor } = flag;
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

const FlagEditor: React.FC<FlagEditorProps> = ({ flag, onChange, className = '' }) => {
  const handleFlagChange = (field: keyof FlagData, value: string) => {
    onChange({
      ...flag,
      [field]: value,
    });
  };

  return (
    <div className={`space-y-8 bg-gray-900 p-6 rounded-lg ${className}`}>
      {/* Flag Preview */}
      <div className="relative w-full h-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        {renderFlag(flag)}
      </div>

      {/* Color and Pattern Controls */}
      <div className="space-y-8">
        {/* Background Color */}
        <div>
          <label className="block text-xl font-bold text-white mb-4">
            Background Color
          </label>
          <div className="grid grid-cols-8 gap-4">
            {flagColors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleFlagChange('backgroundColor', color.color)}
                className={`relative w-full pt-[100%] rounded-lg border-2 transition-all duration-200 shadow-sm ${
                  flag.backgroundColor === color.color
                    ? 'border-indigo-500 scale-110 z-10 shadow-lg'
                    : 'border-transparent hover:border-gray-400'
                }`}
              >
                <div
                  className="absolute inset-0 rounded-md"
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Pattern Selection */}
        <div>
          <label className="block text-xl font-bold text-white mb-4">
            Pattern
          </label>
          <div className="grid grid-cols-4 gap-4">
            {flagPatterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => handleFlagChange('pattern', pattern.id)}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all duration-200 shadow-sm ${
                  flag.pattern === pattern.id
                    ? 'border-indigo-500 bg-indigo-600 text-white transform scale-105 shadow-lg'
                    : 'border-gray-600 bg-gray-800 text-white hover:border-indigo-400 hover:bg-gray-700'
                }`}
              >
                {pattern.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern Color (only shown when a pattern is selected) */}
        {flag.pattern !== 'solid' && (
          <div>
            <label className="block text-xl font-bold text-white mb-4">
              Pattern Color
            </label>
            <div className="grid grid-cols-8 gap-4">
              {flagColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleFlagChange('patternColor', color.color)}
                  className={`relative w-full pt-[100%] rounded-lg border-2 transition-all duration-200 shadow-sm ${
                    flag.patternColor === color.color
                      ? 'border-indigo-500 scale-110 z-10 shadow-lg'
                      : 'border-transparent hover:border-gray-400'
                  }`}
                >
                  <div
                    className="absolute inset-0 rounded-md"
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
  );
};

export default FlagEditor; 