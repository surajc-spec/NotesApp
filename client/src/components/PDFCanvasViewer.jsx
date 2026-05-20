import React, { useEffect, useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Loader2, AlertCircle } from 'lucide-react';

const PDFPage = ({ pdf, pageNum, scale }) => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let renderTask = null;
    const renderPage = async () => {
      try {
        setLoading(true);
        const page = await pdf.getPage(pageNum);
        
        // Mobile-friendly responsive scale adjustment
        const isMobile = window.innerWidth < 768;
        const finalScale = isMobile ? scale * 0.8 : scale;
        
        const viewport = page.getViewport({ scale: finalScale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        
        // Handle device pixel ratio for sharp rendering on high-DPI/Retina screens
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        
        context.scale(dpr, dpr);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
        setLoading(false);
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, pageNum, scale]);

  return (
    <div className="relative my-4 mx-auto border border-border rounded-xl shadow-md max-w-full overflow-hidden flex justify-center items-center p-1 bg-white dark-invert-pdf">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-sm z-10">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      )}
      <canvas ref={canvasRef} className="max-w-full block" />
    </div>
  );
};

const PDFCanvasViewer = ({ pdfBlob }) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!window.pdfjsLib) {
          // If not loaded yet, wait or try to find it
          let checkCount = 0;
          while (!window.pdfjsLib && checkCount < 30) {
            await new Promise(r => setTimeout(r, 100));
            checkCount++;
          }
        }

        if (!window.pdfjsLib) {
          throw new Error('PDF.js library is taking too long to load. Please refresh the page.');
        }

        // Configure worker
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const arrayBuffer = await pdfBlob.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;

        if (active) {
          setPdf(pdfDoc);
          setNumPages(pdfDoc.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF document:', err);
        if (active) {
          setError(err.message || 'Failed to initialize document viewer.');
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      active = false;
    };
  }, [pdfBlob]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[50vh]">
        <Loader2 className="animate-spin text-accent" size={40} />
        <p className="text-sm text-muted font-medium">Loading protected document viewer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center border border-danger/20 rounded-2xl bg-danger/5 text-danger flex flex-col items-center gap-3 max-w-md mx-auto my-12">
        <AlertCircle size={36} />
        <h4 className="font-bold text-foreground">Viewer Error</h4>
        <p className="text-sm leading-relaxed">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Viewer Toolbar */}
      <div className="sticky top-4 z-30 flex items-center justify-between gap-4 p-2.5 px-5 bg-surface/90 border border-border rounded-full shadow-lg backdrop-blur-md mb-6 text-xs font-bold text-foreground">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.15))}
            disabled={scale <= 0.5}
            className="p-1.5 hover:bg-surface-secondary rounded-full disabled:opacity-50 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
          <button 
            onClick={() => setScale(prev => Math.min(1.8, prev + 0.15))}
            disabled={scale >= 1.8}
            className="p-1.5 hover:bg-surface-secondary rounded-full disabled:opacity-50 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="tracking-wide">
          {numPages} Page{numPages > 1 ? 's' : ''}
        </div>
      </div>

      {/* Pages Container */}
      <div className="w-full max-w-4xl mx-auto space-y-4 px-1 pb-12">
        {Array.from({ length: numPages }, (_, i) => (
          <PDFPage key={i + 1} pdf={pdf} pageNum={i + 1} scale={scale} />
        ))}
      </div>
    </div>
  );
};

export default PDFCanvasViewer;
