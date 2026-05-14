require('dotenv').config();
const { getSqlPool } = require('./db/sqlServer');

async function checkColumns() {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings'");
    console.log('Columns in Bookings table:');
    result.recordset.forEach(row => console.log('-', row.COLUMN_NAME));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkColumns();
