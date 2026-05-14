require('dotenv').config();
const { getSqlPool, sql } = require('./db/sqlServer');

// Simulate what analytics route does - all 11 parallel then 2 parallel
(async () => {
  const pool = await getSqlPool();
  
  // Warm up
  await pool.request().query('SELECT 1');
  
  const bookingRepo = require('./repositories/bookingRepo');
  const userRepo = require('./repositories/userRepo');
  const carRepo = require('./repositories/carRepo');

  const now = new Date();
  let startDate = new Date();
  startDate.setDate(now.getDate() - 30);
  let prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - 30);

  console.log('\nPhase 1: 11 parallel queries');
  const t1 = Date.now();
  const results = await Promise.all([
    userRepo.countDocuments({ createdAt: { $gte: startDate } }).then(r => { console.log('  userCount:', Date.now()-t1+'ms'); return r; }),
    userRepo.countDocuments({ createdAt: { $gte: prevStartDate, $lt: startDate } }).then(r => { console.log('  prevUserCount:', Date.now()-t1+'ms'); return r; }),
    bookingRepo.countDocuments({ createdAt: { $gte: startDate } }).then(r => { console.log('  bookingCount:', Date.now()-t1+'ms'); return r; }),
    bookingRepo.countDocuments({ createdAt: { $gte: prevStartDate, $lt: startDate } }).then(r => { console.log('  prevBookingCount:', Date.now()-t1+'ms'); return r; }),
    bookingRepo.countDocuments({ status: { $in: ['active', 'confirmed'] } }).then(r => { console.log('  activeBookings:', Date.now()-t1+'ms'); return r; }),
    bookingRepo.getCompletedRevenue({ createdAt: { $gte: startDate } }).then(r => { console.log('  revenue:', Date.now()-t1+'ms'); return r; }),
    bookingRepo.getCompletedRevenue({ createdAt: { $gte: prevStartDate, $lt: startDate } }).then(r => { console.log('  prevRevenue:', Date.now()-t1+'ms'); return r; }),
    bookingRepo.getTopCarsByRevenue(startDate, 5).then(r => { console.log('  topCars:', Date.now()-t1+'ms'); return r; }),
    bookingRepo.getTopUsersBySpending(startDate, 5).then(r => { console.log('  topUsers:', Date.now()-t1+'ms'); return r; }),
    carRepo.countDocuments({ status: 'approved' }).then(r => { console.log('  approvedCars:', Date.now()-t1+'ms'); return r; }),
    carRepo.countDocuments({ status: 'pending' }).then(r => { console.log('  pendingCars:', Date.now()-t1+'ms'); return r; }),
  ]);
  console.log('Phase 1 total:', Date.now()-t1+'ms');

  console.log('\nPhase 2: 2 parallel queries');
  const t2 = Date.now();
  await Promise.all([
    bookingRepo.getAll({ sort: 'createdAt DESC', limit: 5, populate: ['renter'] }).then(r => { console.log('  getAll+populate:', Date.now()-t2+'ms'); return r; }),
    bookingRepo.getDistinctCarIds({ status: { $in: ['active', 'confirmed'] } }).then(r => { console.log('  distinctCarIds:', Date.now()-t2+'ms'); return r; }),
  ]);
  console.log('Phase 2 total:', Date.now()-t2+'ms');
  
  process.exit(0);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
