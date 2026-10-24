import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ApplicationForm from './components/ApplicationForm';
import AuthModal from './components/AuthModal';
import MyApplicationsModal from './components/MyApplicationsModal';
import PostJobModal from './components/PostJobModal';
import Toast from './components/Toast';
import Loader from './components/Loader';
import ProtectedRoute from './routes/ProtectedRoute';

// Global Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SavedJobsProvider } from './context/SavedJobsContext';
import { ToastProvider } from './context/ToastContext';
import { jobsData } from './data/jobs';

// Performance Optimization: Route-level code splitting via dynamic imports
const Home = lazy(() => import('./pages/Home'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetailsPage = lazy(() => import('./pages/JobDetailsPage'));
const Contact = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Applications = lazy(() => import('./pages/Applications'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

import './App.css';
import './styles/week9-pages.css';

// Automatically scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  // Modal states
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isMyAppsOpen, setIsMyAppsOpen] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  const handleOpenApplyModal = (job = null) => {
    setSelectedJob(job || jobsData[0]);
    setIsApplyModalOpen(true);
  };

  const handleCloseApplyModal = () => {
    setIsApplyModalOpen(false);
  };

  return (
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <SavedJobsProvider>
              <ToastProvider>
                <ScrollToTop />
                <div className="app-layout">
                  {/* Navigation Bar */}
                  <Navbar 
                    onOpenMyApplications={() => setIsMyAppsOpen(true)}
                    onOpenPostJob={() => setIsPostJobOpen(true)}
                  />

                  {/* Main Content Area with Lazy-loaded Route Suspense */}
                  <main className="main-content" id="main-content">
                    <Suspense
                      fallback={
                        <div
                          style={{
                            minHeight: '60vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Loader type="spinner" text="Loading content..." />
                        </div>
                      }
                    >
                      <Routes>
                        <Route 
                          path="/" 
                          element={<Home onApplyJob={handleOpenApplyModal} />} 
                        />
                        <Route 
                          path="/jobs" 
                          element={<Jobs onApplyJob={handleOpenApplyModal} />} 
                        />
                        <Route 
                          path="/jobs/:id" 
                          element={<JobDetailsPage onApplyJob={handleOpenApplyModal} />} 
                        />
                        <Route 
                          path="/contact" 
                          element={<Contact />} 
                        />

                        {/* Protected Routes (Role-aware) */}
                        <Route 
                          path="/dashboard" 
                          element={
                            <ProtectedRoute>
                              <Dashboard onOpenPostJob={() => setIsPostJobOpen(true)} />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/applications" 
                          element={
                            <ProtectedRoute allowedRoles={['candidate', 'admin']}>
                              <Applications />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/profile" 
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          } 
                        />

                        {/* Authentication Routes */}
                        <Route 
                          path="/login" 
                          element={<Login />} 
                        />
                        <Route 
                          path="/register" 
                          element={<Register />} 
                        />

                        {/* 404 Fallback route */}
                        <Route 
                          path="*" 
                          element={<NotFound />} 
                        />
                      </Routes>
                    </Suspense>
                  </main>

                  {/* Footer */}
                  <Footer />

                  {/* Global Application Modal */}
                  <ApplicationForm
                    isOpen={isApplyModalOpen}
                    job={selectedJob}
                    onClose={handleCloseApplyModal}
                  />

                  {/* Global Auth Modal */}
                  <AuthModal />

                  {/* Candidate Applications Modal */}
                  <MyApplicationsModal
                    isOpen={isMyAppsOpen}
                    onClose={() => setIsMyAppsOpen(false)}
                  />

                  {/* Recruiter Post Job Modal */}
                  <PostJobModal
                    isOpen={isPostJobOpen}
                    onClose={() => setIsPostJobOpen(false)}
                  />

                  {/* Global Toast Notifications */}
                  <Toast />
                </div>
              </ToastProvider>
            </SavedJobsProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
