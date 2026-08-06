import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Lock, ShieldCheck, EyeOff, ShieldAlert } from 'lucide-react';

const PdfViewerModal = ({ isOpen, onClose, note, pdfUrl }) => {
  const isNotesOpened = Boolean(isOpen && pdfUrl);

  const [isScreenshotBlocked, setIsScreenshotBlocked] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  useEffect(() => {
    if (!isNotesOpened) return;

    const triggerScreenshotBlock = () => {
      setIsScreenshotBlocked(true);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('Screenshot is blocked on NoteShare for security.');
        }
      } catch (err) {
        // Ignore clipboard permission issues
      }

      setTimeout(() => {
        setIsScreenshotBlocked(false);
      }, 3000);
    };

    const isScreenshotShortcut = (e) => {
      const key = e.key || '';
      const code = e.code || '';
      const keyCode = e.keyCode || 0;

      if (key === 'PrintScreen' || code === 'PrintScreen' || keyCode === 44) return true;
      if ((e.metaKey || e.winKey || e.ctrlKey) && e.shiftKey && (key === 'S' || key === 's' || code === 'KeyS')) return true;
      if (e.metaKey && e.shiftKey && (key === '3' || key === '4' || key === '5' || keyCode === 51 || keyCode === 52 || keyCode === 53)) return true;
      if ((e.ctrlKey || e.metaKey) && (key === 'p' || key === 'P' || code === 'KeyP')) return true;
      if ((e.ctrlKey || e.metaKey) && (key === 's' || key === 'S' || code === 'KeyS')) return true;
      if (key === 'F12' || code === 'F12' || keyCode === 123 || ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'I' || key === 'i' || code === 'KeyI'))) return true;

      return false;
    };

    const handleKeyDown = (e) => {
      if (isScreenshotShortcut(e)) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        triggerScreenshotBlock();
        return false;
      }
    };

    const handleKeyUp = (e) => {
      if (isScreenshotShortcut(e)) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        triggerScreenshotBlock();
        return false;
      }
    };

    const handleWindowBlur = () => setIsWindowBlurred(true);
    const handleWindowFocus = () => setIsWindowBlurred(false);
    const preventDefaultAction = (e) => { e.preventDefault(); return false; };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    document.addEventListener('contextmenu', preventDefaultAction);
    document.addEventListener('copy', preventDefaultAction);
    document.addEventListener('cut', preventDefaultAction);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);

      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);

      document.removeEventListener('contextmenu', preventDefaultAction);
      document.removeEventListener('copy', preventDefaultAction);
      document.removeEventListener('cut', preventDefaultAction);
    };
  }, [isNotesOpened]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        onContextMenu={(e) => e.preventDefault()}
        className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-md overflow-hidden select-none"
      >
        
        {/* BLACK SCREEN OVERLAY (WHEN SCREENSHOT IS BLOCKED) */}
        {isScreenshotBlocked && (
          <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center p-8 text-center text-white animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/40 text-red-500 flex items-center justify-center mb-6 animate-pulse">
              <EyeOff className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-3">
              Screenshot is Blocked
            </h2>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Taking screenshots or printing protected study materials is restricted on NoteShare for security and copyright compliance.
            </p>
          </div>
        )}

        {/* Animated Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-4xl h-[85vh] bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-modal flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-light-border dark:border-dark-border flex items-center justify-between bg-light-surface-secondary/50 dark:bg-dark-surface-secondary/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-light-foreground dark:text-dark-foreground truncate font-sans">
                  {note?.title || 'Note Preview'}
                </h3>
                <p className="text-xs text-light-muted dark:text-dark-muted truncate">
                  {note?.subject || note?.subjectCode || 'Academic Resource'} • Protected Preview Mode
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold">
                <ShieldCheck className="w-4 h-4 stroke-[2]" />
                <span>Protected</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground hover:bg-light-surface-tertiary dark:hover:bg-dark-surface-tertiary transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PDF Viewer Body */}
          <div className="flex-1 bg-neutral-900 relative overflow-hidden protected-preview">
            {isNotesOpened && isWindowBlurred && (
              <div className="absolute inset-0 bg-black z-40 flex flex-col items-center justify-center text-center p-6">
                <ShieldAlert className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
                <h3 className="text-xl font-bold text-white">Content Protected</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  Click inside NoteShare window to resume reading.
                </p>
              </div>
            )}

            {pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                title={note?.title || 'PDF Note'}
                className="w-full h-full border-0"
                style={{ display: isWindowBlurred ? 'none' : 'block' }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-8 text-center space-y-4">
                <Lock className="w-12 h-12 text-primary animate-spin" />
                <p className="text-base font-bold text-white">Protected Note Preview</p>
                <p className="text-xs text-neutral-400 max-w-sm">
                  Loading secure PDF document from cloud storage...
                </p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </AnimatePresence>
  );
};

export default PdfViewerModal;
