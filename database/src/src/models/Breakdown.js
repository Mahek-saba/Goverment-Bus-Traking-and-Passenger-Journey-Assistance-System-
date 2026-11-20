const mongoose = require('mongoose');

/**
 * Breakdown Model
 * Represents vehicle mechanical issues, incidents, and roadside breakdown reports.
 */
const breakdownSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus reference is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null
  },
  location: {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    address: {
      type: String,
      trim: true,
      default: null
    }
  },
  description: {
    type: String,
    required: [true, 'Breakdown description is required'],
    trim: true
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: {
      values: ['reported', 'in-progress', 'resolved', 'cancelled'],
      message: '{VALUE} is not a valid breakdown status'
    },
    default: 'reported'
  }
}, {
  timestamps: true
});

const Breakdown = mongoose.models.Breakdown || mongoose.model('Breakdown', breakdownSchema);

module.exports = Breakdown;
