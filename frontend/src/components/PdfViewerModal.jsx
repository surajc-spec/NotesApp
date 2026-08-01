import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Lock, ShieldCheck, Download } from 'lucide-react';

const PdfViewerModal = ({ isOpen, onClose, note, pdfUrl }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/70 backdrop-blur-md overflow-hidden">
        
        {/* Animated Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-4xl h-[85vh] bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-modal flex flex-col overflow-hidden"
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
            {pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                title={note?.title || 'PDF Note'}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-8 text-center space-y-4">
                <Lock className="w-12 h-12 text-primary animate-pulse" />
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
