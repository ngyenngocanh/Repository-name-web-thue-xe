async function testContractGeneration() {
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
    
    console.log(`Generating contract for booking ${bookingId}...`);
    const res = await fetch(`${baseUrl}/contracts/generate/${bookingId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('Result:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('Contract File:', data.contract.fileName);
      console.log('Fetching contract by booking ID...');
      const getRes = await fetch(`${baseUrl}/contracts/booking/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const getData = await getRes.json();
      console.log('Contract Status:', getData.status);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testContractGeneration();
