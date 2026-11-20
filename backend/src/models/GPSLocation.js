const mongoose = require('mongoose');

/**
 * GPSLocation Model
 * Represents recorded or simulated geospatial telemetry for a trip and vehicle.
 */
const gpsLocationSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Trip reference is required']
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    default: null
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude coordinate is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude coordinate is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isSimulated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const GPSLocation = mongoose.models.GPSLocation || mongoose.model('GPSLocation', gpsLocationSchema);

module.exports = GPSLocation;
