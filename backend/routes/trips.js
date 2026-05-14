const express = require('express');
const router = express.Router();
const TripConfig = require('../models/TripConfig');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all trip configs
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const configs = await TripConfig.find()
            .populate('applicableCars', 'brand model licensePlate pricePerDay images')
            .sort({ source: 1, destination: 1 });
        res.json(configs);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create new trip config
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { source, destination, fixedPrice, roundTripPrice, description, applicableCars, schedules, stopPoints } = req.body;
        
        const newConfig = new TripConfig({
            source, destination, fixedPrice, roundTripPrice, description, applicableCars, schedules, stopPoints
        });
        
        await newConfig.save();
        res.status(201).json(newConfig);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update trip config
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { fixedPrice, roundTripPrice, description, isActive, applicableCars, schedules, stopPoints } = req.body;
        const config = await TripConfig.findByIdAndUpdate(req.params.id, {
            fixedPrice, roundTripPrice, description, isActive, applicableCars, schedules, stopPoints
        }, { new: true });
        
        if (!config) return res.status(404).json({ message: 'Không tìm thấy cấu hình lộ trình' });
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete trip config
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await TripConfig.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa cấu hình thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Public: Find price for a route for a specific car
router.get('/lookup', async (req, res) => {
    try {
        const { from, to, carId } = req.query;
        if (!from || !to) return res.status(400).json({ message: 'Thiếu điểm đi hoặc điểm đến' });
        
        const query = {
            source: { $regex: new RegExp(`^${from}$`, 'i') },
            destination: { $regex: new RegExp(`^${to}$`, 'i') },
            isActive: true
        };

        // If carId provided, look for config that explicitly includes this car
        // Or handle global configs (if applicableCars is empty)
        if (carId) {
            query.$or = [
                { applicableCars: carId },
                { applicableCars: { $size: 0 } } // Global price if no cars specified
            ];
        }
        
        const config = await TripConfig.findOne(query).sort({ fixedPrice: 1 }); // Prefer cheapest fits
        
        if (config) {
            res.json({ fixedPrice: config.fixedPrice });
        } else {
            res.json({ fixedPrice: null });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Public: Get all fixed routes for a specific car
router.get('/lookup/car', async (req, res) => {
    try {
        const { carId } = req.query;
        const trips = await TripConfig.find({
            isActive: true,
            $or: [
                { applicableCars: carId },
                { applicableCars: { $size: 0 } }
            ]
        }).sort({ source: 1, destination: 1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
