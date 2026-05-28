import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import NoteCard from '../components/NoteCard';
import { AuthContext } from '../context/AuthContext';
import AdUnit from '../components/AdUnit';
import { normalizeSubject } from '../utils/subjectUtils';
import { ChevronDown, ChevronRight, FileQuestion, Filter, Hash, Loader2, PlusCircle, Search } from 'lucide-react';

const QuestionPapers = () => {
  const [groupedQuestionPapers, setGroupedQuestionPapers] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const { user } = useContext(AuthContext);

  const normalizeGroupedResponse = (data) => {
    const payload = data?.data || data;

    if (Array.isArray(payload)) {
      return payload.reduce((acc, questionPaper) => {
        const subject = normalizeSubject(questionPaper.subject) || 'UNCATEGORIZED';
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(questionPaper);
        return acc;
      }, {});
    }

    return payload || {};
  };

  const fetchQuestionPapers = useCallback(async (searchTerm = '') => {
    setLoading(true);

    try {
      const normalizedSubject = subjectFilter === 'All' ? 'All' : normalizeSubject(subjectFilter);
      const res = await api.get('/questionpapers', {
        params: {
          subject: normalizedSubject,
          search: searchTerm.trim() || undefined,
          _t: Date.now(),
        },
      });

      setGroupedQuestionPapers(normalizeGroupedResponse(res.data));
    } catch (error) {
      console.error('Error fetching question papers:', error);
      setGroupedQuestionPapers({});
    } finally {
      setLoading(false);
    }
  }, [subjectFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuestionPapers();
  }, [fetchQuestionPapers, user]);

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchQuestionPapers(search);
  };

  const subjects = Object.keys(groupedQuestionPapers);

  const handleDeleteQuestionPaper = (id) => {
    const nextGrouped = { ...groupedQuestionPapers };
    Object.keys(nextGrouped).forEach((subject) => {
      nextGrouped[subject] = nextGrouped[subject].filter((questionPaper) => questionPaper._id !== id);
      if (nextGrouped[subject].length === 0) delete nextGrouped[subject];
    });
    setGroupedQuestionPapers(nextGrouped);
  };

  const toggleSubject = (subject) => {
    setExpandedSubjects((current) => ({
      ...current,
      [subject]: !current[subject],
    }));
  };

  return (
    <div className="pb-20">
      <AdUnit placement="top" className="mb-8" />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
            <FileQuestion size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Question Papers</h2>
            <p className="text-muted">
              Personalized for <span className="text-accent font-bold">{user?.branch} - {user?.year}</span>
            </p>
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
              placeholder="Search question papers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
            <button type="submit" className="hidden">Search</button>
          </form>

          <Link
            to="/questionpapers/upload"
            className="w-full sm:w-auto px-5 py-3.5 bg-accent text-accent-foreground rounded-field font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-accent/20 whitespace-nowrap"
          >
            <PlusCircle size={20} />
            Upload
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-accent" size={56} />
          <p className="text-muted font-medium text-lg animate-pulse">Organizing question papers...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-[3rem] p-24 text-center flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center text-muted">
            <Search size={48} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">No question papers found</h3>
            <p className="text-muted max-w-sm mx-auto mt-2">
              Only question papers matching your <span className="text-accent font-medium">{user?.branch} and {user?.year}</span> profile are shown here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-16">
            {subjects.sort().map((subject) => {
              const isExpanded = !!expandedSubjects[subject];

              return (
                <section key={subject} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className="w-full rounded-field border border-border bg-surface p-5 text-left transition-all hover:border-accent/40 hover:bg-surface-secondary"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-accent/5 text-accent rounded-xl border border-accent/10">
                        <Hash size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-bold text-foreground uppercase tracking-tight">{subject}</h3>
                          <span className="px-3 py-1 bg-surface-secondary text-muted text-xs font-bold rounded-full border border-border">
                            {groupedQuestionPapers[subject].length} {groupedQuestionPapers[subject].length === 1 ? 'Paper' : 'Papers'}
                          </span>
                        </div>
                        <div className="h-0.5 w-full bg-gradient-to-r from-accent/30 to-transparent mt-2 rounded-full" />
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-secondary text-accent">
                        {isExpanded ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pt-8">
                      {groupedQuestionPapers[subject].map((questionPaper) => (
                        <NoteCard
                          key={questionPaper._id}
                          note={questionPaper}
                          onDelete={handleDeleteQuestionPaper}
                          previewBasePath="/questionpapers"
                          deleteBasePath="/questionpapers"
                          itemLabel="Question Paper"
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <AdUnit placement="sidebar" />
            </div>
          </div>
        </div>
      )}

      <AdUnit placement="footer" className="mt-12" />
    </div>
  );
};

export default QuestionPapers;
