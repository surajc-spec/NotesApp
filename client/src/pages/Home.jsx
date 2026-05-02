import React, { useState, useEffect } from 'react';
import api from '../services/api';
import NoteCard from '../components/NoteCard';
import { Search, Filter, Loader2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(notes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setNotes(items);
    // Note: In a real app, you'd save this order to the backend
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
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">Academic Library</h2>
            <p className="text-muted">Explore and manage high-quality study materials</p>
        </div>
        
        <form onSubmit={handleSearch} className="w-full md:w-auto relative group">
          <input 
            type="text" 
            className="w-full md:w-[400px] pl-12 pr-4 py-3.5 bg-surface border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground placeholder:text-muted" 
            placeholder="Search by subject, title or content..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-accent" size={48} />
            <p className="text-muted font-medium">Curating notes for you...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-[2rem] p-20 text-center flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center text-muted">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-bold">No results found</h3>
          <p className="text-muted max-w-xs">We couldn't find any notes matching your criteria. Try a different search term or upload your own.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="notes-list" direction="vertical">
                {(provided) => (
                    <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {notes.map((note, index) => (
                            <Draggable key={note._id} draggableId={note._id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`${snapshot.isDragging ? 'z-50' : ''}`}
                                    >
                                        <NoteCard 
                                            note={note} 
                                            onDelete={handleDeleteNote}
                                            onDownload={handleDownloadNote}
                                            draggableProps={{}} // We already applied them above
                                            dragHandleProps={provided.dragHandleProps}
                                            innerRef={null} // Already used
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
