import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Notes from './pages/Notes';
import QuestionPapers from './pages/QuestionPapers';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

const DummyPage = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-8 max-w-container mx-auto">
      <h1 className="text-3xl font-bold text-light-foreground dark:text-dark-foreground mb-4">{title}</h1>
      <p className="text-light-muted dark:text-dark-muted mb-6">Content for {title} page.</p>
      
      {title === 'User Profile' && user && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border max-w-md">
            <p className="text-sm font-semibold mb-1">User Details:</p>
            <p className="text-xs text-light-muted dark:text-dark-muted">Name: {user.name}</p>
            <p className="text-xs text-light-muted dark:text-dark-muted">Email: {user.email}</p>
            <p className="text-xs text-light-muted dark:text-dark-muted">Role: <span className="font-bold text-primary">{user.role}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-btn transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const AppContent = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/question-papers" element={<QuestionPapers />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<DummyPage title="User Profile" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
