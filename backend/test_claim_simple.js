const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testClaimEndpoint() {
  try {
    console.log('🧪 Testing task claim endpoint with fresh user...\n');
    
    // Step 1: Register a new user
    console.log('📝 Step 1: Registering new user...');
    const registerData = {
      email: `test${Date.now()}@example.com`, // Unique email
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerResponse.data);
    
    // Step 2: Login with the new user
    console.log('\n🔑 Step 2: Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    
    console.log('✅ Login successful:', loginResponse.data);
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    
    if (!token) {
      throw new Error('No token received from login');
    }
    
    // Step 3: Complete the task first
    console.log('\n✅ Step 3: Completing task...');
    const completeResponse = await axios.post(
      `${BASE_URL}/tasks/SOCIAL_001/complete`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Task completed:', completeResponse.data);
    
    // Step 4: Test claiming reward for SOCIAL_001
    console.log('\n🎯 Step 4: Testing task claim...');
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
    console.error('\n❌ Error during test:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      // If it's a 500 error, let's see if there are more details
      if (error.response.status === 500) {
        console.error('\n🔍 This is the 500 error we\'re investigating!');
        console.error('Error details:', error.response.data);
      }
    } else if (error.request) {
      console.error('Request error - no response received');
    } else {
      console.error('Error message:', error.message);
    }
  }
}

// Run the test
testClaimEndpoint();