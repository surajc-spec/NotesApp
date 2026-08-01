import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  HelpCircle, 
  Mail, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border-t border-light-border dark:border-dark-border transition-colors duration-300">
      <div className="max-w-container mx-auto px-6 sm:px-8 lg:px-10 pt-12 pb-8">
        
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-10">
        
          <div className="md:col-span-5 flex flex-col items-start space-y-4">
           
            <Link
              to="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-btn py-1 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-primary text-primary-foreground font-bold transition-transform duration-300 group-hover:rotate-3">
                <BookOpen className="w-5 h-5 text-primary-foreground stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground font-sans">
                NoteShare
              </span>
            </Link>

        
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
        </div>

      </div>
    </footer>
  );
};

export default Footer;
