const mongoose = require('mongoose');

/**
 * Bus Model
 * Represents public transit vehicles, categories, status, and assigned route.
 */
const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Bus number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  busType: {
    type: String,
    enum: {
      values: [
        'Ordinary Express',
        'Semi-Luxury (Hirkani)',
        'Shivshahi (AC)',
        'Shivneri (Volvo AC)',
        'Sleeper',
        'Electric (E-Bus)',
        'Other'
      ],
      message: '{VALUE} is not a valid bus type'
    },
    default: 'Ordinary Express'
  },
  registrationNumber: {
    type: String,
    trim: true,
    uppercase: true,
    default: null
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'maintenance', 'breakdown'],
      message: '{VALUE} is not a valid bus status'
    },
    default: 'active'
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  }
}, {
  timestamps: true
});

const Bus = mongoose.models.Bus || mongoose.model('Bus', busSchema);

module.exports = Bus;
