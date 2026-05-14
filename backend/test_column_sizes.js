require('dotenv').config();
const { getSqlPool, sql } = require('./db/sqlServer');

(async () => {
  const pool = await getSqlPool();
  await pool.request().query('SELECT 1');

  // Check column sizes in Bookings table
  const r = await pool.request().query(`
    SELECT 
      COLUMN_NAME,
      DATA_TYPE,
      CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Bookings' AND TABLE_SCHEMA = 'dbo'
    ORDER BY ORDINAL_POSITION
  `);
  console.log('Bookings columns:');
  r.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME}: ${c.DATA_TYPE}(${c.CHARACTER_MAXIMUM_LENGTH})`));

  // Check average JSON column sizes
  const r2 = await pool.request().query(`
    SELECT TOP 5
      id,
      LEN(ISNULL(pricingJson,'')) pricingLen,
      LEN(ISNULL(documentsJson,'')) docLen,
      LEN(ISNULL(tripJson,'')) tripLen,
      LEN(ISNULL(longTermAgreementsJson,'')) ltaLen,
      LEN(ISNULL(settlementJson,'')) settlementLen,
      LEN(ISNULL(cancellationJson,'')) cancelLen
    FROM dbo.Bookings ORDER BY createdAt DESC
  `);
  console.log('\nColumn sizes (chars) for top 5 rows:');
  r2.recordset.forEach(row => {
    const total = row.pricingLen + row.docLen + row.tripLen + row.ltaLen + row.settlementLen + row.cancelLen;
    console.log(`  id=${row.id}: pricing=${row.pricingLen}, docs=${row.docLen}, trip=${row.tripLen}, lta=${row.ltaLen}, settlement=${row.settlementLen}, cancel=${row.cancelLen} => TOTAL=${total}`);
  });

  // Test with minimal columns (no JSON blobs)
  let t = Date.now();
  const r3 = await pool.request()
    .input('skip', sql.Int, 0).input('limit', sql.Int, 5)
    .query('SELECT id, renterId, ownerId, carId, driverId, mode, status, bookingType, startDate, endDate, createdAt, pricingJson FROM dbo.Bookings ORDER BY createdAt DESC OFFSET @skip ROWS FETCH NEXT @limit ROWS ONLY');
  console.log('\nSELECT minimal cols (no large JSON):', Date.now()-t+'ms');

  process.exit(0);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
