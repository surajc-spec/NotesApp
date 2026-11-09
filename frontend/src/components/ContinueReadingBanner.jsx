import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, X } from 'lucide-react';

const ContinueReadingBanner = () => {
  const navigate = useNavigate();
  const [lastRead, setLastRead] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('noteshare_last_read');
      if (!stored) return;

      const data = JSON.parse(stored);
      if (!data || !data.id) return;

      // Check if user dismissed this specific note in this session
      const dismissedId = sessionStorage.getItem('noteshare_dismissed_read');
      if (dismissedId === data.id) {
        setIsDismissed(true);
        return;
      }

      // Check if within last 30 days
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      if (data.timestamp && Date.now() - data.timestamp > thirtyDaysMs) {
        return;
      }

      setLastRead(data);
    } catch (e) {
      console.warn('Could not parse last read note data');
    }
  }, []);

  if (!lastRead || isDismissed) return null;

  const handleResume = () => {
    const page = lastRead.page || 1;
    navigate(`/pdf-viewer?type=${lastRead.type || 'note'}&id=${lastRead.id}&page=${page}`);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    if (lastRead?.id) {
      sessionStorage.setItem('noteshare_dismissed_read', lastRead.id);
    }
  };

  return (
    <div className="mb-8 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-md border border-light-border dark:border-dark-border hover:border-primary/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-all duration-200">
      
      {/* Left: Icon & Details */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <BookOpen className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-primary">
              Continue where you left
            </span>
            {lastRead.subjectCode && (
              <span className="px-2 py-0.2 bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted text-[10px] font-bold rounded-md border border-light-border dark:border-dark-border">
                {lastRead.subjectCode}
              </span>
            )}
          </div>
          
          <h3 className="text-sm sm:text-base font-bold text-light-foreground dark:text-dark-foreground truncate mt-0.5 font-sans">
            {lastRead.title}
          </h3>

          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Page {lastRead.page || 1}{lastRead.totalPages ? ` of ${lastRead.totalPages}` : ''}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={handleResume}
          className="h-9 px-4 rounded-xl bg-primary hover:bg-emerald-400 text-primary-foreground font-bold text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <span>Resume Page {lastRead.page || 1}</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          title="Dismiss"
          aria-label="Dismiss resume reading prompt"
          className="h-9 w-9 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-light-border dark:hover:bg-dark-border text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default ContinueReadingBanner;
