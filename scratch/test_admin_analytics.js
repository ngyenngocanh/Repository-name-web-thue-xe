async function testAdminAnalytics() {
  const baseUrl = 'http://127.0.0.1:5000/api';
  
  try {
    console.log('Logging in as Admin...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@carrental.vn', password: 'admin123' })
    });
    const { token } = await loginRes.json();
    
    console.log('Fetching Admin Analytics...');
    const res = await fetch(`${baseUrl}/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('Analytics Data:');
    console.log('- Total Users:', data.totalUsers);
    console.log('- Total Bookings:', data.totalBookings);
    console.log('- Revenue:', data.revenue);
    console.log('- Recent Activities:', data.recentActivities ? data.recentActivities.length : 0);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdminAnalytics();
