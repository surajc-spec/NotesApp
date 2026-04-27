import React, { useState, useEffect } from 'react';
import api from '../services/api';
import NoteCard from '../components/NoteCard';
import { Search } from 'lucide-react';
import '../components/Notes.css';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (search.trim() === '') {
        await fetchNotes();
      } else {
        const res = await api.get(`/notes/search?q=${search}`);
        setNotes(res.data);
      }
    } catch (error) {
      console.error('Error searching:', error);
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
      <div className="flex justify-between items-center mb-4">
        <h2>All Notes</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search notes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '300px' }}
          />
          <button type="submit" className="btn btn-primary">
            <Search size={18} />
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-center mt-4">Loading notes...</p>
      ) : notes.length === 0 ? (
        <div className="card text-center mt-4">
          <p>No notes found.</p>
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

export default Home;
