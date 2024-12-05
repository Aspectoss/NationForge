import mongoose, { Schema, Model } from 'mongoose';

interface IBuildingType {
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

interface IBuildingDocument extends mongoose.Document {
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

interface IBuildingModel extends Model<IBuildingDocument> {
  TYPES: { [key: string]: IBuildingType };
}

const buildingSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  cost: {
    economy: {
      type: Number,
      required: true,
    },
  },
  effects: {
    population: {
      type: Number,
      default: 0,
    },
    economy: {
      type: Number,
      default: 0,
    },
    environment: {
      type: Number,
      default: 0,
    },
  },
  buildTime: {
    type: Number,
    required: true,
  },
  requirements: {
    population: {
      type: Number,
      default: 0,
    },
    economy: {
      type: Number,
      default: 0,
    },
  },
});

// Pre-defined building types
const BUILDING_TYPES: { [key: string]: IBuildingType } = {
  HOUSE: {
    name: 'House',
    description: 'Basic housing for your citizens',
    cost: { economy: 1000 },
    effects: { population: 100, economy: 5, environment: -2 },
    buildTime: 1,
    requirements: { population: 0, economy: 1000 },
  },
  FACTORY: {
    name: 'Factory',
    description: 'Industrial facility that boosts economy',
    cost: { economy: 5000 },
    effects: { population: -10, economy: 50, environment: -10 },
    buildTime: 2,
    requirements: { population: 1000, economy: 5000 },
  },
  PARK: {
    name: 'Park',
    description: 'Recreational area that improves environment',
    cost: { economy: 2000 },
    effects: { population: 20, economy: -5, environment: 15 },
    buildTime: 1,
    requirements: { population: 500, economy: 2000 },
  },
  OFFICE: {
    name: 'Office Complex',
    description: 'Modern workplace that balances economy and environment',
    cost: { economy: 3000 },
    effects: { population: 30, economy: 30, environment: -5 },
    buildTime: 2,
    requirements: { population: 800, economy: 3000 },
  },
  SOLAR_PLANT: {
    name: 'Solar Power Plant',
    description: 'Clean energy facility that greatly benefits the environment',
    cost: { economy: 8000 },
    effects: { population: 0, economy: 20, environment: 25 },
    buildTime: 3,
    requirements: { population: 2000, economy: 8000 },
  },
};

// Add the static property to the schema
(buildingSchema.statics as any).TYPES = BUILDING_TYPES;

const Building = mongoose.model<IBuildingDocument, IBuildingModel>('Building', buildingSchema);

export default Building; 