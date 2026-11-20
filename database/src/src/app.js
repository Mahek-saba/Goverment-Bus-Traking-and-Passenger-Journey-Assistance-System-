const express = require('express');
const cors = require('cors');
const busRoutes = require('./routes/busRoutes');
const authRoutes = require('./routes/authRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const {
  getTimetable,
  getSimulatedTracking,
  getETA,
  getAlternativeBuses
} = require('./controllers/busController');

const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Government Bus Tracking API is running'
  });
});

// Auth and Passenger routes
app.use('/api/auth', authRoutes);
app.use('/api/passenger', passengerRoutes);

// Bus routes (includes /search, /timetable, /:id, /:id/tracking, /:id/eta, /alternatives)
app.use('/api/buses', busRoutes);

// Direct route aliases
app.get('/api/timetable', getTimetable);

app.get('/api/tracking', (req, res) => {
  const { id } = req.query;
  if (id) {
    req.params.id = id;
    return getSimulatedTracking(req, res);
  }
  return res.status(400).json({
    success: false,
    message: 'Trip ID is required'
  });
});

app.get('/api/tracking/:id', getSimulatedTracking);

app.get('/api/eta', (req, res) => {
  const { id } = req.query;
  if (id) {
    req.params.id = id;
    return getETA(req, res);
  }
  return res.status(400).json({
    success: false,
    message: 'Trip ID is required'
  });
});

app.get('/api/eta/:id', getETA);

app.get('/api/alternatives', getAlternativeBuses);

// Catch-all 404 middleware for unhandled routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`
  });
});

// Global Express JSON error-handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: err.name || 'ServerError'
  });
});

module.exports = app;
