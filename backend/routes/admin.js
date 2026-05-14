const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Car = require("../models/Car");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Address = require("../models/Address");
const Notification = require("../models/Notification");

// SQL Server repositories
const userRepo = require("../repositories/userRepo");
const carRepo = require("../repositories/carRepo");
const bookingRepo = require("../repositories/bookingRepo");
const notificationRepo = require("../repositories/notificationRepo");
const reviewRepo = require("../repositories/reviewRepo");

const isMssql = (process.env.DB_PROVIDER || 'mongo').toLowerCase() === 'mssql';

// Admin middleware
const adminAuth = (req, res, next) => {
  // DEBUG: log current user and role for troubleshooting 403s
  try {
    console.log(
      "adminAuth check - user:",
      req.user?._id?.toString(),
      "role:",
      req.user?.role,
    );
  } catch (e) {
    console.log("adminAuth check - unable to read req.user");
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

const jwt = require("jsonwebtoken"); // Needed for some logic later if manual verification is used

// Apply admin middleware to all admin routes
router.use(auth, adminAuth);

// Get dashboard stats
router.get("/stats", async (req, res) => {
  try {
    if (isMssql) {
      const [totalUsers, totalCars, totalBookings, totalRevenue] = await Promise.all([
        userRepo.countDocuments(),
        carRepo.countDocuments(),
        bookingRepo.countDocuments(),
        bookingRepo.getCompletedRevenue(),
      ]);
      return res.json({ totalUsers, totalCars, totalBookings, totalRevenue: Number(totalRevenue) });
    }

    const totalUsers = await User.countDocuments();
    const totalCars = await Car.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Calculate total revenue from completed bookings
    const completedBookings = await Booking.find({ status: "completed" });
    const totalRevenue = completedBookings.reduce(
      (sum, booking) => sum + (booking.pricing?.totalAmount || 0),
      0,
    );

    res.json({
      totalUsers,
      totalCars,
      totalBookings,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get comprehensive analytics including revenue, chart trends and top performers
router.get("/analytics", async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const now = new Date();

    if (isMssql) {
      let startDate = new Date();
      if (period === 'week') startDate.setDate(now.getDate() - 7);
      else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);
      else startDate.setDate(now.getDate() - 30);

      const prevStartDate = new Date(startDate);
      if (period === 'week') prevStartDate.setDate(prevStartDate.getDate() - 7);
      else if (period === 'year') prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
      else prevStartDate.setDate(prevStartDate.getDate() - 30);

      const [
        totalUsers, prevTotalUsers, totalBookings, prevTotalBookings,
        activeBookings, revenue, prevRevenue,
        topCars, topUsers,
        approvedCars, pendingCarsCount,
      ] = await Promise.all([
        userRepo.countDocuments({ createdAt: { $gte: startDate } }),
        userRepo.countDocuments({ createdAt: { $gte: prevStartDate, $lt: startDate } }),
        bookingRepo.countDocuments({ createdAt: { $gte: startDate } }),
        bookingRepo.countDocuments({ createdAt: { $gte: prevStartDate, $lt: startDate } }),
        bookingRepo.countDocuments({ status: { $in: ['active', 'confirmed'] } }),
        bookingRepo.getCompletedRevenue({ createdAt: { $gte: startDate } }),
        bookingRepo.getCompletedRevenue({ createdAt: { $gte: prevStartDate, $lt: startDate } }),
        bookingRepo.getTopCarsByRevenue(startDate, 5),
        bookingRepo.getTopUsersBySpending(startDate, 5),
        carRepo.countDocuments({ status: 'approved' }),
        carRepo.countDocuments({ status: 'pending' }),
      ]);

      const userGrowth = prevTotalUsers ? ((totalUsers - prevTotalUsers) / prevTotalUsers) * 100 : (totalUsers ? 100 : 0);
      const bookingGrowth = prevTotalBookings ? ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100 : (totalBookings ? 100 : 0);
      const revenueGrowth = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : (revenue ? 100 : 0);

      // Get recent activity and running car IDs in parallel
      const [recentBookings, runningCarIds] = await Promise.all([
        bookingRepo.getAll({ sort: 'createdAt DESC', limit: 5, populate: ['renter'] }),
        bookingRepo.getDistinctCarIds({ status: { $in: ['active', 'confirmed'] } }),
      ]);

      const recentActivities = recentBookings.map(b => ({
        id: b._id,
        description: `${b.renter?.fullName || 'Khách'} đã đặt xe ${b.mode === 'hourly' ? 'theo giờ' : 'theo ngày'}`,
        time: new Date(b.createdAt).toLocaleDateString('vi-VN'),
        color: 'bg-indigo-500'
      }));

      return res.json({
        totalUsers, totalBookings, activeBookings,
        revenue: Number(revenue),
        userGrowth: Math.round(userGrowth),
        bookingGrowth: Math.round(bookingGrowth),
        revenueGrowth: Math.round(revenueGrowth),
        bookingTrend: [], revenueTrend: [], userTrend: [],
        carStatusData: [Math.max(0, approvedCars - runningCarIds.length), pendingCarsCount, runningCarIds.length],
        topCars, topUsers, recentActivities,
      });
    }

    let startDate = new Date();
    let daysToGenerate = 7;

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
      daysToGenerate = 7;
    } else if (period === 'month') {
      startDate.setDate(now.getDate() - 30);
      daysToGenerate = 30;
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
      daysToGenerate = 12; // Assuming 12 months for year
    }

    // Previous period for growth calculation
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    if (period === 'week') prevStartDate.setDate(prevStartDate.getDate() - 7);
    else if (period === 'month') prevStartDate.setDate(prevStartDate.getDate() - 30);
    else if (period === 'year') prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);

    // Basic Counts
    const totalUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const prevTotalUsers = await User.countDocuments({ createdAt: { $gte: prevStartDate, $lt: startDate } });
    
    const totalBookings = await Booking.countDocuments({ createdAt: { $gte: startDate } });
    const prevTotalBookings = await Booking.countDocuments({ createdAt: { $gte: prevStartDate, $lt: startDate } });
    
    const activeBookings = await Booking.countDocuments({ status: { $in: ['active', 'confirmed'] } });

    // Revenue
    const completedBookings = await Booking.find({ status: "completed", createdAt: { $gte: startDate } });
    const prevCompletedBookings = await Booking.find({ status: "completed", createdAt: { $gte: prevStartDate, $lt: startDate } });
    
    const revenue = completedBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
    const prevRevenue = prevCompletedBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

    const userGrowth = prevTotalUsers ? ((totalUsers - prevTotalUsers) / prevTotalUsers) * 100 : (totalUsers ? 100 : 0);
    const bookingGrowth = prevTotalBookings ? ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100 : (totalBookings ? 100 : 0);
    const revenueGrowth = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : (revenue ? 100 : 0);

    // Chart Data Arrays
    const bookingTrend = [];
    const revenueTrend = [];
    const userTrend = [];
    
    if (period === 'year') {
       // Monthly bucket
       for (let i = 11; i >= 0; i--) {
          const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          mEnd.setHours(23, 59, 59, 999);
          
          const bCount = await Booking.countDocuments({ createdAt: { $gte: mStart, $lte: mEnd } });
          bookingTrend.push(bCount);
          
          const uCount = await User.countDocuments({ createdAt: { $gte: mStart, $lte: mEnd } });
          userTrend.push(uCount);
          
          const rBookings = await Booking.find({ status: "completed", createdAt: { $gte: mStart, $lte: mEnd } });
          revenueTrend.push(rBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0));
       }
    } else {
       // Daily bucket
       for (let i = daysToGenerate - 1; i >= 0; i--) {
          const dStart = new Date(now);
          dStart.setDate(dStart.getDate() - i);
          dStart.setHours(0,0,0,0);
          
          const dEnd = new Date(dStart);
          dEnd.setHours(23,59,59,999);
          
          const bCount = await Booking.countDocuments({ createdAt: { $gte: dStart, $lte: dEnd } });
          bookingTrend.push(bCount);

          const uCount = await User.countDocuments({ createdAt: { $gte: dStart, $lte: dEnd } });
          userTrend.push(uCount);
          
          const rBookings = await Booking.find({ status: "completed", createdAt: { $gte: dStart, $lte: dEnd } });
          revenueTrend.push(rBookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0));
       }
    }

    // Car Status Distribution For Chart
    const approvedCars = await Car.countDocuments({ 
      $or: [{ status: "approved" }, { approvalStatus: "approved" }] 
    });
    const pendingCarsCount = await Car.countDocuments({ 
      $and: [
        { status: "pending" }, 
        { approvalStatus: { $ne: "approved" } }
      ]
    });
    // Cars currently active in a booking
    const activeCarBookings = await Booking.find({ status: { $in: ['active', 'confirmed'] } }).distinct('car');
    const runningCars = activeCarBookings.length;

    // Top Cars Revenue
    const topCarsAgg = await Booking.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startDate } } },
      { $group: { _id: "$car", revenue: { $sum: "$pricing.totalAmount" }, bookings: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);
    
    const topCars = await Car.populate(topCarsAgg, { path: '_id', select: 'brand model licensePlate' });
    const mappedTopCars = topCars.filter(t => t._id).map(t => ({
      _id: t._id._id,
      brand: t._id.brand,
      model: t._id.model,
      licensePlate: t._id.licensePlate,
      revenue: t.revenue,
      bookings: t.bookings
    }));

    // Top Users Revenue
    const topUsersAgg = await Booking.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startDate } } },
      { $group: { _id: "$renter", totalSpent: { $sum: "$pricing.totalAmount" }, bookings: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 }
    ]);

    const topUsers = await User.populate(topUsersAgg, { path: '_id', select: 'fullName avatar email' });
    const mappedTopUsers = topUsers.filter(t => t._id).map(t => ({
      _id: t._id._id,
      fullName: t._id.fullName,
      email: t._id.email,
      totalSpent: t.totalSpent,
      bookings: t.bookings
    }));

    // Recent Activities
    const recentActivities = [];
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5).populate('renter', 'fullName');
    for (const b of recentBookings) {
       recentActivities.push({
          id: b._id,
          description: `${b.renter?.fullName || 'Khách'} đã đặt xe ${b.mode === 'hourly' ? 'theo giờ' : 'theo ngày'}`,
          time: new Date(b.createdAt).toLocaleDateString('vi-VN'),
          color: 'bg-indigo-500'
       });
    }

    res.json({
      totalUsers,
      totalBookings,
      activeBookings,
      revenue,
      userGrowth: Math.round(userGrowth),
      bookingGrowth: Math.round(bookingGrowth),
      revenueGrowth: Math.round(revenueGrowth),
      bookingTrend,
      revenueTrend,
      userTrend,
      carStatusData: [(approvedCars - runningCars) < 0 ? 0 : (approvedCars - runningCars), pendingCarsCount, runningCars],
      topCars: mappedTopCars,
      topUsers: mappedTopUsers,
      recentActivities
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users with pagination and filtering
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, verified, status } = req.query;
    const skip = (page - 1) * limit;

    if (isMssql) {
      const filter = { role: { $ne: 'admin' } };
      if (search) filter.search = search;
      if (role) {
        if (role.includes(',')) filter.role = { $in: role.split(',') };
        else filter.role = role;
      }
      if (verified !== '' && verified !== undefined) filter.isVerified = verified === 'true';
      if (status) filter.isActive = status === 'true';

      const [users, total] = await Promise.all([
        userRepo.getAll({ filter, skip, limit: parseInt(limit), sort: 'createdAt DESC' }),
        userRepo.countDocuments(filter),
      ]);

      // Remove sensitive data and heavy fields
      const cleanUsers = users.map(u => {
        const clean = { ...u };
        delete clean.passwordHash;
        return clean;
      });

      console.log('[ADMIN/USERS] isMssql=true, returning', cleanUsers.length, 'users, total:', total);
      return res.json({
        users: cleanUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      });
    }

    // Build filter
    const filter = { role: { $ne: "admin" } };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (role) filter.role = role;
    // Hỗ trợ lọc nhiều role dạng: role=owner,driver,collaborator
    if (role && role.includes(",")) {
      filter.role = { $in: role.split(",") };
    }
    if (verified !== "") filter.isVerified = verified === "true";
    if (status) filter.isActive = status === "true";

    const users = await User.find(filter)
      .select("-password")
      .populate({
        path: "addressId",
        select: "street fullAddress ward province",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get("/users/:id", async (req, res) => {
  try {
    if (isMssql) {
      const user = await userRepo.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      delete user.passwordHash;
      return res.json(user);
    }
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "addressId",
        select: "street fullAddress ward province",
      });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Serialize any binary files (e.g., collaboratorRequest images) to data URLs
    const toDataUrl = (fileObj) => {
      if (!fileObj || !fileObj.data) return undefined;
      return `data:${fileObj.contentType};base64,${fileObj.data.toString("base64")}`;
    };

    const userObj = user.toObject();

    if (userObj.collaboratorRequest) {
      const cr = userObj.collaboratorRequest;
      cr.idCardFrontImage = toDataUrl(cr.idCardFrontImage) || "";
      cr.idCardBackImage = toDataUrl(cr.idCardBackImage) || "";
      cr.licenseImage = toDataUrl(cr.licenseImage) || "";
      if (cr.additionalDocs && Array.isArray(cr.additionalDocs)) {
        cr.additionalDocs = cr.additionalDocs.map((d) => toDataUrl(d) || "");
      }
      if (cr.carSubmissions && Array.isArray(cr.carSubmissions)) {
        cr.carSubmissions = cr.carSubmissions.map((c) => ({
          make: c.make,
          model: c.model,
          year: c.year,
          licensePlate: c.licensePlate,
          photos: (c.photos || []).map((p) => toDataUrl(p) || ""),
          registration: toDataUrl(c.registration) || "",
          insurance: toDataUrl(c.insurance) || "",
        }));
      }
    }

    // also serialize driverInfo / ownerInfo images if present
    if (userObj.driverInfo) {
      if (userObj.driverInfo.idCardFrontImage)
        userObj.driverInfo.idCardFrontImage =
          toDataUrl(userObj.driverInfo.idCardFrontImage) || "";
      if (userObj.driverInfo.idCardBackImage)
        userObj.driverInfo.idCardBackImage =
          toDataUrl(userObj.driverInfo.idCardBackImage) || "";
      if (userObj.driverInfo.licenseImage)
        userObj.driverInfo.licenseImage =
          toDataUrl(userObj.driverInfo.licenseImage) || "";
    }
    if (userObj.ownerInfo) {
      if (userObj.ownerInfo.idCardFrontImage)
        userObj.ownerInfo.idCardFrontImage =
          toDataUrl(userObj.ownerInfo.idCardFrontImage) || "";
      if (userObj.ownerInfo.idCardBackImage)
        userObj.ownerInfo.idCardBackImage =
          toDataUrl(userObj.ownerInfo.idCardBackImage) || "";
    }

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user status (activate/deactivate)
router.put("/users/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;
    if (isMssql) {
      const user = await userRepo.updateUser(req.params.id, { isActive });
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ message: "User status updated successfully", user });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User status updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    if (isMssql) {
      const user = await userRepo.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      await userRepo.deleteUser(req.params.id);
      return res.json({ message: "User deleted successfully" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify user
router.put("/users/:id/verify", async (req, res) => {
  try {
    if (isMssql) {
      const user = await userRepo.updateUser(req.params.id, { isVerified: true });
      if (!user) return res.status(404).json({ message: "User not found" });
      try {
        await notificationRepo.create({
          recipient: user.id,
          recipientType: user.role,
          title: "Tài khoản đã được xác thực",
          message: "Chúc mừng! Tài khoản của bạn đã được quản trị viên phê duyệt thành công.",
          type: "system"
        });
      } catch(err) { console.error("Lỗi gửi thông báo:", err); }
      return res.json({ message: "User verified successfully", user });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedAt: new Date() },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      const notifyVerify = new Notification({
        recipient: user._id,
        recipientType: user.role,
        title: "Tài khoản đã được xác thực",
        message: "Chúc mừng! Tài khoản của bạn đã được quản trị viên phê duyệt thành công. Bạn đã có thể bắt đầu hoạt động trên nền tảng.",
        type: "system"
      });
      await notifyVerify.save();
    } catch(err) {
      console.error("Lỗi gửi thông báo:", err);
    }

    res.json({ message: "User verified successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user information
router.put("/users/:id", async (req, res) => {
  try {
    const allowedFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "addressId",
      "role",
      "isActive",
      "isVerified",
    ];
    const updateData = {};

    // Only include allowed fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (isMssql) {
      const user = await userRepo.updateUser(req.params.id, updateData);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ message: "User updated successfully", user });
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== CAR MANAGEMENT ====================

// Create new car
router.post("/cars", async (req, res) => {
  try {
    const carData = {
      ...req.body,
      owner: req.user._id, // Set admin as owner for now
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Map frontend data to backend schema
    if (req.body.pricing) {
      carData.pricePerDay = req.body.pricing.dailyRate || 0;
      carData.pricePerHour = req.body.pricing.hourlyRate || 0;
      carData.pricePerDayWithDriver = req.body.pricing.dailyRateWithDriver || 0;
      carData.pricePerHourWithDriver =
        req.body.pricing.hourlyRateWithDriver || 0;
      delete carData.pricing;
    }

    if (req.body.fuelType) {
      carData.fuel = req.body.fuelType;
      delete carData.fuelType;
    }

    // Set default values for required fields if not provided
    if (!carData.color) carData.color = "Đen";
    if (!carData.deposit) carData.deposit = Math.floor(carData.pricePerDay * 3);
    if (!carData.mileage) carData.mileage = 0;
    if (!carData.images || carData.images.length === 0) {
      carData.images = [{ url: "/placeholder-car.jpg", isMain: true }];
    }

    if (isMssql) {
      carData.ownerId = req.user._id;
      const car = await carRepo.createCar(carData);
      return res.status(201).json({ message: "Car created successfully", car });
    }

    const car = new Car(carData);
    await car.save();

    // Populate owner info
    await car.populate("owner", "fullName email phone avatar");

    res.status(201).json({ message: "Car created successfully", car });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all cars with pagination and filtering
router.get("/cars", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      brand,
      status,
      type,
      minPrice,
      maxPrice,
    } = req.query;
    const skip = (page - 1) * limit;

    if (isMssql) {
      const filter = {};
      if (search) filter.search = search;
      if (brand) filter.brand = brand;
      if (status) filter.status = status;
      if (type) filter.type = type;
      if (minPrice) filter.minPrice = minPrice;
      if (maxPrice) filter.maxPrice = maxPrice;
      
      console.log('[ADMIN/CARS] Query params:', req.query);
      console.log('[ADMIN/CARS] Filter:', JSON.stringify(filter));

      const [cars, total] = await Promise.all([
        carRepo.getAll({ filter, skip, limit: parseInt(limit), sort: 'createdAt DESC', populate: ['owner', 'address'] }),
        carRepo.countDocuments(filter),
      ]);

      const transformedCars = cars.map(car => ({
        ...car,
        pricing: {
          dailyRate: car.pricePerDay,
          hourlyRate: car.pricePerHour || 0,
          dailyRateWithDriver: car.pricePerDayWithDriver || 0,
          hourlyRateWithDriver: car.pricePerHourWithDriver || 0,
        },
        fuelType: car.fuel,
      }));

      return res.json({
        cars: transformedCars,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCars: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      });
    }

    // Build filter
    const filter = {};
    const andConditions = [];

    if (search) {
      andConditions.push({
        $or: [
          { brand: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
          { licensePlate: { $regex: search, $options: "i" } },
        ]
      });
    }

    if (brand) filter.brand = brand;
    
    if (status) {
      if (status === 'approved') {
        andConditions.push({
          $or: [{ status: 'approved' }, { approvalStatus: 'approved' }]
        });
      } else {
        filter.status = status;
      }
    }
    
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter["pricePerDay"] = {};
      if (minPrice) filter["pricePerDay"].$gte = parseFloat(minPrice);
      if (maxPrice) filter["pricePerDay"].$lte = parseFloat(maxPrice);
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const cars = await Car.find(filter)
      .populate("owner", "fullName email phone avatar _id")
      .populate("addressId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const transformedCars = cars.map((car) => ({
      ...car.toObject(),
      pricing: {
        dailyRate: car.pricePerDay,
        hourlyRate: car.pricePerHour || 0,
        dailyRateWithDriver: car.pricePerDayWithDriver || 0,
        hourlyRateWithDriver: car.pricePerHourWithDriver || 0,
      },
      fuelType: car.fuel,
    }));

    const total = await Car.countDocuments(filter);

    res.json({
      cars: transformedCars,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCars: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get car by ID
router.get("/cars/:id", async (req, res) => {
  try {
    if (isMssql) {
      const car = await carRepo.getById(req.params.id, ['owner', 'address']);
      if (!car) return res.status(404).json({ message: "Car not found" });
      const transformedCar = {
        ...car,
        pricing: { dailyRate: car.pricePerDay, hourlyRate: car.pricePerHour || 0, dailyRateWithDriver: car.pricePerDayWithDriver || 0, hourlyRateWithDriver: car.pricePerHourWithDriver || 0 },
        fuelType: car.fuel,
      };
      return res.json(transformedCar);
    }
    const car = await Car.findById(req.params.id)
      .populate("owner", "fullName email phone avatar _id")
      .populate("addressId");

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const transformedCar = {
      ...car.toObject(),
      pricing: {
        dailyRate: car.pricePerDay,
        hourlyRate: car.pricePerHour || 0,
        dailyRateWithDriver: car.pricePerDayWithDriver || 0,
        hourlyRateWithDriver: car.pricePerHourWithDriver || 0,
      },
      fuelType: car.fuel,
    };

    res.json(transformedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update car
router.put("/cars/:id", async (req, res) => {
  try {
    const carData = { ...req.body };

    // Map frontend data to backend schema
    if (req.body.pricing) {
      carData.pricePerDay = req.body.pricing.dailyRate || 0;
      carData.pricePerHour = req.body.pricing.hourlyRate || 0;
      carData.pricePerDayWithDriver = req.body.pricing.dailyRateWithDriver || 0;
      carData.pricePerHourWithDriver =
        req.body.pricing.hourlyRateWithDriver || 0;
      delete carData.pricing;
    }

    if (req.body.fuelType) {
      carData.fuel = req.body.fuelType;
      delete carData.fuelType;
    }

    if (!carData.color) carData.color = "Đen";
    if (!carData.deposit) carData.deposit = Math.floor(carData.pricePerDay * 3);
    if (!carData.mileage) carData.mileage = 0;

    if (isMssql) {
      const car = await carRepo.updateCar(req.params.id, carData);
      if (!car) return res.status(404).json({ message: "Car not found" });
      return res.json({ message: "Car updated successfully", car });
    }

    const car = await Car.findByIdAndUpdate(req.params.id, carData, {
      new: true,
      runValidators: true,
    }).populate("owner", "fullName email phone avatar _id");

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({ message: "Car updated successfully", car });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete car
router.delete("/cars/:id", async (req, res) => {
  try {
    if (isMssql) {
      const car = await carRepo.deleteCar(req.params.id);
      if (!car) return res.status(404).json({ message: "Car not found" });
      return res.json({ message: "Car deleted successfully" });
    }
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve car
router.put("/cars/:id/approve", async (req, res) => {
  try {
    const carId = req.params.id;

    if (isMssql) {
      const carBefore = await carRepo.getById(carId);
      if (!carBefore) return res.status(404).json({ message: "Không tìm thấy xe" });
      const updates = { status: 'available', approvalStatus: 'approved', operationalStatus: 'available', approvedAt: new Date() };
      if (!carBefore.pricePerDay || carBefore.pricePerDay === 0) {
        Object.assign(updates, { pricePerDay: 800000, pricePerHour: 100000, pricePerDayWithDriver: 1500000, pricePerHourWithDriver: 200000, priceWeekend: 1000000, deposit: 10000000, commissionPercentage: 15 });
      }
      const car = await carRepo.updateCar(carId, updates);
      return res.json({ message: "Phê duyệt xe và thiết lập giá mặc định thành công", car });
    }

    const carBefore = await Car.findById(carId);
    if (!carBefore) return res.status(404).json({ message: "Không tìm thấy xe" });

    const updates = { 
      status: "available",
      approvalStatus: "approved",
      operationalStatus: "available",
      approvedAt: new Date() 
    };

    if (!carBefore.pricePerDay || carBefore.pricePerDay === 0) {
      updates.pricePerDay = 800000;
      updates.pricePerHour = 100000;
      updates.pricePerDayWithDriver = 1500000;
      updates.pricePerHourWithDriver = 200000;
      updates.priceWeekend = 1000000;
      updates.deposit = 10000000;
      updates.commissionPercentage = 15;
    }

    const car = await Car.findByIdAndUpdate(
      carId,
      updates,
      { new: true },
    ).populate("owner", "fullName email");

    res.json({ 
      message: "Phê duyệt xe và thiết lập giá mặc định thành công", 
      car 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject car
router.put("/cars/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    if (isMssql) {
      const car = await carRepo.updateCar(req.params.id, {
        status: 'rejected', approvalStatus: 'rejected', operationalStatus: 'inactive',
        rejectionReason: reason, rejectedAt: new Date()
      });
      if (!car) return res.status(404).json({ message: "Car not found" });
      return res.json({ message: "Car rejected successfully", car });
    }
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { 
        status: "rejected",
        approvalStatus: "rejected",
        operationalStatus: "inactive",
        rejectionReason: reason, 
        rejectedAt: new Date() 
      },
      { new: true },
    );

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({ message: "Car rejected successfully", car });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset all cars to available status
router.post("/cars/reset-all", async (req, res) => {
  try {
    const { includeUnavailableDates = true } = req.body;

    if (isMssql) {
      const { getSqlPool } = require('../db/sqlServer');
      const pool = await getSqlPool();
      // Reset all cars operational status
      const carResult = await pool.request().query(`UPDATE dbo.Cars SET operationalStatus='available', updatedAt=SYSUTCDATETIME()`);
      if (includeUnavailableDates) {
        await pool.request().query(`UPDATE dbo.Cars SET availabilityJson='{}' WHERE availabilityJson IS NOT NULL`);
      }
      // Cancel pending/holding bookings
      const cancelResult = await pool.request().query(`
        UPDATE dbo.Bookings SET status='cancelled', cancellationReason=N'Hệ thống reset', cancelledAt=SYSUTCDATETIME()
        WHERE status='pending' OR (bookingType='prebook' AND prebookJson LIKE '%holding%')
      `);
      return res.json({
        message: 'Reset thành công',
        modifiedCount: carResult.rowsAffected[0],
        cancelledBookings: cancelResult.rowsAffected[0],
        resetUnavailableDates: includeUnavailableDates
      });
    }
    
    // Build update object
    const updateData = {
      operationalStatus: 'available',
    };
    
    // Nếu yêu cầu xóa cả unavailableDates
    if (includeUnavailableDates) {
      updateData['availability.unavailableDates'] = [];
    }
    
    // Cập nhật tất cả xe
    const carResult = await Car.updateMany(
      {}, // Tất cả xe
      { $set: updateData }
    );
    
    // Hủy các booking liên quan (pre-booking holding và pending)
    // Không hủy các booking đang chạy (active, confirmed đã bắt đầu, completed)
    const now = new Date();
    
    // Tìm các booking cần hủy
    const bookingsToCancel = await Booking.find({
      $or: [
        // Pre-booking đang giữ chỗ
        { bookingType: 'prebook', 'prebook.status': 'holding' },
        // Booking chờ xác nhận (chưa bắt đầu)
        { status: 'pending', startDate: { $gt: now } }
      ]
    });
    
    let cancelledCount = 0;
    
    for (const booking of bookingsToCancel) {
      // Chuẩn bị data update
      const updateBookingData = {
        status: 'cancelled',
        cancellationReason: 'Hệ thống reset - xe được trả về trạng thái sẵn sàng',
        cancelledAt: new Date(),
      };
      
      // Nếu là pre-booking, cập nhật thêm prebook.status
      if (booking.bookingType === 'prebook') {
        updateBookingData['prebook.status'] = 'cancelled';
      }
      
      await Booking.findByIdAndUpdate(booking._id, updateBookingData);
      cancelledCount++;
    }
    
    // Log action
    console.log(`[Admin Reset All Cars] Updated ${carResult.modifiedCount} cars to available status, cancelled ${cancelledCount} bookings`);
    
    res.json({ 
      message: `Đã reset ${carResult.modifiedCount} xe về trạng thái sẵn sàng và hủy ${cancelledCount} đơn đặt liên quan`,
      modifiedCount: carResult.modifiedCount,
      cancelledBookings: cancelledCount,
      resetUnavailableDates: includeUnavailableDates
    });
  } catch (error) {
    console.error('[Admin Reset All Cars] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== DRIVER MANAGEMENT ====================

// Get all drivers with filtering and pagination
router.get("/drivers", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      experience,
      rating,
    } = req.query;
    const skip = (page - 1) * limit;

    if (isMssql) {
      const filter = { role: 'driver' };
      if (search) filter.search = search;
      const [drivers, total] = await Promise.all([
        userRepo.getAll({ filter, skip, limit: parseInt(limit), sort: 'createdAt DESC' }),
        userRepo.countDocuments(filter),
      ]);
      const cleanDrivers = drivers.map(d => { const c = { ...d }; delete c.passwordHash; return c; });
      return res.json({
        drivers: cleanDrivers,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
      });
    }

    const filter = {
      $or: [{ role: "driver" }, { "driverInfo.isStandaloneDriver": true }],
    };

    if (search) {
      filter.fullName = { $regex: search, $options: "i" };
    }
    if (status) {
      filter["driverInfo.driverStatus"] = status;
    }
    if (experience) {
      filter["driverInfo.experience"] = experience;
    }
    if (rating) {
      filter["rating.average"] = { $gte: parseFloat(rating) };
    }

    const drivers = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    // Return drivers without heavy images in the main list
    res.json({
      drivers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dedicated route for heavy driver documents
router.get("/drivers/:id/document/:field", async (req, res) => {
  try {
    let driver;
    if (isMssql) {
      driver = await userRepo.getUserById(req.params.id);
    } else {
      driver = await User.findById(req.params.id);
    }

    if (!driver || !driver.driverInfo)
      return res.status(404).send("Driver not found");

    const img = driver.driverInfo[req.params.field];
    if (!img || !img.data) return res.status(404).send("Image data not found");

    // Robust buffer conversion
    const buffer = Buffer.isBuffer(img.data) ? img.data : Buffer.from(img.data);

    res.set({
      "Content-Type": img.contentType || "image/jpeg",
      "Content-Length": buffer.length,
      "Cache-Control": "no-cache", 
      Pragma: "no-cache",
    });

    res.status(200).send(buffer);
  } catch (error) {
    console.error("Document retrieval error:", error);
    res.status(500).send("Internal server error");
  }
});

// Create new driver
router.post("/drivers", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      driverInfo,
      avatar,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email đã được sử dụng. Vui lòng chọn email khác." });
    }

    const driver = new User({
      fullName,
      email,
      password,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
      gender: gender || "male",
      role: "driver",
      isVerified: true,
      isActive: true,

      contract: {
        isAgreed: true,
        agreedAt: new Date(),
        contractType: "driver",
        signatureName: fullName,
      },

      // Mapping to model structure
      idCard: {
        number: driverInfo.idCard || "",
      },
      drivingLicense: {
        number: driverInfo.driverLicense || "",
        type: driverInfo.licenseClass || "B2",
        expiryDate: driverInfo.licenseExpiry
          ? new Date(driverInfo.licenseExpiry)
          : null,
      },

      driverInfo: {
        driverLicense: driverInfo.driverLicense || "",
        licenseExpiry: driverInfo.licenseExpiry
          ? new Date(driverInfo.licenseExpiry)
          : null,
        experience: driverInfo.experience || "3",
        vehicleType: driverInfo.vehicleType || "sedan",
        licenseClass: driverInfo.licenseClass || "B2",
        operatingCity: driverInfo.operatingCity || "TP. Hồ Chí Minh",
        homeAddress: driverInfo.address
          ? `${driverInfo.address.street}, ${driverInfo.address.district}, ${driverInfo.address.city}`
          : "",
        driverRatePerDay: driverInfo.driverRatePerDay || 500000,
        idCard: driverInfo.idCard || "",
        isStandaloneDriver: true,
      },
    });

    // Handle base64 images if provided
    const processBase64 = (base64String) => {
      if (!base64String || !base64String.includes("base64,")) return null;
      const parts = base64String.split("base64,");
      return {
        data: Buffer.from(parts[1], "base64"),
        contentType: parts[0].split(":")[1].split(";")[0] || "image/jpeg",
      };
    };

    if (driverInfo.idCardFrontImage) {
      const processed = processBase64(driverInfo.idCardFrontImage);
      if (processed) driver.driverInfo.idCardFrontImage = processed;
    }
    if (driverInfo.idCardBackImage) {
      const processed = processBase64(driverInfo.idCardBackImage);
      if (processed) driver.driverInfo.idCardBackImage = processed;
    }
    if (driverInfo.licenseImage) {
      const processed = processBase64(driverInfo.licenseImage);
      if (processed) driver.driverInfo.licenseImage = processed;
    }
    if (avatar) {
      const processed = processBase64(avatar);
      if (processed) driver.avatar = processed;
    }

    // Link and create structured address if provided
    if (driverInfo.address) {
      try {
        const newAddress = new Address({
          street: driverInfo.address.street,
          ward: {
            ward_code: driverInfo.address.districtCode || "0",
            name: driverInfo.address.district,
          },
          province: {
            province_code: driverInfo.address.cityCode || "0",
            name: driverInfo.address.city,
          },
          fullAddress: `${driverInfo.address.street}, ${driverInfo.address.district}, ${driverInfo.address.city}`,
          referenceType: "User",
          referenceId: driver._id,
          owner: driver._id,
          isDefault: true,
          addressType: "home",
        });
        await newAddress.save();
        driver.addressId = newAddress._id;
      } catch (addrError) {
        console.error("Error creating address record:", addrError);
        // Non-critical: continue saving the driver anyway, we have the string backup
      }
    }

    await driver.save();
    res.status(201).json({ message: "Thêm tài xế thành công", driver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update driver status/verification/info
router.put("/drivers/:id", async (req, res) => {
  try {
    const {
      isVerified,
      isActive,
      driverStatus,
      idCard,
      drivingLicense,
      driverInfo,
      avatar,
    } = req.body || {};

    let user;
    if (isMssql) {
      user = await userRepo.getUserById(req.params.id);
    } else {
      user = await User.findById(req.params.id);
    }

    if (!user) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (isMssql) {
      const updates = {};
      if (isVerified !== undefined) updates.isVerified = isVerified;
      if (isActive !== undefined) updates.isActive = isActive;
      
      const di = user.driverInfo || {};
      if (driverStatus !== undefined) di.driverStatus = driverStatus;
      if (driverInfo) Object.assign(di, driverInfo);
      if (Object.keys(di).length > 0) updates.driverInfoJson = JSON.stringify(di);

      if (idCard) updates.idCardJson = JSON.stringify({ ...(user.idCard || {}), ...idCard });
      if (drivingLicense) updates.drivingLicenseJson = JSON.stringify({ ...(user.drivingLicense || {}), ...drivingLicense });

      if (avatar) {
        const processBase64 = (base64String) => {
          if (!base64String || !base64String.includes("base64,")) return null;
          const parts = base64String.split("base64,");
          return {
            data: Buffer.from(parts[1], "base64"),
            contentType: parts[0].split(":")[1].split(";")[0] || "image/jpeg",
          };
        };
        const processed = processBase64(avatar);
        if (processed) updates.avatarJson = JSON.stringify(processed);
      }

      const updatedUser = await userRepo.updateUser(req.params.id, updates);
      
      if (isVerified === true && user.isVerified === false) {
         try {
           await notificationRepo.create({
             recipient: user.id,
             recipientType: user.role,
             title: "Tài khoản Sinh thái Tài xế đã được xác thực",
             message: "Chúc mừng! Hồ sơ Tài xế của bạn đã được quản trị viên phê duyệt. Bạn đã có thể bắt đầu nhận chuyến và hoạt động.",
             type: "system"
           });
         } catch(e) { console.error("Notify error:", e.message); }
      }

      return res.json({ message: "Driver updated successfully", user: updatedUser });
    }

    // Mongo branch
    if (isVerified !== undefined) {
      if (user.isVerified === false && isVerified === true) {
        try {
          const Notification = require("../models/Notification");
          const notifyDriver = new Notification({
            recipient: user._id,
            recipientType: user.role,
            title: "Tài khoản Sinh thái Tài xế đã được xác thực",
            message: "Chúc mừng! Hồ sơ Tài xế của bạn đã được quản trị viên phê duyệt. Bạn đã có thể bắt đầu nhận chuyến và hoạt động.",
            type: "system"
          });
          await notifyDriver.save();
        } catch(err) {
          console.error("Lỗi gửi thông báo duyệt tài xế:", err);
        }
      }
      user.isVerified = isVerified;
    }
    if (isActive !== undefined) user.isActive = isActive;

    if (driverStatus !== undefined) {
      if (!user.driverInfo) user.driverInfo = {};
      user.driverInfo.driverStatus = driverStatus;
    }

    if (idCard) {
      user.idCard = { ...(user.idCard || {}), ...idCard };
    }

    if (drivingLicense) {
      user.drivingLicense = { ...(user.drivingLicense || {}), ...drivingLicense };
    }

    if (driverInfo) {
      user.driverInfo = Object.assign(user.driverInfo || {}, driverInfo);
      user.markModified('driverInfo');
    }

    if (avatar) {
      const processBase64 = (base64String) => {
        if (!base64String || !base64String.includes("base64,")) return null;
        const parts = base64String.split("base64,");
        return {
          data: Buffer.from(parts[1], "base64"),
          contentType: parts[0].split(":")[1].split(";")[0] || "image/jpeg",
        };
      };
      const processed = processBase64(avatar);
      if (processed) {
        user.avatar = processed;
      }
    }

    await user.save();
    res.json({ message: "Driver updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new driver (refactored to single route with branching)
router.post("/drivers", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      driverInfo,
      avatar,
    } = req.body;

    // Check if user exists
    let existingUser;
    if (isMssql) {
      existingUser = await userRepo.getUserByEmail(email);
    } else {
      existingUser = await User.findOne({ email });
    }
    
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email đã được sử dụng. Vui lòng chọn email khác." });
    }

    const processBase64 = (base64String) => {
      if (!base64String || !base64String.includes("base64,")) return null;
      const parts = base64String.split("base64,");
      return {
        data: Buffer.from(parts[1], "base64"),
        contentType: parts[0].split(":")[1].split(";")[0] || "image/jpeg",
      };
    };

    if (isMssql) {
      const di = {
        driverLicense: driverInfo.driverLicense || "",
        licenseExpiry: driverInfo.licenseExpiry ? new Date(driverInfo.licenseExpiry) : null,
        experience: driverInfo.experience || "3",
        vehicleType: driverInfo.vehicleType || "sedan",
        licenseClass: driverInfo.licenseClass || "B2",
        operatingCity: driverInfo.operatingCity || "TP. Hồ Chí Minh",
        homeAddress: driverInfo.address ? `${driverInfo.address.street}, ${driverInfo.address.district}, ${driverInfo.address.city}` : "",
        driverRatePerDay: driverInfo.driverRatePerDay || 500000,
        idCard: driverInfo.idCard || "",
        isStandaloneDriver: true,
      };

      if (driverInfo.idCardFrontImage) di.idCardFrontImage = processBase64(driverInfo.idCardFrontImage);
      if (driverInfo.idCardBackImage) di.idCardBackImage = processBase64(driverInfo.idCardBackImage);
      if (driverInfo.licenseImage) di.licenseImage = processBase64(driverInfo.licenseImage);

      const driver = await userRepo.createUser({
        fullName,
        email,
        password,
        phone,
        role: "driver",
        isVerified: true,
        isActive: true,
        driverInfo: di,
        avatar: avatar ? processBase64(avatar) : null,
        contract: { isAgreed: true, agreedAt: new Date(), contractType: "driver", signatureName: fullName },
        idCard: { number: driverInfo.idCard || "" },
        drivingLicense: { 
           number: driverInfo.driverLicense || "", 
           type: driverInfo.licenseClass || "B2",
           expiryDate: driverInfo.licenseExpiry ? new Date(driverInfo.licenseExpiry) : null 
        }
      });

      return res.status(201).json({ message: "Thêm tài xế thành công", driver });
    }

    // Mongo branch
    const driver = new User({
      fullName,
      email,
      password,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
      gender: gender || "male",
      role: "driver",
      isVerified: true,
      isActive: true,
      contract: { isAgreed: true, agreedAt: new Date(), contractType: "driver", signatureName: fullName },
      idCard: { number: driverInfo.idCard || "" },
      drivingLicense: {
        number: driverInfo.driverLicense || "",
        type: driverInfo.licenseClass || "B2",
        expiryDate: driverInfo.licenseExpiry ? new Date(driverInfo.licenseExpiry) : null,
      },
      driverInfo: {
        driverLicense: driverInfo.driverLicense || "",
        licenseExpiry: driverInfo.licenseExpiry ? new Date(driverInfo.licenseExpiry) : null,
        experience: driverInfo.experience || "3",
        vehicleType: driverInfo.vehicleType || "sedan",
        licenseClass: driverInfo.licenseClass || "B2",
        operatingCity: driverInfo.operatingCity || "TP. Hồ Chí Minh",
        homeAddress: driverInfo.address ? `${driverInfo.address.street}, ${driverInfo.address.district}, ${driverInfo.address.city}` : "",
        driverRatePerDay: driverInfo.driverRatePerDay || 500000,
        idCard: driverInfo.idCard || "",
        isStandaloneDriver: true,
      },
    });

    if (driverInfo.idCardFrontImage) {
      const processed = processBase64(driverInfo.idCardFrontImage);
      if (processed) driver.driverInfo.idCardFrontImage = processed;
    }
    if (driverInfo.idCardBackImage) {
      const processed = processBase64(driverInfo.idCardBackImage);
      if (processed) driver.driverInfo.idCardBackImage = processed;
    }
    if (driverInfo.licenseImage) {
      const processed = processBase64(driverInfo.licenseImage);
      if (processed) driver.driverInfo.licenseImage = processed;
    }
    if (avatar) {
      const processed = processBase64(avatar);
      if (processed) driver.avatar = processed;
    }

    await driver.save();
    res.status(201).json({ message: "Thêm tài xế thành công", driver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete driver
router.delete("/drivers/:id", async (req, res) => {
  try {
    if (isMssql) {
      const user = await userRepo.getUserById(req.params.id);
      if (!user || user.role !== 'driver') return res.status(404).json({ message: 'Driver not found' });
      await userRepo.deleteUser(req.params.id);
      return res.json({ message: 'Driver deleted successfully' });
    }
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      $or: [{ role: "driver" }, { "driverInfo.isStandaloneDriver": true }],
    });

    if (!user) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== BOOKING MANAGEMENT ====================

// Get all bookings with pagination and filtering
router.get("/bookings", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    let bookings, total;
    if (isMssql) {
      [bookings, total] = await Promise.all([
        bookingRepo.getAll({ filter, skip, limit: parseInt(limit), sort: 'createdAt DESC', populate: ['renter', 'owner', 'car', 'driver'] }),
        bookingRepo.countDocuments(filter),
      ]);
    } else {
      bookings = await Booking.find(filter)
        .populate("car", "brand model licensePlate images location year transmission fuel")
        .populate("renter", "fullName email phone")
        .populate("driver", "fullName phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      total = await Booking.countDocuments(filter);
    }

    // Helper function to convert binary image to data URL
    const toDataUrl = (fileObj) => {
      if (!fileObj) return null;
      if (fileObj.url) return fileObj.url;
      if (!fileObj.data) return null;
      const buffer = Buffer.isBuffer(fileObj.data) ? fileObj.data : Buffer.from(fileObj.data);
      return `data:${fileObj.contentType || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    };

    // Transform bookings
    const transformedBookings = bookings.map((booking) => {
      const b = isMssql ? booking : booking.toObject();
      
      if (b.car && b.car.images && Array.isArray(b.car.images)) {
        b.car.images = b.car.images.map(img => toDataUrl(img)).filter(Boolean);
        b.car.firstImage = b.car.images[0] || '/placeholder-car.jpg';
      } else if (b.car) {
        b.car.firstImage = '/placeholder-car.jpg';
        b.car.images = [];
      }
      
      return b;
    });

    res.json({
      bookings: transformedBookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking by ID
router.get("/bookings/:id", async (req, res) => {
  try {
    if (isMssql) {
      const booking = await bookingRepo.getById(req.params.id, ['renter', 'owner', 'car', 'driver']);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      return res.json(booking);
    }
    const booking = await Booking.findById(req.params.id)
      .populate("car", "brand model images licensePlate location")
      .populate("renter", "fullName email phone avatar _id")
      .populate("driver", "fullName phone avatar _id");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== PRE-BOOKING MANAGEMENT ====================

// Get all pre-bookings
router.get("/prebookings", async (req, res) => {
  try {
    const { status } = req.query;

    if (isMssql) {
      const filter = { bookingType: 'prebook' };
      if (status) filter.prebookStatus = status;
      const preBookings = await bookingRepo.getAll({ filter, limit: 100, sort: 'createdAt DESC', populate: ['renter', 'car', 'driver'] });
      return res.json({ preBookings, total: preBookings.length });
    }

    // Build filter for pre-bookings
    const filter = {
      bookingType: 'prebook'
    };
    
    if (status) {
      filter['prebook.status'] = status;
    }

    const preBookings = await Booking.find(filter)
      .populate("car", "brand model licensePlate images location year transmission fuel")
      .populate("renter", "fullName email phone")
      .populate("driver", "fullName phone")
      .sort({ createdAt: -1 });

    // Helper function to convert binary image to data URL
    const toDataUrl = (fileObj) => {
      if (!fileObj || !fileObj.data) return null;
      const buffer = Buffer.isBuffer(fileObj.data) ? fileObj.data : Buffer.from(fileObj.data);
      return `data:${fileObj.contentType || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    };

    // Transform pre-bookings to convert car images to data URLs
    const transformedPreBookings = preBookings.map((booking) => {
      const bookingObj = booking.toObject();
      
      // Transform car images if car exists
      if (bookingObj.car && bookingObj.car.images && Array.isArray(bookingObj.car.images)) {
        bookingObj.car.images = bookingObj.car.images.map((img) => {
          if (img.data) {
            return toDataUrl(img);
          }
          if (img.url) {
            return img.url;
          }
          return null;
        }).filter(Boolean);
        
        bookingObj.car.firstImage = bookingObj.car.images[0] || '/placeholder-car.jpg';
      } else if (bookingObj.car) {
        bookingObj.car.firstImage = '/placeholder-car.jpg';
        bookingObj.car.images = [];
      }
      
      return bookingObj;
    });

    res.json({
      preBookings: transformedPreBookings,
      total: transformedPreBookings.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Keep original booking by ID but with MSSQL support
router.get("/bookings/:id", async (req, res) => {
  try {
    let booking;
    if (isMssql) {
      booking = await bookingRepo.getById(req.params.id, ['car', 'renter', 'driver']);
    } else {
      booking = await Booking.findById(req.params.id)
        .populate("car", "brand model images licensePlate location")
        .populate("renter", "fullName email phone avatar _id")
        .populate("driver", "fullName phone avatar _id");
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm booking
router.put("/bookings/:id/confirm", async (req, res) => {
  try {
    if (isMssql) {
      const booking = await bookingRepo.updateBooking(req.params.id, { status: 'confirmed', confirmedAt: new Date() });
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      // Update car operational status
      if (booking.car) {
        const carId = typeof booking.car === 'string' ? booking.car : booking.car._id || booking.car;
        await carRepo.updateCar(carId, { operationalStatus: 'rented' });
      }
      // Create notification
      try {
        const renterId = typeof booking.renter === 'string' ? booking.renter : booking.renter?._id || booking.renter;
        await notificationRepo.create({ recipient: renterId, recipientType: 'user', title: '✅ Đơn đặt xe đã được duyệt', message: `Đơn #${String(booking._id).slice(-6).toUpperCase()} đã được duyệt.`, type: 'booking' });
      } catch(e) { console.error('Notify error:', e.message); }
      return res.json({ message: 'Booking confirmed successfully', booking });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "confirmed", confirmedAt: new Date() },
      { new: true },
    ).populate("car renter driver", "fullName email phone avatar _id");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Tự động cập nhật trạng thái hoạt động xe sang "rented" khi admin xác nhận đơn
    if (booking.car && booking.car._id) {
      const Car = require("../models/Car");
      const car = await Car.findById(booking.car._id);
      if (car) {
        car.operationalStatus = 'rented';
        await car.save();
        console.log(`[Admin] Car ${car._id} operationalStatus set to 'rented' (booking confirmed)`);
      }
    }

    // Gửi thông báo cho khách (renter) khi đơn được duyệt
    try {
      const Notification = require("../models/Notification");
      const notifyUser = new Notification({
        recipient: booking.renter._id,
        recipientType: "user",
        title: "✅ Đơn đặt xe đã được duyệt",
        message: `Hệ thống vừa xác nhận duyệt đơn đặt xe #${booking._id.toString().slice(-6).toUpperCase()} của bạn. Bạn vui lòng chuẩn bị cho hành trình sắp tới nhé!`,
        type: "booking",
        metadata: { bookingId: booking._id, carId: booking.car?._id }
      });
      await notifyUser.save();
    } catch(err) {
      console.error("Lỗi gửi thông báo xác nhận đơn cho khách:", err);
    }

    res.json({ message: "Booking confirmed successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking
router.put("/bookings/:id/cancel", async (req, res) => {
  try {
    const { reason } = req.body;

    if (isMssql) {
      const booking = await bookingRepo.getById(req.params.id);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      const updated = await bookingRepo.updateBooking(req.params.id, { status: 'cancelled', cancellationReason: reason, cancelledAt: new Date() });
      // Reset car operational status
      if (booking.car) {
        const carId = typeof booking.car === 'string' ? booking.car : booking.car._id || booking.car;
        await carRepo.updateCar(carId, { operationalStatus: 'available' });
      }
      return res.json({ message: 'Booking cancelled successfully', booking: updated });
    }
    
    // Tìm booking trước để lấy thông tin car
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Chuẩn bị data update
    const updateData = {
      status: "cancelled",
      cancellationReason: reason,
      cancelledAt: new Date(),
    };
    
    // Nếu là pre-booking, cập nhật thêm prebook.status
    if (booking.bookingType === 'prebook') {
      updateData['prebook.status'] = 'cancelled';
    }
    
    // Cập nhật booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    
    // Xử lý xe: xóa unavailableDates và đặt lại operationalStatus
    if (booking.car) {
      const car = await Car.findById(booking.car);
      if (car) {
        // Xóa unavailableDates liên quan đến booking này
        if (car.availability?.unavailableDates) {
          car.availability.unavailableDates = car.availability.unavailableDates.filter(
            date => date.reason !== 'booking' || date.bookingId?.toString() !== booking._id.toString()
          );
        }
        
        // Đặt lại operationalStatus về 'available'
        car.operationalStatus = 'available';
        await car.save();
        console.log(`[Admin Cancel] Car ${car._id} updated: operationalStatus='available', removed unavailableDates for booking ${booking._id}`);
      }
    }

    res.json({ message: "Booking cancelled successfully", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign driver to booking (admin)
router.put("/bookings/:id/assign-driver", async (req, res) => {
  try {
    const { driverId } = req.body;
    
    if (isMssql) {
      const booking = await bookingRepo.updateBooking(req.params.id, { driverId: String(driverId), status: 'driver_assigned' });
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
      return res.json({ message: 'Driver assigned successfully', booking });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { driver: driverId, status: "driver_assigned" },
      { new: true },
    ).populate("driver", "fullName phone");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Driver assigned successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ANALYTICS ====================

// Get analytics data (legacy/simpler version)
router.get("/analytics", async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const now = new Date();
    let startDate = new Date();

    if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);
    else startDate.setDate(now.getDate() - 30);

    if (isMssql) {
      const [topCars, topUsers, recentBookings] = await Promise.all([
        bookingRepo.getTopCarsByRevenue(startDate, 5),
        bookingRepo.getTopUsersBySpending(startDate, 5),
        bookingRepo.getAll({ sort: 'createdAt DESC', limit: 3, populate: ['car', 'renter'] })
      ]);

      return res.json({
        topCars,
        topUsers,
        recentActivities: recentBookings.map(b => ({
           type: 'booking',
           id: b.id,
           title: `Booking #${String(b.id).slice(-6)}`,
           description: `${b.renter?.fullName || 'Khách'} đặt xe ${b.car?.brand || ''}`,
           time: b.createdAt
        }))
      });
    }

    // MongoDB path
    const topCars = await Booking.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$car",
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.totalAmount" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "cars",
          localField: "_id",
          foreignField: "_id",
          as: "car",
        },
      },
      { $unwind: "$car" },
    ]);

    const topUsers = await Booking.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$user",
          count: { $sum: 1 },
          spent: { $sum: "$pricing.totalAmount" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);

    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(3).populate("car renter");
    
    res.json({
      topCars,
      topUsers,
      recentActivities: recentBookings.map(b => ({
        type: 'booking',
        id: b._id,
        title: `Booking #${String(b._id).slice(-6)}`,
        description: `${b.renter?.fullName || 'Khách'} đặt xe ${b.car?.brand || ''}`,
        time: b.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ADMIN NOTIFICATIONS (chuông) ====================
router.get("/notifications/summary", async (req, res) => {
  try {
    if (isMssql) {
      const { getSqlPool } = require('../db/sqlServer');
      const pool = await getSqlPool();

      const [pendingBookingsCount, pendingDriversCount, pendingCollabCountR] = await Promise.all([
        bookingRepo.countDocuments({ status: 'pending' }),
        userRepo.countDocuments({ role: 'driver', isVerified: false }),
        pool.request().query(`SELECT COUNT(*) as cnt FROM dbo.Users WHERE JSON_VALUE(collaboratorRequestJson, '$.status') = 'pending'`),
      ]);
      const pendingCollaboratorsCount = pendingCollabCountR.recordset[0].cnt;

      const [pendingBookings, pendingDrivers, pendingCollabR] = await Promise.all([
        bookingRepo.getAll({ filter: { status: 'pending' }, limit: 8, sort: 'createdAt DESC', populate: ['renter', 'car'] }),
        userRepo.getAll({ filter: { role: 'driver', isVerified: false }, limit: 8, sort: 'createdAt DESC' }),
        pool.request().query(`
          SELECT TOP 8 id, fullName, email, phone, role, isVerified, collaboratorRequestJson, createdAt
          FROM dbo.Users
          WHERE JSON_VALUE(collaboratorRequestJson, '$.status') = 'pending'
          ORDER BY createdAt DESC
        `),
      ]);

      const pendingCollabs = pendingCollabR.recordset.map(r => {
        const collab = r.collaboratorRequestJson ? JSON.parse(r.collaboratorRequestJson) : null;
        return { _id: r.id, id: r.id, fullName: r.fullName, email: r.email, phone: r.phone, role: r.role, isVerified: !!r.isVerified, collaboratorRequest: collab, createdAt: r.createdAt };
      });

      const items = [
        ...pendingBookings.map(b => ({
          id: `booking-${b._id}`,
          kind: 'booking',
          title: `Đơn đặt mới #${String(b._id).slice(-8).toUpperCase()}`,
          subtitle: `${b.renter?.fullName || 'Khách'} \u00b7 ${b.car ? `${b.car.brand || ''} ${b.car.model || ''}`.trim() : 'Xe'}`,
          createdAt: b.createdAt,
          link: '/admin/bookings',
        })),
        ...pendingCollabs.map(u => ({
          id: `collab-${u._id}`,
          kind: 'collaborator',
          title: `CTV đăng ký: ${u.fullName}`,
          subtitle: u.email || u.phone || '',
          createdAt: u.collaboratorRequest?.requestedAt || u.createdAt,
          link: '/admin/user-approvals',
        })),
        ...pendingDrivers.map(u => ({
          id: `driver-${u._id}`,
          kind: 'driver',
          title: `Tài xế chờ duyệt: ${u.fullName}`,
          subtitle: u.email || u.phone || '',
          createdAt: u.createdAt,
          link: '/admin/user-approvals',
        }))
      ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 16);

      return res.json({
        counts: { pendingBookings: pendingBookingsCount, pendingCollaborators: pendingCollaboratorsCount, pendingDrivers: pendingDriversCount },
        total: pendingBookingsCount + pendingCollaboratorsCount + pendingDriversCount,
        items,
      });
    }

    const [
      pendingBookingsCount,
      pendingCollaboratorsCount,
      pendingDriversCount,
      pendingBookings,
      pendingCollabs,
      pendingDrivers,
    ] = await Promise.all([
      Booking.countDocuments({ status: "pending" }),
      User.countDocuments({ 
        "collaboratorRequest.status": "pending",
        $or: [{ role: "collaborator" }, { "collaboratorRequest.idCardFrontImage": { $exists: true, $ne: null } }]
      }),
      User.countDocuments({ role: "driver", isVerified: false }),
      Booking.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("renter", "fullName phone")
        .populate("car", "brand model")
        .lean(),
      User.find({ 
        "collaboratorRequest.status": "pending",
        $or: [{ role: "collaborator" }, { "collaboratorRequest.idCardFrontImage": { $exists: true, $ne: null } }]
      })
        .sort({ "collaboratorRequest.requestedAt": -1, createdAt: -1 })
        .limit(8)
        .select("fullName email phone createdAt collaboratorRequest")
        .lean(),
      User.find({ role: "driver", isVerified: false })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("fullName email phone createdAt")
        .lean(),
    ]);

    const items = [
      ...pendingBookings.map((b) => ({
        id: `booking-${b._id}`,
        kind: "booking",
        title: `Đơn đặt mới #${String(b._id).slice(-8).toUpperCase()}`,
        subtitle: `${b.renter?.fullName || "Khách"} · ${b.car ? `${b.car.brand || ""} ${b.car.model || ""}`.trim() : "Xe"}`,
        createdAt: b.createdAt,
        link: "/admin/bookings",
      })),
      ...pendingCollabs.map((u) => ({
        id: `collab-${u._id}`,
        kind: "collaborator",
        title: `CTV đăng ký: ${u.fullName}`,
        subtitle: u.email || u.phone || "",
        createdAt: u.collaboratorRequest?.requestedAt || u.createdAt,
        link: "/admin/user-approvals",
      })),
      ...pendingDrivers.map((u) => ({
        id: `driver-${u._id}`,
        kind: "driver",
        title: `Tài xế chờ duyệt: ${u.fullName}`,
        subtitle: u.email || u.phone || "",
        createdAt: u.createdAt,
        link: "/admin/user-approvals",
      })),
    ]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 16);

    res.json({
      counts: {
        pendingBookings: pendingBookingsCount,
        pendingCollaborators: pendingCollaboratorsCount,
        pendingDrivers: pendingDriversCount,
      },
      total:
        pendingBookingsCount +
        pendingCollaboratorsCount +
        pendingDriversCount,
      items,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== COLLABORATOR MANAGEMENT ====================

// Get all users with pending collaborator requests (full data with images)
router.get("/collaborators/pending", async (req, res) => {
  try {
    if (isMssql) {
      // In SQL, collaboratorRequest is stored as JSON - need custom query
      const { getSqlPool, sql } = require('../db/sqlServer');
      const pool = await getSqlPool();
      const result = await pool.request().query(`
        SELECT id, fullName, email, phone, role, isVerified, collaboratorRequestJson, createdAt
        FROM dbo.Users
        WHERE JSON_VALUE(collaboratorRequestJson, '$.status') = 'pending'
        ORDER BY createdAt DESC
      `);
      const users = result.recordset.map(r => {
        const collab = r.collaboratorRequestJson ? JSON.parse(r.collaboratorRequestJson) : null;
        return { _id: r.id, id: r.id, fullName: r.fullName, email: r.email, phone: r.phone, role: r.role, isVerified: !!r.isVerified, collaboratorRequest: collab, type: 'collaboratorRequest', createdAt: r.createdAt };
      }).filter(u => u.collaboratorRequest?.status === 'pending');
      return res.json(users);
    }
    const users = await User.find({
      "collaboratorRequest.status": "pending",
      $or: [{ role: "collaborator" }, { "collaboratorRequest.idCardFrontImage": { $exists: true, $ne: null } }]
    }).select("-password").limit(50);

    const toDataUrl = (fileObj) => {
      if (!fileObj || !fileObj.data) return undefined;
      return `data:${fileObj.contentType};base64,${fileObj.data.toString("base64")}`;
    };

    const result = users.map((user) => {
      const obj = user.toObject();
      obj.type = "collaboratorRequest";
      if (obj.collaboratorRequest) {
        const cr = obj.collaboratorRequest;
        if (cr.idCardFrontImage) cr.idCardFrontImage = toDataUrl(cr.idCardFrontImage) || "";
        if (cr.idCardBackImage) cr.idCardBackImage = toDataUrl(cr.idCardBackImage) || "";
        if (cr.licenseImage) cr.licenseImage = toDataUrl(cr.licenseImage) || "";
        if (cr.additionalDocs && Array.isArray(cr.additionalDocs)) {
          cr.additionalDocs = cr.additionalDocs.map((d) => toDataUrl(d) || "");
        }
      }
      return obj;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get collaborator stats summary
router.get("/collaborators/stats", async (req, res) => {
  try {
    if (isMssql) {
      const { getSqlPool } = require('../db/sqlServer');
      const pool = await getSqlPool();
      const [pendingR, approvedR, rejectedR, totalR] = await Promise.all([
        pool.request().query(`SELECT COUNT(*) as cnt FROM dbo.Users WHERE JSON_VALUE(collaboratorRequestJson, '$.status') = 'pending'`),
        pool.request().query(`SELECT COUNT(*) as cnt FROM dbo.Users WHERE role='collaborator'`),
        pool.request().query(`SELECT COUNT(*) as cnt FROM dbo.Users WHERE JSON_VALUE(collaboratorRequestJson, '$.status') = 'rejected'`),
        pool.request().query(`SELECT COUNT(*) as cnt FROM dbo.Users WHERE collaboratorRequestJson IS NOT NULL OR role='collaborator'`),
      ]);
      return res.json({ pending: pendingR.recordset[0].cnt, approved: approvedR.recordset[0].cnt, rejected: rejectedR.recordset[0].cnt, total: totalR.recordset[0].cnt });
    }
    const [pending, approved, rejected, total] = await Promise.all([
      User.countDocuments({ 
        "collaboratorRequest.status": "pending",
        $or: [{ role: "collaborator" }, { "collaboratorRequest.idCardFrontImage": { $exists: true, $ne: null } }]
      }),
      User.countDocuments({ role: "collaborator" }),
      User.countDocuments({ "collaboratorRequest.status": "rejected" }),
      User.countDocuments({ $or: [{ "collaboratorRequest": { $exists: true } }, { role: "collaborator" }] }),
    ]);
    res.json({ pending, approved, rejected, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending approvals
router.get("/pending-approvals", async (req, res) => {
  try {
    if (isMssql) {
      const [pendingUsers, pendingCars] = await Promise.all([
        userRepo.getAll({ filter: { isVerified: false }, limit: 20 }),
        carRepo.getAll({ filter: { status: 'pending' }, limit: 20 }),
      ]);
      const pendingApprovals = [
        ...pendingUsers.map(u => ({ _id: u._id, type: 'user', fullName: u.fullName, email: u.email, createdAt: u.createdAt })),
        ...pendingCars.map(c => ({ _id: c._id, type: 'car', brand: c.brand, model: c.model, createdAt: c.createdAt })),
      ];
      return res.json(pendingApprovals);
    }
    const [pendingUsers, pendingCars] = await Promise.all([
      User.find({ isVerified: false }).limit(20),
      Car.find({ status: "pending" }).limit(20),
    ]);

    // Also include users who have a pending collaboratorRequest
    const pendingCollaborators = await User.find({
      "collaboratorRequest.status": "pending",
      $or: [{ role: "collaborator" }, { "collaboratorRequest.idCardFrontImage": { $exists: true, $ne: null } }]
    }).limit(20);

    const pendingApprovals = [
      ...pendingUsers.map((user) => ({
        _id: user._id,
        type: "user",
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      })),
      ...pendingCollaborators.map((user) => ({
        _id: user._id,
        type: "collaboratorRequest",
        fullName: user.fullName,
        email: user.email,
        note: user.collaboratorRequest?.note,
        requestedAt: user.collaboratorRequest?.requestedAt,
        createdAt: user.createdAt,
      })),
      ...pendingCars.map((car) => ({
        _id: car._id,
        type: "car",
        brand: car.brand,
        model: car.model,
        createdAt: car.createdAt,
      })),
    ];

    res.json(pendingApprovals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve collaborator request
router.put("/collaborators/:id/approve", async (req, res) => {
  try {
    let user;
    if (isMssql) {
      user = await userRepo.getUserById(req.params.id);
    } else {
      user = await User.findById(req.params.id);
    }

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.collaboratorRequest || user.collaboratorRequest.status !== "pending") {
      return res.status(400).json({ message: "No pending collaborator request for this user" });
    }

    if (isMssql) {
      const updates = { isVerified: true };
      if (user.role !== 'driver') updates.role = 'collaborator';
      
      const cr = user.collaboratorRequest;
      cr.status = 'approved';
      cr.reviewedAt = new Date();
      cr.reviewedBy = String(req.user._id);
      updates.collaboratorRequestJson = JSON.stringify(cr);

      await userRepo.updateUser(req.params.id, updates);

      // Auto-create cars if provided
      if (cr.carSubmissions && cr.carSubmissions.length > 0) {
        for (const subm of cr.carSubmissions) {
          try {
            await carRepo.createCar({
              owner: user.id,
              brand: subm.make || 'Chưa rõ',
              model: subm.model || 'Chưa rõ',
              year: subm.year || new Date().getFullYear(),
              licensePlate: subm.licensePlate || `TEMP-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              type: 'Sedan',
              transmission: 'automatic',
              fuel: 'gasoline',
              status: 'available',
              approvalStatus: 'approved',
              operationalStatus: 'available',
              approvedAt: new Date(),
              pricePerDay: 800000,
              deposit: 10000000,
              images: (subm.photos || []).map((p, idx) => ({ url: p.url || p, isMain: idx === 0 })),
            });
          } catch(e) { console.error('Auto-car error:', e.message); }
        }
      }

      try {
        await notificationRepo.create({ recipient: user.id, recipientType: 'user', title: 'Đăng ký Cộng tác viên thành công', message: 'Chúc mừng! Yêu cầu làm Cộng tác viên của bạn đã được phê duyệt.', type: 'system' });
      } catch(e) {}

      const finalUser = await userRepo.getUserById(req.params.id);
      return res.json({ message: "Collaborator request approved", user: finalUser });
    }

    // Mongo branch
    if (user.role !== "driver") {
      user.role = "collaborator";
    }
    user.isVerified = true;
    user.collaboratorRequest.status = "approved";
    user.collaboratorRequest.reviewedAt = new Date();
    user.collaboratorRequest.reviewedBy = req.user._id;

    await user.save();

    try {
      const notifyCtv = new Notification({
        recipient: user._id,
        recipientType: user.role,
        title: "Đăng ký Cộng tác viên thành công",
        message: "Chúc mừng! Yêu cầu làm Cộng tác viên của bạn đã được phê duyệt. Bây giờ bạn có thể bắt đầu giới thiệu khách hàng để nhận hoa hồng.",
        type: "system"
      });
      await notifyCtv.save();
    } catch(err) {
      console.error("Lỗi gửi thông báo CTV:", err);
    }

    if (user.collaboratorRequest.carSubmissions && user.collaboratorRequest.carSubmissions.length > 0) {
      const Car = require("../models/Car");
      for (const subm of user.collaboratorRequest.carSubmissions) {
        try {
          const newCar = new Car({
            owner: user._id,
            brand: subm.make || 'Chưa rõ',
            model: subm.model || 'Chưa rõ',
            year: subm.year || new Date().getFullYear(),
            licensePlate: subm.licensePlate || `TEMP-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            seats: 4,
            type: 'Sedan',
            transmission: 'automatic',
            fuel: 'gasoline',
            color: 'Trắng',
            mileage: 0,
            status: 'available',
            approvedAt: new Date(),
            description: 'Xe cộng tác viên mới đăng ký',
            images: (subm.photos || []).map((p, idx) => ({
              data: p.data,
              contentType: p.contentType,
              isMain: idx === 0
            })),
            pricePerDay: 800000,
            deposit: 10000000,
            commissionPercentage: 15
          });
          await newCar.save();
        } catch (carErr) {
          console.error("Failed to auto-create car for collaborator:", carErr);
        }
      }
    }

    const savedUser = await User.findById(req.params.id).select("-password");
    res.json({ message: "Collaborator request approved", user: savedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject collaborator request
router.put("/collaborators/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body || {};
    let user;
    if (isMssql) {
      user = await userRepo.getUserById(req.params.id);
    } else {
      user = await User.findById(req.params.id);
    }

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.collaboratorRequest || user.collaboratorRequest.status !== "pending") {
      return res.status(400).json({ message: "No pending collaborator request for this user" });
    }

    if (isMssql) {
      const cr = user.collaboratorRequest;
      cr.status = 'rejected';
      cr.reviewedAt = new Date();
      cr.reviewedBy = String(req.user._id);
      cr.reason = reason || "";
      await userRepo.updateUser(req.params.id, { collaboratorRequestJson: JSON.stringify(cr) });
      
      try {
        await notificationRepo.create({ recipient: user.id, recipientType: user.role, title: 'Yêu cầu Cộng tác viên bị từ chối', message: `Rất tiếc! Yêu cầu của bạn đã bị từ chối.${reason ? ' Lý do: ' + reason : ''}`, type: 'system' });
      } catch(e) {}
      
      return res.json({ message: "Collaborator request rejected", user: { id: user.id, collaboratorRequest: cr } });
    }

    // Mongo branch
    user.collaboratorRequest.status = "rejected";
    user.collaboratorRequest.reviewedAt = new Date();
    user.collaboratorRequest.reviewedBy = req.user._id;
    user.collaboratorRequest.reason = reason || "";

    await user.save();

    try {
      const notifyReject = new Notification({
        recipient: user._id,
        recipientType: user.role,
        title: "Yêu cầu Cộng tác viên bị từ chối",
        message: `Rất tiếc! Yêu cầu của bạn đã bị từ chối.${reason ? ' Lý do: ' + reason : ''}`,
        type: "system"
      });
      await notifyReject.save();
    } catch(err) {
      console.error("Lỗi gửi thông báo từ chối CTV:", err);
    }

    res.json({
      message: "Collaborator request rejected",
      user: { id: user._id, collaboratorRequest: user.collaboratorRequest },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== MIGRATION ====================

// Migrate cars to new status system
router.post("/migrate/car-status", async (req, res) => {
  try {
    const cars = await Car.find({});
    console.log(`[Migration] Found ${cars.length} cars to migrate`);

    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const car of cars) {
      try {
        // Skip if already has new fields properly set
        if (car.approvalStatus && car.operationalStatus) {
          skippedCount++;
          continue;
        }

        // Determine new status values based on old status
        let approvalStatus, operationalStatus;
        const oldStatus = car.status || 'pending';

        switch (oldStatus) {
          case 'pending':
            approvalStatus = 'pending';
            operationalStatus = 'inactive';
            break;
          case 'approved':
            approvalStatus = 'approved';
            operationalStatus = 'available';
            break;
          case 'available':
            approvalStatus = 'approved';
            operationalStatus = 'available';
            break;
          case 'rejected':
            approvalStatus = 'rejected';
            operationalStatus = 'inactive';
            break;
          case 'inactive':
            approvalStatus = 'approved';
            operationalStatus = 'inactive';
            break;
          case 'maintenance':
            approvalStatus = 'approved';
            operationalStatus = 'maintenance';
            break;
          case 'repair':
            approvalStatus = 'approved';
            operationalStatus = 'repair';
            break;
          default:
            approvalStatus = 'pending';
            operationalStatus = 'inactive';
        }

        // Update car with new fields
        await Car.findByIdAndUpdate(car._id, {
          approvalStatus,
          operationalStatus
        });

        updatedCount++;
      } catch (error) {
        console.error(`[Migration Error] Car ${car._id}:`, error.message);
        errors.push({ carId: car._id, error: error.message });
      }
    }

    console.log(`[Migration] Complete: ${updatedCount} updated, ${skippedCount} skipped, ${errors.length} errors`);

    res.json({
      message: "Migration completed",
      summary: {
        total: cars.length,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('[Migration Failed]', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
