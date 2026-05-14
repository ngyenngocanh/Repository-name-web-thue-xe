async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@carrental.vn',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Login successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user.fullName, '(', data.user.role, ')');
    } else {
      console.error('Login failed:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
