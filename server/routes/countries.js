const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Country = require('../models/Country');
const User = require('../models/User');

// Get current user's country
router.get('/my-country', auth, async (req, res) => {
  try {
    const country = await Country.findOne({ userId: req.user.id });
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    // Update resources before sending
    await country.updateResources();

    res.json(country);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get production rates
router.get('/production', auth, async (req, res) => {
  try {
    const country = await Country.findOne({ userId: req.user.id });
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    const production = country.calculateHourlyProduction();
    res.json(production);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new country
router.post('/', auth, async (req, res) => {
  try {
    // Check if user already has a country
    const existingCountry = await Country.findOne({ userId: req.user.id });
    if (existingCountry) {
      return res.status(400).json({ message: 'User already has a country' });
    }

    const { name, government, values, flag } = req.body;

    // Validate country name uniqueness
    const nameExists = await Country.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: 'Country name already exists' });
    }

    const country = new Country({
      name,
      government,
      values,
      flag,
      userId: req.user.id,
    });

    await country.save();

    // Update user's hasCountry flag
    await User.findByIdAndUpdate(req.user.id, { hasCountry: true });

    res.json(country);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update country
router.patch('/:id', auth, async (req, res) => {
  try {
    const country = await Country.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    // Update only allowed fields
    const allowedUpdates = ['flag'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach((update) => {
      country[update] = req.body[update];
    });

    await country.save();
    res.json(country);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete country
router.delete('/:id', auth, async (req, res) => {
  try {
    const country = await Country.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    // Update user's hasCountry flag
    await User.findByIdAndUpdate(req.user.id, { hasCountry: false });

    res.json({ message: 'Country deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 