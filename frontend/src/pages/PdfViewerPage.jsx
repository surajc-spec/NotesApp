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
  ArrowLeftRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Capacitor } from '@capacitor/core';

// Single Page Canvas Component for Continuous Vertical PDF Scrolling (Edge Reader Style)
const PdfPageItem = ({ 
  pdfDoc, 
  pageNumber, 
  scale, 
  isPdfDarkMode, 
  isNotesOpened, 
  isWindowBlurred, 
  isScreenshotBlocked, 
  userEmail
}) => {
  const canvasRef = useRef(null);
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

  return (
    <div
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

      {/* Canvas Element with Watermark Overlay */}
      <div className={`relative inline-block max-w-full rounded-xl overflow-hidden shadow-2xl transition-colors ${
        isPdfDarkMode ? 'bg-[#18181b]' : 'bg-white'
      }`}>
        <canvas
          ref={canvasRef}
          style={{
            filter: isPdfDarkMode ? 'invert(0.92) hue-rotate(180deg) contrast(1.15) brightness(0.95)' : 'none',
            transition: 'filter 0.3s ease',
            visibility: (isNotesOpened && (isWindowBlurred || isScreenshotBlocked)) ? 'hidden' : 'visible'
          }}
          className={`max-w-full transition-all block ${isPdfDarkMode ? 'bg-[#18181b]' : 'bg-white'}`}
        />

        {/* Dynamic Anti-Leak Watermark Overlay */}
        {!rendering && (
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden select-none flex flex-col justify-around items-center py-6 z-20 w-full h-full"
            aria-hidden="true"
          >
            {/* Repeating Diagonal Watermark Rows */}
            {[1, 2, 3].map((rowIdx) => (
              <div 
                key={rowIdx}
                className={`transform -rotate-[28deg] text-center select-none pointer-events-none my-2 transition-all ${
                  isPdfDarkMode ? 'opacity-25 text-white' : 'opacity-20 text-neutral-800'
                }`}
              >
                <span className={`text-base sm:text-2xl md:text-3xl font-bold tracking-widest uppercase font-sans block ${
                  isPdfDarkMode ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]' : 'text-neutral-900 drop-shadow-sm'
                }`}>
                  NoteShare
                </span>
                {userEmail && (
                  <span className={`text-[10px] sm:text-xs md:text-sm font-semibold tracking-wider mt-0.5 font-mono block ${
                    isPdfDarkMode ? 'text-zinc-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-neutral-800'
                  }`}>
                    {userEmail}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PdfViewerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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
  
  // Fit Mode Toggle State: 'width' (Fit to Width) vs 'page' (Fit to Page)
  const [fitMode, setFitMode] = useState('width');

  // Security boolean variables
  const [isNotesOpened, setIsNotesOpened] = useState(false);
  const [isFullScreenModeOn, setIsFullScreenModeOn] = useState(false);

  // Anti-Screenshot Protection State
  const [isScreenshotBlocked, setIsScreenshotBlocked] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isScrollingToPageRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const rafRef = useRef(null);



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
      const key = (e.key || '').toLowerCase();
      const code = e.code || '';
      const keyCode = e.keyCode || 0;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // 1. PrintScreen key (standard & multimedia keyboards)
      if (key === 'printscreen' || code === 'PrintScreen' || keyCode === 44 || key === 'snapshot') return true;

      // 2. Windows Snipping Tool / macOS screenshot (Win+Shift+S / Cmd+Shift+S / Ctrl+Shift+S)
      if (e.shiftKey && (key === 's' || code === 'KeyS')) return true;

      // 3. macOS screenshots (Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5, Cmd+Shift+6)
      // Note: On Mac, Shift+3 produces '#', Shift+4 produces '$', Shift+5 produces '%', Shift+6 produces '^'
      if (isCtrlOrMeta && e.shiftKey && ['3', '4', '5', '6', '#', '$', '%', '^', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6'].includes(key || code)) return true;

      // 4. Print shortcuts (Ctrl+P / Cmd+P)
      if (isCtrlOrMeta && (key === 'p' || code === 'KeyP')) return true;

      // 5. Save Page shortcuts (Ctrl+S / Cmd+S)
      if (isCtrlOrMeta && (key === 's' || code === 'KeyS')) return true;

      // 6. View Source shortcut (Ctrl+U / Cmd+U)
      if (isCtrlOrMeta && (key === 'u' || code === 'KeyU')) return true;

      // 7. DevTools / Inspect shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)
      if (key === 'f12' || code === 'F12' || keyCode === 123) return true;
      if (isCtrlOrMeta && e.shiftKey && ['i', 'j', 'c', 'KeyI', 'KeyJ', 'KeyC'].includes(key || code)) return true;

      // 8. Alt + PrintScreen
      if (e.altKey && (key === 'printscreen' || code === 'PrintScreen' || keyCode === 44)) return true;

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

    const handleWindowBlur = () => {
      // In native Android app, FLAG_SECURE handles screen protection at OS level
      if (Capacitor.isNativePlatform()) return;
      if (!document.hasFocus()) {
        setIsWindowBlurred(true);
      }
    };
    const handleWindowFocus = () => setIsWindowBlurred(false);
    const handleVisibilityChange = () => {
      if (Capacitor.isNativePlatform()) return;
      if (document.hidden) {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };
    const preventDefaultAction = (e) => { e.preventDefault(); return false; };

    const targets = [window, document];
    if (containerRef.current) targets.push(containerRef.current);
    if (document.fullscreenElement) targets.push(document.fullscreenElement);

    targets.forEach(target => {
      target.addEventListener('keydown', handleKeyDown, true);
      target.addEventListener('keyup', handleKeyUp, true);
    });

    if (!Capacitor.isNativePlatform()) {
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    document.addEventListener('contextmenu', preventDefaultAction);
    document.addEventListener('copy', preventDefaultAction);
    document.addEventListener('cut', preventDefaultAction);

    return () => {
      targets.forEach(target => {
        target.removeEventListener('keydown', handleKeyDown, true);
        target.removeEventListener('keyup', handleKeyUp, true);
      });

      if (!Capacitor.isNativePlatform()) {
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }

      document.removeEventListener('contextmenu', preventDefaultAction);
      document.removeEventListener('copy', preventDefaultAction);
      document.removeEventListener('cut', preventDefaultAction);
    };
  }, [isNotesOpened, isFullScreenModeOn]);

  // Ctrl + Mouse Wheel Zooming (PDF Canvas Only, prevents browser window zoom)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        setScale((prev) => Math.min(Math.max(parseFloat((prev + delta).toFixed(2)), 0.5), 3.0));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Calculate & Set "Fit to Width" Scale (Microsoft Edge PDF Reader Style)
  const handleFitToWidth = useCallback(async () => {
    if (!pdfDoc || !containerRef.current) return;

    try {
      const page = await pdfDoc.getPage(1);
      const defaultViewport = page.getViewport({ scale: 1.0 });
      
      const availableWidth = containerRef.current.clientWidth - 48;

      if (availableWidth <= 0) return;

      const fitWidthScale = availableWidth / defaultViewport.width;
      const finalScale = Math.max(0.5, Math.min(fitWidthScale, 3.0));
      setScale(parseFloat(finalScale.toFixed(2)));
    } catch (err) {
      console.error('Fit to width calculation error:', err);
    }
  }, [pdfDoc]);

  // Calculate & Set "Fit Page" Scale (Height & Width Fit)
  const handleFitPage = useCallback(async () => {
    if (!pdfDoc || !containerRef.current) return;

    try {
      const page = await pdfDoc.getPage(1);
      const defaultViewport = page.getViewport({ scale: 1.0 });
      
      const containerWidth = containerRef.current.clientWidth - 48;
      const containerHeight = containerRef.current.clientHeight - 120;

      if (containerWidth <= 0 || containerHeight <= 0) return;

      const fitWidthScale = containerWidth / defaultViewport.width;
      const fitHeightScale = containerHeight / defaultViewport.height;

      const optimalFitScale = Math.min(fitWidthScale, fitHeightScale);
      const finalScale = Math.max(0.5, Math.min(optimalFitScale, 2.5));
      setScale(parseFloat(finalScale.toFixed(2)));
    } catch (err) {
      console.error('Fit page calculation error:', err);
    }
  }, [pdfDoc]);

  // Single Toggle Function for Fit Mode (Width <-> Page)
  const handleToggleFitMode = () => {
    if (fitMode === 'width') {
      handleFitPage();
      setFitMode('page');
    } else {
      handleFitToWidth();
      setFitMode('width');
    }
  };

  // Auto-fit to width when PDF is loaded
  useEffect(() => {
    if (pdfDoc) {
      handleFitToWidth();
      setFitMode('width');
    }
  }, [pdfDoc, handleFitToWidth]);

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

      // 1. Fetch document metadata
      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load document details.');
      }

      if (data.note) setDocumentDetails(data.note);
      if (data.questionPaper) setDocumentDetails(data.questionPaper);

      const pdfjsLib = window.pdfjsLib;
      if (!pdfjsLib) {
        throw new Error('PDF Engine not loaded. Please refresh the page.');
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

      // 2. Fetch PDF binary via direct authenticated stream endpoint
      // This bypasses any cross-origin Cloudflare R2 / S3 CORS and Worker restrictions completely!
      const streamEndpoint = `${endpoint}?stream=true`;
      const streamResponse = await fetch(streamEndpoint, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      });

      if (!streamResponse.ok) {
        throw new Error('Failed to stream PDF binary from secure server.');
      }

      const pdfArrayBuffer = await streamResponse.arrayBuffer();

      let pdf;
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: pdfArrayBuffer,
          cMapPacked: true,
        });
        pdf = await loadingTask.promise;
      } catch (workerErr) {
        console.warn('Worker loading failed, falling back to direct in-thread render:', workerErr);
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
        const fallbackTask = pdfjsLib.getDocument({
          data: pdfArrayBuffer,
          cMapPacked: true,
        });
        pdf = await fallbackTask.promise;
      }

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
    isScrollingToPageRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    const pageEl = document.getElementById(`pdf-page-${targetPage}`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingToPageRef.current = false;
      updateCurrentPageFromScroll();
    }, 700);
  };

  // Real-time calculation of active visible page as user scrolls
  const updateCurrentPageFromScroll = useCallback(() => {
    if (isScrollingToPageRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check top boundary
    if (container.scrollTop <= 30) {
      setPageNum(1);
      setPageInput('1');
      if (id) sessionStorage.setItem(`pdf_page_${id}`, '1');
      return;
    }

    // Check bottom boundary
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 40) {
      if (numPages > 0) {
        setPageNum(numPages);
        setPageInput(String(numPages));
        if (id) sessionStorage.setItem(`pdf_page_${id}`, String(numPages));
        return;
      }
    }

    const containerRect = container.getBoundingClientRect();
    // Anchor line: 30% from top of the scroll container viewport
    const targetY = containerRect.top + Math.min(containerRect.height * 0.3, 160);

    const pageElements = container.querySelectorAll('[data-page-number]');
    if (!pageElements.length) return;

    let activePage = 1;
    let closestDistance = Infinity;

    for (let i = 0; i < pageElements.length; i++) {
      const el = pageElements[i];
      const rect = el.getBoundingClientRect();

      // If target anchor line is within this page element
      if (rect.top <= targetY && rect.bottom >= targetY) {
        activePage = parseInt(el.getAttribute('data-page-number'), 10);
        break;
      }

      // Or find page with minimum distance to target anchor line
      const distance = Math.abs(rect.top - targetY);
      if (distance < closestDistance) {
        closestDistance = distance;
        activePage = parseInt(el.getAttribute('data-page-number'), 10);
      }
    }

    if (activePage && !isNaN(activePage) && activePage >= 1 && activePage <= numPages) {
      setPageNum((prev) => {
        if (prev !== activePage) {
          setPageInput(String(activePage));
          if (id) sessionStorage.setItem(`pdf_page_${id}`, String(activePage));
          return activePage;
        }
        return prev;
      });
    }
  }, [numPages, id]);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateCurrentPageFromScroll);
  }, [updateCurrentPageFromScroll]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setTimeout(handleFitToWidth, 300);
      }).catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setTimeout(handleFitToWidth, 300);
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
      setPageInput(String(prev));
      if (id) sessionStorage.setItem(`pdf_page_${id}`, String(prev));
      scrollToPage(prev);
    }
  };

  const handleNextPage = () => {
    if (pageNum < numPages) {
      const next = pageNum + 1;
      setPageNum(next);
      setPageInput(String(next));
      if (id) sessionStorage.setItem(`pdf_page_${id}`, String(next));
      scrollToPage(next);
    }
  };

  const handlePageInputSubmit = (e) => {
    if (e) e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
      setPageNum(parsed);
      setPageInput(String(parsed));
      if (id) sessionStorage.setItem(`pdf_page_${id}`, String(parsed));
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

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="h-[calc(100vh-72px)] overflow-hidden bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground flex flex-col select-none transition-colors duration-300"
    >
      
      {/* TOP CONTROL HEADER BAR (Shown in normal mode) */}
      {!isFullscreen && (
        <div className="bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-light-border dark:border-dark-border px-6 py-4 sticky top-0 z-30 shadow-sm shrink-0">
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
                       {documentDetails.subjectCode}
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
      <div className="flex-1 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full flex flex-col items-center overflow-hidden">
        <div 
          ref={containerRef}
          tabIndex={-1}
          className={`flex-1 bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border rounded-2xl shadow-2xl relative transition-all w-full focus:outline-none overflow-hidden ${
            isFullscreen ? 'fixed inset-0 z-[999] rounded-none border-none bg-zinc-950' : 'h-full overflow-hidden'
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
            <div className="flex flex-col items-center justify-center gap-4 py-20 my-auto h-full">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm font-bold text-light-foreground dark:text-dark-foreground animate-pulse">
                Loading continuous PDF document...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-4 my-auto h-full">
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

          {/* CONTINUOUS VERTICAL SCROLL LIST CONTAINER (INNER SCROLL VIEWPORT WITH RESTORED SCROLLBAR) */}
          {pdfDoc && !loading && (
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="w-full h-full overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-28 landscape:pb-16 flex flex-col items-center space-y-4 scroll-smooth"
            >
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
                  userEmail={user?.email || 'noteshare.online'}
                />
              ))}
            </div>
          )}

          {/* PERMANENT FLOATING CONTROL TOOLBAR (2 ROWS IN MOBILE PORTRAIT, 1 SLIM ROW IN LANDSCAPE / DESKTOP) */}
          {pdfDoc && !loading && (
            <div className="fixed bottom-2 sm:bottom-6 landscape:bottom-2 left-1/2 -translate-x-1/2 z-50 bg-dark-surface/95 backdrop-blur-md border border-dark-border text-white px-2.5 sm:px-4 landscape:px-3 py-1.5 sm:py-2.5 landscape:py-1.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row landscape:flex-row items-center justify-center gap-1.5 sm:gap-3 landscape:gap-2.5 max-w-[98vw] sm:max-w-fit animate-fadeIn">
              
              {/* SECTION 1: Page Navigation & Zoom Controls */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-3 landscape:gap-2 w-full sm:w-auto landscape:w-auto">
                
                {/* Direct Page Jumper Form & Navigation */}
                <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={pageNum <= 1}
                    title="Previous Page"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-dark-surface-secondary border border-dark-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 bg-dark-surface-secondary px-2 sm:px-2.5 py-1 rounded-xl border border-dark-border text-[11px] sm:text-xs">
                    <span>Pg</span>
                    <input
                      type="number"
                      min={1}
                      max={numPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onBlur={handlePageInputSubmit}
                      className="w-9 sm:w-10 h-5 text-center font-extrabold bg-dark-surface border border-dark-border rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-primary text-[11px] sm:text-xs"
                    />
                    <span>/ {numPages}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={pageNum >= numPages}
                    title="Next Page"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-dark-surface-secondary border border-dark-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Vertical Divider */}
                <div className="w-px h-5 bg-dark-border shrink-0" />

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold shrink-0">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-dark-surface-secondary border border-dark-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-10 sm:w-12 text-center font-extrabold text-primary text-[11px] sm:text-xs">
                    {Math.round(scale * 100)}%
                  </span>

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-dark-surface-secondary border border-dark-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Divider between Section 1 & Section 2 on Landscape / Desktop */}
              <div className="w-px h-5 bg-dark-border shrink-0 hidden sm:block landscape:block" />

              {/* SECTION 2: View Modes & Action Buttons */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 landscape:gap-1.5 w-full sm:w-auto landscape:w-auto">
                
                {/* Fit Mode Toggle */}
                <button
                  type="button"
                  onClick={handleToggleFitMode}
                  title={fitMode === 'width' ? 'Fit to Page' : 'Fit to Width'}
                  className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-xl bg-dark-surface-secondary border border-dark-border text-gray-200 hover:text-white hover:bg-primary hover:text-primary-foreground hover:border-primary font-bold text-[11px] sm:text-xs transition-all flex items-center gap-1 active:scale-95 shrink-0 cursor-pointer"
                >
                  <ArrowLeftRight className="w-3 h-3 stroke-[2.5]" />
                  <span>{fitMode === 'width' ? 'Fit Width' : 'Fit Page'}</span>
                </button>

                {/* Dark Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsPdfDarkMode(prev => !prev)}
                  title={isPdfDarkMode ? 'Switch to Light Reading Mode' : 'Switch to Dark Reading Mode'}
                  className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-xl border font-bold text-[11px] sm:text-xs transition-all flex items-center gap-1 active:scale-95 shrink-0 cursor-pointer ${
                    isPdfDarkMode
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                      : 'bg-dark-surface-secondary text-gray-300 border-dark-border hover:text-white'
                  }`}
                >
                  {isPdfDarkMode ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                  <span>{isPdfDarkMode ? 'Light' : 'Dark'}</span>
                </button>

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="h-7 sm:h-8 px-2.5 sm:px-3 bg-primary text-primary-foreground font-bold text-[11px] sm:text-xs rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-1 active:scale-95 shadow-md shrink-0 cursor-pointer"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize className="w-3 h-3 stroke-[2.5]" />
                      <span>Exit</span>
                    </>
                  ) : (
                    <>
                      <Maximize className="w-3 h-3 stroke-[2.5]" />
                      <span>Expand</span>
                    </>
                  )}
                </button>

              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default PdfViewerPage;
