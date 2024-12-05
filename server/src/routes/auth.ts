const express = require('express');
import type { Request, Response } from 'express-serve-static-core';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth';
import User from '../models/User';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService';

const router = express.Router();

// Register user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Registration request received:', req.body);
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      console.log('Missing required fields:', { username: !!username, email: !!email, password: !!password });
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.log('User already exists:', email);
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create new user
    user = new User({
      username,
      email: email.toLowerCase(),
      password,
      hasCountry: false,
    });

    // Hash password
    try {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    } catch (hashError: any) {
      console.error('Error hashing password:', hashError);
      res.status(500).json({ message: 'Error creating user' });
      return;
    }

    try {
      await user.save();
      console.log('User saved successfully:', email);
    } catch (saveError: any) {
      console.error('Error saving user:', saveError);
      res.status(500).json({ message: 'Error saving user to database' });
      return;
    }

    // Create and return JWT token
    const payload = {
      id: user.id,
    };

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('Error creating JWT:', err);
          res.status(500).json({ message: 'Error creating authentication token' });
          return;
        }
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            hasCountry: user.hasCountry,
          },
        });
      }
    );
  } catch (error: any) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('\n=== Login Request ===');
    console.log('Headers:', req.headers);
    console.log('Body:', {
      ...req.body,
      password: req.body.password ? '[REDACTED]' : undefined
    });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing required fields:', {
        hasEmail: !!email,
        emailType: typeof email,
        hasPassword: !!password,
        passwordType: typeof password
      });
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Looking up user with email:', normalizedEmail);

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    console.log('Database lookup result:', {
      emailSearched: normalizedEmail,
      userFound: !!user,
      userId: user?._id,
      username: user?.username,
      storedEmail: user?.email,
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length
    });

    if (!user) {
      console.log('User not found');
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Password validation
    try {
      console.log('Starting password validation...');
      console.log('Password details:', {
        providedLength: password.length,
        storedLength: user.password.length,
        storedHash: user.password
      });

      // Use the User model's comparePassword method
      const isMatch = await user.comparePassword(password);
      console.log('Password comparison result:', {
        isMatch,
        userId: user._id,
        username: user.username
      });

      if (!isMatch) {
        console.log('Password does not match');
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      console.log('Password validated successfully');

      // Generate JWT
      console.log('Generating JWT token...');
      const payload = {
        id: user.id,
      };

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        console.error('JWT_SECRET missing from environment');
        res.status(500).json({ message: 'Server configuration error' });
        return;
      }

      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) {
            console.error('JWT generation error:', err);
            res.status(500).json({ message: 'Error creating authentication token' });
            return;
          }

          console.log('Login successful:', {
            userId: user._id,
            username: user.username,
            tokenGenerated: !!token
          });

          res.json({
            token,
            user: {
              id: user.id,
              username: user.username,
              hasCountry: user.hasCountry,
            },
          });
        }
      );
    } catch (bcryptError) {
      console.error('Error during password validation:', bcryptError);
      res.status(500).json({ message: 'Error validating credentials' });
      return;
    }
  } catch (error: any) {
    console.error('Unexpected error in login route:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({
      id: user._id,
      username: user.username,
      hasCountry: user.hasCountry,
    });
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if email exists (for debugging)
router.get('/check-email/:email', async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.params.email.toLowerCase();
    const user = await User.findOne({ email });
    
    if (user) {
      res.json({
        exists: true,
        userId: user._id,
        username: user.username,
        hasCountry: user.hasCountry
      });
    } else {
      res.json({ exists: false });
    }
  } catch (error: any) {
    console.error('Error checking email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Temporary debug route to list users
router.get('/debug/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('email username hasCountry');
    console.log('All users:', users);
    res.json(users);
  } catch (error: any) {
    console.error('Error listing users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Temporary debug route to reset password
router.post('/debug/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('\n=== Password Reset Request ===');
    console.log('Request body:', {
      email: req.body.email,
      hasNewPassword: !!req.body.newPassword,
      newPasswordLength: req.body.newPassword?.length
    });

    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      console.log('Missing required fields:', { hasEmail: !!email, hasNewPassword: !!newPassword });
      res.status(400).json({ message: 'Email and new password are required' });
      return;
    }

    // Log the exact password being used (for debugging only)
    console.log('Debug - Password being used:', {
      password: newPassword,
      length: newPassword.length,
      type: typeof newPassword
    });

    const normalizedEmail = email.toLowerCase().trim();
    console.log('Looking up user with email:', normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('User not found with email:', normalizedEmail);
      res.status(404).json({ message: 'User not found' });
      return;
    }

    console.log('User found:', {
      userId: user._id,
      username: user.username,
      email: user.email,
      currentPasswordHash: user.password
    });

    try {
      // Store old password for verification
      const oldPassword = user.password;
      
      // Update password (will be hashed by the pre-save hook)
      console.log('Updating user password...');
      user.password = newPassword;
      await user.save();
      console.log('User saved successfully');

      // Verify the save worked by fetching the user again
      console.log('Verifying saved password...');
      const updatedUser = await User.findById(user._id);
      if (!updatedUser) {
        throw new Error('Failed to fetch updated user');
      }
      
      const savedHash = updatedUser.password;
      console.log('Verification check:', {
        oldHash: oldPassword,
        newHash: savedHash,
        hashLength: savedHash.length
      });

      // Test password verification
      console.log('Testing password verification...');
      const verificationTest = await bcrypt.compare(newPassword, savedHash);
      console.log('Verification test result:', {
        success: verificationTest,
        inputLength: newPassword.length,
        savedHashLength: savedHash.length
      });

      if (!verificationTest) {
        console.error('Password verification failed!', {
          passwordLength: newPassword.length,
          hashLength: savedHash.length
        });
        res.status(500).json({ message: 'Password reset failed verification' });
        return;
      }

      console.log('Password reset successful!');
      res.json({ 
        message: 'Password reset successfully',
        verificationTest
      });
    } catch (hashError: any) {
      console.error('Error during password update:', {
        error: hashError.message,
        stack: hashError.stack
      });
      res.status(500).json({ message: 'Error processing password reset', error: hashError.message });
      return;
    }
  } catch (error: any) {
    console.error('Unexpected error in password reset:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Temporary debug route to show password reset form
router.get('/debug/reset-password', (_req: Request, res: Response): void => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Debug Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; margin-bottom: 10px; }
        button { padding: 10px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        .result { margin-top: 20px; padding: 10px; border-radius: 4px; }
        .success { background: #dff0d8; border: 1px solid #3c763d; color: #3c763d; }
        .error { background: #f2dede; border: 1px solid #a94442; color: #a94442; }
      </style>
    </head>
    <body>
      <h2>Debug Password Reset</h2>
      <div class="form-group">
        <label>Email:</label>
        <input type="email" id="email" />
      </div>
      <div class="form-group">
        <label>New Password:</label>
        <input type="text" id="password" value="TestPassword123!" />
      </div>
      <button onclick="resetPassword()">Reset Password</button>
      <div id="result"></div>

      <script>
        async function resetPassword() {
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const resultDiv = document.getElementById('result');

          try {
            const response = await fetch('/api/auth/debug/reset-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email,
                newPassword: password
              })
            });

            const data = await response.json();
            
            if (response.ok) {
              resultDiv.className = 'result success';
              resultDiv.innerHTML = 'Password reset successful! You can now try logging in with the new password.';
            } else {
              resultDiv.className = 'result error';
              resultDiv.innerHTML = data.message || 'Failed to reset password';
            }
          } catch (error) {
            resultDiv.className = 'result error';
            resultDiv.innerHTML = 'Error: ' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Request password reset
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received password reset request');
    const { email } = req.body;

    if (!email) {
      console.log('No email provided in request');
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    console.log('Looking up user with email:', email);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('No user found with email:', email);
      // Don't reveal that the user doesn't exist
      res.json({ message: 'If an account exists with this email, a password reset link will be sent.' });
      return;
    }

    console.log('User found, generating reset token');
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save token to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    
    console.log('Saving reset token to user');
    await user.save();

    try {
      console.log('Attempting to send reset email');
      // Send reset email
      await sendPasswordResetEmail(user.email, resetToken, user.username);
      console.log('Reset email sent successfully');
      res.json({ message: 'Password reset email sent' });
    } catch (emailError: any) {
      console.error('Detailed email error:', {
        error: emailError.message,
        stack: emailError.stack,
        code: emailError.code,
        command: emailError.command,
        responseCode: emailError.responseCode,
        response: emailError.response
      });
      
      // Clean up the token since email failed
      console.log('Cleaning up reset token due to email failure');
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      res.status(500).json({ 
        message: 'Error sending password reset email',
        error: emailError.message 
      });
    }
  } catch (error: any) {
    console.error('Unexpected error in forgot password:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
});

// Reset password with token
router.post('/reset-password/:token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      res.status(400).json({ message: 'New password is required' });
      return;
    }

    // Hash token from params
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error in reset password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 