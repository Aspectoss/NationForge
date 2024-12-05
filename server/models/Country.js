const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  government: {
    type: String,
    required: true,
  },
  values: [{
    type: String,
    required: true,
  }],
  flag: {
    backgroundColor: {
      type: String,
      required: true,
    },
    pattern: {
      type: String,
      required: true,
    },
    patternColor: {
      type: String,
      required: true,
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
  const Building = mongoose.model('Building');
  let production = {
    population: 10, // Base population growth
    economy: 100,   // Base economy growth
    environment: 0  // Base environment change
  };

  // Add effects from buildings
  this.buildings.forEach(building => {
    const buildingType = Building.TYPES[building.type];
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
  const hoursPassed = (now - this.lastResourceUpdate) / (1000 * 60 * 60);
  
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
  const completedBuildings = this.constructionQueue.filter(item => item.completesAt <= now);
  this.constructionQueue = this.constructionQueue.filter(item => item.completesAt > now);

  // Add completed buildings
  completedBuildings.forEach(item => {
    const existingBuilding = this.buildings.find(b => b.type === item.buildingType);
    if (existingBuilding) {
      existingBuilding.count += 1;
    } else {
      this.buildings.push({ type: item.buildingType, count: 1 });
    }
  });

  this.lastResourceUpdate = now;
  await this.save();
};

const Country = mongoose.model('Country', countrySchema);

module.exports = Country; 