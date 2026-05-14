const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
    maxlength: [200, 'Street address cannot exceed 200 characters']
  },
  ward: {
    ward_code: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      required: [true, 'Ward name is required']
    }
  },
  province: {
    province_code: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      required: [true, 'Province name is required']
    }
  },
  fullAddress: {
    type: String,
    required: [true, 'Full address is required'],
    trim: true,
    maxlength: [500, 'Full address cannot exceed 500 characters']
  },
  // Universal reference - can be User, Car, or any other model
  referenceType: {
    type: String,
    enum: ['User', 'Car', 'Driver', 'Owner'],
    default: 'User'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  // Keep owner for backward compatibility and permissions
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  addressType: {
    type: String,
    enum: ['home', 'work', 'pickup', 'dropoff', 'other'],
    default: 'home'
  },
  // Additional fields for different use cases
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index for reference queries
addressSchema.index({ referenceType: 1, referenceId: 1 });
addressSchema.index({ owner: 1, isDefault: 1 });
addressSchema.index({ province: 'province_code', ward: 'ward_code' });

// Virtual for formatted address
addressSchema.virtual('formattedAddress').get(function() {
  return `${this.street}, ${this.ward.name}, ${this.province.name}`;
});

// Virtual for reference object
addressSchema.virtual('reference', {
  ref: 'referenceType',
  localField: 'referenceId',
  foreignField: '_id',
  justOne: true
});

// Pre-validate middleware to generate full address
addressSchema.pre('validate', function(next) {
  if (this.street || this.ward.name || this.province.name) {
    this.fullAddress = [
      this.street || 'Chưa cập nhật', 
      this.ward.name || 'Chưa cập nhật', 
      this.province.name || 'Chưa cập nhật'
    ].filter(Boolean).join(', ');
  } else if (!this.fullAddress) {
    this.fullAddress = 'Chưa cập nhật';
  }
  next();
});

// Static methods for convenience
addressSchema.statics.findByReference = function(referenceType, referenceId) {
  return this.findOne({ referenceType, referenceId, isActive: true });
};

addressSchema.statics.findByReferenceWithDefault = function(referenceType, referenceId) {
  return this.findOne({ referenceType, referenceId, isDefault: true, isActive: true });
};

addressSchema.statics.findAllByReference = function(referenceType, referenceId) {
  return this.find({ referenceType, referenceId, isActive: true }).sort({ isDefault: -1, createdAt: -1 });
};

// Instance methods
addressSchema.methods.setAsDefault = async function() {
  // Unset other default addresses for the same reference
  await this.constructor.updateMany(
    { 
      referenceType: this.referenceType, 
      referenceId: this.referenceId, 
      isDefault: true,
      _id: { $ne: this._id }
    },
    { isDefault: false }
  );
  
  this.isDefault = true;
  return this.save();
};

addressSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('Address', addressSchema);
