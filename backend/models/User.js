const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'head'],
    default: 'faculty'
  },
  department: {
    type: String,
    required: [true, 'Please provide a department'],
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  emailVerificationCodeHash: {
    type: String
  },

  emailVerificationExpires: {
    type: Date
  },
  passwordResetCodeHash: {
    type: String
  },

  passwordResetExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
