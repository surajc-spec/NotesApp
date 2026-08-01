import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Maximize, 
  Minimize, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Loader2, 
  AlertCircle,
  ShieldAlert,
  Lock,
  EyeOff,
  Moon,
  Sun
} from 'lucide-react';

const PdfViewerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type') || 'note';
  const id = searchParams.get('id');

  const [pdfDoc, setPdfDoc] = useState(null);
  const [documentDetails, setDocumentDetails] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5); // Default crisp scale
  const [loading, setLoading] = useState(true);
  const [renderingPage, setRenderingPage] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPdfDarkMode, setIsPdfDarkMode] = useState(false); // PDF Invert Theme Toggle
  
  // Anti-Screenshot Protection State
  const [isScreenshotBlocked, setIsScreenshotBlocked] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Sync pageInput when pageNum changes
  useEffect(() => {
    setPageInput(String(pageNum));
  }, [pageNum]);

  // Fetch PDF Data from Backend
  useEffect(() => {
    if (!id) {
      setError('No document ID specified.');
      setLoading(false);
      return;
    }

    fetchPdfData();
  }, [type, id]);

  // Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Strict Anti-Screenshot & Key Interceptor (Capture Phase for Fullscreen support)
  useEffect(() => {
    const triggerScreenshotBlock = () => {
      setIsScreenshotBlocked(true);
      setTimeout(() => {
        setIsScreenshotBlocked(false);
      }, 3000);
    };

    const handleKeyDown = (e) => {
      // PrintScreen key detection
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotBlock();
        return false;
      }

      // Snipping Tool / OS Screen Capture (Win + Shift + S / Meta + Shift + S / Cmd + Shift + 3/4)
      if ((e.metaKey || e.winKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === '3' || e.key === '4')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotBlock();
        return false;
      }

      // Ctrl + P or Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotBlock();
        return false;
      }

      // Ctrl + S or Cmd + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotBlock();
        return false;
      }

      // DevTools (F12 or Ctrl+Shift+I)
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotBlock();
        return false;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        triggerScreenshotBlock();
      }
    };

    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    // Use Capture Phase (true) so listeners trigger BEFORE browser handles fullscreen keys
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
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

      if (!response.ok || !data.pdfUrl) {
        throw new Error(data.message || 'Failed to load PDF document URL.');
      }

      if (data.note) setDocumentDetails(data.note);
      if (data.questionPaper) setDocumentDetails(data.questionPaper);

      // Access PDF.js from window
      const pdfjsLib = window.pdfjsLib;
      if (!pdfjsLib) {
        throw new Error('PDF Engine not loaded. Please refresh the page.');
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;

      const loadingTask = pdfjsLib.getDocument({
        url: data.pdfUrl,
        cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/cmaps/`,
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setPageNum(1);
    } catch (err) {
      console.error('PDF Loading Error:', err);
      setError(err.message || 'Could not load PDF document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Ultra-Crisp High-DPI Canvas Rendering Engine
  useEffect(() => {
    if (!pdfDoc) return;

    let isMounted = true;

    const renderPage = async () => {
      setRenderingPage(true);
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (!isMounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Multiply viewport scale by devicePixelRatio to prevent text blurriness on all screens
        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale * pixelRatio });
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Display dimensions at un-scaled CSS pixels
        canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
        canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Page rendering error:', err);
      } finally {
        if (isMounted) setRenderingPage(false);
      }
    };

    renderPage();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, pageNum, scale]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
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

  const handlePrevPage = () => {
    if (pageNum > 1) setPageNum(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (pageNum < numPages) setPageNum(prev => prev + 1);
  };

  const handlePageInputSubmit = (e) => {
    if (e) e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
      setPageNum(parsed);
    } else {
      setPageInput(String(pageNum));
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.6));
  };

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground flex flex-col select-none transition-colors duration-300"
    >
      
      {/* BLACK SCREEN OVERLAY (SCREENSHOT IS BLOCKED) */}
      {isScreenshotBlocked && (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center p-8 text-center text-white animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/40 text-red-500 flex items-center justify-center mb-6 animate-pulse">
            <EyeOff className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-3">
            📷 Screenshot is Blocked
          </h2>
          <p className="text-sm text-gray-400 max-w-md leading-relaxed">
            Taking screenshots or printing protected study materials is restricted on NoteShare for security and copyright compliance.
          </p>
        </div>
      )}

      {/* TOP CONTROL HEADER BAR (Shown in normal mode) */}
      {!isFullscreen && (
        <div className="bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-light-border dark:border-dark-border px-6 py-4 sticky top-[72px] z-30 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Back & Details */}
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
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    type === 'question-paper'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    {type === 'question-paper' ? 'Question Paper' : 'Study Note'}
                  </span>
                  {documentDetails?.subjectCode && (
                    <span className="text-xs font-bold text-light-muted dark:text-dark-muted">
                      • {documentDetails.subjectCode}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <Lock className="w-3 h-3" /> Protected Canvas View
                  </span>
                </div>
                <h1 className="text-lg font-bold text-light-foreground dark:text-dark-foreground truncate font-sans mt-0.5">
                  {documentDetails?.title || (type === 'question-paper' ? 'Question Paper Preview' : 'Note Preview')}
                </h1>
              </div>
            </div>

            {/* Right: Fullscreen Trigger */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="h-10 px-5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2 active:scale-95 shrink-0"
            >
              <Maximize className="w-4 h-4 stroke-[2.5]" />
              <span>Fullscreen View</span>
            </button>

          </div>
        </div>
      )}

      {/* CANVAS RENDERING CONTAINER */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col items-center">
        <div 
          ref={containerRef}
          className={`flex-1 bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border rounded-2xl shadow-2xl overflow-auto flex flex-col items-center justify-between p-6 relative transition-all w-full ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none p-4 bg-zinc-950' : 'min-h-[78vh]'
          }`}
        >

          {/* Window Blur Protection Overlay */}
          {isWindowBlurred && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-40 flex flex-col items-center justify-center text-center p-6">
              <ShieldAlert className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
              <h3 className="text-xl font-bold text-white">Content Protected</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Click inside NoteShare window to resume reading.
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-20 my-auto">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm font-bold text-light-foreground dark:text-dark-foreground animate-pulse">
                Rendering crisp PDF canvas...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-light-foreground dark:text-dark-foreground">
                Unable to load document
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

          {/* Page Rendering Spinner Indicator */}
          {renderingPage && (
            <div className="absolute top-4 right-4 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 z-20 shadow-sm backdrop-blur-md">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Rendering...</span>
            </div>
          )}

          {/* High-DPI Canvas Element (With Optional PDF Dark Mode Inversion) */}
          <canvas
            ref={canvasRef}
            style={{
              filter: isPdfDarkMode ? 'invert(0.92) hue-rotate(180deg) contrast(1.15)' : 'none',
              transition: 'filter 0.3s ease',
            }}
            className="shadow-2xl rounded-xl max-w-full my-auto transition-all"
          />

          {/* FLOATING CONTROL TOOLBAR AT THE BOTTOM OF THE PAGE */}
          {pdfDoc && (
            <div className="sticky bottom-2 z-30 mt-6 bg-dark-surface/90 backdrop-blur-md border border-dark-border text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-4 flex-wrap max-w-full justify-center animate-fadeIn">
              
              {/* Direct Page Jumper Form */}
              <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={pageNum <= 1}
                  title="Previous Page"
                  className="w-8 h-8 rounded-xl bg-dark-surface-secondary border border-dark-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 bg-dark-surface-secondary px-3 py-1.5 rounded-xl border border-dark-border">
                  <span>Page</span>
                  <input
                    type="number"
                    min={1}
                    max={numPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={handlePageInputSubmit}
                    className="w-12 h-6 text-center font-extrabold bg-dark-surface border border-dark-border rounded-lg text-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                  <span>of {numPages}</span>
                </div>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={pageNum >= numPages}
                  title="Next Page"
                  className="w-8 h-8 rounded-xl bg-dark-surface-secondary border border-dark-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>

              {/* Divider */}
              <div className="w-px h-6 bg-dark-border" />

              {/* Zoom Controls */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="w-8 h-8 rounded-xl bg-dark-surface-secondary border border-dark-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <span className="w-14 text-center font-extrabold text-primary">
                  {Math.round(scale * 100)}%
                </span>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="w-8 h-8 rounded-xl bg-dark-surface-secondary border border-dark-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-dark-border" />

              {/* PDF Dark Mode / Theme Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsPdfDarkMode(prev => !prev)}
                title={isPdfDarkMode ? 'Switch to Light Reading Mode' : 'Switch to Dark Reading Mode'}
                className={`h-8 px-3 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 ${
                  isPdfDarkMode
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                    : 'bg-dark-surface-secondary text-gray-300 border-dark-border hover:text-white'
                }`}
              >
                {isPdfDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{isPdfDarkMode ? 'Light PDF' : 'Dark PDF'}</span>
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-dark-border" />

              {/* Fullscreen Toggle Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="h-8 px-3.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
              >
                {isFullscreen ? (
                  <>
                    <Minimize className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Fullscreen</span>
                  </>
                )}
              </button>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default PdfViewerPage;
