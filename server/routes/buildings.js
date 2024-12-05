const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Country = require('../models/Country');
const Building = require('../models/Building');

// Get available building types
router.get('/types', auth, async (req, res) => {
  try {
    res.json(Building.TYPES);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current buildings and construction queue
router.get('/status', auth, async (req, res) => {
  try {
    const country = await Country.findOne({ userId: req.user.id });
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    // Update resources and construction queue
    await country.updateResources();

    res.json({
      buildings: country.buildings,
      constructionQueue: country.constructionQueue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start building construction
router.post('/construct', auth, async (req, res) => {
  try {
    const { buildingType } = req.body;
    
    // Validate building type
    const buildingData = Building.TYPES[buildingType];
    if (!buildingData) {
      return res.status(400).json({ message: 'Invalid building type' });
    }

    const country = await Country.findOne({ userId: req.user.id });
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    // Update resources before checking requirements
    await country.updateResources();

    // Check requirements
    if (country.resources.population < buildingData.requirements.population) {
      return res.status(400).json({ message: 'Insufficient population' });
    }
    if (country.resources.economy < buildingData.requirements.economy) {
      return res.status(400).json({ message: 'Insufficient economy' });
    }

    // Check if can afford
    if (country.resources.economy < buildingData.cost.economy) {
      return res.status(400).json({ message: 'Cannot afford building' });
    }

    // Deduct cost
    country.resources.economy -= buildingData.cost.economy;

    // Add to construction queue
    const now = new Date();
    country.constructionQueue.push({
      buildingType,
      startedAt: now,
      completesAt: new Date(now.getTime() + buildingData.buildTime * 60 * 60 * 1000), // buildTime is in hours
    });

    await country.save();

    res.json({
      buildings: country.buildings,
      constructionQueue: country.constructionQueue,
      resources: country.resources,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 