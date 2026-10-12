import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ApplicationForm from './components/ApplicationForm';
import AuthModal from './components/AuthModal';
import MyApplicationsModal from './components/MyApplicationsModal';
import PostJobModal from './components/PostJobModal';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetailsPage from './pages/JobDetailsPage';
import Contact from './pages/Contact';
import { AuthProvider } from './context/AuthContext';
import { jobsData } from './data/jobs';
import './App.css';

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
        </div>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
