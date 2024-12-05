import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface BuildingType {
  name: string;
  description: string;
  cost: {
    economy: number;
  };
  effects: {
    population: number;
    economy: number;
    environment: number;
  };
  buildTime: number;
  requirements: {
    population: number;
    economy: number;
  };
}

interface Building {
  type: string;
  count: number;
}

interface ConstructionItem {
  buildingType: string;
  startedAt: string;
  completesAt: string;
}

interface BuildingsProps {
  onUpdate: () => void;
  resources: {
    population: number;
    economy: number;
    environment: number;
  };
}

const Buildings: React.FC<BuildingsProps> = ({ onUpdate, resources }) => {
  const [buildingTypes, setBuildingTypes] = useState<Record<string, BuildingType>>({});
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [constructionQueue, setConstructionQueue] = useState<ConstructionItem[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuildingData();
    const interval = setInterval(fetchBuildingData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBuildingData = async () => {
    try {
      const [typesResponse, statusResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/buildings/types'),
        axios.get('http://localhost:5000/api/buildings/status'),
      ]);

      setBuildingTypes(typesResponse.data);
      setBuildings(statusResponse.data.buildings);
      setConstructionQueue(statusResponse.data.constructionQueue);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching building data:', error);
      setError('Failed to fetch building data');
      setLoading(false);
    }
  };

  const startConstruction = async (buildingType: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/buildings/construct', {
        buildingType,
      });

      setBuildings(response.data.buildings);
      setConstructionQueue(response.data.constructionQueue);
      onUpdate(); // Update parent component with new resource values
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to start construction');
    }
  };

  const formatTime = (date: string) => {
    const remaining = new Date(date).getTime() - Date.now();
    if (remaining <= 0) return 'Completing...';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getBuildingCount = (type: string) => {
    const building = buildings.find(b => b.type === type);
    return building ? building.count : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading buildings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Construction Queue */}
      {constructionQueue.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-3">Construction Queue</h3>
          <div className="space-y-2">
            {constructionQueue.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-900 rounded p-3">
                <div>
                  <span className="text-white">{buildingTypes[item.buildingType]?.name}</span>
                  <span className="text-gray-400 text-sm ml-2">
                    Completes in: {formatTime(item.completesAt)}
                  </span>
                </div>
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-500 rounded-full h-2"
                    style={{
                      width: `${Math.min(100, Math.max(0, (
                        (Date.now() - new Date(item.startedAt).getTime()) /
                        (new Date(item.completesAt).getTime() - new Date(item.startedAt).getTime())
                      ) * 100))}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Buildings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(buildingTypes).map(([type, building]) => (
          <div key={type} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-white">{building.name}</h3>
              <span className="text-gray-400 text-sm">
                Owned: {getBuildingCount(type)}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3">{building.description}</p>
            
            {/* Effects */}
            <div className="space-y-1 mb-4">
              {building.effects.population !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Population</span>
                  <span className={building.effects.population > 0 ? 'text-green-400' : 'text-red-400'}>
                    {building.effects.population > 0 ? '+' : ''}{building.effects.population}/h
                  </span>
                </div>
              )}
              {building.effects.economy !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Economy</span>
                  <span className={building.effects.economy > 0 ? 'text-green-400' : 'text-red-400'}>
                    {building.effects.economy > 0 ? '+' : ''}${building.effects.economy}/h
                  </span>
                </div>
              )}
              {building.effects.environment !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Environment</span>
                  <span className={building.effects.environment > 0 ? 'text-green-400' : 'text-red-400'}>
                    {building.effects.environment > 0 ? '+' : ''}{building.effects.environment}/h
                  </span>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cost</span>
                <span className="text-white">${formatNumber(building.cost.economy)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Build Time</span>
                <span className="text-white">{building.buildTime}h</span>
              </div>
            </div>

            <button
              onClick={() => startConstruction(type)}
              disabled={
                resources.economy < building.cost.economy ||
                resources.population < building.requirements.population ||
                resources.economy < building.requirements.economy
              }
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200
                ${
                  resources.economy < building.cost.economy ||
                  resources.population < building.requirements.population ||
                  resources.economy < building.requirements.economy
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }
              `}
            >
              Build
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-900 text-red-200 p-3 rounded-lg mt-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default Buildings; 