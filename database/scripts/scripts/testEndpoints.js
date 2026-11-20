const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../src/config/db');
const { loadDataset } = require('../src/data/gtfsLoader');
const app = require('../src/app');
const http = require('http');

async function testBackend() {
  await connectDB();
  loadDataset();

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5099, resolve));
  console.log('Test server running on port 5099');

  const baseUrl = 'http://localhost:5099/api';

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
    console.log('1. Health check:', healthRes.success ? 'PASS' : 'FAIL');

    // 2. Auth login with Aarav Demo
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aarav.demo@example.test',
        password: 'DemoPassword123!'
      })
    }).then(r => r.json());
    console.log('2. Login Aarav:', loginRes.success ? 'PASS' : 'FAIL', loginRes.user?.name, 'Token:', !!loginRes.token);

    const token = loginRes.token;

    // 3. Get profile
    const profileRes = await fetch(`${baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    console.log('3. Profile check:', profileRes.success ? 'PASS' : 'FAIL', profileRes.user?.email);

    // 4. Notifications
    const notifRes = await fetch(`${baseUrl}/passenger/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json());
    console.log('4. Notifications check:', notifRes.success ? 'PASS' : 'FAIL', 'Count:', notifRes.count);

    // 5. Submit feedback
    const feedbackRes = await fetch(`${baseUrl}/passenger/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        rating: 5,
        message: 'Great digital journey experience!',
        busNumber: 'DEMO-SOL-001'
      })
    }).then(r => r.json());
    console.log('5. Feedback submission:', feedbackRes.success ? 'PASS' : 'FAIL');

    // 6. Bus search (Solapur to Pune)
    const searchRes = await fetch(`${baseUrl}/buses/search?source=Solapur&destination=Pune`).then(r => r.json());
    console.log('6. Bus search Solapur->Pune:', searchRes.success ? 'PASS' : 'FAIL', 'Found:', searchRes.count);

    // Pick first trip
    if (searchRes.data && searchRes.data.length > 0) {
      const tripId = searchRes.data[0].id || searchRes.data[0].tripId;
      const encodedId = encodeURIComponent(tripId);

      // 7. Bus details
      const detailsRes = await fetch(`${baseUrl}/buses/${encodedId}`).then(r => r.json());
      console.log('7. Bus details for trip', tripId, ':', detailsRes.success ? 'PASS' : 'FAIL', 'Stops:', detailsRes.data?.stops?.length);

      // 8. Live tracking
      const trackRes = await fetch(`${baseUrl}/buses/${encodedId}/tracking`).then(r => r.json());
      console.log('8. Live tracking for trip', tripId, ':', trackRes.success ? 'PASS' : 'FAIL', 'Speed:', trackRes.data?.currentSpeed);

      // 9. ETA
      const etaRes = await fetch(`${baseUrl}/buses/${encodedId}/eta`).then(r => r.json());
      console.log('9. ETA for trip', tripId, ':', etaRes.success ? 'PASS' : 'FAIL', 'Status:', etaRes.data?.etaStatus);

      // 10. Alternatives
      const altRes = await fetch(`${baseUrl}/buses/alternatives?source=Solapur&destination=Pune&selectedTripId=${encodedId}`).then(r => r.json());
      console.log('10. Alternatives for trip', tripId, ':', altRes.success ? 'PASS' : 'FAIL', 'Alternatives count:', altRes.count);
    }

  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

testBackend();
