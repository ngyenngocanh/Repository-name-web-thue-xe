const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Booking = require('./models/Booking');

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Find the driver
  const driver = await User.findOne({ role: 'driver' });
  if (!driver) {
    console.log('No driver found');
    process.exit(1);
  }
  console.log('Driver ID:', driver._id, driver.fullName);

  const now = new Date();
  const vnNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const todayStr = vnNow.toISOString().split('T')[0];
  const todayStart = new Date(todayStr + "T00:00:00Z");
  todayStart.setHours(todayStart.getHours() - 7);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  console.log('Vietnam Today:', todayStr);
  console.log('UTC Range Start:', todayStart.toISOString());
  console.log('UTC Range End:', tomorrowStart.toISOString());

  const bookings = await Booking.find({
    $or: [{ owner: driver._id }, { driver: driver._id }],
  }).populate('car');

  console.log('Total bookings found for this driver (any status):', bookings.length);

  bookings.forEach(b => {
    console.log(`Booking ${b._id}: Status=${b.status}, Start=${b.startDate}, End=${b.endDate}, ActualReturn=${b.actualReturnTime}`);
    const compDate = b.actualReturnTime || b.endDate;
    if (compDate >= todayStart && compDate < tomorrowStart) {
      console.log('  -> MATCHES TODAY earning window!');
    }
  });

  process.exit(0);
}

debug();
