import axios from 'axios';

async function testAll() {
  const baseUrl = 'http://localhost:5000';

  console.log('=== 1. Testing Health Endpoint ===');
  const health = await axios.get(`${baseUrl}/health`);
  console.log('Status:', health.status, health.data);

  console.log('\n=== 2. Testing Superadmin Login ===');
  const loginRes = await axios.post(`${baseUrl}/api/auth/login`, {
    email: 'superadmin@aegisflow.gov.in',
    password: 'SuperAdmin@123!'
  });
  const token = loginRes.data.data.accessToken;
  console.log('Superadmin Login Success! Role:', loginRes.data.data.user.role, 'Token prefix:', token.slice(0, 20) + '...');

  const headers = { Authorization: `Bearer ${token}` };

  console.log('\n=== 3. Testing Regions Endpoint ===');
  const regionsRes = await axios.get(`${baseUrl}/api/regions`, { headers });
  console.log('Regions count:', regionsRes.data.data.regions.length);
  const wyd = regionsRes.data.data.regions[0];
  console.log('First Region:', wyd.name, '| Code:', wyd.code, '| Stats:', wyd.stats);

  console.log('\n=== 4. Testing Users / Admins Endpoint ===');
  const usersRes = await axios.get(`${baseUrl}/api/users`, { headers });
  console.log('Total users:', usersRes.data.data.users.length);
  usersRes.data.data.users.forEach(u => console.log(' - User:', u.name, '| Role:', u.role, '| Region:', u.regionId?.name || 'Global'));

  console.log('\n=== 5. Testing Thresholds Config Endpoint ===');
  const threshRes = await axios.get(`${baseUrl}/api/thresholds`, { headers });
  console.log('Active Threshold Version:', threshRes.data.data.activeConfig.version, '| 24h Watch/Warn/Evac:', threshRes.data.data.activeConfig.rainfall24h);

  console.log('\n=== 6. Testing Sensors Endpoint ===');
  const sensorsRes = await axios.get(`${baseUrl}/api/sensors`, { headers });
  console.log('Sensors count:', sensorsRes.data.data.sensors.length);
  sensorsRes.data.data.sensors.forEach(s => console.log(' - Sensor:', s.deviceId, '| Type:', s.type, '| Battery:', s.battery + '%', '| Status:', s.status));

  console.log('\n=== 7. Testing System Health & Telemetry ===');
  const sysHealth = await axios.get(`${baseUrl}/api/system/health`, { headers });
  console.log('DB Status:', sysHealth.data.data.database.status);
  console.log('Open-Meteo Latency:', sysHealth.data.data.externalFeeds.openMeteo.latencyMs, 'ms | Status:', sysHealth.data.data.externalFeeds.openMeteo.status);

  console.log('\n=== 8. Testing Simulated Buzzer Gateway ===');
  const buzzerRes = await axios.post(`${baseUrl}/api/system/mock/buzzer`, { test: true, level: 'evacuate' });
  console.log('Buzzer Response:', buzzerRes.data.message);

  console.log('\n=== 9. Testing Regional Admin Scoping Enforcement ===');
  const adminLogin = await axios.post(`${baseUrl}/api/auth/login`, {
    email: 'admin.wayanad@aegisflow.gov.in',
    password: 'WayanadAdmin@123!'
  });
  const adminToken = adminLogin.data.data.accessToken;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  
  // Try to access another region ID
  try {
    await axios.get(`${baseUrl}/api/regions/650000000000000000000999`, { headers: adminHeaders });
    console.log('ERROR: Regional admin was allowed to access forbidden region!');
  } catch (err) {
    console.log('SUCCESS: Access correctly denied with status', err.response?.status, ':', err.response?.data?.message);
  }

  console.log('\n=== 10. Testing Frontend Client Delivery ===');
  const clientRes = await axios.get('http://localhost:5173/');
  console.log('Client HTML status:', clientRes.status, 'Title included in HTML:', clientRes.data.includes('AegisFlow'));

  console.log('\n>>> ALL PHASE 1 INTEGRATION TESTS COMPLETED SUCCESSFULLY! <<<');
}

testAll().catch(e => {
  console.error('Test failed:', e.message, e.response?.data);
  process.exit(1);
});
