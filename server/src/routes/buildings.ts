const express = require('express');
import type { Request, Response } from 'express-serve-static-core';
import auth from '../middleware/auth';
import Country from '../models/Country';
import Building from '../models/Building';

const router = express.Router();

// Get available building types
router.get('/types', auth, async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(Building.TYPES);
  } catch (error) {
    console.error('Error fetching building types:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current buildings and construction queue
router.get('/status', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const country = await Country.findOne({ userId: req.user?.id });
    if (!country) {
      res.status(404).json({ message: 'Country not found' });
      return;
    }

    // Update resources and construction queue
    await country.updateResources();

    res.json({
      buildings: country.buildings,
      constructionQueue: country.constructionQueue,
    });
  } catch (error) {
    console.error('Error fetching building status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start building construction
router.post('/construct', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { buildingType } = req.body;
    
    // Validate building type
    const buildingData = Building.TYPES[buildingType];
    if (!buildingData) {
      res.status(400).json({ message: 'Invalid building type' });
      return;
    }

    const country = await Country.findOne({ userId: req.user?.id });
    if (!country) {
      res.status(404).json({ message: 'Country not found' });
      return;
    }

    // Update resources before checking requirements
    await country.updateResources();

    // Check requirements
    if (country.resources.population < buildingData.requirements.population) {
      res.status(400).json({ message: 'Insufficient population' });
      return;
    }
    if (country.resources.economy < buildingData.requirements.economy) {
      res.status(400).json({ message: 'Insufficient economy' });
      return;
    }

    // Check if can afford
    if (country.resources.economy < buildingData.cost.economy) {
      res.status(400).json({ message: 'Cannot afford building' });
      return;
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
    console.error('Error constructing building:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 