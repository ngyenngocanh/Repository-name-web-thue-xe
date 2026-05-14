const axios = require('axios');

async function testTopDrivers() {
  try {
    const response = await axios.get('http://localhost:5000/api/users/top-drivers');
    console.log('Status:', response.status);
    console.log('Drivers Count:', response.data.drivers ? response.data.drivers.length : 0);
    if (response.data.drivers && response.data.drivers.length > 0) {
        console.log('First driver:', response.data.drivers[0].fullName);
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testTopDrivers();
