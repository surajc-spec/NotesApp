import React, { useState } from 'react';
import { FileText, Eye, Loader2 } from 'lucide-react';

const NoteCard = ({ note, onViewPdf }) => {
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleViewClick = async () => {
    if (!onViewPdf) return;
    setLoadingPdf(true);
    try {
      await onViewPdf(note._id || note.id, note);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] hover:border-primary/40 shadow-sm group">
      
      {/* Top Content Area */}
      <div>
        {/* Header Row: Icon + Subject Code + Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-primary uppercase tracking-wider">
              {note.subjectCode || note.subject || 'NOTE'}
            </div>
            <h4 className="text-base font-bold text-light-foreground dark:text-dark-foreground truncate font-sans">
              {note.title}
            </h4>
          </div>
        </div>

        {/* Description Snippet */}
        {note.description && (
          <p className="text-xs text-light-muted dark:text-dark-muted line-clamp-2 mb-4 font-sans leading-relaxed">
            {note.description}
          </p>
        )}
      </div>

      {/* Action Row: View PDF Button */}
      <div className="pt-3 border-t border-light-border dark:border-dark-border mt-2 flex items-center justify-end">
        <button
          type="button"
          onClick={handleViewClick}
          disabled={loadingPdf}
          aria-label="View note PDF"
          className="w-9 h-9 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-primary hover:text-primary-foreground text-light-foreground dark:text-dark-foreground border border-light-border dark:border-dark-border hover:border-primary transition-all flex items-center justify-center active:scale-95 disabled:opacity-50"
        >
          {loadingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Eye className="w-4 h-4 stroke-[2]" />
          )}
        </button>
      </div>

    </div>
  );
};

export default NoteCard;
