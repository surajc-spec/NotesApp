import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Sun,
  Expand,
  Scan
} from 'lucide-react';

// Single Page Canvas Component for Continuous Vertical PDF Scrolling (Edge Reader Style)
const PdfPageItem = ({ 
  pdfDoc, 
  pageNumber, 
  scale, 
  isPdfDarkMode, 
  isNotesOpened, 
  isWindowBlurred, 
  isScreenshotBlocked, 
  onPageVisible 
}) => {
  const canvasRef = useRef(null);
  const itemRef = useRef(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    if (!pdfDoc) return;
    let isMounted = true;
    let renderTask = null;

    const renderPage = async () => {
      setRendering(true);
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (!isMounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale * pixelRatio });
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
        canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error(`Page ${pageNumber} render error:`, err);
        }
      } finally {
        if (isMounted) setRendering(false);
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
      }
    };
  }, [pdfDoc, pageNumber, scale]);

  // Observer to track which page is currently visible in the scroll viewport
  useEffect(() => {
    if (!itemRef.current || !onPageVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            onPageVisible(pageNumber);
          }
        });
      },
      { threshold: [0.4, 0.6] }
    );

    observer.observe(itemRef.current);
    return () => observer.disconnect();
  }, [pageNumber, onPageVisible]);

  return (
    <div
      ref={itemRef}
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      className="relative my-3 sm:my-4 flex flex-col items-center justify-center shrink-0 w-full"
    >
      {/* Page Badge */}
      <div className="absolute top-3 right-4 bg-dark-surface/80 text-gray-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-dark-border z-10 shadow-md backdrop-blur-sm pointer-events-none">
        Page {pageNumber}
      </div>

      {/* Rendering Spinner */}
      {rendering && (
        <div className="absolute top-3 left-4 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 z-10 backdrop-blur-md shadow-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        style={{
          filter: isPdfDarkMode ? 'invert(0.92) hue-rotate(180deg) contrast(1.15)' : 'none',
          transition: 'filter 0.3s ease',
          display: (isNotesOpened && (isWindowBlurred || isScreenshotBlocked)) ? 'none' : 'block'
        }}
        className="shadow-2xl rounded-xl max-w-full transition-all bg-white"
      />
    </div>
  );
};

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
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPdfDarkMode, setIsPdfDarkMode] = useState(false);
  
  // Security boolean variables
  const [isNotesOpened, setIsNotesOpened] = useState(false);
  const [isFullScreenModeOn, setIsFullScreenModeOn] = useState(false);

  // Anti-Screenshot Protection State
  const [isScreenshotBlocked, setIsScreenshotBlocked] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  const containerRef = useRef(null);

  // Update pageInput string when pageNum changes from scroll observer
  useEffect(() => {
    setPageInput(String(pageNum));
  }, [pageNum]);

  // Fetch PDF Data from Backend
  useEffect(() => {
    if (!id) {
      setError('No document ID specified.');
      setLoading(false);
      setIsNotesOpened(false);
      return;
    }

    fetchPdfData();
  }, [type, id]);

  // Fullscreen Listener to track isFullScreenModeOn
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);
      setIsFullScreenModeOn(isFS);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Set isNotesOpened boolean state when PDF document is active
  useEffect(() => {
    if (pdfDoc && !loading && !error) {
      setIsNotesOpened(true);
    } else {
      setIsNotesOpened(false);
    }
  }, [pdfDoc, loading, error]);

  // Anti-Screenshot & Print Shortcut Blocker
  useEffect(() => {
    if (!isNotesOpened) return;

    const triggerScreenshotBlock = () => {
      setIsScreenshotBlocked(true);

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('Screenshot is blocked on NoteShare for security and copyright protection.');
        }
      } catch (err) {
        // Clipboard API fallback
      }

      setTimeout(() => {
        setIsScreenshotBlocked(false);
      }, 3000);
    };

    const isScreenshotShortcut = (e) => {
      const key = e.key || '';
      const code = e.code || '';
      const keyCode = e.keyCode || 0;

      if (key === 'PrintScreen' || code === 'PrintScreen' || keyCode === 44) return true;
      if ((e.metaKey || e.winKey || e.ctrlKey) && e.shiftKey && (key === 'S' || key === 's' || code === 'KeyS')) return true;
      if (e.metaKey && e.shiftKey && (key === '3' || key === '4' || key === '5' || keyCode === 51 || keyCode === 52 || keyCode === 53)) return true;
      if ((e.ctrlKey || e.metaKey) && (key === 'p' || key === 'P' || code === 'KeyP')) return true;
      if ((e.ctrlKey || e.metaKey) && (key === 's' || key === 'S' || code === 'KeyS')) return true;
      if (key === 'F12' || code === 'F12' || keyCode === 123 || ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'I' || key === 'i' || code === 'KeyI'))) return true;

      return false;
    };

    const handleKeyDown = (e) => {
      if (isScreenshotShortcut(e)) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        triggerScreenshotBlock();
        return false;
      }
    };

    const handleKeyUp = (e) => {
      if (isScreenshotShortcut(e)) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        triggerScreenshotBlock();
        return false;
      }
    };

    const handleWindowBlur = () => setIsWindowBlurred(true);
    const handleWindowFocus = () => setIsWindowBlurred(false);
    const preventDefaultAction = (e) => { e.preventDefault(); return false; };

    const targets = [window, document];
    if (containerRef.current) targets.push(containerRef.current);
    if (document.fullscreenElement) targets.push(document.fullscreenElement);

    targets.forEach(target => {
      target.addEventListener('keydown', handleKeyDown, true);
      target.addEventListener('keyup', handleKeyUp, true);
    });

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    document.addEventListener('contextmenu', preventDefaultAction);
    document.addEventListener('copy', preventDefaultAction);
    document.addEventListener('cut', preventDefaultAction);

    return () => {
      targets.forEach(target => {
        target.removeEventListener('keydown', handleKeyDown, true);
        target.removeEventListener('keyup', handleKeyUp, true);
      });

      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);

      document.removeEventListener('contextmenu', preventDefaultAction);
      document.removeEventListener('copy', preventDefaultAction);
      document.removeEventListener('cut', preventDefaultAction);
    };
  }, [isNotesOpened, isFullScreenModeOn]);

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

  // Scroll smoothly to target page element
  const scrollToPage = (targetPage) => {
    const pageEl = document.getElementById(`pdf-page-${targetPage}`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Calculate & Set "Fit to Screen" Scale
  const handleFitToScreen = useCallback(async () => {
    if (!pdfDoc || !containerRef.current) return;

    try {
      const page = await pdfDoc.getPage(1);
      const defaultViewport = page.getViewport({ scale: 1.0 });
      
      const containerWidth = containerRef.current.clientWidth - 48; // accounting for padding
      const containerHeight = containerRef.current.clientHeight - 130; // accounting for padding & bottom toolbar

      if (containerWidth <= 0 || containerHeight <= 0) return;

      const fitWidthScale = containerWidth / defaultViewport.width;
      const fitHeightScale = containerHeight / defaultViewport.height;

      // Fit scale calculation for optimal screen fitting
      const optimalFitScale = Math.min(fitWidthScale, fitHeightScale);
      
      // Clamp between 0.6 and 2.5
      const finalScale = Math.max(0.6, Math.min(optimalFitScale, 2.5));
      setScale(parseFloat(finalScale.toFixed(2)));
    } catch (err) {
      console.error('Fit to screen calculation error:', err);
    }
  }, [pdfDoc]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setTimeout(handleFitToScreen, 300);
      }).catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setTimeout(handleFitToScreen, 300);
      });
    }
  };

  const handleBack = () => {
    setIsNotesOpened(false);
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(type === 'question-paper' ? '/question-papers' : '/notes');
    }
  };

  const handlePrevPage = () => {
    if (pageNum > 1) {
      const prev = pageNum - 1;
      setPageNum(prev);
      scrollToPage(prev);
    }
  };

  const handleNextPage = () => {
    if (pageNum < numPages) {
      const next = pageNum + 1;
      setPageNum(next);
      scrollToPage(next);
    }
  };

  const handlePageInputSubmit = (e) => {
    if (e) e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
      setPageNum(parsed);
      scrollToPage(parsed);
    } else {
      setPageInput(String(pageNum));
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(parseFloat((prev + 0.2).toFixed(2)), 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(parseFloat((prev - 0.2).toFixed(2)), 0.5));
  };

  const handlePageVisible = useCallback((pageNumber) => {
    setPageNum(pageNumber);
  }, []);

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground flex flex-col select-none transition-colors duration-300"
    >
      
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

      {/* CANVAS RENDERING CONTAINER (Acts as root when Fullscreen is requested) */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col items-center">
        <div 
          ref={containerRef}
          tabIndex={-1}
          className={`flex-1 bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border rounded-2xl shadow-2xl overflow-y-auto flex flex-col items-center p-4 sm:p-6 relative transition-all w-full focus:outline-none scroll-smooth ${
            isFullscreen ? 'fixed inset-0 z-[999] rounded-none border-none p-4 bg-zinc-950' : 'h-[78vh]'
          }`}
        >

          {/* BLACK SCREEN OVERLAY (INSIDE CONTAINER SO IT IS 100% VISIBLE IN FULLSCREEN MODE) */}
          {isScreenshotBlocked && (
            <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center p-8 text-center text-white animate-fadeIn">
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-3">
                Screenshot is Blocked
              </h2>
              <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                Taking screenshots or printing protected study materials is restricted on NoteShare for security and copyright compliance.
              </p>
            </div>
          )}

          {/* Window Blur Protection Overlay */}
          {isNotesOpened && isWindowBlurred && (
            <div className="absolute inset-0 bg-black z-[9998] flex flex-col items-center justify-center text-center p-6">
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
                Loading continuous PDF document...
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

          {/* CONTINUOUS VERTICAL SCROLL LIST (Edge PDF Reader Experience) */}
          {pdfDoc && !loading && (
            <div className="w-full flex flex-col items-center space-y-4 pb-20">
              {Array.from({ length: numPages }, (_, index) => index + 1).map((pageNumber) => (
                <PdfPageItem
                  key={`page-${pageNumber}`}
                  pdfDoc={pdfDoc}
                  pageNumber={pageNumber}
                  scale={scale}
                  isPdfDarkMode={isPdfDarkMode}
                  isNotesOpened={isNotesOpened}
                  isWindowBlurred={isWindowBlurred}
                  isScreenshotBlocked={isScreenshotBlocked}
                  onPageVisible={handlePageVisible}
                />
              ))}
            </div>
          )}

          {/* FLOATING CONTROL TOOLBAR AT THE BOTTOM OF THE PAGE */}
          {pdfDoc && !loading && (
            <div className="sticky bottom-4 z-30 bg-dark-surface/95 backdrop-blur-md border border-dark-border text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4 flex-wrap max-w-full justify-center animate-fadeIn">
              
              {/* Direct Page Jumper Form & Navigation */}
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

              {/* Fit to Screen Button */}
              <button
                type="button"
                onClick={handleFitToScreen}
                title="Fit Page to Screen Width & Height"
                className="h-8 px-3 rounded-xl bg-dark-surface-secondary border border-dark-border text-gray-200 hover:text-white hover:bg-primary hover:text-primary-foreground hover:border-primary font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Expand className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Fit Screen</span>
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-dark-border" />

              {/* PDF Dark Mode Toggle */}
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
