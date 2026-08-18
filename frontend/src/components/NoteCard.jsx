import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pin, PinOff } from 'lucide-react';

const NoteCard = ({ note, isPinned = false, onTogglePin }) => {
  const navigate = useNavigate();

  const handleViewClick = () => {
    const id = note._id || note.id;
    navigate(`/pdf-viewer?type=${note.type || 'note'}&id=${id}`);
  };

  const handlePinClick = (e) => {
    e.stopPropagation();
    const id = note._id || note.id;
    if (onTogglePin) {
      onTogglePin(id);
    }
  };

  return (
    <div 
      className={`bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:scale-[1.02] shadow-sm group relative ${
        isPinned
          ? 'border-primary/60 dark:border-primary/60 bg-primary/5 dark:bg-primary/5 shadow-md'
          : 'border-light-border dark:border-dark-border hover:border-primary/40'
      }`}
    >
      
      {/* Top Header: Subject Code & Pin Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
            {note.subjectCode || note.subject || 'NOTE'}
          </span>
          {note.examType && (
            <span className="px-2 py-0.5 rounded-md bg-light-surface-secondary dark:bg-dark-surface-secondary text-[10px] font-bold text-light-muted dark:text-dark-muted border border-light-border dark:border-dark-border uppercase">
              {note.examType}
            </span>
          )}
        </div>

        {/* Pin / Unpin Button */}
        <button
          type="button"
          onClick={handlePinClick}
          title={isPinned ? 'Unpin Notice/Note' : 'Pin Notice/Note to top'}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            isPinned
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted hover:text-primary hover:border-primary border border-light-border dark:border-dark-border'
          }`}
        >
          {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </button>
      </div>

      {/* Title & Description */}
      <div className="space-y-1 my-1">
        <h4 className="text-base font-bold text-light-foreground dark:text-dark-foreground font-sans line-clamp-2">
          {note.title}
        </h4>
        {note.description && (
          <p className="text-xs text-light-muted dark:text-dark-muted font-sans line-clamp-2">
            {note.description}
          </p>
        )}
      </div>

      {/* Card Footer: View PDF Button */}
      <div className="flex items-center justify-between pt-2 border-t border-light-border/60 dark:border-dark-border/60 mt-auto">
        <div className="text-[11px] text-light-muted dark:text-dark-muted font-medium">
          {note.branch || 'Academic Note'}
        </div>

        <button
          type="button"
          onClick={handleViewClick}
          className="h-9 px-4 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-primary hover:text-primary-foreground text-light-foreground dark:text-dark-foreground border border-light-border dark:border-dark-border hover:border-primary transition-all text-xs font-bold flex items-center justify-center gap-2 active:scale-95 shadow-sm shrink-0"
        >
          <Eye className="w-4 h-4 stroke-[2]" />
          <span>View PDF</span>
        </button>
      </div>

    </div>
  );
};

export default NoteCard;
