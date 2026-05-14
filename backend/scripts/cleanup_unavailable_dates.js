/**
 * Script to clean up unavailable dates from completed/cancelled bookings
 * Run: node scripts/cleanup_unavailable_dates.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Load models from parent directory
const Car = require(path.join(__dirname, '../models/Car'));
const Booking = require(path.join(__dirname, '../models/Booking'));

async function cleanup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car_rental');
    console.log('Connected to MongoDB');

    // Find all cars with unavailable dates
    const cars = await Car.find({
      'availability.unavailableDates.0': { $exists: true }
    });

    console.log(`Found ${cars.length} cars with unavailable dates`);

    let cleanedCount = 0;

    for (const car of cars) {
      console.log(`\n--- Checking car: ${car.brand} ${car.model} (${car._id}) ---`);
      
      const datesToRemove = [];
      
      for (const period of car.availability.unavailableDates) {
        if (period.bookingId) {
          // Check if booking exists and its status
          const booking = await Booking.findById(period.bookingId);
          
          if (!booking) {
            console.log(`  Booking ${period.bookingId} not found - will remove`);
            datesToRemove.push(period.bookingId);
          } else if (['completed', 'cancelled'].includes(booking.status)) {
            console.log(`  Booking ${period.bookingId} is ${booking.status} - will remove`);
            datesToRemove.push(period.bookingId);
          } else {
            console.log(`  Booking ${period.bookingId} is ${booking.status} - keeping`);
          }
        }
      }

      // Remove stale unavailable dates
      if (datesToRemove.length > 0) {
        car.availability.unavailableDates = car.availability.unavailableDates.filter(
          period => !datesToRemove.includes(period.bookingId.toString())
        );
        await car.save();
        console.log(`  Removed ${datesToRemove.length} stale entries`);
        cleanedCount += datesToRemove.length;
      } else {
        console.log(`  No stale entries found`);
      }
    }

    console.log(`\n=== Cleanup complete ===`);
    console.log(`Removed ${cleanedCount} stale unavailable date entries`);
    
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
}

cleanup();
