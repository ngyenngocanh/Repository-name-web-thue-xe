const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const reviewRepo = require('../repositories/reviewRepo');
const bookingRepo = require('../repositories/bookingRepo');
const carRepo = require('../repositories/carRepo');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const Review = require('../models/Review');

const router = express.Router();
const isMssql = (process.env.DB_PROVIDER || 'mongo').toLowerCase() === 'mssql';

// Create review
router.post('/', auth, [
  body('booking').notEmpty().withMessage('Booking ID required'),
  body('type').isIn(['renter_to_owner', 'owner_to_renter', 'car_review']).withMessage('Valid review type required'),
  body('rating.overall').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be 1-5'),
  body('comment').trim().isLength({ min: 2, max: 1000 }).withMessage('Comment must be 2-1000 characters'),
  body('rating.communication').optional().isInt({ min: 1, max: 5 }),
  body('rating.cleanliness').optional().isInt({ min: 1, max: 5 }),
  body('rating.accuracy').optional().isInt({ min: 1, max: 5 }),
  body('rating.value').optional().isInt({ min: 1, max: 5 }),
  body('rating.punctuality').optional().isInt({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { booking, type, rating, comment } = req.body;

    // Get booking details
    let bookingDoc;
    if (isMssql) {
      bookingDoc = await bookingRepo.getById(booking, ['car', 'renter', 'owner']);
    } else {
      bookingDoc = await Booking.findById(booking).populate('car renter owner');
    }

    if (!bookingDoc) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (bookingDoc.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    let reviewer = req.userId;
    let reviewee;
    let carId = bookingDoc.car ? (bookingDoc.car._id || bookingDoc.car.id || bookingDoc.car) : null;
    
    const getUserId = (val) => (val && typeof val === 'object' ? (val._id || val.id) : val);

    if (type === 'renter_to_owner') {
      const driverId = getUserId(bookingDoc.driver);
      reviewee = driverId || getUserId(bookingDoc.owner);
    } else if (type === 'owner_to_renter') {
      reviewee = getUserId(bookingDoc.renter);
    } else if (type === 'car_review') {
      reviewee = getUserId(bookingDoc.owner);
    }

    if (isMssql) {
      // Check if review exists in MSSQL
      const existing = await reviewRepo.getAll({ filter: { bookingId: booking, reviewerId: reviewer, type } });
      if (existing.length > 0) return res.status(400).json({ message: 'Review already exists' });

      const review = await reviewRepo.createReview({
        booking, reviewer, reviewee, car: carId, type, rating, comment, images: req.body.images
      });

      if (type === 'car_review' && carId) {
        await updateCarRating(carId);
      }

      return res.status(201).json({ message: 'Review created successfully', review });
    }

    // MongoDB path
    const review = new Review({
      booking, reviewer, reviewee, car: carId, type, rating, comment, images: req.body.images || []
    });
    await review.save();

    if (type === 'car_review' && carId) {
      await updateCarRating(carId);
    }

    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (isMssql) {
      const filter = { revieweeId: userId, isPublic: true };
      // Also filter by type if provided (from MongoDB logic)
      if (req.query.type) filter.type = req.query.type;
      
      const [reviews, total] = await Promise.all([
        reviewRepo.getAll({ filter, skip, limit, sort: 'createdAt DESC', populate: ['reviewer'] }),
        reviewRepo.countDocuments(filter)
      ]);
      return res.json({ reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }

    const filter = {
      reviewee: userId,
      type: { $in: ['renter_to_owner', 'owner_to_renter'] },
      isPublic: true,
      'flags.isReported': { $ne: true }
    };

    const { type } = req.query;

    if (type && ['renter_to_owner', 'owner_to_renter'].includes(type)) {
      filter.type = type;
    }

    const reviews = await Review.find(filter)
      .populate('reviewer', 'fullName avatar')
      .populate('car', 'brand model')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for a car
router.get('/car/:carId', async (req, res) => {
  try {
    const { carId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (isMssql) {
      const filter = { carId, type: 'car_review', isPublic: true };
      const [reviews, total] = await Promise.all([
        reviewRepo.getAll({ filter, skip, limit, sort: 'createdAt DESC', populate: ['reviewer'] }),
        reviewRepo.countDocuments(filter)
      ]);
      return res.json({ reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }

    const filter = {
      car: carId,
      type: 'car_review',
      isPublic: true,
      'flags.isReported': { $ne: true }
    };

    const reviews = await Review.find(filter)
      .populate('reviewer', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get review by ID
router.get('/:id', async (req, res) => {
  try {
    let review;
    if (isMssql) {
      review = await reviewRepo.getById(req.params.id);
      if (review) {
        const pop = await reviewRepo.populateRefs([review], ['reviewer', 'reviewee', 'car', 'booking']);
        review = pop[0];
      }
    } else {
      review = await Review.findById(req.params.id)
        .populate('reviewer', 'fullName avatar')
        .populate('reviewee', 'fullName avatar')
        .populate('car', 'brand model')
        .populate('booking', 'startDate endDate');
    }

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if review is public or user is authorized
    const reviewerId = (review.reviewer && typeof review.reviewer === 'object') ? (review.reviewer.id || review.reviewer._id) : review.reviewer;
    const revieweeId = (review.reviewee && typeof review.reviewee === 'object') ? (review.reviewee.id || review.reviewee._id) : review.reviewee;

    if (!review.isPublic && 
        reviewerId.toString() !== req.userId && 
        revieweeId.toString() !== req.userId && 
        req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this review' });
    }

    res.json({ review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update review
router.put('/:id', auth, [
  body('comment').optional().trim().isLength({ min: 2, max: 1000 }),
  body('rating.overall').optional().isInt({ min: 1, max: 5 }),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let review;
    if (isMssql) {
      review = await reviewRepo.getById(req.params.id);
    } else {
      review = await Review.findById(req.params.id);
    }

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the reviewer
    const reviewerId = (review.reviewer && typeof review.reviewer === 'object') ? (review.reviewer.id || review.reviewer._id) : review.reviewer;
    if (reviewerId.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const allowedUpdates = ['comment', 'rating', 'isPublic'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Update nested rating if provided
    if (req.body.rating && typeof req.body.rating === 'object') {
      const currentRating = review.rating || {};
      Object.keys(req.body.rating).forEach(ratingKey => {
        if (['overall', 'communication', 'cleanliness', 'accuracy', 'value', 'punctuality'].includes(ratingKey)) {
          if (!updates.rating) updates.rating = currentRating;
          updates.rating[ratingKey] = req.body.rating[ratingKey];
        }
      });
    }

    let updatedReview;
    if (isMssql) {
      updatedReview = await reviewRepo.updateReview(req.params.id, updates);
      const pop = await reviewRepo.populateRefs([updatedReview], ['reviewer', 'reviewee', 'car']);
      updatedReview = pop[0];
    } else {
      updatedReview = await Review.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate([
        { path: 'reviewer', select: 'fullName avatar' },
        { path: 'reviewee', select: 'fullName avatar' },
        { path: 'car', select: 'brand model' }
      ]);
    }

    // Cập nhật lại rating xe nếu là car_review
    const carId = (updatedReview.car && typeof updatedReview.car === 'object') ? (updatedReview.car.id || updatedReview.car._id) : updatedReview.car;
    if (updatedReview.type === 'car_review' && carId) {
      await updateCarRating(carId);
    }

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    let review;
    if (isMssql) {
      review = await reviewRepo.getById(req.params.id);
    } else {
      review = await Review.findById(req.params.id);
    }

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the reviewer or admin
    const reviewerId = (review.reviewer && typeof review.reviewer === 'object') ? (review.reviewer.id || review.reviewer._id) : review.reviewer;
    if (reviewerId.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const carId = (review.car && typeof review.car === 'object') ? (review.car.id || review.car._id) : review.car;
    const isCarReview = review.type === 'car_review';

    if (isMssql) {
      await reviewRepo.deleteReview(req.params.id);
    } else {
      await Review.findByIdAndDelete(req.params.id);
    }

    // Cập nhật lại rating xe nếu là car_review
    if (isCarReview && carId) {
      await updateCarRating(carId);
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report review
router.post('/:id/report', auth, [
  body('reason').trim().isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let review;
    if (isMssql) {
      review = await reviewRepo.getById(req.params.id);
    } else {
      review = await Review.findById(req.params.id);
    }

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const flags = review.flags || {};
    if (flags.isReported) {
      return res.status(400).json({ message: 'Review already reported' });
    }

    const reportData = {
      isReported: true,
      reportReason: req.body.reason,
      reportedBy: req.userId,
      reportedAt: new Date()
    };

    if (isMssql) {
      await reviewRepo.updateReview(req.params.id, { flagsJson: JSON.stringify(reportData) });
    } else {
      review.flags = reportData;
      await review.save();
    }

    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to review (for reviewee)
router.post('/:id/response', auth, [
  body('content').trim().isLength({ min: 10, max: 500 }).withMessage('Response must be 10-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let review;
    if (isMssql) {
      review = await reviewRepo.getById(req.params.id);
    } else {
      review = await Review.findById(req.params.id);
    }

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the reviewee
    const revieweeId = (review.reviewee && typeof review.reviewee === 'object') ? (review.reviewee.id || review.reviewee._id) : review.reviewee;
    if (revieweeId.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to respond to this review' });
    }

    const responseData = {
      content: req.body.content,
      respondedAt: new Date(),
      respondedBy: req.userId
    };

    if (isMssql) {
      await reviewRepo.updateReview(req.params.id, { responseJson: JSON.stringify(responseData) });
    } else {
      review.response = responseData;
      await review.save();
    }

    res.json({ message: 'Response added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Hàm cập nhật rating xe
async function updateCarRating(carId) {
  try {
    if (isMssql) {
      const reviews = await reviewRepo.getAll({ filter: { carId, type: 'car_review', isPublic: true } });
      if (reviews.length === 0) {
        await carRepo.updateCar(carId, { rating: { average: 0, count: 0 } });
        return;
      }
      const total = reviews.reduce((sum, r) => sum + (r.rating?.overall || 0), 0);
      const average = Math.round((total / reviews.length) * 10) / 10;
      await carRepo.updateCar(carId, { ratingAverage: average, ratingCount: reviews.length });
      return;
    }

    const reviews = await Review.find({
      car: carId,
      type: 'car_review',
      isPublic: true,
      'flags.isReported': { $ne: true }
    });

    if (reviews.length === 0) {
      await Car.findByIdAndUpdate(carId, {
        'rating.average': 0,
        'rating.count': 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + (review.rating?.overall || 0), 0);
    const averageRating = totalRating / reviews.length;

    await Car.findByIdAndUpdate(carId, {
      'rating.average': Math.round(averageRating * 10) / 10, // Làm tròn 1 chữ số thập phân
      'rating.count': reviews.length
    });
  } catch (error) {
    console.error('Error updating car rating:', error);
  }
}

module.exports = router;
