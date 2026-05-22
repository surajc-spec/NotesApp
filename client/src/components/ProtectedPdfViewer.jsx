import { useEffect, useRef, useState } from 'react';
import { Maximize2, MoveHorizontal, ZoomIn, ZoomOut } from 'lucide-react';

import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ProtectedPdfViewer = ({ fileUrl, title, isFullscreen = false }) => {
  const containerRef = useRef(null);
  const canvasRefs = useRef([]);
  const pdfRef = useRef(null);
  const renderTokenRef = useRef(0);
  const zoomFrameRef = useRef(null);

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

  useEffect(() => {
    let cancelled = false;
    let loadingTask;

    const loadPdf = async () => {
      setError('');
      setPages([]);
      canvasRefs.current = [];
      pdfRef.current = null;

      try {
        loadingTask = pdfjs.getDocument(fileUrl);

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

  useEffect(() => {
    if (!pdfRef.current || !pages.length) return;

    let cancelled = false;
    const token = renderTokenRef.current + 1;
    renderTokenRef.current = token;

    const renderPages = async () => {
      const pdf = pdfRef.current;
      const container = containerRef.current;
      const toolbarHeight = isFullscreen ? 76 : 72;
      const horizontalPadding = isFullscreen ? 12 : 24;
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
        isFullscreen ? 'h-full px-1' : 'h-[78vh]'
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="sticky top-0 z-50 bg-surface-secondary py-3">
        <div className="mx-auto flex max-w-[980px] flex-wrap items-center justify-center gap-3 rounded-b-xl border border-border bg-surface p-3 text-foreground shadow-sm">
          <button
            onClick={() => scrollToPage(Math.max(currentPage - 1, 1))}
            className="rounded bg-gray-700 px-3 py-1 text-white"
            type="button"
          >
            &larr;
          </button>

          <span>Page</span>

          <input
            type="number"
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const page = Number(jumpPage);
                if (page >= 1 && page <= pages.length) scrollToPage(page);
              }
            }}
            className="w-20 rounded border bg-black px-2 py-1 text-center text-white dark:bg-white dark:text-black"
          />

          <button
            onClick={() => {
              const page = Number(jumpPage);
              if (page >= 1 && page <= pages.length) scrollToPage(page);
            }}
            className="rounded bg-green-500 px-4 py-1 text-white"
            type="button"
          >
            Go
          </button>

          <span>/ {pages.length}</span>

          <button
            onClick={() => scrollToPage(Math.min(currentPage + 1, pages.length))}
            className="rounded bg-gray-700 px-3 py-1 text-white"
            type="button"
          >
            &rarr;
          </button>

          {isFullscreen && (
            <button
              onClick={() => {
                setFitMode((mode) => (mode === 'width' ? 'page' : 'width'));
                setZoom(1);
              }}
              className="flex h-8 w-8 items-center justify-center rounded bg-gray-700 text-white"
              type="button"
              title={fitMode === 'width' ? 'Fit full page' : 'Fill width'}
            >
              {fitMode === 'width' ? <Maximize2 size={17} /> : <MoveHorizontal size={17} />}
            </button>
          )}

          <div className="flex min-w-[180px] items-center gap-2 rounded bg-surface-secondary px-2 py-1">
            <ZoomOut size={16} className="text-muted" />
            <input
              type="range"
              min="0.6"
              max="1.6"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-28 accent-[var(--accent)]"
              title="Zoom"
            />
            <ZoomIn size={16} className="text-muted" />
            <span className="w-10 text-right text-xs text-muted">{Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div
          className={`mx-auto flex flex-col items-center gap-5 ${
            isFullscreen ? 'max-w-none' : 'max-w-[980px]'
          }`}
        >
          {pages.map((page) => (
            <div key={page} className="relative">
              <div className="absolute left-3 top-3 z-10 rounded bg-red-600 px-2 py-1 text-sm text-white">
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
