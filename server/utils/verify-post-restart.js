import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { connectDB, closeDB } from '../config/database.js';

const testPostRestart = async () => {
  console.log('Connecting to MongoDB post-restart...');
  await connectDB();

  const userCount = await User.countDocuments();
  const jobCount = await Job.countDocuments();
  const appCount = await Application.countDocuments();

  console.log(`[Post-Restart Verification] Total in MongoDB: Users=${userCount}, Jobs=${jobCount}, Applications=${appCount}`);

  // Fetch the user created in previous test
  const existingCandidate = await User.findOne({ email: /persistence_user_/ }).sort({ createdAt: -1 });
  console.log(`[Post-Restart] Found existing persisted candidate: ${existingCandidate?.email} (_id: ${existingCandidate?._id})`);

  // Fetch the job created in previous test
  const existingJob = await Job.findOne({ title: /Persistence Cloud Architect Intern/ }).sort({ createdAt: -1 });
  console.log(`[Post-Restart] Found existing persisted job: ${existingJob?.title} (_id: ${existingJob?._id})`);

  // Fetch the application created in previous test
  const existingApp = await Application.findOne({ job: existingJob?._id }).populate('job').populate('applicant');
  console.log(`[Post-Restart] Found existing persisted application: ${existingApp?._id}`);
  console.log(`  - Referenced Job: ${existingApp?.job?.title}`);
  console.log(`  - Referenced Applicant: ${existingApp?.applicant?.email}`);

  // Verify REST API retrieval post-restart
  const apiJobRes = await fetch(`http://localhost:5000/api/jobs/${existingJob?._id}`).then(r => r.json());
  console.log(`[Post-Restart REST API] GET /api/jobs/${existingJob?._id} -> success=${apiJobRes?.success}, title="${apiJobRes?.data?.title}"`);

  if (!existingCandidate || !existingJob || !existingApp || !apiJobRes?.success) {
    throw new Error('Data persistence failed post-restart!');
  }

  console.log('--- POST-RESTART PERSISTENCE VERIFICATION SUCCESSFUL! ---');
  await closeDB();
};

testPostRestart().catch((err) => {
  console.error(err);
  process.exit(1);
});
