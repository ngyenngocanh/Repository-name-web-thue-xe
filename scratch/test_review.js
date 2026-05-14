async function testReview() {
  const baseUrl = 'http://127.0.0.1:5000/api';
  const email = 'testuser_1778680492062@example.com';
  const bookingId = '6a0482ac65e3196307560753';
  const carId = '69e320c854466c5f82390527';
  
  try {
    console.log(`Logging in as ${email}...`);
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' })
    });
    const { token } = await loginRes.json();
    
    console.log('Fetching car reviews...');
    const carRes = await fetch(`${baseUrl}/reviews/car/${carId}`);
    const carData = await carRes.json();
    console.log('Reviews count:', carData.reviews ? carData.reviews.length : 0);
    if (carData.reviews && carData.reviews.length > 0) {
      console.log('Sample review comment:', carData.reviews[0].comment);
      console.log('Reviewer:', carData.reviews[0].reviewer?.fullName);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testReview();
