const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema({
    pricePerKm: { type: Number, default: 1000 },
    driverFeePerDay: { type: Number, default: 500000 },
    overTimeFee: { type: Number, default: 100000 },
    applicableCars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }]
}, { _id: false });

const tripSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'global_trip_settings',
        unique: true
    },
    tiers: {
        short: { type: tierSchema, default: () => ({}) },
        long: { type: tierSchema, default: () => ({}) },
        business: { type: tierSchema, default: () => ({}) }
    }
}, { timestamps: true });

module.exports = mongoose.model('TripSettings', tripSettingsSchema);
