import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { BookOpen, Download, Monitor } from 'lucide-react';

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
import DownloadPage from './pages/DownloadPage';

import Footer from './components/Footer';

import PrivacyPolicy from './pages/PrivacyPolicy';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import TermsConditions from './pages/TermsConditions';

const appDownloadUrl = import.meta.env.VITE_ANDROID_APK_URL || '/noteshare.apk';

const isNativeRuntime = () => {
  if (Capacitor.isNativePlatform()) return true;
  return window.Capacitor?.isNativePlatform?.() === true;
};

const isMobileBrowser = () => {
  if (isNativeRuntime()) return false;

  const userAgent = navigator.userAgent || '';
  const uaDataMobile = navigator.userAgentData?.mobile === true;
  const mobileUa = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile|Silk/i.test(userAgent);
  const isIPad = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;

  return uaDataMobile || mobileUa || isIPad;
};

const MobileBrowserBlock = () => (
  <main className="mobile-block-screen min-h-[100dvh] bg-[#06110f] px-5 py-8 text-white">
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col justify-center">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
          <BookOpen size={28} />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-accent">NoteShare</p>
          <h1 className="text-3xl font-bold leading-tight">Use the app for mobile reading</h1>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur">
        <img src="/favicon2.png" alt="NoteShare" className="mb-6 h-16 w-16 rounded-2xl bg-white/5 p-3" />
        <p className="text-lg font-semibold text-white">Mobile browser access is limited for protected previews.</p>
        <p className="mt-3 text-sm leading-6 text-white/68">
          Download the Android app for the secure reader experience, or open NoteShare on a laptop or desktop.
        </p>

        <a
          href={appDownloadUrl}
          className="mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-field bg-accent px-5 py-4 text-base font-bold text-accent-foreground shadow-lg shadow-accent/20"
        >
          <Download size={20} />
          Download App
        </a>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/72">
          <Monitor className="shrink-0 text-accent" size={20} />
          <span>Already on a laptop or desktop? Open noteshare.online there for the full website.</span>
        </div>
      </div>
    </div>
  </main>
);

const AppBackButtonHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const originalHandler = window.__noteshareHandleAndroidBack;

    window.__noteshareHandleAndroidBack = () => {
      if (originalHandler) {
        const handled = originalHandler();
        if (handled) return true;
      }

      const rootPaths = ['/', '/notes', '/login', '/register', '/dashboard', '/questionpapers'];
      const currentPath = location.pathname.toLowerCase();

      if (rootPaths.includes(currentPath)) {
        return 'exit';
      }

      navigate(-1);
      return true;
    };

    return () => {
      window.__noteshareHandleAndroidBack = originalHandler;
    };
  }, [location, navigate]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let sub;

    const setupBackButton = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        sub = await CapApp.addListener('backButton', () => {
          if (window.__noteshareHandleAndroidBack) {
            const result = window.__noteshareHandleAndroidBack();
            if (result === 'exit') {
              CapApp.exitApp();
            }
          }
        });
      } catch (e) {
        console.warn('Capacitor App plugin not available:', e.message);
      }
    };

    setupBackButton();

    return () => {
      if (sub) {
        sub.remove();
      }
    };
  }, []);

  return null;
};

function App() {

  const isAdminRoute =
    window.location.pathname.toLowerCase() === '/dhoom';

  const isNativeApp = isNativeRuntime();

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

  if (isMobileBrowser()) {
    return <MobileBrowserBlock />;
  }


  return (
    <Router>
      <AppBackButtonHandler />

      <SecurityDeterrents />

      <RegistrationPopup />

      <Navbar />

      <div className={`min-h-screen flex flex-col justify-between ${isNativeApp ? 'noteshare-native' : 'pt-24'}`}>

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
              path="/my-notes"
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

            <Route path="/download" element={<DownloadPage />} />

          </Routes>

        </div>

        <Footer />

      </div>

    </Router>
  );
}

export default App;
