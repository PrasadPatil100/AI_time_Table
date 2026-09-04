const express = require('express');
const jwt = require('jsonwebtoken');
const Timetable = require('../models/Timetable');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smart_timetable_secret_2026';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all timetables for a class
router.get('/class/:className', authenticateToken, async (req, res) => {
  try {
    const { className } = req.params;
    const timetables = await Timetable.find({ className, isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get timetables by department
router.get('/department/:department', authenticateToken, async (req, res) => {
  try {
    const { department } = req.params;
    const timetables = await Timetable.find({ department, isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new timetable
router.post('/', authenticateToken, async (req, res) => {
  try {
    const timetableData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const timetable = await Timetable.create(timetableData);
    await timetable.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Timetable created successfully',
      timetable
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'A timetable already exists for this class at this time slot',
        error: error.message
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update timetable
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.json({ message: 'Timetable updated successfully', timetable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete timetable (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
