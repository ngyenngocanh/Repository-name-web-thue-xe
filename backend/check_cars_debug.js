require('dotenv').config();
const { getSqlPool, sql } = require('./db/sqlServer');
require('dotenv').config();

async function checkCars() {
  try {
    const pool = await getSqlPool();
    const result = await pool.request().query('SELECT * FROM dbo.Cars');
    console.log(`Total cars in DB: ${result.recordset.length}`);
    if (result.recordset.length > 0) {
      console.log('Sample car:', result.recordset[0].brand, result.recordset[0].model);
      console.log('Location JSON:', result.recordset[0].locationJson);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

checkCars();
