const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testTransactionsAPI() {
  try {
    console.log('🧪 Testing transactions API with fresh user...\n');

    // Step 1: Register a new user
    console.log('📝 Step 1: Registering new user...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!'
    });
    console.log('✅ Registration successful:', registerResponse.data);

    // Step 2: Login
    console.log('\n🔑 Step 2: Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: registerResponse.data.data.user.email,
      password: 'TestPassword123!'
    });
    console.log('✅ Login successful:', loginResponse.data);

    const token = loginResponse.data.data.token;

    // Step 3: Complete a task
    console.log('\n✅ Step 3: Completing task...');
    const completeTaskResponse = await axios.post(`${BASE_URL}/api/tasks/SOCIAL_001/complete`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Task completed:', completeTaskResponse.data);

    // Step 4: Claim task reward
    console.log('\n🎯 Step 4: Claiming task reward...');
    const claimResponse = await axios.post(`${BASE_URL}/api/tasks/SOCIAL_001/claim`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Task claim successful:', claimResponse.data);

    // Step 5: Get transactions to verify taskId is included
    console.log('\n📊 Step 5: Getting transactions...');
    const transactionsResponse = await axios.get(`${BASE_URL}/api/wallet/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Transactions retrieved:', JSON.stringify(transactionsResponse.data, null, 2));

    // Check if taskId is present in task reward transactions
    const transactions = transactionsResponse.data.data.transactions;
    const taskRewardTransaction = transactions.find(tx => tx.type === 'bonus' && tx.taskId);
    
    if (taskRewardTransaction) {
      console.log('\n🎉 SUCCESS: Task reward transaction found with taskId:', taskRewardTransaction.taskId);
      console.log('Transaction details:', JSON.stringify(taskRewardTransaction, null, 2));
    } else {
      console.log('\n❌ ISSUE: No task reward transaction found with taskId');
      console.log('All transactions:', JSON.stringify(transactions, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testTransactionsAPI();
