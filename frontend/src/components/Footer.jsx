import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border-t border-light-border dark:border-dark-border transition-colors duration-300">
      <div className="max-w-container mx-auto px-6 sm:px-8 lg:px-10 pt-12 pb-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-10">
        
          <div className="md:col-span-5 flex flex-col items-start space-y-3">
            <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed max-w-sm font-sans">
              The premier, secure platform for students to share academic resources within their specific branch and year. Read everything, copy nothing, learn securely.
            </p>
          </div>

          <div className="md:col-span-3 flex flex-col space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground font-sans">
              Academic Library
            </h3>
            <ul className="space-y-2.5 text-sm text-light-muted dark:text-dark-muted font-sans">
              <li>
                <Link 
                  to="/notes" 
                  className="hover:text-primary transition-colors duration-200 inline-block"
                >
                  All Study Notes
                </Link>
              </li>
              <li>
                <Link 
                  to="/question-papers" 
                  className="hover:text-primary transition-colors duration-200 inline-block"
                >
                  Question Papers
                </Link>
              </li>
              <li>
                <Link 
                  to="/feedback" 
                  className="hover:text-primary transition-colors duration-200 inline-block"
                >
                  Student Reviews
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 flex flex-col space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground font-sans">
              Company &amp; Legal
            </h3>
            <ul className="space-y-3 text-sm text-light-muted dark:text-dark-muted font-sans">
              <li>
                <Link 
                  to="/about" 
                  className="hover:text-primary transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="hover:text-primary transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/feedback" 
                  className="hover:text-primary transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <span>Give Feedback</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="hover:text-primary transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="hover:text-primary transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <span>Terms &amp; Conditions</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-light-border dark:border-dark-border pt-6 flex items-center justify-between">
          <p className="text-xs text-light-muted dark:text-dark-muted font-sans">
            &copy; 2026 Suraj Chougule All rights reserved.
          </p>

          {/* Invisible Security Honeypot Link (Traps automated web scrapers) */}
          <a
            href="/api/security/v1/trap"
            style={{ display: 'none', visibility: 'hidden', position: 'absolute', left: '-9999px' }}
            aria-hidden="true"
            tabIndex={-1}
            rel="nofollow"
          >
            System Security Verification
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
