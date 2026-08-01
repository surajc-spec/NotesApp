import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LogIn, BookOpen, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Hero = () => {
  const { user } = useAuth();
  const isGuest = user === null;
  const isAdmin = user?.role === 'admin';

  return (
    <section className="relative overflow-hidden bg-light-background dark:bg-dark-background transition-colors duration-300">
      
      {/* Background Decorative Ambient Blur */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-container mx-auto px-6 sm:px-8 lg:px-10 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Main Copy & Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Main Headline (Including Personalized H1 Greeting when Logged In) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground leading-[1.15] mb-6">
              {!isGuest && user?.name && (
                <span className="block text-primary mb-2 animate-fadeIn">
                  Hi, {user.name} ! 
                </span>
              )}
              Level Up Your Learning <br />
              With NoteShare
            </h1>

            {/* Subtitle / Paragraph */}
            <p className="text-base sm:text-lg text-light-muted dark:text-dark-muted max-w-2xl leading-relaxed mb-8">
              NoteShare is a student community platform to share high-quality study notes and access previous year question papers. Everything is free, forever.
            </p>

            {/* Conditional Action Buttons based on Auth state & Admin role */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-6">
              {isGuest ? (
                <>
                  {/* Guest Button 1: Get Started -> /register */}
                  <Link
                    to="/register"
                    className="h-[50px] px-8 text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 ease-out flex items-center justify-center gap-2.5 hover:scale-[1.04] active:scale-[0.96]"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </Link>

                  {/* Guest Button 2: Sign In -> /login */}
                  <Link
                    to="/login"
                    className="h-[50px] px-7 text-base font-bold text-light-foreground dark:text-dark-foreground bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-light-surface-tertiary dark:hover:bg-dark-surface-tertiary border border-light-border dark:border-dark-border rounded-btn transition-all duration-200 ease-out flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <LogIn className="w-5 h-5 text-primary stroke-[2.5]" />
                    <span>Sign In</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* Logged-in Button 1: Browse Library -> /notes */}
                  <Link
                    to="/notes"
                    className="h-[50px] px-8 text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 ease-out flex items-center justify-center gap-2.5 hover:scale-[1.04] active:scale-[0.96]"
                  >
                    <BookOpen className="w-5 h-5 stroke-[2.5]" />
                    <span>Browse Library</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </Link>

                  {/* Logged-in Button 2: Upload Notes (Admin Only) */}
                  {isAdmin && (
                    <Link
                      to="/dashboard"
                      className="h-[50px] px-7 text-base font-bold text-light-foreground dark:text-dark-foreground bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-light-surface-tertiary dark:hover:bg-dark-surface-tertiary border border-light-border dark:border-dark-border rounded-btn transition-all duration-200 ease-out flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.97]"
                    >
                      <Upload className="w-5 h-5 text-primary stroke-[2.5]" />
                      <span>Upload Notes</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Hero Illustration Display */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-md lg:max-w-full flex items-center justify-center">
              <img 
                src="/hero-illustration.png" 
                alt="NoteShare Open Book & Notes Illustration" 
                className="w-full h-auto max-h-[420px] object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
