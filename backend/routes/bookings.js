const express = require("express");
const { body, validationResult } = require("express-validator");
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const User = require("../models/User");
const Address = require("../models/Address");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const bookingRepo = require('../repositories/bookingRepo');
const carRepo = require('../repositories/carRepo');
const userRepo = require('../repositories/userRepo');
const addressRepo = require('../repositories/addressRepo');
const notificationRepo = require('../repositories/notificationRepo');

const isMssql = process.env.DB_PROVIDER === 'mssql';

const router = express.Router();

function getCarOwnerId(car) {
  if (!car) return null;
  const owner = car.owner || car.ownerId;
  if (!owner) return null;
  if (typeof owner === 'object') return owner._id || owner.id || null;
  return owner;
}

function hasManualBlockForDates(car, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const blocks = car?.availability?.unavailableDates || [];
  if (!Array.isArray(blocks) || blocks.length === 0) return false;
  return blocks.some((b) => {
    const bs = new Date(b.startDate || b.start || b.from);
    const be = new Date(b.endDate || b.end || b.to);
    if (!bs || !be || Number.isNaN(bs.getTime()) || Number.isNaN(be.getTime())) return false;
    return (bs <= start && be >= start) || (bs <= end && be >= end) || (bs >= start && be <= end);
  });
}

// Create new booking
router.post(
  "/",
  auth,
  (req, res, next) => {
    const uploadFields = req.upload.fields([
      { name: 'licenseFront', maxCount: 1 },
      { name: 'licenseBack', maxCount: 1 },
      { name: 'idCardFront', maxCount: 1 },
      { name: 'idCardBack', maxCount: 1 }
    ]);
    uploadFields(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      }
      next();
    });
  },
  // --- PRE-VALIDATION PARSING ---
  (req, res, next) => {
    try {
      // Multer hands us strings. Express-validator needs objects for nested keys.
      if (typeof req.body.payment === 'string') {
        req.body.payment = JSON.parse(req.body.payment);
      }
      if (typeof req.body.pickupLocation === 'string' && req.body.pickupLocation.startsWith('{')) {
        req.body.pickupLocation = JSON.parse(req.body.pickupLocation);
      }
      if (typeof req.body.returnLocation === 'string' && req.body.returnLocation.startsWith('{')) {
        req.body.returnLocation = JSON.parse(req.body.returnLocation);
      }
      if (typeof req.body.trip === 'string' && req.body.trip.startsWith('{')) {
        req.body.trip = JSON.parse(req.body.trip);
      }
    } catch (e) {
      console.warn('Pre-validation parse skip:', e.message);
    }
    next();
  },
  [
    body("rentalType")
      .isIn(["self_drive", "with_driver", "driver_only", "trip"])
      .default("self_drive"),
    body("car")
      .if(body("rentalType").not().equals("driver_only"))
      .custom((value) => {
        if (isMssql) return typeof value === 'string' && value.trim().length > 0;
        // Mongo mode
        const mongoose = require('mongoose');
        return mongoose.isValidObjectId(value);
      })
      .withMessage("Valid car ID required"),
    body("driver")
      .if(body("rentalType").equals("driver_only"))
      .notEmpty()
      .withMessage("Driver selection required"),
    body("startDate").isISO8601().withMessage("Valid start date required"),
    body("endDate")
      .if(body("mode").not().equals("hourly"))
      .isISO8601()
      .withMessage("Valid end date required"),
    body("pickupTime")
      .optional({ checkFalsy: true })
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Valid pickup time required (HH:MM format)"),
    body("returnTime")
      .optional({ checkFalsy: true })
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Valid return time required (HH:MM format)"),
    body("pickupLocation").custom((val) => {
      if (!val) return false;
      if (typeof val === 'string' && val.trim().length > 0) return true;
      if (typeof val === 'object') return true; // Object from middleware parsing
      return false;
    }).withMessage("Pickup location required"),
    body("returnLocation").custom((val) => {
      if (!val) return false;
      if (typeof val === 'string' && val.trim().length > 0) return true;
      if (typeof val === 'object') return true;
      return false;
    }).withMessage("Return location required"),
    body("payment.method").isIn([
      "vnpay",
      "bank_transfer", 
      "cash",
      "zalopay",
      "credit_card",
      "payos",
    ]).withMessage("Valid payment method required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('[BOOKING VALIDATION FAILED]:', JSON.stringify(errors.array(), null, 2));
        return res.status(400).json({ 
          success: false, 
          message: "Dữ liệu không hợp lệ", 
          errors: errors.array() 
        });
      }

      // Parse JSON strings from FormData
      let pickupLocation, returnLocation, payment, clientPricing = null;
      let pickupAddressId, returnAddressId;
      try {
        if (typeof req.body.pickupLocation === 'object' && req.body.pickupLocation !== null) {
          pickupLocation = req.body.pickupLocation;
        } else if (typeof req.body.pickupLocation === 'string' && req.body.pickupLocation.trim().startsWith('{')) {
          pickupLocation = JSON.parse(req.body.pickupLocation);
        } else {
          pickupLocation = req.body.pickupLocation; // Plain string
        }
        
        if (typeof req.body.returnLocation === 'object' && req.body.returnLocation !== null) {
          returnLocation = req.body.returnLocation;
        } else if (typeof req.body.returnLocation === 'string' && req.body.returnLocation.trim().startsWith('{')) {
          returnLocation = JSON.parse(req.body.returnLocation);
        } else {
          returnLocation = req.body.returnLocation; // Plain string
        }
        
        // Handle both payment JSON string and payment[method] format
        if (req.body.payment) {
          if (typeof req.body.payment === 'object') {
            payment = req.body.payment;
          } else {
            payment = JSON.parse(req.body.payment);
          }
        } else if (req.body['payment[method]']) {
          payment = { method: req.body['payment[method]'] };
        } else {
          payment = { method: 'cash' }; // Default
        }
        
        // Create Address records for pickup and return locations
        if (pickupLocation && (pickupLocation.street || pickupLocation.district || pickupLocation.city || pickupLocation.province)) {
          const pProvince = pickupLocation.city || pickupLocation.province || 'Chưa cập nhật';
          const pWard = pickupLocation.district || pickupLocation.ward || 'Chưa cập nhật';
          
          const addrData = {
            street: pickupLocation.street || 'Chưa cập nhật',
            ward: { name: pWard, ward_code: pickupLocation.wardCode || '' },
            province: { name: pProvince, province_code: pickupLocation.cityCode || '' },
            fullAddress: `${pickupLocation.street || 'Chưa cập nhật'}, ${pWard}, ${pProvince}`,
            addressType: 'pickup',
            owner: req.userId,
            referenceType: 'User',
            referenceId: req.userId
          };

          if (isMssql) {
            const addr = await addressRepo.createAddress(addrData);
            pickupAddressId = addr.id;
          } else {
            const pickupAddress = new Address(addrData);
            await pickupAddress.save();
            pickupAddressId = pickupAddress._id;
          }
          console.log('Created pickup address:', pickupAddressId);
        }
        
        if (returnLocation && (returnLocation.street || returnLocation.district || returnLocation.city || returnLocation.province)) {
          const rProvince = returnLocation.city || returnLocation.province || 'Chưa cập nhật';
          const rWard = returnLocation.district || returnLocation.ward || 'Chưa cập nhật';

          const addrData = {
            street: returnLocation.street || 'Chưa cập nhật',
            ward: { name: rWard, ward_code: returnLocation.wardCode || '' },
            province: { name: rProvince, province_code: returnLocation.cityCode || '' },
            fullAddress: `${returnLocation.street || 'Chưa cập nhật'}, ${rWard}, ${rProvince}`,
            addressType: 'dropoff',
            owner: req.userId,
            referenceType: 'User',
            referenceId: req.userId
          };

          if (isMssql) {
            const addr = await addressRepo.createAddress(addrData);
            returnAddressId = addr.id;
          } else {
            const returnAddress = new Address(addrData);
            await returnAddress.save();
            returnAddressId = returnAddress._id;
          }
          console.log('Created return address:', returnAddressId);
        }

        // Parse client-provided pricing breakdown
        if (req.body.pricing) {
          if (typeof req.body.pricing === 'object') clientPricing = req.body.pricing;
          else clientPricing = JSON.parse(req.body.pricing);
        }
      } catch (parseError) {
        console.error('Booking parse error:', parseError);
        console.error('Request body:', req.body);
        return res.status(400).json({ message: 'Invalid JSON in form data: ' + parseError.message });
      }

      const {
        car: carId,
        driver: driverId,
        rentalType,
        mode,
        startDate,
        endDate,
        pickupTime,
        returnTime,
        hours
      } = req.body;


      let targetOwner;
      let targetCar = null;
      let targetDriver = null;

      // 1. Initial Data Fetch & Verification
      if (rentalType !== "driver_only") {
        if (isMssql) {
          const carRepo = require('../repositories/carRepo');
          targetCar = await carRepo.getById(carId, ['owner', 'address']);
        } else {
          targetCar = await Car.findById(carId);
        }
        if (!targetCar)
          return res.status(404).json({ message: "Car not found" });
        // Support both old (status='approved') and new (approvalStatus='approved') schema
        const carIsApproved = targetCar.approvalStatus === 'approved' || targetCar.status === 'approved';
        if (!carIsApproved)
          return res.status(400).json({ message: "Car is not approved" });
        targetOwner = getCarOwnerId(targetCar);

        // Check car availability only for daily mode
        if (mode !== 'hourly') {
          // 1. Check for conflicting bookings in DB
          if (isMssql) {
            const { checkAvailability } = require('../repositories/bookingRepo');
            const availRes = await checkAvailability(carId, startDate, endDate);
            if (!availRes.available) {
              const offender = availRes.offender;
              return res.status(400).json({ 
                 message: `Xe đã bận từ ${new Date(offender?.startDate).toLocaleDateString('vi-VN')} đến ${new Date(offender?.endDate).toLocaleDateString('vi-VN')}${offender ? ' (Đơn #' + offender._id.toString().slice(-6) + ')' : ''}`,
                 offenderId: offender?._id
              });
            }
          } else {
            const isCarAvailable = await Booking.isCarAvailable(
              carId,
              startDate,
              endDate,
            );
            if (!isCarAvailable) {
              // Find the offender for better debugging
              const offender = await Booking.findOne({
                 car: carId,
                 status: { $in: ['confirmed', 'active'] }, // Matching isCarAvailable filter
                 $or: [
                   { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(startDate) } },
                   { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(endDate) } }
                 ]
              });
              return res.status(400).json({ 
                 message: `Xe đã bận từ ${new Date(offender?.startDate).toLocaleDateString('vi-VN')} đến ${new Date(offender?.endDate).toLocaleDateString('vi-VN')}${offender ? ' (Đơn #' + offender._id.toString().slice(-6) + ')' : ''}`,
                 offenderId: offender?._id
              });
            }
          }

          // 2. Check for manual blocks in Car model
          if (targetCar) {
            const manualBlocked = isMssql
              ? hasManualBlockForDates(targetCar, startDate, endDate)
              : (typeof targetCar.isAvailableForDates === 'function' ? !targetCar.isAvailableForDates(startDate, endDate) : hasManualBlockForDates(targetCar, startDate, endDate));
            if (manualBlocked) {
              return res.status(400).json({ message: "Lịch xe đã bị chặn thủ công bởi chủ xe trong thời gian này" });
            }
          }
        }
      } else {
        if (isMssql) {
          targetDriver = await userRepo.getUserById(driverId);
        } else {
          targetDriver = await User.findById(driverId);
        }
        if (!targetDriver || targetDriver.role !== "driver") {
          return res.status(404).json({ message: "Driver not found" });
        }
        targetOwner = targetDriver._id || targetDriver.id;
      }

      // 2. Ownership check
      if (targetOwner && String(targetOwner) === String(req.userId)) {
        // Allow admins to book their own service for testing
        if (req.user?.role !== 'admin') {
          return res.status(400).json({ message: "Bạn không thể đặt chính dịch vụ của mình" });
        }
      }

      // 2. Final Price Calculation
      // 2. Final Price Calculation (Matching frontend perfectly)
      const start = new Date(startDate);
      const end = new Date(endDate || startDate);
      let rentalDays = 1;
      if (mode === 'daily') {
        const diffTime = Math.abs(end - start);
        rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      }

      // Surcharge Calculation (Extra Fee)
      const normalizeProvince = (str) => {
        if (!str) return '';
        return str.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[đĐ]/g, 'd')
          .replace(/\b(tinh|thanh pho|tp\.|tp|quan|huyen|phuong|xa|thi tran)\b/g, '')
          .replace(/[^a-z0-9]/g, '')
          .trim();
      };

      let carCity = targetCar?.location?.city || targetCar?.addressId?.city || targetCar?.addressId?.province?.name || '';
      let carDist = targetCar?.location?.district || targetCar?.addressId?.district || targetCar?.addressId?.ward?.name || '';
      
      const carCityN = normalizeProvince(carCity);
      const carDistN = normalizeProvince(carDist);
      const pCityN = normalizeProvince(pickupLocation?.city || (typeof pickupLocation === 'string' ? pickupLocation : ''));
      const pDistN = normalizeProvince(pickupLocation?.district || '');
      const rCityN = normalizeProvince(returnLocation?.city || (typeof returnLocation === 'string' ? returnLocation : ''));
      const rDistN = normalizeProvince(returnLocation?.district || '');
      
      const oFee = Number(targetCar?.outOfProvinceFee || 200000);
      const iFee = Number(targetCar?.inProvinceFee || 100000);
      
      let extraFee = 0;
      if (carCityN) {
        if (pCityN && pCityN !== carCityN) extraFee += oFee;
        if (rCityN && rCityN !== carCityN && rCityN !== pCityN) extraFee += oFee;
        
        if (pCityN && pCityN === carCityN && pDistN && carDistN && pDistN !== carDistN) extraFee += iFee;
        if (rCityN && rCityN === carCityN && rDistN && carDistN && rDistN !== carDistN && (rCityN !== pCityN || rDistN !== pDistN)) extraFee += iFee;
      }

      // Base Rental Fee
      let totalRentalFee = 0;
      if (rentalType === "driver_only") {
        const rate = (mode === 'hourly') 
          ? (targetDriver.driverInfo?.driverRatePerHour || 100000)
          : (targetDriver.driverInfo?.driverRatePerDay || 500000);
        totalRentalFee = rate * (mode === 'hourly' ? (req.body.hours || 1) : rentalDays);
      } else if (targetCar) {
        let basePrice = 0;
        if (rentalType === "with_driver") {
          if (mode === 'hourly') {
            basePrice = targetCar.pricePerHourWithDriver || (targetCar.pricePerHour + ((targetCar.driverFeePerDay || 500000) / 8));
          } else {
            basePrice = targetCar.pricePerDayWithDriver || (targetCar.pricePerDay + (targetCar.driverFeePerDay || 500000));
          }
        } else {
          if (mode === 'hourly') {
            basePrice = targetCar.pricePerHour || Math.round(targetCar.pricePerDay / 8);
          } else {
            basePrice = targetCar.pricePerDay;
          }
        }
        totalRentalFee = basePrice * (mode === 'hourly' ? (req.body.hours || 1) : rentalDays);
      }

      // Options
      let optionsFee = 0;
      if (req.body.fullInsurance === 'true') optionsFee += 500000;
      if (req.body.gpsRequired === 'true') optionsFee += 100000 * (mode === 'daily' ? rentalDays : 1);
      if (req.body.babyCarSeat === 'true') optionsFee += 100000;
      
      const isTrip = rentalType === 'trip';
      let trip = isTrip ? req.body.trip : undefined;

      if (isTrip && trip) {
          totalRentalFee = Number(trip.totalTripPrice || 0);
      }

      let internalExtraFee = 0;
      if (rentalType === 'driver_only') {
          const tripType = clientPricing?.tripType || req.body.tripType;
          const distance = Number(clientPricing?.distance || req.body.estimatedDistance || 0);
          
          if (tripType === 'business' || tripType === 'tourism') {
              internalExtraFee += 300000;
          }
          if (distance > 300) {
              internalExtraFee += 500000;
          }
      } else if (isTrip) {
          internalExtraFee = Number(req.body.extraFee || 0);
      } else {
          const carCityN = normalizeProvince(targetCar?.location?.city || "");
          const pCityN = normalizeProvince(pickupLocation?.city || "");
          const oFee = Number(targetCar?.outOfProvinceFee || 200000);
          if (pCityN && pCityN !== carCityN) internalExtraFee = oFee;
      }

      let serviceFee = Math.round((totalRentalFee + internalExtraFee) * 0.05);
      if (isTrip) serviceFee = 30000;

      // Extract values from clientPricing OR use computed ones
      const finalExtraFee = Number(clientPricing?.extraFee !== undefined ? clientPricing.extraFee : internalExtraFee);
      const finalServiceFee = Number(clientPricing?.serviceFee !== undefined ? clientPricing.serviceFee : serviceFee);
      const finalRentalFee = Number(clientPricing?.totalRentalFee || clientPricing?.rentalFee || totalRentalFee);
      const finalOptionsFee = Number(clientPricing?.optionsFee !== undefined ? clientPricing.optionsFee : optionsFee);
      const finalTotalAmount = Number(clientPricing?.totalAmount || (finalRentalFee + finalOptionsFee + finalExtraFee + finalServiceFee));
      const finalDeposit = Number(clientPricing?.deposit || Math.round(finalTotalAmount * 0.3));

      // Final pricing object
      const pricing = {
        totalRentalFee: finalRentalFee,
        optionsFee: finalOptionsFee,
        extraFee: finalExtraFee,
        serviceFee: finalServiceFee,
        totalAmount: finalTotalAmount,
        deposit: finalDeposit,
        
        // Detailed trip info - ALWAYS take from client if it's a trip
        distance: Number(clientPricing?.distance || req.body.distance || 0),
        pricePerKm: Number(clientPricing?.pricePerKm || 0),
        multiplier: Number(clientPricing?.multiplier || 1),
        distanceFee: Number(clientPricing?.distanceFee || req.body.distanceFee || 0),
        driverTripFee: Number(clientPricing?.driverTripFee || req.body.driverTripFee || 0),
        tripType: clientPricing?.tripType || req.body.tripType,
        
        // Delivery fee fields - calculated based on actual distance
        deliveryDistance: Number(clientPricing?.deliveryDistance || req.body.deliveryDistance || 0),
        deliveryFee: Number(clientPricing?.deliveryFee || req.body.deliveryFee || 0),
        deliveryRatePerKm: Number(clientPricing?.deliveryRatePerKm || 1000),
        
        dailyRate: mode === 'hourly' || isTrip ? undefined : (finalRentalFee / rentalDays),
        hourlyRate: (mode === 'hourly' && !isTrip) ? (finalRentalFee / (req.body.hours || 1)) : undefined,
        
        // CTV Commission calculation (30% of rental fee) if booked by a collaborator or driver
        ctvCommission: ['collaborator', 'driver'].includes(req.user.role) ? Math.round(finalRentalFee * 0.3) : 0,

        // Driver Fee calculation for payout system
        driverFee: (rentalType === 'with_driver' && targetCar) 
          ? (mode === 'hourly' 
              ? Math.round((targetCar.driverFeePerDay || 500000) / 8 * (req.body.hours || 1))
              : Math.round((targetCar.driverFeePerDay || 500000) * rentalDays))
          : 0
      };

      console.log('Recalculated Pricing Success:', pricing);

      const pickupLocationStr = typeof pickupLocation === 'object' 
        ? `${pickupLocation.street}, ${pickupLocation.district || ''}, ${pickupLocation.city || ''}`
        : pickupLocation;
      const returnLocationStr = typeof returnLocation === 'object'
        ? `${returnLocation.street}, ${returnLocation.district || ''}, ${returnLocation.city || ''}`
        : returnLocation;

      // --- HANDLE RENTER TYPE 'OTHER' (GUEST USER CREATION) ---
      let actualRenterId = req.userId;
      if (req.body.renterType === 'other') {
        const guestEmail = req.body.contactEmail || req.body.passengerEmail || req.body.driverEmail;
        const guestPhone = req.body.contactPhone || req.body.passengerPhone || req.body.driverPhone;
        const guestName = req.body.contactName || req.body.passengerName || req.body.driverName;
        const guestIdCard = req.body.contactIdCard || req.body.passengerIdCard || req.body.driverIdCard;
        const guestDOB = req.body.dateOfBirth;

        if (guestPhone || guestEmail) {
           let guestUser;
           if (isMssql) {
             guestUser = await userRepo.getByEmail(guestEmail) || await userRepo.getByPhone(guestPhone);
           } else {
             guestUser = await User.findOne({ $or: [{ phone: guestPhone }, { email: guestEmail }] });
           }
           if (!guestUser) {
              console.log('--- CREATING NEW GUEST USER ---', guestName);
              const guestData = {
                 fullName: guestName,
                 email: guestEmail || `guest_${Date.now()}@example.com`,
                 phone: guestPhone,
                 idCard: { number: guestIdCard },
                 dateOfBirth: guestDOB || new Date('2000-01-01'),
                 isVerified: true,
                 isActive: true,
                 role: 'user',
                 password: `auto_${Math.random().toString(36).slice(-8)}`
              };
              if (isMssql) {
                guestUser = await userRepo.createUser(guestData);
              } else {
                guestUser = new User(guestData);
                await guestUser.save();
              }
           }
           actualRenterId = guestUser._id || guestUser.id;
        }
      }

      // Check for pre-booking type
      const isPrebook = req.body.bookingType === 'prebook' || clientPricing?.bookingType === 'prebook';
      let prebookDeadline = null;
      let holdDeposit = 0;
      
      if (isPrebook) {
        // Pre-booking: deadline 24 hours before start or 2 hours from now, whichever is earlier
        const now = new Date();
        const start = new Date(startDate);
        const deadline24h = new Date(start.getTime() - 24 * 60 * 60 * 1000);
        const deadline2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        prebookDeadline = deadline24h < deadline2h ? deadline24h : deadline2h;
        
        // Hold deposit: 10% of total or minimum 100,000đ
        holdDeposit = Math.max(Math.round(finalTotalAmount * 0.1), 100000);
        
        console.log('[PREBOOK] Created pre-booking, deadline:', prebookDeadline, 'holdDeposit:', holdDeposit);
      }

      // Create the final booking document
      const bookingData = {
        car: carId || undefined,
        driver:
          driverId || (['with_driver', 'trip'].includes(rentalType) ? targetOwner : undefined),
        rentalType,
        mode,
        renter: actualRenterId,
        bookedBy: req.userId,
        owner: targetOwner,
        startDate,
        endDate: mode === 'hourly' ? startDate : endDate,
        pickupTime,
        returnTime,
        pickupLocation: pickupLocationStr,
        returnLocation: returnLocationStr,
        pickupAddress: pickupAddressId,
        returnAddress: returnAddressId,
        duration: { days: mode === 'hourly' ? 0 : rentalDays },
        pricing,
        trip,
        extraFee: finalExtraFee,
        renterType: req.body.renterType || 'self',
        // Pre-booking fields
        bookingType: isPrebook ? 'prebook' : 'immediate',
        prebook: isPrebook ? {
          deadline: prebookDeadline,
          status: 'holding',
          holdDeposit: holdDeposit
        } : undefined,
        contactInfo: {
           name: req.body.contactName || req.body.passengerName || req.body.driverName,
           phone: req.body.contactPhone || req.body.passengerPhone || req.body.driverPhone,
           email: req.body.contactEmail || req.body.passengerEmail || req.body.driverEmail,
           idCard: req.body.contactIdCard || req.body.passengerIdCard || req.body.driverIdCard,
           licenseNumber: req.body.drivingLicense,
           licenseClass: req.body.licenseClass
        },
        passengerCount: Number(req.body.passengerCount || 1),
        driverPreference: req.body.driverPreference,
        options: {
          fullInsurance: req.body.fullInsurance === 'true' || req.body.fullInsurance === true,
          gpsRequired: req.body.gpsRequired === 'true' || req.body.gpsRequired === true,
          babyCarSeat: req.body.babyCarSeat === 'true' || req.body.babyCarSeat === true,
          fuelFull: req.body.fuelFull === 'true' || req.body.fuelFull === true
        },
        longTermAgreements: {
          driverGuarantees: req.body.driverGuarantees === 'true' || req.body.driverGuarantees === true,
          carPreservation: req.body.carPreservation === 'true' || req.body.carPreservation === true,
        },
        notes: req.body.notes,
        payment: {
          ...payment,
          status: "pending",
        },
      };

      let booking;
      if (isMssql) {
        const { createBooking, getById } = require('../repositories/bookingRepo');
        const inserted = await createBooking(bookingData);
        // We will fetch full populated info later
        booking = inserted;
      } else {
        booking = new Booking(bookingData);
        await booking.save();
      }

      // 3. Post-booking updates
      // Chỉ thêm unavailableDates cho xe khi là booking ngay (immediate), không thêm cho pre-book
      if (targetCar && !isPrebook) {
        if (isMssql) {
          const carRepo = require('../repositories/carRepo');
          await carRepo.updateCar(carId, { operationalStatus: 'rented' });
        } else {
          await targetCar.addUnavailableDates(
            startDate,
            endDate,
            "booking",
            booking._id,
          );
          targetCar.operationalStatus = 'rented';
          await targetCar.save();
        }
      }

      if (isMssql) {
        const { populateRefs } = require('../repositories/bookingRepo');
        const pop = await populateRefs([booking], ['car', 'driver', 'renter', 'owner']);
        booking = pop[0];
      } else {
        await booking.populate([
          { path: "car", select: "brand model images" },
          { path: "driver", select: "fullName avatar" },
          { path: "renter", select: "fullName email" },
          { path: "owner", select: "fullName email" },
        ]);
      }

      // Gửi thông báo đến chủ xe / tài xế khi có đơn mới
      if (targetOwner && targetOwner.toString() !== req.userId) {
        try {
          let ownerUser;
          if (isMssql) {
            ownerUser = await userRepo.getUserById(targetOwner);
          } else {
            ownerUser = await User.findById(targetOwner);
          }
          let role = ownerUser?.role || 'owner';
          
          const notifData = {
            recipient: targetOwner,
            recipientType: role,
            title: '🎉 Có đơn đặt chuyến mới',
            message: `Khách hàng ${req.body.contactName || req.body.passengerName || 'ẩn danh'} vừa đặt dịch vụ. Mã đơn: #${booking._id.toString().slice(-6).toUpperCase()}`,
            type: 'booking',
            metadata: { bookingId: booking._id, carId: booking.car?._id }
          };

          if (isMssql) {
            await notificationRepo.create(notifData);
          } else {
            await Notification.create(notifData);
          }
        } catch (e) {
          console.error("Lỗi khi tạo thông báo đặt chuyến:", e);
        }
      }

      res.status(201).json({ success: true, message: "Booking completed", booking });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error: " + error.message });
    }
  },
);

// Check car availability before booking (for frontend validation)
router.post("/check-car-availability", auth, async (req, res) => {
  try {
    const { carId, startDate, endDate, pickupTime, returnTime, mode } = req.body;
    
    // Debug log
    console.log('--- CHECK CAR AVAILABILITY ---');
    console.log('Request body:', req.body);
    console.log('carId:', carId);
    console.log('startDate:', startDate);
    console.log('endDate:', endDate);
    console.log('mode:', mode);

    if (!carId || !startDate) {
      return res.status(400).json({ 
        message: "carId and startDate are required",
        received: { carId, startDate }
      });
    }

    let targetCar;
    if (isMssql) {
      const carRepo = require('../repositories/carRepo');
      targetCar = await carRepo.getById(carId, ['owner', 'address']);
    } else {
      targetCar = await Car.findById(carId);
    }
    if (!targetCar) {
      return res.status(404).json({ available: false, message: "Xe không tồn tại" });
    }

    // Check car approval status
    const carIsApproved = targetCar.approvalStatus === 'approved' || targetCar.status === 'approved';
    if (!carIsApproved) {
      return res.status(400).json({ available: false, message: "Xe chưa được phê duyệt" });
    }

    // Only check for conflicts in daily mode (hourly mode is within same day)
    const actualEndDate = mode === 'hourly' ? startDate : (endDate || startDate);
    
    console.log('Car unavailableDates:', targetCar.availability?.unavailableDates);
    console.log('Checking dates:', { startDate, endDate: actualEndDate });

    if (mode !== 'hourly') {
      // 1. Check for conflicting bookings in DB
      if (isMssql) {
        const { checkAvailability } = require('../repositories/bookingRepo');
        const availRes = await checkAvailability(carId, startDate, actualEndDate);
        if (!availRes.available) {
          const offender = availRes.offender;
          const isPrebook = offender?.bookingType === 'prebook';
          return res.status(400).json({ 
             available: false,
             message: isPrebook 
               ? `Xe đang được đặt trước giữ chỗ từ ${new Date(offender?.startDate).toLocaleDateString('vi-VN')} đến ${new Date(offender?.endDate).toLocaleDateString('vi-VN')}${offender ? ' (Đơn đặt trước #' + offender._id.toString().slice(-6) + ')' : ''}`
               : `Xe đã bận từ ${new Date(offender?.startDate).toLocaleDateString('vi-VN')} đến ${new Date(offender?.endDate).toLocaleDateString('vi-VN')}${offender ? ' (Đơn #' + offender._id.toString().slice(-6) + ')' : ''}`,
             offenderId: offender?._id,
             isPrebook: isPrebook
          });
        }
      } else {
        const isCarAvailable = await Booking.isCarAvailable(
          carId,
          startDate,
          actualEndDate,
        );
        
        if (!isCarAvailable) {
          // Find the offender for better debugging
          let offender = await Booking.findOne({
             car: carId,
             status: { $in: ['confirmed', 'active'] },
             $or: [
               { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(startDate) } },
               { startDate: { $lte: new Date(actualEndDate) }, endDate: { $gte: new Date(actualEndDate) } }
             ]
          });
          
          // If no normal booking found, check pre-bookings
          if (!offender) {
            offender = await Booking.findOne({
              car: carId,
              bookingType: 'prebook',
              status: 'pending',
              'prebook.status': 'holding',
              'prebook.deadline': { $gt: new Date() },
              $or: [
                { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(startDate) } },
                { startDate: { $lte: new Date(actualEndDate) }, endDate: { $gte: new Date(actualEndDate) } }
              ]
            });
          }
          
          const isPrebook = offender?.bookingType === 'prebook';
          return res.status(400).json({ 
             available: false,
             message: isPrebook 
               ? `Xe đang được đặt trước giữ chỗ từ ${new Date(offender?.startDate).toLocaleDateString('vi-VN')} đến ${new Date(offender?.endDate).toLocaleDateString('vi-VN')}${offender ? ' (Đơn đặt trước #' + offender._id.toString().slice(-6) + ')' : ''}`
               : `Xe đã bận từ ${new Date(offender?.startDate).toLocaleDateString('vi-VN')} đến ${new Date(offender?.endDate).toLocaleDateString('vi-VN')}${offender ? ' (Đơn #' + offender._id.toString().slice(-6) + ')' : ''}`,
             offenderId: offender?._id,
             isPrebook: isPrebook
          });
        }
      }

      // 2. Check for manual blocks in Car model
      const manualBlocked = isMssql
        ? hasManualBlockForDates(targetCar, startDate, actualEndDate)
        : (typeof targetCar.isAvailableForDates === 'function' ? !targetCar.isAvailableForDates(startDate, actualEndDate) : hasManualBlockForDates(targetCar, startDate, actualEndDate));
      if (manualBlocked) {
        return res.status(400).json({
          available: false,
          message: "Lịch xe đã bị chặn thủ công bởi chủ xe trong thời gian này"
        });
      }
    }

    // All checks passed
    res.json({ 
      available: true, 
      message: "Xe khả dụng trong thời gian này",
      car: {
        _id: targetCar._id,
        brand: targetCar.brand,
        model: targetCar.model
      }
    });
  } catch (error) {
    console.error('Check car availability error:', error);
    res.status(500).json({ available: false, message: "Server error: " + error.message });
  }
});

// Bulk cancel all pending/confirmed bookings for a user
router.put("/my/cancel-all", auth, async (req, res) => {
  try {
    if (isMssql) {
      const { getSqlPool, sql } = require('../db/sqlServer');
      const pool = await getSqlPool();
      const result = await pool.request()
        .input('userId', sql.VarChar(24), req.userId)
        .query(`
          UPDATE dbo.Bookings 
          SET status = 'cancelled', 
              cancellationJson = JSON_MODIFY(ISNULL(cancellationJson, '{}'), '$.reason', 'User bulk cancel'),
              updatedAt = SYSUTCDATETIME()
          WHERE (renterId = @userId OR bookedById = @userId)
          AND status IN ('pending', 'confirmed', 'active')
        `);
      return res.json({ message: `Đã hủy ${result.rowsAffected[0]} chuyến đi` });
    }

    const filter = {
      $or: [{ renter: req.userId }, { bookedBy: req.userId }],
      status: { $in: ["pending", "confirmed", "active"] }
    };
    const bookings = await Booking.find(filter);
    
    for (const booking of bookings) {
      booking.status = "cancelled";
      booking.cancellation = {
        reason: "User bulk cancel",
        cancelledBy: req.userId,
        cancelledAt: new Date()
      };
      if (booking.car) {
        const car = await Car.findById(booking.car);
        if (car) await car.removeUnavailableDates(booking._id);
      }
      await booking.save();
    }
    
    res.json({ message: `Đã hủy ${bookings.length} chuyến đi` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during bulk cancel" });
  }
});

// Clear (delete) all completed/cancelled history for a user
router.delete("/my/clear-history", auth, async (req, res) => {
  try {
    if (isMssql) {
      const { getSqlPool, sql } = require('../db/sqlServer');
      const pool = await getSqlPool();
      const result = await pool.request()
        .input('userId', sql.VarChar(24), req.userId)
        .query(`
          DELETE FROM dbo.Bookings 
          WHERE (renterId = @userId OR bookedById = @userId)
          AND status IN ('completed', 'cancelled')
        `);
      return res.json({ message: `Đã xóa ${result.rowsAffected[0]} bản ghi lịch sử` });
    }

    const filter = {
      $or: [{ renter: req.userId }, { bookedBy: req.userId }],
      status: { $in: ["completed", "cancelled"] }
    };
    const result = await Booking.deleteMany(filter);
    res.json({ message: `Đã xóa ${result.deletedCount} bản ghi lịch sử` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during historical clear" });
  }
});

// Get booking by ID
router.get("/:id", auth, async (req, res) => {
  try {
    let booking;
    if (isMssql) {
      const { getById, populateRefs } = require('../repositories/bookingRepo');
      booking = await getById(req.params.id);
      if (booking) {
        const pop = await populateRefs([booking], ['car', 'renter', 'owner', 'driver']);
        booking = pop[0];
        
        // Ensure properties for frontend exist
        if (booking.car && typeof booking.car === 'object') {
          // Select: brand model year images licensePlate location
          booking.car = {
            _id: booking.car._id || booking.car.id,
            brand: booking.car.brand,
            model: booking.car.model,
            year: booking.car.year,
            images: booking.car.images,
            licensePlate: booking.car.licensePlate,
            location: booking.car.location
          };
        }
      }
    } else {
      booking = await Booking.findById(req.params.id)
        .populate("car", "brand model year images licensePlate location")
        .populate("renter", "fullName email phone avatar")
        .populate("owner", "fullName email phone avatar")
        .populate("driver", "fullName email phone avatar");
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    console.log('Get booking pricing:', booking.pricing);

    // Check if user is authorized to view this booking
    const renterObj = booking.renter || {};
    const ownerObj = booking.owner || {};
    const renterId = (renterObj._id || renterObj.id || booking.renterId || booking.renter).toString();
    const ownerId = (ownerObj._id || ownerObj.id || booking.ownerId || booking.owner).toString();
    
    // Support both mongoose (bookedBy._id) and plain object (bookedById)
    const bookedById = booking.bookedBy ? (booking.bookedBy._id || booking.bookedBy.id || booking.bookedById || booking.bookedBy).toString() : null;
    const currentUserId = req.userId.toString();

    if (
      renterId !== currentUserId &&
      ownerId !== currentUserId &&
      bookedById !== currentUserId &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this booking" });
    }

    res.json({ booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's bookings (as renter)
router.get("/my/rentals", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = { 
      $or: [
        { renter: req.userId }, 
        { bookedBy: req.userId }
      ] 
    };
    if (status) {
      filter.status = status;
    }
    
    console.log('--- MY RENTALS FILTER ---', JSON.stringify(filter));

    let bookings, total;
    if (isMssql) {
      const { getAll, countDocuments } = require('../repositories/bookingRepo');
      [bookings, total] = await Promise.all([
        getAll({ filter, skip, limit, sort: 'createdAt DESC', populate: ['car', 'owner', 'driver'] }),
        countDocuments(filter)
      ]);
    } else {
      [bookings, total] = await Promise.all([
        Booking.find(filter)
          .populate("car", "brand model year images licensePlate location")
          .populate("owner", "fullName avatar rating")
          .populate("driver", "fullName avatar")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Booking.countDocuments(filter)
      ]);
    }

    res.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's bookings (as owner)
router.get("/my/bookings", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, carId } = req.query;
    const filter = { ownerId: req.userId }; // Using ownerId instead of owner to match SQL param logic or map it directly. Wait, bookingRepo getAll handles `filter.ownerId`
    // Actually, let's map owner to ownerId
    if (status) {
      filter.status = status;
    }
    if (carId) {
      filter.carId = carId;
    }

    let bookings, total;
    if (isMssql) {
      const { getAll, countDocuments } = require('../repositories/bookingRepo');
      [bookings, total] = await Promise.all([
        getAll({ filter, skip, limit, sort: 'createdAt DESC', populate: ['car', 'renter', 'driver'] }),
        countDocuments(filter)
      ]);
    } else {
      const mongoFilter = { owner: req.userId };
      if (status) mongoFilter.status = status;
      if (carId) mongoFilter.car = carId;

      [bookings, total] = await Promise.all([
        Booking.find(mongoFilter)
          .populate("car", "brand model year images licensePlate location")
          .populate("renter", "fullName avatar rating")
          .populate("driver", "fullName avatar")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Booking.countDocuments(mongoFilter)
      ]);
    }

    res.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Finalize booking (confirm with payment)
router.put(
  "/:id/finalize",
  auth,
  [
    body("payment.method").isIn([
      "vnpay",
      "bank_transfer",
      "cash",
      "zalopay",
      "credit_card",
      "payos",
    ]),
  ],
  async (req, res) => {
    try {
      let booking;
      if (isMssql) {
        const { getById, updateBooking } = require('../repositories/bookingRepo');
        booking = await getById(req.params.id);
        
        if (!booking)
          return res.status(404).json({ message: "Booking not found" });

        const renterIdStr = (booking.renterId || booking.renter).toString();
        const bookedByIdStr = booking.bookedById ? booking.bookedById.toString() : (booking.bookedBy ? booking.bookedBy.toString() : null);
        
        const isRenter = renterIdStr === req.userId;
        const isBookedBy = bookedByIdStr === req.userId;
        const isAdmin = req.user.role === 'admin';

        if (!isRenter && !isBookedBy && !isAdmin) {
          return res.status(403).json({ message: "Not authorized to finalize this booking" });
        }

        const payment = booking.payment || {};
        payment.method = req.body.payment.method;
        payment.status = "pending";

        booking = await updateBooking(req.params.id, { paymentJson: JSON.stringify(payment) });
      } else {
        booking = await Booking.findById(req.params.id);
        if (!booking)
          return res.status(404).json({ message: "Booking not found" });

        // Allow either the renter, the person who created the booking (bookedBy), or an admin
        const isRenter = booking.renter.equals(req.userId);
        const isBookedBy = booking.bookedBy && booking.bookedBy.equals(req.userId);
        const isAdmin = req.user.role === 'admin';

        if (!isRenter && !isBookedBy && !isAdmin) {
          return res
            .status(403)
            .json({ message: "Not authorized to finalize this booking" });
        }

        booking.payment.method = req.body.payment.method;
        booking.payment.status = "pending"; 

        await booking.save();
      }

      res.json({ message: "Booking finalized successfully", booking });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Update booking status
router.put(
  "/:id/status",
  auth,
  [body("status").isIn(["confirmed", "cancelled", "completed"])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status } = req.body;
      let booking;
      
      if (isMssql) {
        const { getById } = require('../repositories/bookingRepo');
        booking = await getById(req.params.id);
      } else {
        booking = await Booking.findById(req.params.id);
      }

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check authorization
      console.log('--- STATUS UPDATE AUTH CHECK ---');
      console.log('Request UserID:', req.userId);
      
      const ownerIdStr = (booking.ownerId || booking.owner).toString();
      const renterIdStr = (booking.renterId || booking.renter).toString();
      const bookedByIdStr = booking.bookedById ? booking.bookedById.toString() : (booking.bookedBy ? booking.bookedBy.toString() : null);
      const driverIdStr = booking.driverId ? booking.driverId.toString() : (booking.driver ? booking.driver.toString() : null);

      const currentUserIdStr = req.userId.toString();
      const isOwner = ownerIdStr === currentUserIdStr;
      const isRenter = renterIdStr === currentUserIdStr;
      const isBookedBy = bookedByIdStr === currentUserIdStr;
      const isAdmin = req.user && req.user.role === "admin";
      
      console.log('isOwner:', isOwner, 'isRenter:', isRenter, 'isBookedBy:', isBookedBy, 'isAdmin:', isAdmin);

      // Define allowed status changes per role
      const allowedChanges = {
        owner: ["confirmed", "cancelled", "completed"],
        renter: ["cancelled", "completed"],
        admin: ["confirmed", "cancelled", "completed"],
        driver: ["completed"],
      };

      let userRole;
      if (isOwner) userRole = "owner";
      else if (isRenter || isBookedBy) userRole = "renter";
      else if (isAdmin) userRole = "admin";
      else if (driverIdStr === currentUserIdStr) userRole = "driver";
      else {
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }

      if (!allowedChanges[userRole].includes(status)) {
        return res
          .status(403)
          .json({ message: "Not authorized to change status to " + status });
      }

      if (isMssql) {
        const { updateBooking, populateRefs } = require('../repositories/bookingRepo');
        const carRepo = require('../repositories/carRepo');
        let updates = { status };
        
        if (status === "confirmed" && booking.status !== "confirmed") {
          updates.confirmedAt = new Date();
          try {
            const { create } = require('../repositories/notificationRepo');
            await create({
              recipient: booking.renterId || booking.renter,
              recipientType: "user",
              title: "✅ Đơn đặt xe đã được duyệt",
              message: `Đơn vị/Chủ xe vừa xác nhận duyệt đơn đặt xe #${String(booking._id || booking.id).slice(-6).toUpperCase()} của bạn. Bạn vui lòng chuẩn bị cho hành trình sắp tới nhé!`,
              type: "booking",
              metadata: { bookingId: booking._id || booking.id, carId: booking.carId || booking.car }
            });
          } catch(err) {
            console.error("Lỗi gửi thông báo xác nhận đơn cho khách:", err);
          }
        }
        
        if (status === "cancelled") {
          updates.cancelledAt = new Date();
          const reason = req.body.reason || "User cancelled";
          updates.cancellationReason = reason;
          const cancellation = {
            reason,
            cancelledBy: req.userId,
            cancelledAt: new Date()
          };
          updates.cancellationJson = JSON.stringify(cancellation);
          
          // MSSQL mode: availability is checked by bookingRepo; only need to free operationalStatus
          const carId = booking.carId || booking.car;
          if (carId) {
            try {
              await carRepo.updateCar(String(carId), { operationalStatus: 'available' });
            } catch (e) {
              console.error('[MSSQL] Failed to set car operationalStatus=available on cancel:', e.message);
            }
          }
        }
        
        if (status === "completed" && booking.status !== "completed") {
          const carId = booking.carId || booking.car;
          if (carId) {
            try {
              await carRepo.updateCar(String(carId), { operationalStatus: 'available' });
            } catch (e) {
              console.error('[MSSQL] Failed to set car operationalStatus=available on complete:', e.message);
            }
          }
          
          const pricing = booking.pricing || {};
          const bookedById = booking.bookedById || booking.bookedBy;
          let bookedByUser = null;
          if (bookedById) bookedByUser = await userRepo.getUserById(bookedById);
          
          const isCTVBooking = bookedByUser && ['collaborator', 'driver'].includes(bookedByUser.role);
          const commissionPercent = isCTVBooking ? 30 : (pricing.commissionPercentage || 15);
          
          const rentalFee = Number(pricing.totalRentalFee || 0);
          const extraFee = Number(pricing.extraFee || 0);
          const optionsFee = Number(pricing.optionsFee || 0);
          const driverTripFee = Number(pricing.driverTripFee || 0);

          const commissionBase = rentalFee + optionsFee + extraFee;
          const commissionAmount = Math.round(commissionBase * (commissionPercent / 100));
          const ownerEarnings = commissionBase - commissionAmount;
          
          pricing.commission = commissionAmount;
          if (isCTVBooking) pricing.ctvCommission = commissionAmount;
          pricing.netAmount = ownerEarnings + driverTripFee;
          updates.pricingJson = JSON.stringify(pricing);

          // Update earnings & trip counts in SQL
          const { getSqlPool, sql } = require('../db/sqlServer');
          const pool = await getSqlPool();
          
          // 1. Renter trips
          await pool.request().input('uid', sql.VarChar(24), String(booking.renterId || booking.renter)).query(`UPDATE dbo.Users SET totalTripsJson = JSON_MODIFY(ISNULL(totalTripsJson, '{"asRenter":0,"asOwner":0}'), '$.asRenter', CAST(ISNULL(JSON_VALUE(totalTripsJson, '$.asRenter'), 0) AS INT) + 1) WHERE id = @uid`);
          
          // 2. Owner earnings & trips
          await pool.request().input('uid', sql.VarChar(24), String(booking.ownerId || booking.owner)).input('earned', sql.Decimal(18, 2), ownerEarnings).query(`UPDATE dbo.Users SET totalEarnings = ISNULL(totalEarnings, 0) + @earned, totalTripsJson = JSON_MODIFY(ISNULL(totalTripsJson, '{"asRenter":0,"asOwner":0}'), '$.asOwner', CAST(ISNULL(JSON_VALUE(totalTripsJson, '$.asOwner'), 0) AS INT) + 1) WHERE id = @uid`);
          
          // 3. Driver earnings & trips
          if (booking.driverId || booking.driver) {
            await pool.request().input('uid', sql.VarChar(24), String(booking.driverId || booking.driver)).input('earned', sql.Decimal(18, 2), driverTripFee).query(`UPDATE dbo.Users SET totalEarnings = ISNULL(totalEarnings, 0) + @earned, totalTripsJson = JSON_MODIFY(ISNULL(totalTripsJson, '{"asRenter":0,"asOwner":0}'), '$.asOwner', CAST(ISNULL(JSON_VALUE(totalTripsJson, '$.asOwner'), 0) AS INT) + 1) WHERE id = @uid`);
          }
          
          // 4. CTV earnings
          if (isCTVBooking && bookedById) {
            await pool.request().input('uid', sql.VarChar(24), String(bookedById)).input('earned', sql.Decimal(18, 2), commissionAmount).query(`UPDATE dbo.Users SET totalEarnings = ISNULL(totalEarnings, 0) + @earned WHERE id = @uid`);
          }

          const settlement = { status: 'settled', settledAt: new Date() };
          updates.settlementJson = JSON.stringify(settlement);
          
          const payment = booking.payment || {};
          payment.status = 'paid';
          payment.paidAt = new Date();
          updates.paymentJson = JSON.stringify(payment);
        }
        
        booking = await updateBooking(req.params.id, updates);
        const pop = await populateRefs([booking], ['car', 'renter', 'owner', 'driver']);
        booking = pop[0];
        
      } else {
        // Handle booking confirmation & notification
        if (status === "confirmed" && booking.status !== "confirmed") {
          try {
            const notifyUser = new Notification({
              recipient: booking.renter,
              recipientType: "user",
              title: "✅ Đơn đặt xe đã được duyệt",
              message: `Đơn vị/Chủ xe vừa xác nhận duyệt đơn đặt xe #${booking._id.toString().slice(-6).toUpperCase()} của bạn. Bạn vui lòng chuẩn bị cho hành trình sắp tới nhé!`,
              type: "booking",
              metadata: { bookingId: booking._id, carId: booking.car }
            });
            await notifyUser.save();
          } catch(err) {
            console.error("Lỗi gửi thông báo xác nhận đơn cho khách:", err);
          }
        }

        // Handle booking cancellation
        if (status === "cancelled") {
          if (booking.car) {
            const car = await Car.findById(booking.car);
            if (car) {
              await car.removeUnavailableDates(booking._id);
              // Tự động cập nhật trạng thái hoạt động xe sang "available" khi booking bị hủy
              car.operationalStatus = 'available';
              await car.save();
              console.log(`[Auto Update] Car ${car._id} operationalStatus set to 'available' (booking cancelled)`);
            }
          }

          booking.cancellation = {
            reason: req.body.reason || "User cancelled",
            cancelledBy: req.userId,
            cancelledAt: new Date(),
          };
        }

        // Handle booking completion & financial settlement
        if (status === "completed" && booking.status !== "completed") {
          const targetCar = await Car.findById(booking.car);
          // 1. Calculate Platform Commission (usually on rental fee + options)
          const bookedByUser = booking.bookedBy ? await User.findById(booking.bookedBy) : null;
          const isCTVBooking = bookedByUser && ['collaborator', 'driver'].includes(bookedByUser.role);
          const commissionPercent = isCTVBooking ? 30 : (targetCar?.commissionPercentage || 15);
          
          const rentalFee = Number(booking.pricing?.totalRentalFee || 0);
          const extraFee = Number(booking.pricing?.extraFee || 0);
          const optionsFee = Number(booking.pricing?.optionsFee || 0);
          const driverTripFee = Number(booking.pricing?.driverTripFee || 0);

          const commissionBase = rentalFee + optionsFee + extraFee;
          const commissionAmount = Math.round(commissionBase * (commissionPercent / 100));
          
          // 2. Net earnings for the Owner (Rental part)
          const ownerEarnings = commissionBase - commissionAmount;
          
          booking.pricing.commission = commissionAmount;
          if (isCTVBooking) {
              booking.pricing.ctvCommission = commissionAmount; // Store explicitly if it's CTV
          }
          booking.pricing.netAmount = ownerEarnings + driverTripFee; // Total net stored in booking
          booking.pricing.extraFee = extraFee; // Ensure persisted
          
          // Update CTV earnings if applicable
          if (isCTVBooking) {
            const ctvUser = await User.findById(booking.bookedBy);
            if (ctvUser) {
              ctvUser.totalEarnings = (ctvUser.totalEarnings || 0) + commissionAmount;
              await ctvUser.save();
              console.log(`Updated CTV ${ctvUser.fullName} earnings: +${commissionAmount}`);
            }
          }

          // 3. Update Owner/Collaborator Earnings
          const ownerUser = await User.findById(booking.owner);
          if (ownerUser) {
            ownerUser.totalEarnings = (ownerUser.totalEarnings || 0) + ownerEarnings;
            ownerUser.totalTrips.asOwner = (ownerUser.totalTrips.asOwner || 0) + 1;
            await ownerUser.save();
            console.log(`Updated owner ${ownerUser.fullName} earnings: +${ownerEarnings}`);
          }

          // 4. Update Driver Earnings (if exists)
          if (booking.driver) {
            const driverUser = await User.findById(booking.driver);
            if (driverUser) {
              // Driver gets the driverTripFee (travel allowance)
              driverUser.totalEarnings = (driverUser.totalEarnings || 0) + driverTripFee;
              // Also increment their trip count
              if (!driverUser.totalTrips) driverUser.totalTrips = { asRenter: 0, asOwner: 0 };
              driverUser.totalTrips.asOwner = (driverUser.totalTrips.asOwner || 0) + 1;
              await driverUser.save();
              console.log(`Updated driver ${driverUser.fullName} earnings: +${driverTripFee}`);
            }
          }

          // 5. Update Car stats and free up unavailable dates
          if (targetCar) {
            targetCar.totalTrips = (targetCar.totalTrips || 0) + 1;
            // Tự động cập nhật trạng thái hoạt động xe sang "available" khi booking hoàn thành
            console.log(`[Status Update] Before - Car ${targetCar._id} operationalStatus: ${targetCar.operationalStatus}, unavailableDates: ${targetCar.availability?.unavailableDates?.length || 0}`);
            targetCar.operationalStatus = 'available';
            // Giải phóng lịch xe bị chặn
            await targetCar.removeUnavailableDates(booking._id);
            await targetCar.save();
          }

          booking.settlement = {
            status: 'settled',
            settledAt: new Date()
          };
          
          booking.payment.status = 'paid';
          booking.payment.paidAt = new Date();
        }

        booking.status = status;
        await booking.save();

        await booking.populate([
          { path: "car", select: "brand model year" },
          { path: "renter", select: "fullName email" },
          { path: "owner", select: "fullName email" },
        ]);
      }

      res.json({
        message: `Booking ${status} successfully`,
        booking,
      });
    } catch (error) {
      console.error('Status update error:', error);
      res.status(500).json({ message: "Server error during status update" });
    }
  }
);

// Add pickup inspection
router.post(
  "/:id/inspection/pickup",
  auth,
  [
    body("mileage").isFloat({ min: 0 }),
    body("fuelLevel").isFloat({ min: 0, max: 100 }),
    body("notes").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let booking;
      const { updateBooking, getById } = require('../repositories/bookingRepo');
      const carRepo = require('../repositories/carRepo');

      if (isMssql) {
        booking = await getById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const ownerId = (booking.ownerId || booking.owner || '').toString();
        if (ownerId !== req.userId && req.user.role !== "admin") {
          return res.status(403).json({ message: "Not authorized" });
        }

        const { mileage, fuelLevel, notes } = req.body;
        const inspection = {
          photos: req.body.photos || [],
          notes,
          mileage,
          fuelLevel,
          signedBy: req.userId,
          signedAt: new Date(),
        };

        const documents = booking.documents || { inspection: {} };
        if (!documents.inspection) documents.inspection = {};
        documents.inspection.pickup = inspection;

        await updateBooking(req.params.id, { 
          status: "active",
          documentsJson: JSON.stringify(documents)
        });

        const carId = booking.carId || booking.car;
        if (carId) {
          await carRepo.updateCar(String(carId), { operationalStatus: 'rented' });
        }
      } else {
        booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.owner.toString() !== req.userId && req.user.role !== "admin") {
          return res.status(403).json({ message: "Not authorized" });
        }

        const { mileage, fuelLevel, notes } = req.body;
        if (!booking.documents) booking.documents = { inspection: {} };
        if (!booking.documents.inspection) booking.documents.inspection = {};
        
        booking.documents.inspection.pickup = {
          photos: req.body.photos || [],
          notes,
          mileage,
          fuelLevel,
          signedBy: req.userId,
          signedAt: new Date(),
        };

        booking.status = "active";
        await booking.save();

        if (booking.car) {
          const car = await Car.findById(booking.car);
          if (car) {
            car.operationalStatus = 'rented';
            await car.save();
          }
        }
      }

      res.json({
        message: "Pickup inspection completed",
        booking,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Add return inspection
router.post(
  "/:id/inspection/return",
  auth,
  [
    body("mileage").isFloat({ min: 0 }),
    body("fuelLevel").isFloat({ min: 0, max: 100 }),
    body("notes").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let booking;
      if (isMssql) {
        booking = await bookingRepo.getById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const ownerId = (booking.ownerId || booking.owner || '').toString();
        if (ownerId !== req.userId && req.user.role !== "admin") {
          return res.status(403).json({ message: "Not authorized" });
        }

        const { mileage, fuelLevel, notes } = req.body;
        const inspection = {
          photos: req.body.photos || [],
          notes,
          mileage,
          fuelLevel,
          signedBy: req.userId,
          signedAt: new Date(),
        };

        const documents = booking.documents || { inspection: {} };
        if (!documents.inspection) documents.inspection = {};
        documents.inspection.return = inspection;

        const payment = booking.payment || {};
        payment.status = 'paid';
        payment.paidAt = new Date();

        await bookingRepo.updateBooking(req.params.id, { 
          status: "completed",
          documentsJson: JSON.stringify(documents),
          paymentJson: JSON.stringify(payment)
        });

        const carId = booking.carId || booking.car;
        if (carId) {
          await carRepo.updateCar(String(carId), { operationalStatus: 'available' });
        }
        
        const pricing = booking.pricing || {};
        const extraFee = Number(pricing.extraFee || 0);
        const optionsFee = Number(pricing.optionsFee || 0);
        const rentalFee = Number(pricing.totalRentalFee || 0);
        const driverTripFee = Number(pricing.driverTripFee || 0);
        const commissionBase = rentalFee + optionsFee + extraFee;
        
        const bookedById = booking.bookedById || booking.bookedBy;
        let bookedByUser = null;
        if (bookedById) bookedByUser = await userRepo.getUserById(bookedById);
        const isCTVBooking = bookedByUser && ['collaborator', 'driver'].includes(bookedByUser.role);
        const commissionPercent = isCTVBooking ? 30 : (pricing.commissionPercentage || 15);
        const commissionAmount = Math.round(commissionBase * (commissionPercent / 100));
        const ownerEarnings = commissionBase - commissionAmount;

        const { getSqlPool, sql } = require('../db/sqlServer');
        const pool = await getSqlPool();
        
        // Update user trip counts & earnings in SQL
        await pool.request().input('uid', sql.VarChar(24), String(booking.renterId || booking.renter)).query(`UPDATE dbo.Users SET totalTripsJson = JSON_MODIFY(ISNULL(totalTripsJson, '{"asRenter":0,"asOwner":0}'), '$.asRenter', CAST(ISNULL(JSON_VALUE(totalTripsJson, '$.asRenter'), 0) AS INT) + 1) WHERE id = @uid`);
        await pool.request().input('uid', sql.VarChar(24), String(booking.ownerId || booking.owner)).input('earned', sql.Decimal(18, 2), ownerEarnings).query(`UPDATE dbo.Users SET totalEarnings = ISNULL(totalEarnings, 0) + @earned, totalTripsJson = JSON_MODIFY(ISNULL(totalTripsJson, '{"asRenter":0,"asOwner":0}'), '$.asOwner', CAST(ISNULL(JSON_VALUE(totalTripsJson, '$.asOwner'), 0) AS INT) + 1) WHERE id = @uid`);
        
        if (booking.driverId || booking.driver) {
          await pool.request().input('uid', sql.VarChar(24), String(booking.driverId || booking.driver)).input('earned', sql.Decimal(18, 2), driverTripFee).query(`UPDATE dbo.Users SET totalEarnings = ISNULL(totalEarnings, 0) + @earned, totalTripsJson = JSON_MODIFY(ISNULL(totalTripsJson, '{"asRenter":0,"asOwner":0}'), '$.asOwner', CAST(ISNULL(JSON_VALUE(totalTripsJson, '$.asOwner'), 0) AS INT) + 1) WHERE id = @uid`);
        }
        if (isCTVBooking && bookedById) {
          await pool.request().input('uid', sql.VarChar(24), String(bookedById)).input('earned', sql.Decimal(18, 2), commissionAmount).query(`UPDATE dbo.Users SET totalEarnings = ISNULL(totalEarnings, 0) + @earned WHERE id = @uid`);
        }
      } else {
        booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.owner.toString() !== req.userId && req.user.role !== "admin") {
          return res.status(403).json({ message: "Not authorized" });
        }

        const { mileage, fuelLevel, notes } = req.body;
        if (!booking.documents) booking.documents = { inspection: {} };
        if (!booking.documents.inspection) booking.documents.inspection = {};
        
        booking.documents.inspection.return = {
          photos: req.body.photos || [],
          notes,
          mileage,
          fuelLevel,
          signedBy: req.userId,
          signedAt: new Date(),
        };

        booking.status = "completed";
        booking.payment.status = 'paid';
        booking.payment.paidAt = new Date();
        await booking.save();

        const car = await Car.findById(booking.car);
        if (car) {
          await car.removeUnavailableDates(booking._id);
          car.operationalStatus = 'available';
          await car.save();
        }

        await User.findByIdAndUpdate(booking.renter, { $inc: { totalTrips: 1 } });
        await User.findByIdAndUpdate(booking.owner, { $inc: { totalTrips: 1 } });
        await Car.findByIdAndUpdate(booking.car, { $inc: { totalTrips: 1 } });
      }

      res.json({
        message: "Return inspection completed",
        booking,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Calculate delivery fee based on distance between car location and pickup/return location
router.post("/calculate-delivery-fee", async (req, res) => {
  try {
    const { carId, pickupLocation, returnLocation, ratePerKm = 1000 } = req.body;
    
    if (!carId || !pickupLocation) {
      return res.status(400).json({ message: "Car ID and pickup location are required" });
    }

    let car;
    if (isMssql) {
      const carRepo = require('../repositories/carRepo');
      car = await carRepo.getById(carId, ['owner', 'address']);
    } else {
      car = await Car.findById(carId);
    }
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const carLocation = car.location || {};
    const carAddress = car.addressId || {};
    
    // Use coordinates if available, otherwise we'll need to geocode
    let carCoords = {
      lat: carLocation.coordinates?.lat || carAddress.coordinates?.lat,
      lng: carLocation.coordinates?.lng || carAddress.coordinates?.lng
    };

    // For now, if no coordinates, calculate based on city/district comparison
    // In production, you should geocode addresses to get coordinates
    let pickupDistance = 0;
    let returnDistance = 0;

    // Calculate distance using OSRM or similar service if coordinates available
    if (carCoords.lat && carCoords.lng && pickupLocation.coordinates) {
      try {
        // Use OSRM demo server for routing calculation
        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${carCoords.lng},${carCoords.lat};${pickupLocation.coordinates.lng},${pickupLocation.coordinates.lat}?overview=false`;
        const response = await fetch(osrmUrl);
        const data = await response.json();
        if (data.routes && data.routes[0]) {
          pickupDistance = data.routes[0].distance / 1000; // Convert to km
        }
      } catch (error) {
        console.log('OSRM calculation failed, using fallback:', error.message);
        // Fallback: calculate straight-line distance (Haversine)
        pickupDistance = calculateHaversineDistance(
          carCoords.lat, carCoords.lng,
          pickupLocation.coordinates.lat, pickupLocation.coordinates.lng
        );
      }
    } else {
      // Fallback: estimate distance based on province/district comparison
      pickupDistance = estimateDistanceByLocation(
        carLocation.city || carAddress.province?.name,
        carLocation.district || carAddress.ward?.name,
        pickupLocation.city,
        pickupLocation.district
      );
    }

    // Calculate return distance if different from pickup
    if (returnLocation && returnLocation.coordinates) {
      if (carCoords.lat && carCoords.lng) {
        try {
          const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${carCoords.lng},${carCoords.lat};${returnLocation.coordinates.lng},${returnLocation.coordinates.lat}?overview=false`;
          const response = await fetch(osrmUrl);
          const data = await response.json();
          if (data.routes && data.routes[0]) {
            returnDistance = data.routes[0].distance / 1000;
          }
        } catch (error) {
          returnDistance = calculateHaversineDistance(
            carCoords.lat, carCoords.lng,
            returnLocation.coordinates.lat, returnLocation.coordinates.lng
          );
        }
      } else {
        returnDistance = estimateDistanceByLocation(
          carLocation.city || carAddress.province?.name,
          carLocation.district || carAddress.ward?.name,
          returnLocation.city,
          returnLocation.district
        );
      }
    }

    // Calculate fees
    const pickupFee = Math.round(pickupDistance * ratePerKm);
    const returnFee = Math.round(returnDistance * ratePerKm);
    const totalDeliveryFee = pickupFee + returnFee;
    const totalDistance = pickupDistance + returnDistance;

    res.json({
      pickupDistance: Math.round(pickupDistance * 10) / 10,
      returnDistance: Math.round(returnDistance * 10) / 10,
      totalDistance: Math.round(totalDistance * 10) / 10,
      pickupFee,
      returnFee,
      totalDeliveryFee,
      ratePerKm,
      breakdown: {
        pickup: {
          distance: Math.round(pickupDistance * 10) / 10,
          fee: pickupFee,
          from: carLocation.city || carAddress.province?.name || 'Vị trí xe',
          to: `${pickupLocation.street}, ${pickupLocation.district}, ${pickupLocation.city}`
        },
        return: {
          distance: Math.round(returnDistance * 10) / 10,
          fee: returnFee,
          from: `${returnLocation?.street || pickupLocation?.street}, ${returnLocation?.district || pickupLocation?.district}, ${returnLocation?.city || pickupLocation?.city}`,
          to: carLocation.city || carAddress.province?.name || 'Vị trí xe'
        }
      }
    });
  } catch (error) {
    console.error('Calculate delivery fee error:', error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// Convert pre-booking to confirmed booking
router.post('/:id/confirm', auth, async (req, res) => {
  try {
    let booking;
    if (isMssql) {
      const { getById, updateBooking } = require('../repositories/bookingRepo');
      booking = await getById(req.params.id);
    } else {
      booking = await Booking.findById(req.params.id);
    }
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    const currentUserIdStr = req.userId.toString();
    const renterIdStr = (booking.renterId || booking.renter || '').toString();
    const bookedByIdStr = (booking.bookedById || booking.bookedBy || '').toString();
    
    const isRenter = renterIdStr === currentUserIdStr;
    const isBookedBy = bookedByIdStr === currentUserIdStr;
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isRenter && !isBookedBy && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to confirm this booking' });
    }
    
    if (booking.bookingType !== 'prebook') {
      return res.status(400).json({ message: 'Only pre-bookings can be confirmed via this endpoint' });
    }
    
    const prebook = booking.prebook || {};
    if (prebook.status !== 'holding') {
      return res.status(400).json({ message: `Pre-booking is already ${prebook.status}` });
    }
    
    if (new Date() > new Date(prebook.deadline)) {
      if (isMssql) {
        prebook.status = 'expired';
        const { updateBooking } = require('../repositories/bookingRepo');
        await updateBooking(req.params.id, { prebookJson: JSON.stringify(prebook) });
      } else {
        booking.prebook.status = 'expired';
        await booking.save();
      }
      return res.status(400).json({ message: 'Pre-booking has expired' });
    }
    
    if (isMssql) {
      prebook.status = 'converted';
      prebook.convertedAt = new Date();
      const { updateBooking } = require('../repositories/bookingRepo');
      await updateBooking(req.params.id, { 
        status: 'confirmed',
        prebookJson: JSON.stringify(prebook)
      });
      
      if (booking.carId || booking.car) {
        const carRepo = require('../repositories/carRepo');
        await carRepo.updateCar(String(booking.carId || booking.car), { operationalStatus: 'rented' });
      }
    } else {
      booking.status = 'confirmed';
      booking.prebook.status = 'converted';
      booking.prebook.convertedAt = new Date();
      await booking.save();
      
      if (booking.car) {
        const car = await Car.findById(booking.car);
        if (car) {
          await car.addUnavailableDates(booking.startDate, booking.endDate, 'booking', booking._id);
          car.operationalStatus = 'rented';
          await car.save();
        }
      }
    }
    
    res.json({ message: 'Pre-booking confirmed successfully', booking });
  } catch (error) {
    console.error('[CONFIRM PREBOOK] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Haversine formula to calculate straight-line distance between two coordinates
function calculateHaversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
}

// Estimate distance based on location hierarchy (fallback)
function estimateDistanceByLocation(carCity, carDistrict, pickupCity, pickupDistrict) {
  const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  const cCity = normalize(carCity);
  const cDist = normalize(carDistrict);
  const pCity = normalize(pickupCity);
  const pDist = normalize(pickupDistrict);

  // Same district - minimal distance
  if (cCity === pCity && cDist === pDist) {
    return 5; // ~5km within same district
  }
  
  // Same city, different district
  if (cCity === pCity && cDist !== pDist) {
    return 25; // ~25km between districts
  }
  
  // Different cities - estimate based on common distances
  if (cCity !== pCity) {
    return 100; // Default ~100km for inter-city
  }
  
  return 10; // Default fallback
}

// Export functions for use in other routes
module.exports = router;
