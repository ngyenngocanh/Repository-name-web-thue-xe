require('dotenv').config();
const { getSqlPool } = require('./db/sqlServer');
const carRepo = require('./repositories/carRepo');

async function test() {
  try {
    const cars = await carRepo.getAll({ limit: 100 });
    console.log('Cars found:', cars.length);
    if (cars.length > 0) {
      console.log('First car ID:', cars[0].id);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

test();
