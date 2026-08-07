import React from 'react';


const About = () => {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground pb-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 pt-12 sm:pt-16">
        
        {/* Header Hero */}
        <div className="text-center space-y-4 mb-14">
         
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans text-light-foreground dark:text-dark-foreground">
            Simplifying Academic Learning
          </h1>
          <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted max-w-xl mx-auto font-sans leading-relaxed">
            NoteShare is a secure, high-performance platform built for engineering students to access branch-specific study notes and previous year question papers effortlessly.
          </p>
        </div>

        {/* Core Value Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-light-foreground dark:text-dark-foreground">
              Targeted Library
            </h3>
            <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              Easily filter notes and question papers tailored directly to your engineering branch, academic year, and semester.
            </p>
          </div>

          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-light-foreground dark:text-dark-foreground">
              Protected Viewing
            </h3>
            <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              Read study materials seamlessly online with integrated screenshot prohibition and protected document controls.
            </p>
          </div>

          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-light-foreground dark:text-dark-foreground">
              Instant Speed
            </h3>
            <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed font-sans">
              Powered by multi-level caching architecture to deliver study notes in milliseconds when you need them most on exam night.
            </p>
          </div>

        </div>

        {/* Short & Simple Summary Box */}
        <div className="bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
             Our Goal
          </h2>
          <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed font-sans">
            We aim to eliminate the stress of searching for quality study materials during exam preparation. With NoteShare, every student gets instant, organized, and secure access to high-quality notes created for their exact curriculum.
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;
