import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. CONFIGURATION OPTIONS
export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 VUs over 10s
    { duration: '30s', target: 20 }, // Hold steady at 20 VUs for 30s
    { duration: '10s', target: 0 },  // Ramp down to 0 VUs over 10s
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // P95 latency must be under 300ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

// 2. SETUP PHASE (Runs ONCE before Virtual Users spawn to authenticate)
export function setup() {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
  const email = __ENV.TEST_EMAIL || 'perfstudent@test.com';
  const password = __ENV.TEST_PASSWORD || 'password123';

  const payload = JSON.stringify({ email, password });
  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);

  if (res.status !== 200 || !res.json().token) {
    console.error('Setup authentication failed:', res.body);
  }

  return { token: res.json().token };
}

// 3. VIRTUAL USER WORKLOAD (Runs in parallel loops for all 20 VUs)
export default function (data) {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(`${BASE_URL}/api/notes/view-notes`, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has notes array': (r) => r.json().notes !== undefined,
    'response duration < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1); // Realistic student think time
}
