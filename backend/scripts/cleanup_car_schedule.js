/**
 * Script xóa lịch bận cho xe cụ thể
 * Run: node scripts/cleanup_car_schedule.js <car_id>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const Car = require(path.join(__dirname, '../models/Car'));

async function cleanupCarSchedule(carId) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thuexe');
    console.log('Connected to MongoDB');

    const car = await Car.findById(carId);
    if (!car) {
      console.log('Car not found');
      process.exit(1);
    }

    console.log(`\nCar: ${car.brand} ${car.model}`);
    console.log(`Current operationalStatus: ${car.operationalStatus}`);
    console.log(`Unavailable dates count: ${car.availability?.unavailableDates?.length || 0}`);

    if (car.availability?.unavailableDates?.length > 0) {
      console.log('\n--- Current unavailable dates ---');
      car.availability.unavailableDates.forEach((period, i) => {
        console.log(`${i + 1}. ${period.startDate?.toISOString?.() || period.startDate} - ${period.endDate?.toISOString?.() || period.endDate}`);
        console.log(`   Reason: ${period.reason}, BookingID: ${period.bookingId}`);
      });
    }

    // Reset về available và xóa tất cả lịch
    car.operationalStatus = 'available';
    const beforeCount = car.availability.unavailableDates.length;
    car.availability.unavailableDates = [];
    await car.save();

    console.log(`\n✓ Reset completed!`);
    console.log(`  - Removed ${beforeCount} unavailable date entries`);
    console.log(`  - operationalStatus set to 'available'`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

const carId = process.argv[2];
if (!carId) {
  console.log('Usage: node scripts/cleanup_car_schedule.js <car_id>');
  process.exit(1);
}

cleanupCarSchedule(carId);
