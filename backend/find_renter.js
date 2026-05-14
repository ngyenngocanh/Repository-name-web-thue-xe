require('dotenv').config();
const { getSqlPool } = require('./db/sqlServer');

async function findRenter() {
  const bookingId = '6a0482ac65e3196307560753';
  try {
    const pool = await getSqlPool();
    const bRes = await pool.request().input('id', bookingId).query('SELECT renterId FROM dbo.Bookings WHERE id = @id');
    const renterId = bRes.recordset[0]?.renterId;
    console.log('Renter ID:', renterId);
    if (renterId) {
      const uRes = await pool.request().input('id', renterId).query('SELECT email FROM dbo.Users WHERE id = @id');
      console.log('Renter Email:', uRes.recordset[0]?.email);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

findRenter();
