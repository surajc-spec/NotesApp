import React from 'react';
import { FileText, CheckCircle2, AlertOctagon, Scale } from 'lucide-react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground pb-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 pt-12 sm:pt-16 space-y-10">
        
        {/* Header Hero */}
        <div className="text-center space-y-3">
         
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-light-foreground dark:text-dark-foreground">
            Terms &amp; Conditions of Use
          </h1>
          <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted max-w-lg mx-auto font-sans">
            Please read these terms before accessing study materials on NoteShare.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          
          {/* Section 1 */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
              1. Academic Purpose &amp; Access
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              NoteShare is provided strictly for personal academic study and revision purposes. By accessing our platform, you agree to use notes and question papers solely to assist your coursework.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
              2. Protected Content &amp; Restrictions
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              All study notes and question papers hosted on NoteShare are subject to viewing protection. Users are strictly prohibited from attempting to bypass anti-screenshot controls, record screens, or redistribute materials externally without authorization.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
            3. Account Responsibility
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              Users are responsible for maintaining the confidentiality of their login credentials. NoteShare reserves the right to suspend or terminate accounts that violate terms of service or attempt security breaches.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;
