const express = require('express');
const router = express.Router();
const TripSettings = require('../models/TripSettings');
const Car = require('../models/Car');
const auth = require('../middleware/auth');
const admin = auth.isAdmin;

// GET trip settings (Public - needed by CarDetailTrip frontend)
router.get('/', async (req, res) => {
    try {
        let settings = await TripSettings.findOne({ key: 'global_trip_settings' });
        if (!settings) {
            settings = await TripSettings.create({ key: 'global_trip_settings' });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy cài đặt giá chuyến' });
    }
});

// UPDATE trip settings (Admin only)
// Also auto-syncs isWithDriver on all cars in the tier lists
router.post('/', auth, admin, async (req, res) => {
    try {
        const { tiers } = req.body;

        // 1. Save settings
        let settings = await TripSettings.findOneAndUpdate(
            { key: 'global_trip_settings' },
            { tiers },
            { new: true, upsert: true }
        );

        // 2. Collect ALL car IDs that appear in any tier's applicableCars
        const tripCarIds = new Set();
        for (const tierKey of ['short', 'long', 'business']) {
            const cars = tiers?.[tierKey]?.applicableCars || [];
            cars.forEach(id => {
                if (id) tripCarIds.add(id.toString());
            });
        }

        // 3. Set isTripSupport = true for all cars added to any tier
        if (tripCarIds.size > 0) {
            await Car.updateMany(
                { _id: { $in: Array.from(tripCarIds) } },
                { $set: { isTripSupport: true } }
            );
        }

        // 4. Set isTripSupport = false for cars NOT in any tier
        await Car.updateMany(
            {
                isTripSupport: true,
                ...(tripCarIds.size > 0
                    ? { _id: { $nin: Array.from(tripCarIds) } }
                    : {})
            },
            { $set: { isTripSupport: false } }
        );

        res.json({ 
            settings,
            syncedCars: tripCarIds.size,
            message: `Đã lưu cấu hình và bật isWithDriver cho ${tripCarIds.size} xe`
        });
    } catch (error) {
        console.error('TripSettings save error:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật cài đặt giá chuyến' });
    }
});

module.exports = router;
