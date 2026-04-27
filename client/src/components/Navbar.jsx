import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, BookOpen, PlusCircle } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <BookOpen className="logo-icon" />
          <span>NoteShare</span>
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <span className="navbar-user">Hello, {user.name}</span>
              <Link to="/notes" className="nav-link">All Notes</Link>
              <Link to="/dashboard" className="nav-link">My Notes</Link>
              <Link to="/upload" className="btn btn-primary btn-sm">
                <PlusCircle size={18} /> Upload
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
