import React, { useContext } from 'react';
import { Download, Trash2, Globe, Lock, Clock, Eye, User, FileText } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const NoteCard = ({ note, onDelete, onDownload, draggableProps, dragHandleProps, innerRef }) => {
  const { user } = useContext(AuthContext);
  const isOwner = user && note.uploader && note.uploader._id === user._id;

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      // 1. Increment download count in background
      await api.post(`/notes/${note._id}/download`);
      onDownload(note._id);
      
      // 2. Prepare the URL
      const isAbsolute = note.fileUrl.startsWith('http');
      const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://notesapp-x37n.onrender.com';
      let fileUrl = isAbsolute ? note.fileUrl : `${baseUrl}${note.fileUrl}`;
      
      const isCloudinary = fileUrl.includes('cloudinary.com');
      
      if (isCloudinary) {
        // Force download for Cloudinary files by injecting fl_attachment
        // This works for images/pdfs. For raw files, it might be ignored but won't hurt.
        if (fileUrl.includes('/upload/')) {
            fileUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');
        }
        
        // Use a direct link approach to avoid CORS fetch issues which return 'wrong' data
        const link = document.createElement('a');
        link.href = fileUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        // The download attribute only works for same-origin, but we set it anyway
        link.setAttribute('download', note.title || 'download');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback for non-cloudinary or local files
        window.open(fileUrl, '_blank');
      }
    } catch (error) {
      console.error('Error during download process:', error);
      alert('Download started, please check your browser downloads.');
    }
  };

  const handlePreview = (e) => {
    e.stopPropagation();
    const isAbsolute = note.fileUrl.startsWith('http');
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://notesapp-x37n.onrender.com';
    window.open(isAbsolute ? note.fileUrl : `${baseUrl}${note.fileUrl}`, '_blank');
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
          <div className="flex items-center gap-1 text-accent font-bold">
            <Download size={14} />
            <span className="text-sm">{note.downloads}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={handlePreview} 
                className="p-2 bg-surface-secondary text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                title="Preview"
            >
              <Eye size={16} />
            </button>
            <button 
                onClick={handleDownload} 
                className="p-2 bg-accent text-accent-foreground rounded-lg hover:scale-110 transition-all duration-200 shadow-lg shadow-accent/20"
                title="Download"
            >
              <Download size={16} />
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
