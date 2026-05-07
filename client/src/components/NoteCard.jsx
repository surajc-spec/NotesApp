import { useContext } from 'react';
import { Trash2, Globe, Lock, Clock, Eye, User, FileText, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const NoteCard = ({ note, onDelete, draggableProps, dragHandleProps, innerRef }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isOwner = user && note.uploader && note.uploader._id === user._id;

  const handlePreview = (e) => {
    e.stopPropagation();
    navigate(`/notes/${note.noteId || note._id}/read`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.delete(`/notes/${note._id}`);
        onDelete(note._id);
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Could not delete note');
      }
    }
  };

  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div 
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className="bg-surface border border-border rounded-field p-5 flex flex-col gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                <FileText size={20} />
            </div>
            <div>
                <span className="text-[10px] uppercase tracking-wider text-muted font-bold block">{note.subject || 'General'}</span>
                <h3 className="font-bold text-foreground leading-tight line-clamp-1">{note.title}</h3>
            </div>
        </div>
        
        {note.isPublic ? (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-success/10 text-success rounded-full">
            <Globe size={10} /> PUBLIC
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-warning/10 text-warning rounded-full">
            <Lock size={10} /> PRIVATE
          </span>
        )}
      </div>

      <p className="text-sm text-muted line-clamp-2 h-10">{note.description}</p>
      
      <div className="pt-4 border-t border-border flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-surface-secondary rounded-full flex items-center justify-center border border-border">
                <User size={12} />
            </div>
            <span className="font-medium">{note.uploader?.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-accent font-bold">
            <ShieldCheck size={14} />
            <span className="text-sm">Secure preview</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={handlePreview} 
                className="p-2 bg-surface-secondary text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                title="Preview"
            >
              <Eye size={16} />
            </button>
            {isOwner && (
              <button 
                onClick={handleDelete} 
                className="p-2 bg-danger/10 text-danger rounded-lg hover:bg-danger hover:text-danger-foreground transition-all duration-200"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
