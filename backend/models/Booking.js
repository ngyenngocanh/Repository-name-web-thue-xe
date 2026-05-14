const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: function() { return this.rentalType !== 'driver_only'; }
  },
  // Phụ phí giao xe/tài xế ngoại tỉnh
  extraFee: {
    type: Number,
    default: 0
  },
  // Thông tin chuyến cho dịch vụ thuê tài xế theo chuyến
  trip: {
    startLocation: String,
    endLocation: String,
    distance: Number, // km
    pricePerKm: Number,
    totalTripPrice: Number
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  mode: {
    type: String,
    enum: ['daily', 'hourly'],
    default: 'daily'
  },
  rentalType: {
    type: String,
    enum: ['self_drive', 'with_driver', 'driver_only', 'trip'],
    default: 'self_drive'
  },
  contractId: {
    type: String
  },
  contractFile: {
    type: String
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The user who created the booking (might be different from renter if renterType is 'other')
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    default: null
  },
  pickupTime: {
    type: String,
    required: [true, 'Pickup time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
  },
  returnTime: {
    type: String,
    required: [true, 'Return time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
  },
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required']
  },
  returnLocation: {
    type: String,
    required: [true, 'Return location is required']
  },
  // References to Address collection
  pickupAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  returnAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  duration: {
    days: {
      type: Number,
      required: true
    },
    hours: {
      type: Number,
      default: 0
    }
  },
  pricing: {
    dailyRate: {
      type: Number,
      required: false
    },
    halfMonthRate: {
      type: Number,
      required: false
    },
    monthRate: {
      type: Number,
      required: false
    },
    totalRentalFee: {
      type: Number,
      required: true
    },
    deposit: {
      type: Number,
      required: false,
      default: 0
    },
    serviceFee: {
      type: Number,
      required: false,
      default: 0
    },
    driverFee: {
      type: Number,
      default: 0
    },
    insuranceFee: {
      type: Number,
      default: 0
    },
    commission: {
      type: Number,
      default: 0
    },
    ctvCommission: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    // Trip-specific fields for detailed breakdown
    distance: Number,
    pricePerKm: Number,
    multiplier: Number,
    distanceFee: Number,
    driverTripFee: Number,
    extraFee: Number,
    tripType: String,
    // Delivery fee fields - calculated based on actual distance
    deliveryDistance: {
      type: Number,
      default: 0,
      description: 'Khoảng cách giao xe (km)'
    },
    deliveryFee: {
      type: Number,
      default: 0,
      description: 'Phí giao xe = deliveryDistance × 1000 VND/km'
    },
    deliveryRatePerKm: {
      type: Number,
      default: 1000,
      description: 'Đơn giá phí giao xe mỗi km'
    }
  },
  reviews: {
    renterReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    ownerReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    carReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  },
  settlement: {
    status: {
      type: String,
      enum: ['pending', 'settled', 'cancelled'],
      default: 'pending'
    },
    settledAt: Date,
    transactionId: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'wallet', 'vnpay', 'cash', 'zalopay', 'payos'],
      required: true
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date
  },
  // Tài liệu liên quan đến booking, bao gồm hợp đồng điện tử cho từng dịch vụ
  documents: {
    // Hợp đồng điện tử: url là đường dẫn file hợp đồng, signedAt là thời gian ký
    contract: {
      url: String,
      signedAt: Date
    },
    inspection: {
      pickup: {
        photos: [String],
        notes: String,
        mileage: Number,
        fuelLevel: Number,
        signedBy: String,
        signedAt: Date
      },
      return: {
        photos: [String],
        notes: String,
        mileage: Number,
        fuelLevel: Number,
        signedBy: String,
        signedAt: Date
      }
    }
  },
  reviews: {
    // This is handled by the fields near line 151
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundAmount: Number
  },
  longTermAgreements: {
    driverGuarantees: {
      type: Boolean,
      default: false
    },
    carPreservation: {
      type: Boolean,
      default: false
    }
  },
  renterType: {
    type: String,
    enum: ['self', 'other'],
    default: 'self'
  },
  // Passenger/Driver details for the actual occupant
  contactInfo: {
    name: String,
    phone: String,
    email: String,
    idCard: String,
    licenseNumber: String, // for self-drive
    licenseClass: String   // for self-drive
  },
  passengerCount: {
    type: Number,
    default: 1
  },
  driverPreference: String,
  options: {
    fullInsurance: { type: Boolean, default: false },
    gpsRequired: { type: Boolean, default: false },
    babyCarSeat: { type: Boolean, default: false },
    fuelFull: { type: Boolean, default: false }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Đặt trước xe (Pre-booking/Reservation)
  bookingType: {
    type: String,
    enum: ['immediate', 'prebook'],
    default: 'immediate',
    description: 'Loại đặt xe: immediate (đặt ngay) hoặc prebook (đặt trước giữ chỗ)'
  },
  prebook: {
    // Thời hạn giữ chỗ (deadline để thanh toán cọc đầy đủ)
    deadline: {
      type: Date,
      description: 'Hạn chót để thanh toán cọc và xác nhận đặt xe'
    },
    // Trạng thái đặt trước
    status: {
      type: String,
      enum: ['holding', 'converted', 'expired', 'cancelled'],
      default: 'holding',
      description: 'holding: đang giữ chỗ, converted: đã chuyển thành booking xác nhận, expired: hết hạn, cancelled: đã hủy'
    },
    // Số tiền đặt cọc giữ chỗ (thấp hơn cọc đầy đủ)
    holdDeposit: {
      type: Number,
      default: 0,
      description: 'Số tiền cọc giữ chỗ (ví dụ: 100,000đ hoặc 10% tổng tiền)'
    },
    // Thời gian chuyển đổi sang booking chính thức
    convertedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Index for queries
bookingSchema.index({ car: 1, status: 1 });
bookingSchema.index({ renter: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

// Validation to ensure end date is after start date (skip for hourly)
bookingSchema.pre('validate', function(next) {
  // For hourly mode, set endDate to startDate to pass validation
  if (this.mode === 'hourly' && !this.endDate) {
    this.endDate = this.startDate;
  }
  next();
});

bookingSchema.pre('save', function(next) {
  // Skip validation for hourly mode
  if (this.mode === 'hourly') {
    this.duration.days = 0;
    return next();
  }
  
  if (this.endDate < this.startDate) {
    return next(new Error('End date must be at or after start date'));
  }
  
  // Calculate duration
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  this.duration.days = diffDays;
  
  next();
});

// Static method to check car availability (includes confirmed, active, and prebook holding)
bookingSchema.statics.isCarAvailable = async function(carId, startDate, endDate, excludeBookingId = null) {
  const query = {
    car: carId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      {
        startDate: { $lte: new Date(startDate) },
        endDate: { $gte: new Date(startDate) }
      },
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(endDate) }
      },
      {
        startDate: { $gte: new Date(startDate) },
        endDate: { $lte: new Date(endDate) }
      }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const conflictingBookings = await this.find(query);
  
  // Also check for active pre-bookings (not expired, not cancelled, not converted)
  const prebookQuery = {
    car: carId,
    bookingType: 'prebook',
    status: 'pending',
    'prebook.status': 'holding',
    'prebook.deadline': { $gt: new Date() },
    $or: [
      {
        startDate: { $lte: new Date(startDate) },
        endDate: { $gte: new Date(startDate) }
      },
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(endDate) }
      },
      {
        startDate: { $gte: new Date(startDate) },
        endDate: { $lte: new Date(endDate) }
      }
    ]
  };
  
  if (excludeBookingId) {
    prebookQuery._id = { $ne: excludeBookingId };
  }
  
  const conflictingPrebooks = await this.find(prebookQuery);
  
  return conflictingBookings.length === 0 && conflictingPrebooks.length === 0;
};

module.exports = mongoose.model('Booking', bookingSchema);
