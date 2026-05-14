const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const User = require("../models/User");
const Contract = require("../models/Contract");
const Address = require("../models/Address");
const auth = require("../middleware/auth");
const contractManager = require("../contracts/contractManager");

const isMssql = process.env.DB_PROVIDER === 'mssql';

const router = express.Router();

// Tạo hợp đồng cho booking
router.post(
  "/generate/:bookingId",
  auth,
  [
    param("bookingId").notEmpty().withMessage("Booking ID required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { bookingId } = req.params;
      let booking;
      if (isMssql) {
        const bookingRepo = require('../repositories/bookingRepo');
        booking = await bookingRepo.getById(bookingId, ['car', 'driver', 'renter', 'owner', 'pickupAddress', 'returnAddress']);
      } else {
        booking = await Booking.findById(bookingId)
          .populate('car')
          .populate('driver', 'fullName phone email avatar dateOfBirth address idCard.number drivingLicense.number licenseClass')
          .populate('renter', 'fullName phone email avatar dateOfBirth address idCard.number drivingLicense.number licenseClass')
          .populate('owner', 'fullName phone email avatar address idCard.number businessName');
      }

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Check if user owns this booking or is admin
      const renterIdStr = typeof booking.renter === 'object' ? booking.renter._id.toString() : booking.renter.toString();
      if (renterIdStr !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Get owner info
      let owner;
      if (booking.car) {
        if (isMssql) {
          const userRepo = require('../repositories/userRepo');
          const ownerId = booking.car?.owner || booking.owner?._id || booking.owner;
          owner = await userRepo.getById(ownerId);
        } else {
          owner = await User.findById(booking.car.owner).select('fullName phone email address idCard.number businessName');
        }
      } else if (booking.driver) {
        owner = booking.driver; // For driver-only bookings
      }

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner information not found",
        });
      }

      // Prepare contract data based on rental type
      let contractData = {
        renter: booking.renter,
        owner: owner,
        booking: booking,
        startDate: booking.startDate,
        endDate: booking.endDate,
      };

      let result;
      const routeMap = {
        'self_drive': 'SelfDriveContract',
        'with_driver': 'WithDriverContract',
        'driver_only': 'TripDriverContract',
        'trip': 'TripDriverContract'
      };
      const routeName = routeMap[booking.rentalType] || 'SelfDriveContract';

      switch (booking.rentalType) {
        case 'self_drive':
          contractData.car = booking.car;
          result = await contractManager.generateSelfDriveContract(contractData);
          break;
        case 'with_driver':
          contractData.car = booking.car;
          contractData.driver = booking.driver;
          result = await contractManager.generateWithDriverContract(contractData);
          break;
        case 'driver_only':
        case 'trip':
          contractData.driver = booking.driver;
          contractData.startLocation = booking.trip?.startLocation || booking.pickupLocation;
          contractData.endLocation = booking.trip?.endLocation || booking.returnLocation;
          contractData.distance = booking.trip?.distance || booking.distance || 0;
          contractData.price = booking.pricing?.totalAmount || booking.trip?.totalTripPrice || 0;
          result = await contractManager.generateTripDriverContract(contractData);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid rental type",
          });
      }

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate contract",
          error: result.error,
        });
      }

      // Create Contract document in database
      const dbContractData = {
        booking: booking._id,
        renter: booking.renter._id || booking.renter,
        owner: owner._id || owner,
        car: booking.car?._id || booking.car,
        driver: booking.driver?._id || booking.driver,
        contractId: result.contractId,
        content: result.content,
        fileName: result.fileName,
        status: "pending",
      };

      if (isMssql) {
        const contractRepo = require('../repositories/contractRepo');
        await contractRepo.create(dbContractData);
        
        const bookingRepo = require('../repositories/bookingRepo');
        const docs = booking.documents || {};
        docs.contract = { url: result.fileName, signedAt: null };
        await bookingRepo.updateBooking(booking._id, {
          contractId: result.contractId,
          contractFile: result.fileName,
          documentsJson: JSON.stringify(docs)
        });
      } else {
        const contract = new Contract(dbContractData);
        await contract.save();

        // Update booking with contract info
        booking.contractId = result.contractId;
        booking.contractFile = result.fileName;
        // Also update the documents object for backward compatibility or future use
        if (!booking.documents) booking.documents = {};
        booking.documents.contract = {
          url: result.fileName,
          signedAt: null
        };
        await booking.save();
      }

      res.json({
        success: true,
        message: "Contract generated successfully",
        contract: {
          id: result.contractId,
          contractId: result.contractId,
          fileName: result.fileName,
          content: result.content,
        },
      });
    } catch (error) {
      console.error("Error generating contract:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

// Lấy nội dung hợp đồng
router.get("/:fileName", auth, async (req, res) => {
  try {
    const { fileName } = req.params;
    const content = contractManager.getContractContent(fileName);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
  } catch (error) {
    console.error("Error retrieving contract:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Lấy danh sách hợp đồng (admin only)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const contracts = contractManager.getContractList();

    res.json({
      success: true,
      contracts: contracts,
    });
  } catch (error) {
    console.error("Error retrieving contracts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Xóa hợp đồng (admin only)
router.delete("/:fileName", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { fileName } = req.params;
    const deleted = contractManager.deleteContract(fileName);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    res.json({
      success: true,
      message: "Contract deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contract:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get contract by booking ID
router.get("/booking/:bookingId", auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    let booking;
    let contract;
    
    if (isMssql) {
      const bookingRepo = require('../repositories/bookingRepo');
      const contractRepo = require('../repositories/contractRepo');
      
      booking = await bookingRepo.getById(bookingId, ['car', 'driver', 'renter', 'owner', 'pickupAddress', 'returnAddress']);
      contract = await contractRepo.getByBookingId(bookingId, ['renter', 'owner', 'car', 'driver', 'booking']);
    } else {
      booking = await Booking.findById(bookingId)
        .populate('car')
        .populate('driver', 'fullName phone email avatar dateOfBirth address idCard.number drivingLicense.number licenseClass')
        .populate('renter', 'fullName phone email avatar dateOfBirth address idCard.number drivingLicense.number licenseClass')
        .populate('owner', 'fullName phone email avatar address idCard.number businessName')
        .populate('pickupAddress')
        .populate('returnAddress');
      
      contract = await Contract.findOne({ booking: bookingId })
        .populate('renter', 'fullName email phone dateOfBirth address idCard.number')
        .populate('owner', 'fullName email phone address idCard.number businessName')
        .populate('car')
        .populate('driver', 'fullName email phone driverLicense licenseClass idCard.number')
        .populate('booking');
    }
    
    if (!contract) {
      // If contract doc doesn't exist, we can still return a preview-like object
      // derived from the booking if the user is authorized to generate it
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      
      return res.status(404).json({ 
        success: false, 
        message: "Contract not found",
        booking: booking
      });
    }

    res.json(contract);
  } catch (error) {
    console.error("Error fetching contract by booking:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Sign contract
router.post("/sign/:bookingId", auth, async (req, res) => {
  try {
    const { signature, signedAt } = req.body;
    const userId = req.user._id || req.user.id;

    let booking;
    let ownerId = null;
    let isRenter = false;
    let isOwner = false;

    if (isMssql) {
      const bookingRepo = require('../repositories/bookingRepo');
      booking = await bookingRepo.getById(req.params.bookingId);
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

      isRenter = String(booking.renter) === String(userId);
      isOwner = String(booking.owner) === String(userId);
      console.log('[SIGN] UserID:', userId);
      console.log('[SIGN] Booking RenterID:', booking.renter);
      console.log('[SIGN] Booking OwnerID:', booking.owner);
      console.log('[SIGN] isRenter:', isRenter, 'isOwner:', isOwner);

      if (!isRenter && !isOwner) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      const updateField = isRenter ? "renterSignature" : "ownerSignature";
      const contractRepo = require('../repositories/contractRepo');
      const existingContract = await contractRepo.getByBookingId(req.params.bookingId);

      const sigData = {
        signed: true,
        signature,
        signedAt: new Date(signedAt),
      };

      if (existingContract) {
        await contractRepo.updateContract(req.params.bookingId, { [updateField]: sigData });
      } else {
        await contractRepo.create({
          booking: req.params.bookingId,
          renter: booking.renter,
          owner: booking.owner,
          [updateField]: sigData,
          status: "pending"
        });
      }

    } else {
      booking = await Booking.findById(req.params.bookingId)
        .populate("renter", "_id")
        .populate("car", "owner");

      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      // Get owner from car or booking
      if (booking.car && booking.car._id) {
         const carObj = await Car.findById(booking.car._id);
         ownerId = carObj ? carObj.owner.toString() : null;
      } else {
         ownerId = booking.owner ? booking.owner.toString() : null;
      }

      // Check if user is renter or owner
      isRenter = booking.renter._id.toString() === userId.toString();
      isOwner = ownerId === userId.toString();

      if (!isRenter && !isOwner) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }

      // Update contract signature
      const updateField = isRenter ? "renterSignature" : "ownerSignature";
      const existingContract = await Contract.findOne({ booking: req.params.bookingId });

      if (existingContract) {
        existingContract[updateField] = {
          signed: true,
          signature,
          signedAt: new Date(signedAt),
        };
        await existingContract.save();
      } else {
        // Create new contract with signature
        const newContract = new Contract({
          booking: req.params.bookingId,
          renter: booking.renter._id,
          owner: ownerId,
          [updateField]: {
            signed: true,
            signature,
            signedAt: new Date(signedAt),
          },
          status: "pending",
        });
        await newContract.save();
      }
    }

    res.json({ success: true, message: "Contract signed successfully" });
  } catch (error) {
    console.error("Error signing contract:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;