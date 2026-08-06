import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Lock } from 'lucide-react';

const DesktopOnlyOverlay = () => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isMobileWidth = window.innerWidth < 1024; // Less than desktop breakpoint
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent || ''
      );

      setIsMobileDevice(isMobileWidth || isMobileUA);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Lock mobile body scroll completely when overlay is active
  useEffect(() => {
    if (isMobileDevice) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTouchAction = document.body.style.touchAction;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.touchAction = 'none';

      const preventTouch = (e) => {
        e.preventDefault();
      };

      document.addEventListener('touchmove', preventTouch, { passive: false });

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.touchAction = originalTouchAction;
        document.removeEventListener('touchmove', preventTouch);
      };
    }
  }, [isMobileDevice]);

  if (!isMobileDevice) return null;

  return (
    <div 
      onTouchMove={(e) => e.preventDefault()}
      className="fixed inset-0 z-[99999] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground flex flex-col items-center justify-center p-6 sm:p-8 text-center select-none overflow-hidden touch-none overscroll-none transition-colors duration-300"
    >
      <div className="w-full max-w-md bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-md border border-light-border dark:border-dark-border rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col items-center space-y-6 animate-fadeIn">
        
        {/* Glowing Icon Badge */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 text-primary flex items-center justify-center shadow-lg">
            <Monitor className="w-10 h-10 stroke-[2]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Desktop Access Required
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans pt-2 text-light-foreground dark:text-dark-foreground">
            NoteShare is available only for desktop
          </h1>

          <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed max-w-sm font-sans pt-1">
            Please open NoteShare on a laptop or desktop computer to access study notes, question papers, and academic resources.
          </p>
        </div>

        {/* Info Note Box */}
        <div className="w-full p-4 rounded-2xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-xs text-light-muted dark:text-dark-muted font-medium">
          NoteShare features protected document viewing and rich academic tools optimized exclusively for desktop screens.
        </div>

      </div>
    </div>
  );
};

export default DesktopOnlyOverlay;
