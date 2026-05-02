import React, { useState, useEffect } from 'react';
import api from '../services/api';
import NoteCard from '../components/NoteCard';
import { LayoutDashboard, PlusCircle, Loader2, BookX } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyNotes();
  }, []);

  const fetchMyNotes = async () => {
    try {
      const res = await api.get('/notes/mine');
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching my notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note._id !== id));
  };

  const handleDownloadNote = (id) => {
    setNotes(notes.map(note => 
      note._id === id ? { ...note, downloads: note.downloads + 1 } : note
    ));
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">My Dashboard</h2>
            <p className="text-muted">Manage and track your knowledge contributions</p>
        </div>
        
        <Link 
            to="/upload" 
            className="px-6 py-3.5 bg-accent text-accent-foreground rounded-field font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-accent/20"
        >
            <PlusCircle size={20} />
            Upload New Note
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-accent" size={48} />
            <p className="text-muted font-medium">Fetching your collection...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-[2rem] p-20 text-center flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center text-muted/50">
            <BookX size={48} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">No notes uploaded yet</h3>
            <p className="text-muted max-w-sm mx-auto">Start sharing your knowledge with the community and track your downloads here.</p>
          </div>
          <Link 
            to="/upload" 
            className="px-8 py-3 bg-surface-secondary border border-border rounded-field font-bold hover:bg-surface-tertiary transition-all"
          >
            Upload Your First Note
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
                <NoteCard 
                    key={note._id} 
                    note={note} 
                    onDelete={handleDeleteNote}
                    onDownload={handleDownloadNote}
                    draggableProps={{}}
                    dragHandleProps={{}}
                />
            ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
