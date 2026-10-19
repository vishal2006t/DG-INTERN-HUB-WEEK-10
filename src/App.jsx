import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ApplicationForm from './components/ApplicationForm';
import AuthModal from './components/AuthModal';
import MyApplicationsModal from './components/MyApplicationsModal';
import PostJobModal from './components/PostJobModal';
import Toast from './components/Toast';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetailsPage from './pages/JobDetailsPage';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { SavedJobsProvider } from './context/SavedJobsContext';
import { ToastProvider } from './context/ToastContext';
import { jobsData } from './data/jobs';
import ProtectedRoute from './routes/ProtectedRoute';
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
        <SavedJobsProvider>
          <ToastProvider>
            <ScrollToTop />
            <div className="app-layout">
              {/* Navigation Bar */}
              <Navbar 
                onOpenMyApplications={() => setIsMyAppsOpen(true)}
                onOpenPostJob={() => setIsPostJobOpen(true)}
              />

              {/* Main Content Area */}
              <main className="main-content" id="main-content">
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
                  {/* Week 9 Dedicated Pages */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/applications" 
                    element={
                      <ProtectedRoute>
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
                  <Route 
                    path="/login" 
                    element={<Login />} 
                  />
                  <Route 
                    path="/register" 
                    element={<Register />} 
                  />
                  {/* Fallback route to Home */}
                  <Route 
                    path="*" 
                    element={<Home onApplyJob={handleOpenApplyModal} />} 
                  />
                </Routes>
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
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
