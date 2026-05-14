async function testApis() {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    // 1. Search Cars
    console.log('Testing Search Cars...');
    const searchRes = await fetch(`${baseUrl}/cars?city=TP. Hồ Chí Minh`);
    const searchData = await searchRes.json();
    console.log(`Found ${searchData.cars ? searchData.cars.length : 0} cars in TP. HCM`);
    if (searchData.cars && searchData.cars.length > 0) {
      const carId = searchData.cars[0].id || searchData.cars[0]._id;
      console.log(`First car ID: ${carId}`);
      
      // 2. Car Details
      console.log(`Testing Car Details for ${carId}...`);
      const detailRes = await fetch(`${baseUrl}/cars/${carId}`);
      const detailData = await detailRes.json();
      console.log(`Car brand: ${detailData.brand}, model: ${detailData.model}`);
    }
    
    // 3. User Info (Login first)
    console.log('Logging in to test protected route...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@carrental.vn', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    console.log('Testing Me API...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log(`Logged in as: ${meData.fullName}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApis();
