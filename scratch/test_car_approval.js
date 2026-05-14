async function testCarApprovalFlow() {
  const baseUrl = 'http://127.0.0.1:5000/api';
  
  try {
    console.log('Logging in as Admin...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@carrental.vn', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful, token received.');
    
    console.log('Creating a new pending car...');
    const createRes = await fetch(`${baseUrl}/admin/cars`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        brand: 'Toyota',
        model: 'Camry 2024',
        year: 2024,
        licensePlate: '30K-' + Math.floor(Math.random()*10000),
        type: 'Sedan',
        transmission: 'Automatic',
        fuel: 'Gasoline',
        pricing: {
          dailyRate: 1200000
        }
      })
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      console.error('Car creation failed:', createData);
      return;
    }
    const carId = createData.car.id || createData.car._id;
    console.log('Created car ID:', carId);
    
    console.log('Approving the car...');
    const appRes = await fetch(`${baseUrl}/admin/cars/${carId}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const appData = await appRes.json();
    console.log('Approval result:', appData.message);
    
    // Verify car is now available
    console.log('Verifying car status...');
    const verifyRes = await fetch(`${baseUrl}/cars/${carId}`);
    const verifyData = await verifyRes.json();
    console.log('Final status:', verifyData.car.status, 'ApprovalStatus:', verifyData.car.approvalStatus);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCarApprovalFlow();
