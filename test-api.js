import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('Testing API endpoints...\n');

  try {
    // Test server connection
    console.log('1. Testing server connection...');
    const healthResponse = await fetch(`${BASE_URL}/api/protected`);
    console.log(`   Status: ${healthResponse.status} (Expected: 401 - No token provided)`);

    // Test user registration
    console.log('\n2. Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123'
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.json();
    console.log(`   Status: ${registerResponse.status}`);
    console.log(`   Response: ${JSON.stringify(registerResult, null, 2)}`);

    // Test user login (if registration succeeded)
    if (registerResponse.status === 201) {
      console.log('\n3. Testing user login...');
      const loginData = {
        email: 'test@example.com',
        password: 'testpass123'
      };

      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const loginResult = await loginResponse.json();
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Response: ${JSON.stringify(loginResult, null, 2)}`);

      // Test protected route with token
      if (loginResponse.status === 200 && loginResult.token) {
        console.log('\n4. Testing protected route with token...');
        const protectedResponse = await fetch(`${BASE_URL}/api/protected`, {
          headers: {
            'Authorization': `Bearer ${loginResult.token}`
          }
        });

        const protectedResult = await protectedResponse.json();
        console.log(`   Status: ${protectedResponse.status}`);
        console.log(`   Response: ${JSON.stringify(protectedResult, null, 2)}`);
      }

      // Test protected route with token
      if (loginResponse.status === 200 && loginResult.token) {
        console.log('\n4. Testing protected route with token...');
        const protectedResponse = await fetch(`${BASE_URL}/api/protected`, {
          headers: {
            'Authorization': `Bearer ${loginResult.token}`
          }
        });

        const protectedResult = await protectedResponse.json();
        console.log(`   Status: ${protectedResponse.status}`);
        console.log(`   Response: ${JSON.stringify(protectedResult, null, 2)}`);
      }
    }

    // Test with sample user
    console.log('\n5. Testing login with sample user...');
    const sampleLoginData = {
      email: 'admin@shop.com',
      password: 'admin123'
    };

    const sampleLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sampleLoginData)
    });

    const sampleLoginResult = await sampleLoginResponse.json();
    console.log(`   Status: ${sampleLoginResponse.status}`);
    console.log(`   Response: ${JSON.stringify(sampleLoginResult, null, 2)}`);

    // Test category creation with file uploads
    if (sampleLoginResponse.status === 200 && sampleLoginResult.token) {
      console.log('\n6. Testing category creation with file uploads...');

      // Create form data with actual files
      const formData = new FormData();
      formData.append('name', 'Test Category Files');
      formData.append('price', '99.99');
      formData.append('size', 'Medium');
      formData.append('material', 'Cotton');
      formData.append('color', 'Blue');

      // Create dummy image files (small PNG data)
      const dummyImage1 = new Blob(['dummy image data 1'], { type: 'image/png' });
      const dummyImage2 = new Blob(['dummy image data 2'], { type: 'image/jpeg' });

      formData.append('images', dummyImage1, 'test-image1.png');
      formData.append('images', dummyImage2, 'test-image2.jpg');

      const categoryResponse = await fetch(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sampleLoginResult.token}`
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData
      });

      const categoryResult = await categoryResponse.json();
      console.log(`   Status: ${categoryResponse.status}`);
      console.log(`   Response: ${JSON.stringify(categoryResult, null, 2)}`);

      // Test get categories
      console.log('\n7. Testing get categories...');
      const getCategoriesResponse = await fetch(`${BASE_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${sampleLoginResult.token}`
        }
      });

      const getCategoriesResult = await getCategoriesResponse.json();
      console.log(`   Status: ${getCategoriesResponse.status}`);
      console.log(`   Response: ${JSON.stringify(getCategoriesResult, null, 2)}`);
    }

  } catch (error) {
    console.error('API test failed:', error.message);
    console.log('\nPossible issues:');
    console.log('- Server is not running (run: npm run dev)');
    console.log('- Database is not set up (run: npm run setup-db)');
    console.log('- MySQL server is not running');
  }
}

// Run the test
testAPI();