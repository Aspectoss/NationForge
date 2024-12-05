const express = require('express');
import type { Request, Response } from 'express-serve-static-core';
import auth from '../middleware/auth';
import User from '../models/User';
import Country from '../models/Country';

const router = express.Router();

// Create a new country
router.post('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Create country request received:', {
      body: req.body,
      userId: req.user?.id,
      headers: req.headers
    });

    // Check if user exists and has valid ID
    if (!req.user?.id) {
      console.error('No user ID found in request');
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if user already has a country
    const existingCountry = await Country.findOne({ userId: req.user.id });
    if (existingCountry) {
      console.log('User already has a country:', existingCountry);
      res.status(400).json({ message: 'User already has a country' });
      return;
    }

    const { name, government, values, flag } = req.body;

    // Validate required fields
    if (!name || !government || !values || !flag) {
      console.log('Missing required fields:', {
        name: !!name,
        government: !!government,
        values: !!values,
        flag: !!flag
      });
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Validate flag object
    if (!flag.backgroundColor || !flag.pattern || !flag.patternColor) {
      console.log('Missing flag properties:', {
        backgroundColor: !!flag.backgroundColor,
        pattern: !!flag.pattern,
        patternColor: !!flag.patternColor
      });
      res.status(400).json({ message: 'All flag properties are required' });
      return;
    }

    // Validate values array
    if (!Array.isArray(values) || values.length === 0) {
      console.log('Invalid values array:', values);
      res.status(400).json({ message: 'At least one value is required' });
      return;
    }

    // Validate country name uniqueness
    const nameExists = await Country.findOne({ name });
    if (nameExists) {
      console.log('Country name already exists:', name);
      res.status(400).json({ message: 'Country name already exists' });
      return;
    }

    console.log('Creating new country with data:', {
      name,
      government,
      values,
      flag,
      userId: req.user.id
    });

    const country = new Country({
      name,
      government,
      values,
      flag,
      userId: req.user.id,
    });

    try {
      await country.save();
      console.log('Country saved successfully:', country);
    } catch (saveError: any) {
      console.error('Error saving country:', saveError);
      res.status(500).json({ message: 'Error saving country to database', error: saveError.message });
      return;
    }

    // Update user's hasCountry flag
    try {
      await User.findByIdAndUpdate(req.user.id, { hasCountry: true });
      console.log('User hasCountry flag updated');
    } catch (updateError: any) {
      console.error('Error updating user hasCountry flag:', updateError);
      // Don't return here as the country was already created
    }

    res.json(country);
  } catch (error: any) {
    console.error('Error creating country:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user's country
router.get('/my-country', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const country = await Country.findOne({ userId: req.user?.id });
    if (!country) {
      res.status(404).json({ message: 'Country not found' });
      return;
    }

    // Update resources before sending
    await country.updateResources();

    res.json(country);
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update country
router.patch('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const country = await Country.findOne({
      _id: req.params.id,
      userId: req.user?.id,
    });

    if (!country) {
      res.status(404).json({ message: 'Country not found' });
      return;
    }

    // Update only allowed fields
    const allowedUpdates = ['flag'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      res.status(400).json({ message: 'Invalid updates' });
      return;
    }

    // Type-safe update
    if ('flag' in req.body) {
      country.flag = req.body.flag;
    }

    await country.save();
    res.json(country);
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete country
router.delete('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const country = await Country.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id,
    });

    if (!country) {
      res.status(404).json({ message: 'Country not found' });
      return;
    }

    // Update user's hasCountry flag
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { hasCountry: false });
    }

    res.json({ message: 'Country deleted' });
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 