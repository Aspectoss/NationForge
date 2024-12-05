const express = require('express');
import type { Request, Response } from 'express-serve-static-core';
import auth from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 