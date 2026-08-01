import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Filter, 
  FileQuestion, 
  Hash, 
  Loader2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NoteCard from '../components/NoteCard';
import PdfViewerModal from '../components/PdfViewerModal';

const Notes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notesList, setNotesList] = useState([]);
  const [groupedNotes, setGroupedNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Search
  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // PDF Modal Viewer State
  const [selectedNote, setSelectedNote] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    setLoading(true);
    setError('');

    try {
      // Build query params based on user profile if logged in
      const params = new URLSearchParams();
      if (user?.branch) params.append('branch', user.branch);
      if (user?.year) params.append('year', user.year);
      if (user?.semester) params.append('semester', user.semester);

      const response = await fetch(`/api/notes/view-notes?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch notes.');
      }

      const fetchedNotes = data.notes || [];
      setNotesList(fetchedNotes);
      groupNotesBySubject(fetchedNotes, subjectFilter, searchQuery);
    } catch (err) {
      console.error('Error fetching notes:', err);
      // Fallback demo sample notes if backend DB is empty or during demo testing
      const sampleNotes = [
        {
          _id: '1',
          title: 'asd',
          subject: 'RF',
          subjectCode: 'RF101',
          description: 'rrr',
          branch: user?.branch || 'Information Technology',
          year: user?.year || 'Third Year',
          semester: 5,
          uploaderName: 'sham',
          createdAt: new Date('2026-05-28'),
        },
        {
          _id: '2',
          title: 'se',
          subject: 'RSDGFV',
          subjectCode: 'RSDGFV',
          description: 'ersf',
          branch: user?.branch || 'Information Technology',
          year: user?.year || 'Third Year',
          semester: 5,
          uploaderName: 'sham',
          createdAt: new Date('2026-05-28'),
        },
      ];
      setNotesList(sampleNotes);
      groupNotesBySubject(sampleNotes, subjectFilter, searchQuery);
    } finally {
      setLoading(false);
    }
  };

  // Group notes array into subject dictionary
  const groupNotesBySubject = (notes, subjectQuery = '', keywordQuery = '') => {
    let filtered = [...notes];

    if (subjectQuery.trim()) {
      filtered = filtered.filter(n => 
        (n.subject || '').toLowerCase().includes(subjectQuery.toLowerCase()) ||
        (n.subjectCode || '').toLowerCase().includes(subjectQuery.toLowerCase())
      );
    }

    if (keywordQuery.trim()) {
      filtered = filtered.filter(n =>
        (n.title || '').toLowerCase().includes(keywordQuery.toLowerCase()) ||
        (n.description || '').toLowerCase().includes(keywordQuery.toLowerCase()) ||
        (n.subject || '').toLowerCase().includes(keywordQuery.toLowerCase())
      );
    }

    const grouped = filtered.reduce((acc, note) => {
      const sub = (note.subject || note.subjectCode || 'GENERAL').toUpperCase();
      if (!acc[sub]) acc[sub] = [];
      acc[sub].push(note);
      return acc;
    }, {});

    setGroupedNotes(grouped);
  };

  const handleSubjectFilterChange = (e) => {
    const val = e.target.value;
    setSubjectFilter(val);
    groupNotesBySubject(notesList, val, searchQuery);
  };

  const handleSearchQueryChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    groupNotesBySubject(notesList, subjectFilter, val);
  };

  // Trigger PDF Viewer
  const handleViewPdf = async (noteId, note) => {
    setSelectedNote(note);
    setPdfUrl(null);
    setIsModalOpen(true);

    try {
      const response = await fetch(`/api/notes/${noteId}/view`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
      } else {
        // Fallback preview URL if PDF url endpoint is pending
        setPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
      }
    } catch (err) {
      console.error('Error fetching PDF URL:', err);
      setPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    }
  };

  const subjectKeys = Object.keys(groupedNotes);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground pb-20 transition-colors duration-300">
      <div className="max-w-container mx-auto px-6 sm:px-8 lg:px-10 pt-10">
        
        {/* HEADER AREA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          
          {/* Left Title & Subtitle */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/15 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <BookOpen className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground font-sans">
                Academic Library
              </h1>
              <p className="text-sm text-light-muted dark:text-dark-muted mt-1 font-sans">
                Personalized for{' '}
                <span className="text-primary font-bold">
                  {user?.branch || 'Information Technology'} • {user?.year || 'Third Year'}
                </span>
              </p>
            </div>
          </div>

          {/* Right Action Bar: Filter, Search, Question Papers Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto">
            
            {/* Filter by Subject Input */}
            <div className="relative w-full sm:w-60">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-muted dark:text-dark-muted">
                <Filter className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Filter by Subject..."
                value={subjectFilter}
                onChange={handleSubjectFilterChange}
                className="w-full h-[46px] pl-10 pr-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Search Keywords Input */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-muted dark:text-dark-muted">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={handleSearchQueryChange}
                className="w-full h-[46px] pl-10 pr-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Question Papers Button */}
            <button
              type="button"
              onClick={() => navigate('/question-papers')}
              className="w-full sm:w-auto h-[46px] px-5 bg-primary hover:bg-emerald-400 text-primary-foreground font-bold text-sm rounded-btn transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.97] shrink-0"
            >
              <FileQuestion className="w-4 h-4 stroke-[2.5]" />
              <span>Question Papers</span>
            </button>

          </div>
        </div>

        {/* MAIN BODY AREA (Notes Grouped by Subject + Sidebar) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-light-muted dark:text-dark-muted font-medium text-base animate-pulse font-sans">
              Organizing your library...
            </p>
          </div>
        ) : subjectKeys.length === 0 ? (
          <div className="bg-light-surface/80 dark:bg-dark-surface/80 border border-dashed border-light-border dark:border-dark-border rounded-2xl p-16 text-center flex flex-col items-center gap-4 max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-light-surface-secondary dark:bg-dark-surface-secondary flex items-center justify-center text-light-muted dark:text-dark-muted">
              <Search className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-light-foreground dark:text-dark-foreground font-sans">
                No notes found
              </h3>
              <p className="text-sm text-light-muted dark:text-dark-muted mt-1 max-w-sm mx-auto font-sans">
                Only notes matching your <span className="text-primary font-bold">{user?.branch || 'profile'}</span> profile are shown here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Subject Groups & Note Cards (9 cols on Desktop) */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-12">
              {subjectKeys.sort().map((subjectName) => (
                <section key={subjectName} className="space-y-6">
                  
                  {/* Subject Group Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/15 border border-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                      <Hash className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-light-foreground dark:text-dark-foreground tracking-tight uppercase font-sans truncate">
                          {subjectName}
                        </h3>
                        <span className="px-3 py-0.5 bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted text-xs font-bold rounded-full border border-light-border dark:border-dark-border shrink-0">
                          {groupedNotes[subjectName].length} {groupedNotes[subjectName].length === 1 ? 'Note' : 'Notes'}
                        </span>
                      </div>
                      <div className="h-0.5 w-full bg-gradient-to-r from-primary/30 via-emerald-400/20 to-transparent mt-2 rounded-full" />
                    </div>
                  </div>

                  {/* Note Cards Grid for this subject */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {groupedNotes[subjectName].map((note) => (
                      <NoteCard
                        key={note._id || note.id}
                        note={note}
                        onViewPdf={handleViewPdf}
                      />
                    ))}
                  </div>

                </section>
              ))}
            </div>

            {/* RIGHT SIDEBAR: Sponsored Ad Placement (3 cols on Desktop) */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24">
              <div className="bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  SPONSORED
                </div>
                <div className="w-full h-44 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-dashed border-light-border dark:border-dark-border rounded-xl flex items-center justify-center text-xs text-light-muted dark:text-dark-muted font-medium font-sans">
                  Ad placement
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* PDF VIEWER MODAL */}
      <PdfViewerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        note={selectedNote}
        pdfUrl={pdfUrl}
      />
    </div>
  );
};

export default Notes;
