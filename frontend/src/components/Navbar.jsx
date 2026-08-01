import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  LayoutDashboard, 
  User, 
  LogIn, 
  UserPlus, 
  Sun, 
  Moon, 
  Monitor,
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { user } = useAuth();
  const { themeMode, cycleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Desktop NavLink styling (with subtle scale-up on hover & press down)
  const getNavLinkClass = ({ isActive }) =>
    `h-[44px] px-5 text-sm font-semibold transition-all duration-200 ease-out rounded-btn flex items-center justify-center gap-2.5 hover:scale-[1.03] active:scale-[0.97] ${
      isActive
        ? 'text-primary font-bold bg-primary/10 dark:bg-primary/15 border border-primary/20'
        : 'text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground hover:bg-light-surface-secondary/80 dark:hover:bg-dark-surface-secondary/80 border border-transparent'
    }`;

  // Mobile NavLink styling (with subtle scale effect)
  const getMobileNavLinkClass = ({ isActive }) =>
    `h-[48px] px-5 text-base font-semibold transition-all duration-200 ease-out rounded-btn flex items-center gap-3 active:scale-[0.98] ${
      isActive
        ? 'text-primary font-bold bg-primary/10 dark:bg-primary/15 border-l-4 border-primary'
        : 'text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground hover:bg-light-surface-secondary dark:hover:bg-dark-surface-secondary'
    }`;

  // Role check flags
  const isGuest = user === null;
  const isNormalUser = user?.role === 'user';
  const isAdmin = user?.role === 'admin';

  // Render icon corresponding to themeMode ('light' | 'dark' | 'system')
  const renderThemeIcon = () => {
    if (themeMode === 'light') {
      return <Sun className="w-5 h-5 text-amber-500 transition-transform duration-300" />;
    }
    if (themeMode === 'dark') {
      return <Moon className="w-5 h-5 text-sky-400 transition-transform duration-300" />;
    }
    return <Monitor className="w-5 h-5 text-sky-500 dark:text-sky-400 transition-transform duration-300" />;
  };

  const getThemeLabel = () => {
    if (themeMode === 'light') return 'Theme: Light';
    if (themeMode === 'dark') return 'Theme: Dark';
    return 'Theme: System';
  };

  return (
    <header className="sticky top-0 z-navbar w-full backdrop-blur-md bg-light-surface/85 dark:bg-dark-surface/85 border-b border-light-border dark:border-dark-border transition-colors duration-300">
      <div className="max-w-container mx-auto px-6 sm:px-8 lg:px-10">
        <div className="relative flex items-center justify-between h-[72px]">
          
          {/* LEFT: NoteShare Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-btn py-1 transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-primary-foreground font-bold transition-transform duration-300 group-hover:rotate-3">
                <BookOpen className="w-5 h-5 text-primary-foreground stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground font-sans">
                NoteShare
              </span>
            </Link>
          </div>

          {/* CENTER: Navigation Links (Perfectly Centered in Navbar) */}
          {!isGuest && (
            <nav 
              aria-label="Main Navigation" 
              className="hidden md:flex items-center justify-center gap-2 absolute left-1/2 -translate-x-1/2"
            >
              {/* All Notes (/notes) - Available for User & Admin */}
              <NavLink to="/notes" className={getNavLinkClass}>
                <FileText className="w-4 h-4 stroke-[2]" />
                <span>All Notes</span>
              </NavLink>

              {/* Question Papers (/question-papers) - Opens in New Tab */}
              <a
                href="/question-papers"
                target="_blank"
                rel="noopener noreferrer"
                className={getNavLinkClass({ isActive: window.location.pathname === '/question-papers' })}
              >
                <GraduationCap className="w-4 h-4 stroke-[2]" />
                <span>Question Papers</span>
              </a>

              {/* Dashboard (/dashboard) - Only for Admin */}
              {isAdmin && (
                <NavLink to="/dashboard" className={getNavLinkClass}>
                  <LayoutDashboard className="w-4 h-4 stroke-[2]" />
                  <span>Dashboard</span>
                </NavLink>
              )}
            </nav>
          )}

          {/* RIGHT ACTION GROUP (Auth/Profile + Theme Toggle) */}
          <div className="hidden md:flex items-center gap-3">
            {/* 1. Guest Actions (Login & Sign Up) */}
            {isGuest && (
              <div className="flex items-center gap-3">
                <NavLink to="/login" className={getNavLinkClass}>
                  <LogIn className="w-4 h-4 stroke-[2]" />
                  <span>Login</span>
                </NavLink>

                {/* Primary Filled CTA Button */}
                <NavLink
                  to="/register"
                  className="h-[44px] px-6 text-sm font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 ease-out flex items-center justify-center gap-2 hover:scale-[1.04] active:scale-[0.96]"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Sign Up</span>
                </NavLink>
              </div>
            )}

            {/* 2. Logged-in User Actions (Profile) - Normal User & Admin */}
            {!isGuest && (
              <NavLink to="/profile" className={getNavLinkClass}>
                <User className="w-4 h-4 stroke-[2]" />
                <span>Profile</span>
              </NavLink>
            )}

            {/* Always Visible: Theme Toggle */}
            <button
              type="button"
              onClick={cycleTheme}
              title={getThemeLabel()}
              aria-label={getThemeLabel()}
              className="w-[44px] h-[44px] rounded-2xl flex items-center justify-center text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-light-surface-tertiary dark:hover:bg-dark-surface-tertiary border border-light-border dark:border-dark-border transition-all duration-200 ease-out hover:scale-[1.06] active:scale-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {renderThemeIcon()}
            </button>
          </div>

          {/* MOBILE CONTROLS: Theme Toggle + Hamburger Toggle */}
          <div className="flex items-center gap-2.5 md:hidden">
            {/* Always Visible Theme Toggle on Mobile */}
            <button
              type="button"
              onClick={cycleTheme}
              title={getThemeLabel()}
              aria-label={getThemeLabel()}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-light-muted dark:text-dark-muted bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border transition-all hover:scale-105 active:scale-95"
            >
              {renderThemeIcon()}
            </button>

            {/* Hamburger Button */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-light-foreground dark:text-dark-foreground hover:bg-light-surface-secondary dark:hover:bg-dark-surface-secondary transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden border-t border-light-border dark:border-dark-border bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-6 pt-4 pb-6 space-y-2">
              {/* Guest Mobile Links */}
              {isGuest && (
                <div className="flex flex-col gap-2 pt-1">
                  <NavLink
                    to="/login"
                    onClick={closeMobileMenu}
                    className={getMobileNavLinkClass}
                  >
                    <LogIn className="w-5 h-5 stroke-[2]" />
                    <span>Login</span>
                  </NavLink>

                  <NavLink
                    to="/register"
                    onClick={closeMobileMenu}
                    className="h-[48px] px-5 text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 flex items-center justify-center gap-3 mt-1 active:scale-[0.98]"
                  >
                    <UserPlus className="w-5 h-5 stroke-[2.5]" />
                    <span>Sign Up</span>
                  </NavLink>
                </div>
              )}

              {/* Normal User & Admin Mobile Links */}
              {!isGuest && (
                <div className="flex flex-col gap-1.5">
                  <NavLink
                    to="/notes"
                    onClick={closeMobileMenu}
                    className={getMobileNavLinkClass}
                  >
                    <FileText className="w-5 h-5 stroke-[2]" />
                    <span>All Notes</span>
                  </NavLink>

                  <a
                    href="/question-papers"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMobileMenu}
                    className={getMobileNavLinkClass({ isActive: false })}
                  >
                    <GraduationCap className="w-5 h-5 stroke-[2]" />
                    <span>Question Papers</span>
                  </a>

                  {/* Dashboard - Admin Only */}
                  {isAdmin && (
                    <NavLink
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className={getMobileNavLinkClass}
                    >
                      <LayoutDashboard className="w-5 h-5 stroke-[2]" />
                      <span>Dashboard</span>
                    </NavLink>
                  )}

                  <NavLink
                    to="/profile"
                    onClick={closeMobileMenu}
                    className={getMobileNavLinkClass}
                  >
                    <User className="w-5 h-5 stroke-[2]" />
                    <span>Profile</span>
                  </NavLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
