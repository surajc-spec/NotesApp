import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  BookOpen, 
  Hash, 
  Loader2, 
  Eye,
  RotateCcw,
  Sparkles,
  FileQuestion
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

const QuestionPapers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [papersList, setPapersList] = useState([]);
  const [groupedPapers, setGroupedPapers] = useState({});
  const [loading, setLoading] = useState(true);

  // Interactive Academic Filters (Default to user profile if available, else all)
  const [branchFilter, setBranchFilter] = useState(user?.branch || '');
  const [semesterFilter, setSemesterFilter] = useState(user?.semester ? String(user.semester) : '');
  const [examTypeFilter, setExamTypeFilter] = useState('all');

  // Search & Subject in-memory filters
  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync user profile defaults on login / logout
  useEffect(() => {
    if (user) {
      setBranchFilter(user.branch || '');
      setSemesterFilter(user.semester ? String(user.semester) : '');
    }
  }, [user]);

  // Fetch whenever academic filters change
  useEffect(() => {
    fetchQuestionPapers(branchFilter, semesterFilter, examTypeFilter);
  }, [branchFilter, semesterFilter, examTypeFilter]);

  const fetchQuestionPapers = async (branchVal = branchFilter, semVal = semesterFilter, examVal = examTypeFilter) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const params = new URLSearchParams();
      if (branchVal && branchVal !== 'all') params.append('branch', branchVal);
      if (semVal && semVal !== 'all') params.append('semester', semVal);
      if (examVal && examVal !== 'all') params.append('examType', examVal);
      params.append('limit', '200');

      const response = await fetch(`/api/question-papers/view-question-papers?${params.toString()}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch question papers.');
      }

      const fetchedPapers = data.questionPapers || [];
      setPapersList(fetchedPapers);
      groupPapersBySubject(fetchedPapers, subjectFilter, searchQuery);
    } catch (err) {
      console.error('Error fetching question papers:', err);
      setPapersList([]);
      setGroupedPapers({});
    } finally {
      setLoading(false);
    }
  };

  const groupPapersBySubject = (papers, subjectQuery = '', keywordQuery = '') => {
    let filtered = [...papers];

    if (subjectQuery.trim()) {
      filtered = filtered.filter(p => 
        (p.subject || '').toLowerCase().includes(subjectQuery.toLowerCase()) ||
        (p.subjectCode || '').toLowerCase().includes(subjectQuery.toLowerCase())
      );
    }

    if (keywordQuery.trim()) {
      filtered = filtered.filter(p =>
        (p.title || '').toLowerCase().includes(keywordQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(keywordQuery.toLowerCase()) ||
        (p.subject || '').toLowerCase().includes(keywordQuery.toLowerCase())
      );
    }

    const grouped = filtered.reduce((acc, paper) => {
      const sub = (paper.subject || paper.subjectCode || 'GENERAL').toUpperCase();
      if (!acc[sub]) acc[sub] = [];
      acc[sub].push(paper);
      return acc;
    }, {});

    setGroupedPapers(grouped);
  };

  const handleSubjectFilterChange = (e) => {
    const val = e.target.value;
    setSubjectFilter(val);
    groupPapersBySubject(papersList, val, searchQuery);
  };

  const handleSearchQueryChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    groupPapersBySubject(papersList, subjectFilter, val);
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

  const handleViewPdf = (paperId) => {
    navigate(`/pdf-viewer?type=question-paper&id=${paperId}`);
  };

  const subjectKeys = Object.keys(groupedPapers);
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
                Question Papers
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
              {examTypeFilter !== 'all' ? ` • ${examTypeFilter.toUpperCase()} Papers` : ''}
            </p>
          </div>

          {/* Right Action Bar: Filter, Search, All Notes Button */}
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

            {/* All Notes Button */}
            <button
              type="button"
              onClick={() => navigate('/notes')}
              className="w-full sm:w-auto h-[44px] px-4 bg-primary hover:bg-emerald-400 text-primary-foreground font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shrink-0 shadow-sm"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>All Notes</span>
            </button>

          </div>
        </div>

        {/* ACADEMIC FILTER SELECTORS BAR */}
        <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              
              {/* Branch Select */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1">
                  Branch
                </label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-xl text-xs font-bold text-light-foreground dark:text-dark-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
                >
                  {BRANCH_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-light-surface dark:bg-dark-surface">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester Select */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1">
                  Semester
                </label>
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-xl text-xs font-bold text-light-foreground dark:text-dark-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
                >
                  {SEMESTER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-light-surface dark:bg-dark-surface">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Type Toggle */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1">
                  Exam Papers
                </label>
                <div className="grid grid-cols-3 gap-1 h-10 p-1 bg-light-surface-secondary dark:bg-dark-surface-secondary rounded-xl border border-light-border dark:border-dark-border">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'In-Sem', value: 'insem' },
                    { label: 'End-Sem', value: 'endsem' }
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setExamTypeFilter(mode.value)}
                      className={`h-full text-[11px] font-extrabold rounded-lg transition-all flex items-center justify-center ${
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
                  title="Show all question papers"
                  className="h-10 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Show All</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* MAIN BODY AREA */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-light-muted dark:text-dark-muted font-medium text-base animate-pulse font-sans">
              Fetching question papers...
            </p>
          </div>
        ) : subjectKeys.length === 0 ? (
          <div className="bg-light-surface/80 dark:bg-dark-surface/80 border border-dashed border-light-border dark:border-dark-border rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center gap-4 max-w-xl mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <FileQuestion className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-light-foreground dark:text-dark-foreground font-sans">
                No question papers found
              </h3>
              <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted mt-1.5 max-w-md mx-auto font-sans leading-relaxed">
                {branchFilter || semesterFilter ? (
                  <>
                    No question papers uploaded yet for <strong className="text-light-foreground dark:text-dark-foreground">{branchFilter || 'your branch'}</strong> {semesterFilter ? `(Semester ${semesterFilter})` : ''}. You can explore all question papers in the library!
                  </>
                ) : (
                  'No question papers matched your search query.'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              className="h-11 px-6 bg-primary hover:bg-emerald-400 text-primary-foreground font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 mt-2"
            >
              <FileQuestion className="w-4 h-4 stroke-[2.5]" />
              <span>Explore All Question Papers</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Subject Groups & Cards */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-12">
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
                          {groupedPapers[subjectName].length} {groupedPapers[subjectName].length === 1 ? 'Paper' : 'Papers'}
                        </span>
                      </div>
                      <div className="h-0.5 w-full bg-gradient-to-r from-primary/30 via-emerald-400/20 to-transparent mt-2 rounded-full" />
                    </div>
                  </div>

                  {/* Question Paper Cards Grid (Compact 4-Column Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupedPapers[subjectName].map((paper) => {
                      const paperId = paper._id || paper.id;
                      return (
                        <div
                          key={paperId}
                          className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 transition-all duration-200 hover:scale-[1.02] hover:border-primary/40 shadow-sm group max-w-sm sm:max-w-none w-full"
                        >
                          {/* Left: Subject Code & Title */}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="text-[11px] font-extrabold text-primary uppercase tracking-wider">
                              {paper.subjectCode || paper.subject || 'PAPER'}
                            </div>
                            <h4 className="text-sm font-bold text-light-foreground dark:text-dark-foreground font-sans truncate">
                              {paper.title}
                            </h4>
                          </div>

                          {/* Right: View PDF Button */}
                          <button
                            type="button"
                            onClick={() => handleViewPdf(paperId)}
                            className="h-8 px-3 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-primary hover:text-primary-foreground text-light-foreground dark:text-dark-foreground border border-light-border dark:border-dark-border hover:border-primary transition-all text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-sm shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2]" />
                            <span>View PDF</span>
                          </button>

                        </div>
                      );
                    })}
                  </div>

                </section>
              ))}
            </div>

            {/* RIGHT SIDEBAR */}
            {/* <div className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24">
              <div className="bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  SPONSORED
                </div>
                <div className="w-full h-44 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-dashed border-light-border dark:border-dark-border rounded-xl flex items-center justify-center text-xs text-light-muted dark:text-dark-muted font-medium font-sans">
                  Ad placement
                </div>
              </div>
            </div> */}

          </div>
        )}

      </div>
    </div>
  );
};

export default QuestionPapers;
