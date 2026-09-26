const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendOTPEmail } = require('../services/emailService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smart_timetable_secret_2026';


// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before storing it
    const otpHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // OTP valid for 5 minutes
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'faculty',
      department,

      isEmailVerified: false,
      emailVerificationCodeHash: otpHash,
      emailVerificationExpires: otpExpires
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      // Remove user if email could not be sent
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        message: 'Unable to send verification email. Please try again.'
      });
    }

    res.status(201).json({
      message: 'Registration successful. OTP sent to your email.',
      requiresVerification: true,
      email: user.email
    });

  } catch (error) {
    console.error('Registration error:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Verify registration OTP
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email is already verified'
      });
    }

    // Check OTP expiration
    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      return res.status(400).json({
        message: 'OTP has expired. Please register again.'
      });
    }

    // Hash entered OTP
    const otpHash = crypto
      .createHash('sha256')
      .update(otp.toString())
      .digest('hex');

    // Compare OTP
    if (otpHash !== user.emailVerificationCodeHash) {
      return res.status(400).json({
        message: 'Invalid OTP'
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationCodeHash = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.json({
      message: 'Email verified successfully. You can now login.'
    });

  } catch (error) {
    console.error('OTP verification error:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Send password reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    // Find registered user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email'
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP
    const otpHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // OTP valid for 5 minutes
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Save reset OTP
    user.passwordResetCodeHash = otpHash;
    user.passwordResetExpires = otpExpires;

    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Reset OTP email error:', emailError);

      // Clear OTP if email failed
      user.passwordResetCodeHash = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(500).json({
        message: 'Unable to send OTP email. Please try again.'
      });
    }

    res.json({
      message: 'Password reset OTP sent to your email.',
      email: user.email
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Verify reset OTP and change password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: 'Email, OTP and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check OTP expiration
    if (
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      return res.status(400).json({
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Hash entered OTP
    const otpHash = crypto
      .createHash('sha256')
      .update(otp.toString())
      .digest('hex');

    // Compare OTP
    if (otpHash !== user.passwordResetCodeHash) {
      return res.status(400).json({
        message: 'Invalid OTP'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;

    // Clear reset OTP
    user.passwordResetCodeHash = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({
      message: 'Password reset successfully. You can now login.'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});
// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
