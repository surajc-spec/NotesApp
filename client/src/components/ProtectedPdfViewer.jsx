import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const ProtectedPdfViewer = ({ fileUrl, title, isFullscreen = false }) => {
  const containerRef = useRef(null);
  const canvasRefs = useRef([]);
  const [pages, setPages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let loadingTask;

    const renderPdf = async () => {
      setError('');
      setPages([]);
      canvasRefs.current = [];

      try {
        loadingTask = pdfjs.getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        const pageNumbers = Array.from({ length: pdf.numPages }, (_, index) => index + 1);
        setPages(pageNumbers);

        requestAnimationFrame(async () => {
          const width = Math.min((containerRef.current?.clientWidth || 900) - 24, 980);

          for (const pageNumber of pageNumbers) {
            if (cancelled) return;

            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1 });
            const scale = width / viewport.width;
            const scaledViewport = page.getViewport({ scale });
            const canvas = canvasRefs.current[pageNumber - 1];

            if (!canvas) continue;

            const outputScale = window.devicePixelRatio || 1;
            const context = canvas.getContext('2d');

            canvas.width = Math.floor(scaledViewport.width * outputScale);
            canvas.height = Math.floor(scaledViewport.height * outputScale);
            canvas.style.width = `${Math.floor(scaledViewport.width)}px`;
            canvas.style.height = `${Math.floor(scaledViewport.height)}px`;

            await page.render({
              canvasContext: context,
              viewport: scaledViewport,
              transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
            }).promise;
          }
        });
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not render protected preview');
      }
    };

    if (fileUrl) renderPdf();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [fileUrl]);

  return (
    <div
      ref={containerRef}
      title={title}
      className={`protected-pdf-viewer custom-scrollbar overflow-y-auto bg-surface-secondary px-3 py-5 ${
        isFullscreen ? 'h-[calc(100vh-96px)]' : 'h-[78vh]'
      }`}
      onContextMenu={(e) => e.preventDefault()}
      draggable="false"
    >
      {error ? (
        <div className="mx-auto mt-12 max-w-md rounded-lg border border-border bg-surface p-6 text-center font-bold text-danger">
          {error}
        </div>
      ) : (
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5">
          {pages.map((pageNumber) => (
            <canvas
              key={pageNumber}
              ref={(node) => {
                canvasRefs.current[pageNumber - 1] = node;
              }}
              className="protected-pdf-page dark-invert-pdf"
              aria-label={`Page ${pageNumber}`}
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProtectedPdfViewer;