import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

const NoteCard = ({ note }) => {
  const navigate = useNavigate();

  const handleViewClick = () => {
    const id = note._id || note.id;
    navigate(`/pdf-viewer?type=note&id=${id}`);
  };

  return (
    <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] hover:border-primary/40 shadow-sm group">
      
      {/* Subject Code & Title */}
      <div className="space-y-1">
        <div className="text-xs font-extrabold text-primary uppercase tracking-wider">
          {note.subjectCode || note.subject || 'NOTE'}
        </div>
        <h4 className="text-lg font-bold text-light-foreground dark:text-dark-foreground font-sans truncate">
          {note.title}
        </h4>
      </div>

      {/* Divider & View PDF Action Row */}
      <div className="pt-4 border-t border-light-border dark:border-dark-border mt-4 flex items-center justify-end">
        <button
          type="button"
          onClick={handleViewClick}
          className="h-9 px-4 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-primary hover:text-primary-foreground text-light-foreground dark:text-dark-foreground border border-light-border dark:border-dark-border hover:border-primary transition-all text-xs font-bold flex items-center justify-center gap-2 active:scale-95 shadow-sm"
        >
          <Eye className="w-4 h-4 stroke-[2]" />
          <span>View PDF</span>
        </button>
      </div>

    </div>
  );
};

export default NoteCard;
