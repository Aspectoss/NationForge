import mongoose, { Schema } from 'mongoose';

interface ICountry extends mongoose.Document {
  name: string;
  userId: mongoose.Types.ObjectId;
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
    startedAt: Date;
    completesAt: Date;
  }>;
  lastResourceUpdate: Date;
  updateResources(): Promise<void>;
  calculateHourlyProduction(): {
    population: number;
    economy: number;
    environment: number;
  };
}

interface IBuilding {
  type: string;
  count: number;
}

interface IConstructionQueueItem {
  buildingType: string;
  startedAt: Date;
  completesAt: Date;
}

interface IBuildingType {
  effects: {
    population: number;
    economy: number;
    environment: number;
  };
}

const countrySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Country name is required'],
    unique: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  government: {
    type: String,
    required: [true, 'Government type is required'],
  },
  values: [{
    type: String,
    required: [true, 'At least one value is required'],
  }],
  flag: {
    backgroundColor: {
      type: String,
      required: [true, 'Flag background color is required'],
    },
    pattern: {
      type: String,
      required: [true, 'Flag pattern is required'],
    },
    patternColor: {
      type: String,
      required: [true, 'Flag pattern color is required'],
    },
  },
  resources: {
    population: {
      type: Number,
      default: 1000,
    },
    economy: {
      type: Number,
      default: 10000,
    },
    environment: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
  },
  buildings: [{
    type: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
  }],
  constructionQueue: [{
    buildingType: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completesAt: {
      type: Date,
      required: true,
    },
  }],
  lastResourceUpdate: {
    type: Date,
    default: Date.now,
  },
});

// Method to calculate resource production per hour
countrySchema.methods.calculateHourlyProduction = function() {
  let production = {
    population: 10, // Base population growth
    economy: 100,   // Base economy growth
    environment: 0  // Base environment change
  };

  // Add effects from buildings
  this.buildings.forEach((building: IBuilding) => {
    const buildingType = (mongoose.model('Building') as any).TYPES[building.type] as IBuildingType;
    if (buildingType) {
      production.population += buildingType.effects.population * building.count;
      production.economy += buildingType.effects.economy * building.count;
      production.environment += buildingType.effects.environment * building.count;
    }
  });

  return production;
};

// Method to update resources based on time passed
countrySchema.methods.updateResources = async function() {
  const now = new Date();
  const hoursPassed = (now.getTime() - this.lastResourceUpdate.getTime()) / (1000 * 60 * 60);
  
  if (hoursPassed < 0.1) { // Only update if at least 6 minutes have passed
    return;
  }

  const production = this.calculateHourlyProduction();
  
  // Update resources based on time passed
  this.resources.population += Math.floor(production.population * hoursPassed);
  this.resources.economy += Math.floor(production.economy * hoursPassed);
  this.resources.environment += Math.floor(production.environment * hoursPassed);

  // Ensure environment stays within bounds
  this.resources.environment = Math.max(0, Math.min(100, this.resources.environment));

  // Update construction queue
  const completedBuildings = this.constructionQueue.filter((item: IConstructionQueueItem) => item.completesAt <= now);
  this.constructionQueue = this.constructionQueue.filter((item: IConstructionQueueItem) => item.completesAt > now);

  // Add completed buildings
  completedBuildings.forEach((item: IConstructionQueueItem) => {
    const existingBuilding = this.buildings.find((b: IBuilding) => b.type === item.buildingType);
    if (existingBuilding) {
      existingBuilding.count += 1;
    } else {
      this.buildings.push({ type: item.buildingType, count: 1 });
    }
  });

  this.lastResourceUpdate = now;
  await this.save();
};

export default mongoose.model<ICountry>('Country', countrySchema); 