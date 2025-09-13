// Simple test script to verify API integration
// Run with: node test-api.js

const API_BASE_URL = 'http://localhost:5001/api';

async function testAPI() {
  console.log('🧪 Testing FarmKeeper API Integration...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test 2: Auth status (should fail without token)
    console.log('\n2. Testing auth status (without token)...');
    try {
      const authResponse = await fetch(`${API_BASE_URL}/auth/status`);
      const authData = await authResponse.json();
      console.log('Auth status:', authData);
    } catch (error) {
      console.log('❌ Auth status failed (expected):', error.message);
    }

    // Test 3: Test CORS
    console.log('\n3. Testing CORS...');
    try {
      const corsResponse = await fetch(`${API_BASE_URL}/auth/status`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });
      console.log('✅ CORS preflight:', corsResponse.status);
    } catch (error) {
      console.log('❌ CORS test failed:', error.message);
    }

    console.log('\n🎉 API integration test completed!');
    console.log('\nNext steps:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Start the frontend: cd farmkeeper && npm run dev');
    console.log('3. Test the login flow in the browser');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the backend is running on port 5001');
  }
}

testAPI();
