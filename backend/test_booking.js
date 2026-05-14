require('dotenv').config();
const { getAll } = require('./repositories/bookingRepo');

async function test() {
  try {
    const res = await getAll({ filter: { $or: [{ renter: '123' }, { bookedBy: '123' }] } });
    console.log(res);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
test();
