import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const ProtectedPdfViewer = ({
  fileUrl,
  title,
  isFullscreen = false,
}) => {
  const containerRef = useRef(null);
  const canvasRefs = useRef([]);

  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPage, setJumpPage] = useState("");
  const [error, setError] = useState("");

  const scrollToPage = (pageNumber) => {
    const canvas = canvasRefs.current[pageNumber - 1];

    if (!canvas) return;

    canvas.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    let cancelled = false;
    let loadingTask;

    const renderPdf = async () => {
      setError("");
      setPages([]);
      canvasRefs.current = [];

      try {
        loadingTask = pdfjs.getDocument(fileUrl);

        const pdf = await loadingTask.promise;

        if (cancelled) return;

        const pageList = Array.from(
          { length: pdf.numPages },
          (_, i) => i + 1
        );

        setPages(pageList);

        requestAnimationFrame(async () => {
          const width =
            Math.min(
              (containerRef.current?.clientWidth || 900) - 24,
              980
            );

          for (const pageNumber of pageList) {
            if (cancelled) return;

            const page =
              await pdf.getPage(pageNumber);

            const viewport =
              page.getViewport({
                scale: 1,
              });

            const scale =
              width / viewport.width;

            const scaled =
              page.getViewport({
                scale,
              });

            const canvas =
              canvasRefs.current[
                pageNumber - 1
              ];

            if (!canvas) continue;

            const context =
              canvas.getContext("2d");

            const ratio =
              window.devicePixelRatio || 1;

            canvas.width =
              scaled.width * ratio;

            canvas.height =
              scaled.height * ratio;

            canvas.style.width =
              `${scaled.width}px`;

            canvas.style.height =
              `${scaled.height}px`;

            await page.render({
              canvasContext: context,
              viewport: scaled,
              transform:
                ratio !== 1
                  ? [
                      ratio,
                      0,
                      0,
                      ratio,
                      0,
                      0,
                    ]
                  : null,
            }).promise;
          }
        });
      } catch (err) {
        if (!cancelled)
          setError(
            err.message ||
              "Unable to render PDF"
          );
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
      className={`
overflow-y-auto
bg-surface-secondary
px-3
pt-0
pb-5
${isFullscreen ? "h-full" : "h-[78vh]"}
`}
      onContextMenu={(e) =>
        e.preventDefault()
      }
    >
      {/* TOP TOOLBAR */}

      <div
        className="
sticky
top-0
z-50
bg-surface-secondary
py-3
"
      >
        <div
          className="
flex
items-center
justify-center
gap-3
rounded-b-xl
border
border-border
bg-surface
p-3
text-foreground
"
        >
          <button
            onClick={() =>
              scrollToPage(
                Math.max(
                  currentPage - 1,
                  1
                )
              )
            }
            className="
px-3
py-1
rounded
bg-gray-700
text-white
"
          >
            ←
          </button>

          <span>
            Page
          </span>

         <input
  type="number"

  value={jumpPage}

  onChange={(e) =>
    setJumpPage(
      e.target.value
    )
  }

  onKeyDown={(e) => {

    if (
      e.key === "Enter"
    ) {

      const p =
        Number(
          jumpPage
        );

      if (
        p >= 1 &&
        p <= pages.length
      ) {

        scrollToPage(
          p
        );

        setCurrentPage(
          p
        );

      }

    }

  }}

  className="
w-20
rounded
border
bg-black
text-white
dark:bg-white
dark:text-black
px-2
py-1
text-center
"
/>

          <button
            onClick={() => {
              const p =
                Number(jumpPage);

              if (
                p >= 1 &&
                p <= pages.length
              ) {
                scrollToPage(p);
              }
            }}
            className="
rounded
bg-green-500
px-4
py-1
text-white
"
          >
            Go
          </button>

          <span>
            / {pages.length}
          </span>

          <button
            onClick={() =>
              scrollToPage(
                Math.min(
                  currentPage + 1,
                  pages.length
                )
              )
            }
            className="
px-3
py-1
rounded
bg-gray-700
text-white
"
          >
            →
          </button>
        </div>
      </div>

      {/* PDF */}

      {error ? (
        <div className="text-red-500">
          {error}
        </div>
      ) : (
        <div className="mx-auto flex flex-col items-center gap-5">

          {pages.map(
            (pageNumber) => (
              <div
                key={
                  pageNumber
                }
                className="
relative
"
              >
                <div
                  className="
absolute
left-3
top-3
z-10
rounded
bg-black
px-2
py-1
text-sm
text-white
"
                >
                  {pageNumber}
                </div>

                <canvas
                  ref={(node) =>
                    (canvasRefs.current[
                      pageNumber - 1
                    ] = node)
                  }
                  className="
shadow-xl
dark:invert
"
                  draggable="false"
                />
              </div>
            )
          )}

        </div>
      )}
    </div>
  );
};

export default ProtectedPdfViewer;