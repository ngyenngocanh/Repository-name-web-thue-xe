const axios = require('axios');

async function testLogin() {
  try {
    console.log('Sending login request to http://localhost:5001/api/auth/login ...');
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@carrental.vn',
      password: 'admin123'
    });
    console.log('Login Response:', response.data);
  } catch (err) {
    console.error('Login Failed:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
}

testLogin();
