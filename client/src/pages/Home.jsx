import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import NoteCard from '../components/NoteCard';
import { Search, Filter, Loader2, BookOpen, ChevronRight, Hash } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';

const Home = () => {
  const [groupedNotes, setGroupedNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchNotes();
  }, [user, subjectFilter]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notes?subject=${subjectFilter}`);
      const data = res.data;
      
      // Safety check: If backend returns an array, group it here
      if (Array.isArray(data)) {
        const grouped = data.reduce((acc, note) => {
          const sub = note.subject || 'Uncategorized';
          if (!acc[sub]) acc[sub] = [];
          acc[sub].push(note);
          return acc;
        }, {});
        setGroupedNotes(grouped);
      } else {
        setGroupedNotes(data || {});
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setGroupedNotes({});
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (search.trim() === '') {
        fetchNotes();
        return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/notes/search?q=${search}`);
      // Search might not return grouped data by default from backend search route,
      // let's ensure we group it if it's an array
      const data = res.data;
      if (Array.isArray(data)) {
        const grouped = data.reduce((acc, note) => {
          const sub = note.subject || 'Uncategorized';
          if (!acc[sub]) acc[sub] = [];
          acc[sub].push(note);
          return acc;
        }, {});
        setGroupedNotes(grouped);
      } else {
        setGroupedNotes(data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = (id) => {
    const newGrouped = { ...groupedNotes };
    Object.keys(newGrouped).forEach(sub => {
      newGrouped[sub] = newGrouped[sub].filter(note => note._id !== id);
      if (newGrouped[sub].length === 0) delete newGrouped[sub];
    });
    setGroupedNotes(newGrouped);
  };

  const handleDownloadNote = (id) => {
    const newGrouped = { ...groupedNotes };
    Object.keys(newGrouped).forEach(sub => {
      newGrouped[sub] = newGrouped[sub].map(note => 
        note._id === id ? { ...note, downloads: note.downloads + 1 } : note
      );
    });
    setGroupedNotes(newGrouped);
  };

  const subjectOptions = [
    { label: 'All Subjects', value: 'All' },
    { label: 'DBMS', value: 'DBMS' },
    { label: 'Data Structures', value: 'Data Structures' },
    { label: 'Operating Systems', value: 'Operating Systems' },
    { label: 'Computer Networks', value: 'Computer Networks' },
    { label: 'Mathematics', value: 'Mathematics' },
    { label: 'Physics', value: 'Physics' },
    { label: 'Other', value: 'Other' },
  ];

  const subjects = Object.keys(groupedNotes);

  return (
    <div className="pb-20">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
                <BookOpen size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-bold text-foreground tracking-tight">Academic Library</h2>
                <p className="text-muted">Personalized for <span className="text-accent font-bold">{user?.branch} • {user?.year}</span></p>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="w-full sm:w-64 relative group">
                <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3.5 bg-surface border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground placeholder:text-muted" 
                    placeholder="Filter by Subject..." 
                    value={subjectFilter === 'All' ? '' : subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value || 'All')}
                />
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
            </div>

            <form onSubmit={handleSearch} className="w-full sm:w-auto relative group">
                <input 
                    type="text" 
                    className="w-full sm:w-[350px] pl-12 pr-4 py-3.5 bg-surface border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground placeholder:text-muted" 
                    placeholder="Search keywords..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
                <button type="submit" className="hidden">Search</button>
            </form>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-accent" size={56} />
            <p className="text-muted font-medium text-lg animate-pulse">Organizing your library...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-[3rem] p-24 text-center flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center text-muted">
            <Search size={48} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">No notes found</h3>
            <p className="text-muted max-w-sm mx-auto mt-2">Only notes matching your <span className="text-accent font-medium">{user?.branch} and {user?.year}</span> profile are shown here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          {subjects.sort().map((sub) => (
            <section key={sub} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-accent/5 text-accent rounded-xl border border-accent/10">
                    <Hash size={24} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-foreground uppercase tracking-tight">{sub}</h3>
                        <span className="px-3 py-1 bg-surface-secondary text-muted text-xs font-bold rounded-full border border-border">
                            {groupedNotes[sub].length} {groupedNotes[sub].length === 1 ? 'Note' : 'Notes'}
                        </span>
                    </div>
                    <div className="h-0.5 w-full bg-gradient-to-r from-accent/30 to-transparent mt-2 rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {groupedNotes[sub].map((note) => (
                  <NoteCard 
                    key={note._id} 
                    note={note} 
                    onDelete={handleDeleteNote}
                    onDownload={handleDownloadNote}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
