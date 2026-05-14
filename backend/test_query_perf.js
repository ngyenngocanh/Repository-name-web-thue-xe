require('dotenv').config();
const { getSqlPool, sql } = require('./db/sqlServer');

(async () => {
  const pool = await getSqlPool();
  const start = Date.now();
  
  const run = async (name, q) => {
    const t = Date.now();
    await pool.request().query(q);
    console.log(`${name}: ${Date.now()-t}ms`);
  };

  await run('simple user count', 'SELECT COUNT(*) cnt FROM dbo.Users');
  await run('simple booking count', 'SELECT COUNT(*) cnt FROM dbo.Bookings');
  await run('simple car count', 'SELECT COUNT(*) cnt FROM dbo.Cars');
  await run('booking by status', "SELECT COUNT(*) cnt FROM dbo.Bookings WHERE status='completed'");
  await run('getCompletedRevenue (JSON_VALUE)', "SELECT ISNULL(SUM(CAST(JSON_VALUE(pricingJson, '$.totalAmount') AS DECIMAL(18,2))), 0) total FROM dbo.Bookings WHERE status='completed'");
  await run('getTopCars (JOIN+JSON_VALUE)', "SELECT TOP 5 b.carId, SUM(CAST(JSON_VALUE(b.pricingJson, '$.totalAmount') AS DECIMAL(18,2))) revenue, COUNT(*) bookings, c.brand, c.model, c.licensePlate FROM dbo.Bookings b LEFT JOIN dbo.Cars c ON c.id = b.carId WHERE b.status='completed' GROUP BY b.carId, c.brand, c.model, c.licensePlate ORDER BY revenue DESC");
  await run('getTopUsers (JOIN+JSON_VALUE)', "SELECT TOP 5 b.renterId, SUM(CAST(JSON_VALUE(b.pricingJson, '$.totalAmount') AS DECIMAL(18,2))) totalSpent, COUNT(*) bookings, u.fullName, u.email FROM dbo.Bookings b LEFT JOIN dbo.Users u ON u.id = b.renterId WHERE b.status='completed' GROUP BY b.renterId, u.fullName, u.email ORDER BY totalSpent DESC");
  await run('recent bookings (TOP 5)', 'SELECT TOP 5 id, renterId, mode, createdAt FROM dbo.Bookings ORDER BY createdAt DESC');

  console.log(`\nTOTAL SEQUENTIAL: ${Date.now()-start}ms`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
