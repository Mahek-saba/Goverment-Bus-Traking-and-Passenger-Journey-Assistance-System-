const mongoose = require('mongoose');

/**
 * Stop Model
 * Represents geographic bus stations, stops, depots, and junctions.
 */
const stopSchema = new mongoose.Schema({
  stopCode: {
    type: String,
    trim: true,
    uppercase: true,
    default: null,
    index: true
  },
  stopName: {
    type: String,
    required: [true, 'Stop name is required'],
    trim: true,
    index: true
  },
  stopNameDevanagari: {
    type: String,
    trim: true,
    default: null
  },
  city: {
    type: String,
    trim: true,
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
  }
}, {
  timestamps: true
});

const Stop = mongoose.models.Stop || mongoose.model('Stop', stopSchema);

module.exports = Stop;
