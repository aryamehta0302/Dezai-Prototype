import http from 'k6/http';
import { check, sleep } from 'k6';

// Define the three load profiles
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],      // Less than 10% errors under smoke/realistic
  },
  scenarios: {
    // Run smoke test by default. To run other profiles, pass the scenario name.
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '10s',
    },
    realistic: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
    },
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 0 },
      ],
    },
  },
};

const BASE_URL = 'http://127.0.0.1:3001/api';

// Setup: login and obtain token
export function setup() {
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'student@dezai.edu',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const body = JSON.parse(loginRes.body);
  return { token: body.accessToken };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // 1. Start Attempt
  const startRes = http.post(
    `${BASE_URL}/assessments/attempts/start`,
    JSON.stringify({ assessmentId: 'course-1-roots-assessment-placeholder-id-or-real' }),
    { headers }
  );

  // Assert rate-limit (expecting 429 if threshold is hit, or 201/200/400/404 otherwise)
  check(startRes, {
    'is not 500': (r) => r.status !== 500,
    'rate limit enforced (429)': (r) => r.status === 429,
    'success or expected validation error': (r) => r.status === 201 || r.status === 400 || r.status === 404,
  });

  if (startRes.status === 201) {
    const attempt = JSON.parse(startRes.body);
    const attemptId = attempt.id;

    // 2. Auto-save answers
    const saveRes = http.post(
      `${BASE_URL}/assessments/attempts/${attemptId}/auto-save`,
      JSON.stringify({ answers: {} }),
      { headers }
    );
    check(saveRes, {
      'autosave status is 201 or 429': (r) => r.status === 201 || r.status === 429,
    });

    sleep(1);

    // 3. Submit attempt
    const submitRes = http.post(
      `${BASE_URL}/assessments/attempts/${attemptId}/submit`,
      JSON.stringify({}),
      { headers }
    );
    check(submitRes, {
      'submit status is 201 or 429': (r) => r.status === 201 || r.status === 429,
    });
  }

  sleep(2);
}
