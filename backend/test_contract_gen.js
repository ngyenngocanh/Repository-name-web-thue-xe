const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bookingRepo = require('./repositories/bookingRepo');
const contractManager = require('./contracts/contractManager');
const { getSqlPool } = require('./db/sqlServer');

async function test() {
  try {
    const pool = await getSqlPool();
    // Get a confirmed booking to test with
    const result = await pool.request().query("SELECT TOP 1 id FROM dbo.Bookings WHERE status = 'confirmed'");
    if (result.recordset.length === 0) {
      console.log("No confirmed bookings found to test with.");
      return;
    }
    const bookingId = result.recordset[0].id;
    console.log(`Testing with bookingId: ${bookingId}`);

    const booking = await bookingRepo.getById(bookingId, ['car', 'driver', 'renter', 'owner', 'pickupAddress', 'returnAddress']);
    if (!booking) {
      console.log("Booking not found.");
      return;
    }

    console.log(`Rental Type: ${booking.rentalType}`);
    
    // Prepare contract data (mimicking routes/contracts.js)
    let contractData = {
      renter: booking.renter,
      owner: booking.owner || booking.driver, // Simplified for test
      booking: booking,
      startDate: booking.startDate,
      endDate: booking.endDate,
    };

    let genResult;
    if (booking.rentalType === 'self_drive') {
      contractData.car = booking.car;
      genResult = await contractManager.generateSelfDriveContract(contractData);
    } else if (booking.rentalType === 'with_driver') {
      contractData.car = booking.car;
      contractData.driver = booking.driver;
      genResult = await contractManager.generateWithDriverContract(contractData);
    } else {
      contractData.driver = booking.driver;
      contractData.startLocation = booking.trip?.startLocation || booking.pickupLocation;
      contractData.endLocation = booking.trip?.endLocation || booking.returnLocation;
      contractData.distance = booking.trip?.distance || booking.distance || 0;
      contractData.price = booking.pricing?.totalAmount || booking.trip?.totalTripPrice || 0;
      genResult = await contractManager.generateTripDriverContract(contractData);
    }

    if (genResult.success) {
      console.log("Contract generated successfully!");
      console.log(`File: ${genResult.fileName}`);
    } else {
      console.log("Failed to generate contract.");
      console.log(`Error: ${genResult.error}`);
    }

  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    process.exit();
  }
}

test();
