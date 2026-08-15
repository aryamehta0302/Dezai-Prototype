import http from 'k6/http';
import { check, sleep } from 'k6';

// Define the three load profiles
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% of queries must complete under 1.5s
    http_req_failed: ['rate<0.05'],     // Less than 5% failure rate
  },
  scenarios: {
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

// Setup: login two different roles (student and faculty) to test student widgets and faculty widgets
export function setup() {
  const studentLoginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'student@dezai.edu',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const facultyLoginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'faculty@dezai.edu',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  return {
    studentToken: JSON.parse(studentLoginRes.body).accessToken,
    facultyToken: JSON.parse(facultyLoginRes.body).accessToken,
  };
}

export default function (data) {
  const studentHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.studentToken}`,
  };

  const facultyHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.facultyToken}`,
  };

  // 1. GET /api/leaderboards/students
  const studentLeaderboard = http.get(`${BASE_URL}/leaderboards/students`, { headers: studentHeaders });
  check(studentLeaderboard, {
    'student leaderboard is 200': (r) => r.status === 200,
  });

  // 2. GET /api/leaderboards/universities
  const universityLeaderboard = http.get(`${BASE_URL}/leaderboards/universities`, { headers: studentHeaders });
  check(universityLeaderboard, {
    'university leaderboard is 200': (r) => r.status === 200,
  });

  // 3. GET /api/leaderboards/programs
  const programLeaderboard = http.get(`${BASE_URL}/leaderboards/programs`, { headers: studentHeaders });
  check(programLeaderboard, {
    'program leaderboard is 200': (r) => r.status === 200,
  });

  // 4. GET /api/leaderboards/widgets/student
  const studentWidget = http.get(`${BASE_URL}/leaderboards/widgets/student`, { headers: studentHeaders });
  check(studentWidget, {
    'student widget is 200': (r) => r.status === 200,
  });

  // 5. GET /api/leaderboards/widgets/faculty
  const facultyWidget = http.get(`${BASE_URL}/leaderboards/widgets/faculty`, { headers: facultyHeaders });
  check(facultyWidget, {
    'faculty widget is 200': (r) => r.status === 200,
  });

  sleep(1);
}
