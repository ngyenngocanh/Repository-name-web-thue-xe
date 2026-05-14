async function testRegistration() {
  const baseUrl = 'http://localhost:5000/api';
  const email = `testuser_${Date.now()}@example.com`;
  
  try {
    console.log(`Registering new user: ${email}...`);
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User',
        email: email,
        password: 'password123',
        phone: '0987654321',
        dateOfBirth: '1995-01-01',
        role: 'user'
      })
    });
    
    const regData = await regRes.json();
    if (regRes.ok) {
      console.log('Registration successful!');
      const token = regData.token;
      
      // Now test Booking
      console.log('Testing Booking Creation...');
      const bookingRes = await fetch(`${baseUrl}/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          car: '69e320c854466c5f82390527', // Mazda 6
          rentalType: 'self_drive',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          pickupTime: '09:00',
          returnTime: '17:00',
          pickupLocation: 'Hồ Chí Minh',
          returnLocation: 'Hồ Chí Minh',
          payment: {
            method: 'cash'
          }
        })
      });
      
      const bookingData = await bookingRes.json();
      if (bookingRes.ok) {
        console.log('Booking successful! Booking ID:', bookingData.booking.id || bookingData.booking._id);
      } else {
        console.error('Booking failed:', JSON.stringify(bookingData, null, 2));
      }
    } else {
      console.error('Registration failed:', regData);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRegistration();
