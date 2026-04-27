import React, { useState, useEffect } from 'react';
import api from '../services/api';
import NoteCard from '../components/NoteCard';
import '../components/Notes.css';

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

  const groupNotesBySubject = (notesList) => {
    return notesList.reduce((acc, note) => {
      const subj = note.subject || 'Uncategorized';
      if (!acc[subj]) acc[subj] = [];
      acc[subj].push(note);
      return acc;
    }, {});
  };

  const groupedNotes = groupNotesBySubject(notes);

  return (
    <div>
      <div className="mb-4">
        <h2>My Dashboard</h2>
        <p className="text-muted">Manage your uploaded notes here.</p>
      </div>

      {loading ? (
        <p className="text-center mt-4">Loading your notes...</p>
      ) : notes.length === 0 ? (
        <div className="card text-center mt-4">
          <p>You haven't uploaded any notes yet.</p>
        </div>
      ) : (
        <div>
          {Object.keys(groupedNotes).map(subject => (
            <div key={subject} className="mb-4">
              <h3 className="subject-heading">{subject}</h3>
              <div className="notes-grid">
                {groupedNotes[subject].map(note => (
                  <NoteCard 
                    key={note._id} 
                    note={note} 
                    onDelete={handleDeleteNote}
                    onDownload={handleDownloadNote}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
