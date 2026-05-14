const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Collaborator middleware — drivers are default CTVs, so both roles are allowed
const collaboratorAuth = (req, res, next) => {
  if (!['collaborator', 'driver'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Collaborator or Driver only.' });
  }
  next();
};

const calculateCollaboratorEarning = (b, cId) => {
  // Check if this booking was created by the collaborator
  const isCTVBooker = b.bookedBy && b.bookedBy.toString() === cId.toString();
  let commission = 0;
  if (isCTVBooker) {
    // Return the ctvCommission if it exists, fallback to standard commission field
    commission = b.pricing?.ctvCommission || (b.pricing?.commission || 0);
  }
  return { commission };
};

router.use(auth, collaboratorAuth);

// Get collaborator earnings
router.get('/earnings', async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'month' } = req.query;
    
    // Fetch all completed bookings booked by this collaborator
    const bookings = await Booking.find({
      bookedBy: userId,
      status: 'completed'
    }).populate('car', 'brand model images').sort({ actualReturnTime: -1, endDate: -1 });

    let startDate = new Date(0);
    const now = new Date();
    if (period === 'week') {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate = new Date();
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const earningsMap = new Map();
    let totalEarnings = 0;
    let totalTrips = 0;

    bookings.forEach(b => {
      const completionDate = b.actualReturnTime || b.endDate;
      if (!completionDate) return;
      if (period !== 'all' && completionDate < startDate) return;
      
      const dateKey = completionDate.toLocaleDateString('en-CA');
      const { commission } = calculateCollaboratorEarning(b, userId);
      
      if (commission > 0) {
        const existing = earningsMap.get(dateKey) || { 
          totalEarnings: 0, 
          trips: 0 
        };
        
        earningsMap.set(dateKey, {
          totalEarnings: existing.totalEarnings + commission,
          trips: existing.trips + 1
        });
        totalEarnings += commission;
        totalTrips += 1;
      }
    });

    const bookingsList = bookings.filter(b => {
      const completionDate = b.actualReturnTime || b.endDate;
      return completionDate && (period === 'all' || completionDate >= startDate);
    }).map(b => {
      let typeLabel = 'Dịch vụ';
      if (b.rentalType === 'self_drive') typeLabel = 'Thuê tự lái';
      else if (b.rentalType === 'with_driver') typeLabel = 'Thuê tài kèm xe';
      else if (b.rentalType === 'driver_only') typeLabel = 'Tài xế riêng';
      else if (b.rentalType === 'trip') typeLabel = 'Theo chuyến';

      return {
        _id: b._id,
        date: b.actualReturnTime || b.endDate,
        carName: b.car ? `${b.car.brand} ${b.car.model}` : 'Dịch vụ hệ thống',
        type: typeLabel,
        commission: calculateCollaboratorEarning(b, userId).commission,
        totalAmount: b.pricing?.totalAmount || 0
      };
    });

    const earningsList = Array.from(earningsMap.entries()).map(([_id, data]) => ({
      _id,
      ...data
    })).sort((a, b) => b._id.localeCompare(a._id));

    res.json({
      earnings: earningsList,
      bookings: bookingsList,
      summary: {
        totalEarnings,
        totalTrips,
        period
      }
    });
  } catch (error) {
    console.error('Collaborator Earnings Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
