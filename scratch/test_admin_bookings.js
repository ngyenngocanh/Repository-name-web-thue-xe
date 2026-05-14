async function testAdminBookings() {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    console.log('Logging in as Admin...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@carrental.vn', password: 'admin123' })
    });
    const { token } = await loginRes.json();
    
    console.log('Fetching all bookings as Admin via /api/admin/bookings...');
    const res = await fetch(`${baseUrl}/admin/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log(`Found ${data.bookings ? data.bookings.length : 0} bookings`);
    if (data.bookings && data.bookings.length > 0) {
      console.log('Sample booking:', data.bookings[0]._id || data.bookings[0].id, 'Status:', data.bookings[0].status);
    } else {
      console.log('Response data:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdminBookings();
