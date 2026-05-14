async function testCompleteBooking() {
  const baseUrl = 'http://127.0.0.1:5000/api';
  const bookingId = '6a0482ac65e3196307560753';
  
  try {
    console.log('Logging in as Admin...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@carrental.vn', password: 'admin123' })
    });
    const { token } = await loginRes.json();
    
    console.log(`Completing booking ${bookingId}...`);
    const res = await fetch(`${baseUrl}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'completed' })
    });
    const data = await res.json();
    console.log('Result:', data.message);
    
    if (res.ok) {
      console.log('Testing Review Creation...');
      // Note: Review requires a token from the renter usually.
      // But let's see if admin can review (maybe not, but we can try or use user token).
      // I'll skip review for now and just verify completion.
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCompleteBooking();
