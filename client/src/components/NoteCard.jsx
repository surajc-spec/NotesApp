import React, { useContext } from 'react';
import { Download, Trash2, Globe, Lock, Clock, Eye } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Notes.css';

const NoteCard = ({ note, onDelete, onDownload }) => {
  const { user } = useContext(AuthContext);
  const isOwner = user && note.uploader._id === user._id;

  const handleDownload = async () => {
    try {
      await api.post(`/notes/${note._id}/download`);
      onDownload(note._id);
      
      const fileUrl = `http://localhost:5000${note.fileUrl}`;
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = note.fileUrl.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Could not download file');
    }
  };

  const handlePreview = () => {
    window.open(`http://localhost:5000${note.fileUrl}`, '_blank');
  };

  const handleDelete = async () => {
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
    <div className="card note-card">
      <div className="note-header">
        <span className="note-subject">{note.subject}</span>
        {note.isPublic ? (
          <span className="badge badge-public"><Globe size={14} /> Public</span>
        ) : (
          <span className="badge badge-private"><Lock size={14} /> Private</span>
        )}
      </div>
      
      <h3 className="note-title">{note.title}</h3>
      <p className="note-description">{note.description}</p>
      
      <div className="note-meta">
        <div className="meta-item">
          <span className="meta-label">By:</span> {note.uploader.name}
        </div>
        <div className="meta-item">
          <Clock size={14} /> {formattedDate}
        </div>
      </div>

      <div className="note-footer">
        <div className="note-stats">
          <Download size={16} />
          <span>{note.downloads}</span>
        </div>
        <div className="note-actions">
          <button className="btn btn-outline btn-sm" onClick={handlePreview} title="Preview">
            <Eye size={16} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleDownload} title="Download">
            <Download size={16} />
          </button>
          {isOwner && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete} title="Delete">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
