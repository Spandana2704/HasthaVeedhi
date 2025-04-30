const express = require('express');
const { login, register } = require('../controllers/userController');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Or from body if using localStorage
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) return res.status(401).json({ message: 'Invalid user' });

    const newToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Add this test route to your authRoutes.js
router.get('/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'This is a test email'
    });
    res.send('Email sent successfully');
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).send('Failed to send email');
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ 
      email: decoded.email,
      verificationToken: token
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ 
      message: 'Email verified successfully! You can now login.',
      email: user.email
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
    }
    res.status(400).json({ error: 'Invalid verification token' });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Check if we should resend (limit to once every 5 minutes)
    if (user.verificationSentAt && 
        new Date() - user.verificationSentAt < 5 * 60 * 1000) {
      return res.status(429).json({ 
        error: 'Verification email already sent recently. Please wait before requesting another.' 
      });
    }

    // Generate new token
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update user
    user.verificationToken = verificationToken;
    user.verificationSentAt = new Date();
    await user.save();

    // Send email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ 
      message: 'New verification email sent. Please check your inbox.' 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;