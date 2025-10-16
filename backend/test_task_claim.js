const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test task claim endpoint
async function testTaskClaim() {
  try {
    console.log('🧪 Testing task claim endpoint...');
    
    // First, let's try to login to get a valid token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed, creating test user first...');
      
      // Try to register a test user
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
      
      console.log('📝 Registration response:', registerResponse.data);
      
      if (registerResponse.data.success) {
        // Try login again
        const retryLogin = await axios.post(`${BASE_URL}/auth/login`, {
          email: 'test@example.com',
          password: 'password123'
        });
        
        if (retryLogin.data.success) {
          console.log('✅ Login successful after registration');
        }
      }
    } else {
      console.log('✅ Login successful');
    }
    
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    
    if (!token) {
      console.log('❌ No token received from login');
      return;
    }
    
    console.log('🔑 Token received, testing task claim...');
    
    // Test claiming reward for SOCIAL_001
    const claimResponse = await axios.post(
      `${BASE_URL}/tasks/SOCIAL_001/claim`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Task claim successful:', claimResponse.data);
    
  } catch (error) {
    console.error('❌ Error during task claim test:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    console.error('Full error:', error);
  }
}

// Run the test
testTaskClaim();