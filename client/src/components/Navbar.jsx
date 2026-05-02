import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, BookOpen, PlusCircle, User as UserIcon, LayoutDashboard, Search, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const navLinks = user ? [
    { name: 'All Notes', path: '/notes', icon: <Search size={18} /> },
    { name: 'My Notes', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Profile', path: '/profile', icon: <UserIcon size={18} /> },
  ] : [
    { name: 'Login', path: '/login' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-accent-foreground shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">NoteShare</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`text-sm font-medium transition-colors hover:text-accent flex items-center gap-1.5 ${isActive(link.path) ? 'text-accent' : 'text-muted'}`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <Link to="/upload" className="px-5 py-2.5 bg-accent text-accent-foreground rounded-field text-sm font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-accent/10">
                  <PlusCircle size={18} />
                  Upload
                </Link>
                <button onClick={handleLogout} className="p-2.5 text-muted hover:text-danger transition-colors" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/register" className="px-6 py-2.5 bg-accent text-accent-foreground rounded-field text-sm font-semibold hover:scale-105 transition-all shadow-lg shadow-accent/10">
                Sign Up
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`text-lg font-medium p-2 rounded-lg ${isActive(link.path) ? 'bg-accent/10 text-accent' : 'text-foreground hover:bg-surface-secondary'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  {link.icon}
                  {link.name}
                </div>
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            {user ? (
              <>
                <Link 
                  to="/upload" 
                  className="w-full py-3 bg-accent text-accent-foreground rounded-field font-semibold text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Upload New Note
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="w-full py-3 border border-border text-danger rounded-field font-semibold"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link 
                to="/register" 
                className="w-full py-3 bg-accent text-accent-foreground rounded-field font-semibold text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
