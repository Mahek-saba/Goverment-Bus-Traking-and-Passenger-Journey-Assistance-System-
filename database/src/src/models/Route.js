const mongoose = require('mongoose');

/**
 * Route Model
 * Represents bus routes with origin, destination, and ordered stop sequences.
 */
const routeSchema = new mongoose.Schema({
  routeCode: {
    type: String,
    required: [true, 'Route code is required'],
    unique: true,
    trim: true
  },
  routeName: {
    type: String,
    trim: true,
    default: null
  },
  source: {
    type: String,
    required: [true, 'Source terminal is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination terminal is required'],
    trim: true
  },
  stops: [
    {
      stop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop',
        required: true
      },
      sequence: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);

module.exports = Route;
