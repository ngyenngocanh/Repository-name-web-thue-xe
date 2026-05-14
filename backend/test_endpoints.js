require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');

const BASE = 'http://localhost:3000/api';
const SECRET = process.env.JWT_SECRET;

async function get(path, token) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'localhost', port: 3000, path: `/api${path}`,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    };
    const chunks = [];
    const req = http.get(opts, (res) => {
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString());
          resolve({ status: res.statusCode, body });
        } catch(e) {
          resolve({ status: res.statusCode, body: null });
        }
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.setTimeout(10000, () => { req.destroy(); resolve({ status: -1, error: 'timeout' }); });
  });
}

async function getUserByEmail(email) {
  const { getSqlPool, sql } = require('./db/sqlServer');
  const pool = await getSqlPool();
  const res = await pool.request()
    .input('email', sql.VarChar(255), email)
    .query('SELECT TOP 1 id, role FROM dbo.Users WHERE email = @email');
  return res.recordset[0];
}

async function main() {
  console.log('\n=== MSSQL MIGRATION ENDPOINT HEALTH CHECK ===\n');
  
  // 1. Get a real user from DB
  let adminUser, renterUser;
  try {
    adminUser = await getUserByEmail('admin@carrental.vn');
    console.log(`✓ Admin user found: id=${adminUser?.id}, role=${adminUser?.role}`);
  } catch(e) {
    console.log(`✗ Could not query DB: ${e.message}`);
    process.exit(1);
  }

  const adminToken = jwt.sign({ userId: adminUser.id, role: adminUser.role }, SECRET, { expiresIn: '1h' });

  // 2. Test public endpoint
  const pubResult = await get('/bookings/my/rentals', null);
  console.log(`\n[Auth Guard] GET /bookings/my/rentals (no token): ${pubResult.status === 401 ? '✓ 401' : `✗ Expected 401, got ${pubResult.status}`}`);

  // 3. Test my/rentals
  const rentalsResult = await get('/bookings/my/rentals?page=1&limit=5', adminToken);
  console.log(`[Rentals]   GET /bookings/my/rentals:            ${rentalsResult.status === 200 ? '✓ 200' : `✗ ${rentalsResult.status}`}`);
  if (rentalsResult.status === 200) {
    const { bookings, pagination } = rentalsResult.body;
    console.log(`            → ${bookings?.length ?? '?'} bookings, total=${pagination?.total ?? '?'}`);
    if (bookings?.length > 0) {
      const b = bookings[0];
      console.log(`            → Sample: _id=${b._id}, status=${b.status}, car=${typeof b.car === 'object' ? b.car?.brand+' '+b.car?.model : b.car}`);
    }
  } else {
    console.log(`            → Error: ${JSON.stringify(rentalsResult.body)}`);
  }

  // 4. Test my/bookings (as owner)
  const myBookings = await get('/bookings/my/bookings?page=1&limit=5', adminToken);
  console.log(`[MyBookings] GET /bookings/my/bookings:           ${myBookings.status === 200 ? '✓ 200' : `✗ ${myBookings.status}`}`);
  if (myBookings.status === 200) {
    const { bookings, pagination } = myBookings.body;
    console.log(`            → ${bookings?.length ?? '?'} bookings, total=${pagination?.total ?? '?'}`);
  }

  // 5. Test admin stats
  const overview = await get('/admin/stats', adminToken);
  console.log(`[Admin]     GET /admin/stats:                     ${overview.status === 200 ? '✓ 200' : `✗ ${overview.status} ${overview.error||''}`}`);
  if (overview.status === 200) {
    const d = overview.body;
    console.log(`            → users=${d.totalUsers}, cars=${d.totalCars}, bookings=${d.totalBookings}, revenue=${d.totalRevenue}`);
  }

  // 6. Test admin analytics
  const analytics = await get('/admin/analytics?period=month', adminToken);
  console.log(`[Analytics] GET /admin/analytics:                 ${analytics.status === 200 ? '✓ 200' : `✗ ${analytics.status}`}`);
  if (analytics.status === 200) {
    const d = analytics.body;
    console.log(`            → topCars=${d.topCars?.length}, topUsers=${d.topUsers?.length}, activeBookings=${d.activeBookings}`);
  }

  // 7. Test notifications
  const notifs = await get('/notifications?limit=5', adminToken);
  console.log(`[Notifs]    GET /notifications:                   ${notifs.status === 200 ? '✓ 200' : `✗ ${notifs.status}`}`);
  if (notifs.status === 200) {
    console.log(`            → ${notifs.body.notifications?.length ?? '?'} notifs, unread=${notifs.body.unreadCount}`);
  }

  console.log('\n=== CHECK COMPLETE ===\n');
  process.exit(0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
