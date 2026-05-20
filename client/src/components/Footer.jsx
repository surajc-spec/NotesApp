import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, HelpCircle, Mail, FileText } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-surface border-t border-border mt-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Tagline */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-accent-foreground shadow-md shadow-accent/20 group-hover:scale-105 transition-transform">
                <BookOpen size={20} />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">NoteShare</span>
            </Link>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              The premier, secure platform for students to share academic resources within their specific branch and year. Read everything, copy nothing, learn securely.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Academic Library</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/notes" className="text-sm text-muted hover:text-accent transition-colors flex items-center gap-1.5">
                  All Study Notes
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted hover:text-accent transition-colors flex items-center gap-1.5">
                  My Uploads Dashboard
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-sm text-muted hover:text-accent transition-colors flex items-center gap-1.5">
                  Publish New Note
                </Link>
              </li>
            </ul>
          </div>

          {/* Information & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Company & Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted hover:text-accent transition-colors flex items-center gap-1.5">
                  <HelpCircle size={14} />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted hover:text-accent transition-colors flex items-center gap-1.5">
                  <Mail size={14} />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted hover:text-accent transition-colors flex items-center gap-1.5">
                  <Shield size={14} />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted hover:text-accent transition-colors flex items-center gap-1.5">
                  <FileText size={14} />
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-separator mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Suraj Chougule  All rights reserved.
          </p>
          <p className="text-xs text-muted flex items-center gap-1">
            {/* <span>Powered by secure academic streaming</span> */}
            {/* <span className="w-1.5 h-1.5 rounded-full bg-success"></span> */}
            {/* <span className="text-success font-medium">Secured Preview Mode</span> */}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
