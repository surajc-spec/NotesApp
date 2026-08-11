import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DesktopOnlyOverlay from './components/DesktopOnlyOverlay';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Notes from './pages/Notes';
import QuestionPapers from './pages/QuestionPapers';
import Dashboard from './pages/Dashboard';
import PdfViewerPage from './pages/PdfViewerPage';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import RestrictedAccess from './pages/RestrictedAccess';

const AppContent = () => {
  const location = useLocation();

  // Initialize and track Google Analytics 4 pageviews
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-T2PXGN3M6H";
    if (gaId) {
      if (!window.gaInitialized) {
        ReactGA.initialize(gaId);
        window.gaInitialized = true;
      }
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground transition-colors duration-300">
      <DesktopOnlyOverlay />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/question-papers" element={<QuestionPapers />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pdf-viewer" element={<PdfViewerPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/restricted" element={<RestrictedAccess />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
