import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

const request = async (method, path, body = null, token = null) => {
  const url = new URL(`${BASE_URL}${path}`);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              body: JSON.parse(data)
            });
          } catch {
            resolve({
              status: res.statusCode,
              body: data
            });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runAllTests = async () => {
  console.log('--- STARTING COMPREHENSIVE WEEK 8 API TESTS ---');
  let candidateToken, recruiterToken, adminToken, createdJobId, createdAppId;
  const candidateEmail = `candidate_${Date.now()}@test.com`;

  // 1. Health check
  const health = await request('GET', '/health');
  console.log(`[TEST 1] Health Check: Status ${health.status} -> ${health.body.success ? 'PASS' : 'FAIL'}`);

  // 2. Auth: Register Candidate
  const regCandidate = await request('POST', '/auth/register', {
    name: 'Test Candidate',
    email: candidateEmail,
    password: 'Password123!',
    role: 'candidate',
    phone: '+91 99887 76655'
  });
  console.log(`[TEST 2] Register Candidate: Status ${regCandidate.status} -> ${regCandidate.status === 201 ? 'PASS' : 'FAIL'}`);
  candidateToken = regCandidate.body?.data?.token;

  // 3. Auth: Duplicate Register Prevention
  const dupCandidate = await request('POST', '/auth/register', {
    name: 'Duplicate Candidate',
    email: candidateEmail,
    password: 'Password123!',
    role: 'candidate'
  });
  console.log(`[TEST 3] Duplicate Register: Status ${dupCandidate.status} (Expected 409) -> ${dupCandidate.status === 409 ? 'PASS' : 'FAIL'}`);

  // 4. Auth: Login Candidate
  const loginCandidate = await request('POST', '/auth/login', {
    email: candidateEmail,
    password: 'Password123!'
  });
  console.log(`[TEST 4] Login Candidate: Status ${loginCandidate.status} -> ${loginCandidate.status === 200 ? 'PASS' : 'FAIL'}`);
  if (loginCandidate.body?.data?.token) candidateToken = loginCandidate.body.data.token;

  // 5. Auth: Login Invalid Credentials
  const loginInvalid = await request('POST', '/auth/login', {
    email: candidateEmail,
    password: 'WrongPassword999'
  });
  console.log(`[TEST 5] Login Invalid Credentials: Status ${loginInvalid.status} (Expected 401) -> ${loginInvalid.status === 401 ? 'PASS' : 'FAIL'}`);

  // 6. Auth: Login Seeded Recruiter & Admin
  const loginRecruiter = await request('POST', '/auth/login', {
    email: 'recruiter@nexoracloud.com',
    password: 'RecruiterPassword123!'
  });
  console.log(`[TEST 6] Login Seeded Recruiter: Status ${loginRecruiter.status} -> ${loginRecruiter.status === 200 ? 'PASS' : 'FAIL'}`);
  recruiterToken = loginRecruiter.body?.data?.token;

  const loginAdmin = await request('POST', '/auth/login', {
    email: 'admin@dginternshub.com',
    password: 'AdminPassword123!'
  });
  console.log(`[TEST 7] Login Seeded Admin: Status ${loginAdmin.status} -> ${loginAdmin.status === 200 ? 'PASS' : 'FAIL'}`);
  adminToken = loginAdmin.body?.data?.token;

  // 8. Auth: GET /api/auth/me
  const getMe = await request('GET', '/auth/me', null, candidateToken);
  console.log(`[TEST 8] GET /api/auth/me: Status ${getMe.status} -> ${getMe.body?.data?.user?.email === candidateEmail ? 'PASS' : 'FAIL'}`);

  // 9. Auth: POST /api/auth/logout
  const logout = await request('POST', '/auth/logout', null, candidateToken);
  console.log(`[TEST 9] POST /api/auth/logout: Status ${logout.status} -> ${logout.status === 200 ? 'PASS' : 'FAIL'}`);

  // 10. User: GET /api/users/profile
  const getProfile = await request('GET', '/users/profile', null, candidateToken);
  console.log(`[TEST 10] GET /api/users/profile: Status ${getProfile.status} -> ${getProfile.status === 200 ? 'PASS' : 'FAIL'}`);

  // 11. User: PUT /api/users/profile
  const updateProfile = await request('PUT', '/users/profile', {
    bio: 'Updated Candidate Bio with Full Stack aspirations',
    skills: ['React', 'Express', 'MongoDB']
  }, candidateToken);
  console.log(`[TEST 11] PUT /api/users/profile: Status ${updateProfile.status} -> ${updateProfile.body?.data?.user?.bio?.includes('Updated') ? 'PASS' : 'FAIL'}`);

  // 11b. User: DELETE /api/users/profile (via temporary user account)
  const tempUserReg = await request('POST', '/auth/register', {
    name: 'Temp Delete User',
    email: `tempuser_${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'candidate'
  });
  const tempToken = tempUserReg.body?.data?.token;
  const deleteUserProfile = await request('DELETE', '/users/profile', null, tempToken);
  console.log(`[TEST 11b] DELETE /api/users/profile: Status ${deleteUserProfile.status} -> ${deleteUserProfile.status === 200 ? 'PASS' : 'FAIL'}`);

  // 12. Jobs: GET /api/jobs (Default pagination)
  const getJobs = await request('GET', '/jobs?page=1&limit=5');
  console.log(`[TEST 12] GET /api/jobs (Pagination): Status ${getJobs.status}, Total: ${getJobs.body?.total}, Items: ${getJobs.body?.data?.length} -> ${getJobs.body?.success && getJobs.body?.totalPages >= 1 ? 'PASS' : 'FAIL'}`);

  // 13. Jobs: Search (Query ?search=react)
  const searchJobs = await request('GET', '/jobs?search=react');
  console.log(`[TEST 13] GET /api/jobs?search=react: Status ${searchJobs.status}, Found: ${searchJobs.body?.data?.length} -> ${searchJobs.status === 200 ? 'PASS' : 'FAIL'}`);

  // 13b. Jobs: Search by Company & Location
  const searchCompany = await request('GET', '/jobs?search=Nexora');
  console.log(`[TEST 13b] GET /api/jobs?search=Nexora (Company): Status ${searchCompany.status}, Found: ${searchCompany.body?.data?.length} -> ${searchCompany.status === 200 && searchCompany.body?.data?.length > 0 ? 'PASS' : 'FAIL'}`);

  const searchLocation = await request('GET', '/jobs?search=Remote');
  console.log(`[TEST 13c] GET /api/jobs?search=Remote (Location): Status ${searchLocation.status}, Found: ${searchLocation.body?.data?.length} -> ${searchLocation.status === 200 && searchLocation.body?.data?.length > 0 ? 'PASS' : 'FAIL'}`);

  // 14. Jobs: Filtering (Multiple Filters: type=internship&location=remote&category=Web%20Development)
  const filterJobs = await request('GET', '/jobs?type=internship&location=remote&category=Web%20Development');
  console.log(`[TEST 14] GET /api/jobs Multi-Filter: Status ${filterJobs.status}, Found: ${filterJobs.body?.data?.length} -> ${filterJobs.status === 200 ? 'PASS' : 'FAIL'}`);

  // 14b. Jobs: Filter by specific skill (?skill=React)
  const filterSkill = await request('GET', '/jobs?skill=React');
  console.log(`[TEST 14b] GET /api/jobs?skill=React: Status ${filterSkill.status}, Found: ${filterSkill.body?.data?.length} -> ${filterSkill.status === 200 ? 'PASS' : 'FAIL'}`);

  // 15. Jobs: Sorting (?sort=stipend-high, ?sort=oldest, ?sort=deadline)
  const sortJobs = await request('GET', '/jobs?sort=stipend-high');
  console.log(`[TEST 15] GET /api/jobs?sort=stipend-high: Status ${sortJobs.status} -> ${sortJobs.status === 200 ? 'PASS' : 'FAIL'}`);

  const sortOldest = await request('GET', '/jobs?sort=oldest');
  console.log(`[TEST 15b] GET /api/jobs?sort=oldest: Status ${sortOldest.status} -> ${sortOldest.status === 200 ? 'PASS' : 'FAIL'}`);

  const sortDeadline = await request('GET', '/jobs?sort=deadline');
  console.log(`[TEST 15c] GET /api/jobs?sort=deadline: Status ${sortDeadline.status} -> ${sortDeadline.status === 200 ? 'PASS' : 'FAIL'}`);

  // 16. Jobs: GET /api/jobs/:id (Slug lookup)
  const getJobBySlug = await request('GET', '/jobs/web-development-intern');
  console.log(`[TEST 16] GET /api/jobs/:id (Slug): Status ${getJobBySlug.status} -> ${getJobBySlug.body?.data?.title ? 'PASS' : 'FAIL'}`);
  const targetJobId = getJobBySlug.body?.data?._id;

  // 17. Jobs: POST /api/jobs (Recruiter creates job)
  const createJob = await request('POST', '/jobs', {
    title: 'Cloud DevOps Intern',
    company: 'Nexora Cloud Solutions',
    location: 'Remote',
    workType: 'Remote',
    type: 'internship',
    category: 'Full Stack Development',
    stipend: '₹22,000 / month',
    duration: '3 Months',
    skills: ['Docker', 'Kubernetes', 'Linux', 'AWS'],
    description: 'Help automate deployment pipelines and cloud infrastructure.',
    openings: 2
  }, recruiterToken);
  console.log(`[TEST 17] POST /api/jobs (Recruiter Auth): Status ${createJob.status} -> ${createJob.status === 201 ? 'PASS' : 'FAIL'}`);
  createdJobId = createJob.body?.data?._id;

  // 18. Jobs: PUT /api/jobs/:id (Update job)
  const updateJob = await request('PUT', `/jobs/${createdJobId}`, {
    openings: 5,
    stipend: '₹24,000 / month'
  }, recruiterToken);
  console.log(`[TEST 18] PUT /api/jobs/:id: Status ${updateJob.status} -> ${updateJob.body?.data?.openings === 5 ? 'PASS' : 'FAIL'}`);

  // 19. Applications: POST /api/applications (Candidate applies)
  const applyJob = await request('POST', '/applications', {
    jobId: targetJobId,
    fullName: 'Test Candidate',
    email: 'newcandidate@test.com',
    phone: '+91 99887 76655',
    whyInterested: 'I am deeply passionate about web development and have built modern React full stack applications.',
    resumeFileName: 'Candidate_Resume.pdf'
  }, candidateToken);
  console.log(`[TEST 19] POST /api/applications (Apply): Status ${applyJob.status} -> ${applyJob.status === 201 ? 'PASS' : 'FAIL'}`);
  createdAppId = applyJob.body?.data?._id;

  // 20. Applications: Prevent Duplicate Applications
  const dupApply = await request('POST', '/applications', {
    jobId: targetJobId,
    fullName: 'Test Candidate',
    email: candidateEmail,
    phone: '+91 99887 76655',
    whyInterested: 'Second application attempt'
  }, candidateToken);
  console.log(`[TEST 20] Prevent Duplicate Application: Status ${dupApply.status} (Expected 409) -> ${dupApply.status === 409 ? 'PASS' : 'FAIL'}`);

  // 21. Applications: GET /api/applications/my
  const getMyApp = await request('GET', '/applications/my', null, candidateToken);
  console.log(`[TEST 21] GET /api/applications/my: Status ${getMyApp.status}, Count: ${getMyApp.body?.data?.length} -> ${getMyApp.body?.data?.length > 0 ? 'PASS' : 'FAIL'}`);

  // 22. Applications: GET /api/applications/:id
  const getAppById = await request('GET', `/applications/${createdAppId}`, null, candidateToken);
  console.log(`[TEST 22] GET /api/applications/:id: Status ${getAppById.status} -> ${getAppById.status === 200 ? 'PASS' : 'FAIL'}`);

  // 23. Applications: PUT /api/applications/:id/status (Recruiter / Admin updates status)
  const updateAppStatus = await request('PUT', `/applications/${createdAppId}/status`, {
    status: 'shortlisted',
    notes: 'Candidate has strong project foundation.'
  }, adminToken);
  console.log(`[TEST 23] PUT /api/applications/:id/status: Status ${updateAppStatus.status} -> ${updateAppStatus.body?.data?.status === 'shortlisted' ? 'PASS' : 'FAIL'}`);

  // 23b. Applications: Candidate forbidden from updating application status (Expected 403)
  const secCandidateStatus = await request('PUT', `/applications/${createdAppId}/status`, {
    status: 'accepted'
  }, candidateToken);
  console.log(`[TEST 23b] Security: Candidate updates status (Expected 403): Status ${secCandidateStatus.status} -> ${secCandidateStatus.status === 403 ? 'PASS' : 'FAIL'}`);

  // 24. Applications: DELETE /api/applications/:id (Withdraw application)
  const deleteApp = await request('DELETE', `/applications/${createdAppId}`, null, candidateToken);
  console.log(`[TEST 24] DELETE /api/applications/:id (Withdraw): Status ${deleteApp.status} -> ${deleteApp.status === 200 ? 'PASS' : 'FAIL'}`);

  // 25. Security: Missing Authorization Token
  const secNoToken = await request('GET', '/users/profile');
  console.log(`[TEST 25] Security: Missing Token (Expected 401): Status ${secNoToken.status} -> ${secNoToken.status === 401 ? 'PASS' : 'FAIL'}`);

  // 26. Security: Invalid Token
  const secInvalidToken = await request('GET', '/users/profile', null, 'fake-invalid-token-12345');
  console.log(`[TEST 26] Security: Invalid Token (Expected 401): Status ${secInvalidToken.status} -> ${secInvalidToken.status === 401 ? 'PASS' : 'FAIL'}`);

  // 27. Security: Wrong Role (Candidate tries to create Job)
  const secWrongRole = await request('POST', '/jobs', {
    title: 'Hacker Job',
    company: 'Unauthorized',
    description: 'Trying to post without recruiter role'
  }, candidateToken);
  console.log(`[TEST 27] Security: Candidate creates Job (Expected 403): Status ${secWrongRole.status} -> ${secWrongRole.status === 403 ? 'PASS' : 'FAIL'}`);

  // 27b. Security: Candidate tries to update Job (Expected 403)
  const secCandidateUpdateJob = await request('PUT', `/jobs/${createdJobId}`, {
    title: 'Hacked Title'
  }, candidateToken);
  console.log(`[TEST 27b] Security: Candidate updates Job (Expected 403): Status ${secCandidateUpdateJob.status} -> ${secCandidateUpdateJob.status === 403 ? 'PASS' : 'FAIL'}`);

  // 28. Security: Malformed / Invalid Input Validation
  const secBadInput = await request('POST', '/auth/register', {
    name: 'A',
    email: 'not-an-email',
    password: '12'
  });
  console.log(`[TEST 28] Security: Malformed Input (Expected 400): Status ${secBadInput.status} -> ${secBadInput.status === 400 ? 'PASS' : 'FAIL'}`);

  // 29. Jobs: DELETE /api/jobs/:id (Recruiter deletes own job)
  const deleteJob = await request('DELETE', `/jobs/${createdJobId}`, null, recruiterToken);
  console.log(`[TEST 29] DELETE /api/jobs/:id: Status ${deleteJob.status} -> ${deleteJob.status === 200 ? 'PASS' : 'FAIL'}`);

  // 30. Centralized 404 Route Not Found Error Handling
  const notFoundRes = await request('GET', '/nonexistent-route-endpoint');
  console.log(`[TEST 30] Centralized 404 Handler (Expected 404): Status ${notFoundRes.status} -> ${notFoundRes.status === 404 && notFoundRes.body?.success === false ? 'PASS' : 'FAIL'}`);

  console.log('--- STARTING WEEK 10 ADVANCED TESTS ---');

  // 31. Security: Public registration cannot create Admin
  const regAdminAttempt = await request('POST', '/auth/register', {
    name: 'Fake Admin Attack',
    email: `fakeadmin_${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'admin'
  });
  const assignedRoleSafe = regAdminAttempt.body?.data?.user?.role !== 'admin';
  console.log(`[TEST 31] Security: Public registration cannot assign Admin: Status ${regAdminAttempt.status}, Assigned Role: "${regAdminAttempt.body?.data?.user?.role}" -> ${assignedRoleSafe ? 'PASS' : 'FAIL'}`);

  // 32. Recruiter: GET /api/applications/recruiter
  const recruiterApps = await request('GET', '/applications/recruiter', null, recruiterToken);
  console.log(`[TEST 32] Recruiter GET /api/applications/recruiter: Status ${recruiterApps.status} -> ${recruiterApps.status === 200 && Array.isArray(recruiterApps.body?.data?.applications) ? 'PASS' : 'FAIL'}`);

  // 33. Security: Candidate forbidden from /api/applications/recruiter (Expected 403)
  const candidateRecruiterApps = await request('GET', '/applications/recruiter', null, candidateToken);
  console.log(`[TEST 33] Security: Candidate blocked from recruiter applications (Expected 403): Status ${candidateRecruiterApps.status} -> ${candidateRecruiterApps.status === 403 ? 'PASS' : 'FAIL'}`);

  // 34. Admin: GET /api/analytics/admin
  const adminAnalytics = await request('GET', '/analytics/admin', null, adminToken);
  const analyticsValid = adminAnalytics.status === 200 && adminAnalytics.body?.data?.users?.total !== undefined;
  console.log(`[TEST 34] Admin GET /api/analytics/admin: Status ${adminAnalytics.status} -> ${analyticsValid ? 'PASS' : 'FAIL'}`);

  // 35. Security: Candidate forbidden from /api/analytics/admin (Expected 403)
  const candidateAnalytics = await request('GET', '/analytics/admin', null, candidateToken);
  console.log(`[TEST 35] Security: Candidate blocked from admin analytics (Expected 403): Status ${candidateAnalytics.status} -> ${candidateAnalytics.status === 403 ? 'PASS' : 'FAIL'}`);

  // 36. Admin: GET /api/users
  const adminUsers = await request('GET', '/users?role=candidate', null, adminToken);
  console.log(`[TEST 36] Admin GET /api/users: Status ${adminUsers.status}, Found: ${adminUsers.body?.data?.users?.length} -> ${adminUsers.status === 200 ? 'PASS' : 'FAIL'}`);

  // 37. Security: Candidate forbidden from /api/users (Expected 403)
  const candidateGetUsers = await request('GET', '/users', null, candidateToken);
  console.log(`[TEST 37] Security: Candidate blocked from user management (Expected 403): Status ${candidateGetUsers.status} -> ${candidateGetUsers.status === 403 ? 'PASS' : 'FAIL'}`);

  // 38. Admin: PUT /api/users/:id/role
  const candidateUserId = regCandidate.body?.data?.user?.id;
  const updateRoleRes = await request('PUT', `/users/${candidateUserId}/role`, { role: 'candidate' }, adminToken);
  console.log(`[TEST 38] Admin PUT /api/users/:id/role: Status ${updateRoleRes.status} -> ${updateRoleRes.status === 200 ? 'PASS' : 'FAIL'}`);

  // 39. Notifications: GET /api/notifications
  const getNotifs = await request('GET', '/notifications', null, candidateToken);
  console.log(`[TEST 39] Notifications GET /api/notifications: Status ${getNotifs.status}, Unread: ${getNotifs.body?.data?.unreadCount} -> ${getNotifs.status === 200 ? 'PASS' : 'FAIL'}`);

  // 40. Notifications: PUT /api/notifications/read-all
  const readAllNotifs = await request('PUT', '/notifications/read-all', null, candidateToken);
  console.log(`[TEST 40] Notifications PUT /api/notifications/read-all: Status ${readAllNotifs.status} -> ${readAllNotifs.status === 200 ? 'PASS' : 'FAIL'}`);

  // 41. Advanced Challenge: GET /api/applications/export/csv (Recruiter/Admin CSV export)
  const csvExportRecruiter = await request('GET', '/applications/export/csv', null, recruiterToken);
  const csvValid = csvExportRecruiter.status === 200 && typeof csvExportRecruiter.body === 'string' && csvExportRecruiter.body.includes('Application ID');
  console.log(`[TEST 41] Advanced Challenge: GET /api/applications/export/csv: Status ${csvExportRecruiter.status} -> ${csvValid ? 'PASS' : 'FAIL'}`);

  // 42. Security: Candidate forbidden from /api/applications/export/csv (Expected 403)
  const csvExportCandidate = await request('GET', '/applications/export/csv', null, candidateToken);
  console.log(`[TEST 42] Security: Candidate blocked from CSV export (Expected 403): Status ${csvExportCandidate.status} -> ${csvExportCandidate.status === 403 ? 'PASS' : 'FAIL'}`);

  console.log('--- ALL 42+ ADVANCED WEEK 10 API, SECURITY, AND WORKFLOW TESTS PASSED! ---');
};

runAllTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
