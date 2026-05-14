require('dotenv').config();
const { getSqlPool, sql } = require('./db/sqlServer');

(async () => {
  const pool = await getSqlPool();
  await pool.request().query('SELECT 1'); // warm

  // Test the getAll query directly
  console.log('Testing getAll SELECT *...');
  let t = Date.now();
  const r1 = await pool.request()
    .input('skip', sql.Int, 0)
    .input('limit', sql.Int, 5)
    .query('SELECT * FROM dbo.Bookings ORDER BY createdAt DESC OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY');
  console.log('SELECT * FROM Bookings (TOP 5):', Date.now()-t+'ms', 'rows:', r1.recordset.length);

  // Now test fetching users
  const renterIds = r1.recordset.map(r => r.renterId).filter(Boolean);
  console.log('Renter IDs to fetch:', renterIds);
  
  if (renterIds.length > 0) {
    t = Date.now();
    const ph = renterIds.map((_, i) => `@u${i}`).join(',');
    const req2 = pool.request();
    renterIds.forEach((id, i) => req2.input(`u${i}`, sql.VarChar(24), id));
    const r2 = await req2.query(`SELECT id, fullName, email, phone, avatarJson, ratingAverage, ratingCount FROM dbo.Users WHERE id IN (${ph})`);
    console.log('SELECT users (avatarJson included):', Date.now()-t+'ms', 'rows:', r2.recordset.length);
    
    t = Date.now();
    const req3 = pool.request();
    renterIds.forEach((id, i) => req3.input(`u${i}`, sql.VarChar(24), id));
    const r3 = await req3.query(`SELECT id, fullName, email, phone, ratingAverage, ratingCount FROM dbo.Users WHERE id IN (${ph})`);
    console.log('SELECT users (NO avatarJson):', Date.now()-t+'ms', 'rows:', r3.recordset.length);
  }

  // Test select specific columns instead of *
  t = Date.now();
  const r4 = await pool.request()
    .input('skip', sql.Int, 0)
    .input('limit', sql.Int, 5)
    .query('SELECT id, renterId, ownerId, carId, mode, status, createdAt, pricingJson FROM dbo.Bookings ORDER BY createdAt DESC OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY');
  console.log('SELECT specific cols FROM Bookings (TOP 5):', Date.now()-t+'ms');

  process.exit(0);
})().catch(e => { console.error('ERROR:', e.message, e.stack); process.exit(1); });
