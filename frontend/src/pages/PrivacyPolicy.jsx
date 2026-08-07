import React from 'react';


const PrivacyPolicy = () => {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground pb-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 pt-12 sm:pt-16 space-y-10">
        
        {/* Header Hero */}
        <div className="text-center space-y-3">
         
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-light-foreground dark:text-dark-foreground">
            Privacy Policy &amp; Data Protection
          </h1>
          <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted max-w-lg mx-auto font-sans">
            Last Updated: August 2026. Your privacy and academic security are our top priorities.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          
          {/* Section 1 */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
              1. Information We Collect
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              We collect minimal information required to deliver personalized academic content, including your name, email address, engineering branch, academic year, and semester when you create an account.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
               2. How We Use Your Data
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              Your profile information is used exclusively to filter relevant study notes, question papers, and syllabus units for your specific engineering curriculum. We never sell or share your personal data with third parties.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
               3. Data Security &amp; Protection
            </h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              NoteShare utilizes encrypted JWT authentication with HTTP-only cookies and Cloudflare R2 cloud storage. Documents are protected with viewing controls and screenshot prohibition systems.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
