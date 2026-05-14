const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const userRepo = require('../repositories/userRepo');
const carRepo = require('../repositories/carRepo');
const bookingRepo = require('../repositories/bookingRepo');

const router = express.Router();
const isMssql = (process.env.DB_PROVIDER || 'mongo').toLowerCase() === 'mssql';

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '../uploads/avatars/');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'avatar-' + req.userId + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Use memory storage for collaborator application files so we can save binary to MongoDB
const collabUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // allow up to 8MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files allowed for collaborator uploads'));
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    let user;
    if (isMssql) {
      user = await userRepo.getUserById(req.userId);
    } else {
      user = await User.findById(req.userId).select('-password');
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // serialize binary images to data URLs
    const toDataUrl = (fileObj) => {
      if (!fileObj || !fileObj.data) return undefined;
      if (typeof fileObj.data === 'string') return `data:${fileObj.contentType};base64,${fileObj.data}`;
      let buffer;
      if (Buffer.isBuffer(fileObj.data)) {
        buffer = fileObj.data;
      } else if (fileObj.data.type === 'Buffer' && Array.isArray(fileObj.data.data)) {
        buffer = Buffer.from(fileObj.data.data);
      } else {
        buffer = Buffer.from(fileObj.data);
      }
      return `data:${fileObj.contentType};base64,${buffer.toString("base64")}`;
    };

    const userObj = user.toObject();

    // Top-level Profile Files
    userObj.avatar = toDataUrl(userObj.avatar) || "";
    if (userObj.idCard) {
      userObj.idCard.frontImage = toDataUrl(userObj.idCard.frontImage) || "";
      userObj.idCard.backImage = toDataUrl(userObj.idCard.backImage) || "";
    }
    if (userObj.drivingLicense) {
      userObj.drivingLicense.frontImage = toDataUrl(userObj.drivingLicense.frontImage) || "";
      userObj.drivingLicense.backImage = toDataUrl(userObj.drivingLicense.backImage) || "";
    }

    if (userObj.collaboratorRequest) {
      const cr = userObj.collaboratorRequest;
      // ... already serialized above or in subsequent logic ...
      cr.idCardFrontImage = toDataUrl(cr.idCardFrontImage) || '';
      cr.idCardBackImage = toDataUrl(cr.idCardBackImage) || '';
      cr.licenseImage = toDataUrl(cr.licenseImage) || '';
      if (cr.carSubmissions && Array.isArray(cr.carSubmissions)) {
        cr.carSubmissions = cr.carSubmissions.map(c => ({
          make: c.make,
          model: c.model,
          year: c.year,
          licensePlate: c.licensePlate,
          photos: (c.photos || []).map(p => toDataUrl(p) || ''),
          registration: c.registration ? toDataUrl(c.registration) : '',
          insurance: c.insurance ? toDataUrl(c.insurance) : ''
        }))
      }
    }

    res.json({ user: userObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.userId;

    if (isMssql) {
      const [totalApproved, totalPending, totalRejected, totalCount] = await Promise.all([
        carRepo.countDocuments({ ownerId: userId, status: 'approved' }),
        carRepo.countDocuments({ ownerId: userId, status: 'pending', approvalStatus: { $ne: 'approved' } }),
        carRepo.countDocuments({ ownerId: userId, status: 'rejected' }),
        carRepo.countDocuments({ ownerId: userId }),
      ]);

      const stats = await bookingRepo.getStatsSummary(userId);

      return res.json({
        cars: {
          total: totalCount,
          approved: totalApproved,
          pending: totalPending,
          rejected: totalRejected
        },
        bookings: {
          total: stats.statusCounts.reduce((sum, s) => sum + s.count, 0),
          active: stats.statusCounts.find(s => s.status === 'active')?.count || 0,
          completed: stats.statusCounts.find(s => s.status === 'completed')?.count || 0,
          pending: stats.statusCounts.find(s => s.status === 'pending')?.count || 0
        },
        earnings: stats.totalEarnings,
        spent: stats.totalSpent
      });
    }

    // Mongo mode: Get total earnings (as owner)
    const totalApproved = await Car.countDocuments({ owner: userId, $or: [{ status: 'approved' }, { approvalStatus: 'approved' }] });
    const totalPending = await Car.countDocuments({ owner: userId, status: 'pending', approvalStatus: { $ne: 'approved' } });
    const totalRejected = await Car.countDocuments({ owner: userId, $or: [{ status: 'rejected' }, { approvalStatus: 'rejected' }] });
    const totalCount = await Car.countDocuments({ owner: userId });

    // Get bookings stats
    const bookingsStats = await Booking.aggregate([
      { $match: { $or: [{ renter: userId }, { owner: userId }] } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total earnings (as owner)
    const totalEarnings = await Booking.aggregate([
      { $match: { owner: userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.totalRentalFee' }
        }
      }
    ]);

    // Get total spent (as renter)
    const totalSpent = await Booking.aggregate([
      { $match: { renter: userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    res.json({
      cars: {
        total: totalCount,
        approved: totalApproved,
        pending: totalPending,
        rejected: totalRejected
      },
      bookings: {
        total: bookingsStats.reduce((sum, stat) => sum + stat.count, 0),
        active: bookingsStats.find(s => s._id === 'active')?.count || 0,
        completed: bookingsStats.find(s => s._id === 'completed')?.count || 0,
        pending: bookingsStats.find(s => s._id === 'pending')?.count || 0
      },
      earnings: totalEarnings[0]?.total || 0,
      spent: totalSpent[0]?.total || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // This is a placeholder - in a real app, you'd have a notifications model
    const notifications = [];

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top rated drivers / All drivers with filters
router.get('/top-drivers', async (req, res) => {
  try {
    const { limit = 10, location, licenseClass, sort } = req.query;
    let drivers;
    if (isMssql) {
      // Basic driver search in MSSQL
      drivers = await userRepo.getAll({
        filter: { role: 'driver' },
        sort: sort || 'ratingAverage DESC',
        limit: parseInt(limit)
      });
    } else {
      const query = {
        $or: [
          { role: 'driver' },
          { 'driverInfo.isStandaloneDriver': true }
        ]
      };

      if (location) {
        query['driverInfo.operatingCity'] = { $regex: location, $options: 'i' };
      }
      
      if (licenseClass) {
        query['driverInfo.licenseClass'] = licenseClass;
      }

      drivers = await User.find(query)
        .select('fullName avatar rating totalTrips isVerified driverInfo createdAt')
        .sort(sort || { 'rating.average': -1, 'totalTrips.asOwner': -1 })
        .limit(parseInt(limit))
        .lean();
    }

    const processedDrivers = drivers.map(d => ({
      ...d,
      driverRatePerDay: d.driverInfo?.driverRatePerDay || 500000,
      driverRatePerHour: d.driverInfo?.driverRatePerHour || 80000
    }));

    res.json({ drivers: processedDrivers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public user profile
router.get('/:id', async (req, res) => {
  try {
    let user, reviews, carsCount;

    if (isMssql) {
      user = await userRepo.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      carsCount = await carRepo.countDocuments({ ownerId: req.params.id, status: 'approved' });
      
      const reviewRepo = require('../repositories/reviewRepo');
      reviews = await reviewRepo.getAll({ 
        filter: { revieweeId: req.params.id }, 
        limit: 10, 
        populate: ['reviewer', 'car'] 
      });
    } else {
      user = await User.findById(req.params.id)
        .select('fullName avatar rating totalTrips isVerified createdAt driverExperienceDescription driverRatePerDay driverInfo')
        .lean();

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      carsCount = await Car.countDocuments({ 
        owner: req.params.id, 
        $or: [{ status: 'approved' }, { approvalStatus: 'approved' }]
      });

      reviews = await Review.find({ 
        reviewee: req.params.id,
        type: { $in: ['renter_to_owner', 'owner_to_renter'] },
        isPublic: true,
        'flags.isReported': { $ne: true }
      })
      .populate('reviewer', 'fullName avatar')
      .populate('car', 'brand model')
      .sort({ createdAt: -1 })
      .limit(10);
    }

    res.json({
      user: {
        ...user,
        carsCount,
        reviews: reviews.length
      },
      recentReviews: reviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile with binary images and object address
const Address = require('../models/Address');
const profileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.put('/profile', auth, profileUpload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'idCardFront', maxCount: 1 },
  { name: 'idCardBack', maxCount: 1 },
  { name: 'licenseFront', maxCount: 1 },
  { name: 'drivingLicenseFront', maxCount: 1 },
  { name: 'drivingLicenseBack', maxCount: 1 }
]), (req, res, next) => {
  ['address', 'idCard', 'drivingLicense', 'driverInfo'].forEach(key => {
    if (typeof req.body[key] === 'string') {
      try { req.body[key] = JSON.parse(req.body[key]); } catch (e) {}
    }
  });
  next();
}, [
  body('fullName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^[0-9]{10,11}$/),
  body('dateOfBirth').optional({ checkFalsy: true }).isISO8601(),
  body('idCard.number').optional().trim(),
  body('driverInfo.licenseNumber').optional().trim(),
  body('driverInfo.licenseClass').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();

    // Serialization helper (DataURL for frontend)
    const toDataUrl = (fileObj) => {
      if (!fileObj || !fileObj.data) return undefined;
      if (typeof fileObj.data === 'string') return `data:${fileObj.contentType};base64,${fileObj.data}`;
      let buffer;
      if (Buffer.isBuffer(fileObj.data)) {
        buffer = fileObj.data;
      } else if (fileObj.data.type === 'Buffer' && Array.isArray(fileObj.data.data)) {
        buffer = Buffer.from(fileObj.data.data);
      } else {
        buffer = Buffer.from(fileObj.data);
      }
      return `data:${fileObj.contentType};base64,${buffer.toString("base64")}`;
    };

    const toFileObj = (file) => ({
      data: file.buffer,
      contentType: file.mimetype,
      filename: file.originalname,
    });

    // ── MSSQL BRANCH ────────────────────────────────────────────────
    if (dbProvider === 'mssql') {
      const userRepo = require('../repositories/userRepo');
      let mssqlUser = await userRepo.getUserById(req.userId);
      if (!mssqlUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Parse body fields
      const updates = {};
      ['address', 'idCard', 'drivingLicense', 'driverInfo'].forEach(key => {
        if (typeof req.body[key] === 'string') {
          try { req.body[key] = JSON.parse(req.body[key]); } catch (e) {}
        }
      });

      if (req.body.fullName) updates.fullName = req.body.fullName;
      if (req.body.phone) updates.phone = req.body.phone;

      // Avatar file
      if (req.files?.avatar?.length) {
        updates.avatar = toFileObj(req.files.avatar[0]);
      }

      // ID Card images
      const currentIdCard = mssqlUser.idCard || {};
      let idCardChanged = false;
      if (req.files?.idCardFront?.length) { currentIdCard.frontImage = toFileObj(req.files.idCardFront[0]); idCardChanged = true; }
      if (req.files?.idCardBack?.length) { currentIdCard.backImage = toFileObj(req.files.idCardBack[0]); idCardChanged = true; }
      if (req.body.idCard?.number) { currentIdCard.number = req.body.idCard.number; idCardChanged = true; }
      if (idCardChanged) updates.idCard = currentIdCard;

      // Driving license images
      const currentLicense = mssqlUser.drivingLicense || {};
      let licenseChanged = false;
      const lf = req.files?.licenseFront || req.files?.drivingLicenseFront;
      if (lf?.length) { currentLicense.frontImage = toFileObj(lf[0]); licenseChanged = true; }
      if (req.files?.drivingLicenseBack?.length) { currentLicense.backImage = toFileObj(req.files.drivingLicenseBack[0]); licenseChanged = true; }
      if (req.body.driverInfo?.licenseNumber) { currentLicense.number = req.body.driverInfo.licenseNumber; licenseChanged = true; }
      if (req.body.driverInfo?.licenseClass) { currentLicense.type = req.body.driverInfo.licenseClass; licenseChanged = true; }
      if (licenseChanged) updates.drivingLicense = currentLicense;

      const updatedMssqlUser = await userRepo.updateUser(req.userId, updates);
      const userObj = { ...(updatedMssqlUser || mssqlUser) };
      userObj.avatar = toDataUrl(userObj.avatar) || '';
      if (userObj.idCard) {
        userObj.idCard = { ...userObj.idCard };
        userObj.idCard.frontImage = toDataUrl(userObj.idCard.frontImage) || '';
        userObj.idCard.backImage = toDataUrl(userObj.idCard.backImage) || '';
      }
      if (userObj.drivingLicense) {
        userObj.drivingLicense = { ...userObj.drivingLicense };
        userObj.drivingLicense.frontImage = toDataUrl(userObj.drivingLicense.frontImage) || '';
        userObj.drivingLicense.backImage = toDataUrl(userObj.drivingLicense.backImage) || '';
      }
      return res.json({ message: 'Cập nhật hồ sơ thành công', user: userObj });
    }

    // ── MONGODB BRANCH ───────────────────────────────────────────────
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse body fields that might be strings from FormData
    const updates = { ...req.body };
    ['address', 'idCard', 'drivingLicense', 'driverInfo'].forEach(key => {
       if (typeof updates[key] === 'string') {
          try { updates[key] = JSON.parse(updates[key]); } catch (e) {}
       }
    });

    // 1. Handle Basic Fields
    if (updates.fullName) user.fullName = updates.fullName;
    if (updates.phone) user.phone = updates.phone;
    if (updates.dateOfBirth) {
       const d = new Date(updates.dateOfBirth);
       if (!isNaN(d.valueOf())) user.dateOfBirth = d;
    }

    // 2. Handle Binary Images
    if (req.files) {
      if (req.files.avatar?.length) user.avatar = toFileObj(req.files.avatar[0]);
      
      if (!user.idCard) user.idCard = {};
      if (req.files.idCardFront?.length) user.idCard.frontImage = toFileObj(req.files.idCardFront[0]);
      if (req.files.idCardBack?.length) user.idCard.backImage = toFileObj(req.files.idCardBack[0]);

      if (!user.drivingLicense) user.drivingLicense = {};
      const lf = req.files.licenseFront || req.files.drivingLicenseFront;
      if (lf?.length) user.drivingLicense.frontImage = toFileObj(lf[0]);
      if (req.files.drivingLicenseBack?.length) user.drivingLicense.backImage = toFileObj(req.files.drivingLicenseBack[0]);
    }

    // 3. Handle Object Address
    if (updates.address) {
       let address;
       if (user.addressId) {
         address = await Address.findById(user.addressId);
       }

       const st = updates.address.street || 'Chưa cập nhật';
       const wa = updates.address.ward || updates.address.district || 'Chưa cập nhật';
       const pr = updates.address.city || updates.address.province || 'Chưa cập nhật';

       if (!address) {
         address = new Address({
           owner: user._id,
           street: st,
           ward: { name: wa },
           province: { name: pr },
           referenceType: 'User',
           referenceId: user._id,
           isDefault: true
         });
         await address.save();
         user.addressId = address._id;
       } else {
         address.street = st;
         address.ward.name = wa;
         address.province.name = pr;
         await address.save();
       }
    }

    // Update documentation numbers
    if (updates.idCard && updates.idCard.number) {
       if (!user.idCard) user.idCard = {};
       user.idCard.number = updates.idCard.number;
    }
    if (updates.driverInfo) {
       if (!user.drivingLicense) user.drivingLicense = {};
       if (updates.driverInfo.licenseNumber) user.drivingLicense.number = updates.driverInfo.licenseNumber;
       if (updates.driverInfo.licenseClass) user.drivingLicense.type = updates.driverInfo.licenseClass;
    }
    if (updates.drivingLicense) {
       if (!user.drivingLicense) user.drivingLicense = {};
       if (updates.drivingLicense.number) user.drivingLicense.number = updates.drivingLicense.number;
       if (updates.drivingLicense.class) user.drivingLicense.type = updates.drivingLicense.class;
       if (updates.drivingLicense.expiryDate) {
         const exp = new Date(updates.drivingLicense.expiryDate);
         if (!isNaN(exp.valueOf())) user.drivingLicense.expiryDate = exp;
       }
    }

    await user.save();

    const updatedUser = await User.findById(user._id).populate("addressId").select("-password");
    const userObj = updatedUser.toObject();
    
    // Safety check for userObj and file objects to prevent toDataUrl on missing fields
    if (userObj.avatar) userObj.avatar = toDataUrl(userObj.avatar) || "";
    if (userObj.idCard) {
      if (userObj.idCard.frontImage) userObj.idCard.frontImage = toDataUrl(userObj.idCard.frontImage) || "";
      if (userObj.idCard.backImage) userObj.idCard.backImage = toDataUrl(userObj.idCard.backImage) || "";
    }
    if (userObj.drivingLicense) {
      if (userObj.drivingLicense.frontImage) userObj.drivingLicense.frontImage = toDataUrl(userObj.drivingLicense.frontImage) || "";
      if (userObj.drivingLicense.backImage) userObj.drivingLicense.backImage = toDataUrl(userObj.drivingLicense.backImage) || "";
    }

    res.json({
      message: 'Cập nhật hồ sơ thành công',
      user: userObj
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: error.message || 'Lỗi hệ thống' });
  }
});

// Become a car owner
router.post('/become-owner', auth, [
  body('drivingLicense.number').trim().notEmpty().withMessage('License number required'),
  body('drivingLicense.issuedDate').isISO8601().withMessage('Issue date required'),
  body('drivingLicense.expiryDate').isISO8601().withMessage('Expiry date required'),
  body('drivingLicense.class').trim().notEmpty().withMessage('License class required'),
  body('idCard.number').trim().notEmpty().withMessage('ID card number required'),
  body('idCard.issuedDate').isISO8601().withMessage('ID issue date required'),
  body('idCard.issuedPlace').trim().notEmpty().withMessage('ID issue place required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (isMssql) {
      const updates = {
        role: 'owner',
        isVerified: false,
        drivingLicense: req.body.drivingLicense,
        idCard: req.body.idCard
      };
      await userRepo.updateUser(req.userId, updates);
      
      res.json({
        message: 'Owner application submitted successfully',
        user: { id: req.userId, role: 'owner', isVerified: false }
      });
    } else {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.role === 'owner') return res.status(400).json({ message: 'You are already a car owner' });

      user.drivingLicense = req.body.drivingLicense;
      user.idCard = req.body.idCard;
      user.role = 'owner';
      user.isVerified = false;
      await user.save();

      res.json({
        message: 'Owner application submitted successfully',
        user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, isVerified: user.isVerified }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Become a collaborator (CTV) - create a pending request (admin must approve)
router.post('/become-collaborator', auth, collabUpload.fields([
  { name: 'idCardFrontImage', maxCount: 1 },
  { name: 'idCardBackImage', maxCount: 1 },
  { name: 'licenseImage', maxCount: 1 },
  { name: 'carPhotos', maxCount: 10 },
  { name: 'carRegistration', maxCount: 5 },
  { name: 'carInsurance', maxCount: 5 }
]), async (req, res) => {
  try {
    const { note, car, contract } = req.body || {}
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'collaborator' && !user.collaboratorRequest) {
      return res.status(400).json({ message: 'Bạn đã là cộng tác viên' });
    }

    if (contract) {
      try {
        const parsedContract = JSON.parse(contract);
        user.contract = {
          isAgreed: parsedContract.isAgreed || false,
          agreedAt: parsedContract.isAgreed ? new Date() : null,
          contractType: 'collaborator',
          signatureName: parsedContract.signatureName || ""
        };
      } catch(e) {
        console.error("Error parsing contract data:", e);
      }
    }

    // parse uploaded files
    const files = req.files || {}
    const idCardFrontFile = files.idCardFrontImage?.[0]
    const idCardBackFile = files.idCardBackImage?.[0]
    const licenseFile = files.licenseImage?.[0]

    // parse car data - expect `car` as JSON string for one car or array
    let carData = []
    if (car) {
      try { carData = JSON.parse(car) } catch (e) { carData = [] }
    }

    // if frontend sent no car JSON, attempt to build from fields
    if (!carData.length && req.body.carMake) {
      carData.push({ make: req.body.carMake, model: req.body.carModel, year: req.body.carYear, licensePlate: req.body.carLicensePlate })
    }

    // Build carSubmissions from carData and uploaded files
    const carPhotos = files.carPhotos || []
    const carRegs = files.carRegistration || []
    const carIns = files.carInsurance || []

    // Build carSubmissions using buffers
    const carSubmissions = carData.map((c, idx) => {
      const photos = carPhotos.map(f => ({ data: f.buffer, contentType: f.mimetype, filename: f.originalname }))
      const registration = carRegs[idx] ? { data: carRegs[idx].buffer, contentType: carRegs[idx].mimetype, filename: carRegs[idx].originalname } : (carRegs[0] ? { data: carRegs[0].buffer, contentType: carRegs[0].mimetype, filename: carRegs[0].originalname } : undefined)
      const insurance = carIns[idx] ? { data: carIns[idx].buffer, contentType: carIns[idx].mimetype, filename: carIns[idx].originalname } : (carIns[0] ? { data: carIns[0].buffer, contentType: carIns[0].mimetype, filename: carIns[0].originalname } : undefined)

      return {
        make: c.make || '',
        model: c.model || '',
        year: c.year || '',
        licensePlate: c.licensePlate || '',
        photos,
        registration,
        insurance
      }
    })

    // previously required at least one car submission; removed per UX change

    const collaboratorRequest = {
      status: 'pending',
      note: note || '',
      requestedAt: new Date(),
      idCardFrontImage: idCardFrontFile ? { data: idCardFrontFile.buffer, contentType: idCardFrontFile.mimetype, filename: idCardFrontFile.originalname } : undefined,
      idCardBackImage: idCardBackFile ? { data: idCardBackFile.buffer, contentType: idCardBackFile.mimetype, filename: idCardBackFile.originalname } : undefined,
      licenseImage: licenseFile ? { data: licenseFile.buffer, contentType: licenseFile.mimetype, filename: licenseFile.originalname } : undefined,
      carSubmissions
    };

    if (isMssql) {
      const updates = {
        isVerified: false,
        collaboratorRequestJson: JSON.stringify(collaboratorRequest)
      };
      if (contract) {
        try {
          const parsedContract = JSON.parse(contract);
          updates.contractJson = JSON.stringify({
            isAgreed: parsedContract.isAgreed || false,
            agreedAt: parsedContract.isAgreed ? new Date() : null,
            contractType: 'collaborator',
            signatureName: parsedContract.signatureName || ""
          });
        } catch(e) {}
      }
      await userRepo.updateUser(req.userId, updates);
    } else {
      if (contract) {
        try {
          const parsedContract = JSON.parse(contract);
          user.contract = {
            isAgreed: parsedContract.isAgreed || false,
            agreedAt: parsedContract.isAgreed ? new Date() : null,
            contractType: 'collaborator',
            signatureName: parsedContract.signatureName || ""
          };
        } catch(e) {}
      }
      user.collaboratorRequest = collaboratorRequest;
      user.isVerified = false;
      await user.save();
    }

    // Prepare response with previews
    const toDataUrl = (fileObj) => {
      if (!fileObj || !fileObj.data) return undefined;
      const buffer = Buffer.isBuffer(fileObj.data) ? fileObj.data : Buffer.from(fileObj.data.data || fileObj.data);
      return `data:${fileObj.contentType};base64,${buffer.toString("base64")}`;
    };

    const responseCollab = {
      status: collaboratorRequest.status,
      note: collaboratorRequest.note,
      requestedAt: collaboratorRequest.requestedAt,
      idCardFrontImage: toDataUrl(collaboratorRequest.idCardFrontImage),
      idCardBackImage: toDataUrl(collaboratorRequest.idCardBackImage),
      licenseImage: toDataUrl(collaboratorRequest.licenseImage),
      carSubmissions: (collaboratorRequest.carSubmissions || []).map(c => ({
        ...c,
        photos: (c.photos || []).map(p => toDataUrl(p)),
        registration: c.registration ? toDataUrl(c.registration) : '',
        insurance: c.insurance ? toDataUrl(c.insurance) : ''
      }))
    }

    res.json({ message: 'Yêu cầu CTV đã gửi với tài liệu. Vui lòng chờ xét duyệt.', user: { id: req.userId, collaboratorRequest: responseCollab } })
  } catch (error) {
    console.error('Become collaborator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    if (isMssql) {
      const carCount = await carRepo.countDocuments({ ownerId: req.userId });
      if (carCount > 0) return res.status(400).json({ message: 'Cannot delete account with active car listings' });

      const activeBookings = await bookingRepo.countDocuments({
        $or: [{ renter: req.userId }, { owner: req.userId }],
        status: { $in: ['pending', 'confirmed', 'active'] }
      });
      if (activeBookings > 0) return res.status(400).json({ message: 'Cannot delete account with active bookings' });

      await userRepo.updateUser(req.userId, { isVerified: false, isActive: false });
    } else {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const activeBookings = await Booking.countDocuments({
        $or: [{ renter: req.userId }, { owner: req.userId }],
        status: { $in: ['pending', 'confirmed', 'active'] }
      });

      if (activeBookings > 0) return res.status(400).json({ message: 'Cannot delete account with active bookings' });

      user.isVerified = false;
      await user.save();
    }

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve user avatar from binary data
router.get('/:id/avatar', async (req, res) => {
  try {
    const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();
    let user;
    if (dbProvider === 'mssql') {
      const userRepo = require('../repositories/userRepo');
      user = await userRepo.getUserById(req.params.id);
    } else {
      user = await User.findById(req.params.id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const avatar = user.avatar;
    if (!avatar || !avatar.data) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    // Convert Buffer to proper format if needed
    let buffer;
    if (Buffer.isBuffer(avatar.data)) {
      buffer = avatar.data;
    } else if (avatar.data.type === 'Buffer' && Array.isArray(avatar.data.data)) {
      buffer = Buffer.from(avatar.data.data);
    } else {
      buffer = Buffer.from(avatar.data);
    }

    res.set({
      'Content-Type': avatar.contentType || 'image/jpeg',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    });

    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error serving avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
