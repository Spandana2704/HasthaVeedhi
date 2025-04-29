//controllers/userController

const User = require('../models/User'); // ✅ Correct
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET;
const emailController = require('./emailController');

// At the top of your userController.js
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.register = async (req, res) => {
  try {
    const { username, phone, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });

    // If user exists and is verified
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: 'Email already registered. Please login.' });
    }

    // If user exists but not verified - update their record and resend verification
    if (existingUser && !existingUser.isVerified) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      existingUser.username = username;
      existingUser.phone = phone;
      existingUser.password = hashedPassword;
      existingUser.role = role;
      existingUser.verificationToken = verificationToken;
      existingUser.verificationSentAt = new Date();
      await existingUser.save();

      await sendVerificationEmail(email, verificationToken);
      
      return res.status(200).json({ 
        message: 'Verification email resent. Please check your inbox to complete registration.',
        isResent: true
      });
    }

    // New user registration
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const user = await User.create({ 
      username,
      phone,
      email, 
      password: hashedPassword, 
      role,
      verificationToken,
      verificationSentAt: new Date()
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ 
      message: 'Registration successful! Please check your email for verification.',
      isNewUser: true
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function sendVerificationEmail(email, token) {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <h2>Email Verification</h2>
      <p>Please click the link below to verify your email and complete your registration:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email' });
    }

    // Strict check - only allow verified users to login
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Account not verified. Please check your email for verification link.',
        isVerified: false,
        email: user.email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      role: user.role,
      username: user.username
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
};