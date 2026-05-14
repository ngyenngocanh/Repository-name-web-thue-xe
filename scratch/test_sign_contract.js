async function testContractSigning() {
  const baseUrl = 'http://127.0.0.1:5000/api';
  const bookingId = '6a0482ac65e3196307560753';
  const renterEmail = 'testuser_1778680492062@example.com';
  
  try {
    console.log(`Logging in as renter ${renterEmail}...`);
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: renterEmail, password: 'password123' })
    });
    const { token } = await loginRes.json();
    
    console.log(`Signing contract for booking ${bookingId}...`);
    const res = await fetch(`${baseUrl}/contracts/sign/${bookingId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        signature: 'Nguyen Ngoc Anh',
        signedAt: new Date().toISOString()
      })
    });
    const data = await res.json();
    console.log('Sign Result:', data.message);
    
    if (res.ok) {
      console.log('Fetching contract to verify signature...');
      const getRes = await fetch(`${baseUrl}/contracts/booking/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contract = await getRes.json();
      console.log('Renter Signed:', contract.renterSignature?.signed);
      console.log('Signature Name:', contract.renterSignature?.signature);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testContractSigning();
