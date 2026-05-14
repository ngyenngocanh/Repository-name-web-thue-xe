const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  // Chủ sở hữu xe: có thể là user role 'owner' hoặc 'collaborator' (CTV)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: [true, 'Car brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [2, 'Minimum 2 seats'],
    max: [9, 'Maximum 9 seats']
  },
  type: {
    type: String,
    required: [true, 'Car type is required'],
    trim: true
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: [true, 'Transmission type is required']
  },
  fuel: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
    required: [true, 'Fuel type is required']
  },
  pricePerDay: {
    type: Number,
    min: [0, 'Price must be positive'],
    default: 0
  },
  pricePerHour: {
    type: Number,
    min: [0, 'Price must be positive'],
    default: 0
  },
  isSelfDrive: {
    type: Boolean,
    default: true
  },
  isWithDriver: {
    type: Boolean,
    default: false
  },
  isTripSupport: {
    type: Boolean,
    default: false
  },
  pricePerDayWithDriver: {
    type: Number,
    min: [0, 'Price must be positive'],
    default: 0
  },
  pricePerHourWithDriver: {
    type: Number,
    min: [0, 'Price must be positive'],
    default: 0
  },
  driverFeePerDay: {
    type: Number,
    default: 0
  },
  pricePerWeek: {
    type: Number,
    min: [0, 'Price must be positive']
  },
  pricePerHalfMonth: {
    type: Number,
    min: [0, 'Price must be positive'],
    default: 0
  },
  pricePerMonth: {
    type: Number,
    min: [0, 'Price must be positive'],
    default: 0
  },
  priceWeekend: {
    type: Number,
    min: [0, 'Price must be positive'],
    default: 0
  },
  deposit: {
    type: Number,
    min: [0, 'Price must be positive'],
    default: 0
  },
  outOfProvinceFee: {
    type: Number,
    default: 0
  },
  inProvinceFee: {
    type: Number,
    default: 0
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [0, 'Mileage cannot be negative']
  },
  images: [{
    data: Buffer,
    contentType: String,
    url: String, // Keeping URL for compatibility or fallback
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  features: [{
    type: String,
    enum: [
      'air_conditioning',
      'gps',
      'bluetooth',
      'usb_charger',
      'child_seat',
      'cruise_control',
      'parking_sensors',
      'camera',
      'abs',
      'airbags'
    ]
  }],
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    district: {
      type: String,
      required: [true, 'District is required']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    unavailableDates: [{
      startDate: Date,
      endDate: Date,
      reason: String,
      bookingId: mongoose.Schema.Types.ObjectId
    }]
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  documents: {
    registration: {
      data: Buffer,
      contentType: String,
      url: String
    },
    insurance: {
      data: Buffer,
      contentType: String,
      url: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'inactive', 'available', 'maintenance', 'repair'],
    default: 'pending'
  },
  // Trạng thái phê duyệt riêng biệt
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Trạng thái hoạt động riêng biệt
  operationalStatus: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'repair', 'inactive'],
    default: 'inactive'
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  commissionPercentage: {
    type: Number,
    default: 15
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for search
carSchema.index({ brand: 1, model: 1, city: 1 });
carSchema.index({ 'location.city': 1, pricePerDay: 1 });
carSchema.index({ status: 1, 'availability.isAvailable': 1 });

// Method to check availability for dates
carSchema.methods.isAvailableForDates = function(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set all dates to midnight for accurate comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  return this.availability.unavailableDates.every(period => {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);
    
    // Set to midnight
    periodStart.setHours(0, 0, 0, 0);
    periodEnd.setHours(0, 0, 0, 0);
    
    // Check if the requested period overlaps with any unavailable period
    // Two periods overlap if: (start <= periodEnd && end >= periodStart)
    // So they DON'T overlap if: end < periodStart OR start > periodEnd
    // Using <= and >= for inclusive date comparison
    return (end < periodStart || start > periodEnd);
  });
};

// Method to add unavailable dates
carSchema.methods.addUnavailableDates = function(startDate, endDate, reason, bookingId) {
  this.availability.unavailableDates.push({
    startDate,
    endDate,
    reason,
    bookingId
  });
  return this.save();
};

// Method to remove unavailable dates
carSchema.methods.removeUnavailableDates = function(bookingId) {
  const beforeCount = this.availability.unavailableDates.length;
  this.availability.unavailableDates = this.availability.unavailableDates.filter(
    period => {
      // Nếu không có bookingId (lịch chặn thủ công), giữ lại
      if (!period.bookingId) return true;
      // So sánh bookingId
      return period.bookingId.toString() !== bookingId.toString();
    }
  );
  const afterCount = this.availability.unavailableDates.length;
  console.log(`[removeUnavailableDates] Removed ${beforeCount - afterCount} entries for booking ${bookingId}`);
  return this.save();
};

module.exports = mongoose.model('Car', carSchema);
