const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: false
  },
  type: {
    type: String,
    enum: ['renter_to_owner', 'owner_to_renter', 'car_review'],
    required: true
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    trim: true
  },
  images: [{
    url: String,
    caption: String
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  response: {
    content: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  flags: {
    isReported: {
      type: Boolean,
      default: false
    },
    reportReason: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: Date,
    isResolved: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for queries
reviewSchema.index({ booking: 1, type: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, type: 1 });
reviewSchema.index({ car: 1, type: 1 });
reviewSchema.index({ rating: 1 });

// Static method to update user ratings
reviewSchema.statics.updateUserRating = async function(userId) {
  const reviews = await this.find({
    reviewee: userId,
    type: { $in: ['renter_to_owner', 'owner_to_renter'] },
    isPublic: true,
    'flags.isReported': { $ne: true }
  });
  
  if (reviews.length === 0) {
    await mongoose.model('User').findByIdAndUpdate(userId, {
      'rating.average': 0,
      'rating.count': 0
    });
    return;
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating.overall, 0);
  const averageRating = totalRating / reviews.length;
  
  await mongoose.model('User').findByIdAndUpdate(userId, {
    'rating.average': Math.round(averageRating * 10) / 10,
    'rating.count': reviews.length
  });
};

// Static method to update car ratings
reviewSchema.statics.updateCarRating = async function(carId) {
  const reviews = await this.find({
    car: carId,
    type: 'car_review',
    isPublic: true,
    'flags.isReported': { $ne: true }
  });
  
  if (reviews.length === 0) {
    await mongoose.model('Car').findByIdAndUpdate(carId, {
      'rating.average': 0,
      'rating.count': 0
    });
    return;
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating.overall, 0);
  const averageRating = totalRating / reviews.length;
  
  await mongoose.model('Car').findByIdAndUpdate(carId, {
    'rating.average': Math.round(averageRating * 10) / 10,
    'rating.count': reviews.length
  });
};

// Post-save hook to update ratings
reviewSchema.post('save', async function() {
  if (this.type !== 'car_review') {
    await this.constructor.updateUserRating(this.reviewee);
  }
  if (this.car) {
    await this.constructor.updateCarRating(this.car);
  }
});

// Post-remove hook to update ratings
reviewSchema.post('remove', async function() {
  if (this.type !== 'car_review') {
    await this.constructor.updateUserRating(this.reviewee);
  }
  if (this.car) {
    await this.constructor.updateCarRating(this.car);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
