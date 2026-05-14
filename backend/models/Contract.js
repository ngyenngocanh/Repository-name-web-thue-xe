const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contractId: {
    type: String,
    unique: true
  },
  content: {
    type: String
  },
  fileName: {
    type: String
  },
  renterSignature: {
    signed: { type: Boolean, default: false },
    signature: String,
    signedAt: Date
  },
  ownerSignature: {
    signed: { type: Boolean, default: false },
    signature: String,
    signedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'signed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

contractSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
