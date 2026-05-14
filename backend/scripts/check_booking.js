/**
 * Check specific booking details
 * Run: node scripts/check_booking.js <booking_id>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const Booking = require(path.join(__dirname, '../models/Booking'));
const Car = require(path.join(__dirname, '../models/Car'));

async function checkBooking() {
  const bookingId = process.argv[2];
  
  if (!bookingId) {
    console.log('Usage: node scripts/check_booking.js <booking_id>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car_rental');
    console.log('Connected to MongoDB\n');

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.log(`Booking ${bookingId} not found`);
      process.exit(1);
    }

    console.log('=== BOOKING DETAILS ===');
    console.log('ID:', booking._id);
    console.log('Status:', booking.status);
    console.log('Start Date:', booking.startDate);
    console.log('End Date:', booking.endDate);
    console.log('Car ID:', booking.car);
    console.log('Renter ID:', booking.renter);
    console.log('Owner ID:', booking.owner);
    console.log('');

    const car = await Car.findById(booking.car);
    if (car) {
      console.log('=== CAR DETAILS ===');
      console.log('Car:', car.brand, car.model);
      console.log('Status:', car.status);
      console.log('Operational Status:', car.operationalStatus);
      console.log('');
      
      console.log('=== UNAVAILABLE DATES ===');
      if (car.availability?.unavailableDates?.length > 0) {
        car.availability.unavailableDates.forEach((period, i) => {
          console.log(`\n[${i + 1}]`);
          console.log('  Start:', period.startDate);
          console.log('  End:', period.endDate);
          console.log('  Reason:', period.reason);
          console.log('  Booking ID:', period.bookingId);
          console.log('  Matches current booking:', period.bookingId?.toString() === bookingId);
        });
      } else {
        console.log('No unavailable dates found');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkBooking();
