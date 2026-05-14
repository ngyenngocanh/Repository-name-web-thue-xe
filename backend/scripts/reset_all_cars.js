/**
 * Script reset trạng thái tất cả xe về available
 * Run: node scripts/reset_all_cars.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const Car = require(path.join(__dirname, '../models/Car'));

async function resetAllCars() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thuexe');
    console.log('Connected to MongoDB');

    // Tìm tất cả xe không ở trạng thái available
    const cars = await Car.find({
      $or: [
        { operationalStatus: { $ne: 'available' } },
        { 'availability.unavailableDates.0': { $exists: true } }
      ]
    });

    console.log(`Found ${cars.length} cars to reset`);

    for (const car of cars) {
      const oldStatus = car.operationalStatus;
      const oldUnavailableCount = car.availability?.unavailableDates?.length || 0;

      // Reset về available
      car.operationalStatus = 'available';
      car.availability.unavailableDates = [];
      await car.save();

      console.log(`Reset car ${car._id} (${car.brand} ${car.model}): ${oldStatus} -> available, cleared ${oldUnavailableCount} unavailable dates`);
    }

    console.log(`\nReset completed! ${cars.length} cars updated.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAllCars();
