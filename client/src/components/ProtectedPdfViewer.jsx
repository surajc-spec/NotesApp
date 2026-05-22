import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const ProtectedPdfViewer = ({
  fileUrl,
  title,
  isFullscreen = false,
}) => {

  const containerRef = useRef(null);

  const canvasRefs = useRef([]);

  const [pages, setPages] = useState([]);

  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [jumpPage, setJumpPage] =
    useState('');

  useEffect(() => {

    let cancelled = false;

    let loadingTask;

    const renderPdf =
      async () => {

        setError('');

        setPages([]);

        canvasRefs.current = [];

        try {

          loadingTask =
            pdfjs.getDocument(
              fileUrl
            );

          const pdf =
            await loadingTask.promise;

          if (cancelled)
            return;

          const pageNumbers =
            Array.from(
              {
                length:
                  pdf.numPages,
              },
              (_, i) =>
                i + 1
            );

          setPages(
            pageNumbers
          );

          requestAnimationFrame(
            async () => {

              const width =
                Math.min(
                  (
                    containerRef
                      .current
                      ?.clientWidth ||
                    900
                  ) - 24,
                  980
                );

              for (
                const pageNumber of pageNumbers
              ) {

                if (
                  cancelled
                )
                  return;

                const page =
                  await pdf.getPage(
                    pageNumber
                  );

                const viewport =
                  page.getViewport(
                    {
                      scale: 1,
                    }
                  );

                const scale =
                  width /
                  viewport.width;

                const scaled =
                  page.getViewport(
                    {
                      scale,
                    }
                  );

                const canvas =
                  canvasRefs.current[
                    pageNumber -
                      1
                  ];

                if (
                  !canvas
                )
                  continue;

                const ratio =
                  window
                    .devicePixelRatio ||
                  1;

                const ctx =
                  canvas.getContext(
                    '2d'
                  );

                canvas.width =
                  scaled.width *
                  ratio;

                canvas.height =
                  scaled.height *
                  ratio;

                canvas.style.width =
                  `${scaled.width}px`;

                canvas.style.height =
                  `${scaled.height}px`;

                await page.render(
                  {
                    canvasContext:
                      ctx,

                    viewport:
                      scaled,

                    transform:
                      ratio !==
                      1
                        ? [
                            ratio,
                            0,
                            0,
                            ratio,
                            0,
                            0,
                          ]
                        : null,
                  }
                ).promise;
              }

            }
          );

        } catch (
          err
        ) {

          if (
            !cancelled
          ) {
            setError(
              err.message ||
                'Could not render preview'
            );
          }

        }

      };

    if (
      fileUrl
    ) {
      renderPdf();
    }

    return () => {
      cancelled =
        true;

      loadingTask?.destroy();
    };

  }, [fileUrl]);

  const goToPage = (
    page
  ) => {

    if (
      page <
        1 ||
      page >
        pages.length
    )
      return;

    setCurrentPage(
      page
    );

    setJumpPage(
      page
    );

    canvasRefs.current[
      page - 1
    ]?.scrollIntoView(
      {
        behavior:
          'smooth',

        block:
          'start',
      }
    );

  };

  return (

    <div
      ref={
        containerRef
      }

      title={
        title
      }

      className={`overflow-y-auto bg-surface-secondary px-3 py-5 ${
        isFullscreen
          ? 'h-full'
          : 'h-[78vh]'
      }`}

      onContextMenu={(
        e
      ) =>
        e.preventDefault()
      }

      draggable="false"
    >

      {!error &&
        pages.length >
          0 && (

          <div
            className="
            sticky
            top-0
            z-50
            mb-5
            flex
            items-center
            justify-center
            gap-3
            rounded-lg
            border
            border-border
            bg-surface
            p-3
            text-foreground
            "
          >

            <button
              onClick={() =>
                goToPage(
                  currentPage -
                    1
                )
              }

              className="
              px-4
              py-2
              rounded
              bg-accent
              text-white
              "
            >
              Prev
            </button>

            <span>

              Page

              <input
                type="number"

                min={1}

                max={
                  pages.length
                }

                value={
                  jumpPage
                }

                onChange={(
                  e
                ) =>
                  setJumpPage(
                    e.target
                      .value
                  )
                }

                className="
                mx-2
                w-20
                rounded
                border
                border-border
                bg-surface
                text-foreground
                px-2
                py-1
                text-center
                outline-none
                "
              />

              of

              {
                pages.length
              }

            </span>

            <button
              onClick={() =>
                goToPage(
                  Number(
                    jumpPage
                  )
                )
              }

              className="
              px-4
              py-2
              rounded
              bg-blue-600
              text-white
              "
            >
              Go
            </button>

            <button
              onClick={() =>
                goToPage(
                  currentPage +
                    1
                )
              }

              className="
              px-4
              py-2
              rounded
              bg-accent
              text-white
              "
            >
              Next
            </button>

          </div>
        )}

      {error ? (

        <div
          className="
          text-center
          text-danger
          font-bold
          mt-10
          "
        >
          {error}
        </div>

      ) : (

        <div
          className="
          mx-auto
          flex
          max-w-5xl
          flex-col
          items-center
          gap-5
          "
        >

          {pages.map(
            (
              pageNumber
            ) => (

              <div
                key={
                  pageNumber
                }
              >

                <div
                  className="
                  mb-2
                  text-center
                  text-sm
                  text-foreground
                  "
                >
                  Page{' '}
                  {
                    pageNumber
                  }
                </div>

                <canvas
                  ref={(
                    node
                  ) => {
                    canvasRefs.current[
                      pageNumber -
                        1
                    ] =
                      node;
                  }}

                  className="
                  protected-pdf-page
                  dark-invert-pdf
                  "

                  onContextMenu={(
                    e
                  ) =>
                    e.preventDefault()
                  }

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