import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import NoteCard from '../components/NoteCard';
import { Search, Filter, Loader2, BookOpen } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AuthContext } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchNotes();
  }, [user, subject]); // Re-fetch when user (profile) or subject filter changes

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notes?subject=${subject}`);
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
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
      setNotes(res.data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(notes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setNotes(items);
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note._id !== id));
  };

  const handleDownloadNote = (id) => {
    setNotes(notes.map(note => 
      note._id === id ? { ...note, downloads: note.downloads + 1 } : note
    ));
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

  return (
    <div className="pb-20">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
                <BookOpen size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-bold text-foreground">Academic Library</h2>
                <p className="text-muted">Filtered for <span className="text-accent font-bold">{user?.branch} • {user?.year}</span></p>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="w-full sm:w-64">
                <CustomSelect 
                    options={subjectOptions}
                    value={subject}
                    onChange={setSubject}
                    icon={Filter}
                />
            </div>

            <form onSubmit={handleSearch} className="w-full sm:w-auto relative group">
                <input 
                    type="text" 
                    className="w-full sm:w-[350px] pl-12 pr-4 py-3.5 bg-surface border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground placeholder:text-muted" 
                    placeholder="Search titles or content..." 
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
            <p className="text-muted font-medium text-lg">Analyzing the library...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-[3rem] p-24 text-center flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center text-muted">
            <Search size={48} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">No matching notes found</h3>
            <p className="text-muted max-w-sm mx-auto mt-2">Try adjusting your subject filter or search terms. Only notes from your branch and year are visible.</p>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="notes-list" direction="vertical">
                {(provided) => (
                    <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                    >
                        {notes.map((note, index) => (
                            <Draggable key={note._id} draggableId={note._id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`${snapshot.isDragging ? 'z-50' : ''} transition-all`}
                                    >
                                        <NoteCard 
                                            note={note} 
                                            onDelete={handleDeleteNote}
                                            onDownload={handleDownloadNote}
                                            draggableProps={{}} 
                                            dragHandleProps={provided.dragHandleProps}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default Home;
