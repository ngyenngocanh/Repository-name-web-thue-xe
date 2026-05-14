const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const userRepo = require('../repositories/userRepo');
const carRepo = require('../repositories/carRepo');
const bookingRepo = require('../repositories/bookingRepo');
const notificationRepo = require('../repositories/notificationRepo');

const isMssql = (process.env.DB_PROVIDER || 'mongo').toLowerCase() === 'mssql';

// Driver middleware — also allows collaborators (drivers are default CTVs) and admin for testing
const driverAuth = (req, res, next) => {
  if (!['driver', 'collaborator', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Driver or Collaborator only.' });
  }
  next();
};

// Helper to calculate real driver earnings breakdown
const calculateDriverEarning = (b, dId) => {
  const isHiredDriver = b.driver && b.driver.toString() === dId.toString();
  const isServiceOwner = b.owner && b.owner.toString() === dId.toString();
  
  let driverFee = 0;
  let ownerProfit = 0;

  if (isHiredDriver) {
    driverFee = (b.pricing?.driverTripFee || b.pricing?.driverFee || 0);
  }
  
  if (isServiceOwner) {
    const base = (b.pricing?.totalRentalFee || 0) + (b.pricing?.optionsFee || 0) + (b.pricing?.extraFee || 0);
    const comm = (b.pricing?.commission || 0);
    ownerProfit = (base - comm);
  }
  
  const ctvCommission = (b.bookedBy && b.bookedBy.toString() === dId.toString()) ? (b.pricing?.ctvCommission || 0) : 0;
  
  return {
    driverFee,
    ownerProfit,
    ctvCommission,
    total: driverFee + ownerProfit + ctvCommission
  };
};

// Apply driver middleware to all driver routes
router.use(auth, driverAuth);

// Note: Driver routes use MongoDB models (Car, Booking, Notification).
// MongoDB remains connected even in MSSQL mode, so these routes work fine.
// User data queries use User.findById which reads from MongoDB directly.

// Get driver dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const driverId = req.user._id.toString();
    
    // Calculate proper Today/Tomorrow in Vietnam Timezone (UTC+7)
    const now = new Date();
    const vnNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const todayStr = vnNow.toISOString().split('T')[0]; // "YYYY-MM-DD" VN
    
    // Boundary of "Today VN" in UTC
    const todayStart = new Date(todayStr + "T00:00:00Z");
    todayStart.setHours(todayStart.getHours() - 7);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    let driverCars, todayBookings, currentTrip, allCompleted, notifications, user;

    if (isMssql) {
      // 1. Get driver's cars
      driverCars = await carRepo.getAll({ filter: { ownerId: driverId } });
      
      // 2. Get today's bookings (Schedule)
      todayBookings = await bookingRepo.getAll({
        filter: {
          $or: [{ owner: driverId }, { driver: driverId }],
          status: { $nin: ['cancelled'] },
          overlapStartDate: todayStart,
          overlapEndDate: tomorrowStart
        },
        populate: ['car', 'renter'],
        sort: 'pickupTime ASC',
        limit: 100
      });

      // 3. Get current active trip
      const activeTrips = await bookingRepo.getAll({
        filter: {
          $or: [{ owner: driverId }, { driver: driverId }],
          status: 'active'
        },
        populate: ['car', 'renter'],
        limit: 1
      });
      currentTrip = activeTrips[0] || null;

      // 4. Get all completed trips for earnings
      allCompleted = await bookingRepo.getAll({
        filter: {
          $or: [{ owner: driverId }, { driver: driverId }, { bookedBy: driverId }],
          status: 'completed'
        },
        populate: ['car'],
        limit: 1000
      });

      // 5. Notifications
      notifications = await notificationRepo.getAll({
        filter: { recipient: driverId },
        sort: 'createdAt DESC',
        limit: 10
      });

      // 6. User stats
      user = await userRepo.getUserById(driverId);
    } else {
      // Get driver's cars
      driverCars = await Car.find({ owner: driverId });
      
      // 2. Get today's bookings (Schedule)
      todayBookings = await Booking.find({
        $or: [{ owner: driverId }, { driver: driverId }],
        status: { $nin: ['cancelled'] },
        startDate: { $lt: tomorrowStart },
        endDate: { $gte: todayStart }
      })
      .populate('car', 'brand model images licensePlate')
      .populate('renter', 'fullName phone avatar')
      .sort({ pickupTime: 1 });

      // 3. Get current active trip
      currentTrip = await Booking.findOne({
        $or: [{ owner: driverId }, { driver: driverId }],
        status: 'active'
      })
      .populate('car', 'brand model images licensePlate')
      .populate('renter', 'fullName phone avatar');

      // 4. Get all completed trips to calculate earnings reliably
      allCompleted = await Booking.find({
        $or: [{ owner: driverId }, { driver: driverId }, { bookedBy: driverId }],
        status: 'completed'
      }).populate('car');

      notifications = await Notification.find({
        recipient: driverId,
        recipientType: 'driver'
      })
      .sort({ createdAt: -1 })
      .limit(10);

      user = await User.findById(driverId);
    }
    
    // Common Logic for processing data (same as before)
    const bookingsCompletedToday = allCompleted.filter(b => {
      const compDate = b.actualReturnTime || b.endDate;
      return compDate && compDate >= todayStart && compDate < tomorrowStart;
    });
    const todayEarnings = bookingsCompletedToday.reduce((sum, b) => sum + calculateDriverEarning(b, driverId).total, 0);

    const allTimeEarnings = allCompleted.reduce((sum, b) => sum + calculateDriverEarning(b, driverId).total, 0);
    const totalTripsCount = allCompleted.length;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weeklyEarnings = allCompleted.filter(b => (b.actualReturnTime || b.endDate) >= weekStart)
      .reduce((sum, b) => sum + calculateDriverEarning(b, driverId).total, 0);

    const monthStart = new Date(now);
    monthStart.setMonth(now.getMonth() - 1);
    const monthlyEarnings = allCompleted.filter(b => (b.actualReturnTime || b.endDate) >= monthStart)
      .reduce((sum, b) => sum + calculateDriverEarning(b, driverId).total, 0);

    const recentTrips = [...allCompleted]
      .sort((a, b) => (b.actualReturnTime || b.endDate) - (a.actualReturnTime || a.endDate))
      .slice(0, 10);

    const avgRatingValue = user?.rating?.average || user?.ratingAverage || 0;

    res.json({
      stats: {
        totalTrips: totalTripsCount,
        totalEarnings: allTimeEarnings,
        averageRating: Number(avgRatingValue),
        todayBookings: todayBookings.length
      },
      earnings: {
        today: todayEarnings,
        week: weeklyEarnings,
        month: monthlyEarnings,
        allTime: allTimeEarnings
      },
      currentTrip,
      todayTrips: todayBookings,
      recentTrips,
      notifications,
      schedules: user?.driverSchedules || (user?.driverSchedulesJson ? JSON.parse(user.driverSchedulesJson) : []),
      isOnline: req.user.isOnline || false
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get driver's trips
router.get('/trips', async (req, res) => {
  try {
    const driverId = req.user._id.toString();
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let trips, total;

    if (isMssql) {
      const filter = {
        $or: [{ owner: driverId }, { driver: driverId }]
      };
      if (status) filter.status = status;

      [trips, total] = await Promise.all([
        bookingRepo.getAll({ 
          filter, 
          skip, 
          limit: parseInt(limit), 
          sort: 'createdAt DESC', 
          populate: ['car', 'renter', 'driver'] 
        }),
        bookingRepo.countDocuments(filter)
      ]);
    } else {
      // Get driver's cars
      const driverCars = await Car.find({ owner: driverId });
      const carIds = driverCars.map(car => car._id);
      
      const orConditions = [{ driver: driverId }];
      if (carIds.length > 0) orConditions.push({ car: { $in: carIds } });
      
      const query = { $or: orConditions };
      if (status) query.status = status;

      trips = await Booking.find(query)
        .populate('car', 'brand model licensePlate images')
        .populate('renter', 'fullName phone avatar')
        .populate('driver', 'fullName phone')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      total = await Booking.countDocuments(query);
    }

    res.json({
      trips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching driver trips:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get specific trip details
router.get('/trips/:id', async (req, res) => {
  try {
    let booking;
    if (isMssql) {
      booking = await bookingRepo.getById(req.params.id, ['car', 'renter', 'driver']);
    } else {
      booking = await Booking.findById(req.params.id)
        .populate('car', 'brand model licensePlate images mileage pricing')
        .populate('renter', 'fullName phone avatar isVerified')
        .populate('driver', 'fullName phone');
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start trip
router.put('/trips/:id/start', async (req, res) => {
  try {
    let booking;
    if (isMssql) {
      booking = await bookingRepo.updateBooking(req.params.id, { 
        status: 'active',
        actualPickupTime: new Date()
      });
      if (booking) {
        booking = await bookingRepo.getById(req.params.id, ['car', 'renter']);
        if (booking.car) {
          await carRepo.updateCar(booking.car.id || booking.car, { 
            status: 'active',
            operationalStatus: 'busy'
          });
        }
      }
    } else {
      booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'active',
          actualPickupTime: new Date()
        },
        { new: true }
      ).populate('car renter');

      if (booking && booking.car) {
        await Car.findByIdAndUpdate(booking.car._id, { 
          status: 'active',
          availability: { isAvailable: false } 
        });
      }
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Trip started successfully', booking });
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ message: error.message });
  }
});

// Notify customer that driver has arrived
router.post('/trips/:id/notify-arrival', async (req, res) => {
  try {
    let booking;
    if (isMssql) {
      booking = await bookingRepo.getById(req.params.id);
    } else {
      booking = await Booking.findById(req.params.id);
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Trip is not in confirmed state to notify' });
    }

    const renterId = (booking.renter?.id || booking.renter || '').toString();
    const carId = (booking.car?.id || booking.car || '').toString();

    if (isMssql) {
      await notificationRepo.createNotification({
        recipient: renterId,
        recipientType: 'customer',
        title: '🚕 Tài xế đã đến điểm hẹn',
        message: `Tài xế đã đem xe đến điểm hẹn: ${booking.pickupLocation}. Vui lòng ra nhận xe. Mã đơn: #${booking.id.toString().slice(-6).toUpperCase()}`,
        type: 'booking',
        metadata: { bookingId: booking.id, carId: carId }
      });
    } else {
      await Notification.create({
        recipient: booking.renter,
        recipientType: 'customer',
        title: '🚕 Tài xế đã đến điểm hẹn',
        message: `Tài xế đã đem xe đến điểm hẹn: ${booking.pickupLocation}. Vui lòng ra nhận xe. Mã đơn: #${booking._id.toString().slice(-6).toUpperCase()}`,
        type: 'booking',
        metadata: { bookingId: booking._id, carId: booking.car }
      });
    }

    res.json({ message: 'Đã gửi thông báo đến khách hàng thành công' });
  } catch (error) {
    console.error('Notify arrival error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Complete trip
router.put('/trips/:id/complete', async (req, res) => {
  try {
    const { returnLocation, returnMileage, notes } = req.body;
    
    let booking;
    if (isMssql) {
      booking = await bookingRepo.getById(req.params.id);
    } else {
      booking = await Booking.findById(req.params.id);
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Trip already completed' });
    }

    const bookingId = booking.id || booking._id;
    const carId = booking.car?.id || booking.car;
    const ownerId = booking.owner?.id || booking.owner;
    const driverId = booking.driver?.id || booking.driver;

    // --- FINANCIAL SETTLEMENT ---
    let targetCar;
    if (isMssql) {
      targetCar = await carRepo.getById(carId);
    } else {
      targetCar = await Car.findById(carId);
    }

    const commissionPercent = targetCar?.commissionPercentage || 15;
    const rentalFee = Number(booking.pricing?.totalRentalFee || 0);
    const extraFee = Number(booking.pricing?.extraFee || 0);
    const optionsFee = Number(booking.pricing?.optionsFee || 0);
    const driverTripFee = Number(booking.pricing?.driverTripFee || 0);
    
    const commissionBase = rentalFee + optionsFee + extraFee;
    const commissionAmount = Math.round(commissionBase * (commissionPercent / 100));
    const ownerEarnings = commissionBase - commissionAmount;
    
    const updatedPricing = { ...booking.pricing };
    updatedPricing.commission = commissionAmount;
    updatedPricing.netAmount = ownerEarnings + driverTripFee;
    updatedPricing.extraFee = extraFee;

    const settlement = {
      status: 'settled',
      settledAt: new Date()
    };

    if (isMssql) {
      await bookingRepo.updateBooking(bookingId, {
        status: 'completed',
        actualReturnTime: new Date(),
        returnLocation: returnLocation || booking.returnLocation,
        returnMileage: returnMileage || booking.returnMileage,
        notes: notes || booking.notes,
        pricingJson: JSON.stringify(updatedPricing),
        settlementJson: JSON.stringify(settlement)
      });

      // Update Owner
      const ownerUser = await userRepo.getUserById(ownerId);
      if (ownerUser) {
        const totalEarnings = (ownerUser.totalEarnings || 0) + ownerEarnings;
        const totalTrips = { ...(ownerUser.totalTrips || { asRenter: 0, asOwner: 0 }) };
        totalTrips.asOwner = (totalTrips.asOwner || 0) + 1;
        await userRepo.updateUser(ownerId, { 
          totalEarnings,
          totalTripsJson: JSON.stringify(totalTrips)
        });
      }

      // Update Driver
      if (driverId) {
        const driverUser = await userRepo.getUserById(driverId);
        if (driverUser) {
          const totalEarnings = (driverUser.totalEarnings || 0) + driverTripFee;
          const totalTrips = { ...(driverUser.totalTrips || { asRenter: 0, asOwner: 0 }) };
          totalTrips.asOwner = (totalTrips.asOwner || 0) + 1;
          await userRepo.updateUser(driverId, { 
            totalEarnings,
            totalTripsJson: JSON.stringify(totalTrips)
          });
        }
      }

      // Update Car
      if (targetCar) {
        await carRepo.updateCar(carId, {
          totalTrips: (targetCar.totalTrips || 0) + 1,
          status: 'available',
          operationalStatus: 'available',
          mileage: returnMileage || targetCar.mileage
        });
      }
    } else {
      booking.status = 'completed';
      booking.actualReturnTime = new Date();
      booking.returnLocation = returnLocation || booking.returnLocation;
      booking.returnMileage = returnMileage || booking.returnMileage;
      booking.notes = notes || booking.notes;
      booking.pricing = updatedPricing;
      booking.settlement = settlement;

      const ownerUser = await User.findById(ownerId);
      if (ownerUser) {
        ownerUser.totalEarnings = (ownerUser.totalEarnings || 0) + ownerEarnings;
        ownerUser.totalTrips.asOwner = (ownerUser.totalTrips.asOwner || 0) + 1;
        await ownerUser.save();
      }

      if (driverId) {
        const driverUser = await User.findById(driverId);
        if (driverUser) {
          driverUser.totalEarnings = (driverUser.totalEarnings || 0) + driverTripFee;
          if (!driverUser.totalTrips) driverUser.totalTrips = { asRenter: 0, asOwner: 0 };
          driverUser.totalTrips.asOwner = (driverUser.totalTrips.asOwner || 0) + 1;
          await driverUser.save();
        }
      }

      if (targetCar) {
        targetCar.totalTrips = (targetCar.totalTrips || 0) + 1;
        targetCar.status = 'available';
        targetCar.availability.isAvailable = true;
        targetCar.mileage = returnMileage || targetCar.mileage;
        await targetCar.save();
      }
      await booking.save();
    }

    res.json({ message: 'Trip completed and settled successfully' });
  } catch (error) {
    console.error('Error completing trip:', error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel trip
router.put('/trips/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    
    let booking;
    if (isMssql) {
      booking = await bookingRepo.updateBooking(req.params.id, { 
        status: 'cancelled',
        cancellationJson: JSON.stringify({
          reason,
          cancelledBy: 'driver',
          cancelledAt: new Date()
        })
      });
      if (booking && booking.car) {
        await carRepo.updateCar(booking.car, { 
          status: 'available',
          operationalStatus: 'available'
        });
      }
    } else {
      booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'cancelled',
          cancellation: {
            reason,
            cancelledBy: 'driver',
            cancelledAt: new Date()
          }
        },
        { new: true }
      ).populate('car renter');

      if (booking && booking.car) {
        await Car.findByIdAndUpdate(booking.car._id, { 
          status: 'available',
          availability: { isAvailable: true } 
        });
      }
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Trip cancelled successfully', booking });
  } catch (error) {
    console.error('Error cancelling trip:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update driver online status
router.put('/status', async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    let user;
    if (isMssql) {
      await userRepo.updateUser(req.user._id.toString(), { isOnline });
      user = await userRepo.getUserById(req.user._id.toString());
    } else {
      user = await User.findByIdAndUpdate(
        req.user._id,
        { isOnline },
        { new: true }
      ).select('-password');
    }

    res.json({ message: 'Status updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver earnings - FULL REWRITE for reliability
router.get('/earnings', async (req, res) => {
  try {
    const driverId = req.user._id.toString();
    const { period = 'month' } = req.query;
    
    let bookings;
    if (isMssql) {
      bookings = await bookingRepo.getAll({
        filter: {
          $or: [{ owner: driverId }, { driver: driverId }, { bookedBy: driverId }],
          status: 'completed'
        },
        limit: 1000,
        sort: 'actualReturnTime DESC'
      });
    } else {
      bookings = await Booking.find({
        $or: [{ owner: driverId }, { driver: driverId }, { bookedBy: driverId }],
        status: 'completed'
      }).sort({ actualReturnTime: -1, endDate: -1 });
    }

    // 2. Set start date based on period
    let startDate = new Date(0); // Default for 'all'
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

    // 3. Process and group earnings by day
    const earningsMap = new Map();
    let totalEarnings = 0;
    let totalTrips = 0;

    bookings.forEach(b => {
      const completionDate = b.actualReturnTime || b.endDate;
      if (!completionDate) return;

      // Filter by period in JS for robustness
      if (period !== 'all' && completionDate < startDate) return;
      
      // Use local date (YYYY-MM-DD) for grouping to respect timezone
      const dateKey = completionDate.toLocaleDateString('en-CA');
      const breakdown = calculateDriverEarning(b, driverId);
      
      if (breakdown.total > 0) {
        const existing = earningsMap.get(dateKey) || { 
          totalEarnings: 0, 
          trips: 0, 
          driverFee: 0, 
          ownerProfit: 0,
          ctvCommission: 0 
        };
        
        earningsMap.set(dateKey, {
          totalEarnings: existing.totalEarnings + breakdown.total,
          trips: existing.trips + 1,
          driverFee: existing.driverFee + breakdown.driverFee,
          ownerProfit: existing.ownerProfit + breakdown.ownerProfit,
          ctvCommission: existing.ctvCommission + breakdown.ctvCommission
        });
        totalEarnings += breakdown.total;
        totalTrips += 1;
      }
    });

    // 4. Detailed Bookings List (with individual breakdowns)
    const bookingsList = bookings.filter(b => {
      const completionDate = b.actualReturnTime || b.endDate;
      return completionDate && (period === 'all' || completionDate >= startDate);
    }).map(b => {
      let typeLabel = 'Dịch vụ';
      if (b.rentalType === 'self_drive') typeLabel = 'Thuê tự lái';
      else if (b.rentalType === 'with_driver') typeLabel = 'Thuê tài kèm xe';
      else if (b.rentalType === 'driver_only') typeLabel = 'Tài xế riêng (Ngày/Giờ)';
      else if (b.rentalType === 'trip') typeLabel = 'Thuê theo chuyến';

      return {
        _id: b._id,
        date: b.actualReturnTime || b.endDate,
        carName: b.car?.name || (b.car ? 'Ô tô' : (b.rentalType === 'trip' ? 'Lộ trình chuyến' : 'Dịch vụ tài xế')),
        type: typeLabel,
        pricing: calculateDriverEarning(b, driverId),
        rawPricing: b.pricing
      };
    });

    // 5. Convert map to sorted daily totals array
    const earningsList = Array.from(earningsMap.entries()).map(([_id, data]) => ({
      _id,
      ...data
    })).sort((a, b) => b._id.localeCompare(a._id));

    res.json({
      earnings: earningsList,
      bookings: bookingsList, // FULL LIST FOR THE TABLE
      summary: {
        totalEarnings,
        totalTrips,
        period
      }
    });
  } catch (error) {
    console.error('Earnings Rewrite Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get driver's cars
router.get('/cars', async (req, res) => {
  try {
    let cars;
    if (isMssql) {
      cars = await carRepo.getAll({
        filter: { ownerId: req.user._id.toString() },
        sort: 'createdAt DESC',
        limit: 100
      });
    } else {
      cars = await Car.find({ owner: req.user._id })
        .select('brand model year licensePlate color images status approvalStatus operationalStatus rating totalTrips mileage pricing location')
        .sort({ createdAt: -1 });
    }

    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add pickup/return inspection
router.post('/trips/:id/inspection', async (req, res) => {
  try {
    const { type, images, notes, mileage, fuelLevel } = req.body;
    
    if (!['pickup', 'return'].includes(type)) {
      return res.status(400).json({ message: 'Invalid inspection type' });
    }

    const updatePath = `documents.inspection.${type}`;
    const updateData = {
      [`${updatePath}.photos`]: images,
      [`${updatePath}.notes`]: notes,
      [`${updatePath}.mileage`]: Number(mileage),
      [`${updatePath}.fuelLevel`]: Number(fuelLevel),
      [`${updatePath}.signedBy`]: req.user.fullName,
      [`${updatePath}.signedAt`]: new Date()
    };

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Inspection recorded successfully', booking });
  } catch (error) {
    console.error('Inspection error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to format price
function formatPrice(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

module.exports = router;
