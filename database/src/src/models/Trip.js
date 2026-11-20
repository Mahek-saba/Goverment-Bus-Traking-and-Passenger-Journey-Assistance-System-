const mongoose = require('mongoose');

/**
 * Trip Model
 * Represents scheduled journeys along a route on a specific service date.
 */
const tripSchema = new mongoose.Schema({
  tripId: {
    type: String,
    required: [true, 'Trip ID is required'],
    unique: true,
    trim: true
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    default: null
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route reference is required']
  },
  serviceDate: {
    type: Date,
    default: Date.now
  },
  departureTime: {
    type: String,
    required: [true, 'Departure time is required'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['scheduled', 'in-transit', 'completed', 'delayed', 'cancelled'],
      message: '{VALUE} is not a valid trip status'
    },
    default: 'scheduled'
  }
}, {
  timestamps: true
});

const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);

module.exports = Trip;
