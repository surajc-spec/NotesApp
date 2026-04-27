import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, DownloadCloud, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="landing-container">
      <header className="hero-section text-center">
        <h1 className="hero-title">Welcome to NoteShare</h1>
        <p className="hero-subtitle">
          The ultimate platform to upload, share, and discover study materials.
          Join our community of learners today.
        </p>
        <div className="hero-actions">
          {user ? (
            <>
              <Link to="/notes" className="btn btn-primary btn-lg">Browse Notes</Link>
              <Link to="/upload" className="btn btn-outline btn-lg">Upload Note</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Register</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Login</Link>
            </>
          )}
        </div>
      </header>

      <section className="features-section">
        <h2 className="text-center mb-4">Why use NoteShare?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><BookOpen size={32} /></div>
            <h3>Organized Materials</h3>
            <p>Find study materials easily grouped by subject and categories.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Users size={32} /></div>
            <h3>Community Driven</h3>
            <p>Access notes shared by peers and share your own knowledge.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><DownloadCloud size={32} /></div>
            <h3>Easy Access</h3>
            <p>Preview notes instantly in your browser or download them for offline use.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={32} /></div>
            <h3>Privacy Control</h3>
            <p>Keep your notes private or make them public to help others.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
