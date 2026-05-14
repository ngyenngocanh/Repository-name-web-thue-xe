require('dotenv').config();
const { getSqlPool } = require('./db/sqlServer');
const bookingRepo = require('./repositories/bookingRepo');

async function checkBooking() {
  const bookingId = '6a0482ac65e3196307560753';
  try {
    const booking = await bookingRepo.getById(bookingId, ['car', 'renter']);
    console.log('Booking Details:');
    console.log('- Rental Type:', booking.rentalType);
    console.log('- Status:', booking.status);
    console.log('- Renter:', booking.renter?.fullName);
    console.log('- Car:', booking.car?.brand, booking.car?.model);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkBooking();
