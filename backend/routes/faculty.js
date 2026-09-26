const express = require('express');
const jwt = require('jsonwebtoken');
const Faculty = require('../models/Faculty');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smart_timetable_secret_2026';

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

// Get all faculty
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department } = req.query;
    const query = { isActive: true };
    if (department) {
      query.department = department;
    }
    const facultyList = await Faculty.find(query).sort({ name: 1 });
    res.json(facultyList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get faculty by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create faculty
router.post('/', authenticateToken, async (req, res) => {
  try {
    const faculty = await Faculty.create(req.body);
    res.status(201).json({ message: 'Faculty created successfully', faculty });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Faculty with this email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update faculty workload
router.patch('/:id/workload', authenticateToken, async (req, res) => {
  try {
    const { hours } = req.body;
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { assignedHours: hours },
      { new: true }
    );
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json({ message: 'Workload updated', faculty });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
