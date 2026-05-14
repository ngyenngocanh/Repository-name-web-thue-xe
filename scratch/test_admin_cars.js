async function testAdminCars() {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    console.log('Logging in as Admin...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@carrental.vn', password: 'admin123' })
    });
    const { token } = await loginRes.json();
    
    console.log('Fetching all cars as Admin...');
    const res = await fetch(`${baseUrl}/admin/cars`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log(`Found ${data.cars ? data.cars.length : 0} cars`);
    
    const pendingCar = data.cars.find(c => c.approvalStatus === 'pending' || c.status === 'pending');
    if (pendingCar) {
      console.log('Found pending car:', pendingCar._id || pendingCar.id);
      console.log('Approving car...');
      const appRes = await fetch(`${baseUrl}/admin/cars/${pendingCar._id || pendingCar.id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appData = await appRes.json();
      console.log('Approval result:', appData.message);
    } else {
      console.log('No pending cars found.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdminCars();
