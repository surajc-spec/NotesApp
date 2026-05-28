import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Moon,
  MoveHorizontal,
  Sun,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useTheme } from '../context/ThemeContext';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ProtectedPdfViewer = ({ fileUrl, title, isFullscreen = false, onExitFullscreen }) => {
  const { theme, toggleTheme } = useTheme();
  const containerRef = useRef(null);
  const canvasRefs = useRef([]);
  const pdfRef = useRef(null);
  const renderTokenRef = useRef(0);
  const zoomFrameRef = useRef(null);
  const pagesContainerRef = useRef(null);

  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPage, setJumpPage] = useState('');
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState('width');

  const scrollToPage = (pageNumber) => {
    const canvas = canvasRefs.current[pageNumber - 1];

    if (!canvas) return;

    canvas.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    setCurrentPage(pageNumber);
  };

  const updateCurrentPageFromScroll = () => {
    const container = containerRef.current;
    if (!container || !canvasRefs.current.length) return;

    const containerTop = container.getBoundingClientRect().top;
    const readerCenter = containerTop + container.clientHeight * 0.42;
    let closestPage = currentPage;
    let closestDistance = Number.POSITIVE_INFINITY;

    canvasRefs.current.forEach((canvas, index) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const pageCenter = rect.top + rect.height / 2;
      const distance = Math.abs(pageCenter - readerCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPage = index + 1;
      }
    });

    if (closestPage !== currentPage) setCurrentPage(closestPage);
  };

  useEffect(() => {
    let cancelled = false;
    let loadingTask;

    const loadPdf = async () => {
      setError('');
      setPages([]);
      canvasRefs.current = [];
      pdfRef.current = null;

      try {
        if (typeof fileUrl === 'string') {
          loadingTask = pdfjs.getDocument(fileUrl);
        } else if (fileUrl && fileUrl.byteLength > 0) {
          // Clone the ArrayBuffer to prevent detaching/transfer issues when loaded in multiple viewers
          const clonedData = fileUrl.slice(0);
          loadingTask = pdfjs.getDocument({ data: clonedData });
        } else {
          throw new Error('Invalid PDF data');
        }

        const pdf = await loadingTask.promise;

        if (cancelled) return;

        pdfRef.current = pdf;
        const pageNumbers = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
        setPages(pageNumbers);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to render PDF');
        }
      }
    };

    if (fileUrl) loadPdf();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [fileUrl]);

  const touchStartDistRef = useRef(null);
  const touchStartZoomRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const pagesContainer = pagesContainerRef.current;
    if (!container || !pagesContainer) return;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStartDistRef.current = dist;
        touchStartZoomRef.current = zoom;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && touchStartDistRef.current !== null && touchStartZoomRef.current !== null) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / touchStartDistRef.current;
        pagesContainer.style.transform = `scale(${factor})`;
      }
    };

    const handleTouchEnd = (e) => {
      if (touchStartDistRef.current !== null && touchStartZoomRef.current !== null) {
        let factor = 1;
        if (e.touches.length === 0 && e.changedTouches && e.changedTouches.length >= 2) {
          const dist = Math.hypot(
            e.changedTouches[0].clientX - e.changedTouches[1].clientX,
            e.changedTouches[0].clientY - e.changedTouches[1].clientY
          );
          factor = dist / touchStartDistRef.current;
        }
        
        pagesContainer.style.transform = '';
        const finalZoom = clamp(touchStartZoomRef.current * (factor || 1), 0.6, 2.0);
        setZoom(finalZoom);
        
        touchStartDistRef.current = null;
        touchStartZoomRef.current = null;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [zoom]);

  useEffect(() => {
    if (!pdfRef.current || !pages.length) return;

    let cancelled = false;
    const token = renderTokenRef.current + 1;
    renderTokenRef.current = token;

    const renderPages = async () => {
      const pdf = pdfRef.current;
      const container = containerRef.current;
      const toolbarHeight = isFullscreen ? 56 : 72;
      const horizontalPadding = isFullscreen ? 8 : 24;
      const containerWidth = Math.max((container?.clientWidth || 900) - horizontalPadding, 320);
      const containerHeight = Math.max(
        (container?.clientHeight || window.innerHeight) - toolbarHeight - 20,
        320
      );
      const maxWidth = isFullscreen ? containerWidth : Math.min(containerWidth, 980);

      for (const pageNumber of pages) {
        if (cancelled || renderTokenRef.current !== token) return;

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const fitWidth = maxWidth / viewport.width;
        const fitPage = Math.min(containerWidth / viewport.width, containerHeight / viewport.height);
        const baseScale = isFullscreen && fitMode === 'page' ? fitPage : fitWidth;
        const scale = clamp(baseScale * zoom, 0.2, 4);
        const scaled = page.getViewport({ scale });
        const canvas = canvasRefs.current[pageNumber - 1];

        if (!canvas) continue;

        const context = canvas.getContext('2d');
        const ratio = window.devicePixelRatio || 1;

        canvas.width = scaled.width * ratio;
        canvas.height = scaled.height * ratio;
        canvas.style.width = `${scaled.width}px`;
        canvas.style.height = `${scaled.height}px`;

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: scaled,
          transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : null,
        }).promise;
      }
    };

    zoomFrameRef.current = requestAnimationFrame(renderPages);

    return () => {
      cancelled = true;
      if (zoomFrameRef.current) {
        cancelAnimationFrame(zoomFrameRef.current);
      }
    };
  }, [pages, fitMode, isFullscreen, zoom]);

  return (
    <div
      ref={containerRef}
      title={title}
      className={`protected-pdf-viewer overflow-y-auto bg-surface-secondary px-3 pt-0 pb-5 ${
        isFullscreen ? 'fullscreen-pdf-reader h-full px-0 pb-20' : 'h-[78vh]'
      }`}
      onScroll={updateCurrentPageFromScroll}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className={isFullscreen ? 'fixed left-0 right-0 z-50 px-4' : 'sticky top-0 z-50 bg-surface-secondary py-3'}
        style={isFullscreen ? { bottom: 'calc(1.25rem + env(safe-area-inset-bottom))' } : {}}
      >
        <div
          className={`mx-auto flex items-center justify-center gap-2 text-foreground shadow-sm ${
            isFullscreen
              ? 'max-w-[680px] w-[calc(100%-2rem)] flex-wrap justify-center rounded-2xl border border-white/10 bg-black/75 px-4 py-2 text-white backdrop-blur-xl gap-2 sm:gap-3'
              : 'max-w-[980px] flex-wrap rounded-b-xl border border-border bg-surface p-3'
          }`}
        >
          <button
            onClick={() => scrollToPage(Math.max(currentPage - 1, 1))}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
            type="button"
            title="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          <input
            type="number"
            value={jumpPage || currentPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const page = Number(jumpPage);
                if (page >= 1 && page <= pages.length) scrollToPage(page);
              }
            }}
            className={`h-9 w-14 rounded-full border px-2 text-center text-sm font-bold outline-none ${
              isFullscreen
                ? 'border-white/10 bg-white/10 text-white focus:border-accent'
                : 'border-border bg-field-background text-field-foreground'
            }`}
            aria-label="Page number"
          />

          <button
            onClick={() => {
              const page = Number(jumpPage);
              if (page >= 1 && page <= pages.length) scrollToPage(page);
            }}
            className={`h-9 rounded-full px-3 text-sm font-bold ${
              isFullscreen ? 'bg-accent text-accent-foreground' : 'bg-accent text-accent-foreground'
            }`}
            type="button"
          >
            Go
          </button>

          <span className={`min-w-10 text-sm font-bold ${isFullscreen ? 'text-white/70' : 'text-muted'}`}>
            / {pages.length}
          </span>

          <button
            onClick={() => scrollToPage(Math.min(currentPage + 1, pages.length))}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
            type="button"
            title="Next page"
          >
            <ChevronRight size={18} />
          </button>

          {(!isFullscreen || !Capacitor.isNativePlatform()) && (
            <div className={`flex min-w-[150px] items-center gap-2 rounded-full px-2 py-1 ${isFullscreen ? 'bg-white/10' : 'bg-surface-secondary'}`}>
              <ZoomOut size={16} className={isFullscreen ? 'text-white/70' : 'text-muted'} />
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-24 accent-[var(--accent)]"
                title="Zoom"
              />
              <ZoomIn size={16} className={isFullscreen ? 'text-white/70' : 'text-muted'} />
              <span className={`w-10 text-right text-xs ${isFullscreen ? 'text-white/70' : 'text-muted'}`}>{Math.round(zoom * 100)}%</span>
            </div>
          )}

          {isFullscreen && (
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
              type="button"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun size={17} className="text-yellow-400" />
              ) : (
                <Moon size={17} className="text-indigo-300" />
              )}
            </button>
          )}

          {isFullscreen && (
            <button
              onClick={onExitFullscreen}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/20 transition hover:opacity-90"
              type="button"
              title="Exit fullscreen"
              aria-label="Exit fullscreen"
            >
              <Minimize2 size={18} />
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div
          ref={pagesContainerRef}
          className={`mx-auto flex flex-col items-center transition-transform origin-top ${
            isFullscreen ? 'max-w-none gap-3 px-1' : 'max-w-[980px] gap-5'
          }`}
        >
          {pages.map((page) => (
            <div key={page} className="relative">
              <div className="absolute left-3 top-3 z-10 rounded bg-black/65 px-2 py-1 text-xs font-bold text-white">
                {page}
              </div>

              <canvas
                ref={(node) => {
                  canvasRefs.current[page - 1] = node;
                }}
                className="protected-pdf-page dark-invert-pdf shadow-xl"
                draggable={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProtectedPdfViewer;
