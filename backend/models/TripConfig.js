const mongoose = require('mongoose');

const tripConfigSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true,
        trim: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    fixedPrice: {
        type: Number,
        required: true
    },
    roundTripPrice: {
        type: Number,
        default: 0
    },
    description: String,
    applicableCars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    }],
    schedules: [{
        departA: { type: String, trim: true },
        arriveB: { type: String, trim: true },
        departB: { type: String, trim: true },
        arriveA: { type: String, trim: true }
    }],
    stopPoints: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for quick lookup (Removing unique constraint as different service tiers might have different prices for same route)
tripConfigSchema.index({ source: 1, destination: 1 });

module.exports = mongoose.model('TripConfig', tripConfigSchema);
