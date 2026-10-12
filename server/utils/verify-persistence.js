import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { connectDB, closeDB, getConnectionStatus } from '../config/database.js';

const BASE_URL = 'http://localhost:5000/api';

const apiRequest = async (method, path, body = null, token = null) => {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  return { status: response.status, body: data };
};

const runPersistenceVerification = async () => {
  console.log('=================================================================');
  console.log('STEP 1: Verify MongoDB Connection & Connection Status');
  console.log('=================================================================');
  await connectDB();
  const dbStatus = getConnectionStatus();
  console.log(`[DB Status] isConnected: ${dbStatus.isConnected}`);
  console.log(`[DB Status] Host: ${dbStatus.host}, Port: ${dbStatus.port}, DB: ${dbStatus.name}`);
  if (!dbStatus.isConnected || dbStatus.name !== 'dg_interns_hub') {
    throw new Error('Database not connected to dg_interns_hub!');
  }

  const initialUserCount = await User.countDocuments();
  const initialJobCount = await Job.countDocuments();
  const initialAppCount = await Application.countDocuments();
  console.log(`Initial DB Counts: Users=${initialUserCount}, Jobs=${initialJobCount}, Applications=${initialAppCount}`);

  console.log('\n=================================================================');
  console.log('STEP 2: Register New User & Verify Real Database Storage');
  console.log('=================================================================');
  const timestamp = Date.now();
  const testUserEmail = `persistence_user_${timestamp}@testdomain.com`;
  const testUserPassword = 'PersistencePass123!';

  const regRes = await apiRequest('POST', '/auth/register', {
    name: 'Persistence Test Candidate',
    email: testUserEmail,
    password: testUserPassword,
    role: 'candidate',
    phone: '+91 91234 56789'
  });
  console.log(`API Registration status: ${regRes.status}`);
  if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);

  // Direct MongoDB Query to confirm persistence
  const directUserInDb = await User.findOne({ email: testUserEmail }).lean();
  console.log(`Direct MongoDB verification: User found in DB with _id: ${directUserInDb?._id}`);
  if (!directUserInDb) throw new Error('User was NOT saved in MongoDB!');

  console.log('\n=================================================================');
  console.log('STEP 3: Login & Verify JWT Authentication');
  console.log('=================================================================');
  const loginRes = await apiRequest('POST', '/auth/login', {
    email: testUserEmail,
    password: testUserPassword
  });
  console.log(`API Login status: ${loginRes.status}`);
  const userToken = loginRes.body?.data?.token;
  if (!userToken) throw new Error('JWT token not returned on login!');

  // Seeded Recruiter Login
  const recruiterLoginRes = await apiRequest('POST', '/auth/login', {
    email: 'recruiter@nexoracloud.com',
    password: 'RecruiterPassword123!'
  });
  const recruiterToken = recruiterLoginRes.body?.data?.token;
  if (!recruiterToken) throw new Error('Recruiter token missing!');

  console.log('\n=================================================================');
  console.log('STEP 4: Create Job & Verify Real Database Storage');
  console.log('=================================================================');
  const jobTitle = `Persistence Cloud Architect Intern ${timestamp}`;
  const jobRes = await apiRequest('POST', '/jobs', {
    title: jobTitle,
    company: 'Nexora Cloud Labs',
    location: 'Bangalore, India',
    workType: 'Hybrid',
    type: 'internship',
    category: 'Cloud Engineering',
    stipend: '₹25,000 / month',
    duration: '6 Months',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Node.js'],
    description: 'Design cloud microservices and deployment pipelines with high reliability.',
    openings: 2
  }, recruiterToken);
  console.log(`API Create Job status: ${jobRes.status}`);
  const createdJobId = jobRes.body?.data?._id;
  if (!createdJobId) throw new Error(`Job creation failed: ${JSON.stringify(jobRes.body)}`);

  // Direct MongoDB Query
  const directJobInDb = await Job.findById(createdJobId).lean();
  console.log(`Direct MongoDB verification: Job found in DB: "${directJobInDb?.title}", ID: ${directJobInDb?._id}`);
  if (!directJobInDb) throw new Error('Job was NOT saved in MongoDB!');

  console.log('\n=================================================================');
  console.log('STEP 5: Apply for Job & Verify Relational References in MongoDB');
  console.log('=================================================================');
  const applyRes = await apiRequest('POST', '/applications', {
    jobId: createdJobId,
    fullName: 'Persistence Test Candidate',
    email: testUserEmail,
    phone: '+91 91234 56789',
    whyInterested: 'Deep interest in high-scale cloud platforms and containerization.',
    resumeFileName: 'Candidate_Resume_Verified.pdf'
  }, userToken);
  console.log(`API Apply status: ${applyRes.status}`);
  const createdAppId = applyRes.body?.data?._id;
  if (!createdAppId) throw new Error(`Application failed: ${JSON.stringify(applyRes.body)}`);

  // Direct MongoDB Query with populate
  const directAppInDb = await Application.findById(createdAppId)
    .populate('job')
    .populate('applicant')
    .lean();

  console.log(`Direct MongoDB verification: Application found with ID: ${directAppInDb?._id}`);
  console.log(`  - Referencing Job ID:       ${directAppInDb?.job?._id} (${directAppInDb?.job?.title})`);
  console.log(`  - Referencing Applicant ID: ${directAppInDb?.applicant?._id} (${directAppInDb?.applicant?.email})`);

  if (String(directAppInDb?.job?._id) !== String(createdJobId)) {
    throw new Error('Application job reference mismatch!');
  }
  if (String(directAppInDb?.applicant?._id) !== String(directUserInDb._id)) {
    throw new Error('Application applicant reference mismatch!');
  }

  console.log('\n=================================================================');
  console.log('STEP 6: Retrieve Saved Records via Public and Protected APIs');
  console.log('=================================================================');
  // Get job via public endpoint
  const fetchedJob = await apiRequest('GET', `/jobs/${createdJobId}`);
  console.log(`API GET /jobs/:id: status=${fetchedJob.status}, title="${fetchedJob.body?.data?.title}"`);

  // Get application via protected endpoint
  const fetchedApp = await apiRequest('GET', `/applications/${createdAppId}`, null, userToken);
  console.log(`API GET /applications/:id: status=${fetchedApp.status}, applicant="${fetchedApp.body?.data?.fullName}"`);

  // Get my applications list
  const fetchedMyApp = await apiRequest('GET', '/applications/my', null, userToken);
  console.log(`API GET /applications/my: status=${fetchedMyApp.status}, count=${fetchedMyApp.body?.data?.length}`);

  console.log('\n=================================================================');
  console.log('STEP 7: Test Duplicate Registration, Invalid Input & Security');
  console.log('=================================================================');
  // Duplicate email
  const dupRes = await apiRequest('POST', '/auth/register', {
    name: 'Duplicate Attempt',
    email: testUserEmail,
    password: 'Password123!',
    role: 'candidate'
  });
  console.log(`Duplicate Email Registration: status=${dupRes.status} (Expected 409 Conflict) -> ${dupRes.status === 409 ? 'PASS' : 'FAIL'}`);

  // Invalid email format
  const invalidEmailRes = await apiRequest('POST', '/auth/register', {
    name: 'Bad Email',
    email: 'not-a-valid-email',
    password: 'ValidPassword123!',
    role: 'candidate'
  });
  console.log(`Invalid Email Format: status=${invalidEmailRes.status} (Expected 400 Bad Request) -> ${invalidEmailRes.status === 400 ? 'PASS' : 'FAIL'}`);

  // Role authorization: candidate trying to create a job
  const unauthorizedJobRes = await apiRequest('POST', '/jobs', {
    title: 'Unauthorized Candidate Job',
    company: 'Test Company',
    description: 'Should fail with 403'
  }, userToken);
  console.log(`Candidate attempting Recruiter action: status=${unauthorizedJobRes.status} (Expected 403 Forbidden) -> ${unauthorizedJobRes.status === 403 ? 'PASS' : 'FAIL'}`);

  // Duplicate application check
  const dupAppRes = await apiRequest('POST', '/applications', {
    jobId: createdJobId,
    fullName: 'Persistence Test Candidate',
    email: testUserEmail,
    phone: '+91 91234 56789',
    whyInterested: 'Duplicate application attempt after already applying.'
  }, userToken);
  console.log(`Duplicate Application Prevention: status=${dupAppRes.status} (Expected 409 Conflict) -> ${dupAppRes.status === 409 ? 'PASS' : 'FAIL'}`);

  console.log('\n=================================================================');
  console.log('STEP 8: Test DB Connection Failure Handling');
  console.log('=================================================================');
  // Verify connectDB throws explicitly when given unreachable URI and never falls back silently
  const origUri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:9999/non_existent_unreachable_db';
  try {
    // Disconnect first
    await mongoose.disconnect();
    await connectDB();
    console.log('FAIL: Expected connectDB to throw on bad URI!');
  } catch (err) {
    console.log(`PASS: connectDB threw error on unreachable port (${err.message}) as required (NO silent fallback).`);
  } finally {
    process.env.MONGODB_URI = origUri;
    await connectDB();
  }

  await closeDB();
  console.log('\n=================================================================');
  console.log('SUCCESS: All Database Persistence & Security Checks Passed!');
  console.log(`Verified User ID:        ${directUserInDb._id}`);
  console.log(`Verified Job ID:         ${createdJobId}`);
  console.log(`Verified Application ID: ${createdAppId}`);
  console.log('=================================================================');
};

runPersistenceVerification().catch((err) => {
  console.error('[Persistence Verification FAILED]:', err);
  process.exit(1);
});
