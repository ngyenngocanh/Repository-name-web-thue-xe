const express = require("express");
const { body, validationResult, query } = require("express-validator");
const Car = require("../models/Car");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const carRepo = require("../repositories/carRepo");

const router = express.Router();
const isMssql = (process.env.DB_PROVIDER || "mongo").toLowerCase() === "mssql";

// Configure multer for file uploads - use memory storage to store in buffer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Get all cars with filters and pagination
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("city").optional().trim(),
    query("brand").optional().trim(),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("seats").optional(),
    query("transmission").optional(),
    query("fuel").optional(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      if (isMssql) {
        // SQL mode: read from carRepo so list matches booking/admin data source
        const filter = {
          status: "approved",
          operationalStatus: "available",
        };

        if (req.query.city) filter.city = String(req.query.city);
        if (req.query.brand) filter.brand = String(req.query.brand);
        if (req.query.minPrice) filter.minPrice = String(req.query.minPrice);
        if (req.query.maxPrice) filter.maxPrice = String(req.query.maxPrice);

        // Support multi-select params (comma-separated)
        if (req.query.seats) {
          const seats = String(req.query.seats).split(",")[0]?.trim();
          if (seats) filter.seats = seats;
        }
        if (req.query.transmission) {
          const transmission = String(req.query.transmission).split(",")[0]?.trim();
          if (transmission) filter.transmission = transmission;
        }
        if (req.query.fuel) {
          const fuel = String(req.query.fuel).split(",")[0]?.trim();
          if (fuel) filter.fuel = fuel;
        }

        // NOTE: date availability filter for SQL is handled at booking-time via bookingRepo.checkAvailability.
        // Listing can still show cars; booking step will block if car is busy.
        const [cars, total] = await Promise.all([
          carRepo.getAll({ filter, skip, limit, sort: "createdAt DESC", populate: ["owner", "address"] }),
          carRepo.countDocuments(filter),
        ]);

        return res.json({
          cars,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        });
      }

      // Mongo mode: Build filter - Lấy xe đã được phê duyệt (hỗ trợ cả dữ liệu cũ và mới)
      const filter = {
        $or: [{ approvalStatus: "approved" }, { status: "approved" }],
        "availability.isAvailable": true,
      };

      if (req.query.city) {
        filter["location.city"] = new RegExp(req.query.city, "i");
      }

      if (req.query.brand) {
        filter.brand = new RegExp(req.query.brand, "i");
      }

      // Lọc theo giá thuê ngày hoặc nửa tháng nếu có tham số
      if (req.query.priceType === "halfMonth") {
        filter.pricePerHalfMonth = {};
        if (req.query.minPrice)
          filter.pricePerHalfMonth.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice)
          filter.pricePerHalfMonth.$lte = parseFloat(req.query.maxPrice);
      } else {
        if (req.query.minPrice || req.query.maxPrice) {
          filter.pricePerDay = {};
          if (req.query.minPrice)
            filter.pricePerDay.$gte = parseFloat(req.query.minPrice);
          if (req.query.maxPrice)
            filter.pricePerDay.$lte = parseFloat(req.query.maxPrice);
        }
      }

      if (req.query.seats) {
        // take the first one if comma-separated (frontend sends multi-select)
        filter.seats = parseInt(String(req.query.seats).split(",")[0], 10);
      }

      if (req.query.transmission) {
        filter.transmission = String(req.query.transmission).split(",")[0];
      }

      if (req.query.fuel) {
        filter.fuel = String(req.query.fuel).split(",")[0];
      }

      // Date availability filter
      if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);

        filter["availability.unavailableDates"] = {
          $not: {
            $elemMatch: {
              $or: [
                {
                  startDate: { $lte: startDate },
                  endDate: { $gte: startDate },
                },
                {
                  startDate: { $lte: endDate },
                  endDate: { $gte: endDate },
                },
                {
                  startDate: { $gte: startDate },
                  endDate: { $lte: endDate },
                },
              ],
            },
          },
        };
      }

      const cars = await Car.find(filter)
        .populate("owner", "fullName avatar rating isVerified")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Car.countDocuments(filter);

      res.json({
        cars,
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
  },
);

// Get car details for management (always check ownership)
router.get("/:id/manage", auth, async (req, res) => {
  try {
    if (isMssql) {
      const car = await carRepo.getById(req.params.id, ["owner", "address"]);
      if (!car) return res.status(404).json({ message: "Car not found" });
      // Ownership check in SQL mode
      const ownerId = (car.owner && typeof car.owner === "object") ? (car.owner._id || car.owner.id) : car.owner;
      const isOwner = ownerId && ownerId.toString() === req.userId;
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "You can only manage your own cars" });
      }
      return res.json({ car });
    }

    const car = await Car.findById(req.params.id)
      .populate("owner", "fullName avatar rating isVerified phone driverInfo")
      .populate("addressId");

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Always check ownership for management
    const isOwner = car.owner._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    console.log('Car management access check:', {
      carId: req.params.id,
      carStatus: car.status,
      carOwner: car.owner._id.toString(),
      currentUser: req.user.id,
      currentUserRole: req.user.role,
      isOwner,
      isAdmin
    });
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only manage your own cars' });
    }

    res.json({ car });
  } catch (error) {
    console.error('Error fetching car for management:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get car by ID (public endpoint for browsing)
router.get("/:id", async (req, res) => {
  try {
    if (isMssql) {
      const car = await carRepo.getById(req.params.id, ["owner", "address"]);
      if (!car) return res.status(404).json({ message: "Car not found" });
      // Ensure approved/available in public
      const isApproved = car.approvalStatus === "approved" || car.status === "approved";
      if (!isApproved) return res.status(403).json({ message: "Car not available" });
      return res.json({ car });
    }

    const car = await Car.findById(req.params.id)
      .populate("owner", "fullName avatar rating isVerified phone driverInfo")
      .populate("addressId");

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Optional authentication check
    const jwt = require("jsonwebtoken");
    const token = req.headers.authorization?.split(" ")[1];
    let currentUser = null;
    if (token) {
      try {
        currentUser = jwt.verify(token, process.env.JWT_SECRET);
      } catch (e) {}
    }

    // Check ownership and permissions
    const isOwner = currentUser && car.owner._id.toString() === currentUser.userId;
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    console.log('Car access check:', {
      carId: req.params.id,
      carStatus: car.status,
      carOwner: car.owner._id.toString(),
      currentUser: currentUser?.userId,
      currentUserRole: currentUser?.role,
      isOwner,
      isAdmin
    });
    
    // If car is not approved, only owner and admin can view
    // Support both old (status='approved') and new (approvalStatus='approved') schema
    const isApproved = car.approvalStatus === 'approved' || car.status === 'approved';
    if (!isApproved) {
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Car not available' });
      }
    }
    
    // For approved cars, everyone can view (for car browsing)
    // But for management purposes, we'll check ownership in frontend

    res.json({ car });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new car listing
router.post(
  "/",
  auth,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "registration", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
  ]),
  [
    body("brand").trim().notEmpty().withMessage("Brand is required"),
    body("model").trim().notEmpty().withMessage("Model is required"),
    body("year").isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body("licensePlate")
      .trim()
      .notEmpty()
      .withMessage("License plate is required"),
    body("color").trim().notEmpty().withMessage("Color is required"),
    body("seats").isInt({ min: 2, max: 9 }),
    body("transmission").isIn(["manual", "automatic"]),
    body("fuel").optional().isIn(["gasoline", "diesel", "electric", "hybrid"]),
    body("fuelType")
      .optional()
      .isIn(["gasoline", "diesel", "electric", "hybrid"]),
    body("pricePerDay").optional().isFloat({ min: 0 }),
    body("deposit").optional().isFloat({ min: 0 }),
    body("mileage").isFloat({ min: 0 }),
    body("location.address")
      .if(body("addressId").not().exists())
      .notEmpty()
      .withMessage("Address is required"),
    body("location.city")
      .if(body("addressId").not().exists())
      .notEmpty()
      .withMessage("City is required"),
    body("location.district")
      .if(body("addressId").not().exists())
      .notEmpty()
      .withMessage("District is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Only owner, collaborator, driver, or admin can add car
      if (!["owner", "collaborator", "driver", "admin"].includes(req.user.role)) {
        return res.status(403).json({ message: "Bạn không có quyền đăng xe" });
      }
      const carData = {
        ...req.body,
        owner: req.userId,
        status: "pending",
      };

      // Handle images - store as binary in MongoDB
      if (req.files && req.files.images && req.files.images.length > 0) {
        carData.images = req.files.images.map((file, index) => ({
          data: file.buffer,
          contentType: file.mimetype,
          filename: file.originalname,
          isMain: index === 0,
        }));
      } else if (req.body.images && Array.isArray(req.body.images)) {
        // Handle base64 images from frontend
        carData.images = req.body.images.map((img, index) => {
          if (typeof img === 'string' && img.startsWith('data:')) {
            const parts = img.split(',');
            const mimeType = parts[0].match(/:(.*?);/)[1];
            const buffer = Buffer.from(parts[1], 'base64');
            return {
              data: buffer,
              contentType: mimeType,
              filename: `image_${index + 1}`,
              isMain: index === 0,
            };
          }
          return img; // fallback for existing format
        });
      }

      // Handle documents - store as binary in MongoDB
      if (req.files && (req.files.registration || req.files.insurance)) {
        carData.documents = {};
        if (req.files.registration && req.files.registration[0]) {
          carData.documents.registration = {
            data: req.files.registration[0].buffer,
            contentType: req.files.registration[0].mimetype,
            filename: req.files.registration[0].originalname,
          };
        }
        if (req.files.insurance && req.files.insurance[0]) {
          carData.documents.insurance = {
            data: req.files.insurance[0].buffer,
            contentType: req.files.insurance[0].mimetype,
            filename: req.files.insurance[0].originalname,
          };
        }
      } else if (req.body.documents) {
        // Handle base64 documents from frontend
        carData.documents = {};
        if (req.body.documents.registration && typeof req.body.documents.registration === 'string') {
          const parts = req.body.documents.registration.split(',');
          const mimeType = parts[0].match(/:(.*?);/)[1];
          const buffer = Buffer.from(parts[1], 'base64');
          carData.documents.registration = {
            data: buffer,
            contentType: mimeType,
            filename: 'registration.jpg',
          };
        }
        if (req.body.documents.insurance && typeof req.body.documents.insurance === 'string') {
          const parts = req.body.documents.insurance.split(',');
          const mimeType = parts[0].match(/:(.*?);/)[1];
          const buffer = Buffer.from(parts[1], 'base64');
          carData.documents.insurance = {
            data: buffer,
            contentType: mimeType,
            filename: 'insurance.jpg',
          };
        }
      }

      // Handle fuelType vs fuel
      if (req.body.fuelType && !req.body.fuel) {
        carData.fuel = req.body.fuelType;
      }

      // Attempt to auto-populate location from addressId if it's missing in req.body
      if (
        req.body.addressId &&
        (!req.body.location || !req.body.location.address)
      ) {
        const Address = require("../models/Address");
        const addressDoc = await Address.findById(req.body.addressId);
        if (addressDoc) {
          carData.location = {
            address: addressDoc.street || addressDoc.fullAddress,
            city: addressDoc.province?.name || "",
            district: addressDoc.ward?.name || "",
          };
        }
      }

      // Parse nested fields
      if (req.body.features) {
        if (typeof req.body.features === "string") {
          try {
            carData.features = JSON.parse(req.body.features);
          } catch (e) {
            carData.features = [req.body.features];
          }
        } else if (Array.isArray(req.body.features)) {
          carData.features = req.body.features;
        }
      }

      if (req.body.pricePerWeek) {
        carData.pricePerWeek = parseFloat(req.body.pricePerWeek);
      }
      if (req.body.pricePerHalfMonth) {
        carData.pricePerHalfMonth = parseFloat(req.body.pricePerHalfMonth);
      }
      if (req.body.pricePerMonth) {
        carData.pricePerMonth = parseFloat(req.body.pricePerMonth);
      }

      if (isMssql) {
        // SQL mode: use carRepo
        const car = await carRepo.createCar(carData);
        return res.status(201).json({
          message: "Car listing created successfully",
          car,
        });
      }

      const car = new Car(carData);
      await car.save();

      await car.populate("owner", "fullName avatar rating isVerified");

      res.status(201).json({
        message: "Car listing created successfully",
        car,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Update car listing
router.put(
  "/:id",
  auth,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "registration", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (isMssql) {
      const car = await carRepo.getById(req.params.id);
      if (!car) return res.status(404).json({ message: "Car not found" });

      const ownerId = (car.owner && typeof car.owner === 'object') ? (car.owner.id || car.owner._id) : car.owner;
      if (ownerId.toString() !== req.userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this car" });
      }

      const updates = {};
      const allowedUpdates = ["brand", "model", "year", "color", "seats", "transmission", "fuel", "pricePerDay", "pricePerHour", "pricePerWeek", "pricePerHalfMonth", "pricePerMonth", "priceWeekend", "isSelfDrive", "isWithDriver", "pricePerDayWithDriver", "pricePerHourWithDriver", "driverFeePerDay", "deposit", "mileage", "description", "features", "location", "availability"];
      
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          if (key === "features" && typeof req.body[key] === "string") {
            try { updates[key] = JSON.parse(req.body[key]); } catch (e) { updates[key] = [req.body[key]]; }
          } else {
            updates[key] = req.body[key];
          }
        }
      });

      // Handle images
      if (req.files && req.files.images && req.files.images.length > 0) {
        // In SQL mode we store as binary if needed, but here let's assume same logic as create
        const newImages = req.files.images.map((file, index) => ({
          data: file.buffer,
          contentType: file.mimetype,
          filename: file.originalname,
          isMain: false,
        }));
        updates.images = [...(car.images || []), ...newImages];
      } else if (req.body.images && Array.isArray(req.body.images)) {
        updates.images = req.body.images;
      }

      const updatedCar = await carRepo.updateCar(req.params.id, updates);
      return res.json({ message: "Car updated successfully", car: updatedCar });
    }

    const car = await Car.findById(req.params.id);

      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }

      if (car.owner.toString() !== req.userId && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Not authorized to update this car" });
      }

      const allowedUpdates = [
        "brand",
        "model",
        "year",
        "color",
        "seats",
        "transmission",
        "fuel",
        "pricePerDay",
        "pricePerHour",
        "pricePerWeek",
        "pricePerHalfMonth",
        "pricePerMonth",
        "priceWeekend",
        "isSelfDrive",
        "isWithDriver",
        "pricePerDayWithDriver",
        "pricePerHourWithDriver",
        "driverFeePerDay",
        "deposit",
        "mileage",
        "description",
        "features",
        "location",
        "availability",
      ];

      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          if (key === "features" && typeof req.body[key] === "string") {
            try {
              updates[key] = JSON.parse(req.body[key]);
            } catch (e) {
              updates[key] = [req.body[key]];
            }
          } else {
            updates[key] = req.body[key];
          }
        }
      });

      // Handle images correctly in updates
      if (req.files && req.files.images && req.files.images.length > 0) {
        const newImages = req.files.images.map((file) => ({
          url: `/uploads/${file.filename}`,
          isMain: false,
        }));
        updates.images = [...(car.images || []), ...newImages];
      } else if (req.body.images && Array.isArray(req.body.images)) {
        updates.images = req.body.images;
      }

      // Handle documents correctly in updates
      if (req.files && (req.files.registration || req.files.insurance)) {
        if (req.files.registration) {
          updates["documents.registration.url"] =
            `/uploads/${req.files.registration[0].filename}`;
        }
        if (req.files.insurance) {
          updates["documents.insurance.url"] =
            `/uploads/${req.files.insurance[0].filename}`;
        }
      } else if (req.body.documents) {
        updates.documents = req.body.documents;
      }

      const updatedCar = await Car.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true },
      ).populate("owner", "fullName avatar rating isVerified");

      res.json({
        message: "Car updated successfully",
        car: updatedCar,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Delete car listing
router.delete("/:id", auth, async (req, res) => {
  try {
    if (isMssql) {
      const car = await carRepo.getById(req.params.id);
      if (!car) return res.status(404).json({ message: "Car not found" });

      const ownerId = (car.owner && typeof car.owner === 'object') ? (car.owner.id || car.owner._id) : car.owner;
      if (ownerId.toString() !== req.userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this car" });
      }

      await carRepo.deleteCar(req.params.id);
      return res.json({ message: "Car deleted successfully" });
    }

    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (car.owner.toString() !== req.userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this car" });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's cars
router.get("/my/listings", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (isMssql) {
      const [cars, total] = await Promise.all([
        carRepo.getAll({ filter: { ownerId: req.userId }, skip, limit, sort: "createdAt DESC" }),
        carRepo.countDocuments({ ownerId: req.userId }),
      ]);

      return res.json({
        cars,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    const cars = await Car.find({ owner: req.userId })
      .select('brand model year licensePlate color images status approvalStatus operationalStatus rating totalTrips mileage pricePerDay location createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Car.countDocuments({ owner: req.userId });

    res.json({
      cars,
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

// Get car availability
router.get("/:id/availability", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    if (isMssql) {
      const bookingRepo = require('../repositories/bookingRepo');
      const availability = await bookingRepo.checkAvailability(req.params.id, startDate, endDate);
      return res.json({
        carId: req.params.id,
        isAvailable: availability.available,
        unavailableDates: [] // SQL doesn't store fixed unavailable dates easily yet
      });
    }

    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const isAvailable = car.isAvailableForDates(startDate, endDate);

    res.json({
      carId: car._id,
      isAvailable,
      unavailableDates: car.availability.unavailableDates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Serve image from binary data
router.get("/:id/images/:imageIndex", async (req, res) => {
  try {
    let car;
    if (isMssql) {
      car = await carRepo.getById(req.params.id);
    } else {
      car = await Car.findById(req.params.id);
    }

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    const images = car.images || [];
    
    if (imageIndex >= images.length || imageIndex < 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const image = images[imageIndex];
    if (!image || !image.data) {
      return res.status(404).json({ message: "Image data not found" });
    }

    // Convert Buffer to proper format if needed
    let buffer;
    if (Buffer.isBuffer(image.data)) {
      buffer = image.data;
    } else if (image.data.type === 'Buffer' && Array.isArray(image.data.data)) {
      buffer = Buffer.from(image.data.data);
    } else {
      buffer = Buffer.from(image.data);
    }

    res.set({
      'Content-Type': image.contentType || 'image/jpeg',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    });

    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Serve document from binary data
router.get("/:id/documents/:docType", async (req, res) => {
  try {
    let car;
    if (isMssql) {
      car = await carRepo.getById(req.params.id);
    } else {
      car = await Car.findById(req.params.id);
    }

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const docType = req.params.docType; // 'registration' or 'insurance'
    const documents = car.documents || {};
    const document = documents[docType];

    if (!document || !document.data) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Convert Buffer to proper format if needed
    let buffer;
    if (Buffer.isBuffer(document.data)) {
      buffer = document.data;
    } else if (document.data.type === 'Buffer' && Array.isArray(document.data.data)) {
      buffer = Buffer.from(document.data.data);
    } else {
      buffer = Buffer.from(document.data);
    }

    res.set({
      'Content-Type': document.contentType || 'image/jpeg',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    });

    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update car status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['approved', 'available', 'maintenance', 'repair', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    let car;
    if (isMssql) {
      car = await carRepo.getById(req.params.id);
    } else {
      car = await Car.findById(req.params.id);
    }

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const ownerId = (car.owner && typeof car.owner === 'object') ? (car.owner.id || car.owner._id) : car.owner;
    if (ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this car" });
    }

    if (isMssql) {
      car = await carRepo.updateCar(req.params.id, { status });
    } else {
      car.status = status;
      await car.save();
    }

    res.json({
      message: "Car status updated successfully",
      car: {
        _id: car.id || car._id,
        status: car.status
      }
    });
  } catch (error) {
    console.error('Error updating car status:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update car operational status
router.put("/:id/operational-status", auth, async (req, res) => {
  try {
    const { operationalStatus } = req.body;
    
    // Validate operationalStatus
    const validStatuses = ['available', 'rented', 'maintenance', 'repair', 'inactive'];
    if (!validStatuses.includes(operationalStatus)) {
      return res.status(400).json({ message: "Invalid operational status" });
    }

    let car;
    if (isMssql) {
      car = await carRepo.getById(req.params.id);
    } else {
      car = await Car.findById(req.params.id);
    }

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const ownerId = (car.owner && typeof car.owner === 'object') ? (car.owner.id || car.owner._id) : car.owner;
    if (ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this car" });
    }

    if (isMssql) {
      car = await carRepo.updateCar(req.params.id, { operationalStatus });
    } else {
      car.operationalStatus = operationalStatus;
      await car.save();
    }

    res.json({
      message: "Car operational status updated successfully",
      car: {
        _id: car.id || car._id,
        operationalStatus: car.operationalStatus
      }
    });
  } catch (error) {
    console.error('Error updating car operational status:', error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
