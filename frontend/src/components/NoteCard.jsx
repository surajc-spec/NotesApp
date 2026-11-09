import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Share2, FileText } from 'lucide-react';
import { shareToWhatsApp } from '../utils/shareUtils';
import NoteSummaryModal from './NoteSummaryModal';

const NoteCard = ({ note }) => {
  const navigate = useNavigate();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

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

  const noteId = note._id || note.id;

  return (
    <>
      <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 hover:scale-[1.01] hover:border-primary/40 shadow-sm group w-full">
        
        {/* Top: Title & Share Action */}
        <div className="flex items-start justify-between gap-2.5 min-w-0">
          <h4
            title={note.title}
            onClick={handleViewClick}
            className="text-sm font-bold text-light-foreground dark:text-dark-foreground font-sans line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer flex-1"
          >
            {note.title}
          </h4>

          <button
            type="button"
            onClick={handleShareClick}
            title="Share to WhatsApp"
            aria-label="Share note on WhatsApp"
            className="h-7 w-7 rounded-lg bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-emerald-500/10 text-light-muted dark:text-dark-muted hover:text-emerald-500 border border-light-border dark:border-dark-border hover:border-emerald-500/30 transition-all flex items-center justify-center active:scale-95 cursor-pointer shrink-0 mt-0.5"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Actions: Symmetrical 2-Column Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-light-border/60 dark:border-dark-border/60">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSummaryOpen(true);
            }}
            title="AI Exam Revision Sheet"
            aria-label="View AI Exam Revision Sheet"
            className="h-8 px-2 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-primary/10 text-light-foreground dark:text-dark-foreground hover:text-primary border border-light-border dark:border-dark-border hover:border-primary/30 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">Summary</span>
          </button>

          <button
            type="button"
            onClick={handleViewClick}
            className="h-8 px-2 rounded-xl bg-primary hover:bg-emerald-400 text-primary-foreground border border-primary transition-all text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
            <span className="truncate">View PDF</span>
          </button>
        </div>

      </div>

      <NoteSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        noteId={noteId}
        noteTitle={note.title}
        subject={note.subjectCode || note.subject}
      />
    </>
  );
};

export default NoteCard;
