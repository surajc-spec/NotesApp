import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Filter, 
  FileQuestion, 
  Loader2,
  SlidersHorizontal,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NoteCard from '../components/NoteCard';
import PdfViewerModal from '../components/PdfViewerModal';
import CustomSelect from '../components/CustomSelect';

const BRANCH_OPTIONS = [
  { label: 'All Branches', value: '' },
  { label: 'Computer Engineering', value: 'Computer Engineering' },
  { label: 'Information Technology', value: 'Information Technology' },
  { label: 'Electronics & Telecommunication', value: 'Electronics & Telecommunication' },
];

const SEMESTER_OPTIONS = [
  { label: 'All Semesters', value: '' },
  { label: 'Semester 1 (FE)', value: '1' },
  { label: 'Semester 2 (FE)', value: '2' },
  { label: 'Semester 3 (SE)', value: '3' },
  { label: 'Semester 4 (SE)', value: '4' },
  { label: 'Semester 5 (TE)', value: '5' },
  { label: 'Semester 6 (TE)', value: '6' },
  { label: 'Semester 7 (BE)', value: '7' },
  { label: 'Semester 8 (BE)', value: '8' },
];

const Notes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notesList, setNotesList] = useState([]);
  const [groupedNotes, setGroupedNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive Academic Filters (Default to user profile if available, else all)
  const [branchFilter, setBranchFilter] = useState(user?.branch || '');
  const [semesterFilter, setSemesterFilter] = useState(user?.semester ? String(user.semester) : '');
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  
  // Search & Subject in-memory filters
  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // PDF Modal Viewer State
  const [selectedNote, setSelectedNote] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync user profile defaults on login / logout
  useEffect(() => {
    if (user) {
      setBranchFilter(user.branch || '');
      setSemesterFilter(user.semester ? String(user.semester) : '');
    }
  }, [user]);

  // Fetch whenever academic filters change
  useEffect(() => {
    fetchNotes(branchFilter, semesterFilter, examTypeFilter);
  }, [branchFilter, semesterFilter, examTypeFilter]);

  const fetchNotes = async (branchVal = branchFilter, semVal = semesterFilter, examVal = examTypeFilter) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (branchVal && branchVal !== 'all') params.append('branch', branchVal);
      if (semVal && semVal !== 'all') params.append('semester', semVal);
      if (examVal && examVal !== 'all') params.append('examType', examVal);
      params.append('limit', '200');

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
      setNotesList([]);
      groupNotesBySubject([], subjectFilter, searchQuery);
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

  const handleClearFilters = () => {
    setBranchFilter('');
    setSemesterFilter('');
    setExamTypeFilter('all');
    setSubjectFilter('');
    setSearchQuery('');
  };

  const handleResetToMyProfile = () => {
    if (user) {
      setBranchFilter(user.branch || '');
      setSemesterFilter(user.semester ? String(user.semester) : '');
      setExamTypeFilter('all');
      setSubjectFilter('');
      setSearchQuery('');
    }
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
        setPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
      }
    } catch (err) {
      console.error('Error fetching PDF URL:', err);
      setPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    }
  };

  const subjectKeys = Object.keys(groupedNotes);
  const isFiltered = Boolean(branchFilter || semesterFilter || (examTypeFilter && examTypeFilter !== 'all') || subjectFilter || searchQuery);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground pb-20 transition-colors duration-300">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* HEADER AREA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          
          {/* Left Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-light-foreground dark:text-dark-foreground font-sans">
                Academic Library
              </h1>
              {user && (
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-extrabold">
                  Personalized
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted mt-1 font-sans">
              {branchFilter ? branchFilter : 'All Engineering Branches'} 
              {semesterFilter ? ` • Semester ${semesterFilter}` : ''}
              {examTypeFilter !== 'all' ? ` • ${examTypeFilter.toUpperCase()} Notes` : ''}
            </p>
          </div>

          {/* Right Action Bar: Search, Question Papers Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            
            {/* Filter by Subject Input */}
            <div className="relative w-full sm:w-56">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-muted dark:text-dark-muted">
                <Filter className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Filter by Subject..."
                value={subjectFilter}
                onChange={handleSubjectFilterChange}
                className="w-full h-[44px] pl-10 pr-4 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-xs sm:text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {/* Search Keywords Input */}
            <div className="relative w-full sm:w-60">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-muted dark:text-dark-muted">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={handleSearchQueryChange}
                className="w-full h-[44px] pl-10 pr-4 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-xs sm:text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {/* Question Papers Button */}
            <button
              type="button"
              onClick={() => navigate('/question-papers')}
              className="w-full sm:w-auto h-[44px] px-4 bg-primary hover:bg-emerald-400 text-primary-foreground font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shrink-0 shadow-sm"
            >
              <FileQuestion className="w-4 h-4 stroke-[2.5]" />
              <span>Question Papers</span>
            </button>

          </div>
        </div>

        {/* ACADEMIC FILTER SELECTORS BAR */}
        <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1">
              
              {/* Branch Select */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                  Branch
                </label>
                <CustomSelect
                  name="branch"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  options={BRANCH_OPTIONS}
                  placeholder="All Branches"
                />
              </div>

              {/* Semester Select */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                  Semester
                </label>
                <CustomSelect
                  name="semester"
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  options={SEMESTER_OPTIONS}
                  placeholder="All Semesters"
                />
              </div>

              {/* Exam Type Toggle */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                  Exam Notes
                </label>
                <div className="grid grid-cols-3 gap-1 h-[50px] p-1 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-field border border-light-border dark:border-dark-border">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'In-Sem', value: 'insem' },
                    { label: 'End-Sem', value: 'endsem' }
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setExamTypeFilter(mode.value)}
                      className={`h-full text-xs font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                        examTypeFilter === mode.value
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Reset / My Profile Actions */}
            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-4">
              {user && (
                <button
                  type="button"
                  onClick={handleResetToMyProfile}
                  title="Reset to my registered branch & semester"
                  className="h-10 px-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border hover:border-primary text-light-foreground dark:text-dark-foreground text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">My Profile</span>
                </button>
              )}

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  title="Show all notes in library"
                  className="h-10 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Show All</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* MAIN BODY AREA (Notes Grouped by Subject) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-light-muted dark:text-dark-muted font-medium text-base animate-pulse font-sans">
              Organizing your library...
            </p>
          </div>
        ) : subjectKeys.length === 0 ? (
          <div className="bg-light-surface/80 dark:bg-dark-surface/80 border border-dashed border-light-border dark:border-dark-border rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center gap-4 max-w-xl mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-light-foreground dark:text-dark-foreground font-sans">
                No notes found for current filter
              </h3>
              <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted mt-1.5 max-w-md mx-auto font-sans leading-relaxed">
                {branchFilter || semesterFilter ? (
                  <>
                    No notes uploaded yet for <strong className="text-light-foreground dark:text-dark-foreground">{branchFilter || 'your branch'}</strong> {semesterFilter ? `(Semester ${semesterFilter})` : ''}. You can explore all available notes in the NoteShare library!
                  </>
                ) : (
                  'No notes matched your search query.'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              className="h-11 px-6 bg-primary hover:bg-emerald-400 text-primary-foreground font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 mt-2"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>Explore All Library Notes</span>
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {subjectKeys.sort().map((subjectName) => (
              <section key={subjectName} className="space-y-6">
                
                {/* Subject Group Header */}
                <div className="flex items-center gap-3">
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

                {/* Note Cards Grid for this subject (Compact 4-Column Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedNotes[subjectName].map((note) => (
                    <NoteCard
                      key={note._id || note.id}
                      note={note}
                    />
                  ))}
                </div>

              </section>
            ))}
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
