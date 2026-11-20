const mongoose = require('mongoose');

/**
 * Timetable Model
 * Represents scheduled arrival and departure timings at each sequential stop on a trip.
 */
const timetableSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Trip reference is required']
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route reference is required']
  },
  stop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: [true, 'Stop reference is required']
  },
  arrivalTime: {
    type: String,
    trim: true,
    default: null
  },
  departureTime: {
    type: String,
    trim: true,
    default: null
  },
  stopSequence: {
    type: Number,
    required: [true, 'Stop sequence index is required'],
    min: [1, 'Stop sequence must be at least 1']
  }
}, {
  timestamps: true
});

const Timetable = mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
