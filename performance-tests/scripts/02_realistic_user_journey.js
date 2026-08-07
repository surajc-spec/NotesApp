import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  // Realistic load profile: Ramp up to 50 VUs, hold for 1 minute, ramp down
  stages: [
    { duration: '20s', target: 50 }, // Ramp-up to 50 Virtual Users
    { duration: '1m', target: 50 },  // Sustained peak load (50 VUs)
    { duration: '10s', target: 0 },  // Graceful ramp-down
  ],

  // Strict SLA Thresholds
  thresholds: {
    // 95% of all HTTP requests must complete in under 300ms
    http_req_duration: ['p(95)<300'],
    // 99% of requests must complete under 1000ms
    'http_req_duration{scenario:default}': ['p(99)<1000'],
    // Overall error rate must stay below 0.1%
    http_req_failed: ['rate<0.001'],
  },
};

export default function () {
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

  // 1. PUBLIC VISITOR JOURNEY (40% Traffic Probability)
  group('01_Public_Visitor_Notes', function () {
    const res = http.get(`${BASE_URL}/api/notes/view-notes?branch=Information%20Technology&semester=5`);
    check(res, {
      'public notes status 200': (r) => r.status === 200,
      'public notes duration < 250ms': (r) => r.timings.duration < 250,
    });
    sleep(1.5); // Student scans notes list
  });

  // 2. QUESTION PAPERS SEARCH JOURNEY (40% Traffic Probability)
  group('02_Search_Question_Papers', function () {
    const res = http.get(`${BASE_URL}/api/question-papers/view-question-papers?branch=Information%20Technology&semester=5`);
    check(res, {
      'papers status 200': (r) => r.status === 200,
      'papers duration < 250ms': (r) => r.timings.duration < 250,
    });
    sleep(2); // Student reviews past papers
  });

  // 3. AUTHENTICATED PROFILE & VIEW PDF JOURNEY (20% Traffic Probability)
  group('03_Auth_And_View_PDF', function () {
    // Attempt authentication if credentials provided
    const testEmail = __ENV.TEST_EMAIL || 'student@test.com';
    const testPassword = __ENV.TEST_PASSWORD || 'password123';

    const loginPayload = JSON.stringify({ email: testEmail, password: testPassword });
    const loginParams = { headers: { 'Content-Type': 'application/json' } };

    const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, loginParams);

    // If test user exists and login passes
    if (loginRes.status === 200 && loginRes.json().token) {
      const token = loginRes.json().token;
      const authHeaders = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      // Fetch specific notes metadata with JWT
      const notesRes = http.get(`${BASE_URL}/api/notes/view-notes`, authHeaders);
      check(notesRes, {
        'authenticated view status 200': (r) => r.status === 200,
      });
    }

    sleep(1);
  });
}
