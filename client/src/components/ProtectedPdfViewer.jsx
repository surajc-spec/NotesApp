import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const ProtectedPdfViewer = ({ fileUrl, title, isFullscreen = false }) => {
  const containerRef = useRef(null);
  const canvasRefs = useRef([]);
  const searchInputRef = useRef(null);
  const searchTextRef = useRef('');

  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPage, setJumpPage] = useState('');
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pageMatches, setPageMatches] = useState({});
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const matches = useMemo(
    () =>
      Object.entries(pageMatches).flatMap(([pageNumber, pagePageMatches]) =>
        pagePageMatches.map((match, index) => ({
          ...match,
          id: `${pageNumber}-${index}`,
          pageNumber: Number(pageNumber),
        }))
      ),
    [pageMatches]
  );

  const scrollToPage = (pageNumber) => {
    const canvas = canvasRefs.current[pageNumber - 1];

    if (!canvas) return;

    canvas.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    setCurrentPage(pageNumber);
  };

  const goToMatch = (index) => {
    if (!matches.length) return;

    const nextIndex = (index + matches.length) % matches.length;
    const match = matches[nextIndex];

    setActiveMatchIndex(nextIndex);
    scrollToPage(match.pageNumber);
  };

  const runSearch = (value = searchText, sourcePages = pages) => {
    const query = value.trim().toLowerCase();
    searchTextRef.current = value;

    if (!query) {
      setPageMatches({});
      setActiveMatchIndex(0);
      return;
    }

    const nextMatches = {};

    sourcePages.forEach((page) => {
      const matchesForPage = (page.textItems || []).filter((item) =>
        item.text.toLowerCase().includes(query)
      );

      if (matchesForPage.length) {
        nextMatches[page.number] = matchesForPage;
      }
    });

    setPageMatches(nextMatches);
    setActiveMatchIndex(0);

    const firstPage = Number(Object.keys(nextMatches)[0]);
    if (firstPage) scrollToPage(firstPage);
  };

  useEffect(() => {
    let cancelled = false;
    let loadingTask;

    const renderPdf = async () => {
      setError('');
      setPages([]);
      setPageMatches({});
      setActiveMatchIndex(0);
      canvasRefs.current = [];

      try {
        loadingTask = pdfjs.getDocument(fileUrl);

        const pdf = await loadingTask.promise;

        if (cancelled) return;

        const pageNumbers = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
        setPages(pageNumbers.map((number) => ({ number, textItems: [] })));

        requestAnimationFrame(async () => {
          const width = Math.min((containerRef.current?.clientWidth || 900) - 24, 980);
          const renderedPages = [];

          for (const pageNumber of pageNumbers) {
            if (cancelled) return;

            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1 });
            const scale = width / viewport.width;
            const scaled = page.getViewport({ scale });
            const canvas = canvasRefs.current[pageNumber - 1];

            if (!canvas) continue;

            const context = canvas.getContext('2d');
            const ratio = window.devicePixelRatio || 1;

            canvas.width = scaled.width * ratio;
            canvas.height = scaled.height * ratio;
            canvas.style.width = `${scaled.width}px`;
            canvas.style.height = `${scaled.height}px`;

            await page.render({
              canvasContext: context,
              viewport: scaled,
              transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : null,
            }).promise;

            const textContent = await page.getTextContent();
            const textItems = textContent.items
              .map((item) => {
                const transform = pdfjs.Util.transform(scaled.transform, item.transform);
                const height = Math.max(Math.hypot(transform[2], transform[3]), 10);
                const width = Math.max(item.width * scale, height);
                const x = transform[4];
                const y = scaled.height - transform[5] - height;

                return {
                  text: item.str || '',
                  left: x,
                  top: y,
                  width,
                  height,
                };
              })
              .filter((item) => item.text.trim());

            renderedPages.push({
              number: pageNumber,
              textItems,
            });
          }

          if (!cancelled) {
            setPages(renderedPages);

            if (searchTextRef.current.trim()) {
              runSearch(searchTextRef.current, renderedPages);
            }
          }
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to render PDF');
        }
      }
    };

    if (fileUrl) renderPdf();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

  useEffect(() => {
    if (showSearch) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [showSearch]);

  return (
    <div
      ref={containerRef}
      title={title}
      className={`protected-pdf-viewer overflow-y-auto bg-surface-secondary px-3 pt-0 pb-5 ${
        isFullscreen ? 'h-full' : 'h-[78vh]'
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

          <button
            onClick={() => setShowSearch((value) => !value)}
            className="flex h-8 w-8 items-center justify-center rounded bg-red-500 text-white"
            type="button"
            title="Search"
          >
            {showSearch ? <X size={18} /> : <Search size={18} />}
          </button>

          <span>/ {pages.length}</span>

          <button
            onClick={() => scrollToPage(Math.min(currentPage + 1, pages.length))}
            className="rounded bg-gray-700 px-3 py-1 text-white"
            type="button"
          >
            &rarr;
          </button>

          {showSearch && (
            <div className="flex min-w-[220px] items-center gap-2">
              <input
                ref={searchInputRef}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  runSearch(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goToMatch(activeMatchIndex + 1);
                }}
                placeholder="Search"
                className="min-w-0 flex-1 rounded border bg-field-background px-3 py-1 text-field-foreground"
              />
              <span className="whitespace-nowrap text-xs text-muted">
                {matches.length ? `${activeMatchIndex + 1}/${matches.length}` : '0/0'}
              </span>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-5">
          {pages.map((page) => (
            <div key={page.number} className="relative">
              <div className="absolute left-3 top-3 z-10 rounded bg-red-600 px-2 py-1 text-sm text-white">
                {page.number}
              </div>

              <canvas
                ref={(node) => {
                  canvasRefs.current[page.number - 1] = node;
                }}
                className="protected-pdf-page dark-invert-pdf shadow-xl"
                draggable={false}
              />

              {(pageMatches[page.number] || []).map((match, index) => {
                const matchIndex = matches.findIndex(
                  (candidate) =>
                    candidate.pageNumber === page.number &&
                    candidate.left === match.left &&
                    candidate.top === match.top &&
                    candidate.text === match.text
                );

                return (
                  <div
                    key={`${page.number}-${match.left}-${match.top}-${index}`}
                    className={`pointer-events-none absolute z-20 rounded-sm ${
                      matchIndex === activeMatchIndex ? 'bg-red-500/45' : 'bg-yellow-300/45'
                    }`}
                    style={{
                      left: `${match.left}px`,
                      top: `${match.top}px`,
                      width: `${match.width}px`,
                      height: `${match.height}px`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProtectedPdfViewer;
