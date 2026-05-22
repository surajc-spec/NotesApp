import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SecurityDeterrents from './components/SecurityDeterrents';
import RegistrationPopup from './components/RegistrationPopup';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import UploadNote from './pages/UploadNote';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import NotePreview from './pages/NotePreview';

import Footer from './components/Footer';

import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import TermsConditions from './pages/TermsConditions';

function App() {
  const [allowAccess, setAllowAccess] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent;

      const isMobile =
        /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(
          ua
        );

      const desktopMode =
        window.innerWidth >= 1000;

      if (isMobile && !desktopMode) {
        setAllowAccess(false);
      } else {
        setAllowAccess(true);
      }
    };

    checkDevice();

    window.addEventListener("resize", checkDevice);

    return () =>
      window.removeEventListener("resize", checkDevice);
  }, []);

  if (!allowAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
        <div className="text-center max-w-lg">

          <h1 className="text-4xl font-bold mb-6">
            🖥 Open on Laptop / PC
          </h1>

          <p className="text-gray-400 text-lg">
            NoteShare currently supports desktop experience only.
          </p>

          <p className="text-green-400 mt-6">
            Or enable <b>Desktop Site</b> in your browser.
          </p>

        </div>
      </div>
    );
  }

  return (
    <Router>
      <SecurityDeterrents />
      <RegistrationPopup />
      <Navbar />

      <div className="pt-24 min-h-screen flex flex-col justify-between">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">

          <Routes>

            <Route path="/" element={<Landing />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route
              path="/notes"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notes/:id/preview"
              element={
                <ProtectedRoute>
                  <NotePreview />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadNote />
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

            <Route path="/privacy" element={<PrivacyPolicy />} />

            <Route path="/about" element={<AboutUs />} />

            <Route path="/contact" element={<ContactUs />} />

            <Route path="/terms" element={<TermsConditions />} />

          </Routes>

        </div>

        <Footer />

      </div>

    </Router>
  );
}

export default App;