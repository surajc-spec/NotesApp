import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Share2 } from 'lucide-react';
import { shareToWhatsApp } from '../utils/shareUtils';

const NoteCard = ({ note }) => {
  const navigate = useNavigate();

  const handleViewClick = () => {
    const id = note._id || note.id;
    navigate(`/pdf-viewer?type=${note.type || 'note'}&id=${id}`);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    shareToWhatsApp({
      id: note._id || note.id,
      type: note.type || 'note',
      title: note.title,
      subject: note.subjectCode || note.subject,
    });
  };

  return (
    <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 transition-all duration-200 hover:scale-[1.02] hover:border-primary/40 shadow-sm group max-w-sm sm:max-w-none w-full">
      
      {/* Left: Subject Code & Title */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="text-[11px] font-extrabold text-primary uppercase tracking-wider">
          {note.subjectCode || note.subject || 'NOTE'}
        </div>
        <h4 className="text-sm font-bold text-light-foreground dark:text-dark-foreground font-sans truncate">
          {note.title}
        </h4>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleShareClick}
          title="Share to WhatsApp"
          aria-label="Share note on WhatsApp"
          className="h-8 w-8 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-emerald-500/10 text-light-muted dark:text-dark-muted hover:text-emerald-500 border border-light-border dark:border-dark-border hover:border-emerald-500/30 transition-all flex items-center justify-center active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleViewClick}
          className="h-8 px-3 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-primary hover:text-primary-foreground text-light-foreground dark:text-dark-foreground border border-light-border dark:border-dark-border hover:border-primary transition-all text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
        >
          <Eye className="w-3.5 h-3.5 stroke-[2]" />
          <span>View PDF</span>
        </button>
      </div>

    </div>
  );
};

export default NoteCard;
