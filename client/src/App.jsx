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
import QuestionPapers from './pages/QuestionPapers';
import UploadQuestionPaper from './pages/UploadQuestionPaper';
import AdminDhoom from './pages/AdminDhoom';

import Footer from './components/Footer';

import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import TermsConditions from './pages/TermsConditions';

function App() {

  const isAdminRoute =
    window.location.pathname.toLowerCase() === '/dhoom';

  const isMobile =
    navigator.maxTouchPoints > 1 &&
    window.innerWidth < 1024;

  if (isAdminRoute) {
    return (
      <Router>
        <Routes>
          <Route path="/Dhoom" element={<AdminDhoom />} />
          <Route path="/dhoom" element={<AdminDhoom />} />
        </Routes>
      </Router>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">

        <div className="text-center">

          <h1 className="text-white text-5xl mb-5">
            🖥 Open on Laptop / PC
          </h1>

          <p className="text-gray-400">
            NoteShare is available only on desktop devices.
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

        <div className="max-w-7xl mx-auto px-4 flex-1 w-full">

          <Routes>

            <Route path="/" element={<Landing />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route
              path="/notes"
              element={<ProtectedRoute><Home /></ProtectedRoute>}
            />

            <Route
              path="/notes/:id/preview"
              element={<ProtectedRoute><NotePreview /></ProtectedRoute>}
            />

            <Route
              path="/questionpapers"
              element={<ProtectedRoute><QuestionPapers /></ProtectedRoute>}
            />

            <Route
              path="/questionpapers/upload"
              element={<ProtectedRoute><UploadQuestionPaper /></ProtectedRoute>}
            />

            <Route
              path="/questionpapers/:id/preview"
              element={<ProtectedRoute><NotePreview resourceType="questionpapers" /></ProtectedRoute>}
            />

            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />

            <Route
              path="/upload"
              element={<ProtectedRoute><UploadNote /></ProtectedRoute>}
            />

            <Route
              path="/profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />

            <Route path="/privacy" element={<PrivacyPolicy />} />

            <Route path="/about" element={<AboutUs />} />

            <Route path="/contact" element={<ContactUs />} />

            <Route path="/terms" element={<TermsConditions />} />

            <Route path="/Dhoom" element={<AdminDhoom />} />

          </Routes>

        </div>

        <Footer />

      </div>

    </Router>
  );
}

export default App;
