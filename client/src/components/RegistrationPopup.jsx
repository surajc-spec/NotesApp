import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Award } from 'lucide-react';

const RegistrationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const showPopup = localStorage.getItem('showRegistrationPopup');
    if (showPopup === 'true') {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.removeItem('showRegistrationPopup');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with heavy blur */}
      <div 
        className="absolute inset-0 bg-background/75 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-[2.5rem] bg-surface/95 border border-border/80 p-8 md:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -ml-10 -mb-10" />

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full text-muted hover:text-foreground hover:bg-surface-secondary/80 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 bg-accent/15 text-accent rounded-3xl flex items-center justify-center mb-5 ring-8 ring-accent/5 shadow-inner">
            <HelpCircle size={40} className="animate-pulse" />
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Quick Study Tip!
          </h3>
          <p className="text-sm text-muted mt-2 max-w-sm">
            Here's a quick guide on how to read note frequency tags on NoteShare.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-surface-secondary border border-border/60 rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-accent/10 text-accent rounded-xl shrink-0 mt-1">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block px-2.5 py-0.5 bg-accent text-accent-foreground text-xs font-black rounded-full uppercase tracking-wider">
                  Notation Guide
                </span>
              </div>
              
              <p className="text-sm leading-relaxed text-foreground font-medium mt-3 italic">
                "Write a short note on MACAW and Draw diagram.<strong className="text-accent font-bold not-italic">[6][8]</strong>. 
                <strong className="text-accent font-bold not-italic">[6][8]</strong> this means question came twice in exam for 6 marks and in other 8 marks"
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClose}
          className="w-full py-4 bg-accent text-accent-foreground hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] rounded-2xl font-bold text-base shadow-lg shadow-accent/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          Got it, let's study!
        </button>
      </div>
    </div>
  );
};

export default RegistrationPopup;
