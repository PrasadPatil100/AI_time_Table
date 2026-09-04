const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_timetable';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB:', MONGODB_URI))
  .catch(err => console.error('MongoDB connection error:', err));

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Timetable API is running' });
});

// Import routes
const authRoutes = require('./routes/auth');
const timetableRoutes = require('./routes/timetables');
const facultyRoutes = require('./routes/faculty');

app.use('/api/auth', authRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/faculty', facultyRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
