import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Maximize, 
  Minimize, 
  ExternalLink, 
  FileText, 
  GraduationCap, 
  Loader2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

const PdfViewerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type') || 'note'; // 'note' | 'question-paper'
  const id = searchParams.get('id');

  const [pdfUrl, setPdfUrl] = useState('');
  const [documentDetails, setDocumentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    if (!id) {
      setError('No document ID specified.');
      setLoading(false);
      return;
    }

    fetchPdfData();
  }, [type, id]);

  // Handle browser fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const fetchPdfData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const endpoint = type === 'question-paper' 
        ? `/api/question-papers/${id}/view` 
        : `/api/notes/${id}/view`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load PDF preview.');
      }

      setPdfUrl(data.pdfUrl);
      if (data.note) setDocumentDetails(data.note);
      if (data.questionPaper) setDocumentDetails(data.questionPaper);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load PDF document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(type === 'question-paper' ? '/question-papers' : '/notes');
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground flex flex-col transition-colors duration-300">
      
      {/* TOP HEADER CONTROLS BAR */}
      <div className="bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-light-border dark:border-dark-border px-6 py-4 sticky top-[72px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Back Button & Title */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="h-10 px-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border hover:border-primary text-light-foreground dark:text-dark-foreground text-xs font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Back</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {type === 'question-paper' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Question Paper
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/20">
                    Study Note
                  </span>
                )}
                {documentDetails?.subjectCode && (
                  <span className="text-xs font-bold text-light-muted dark:text-dark-muted">
                    • {documentDetails.subjectCode}
                  </span>
                )}
              </div>
              <h1 className="text-lg font-bold text-light-foreground dark:text-dark-foreground truncate font-sans mt-0.5">
                {documentDetails?.title || (type === 'question-paper' ? 'Question Paper Preview' : 'Note Preview')}
              </h1>
            </div>
          </div>

          {/* Right: Actions Bar (Fullscreen & New Tab) */}
          <div className="flex items-center gap-3 shrink-0">
            {pdfUrl && (
              <>
                <button
                  type="button"
                  onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                  className="h-10 px-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border hover:border-primary text-light-foreground dark:text-dark-foreground text-xs font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Open Original</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="h-10 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-[0_4px_20px_rgba(54,215,157,0.35)] hover:bg-emerald-400 transition-all flex items-center gap-2 active:scale-95"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize className="w-4 h-4 stroke-[2.5]" />
                      <span>Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize className="w-4 h-4 stroke-[2.5]" />
                      <span>Fullscreen View</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* PDF VIEWER CONTAINER BODY */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col">
        <div 
          ref={containerRef}
          className={`flex-1 bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border rounded-2xl shadow-xl overflow-hidden flex flex-col relative transition-all ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none p-0' : 'min-h-[75vh]'
          }`}
        >

          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm font-bold text-light-foreground dark:text-dark-foreground animate-pulse">
                Preparing PDF document preview...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-light-foreground dark:text-dark-foreground">
                Unable to preview PDF
              </h3>
              <p className="text-sm text-light-muted dark:text-dark-muted max-w-md">
                {error}
              </p>
              <button
                onClick={fetchPdfData}
                className="h-10 px-6 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-emerald-400 transition-all"
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* Embedded PDF iframe */}
          {pdfUrl && !loading && !error && (
            <iframe
              src={pdfUrl}
              title={documentDetails?.title || 'PDF Preview'}
              className="w-full flex-1 border-none bg-white"
            />
          )}

        </div>
      </div>

    </div>
  );
};

export default PdfViewerPage;
