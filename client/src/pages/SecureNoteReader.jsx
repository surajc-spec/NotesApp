/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize,
  Minimize,
  RefreshCw,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import api from '../services/api';

const PageImage = ({ noteId, page, token, zoom, onVisible, registerPage }) => {
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || src || loading) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoading(true);
          api
            .get(`/notes/secure-view/${noteId}/page/${page}`, {
              responseType: 'blob',
              headers: { 'X-Secure-View-Token': token },
            })
            .then((res) => {
              setSrc(URL.createObjectURL(res.data));
              setError('');
            })
            .catch(() => {
              setError('Page token expired. Refresh the secure reader.');
            })
            .finally(() => setLoading(false));
        }
      },
      { rootMargin: '700px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loading, noteId, page, src, token]);

  useEffect(() => () => {
    if (src) URL.revokeObjectURL(src);
  }, [src]);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onVisible(page);
      },
      { threshold: 0.55 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onVisible, page]);

  return (
    <section
      ref={(node) => {
        wrapperRef.current = node;
        registerPage(page, node);
      }}
      className="mx-auto w-full max-w-5xl py-4 sm:py-6"
      style={{ maxWidth: `${Math.round(960 * zoom)}px` }}
    >
      <div className="mb-2 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wide text-muted">
        <span>Page {page}</span>
        <span>Protected image preview</span>
      </div>
      <div className="min-h-[60vh] overflow-hidden rounded-lg border border-border bg-surface shadow-lg shadow-black/5">
        {src ? (
          <img
            src={src}
            alt={`Protected note page ${page}`}
            draggable="false"
            className="block w-full select-none"
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted">
            {loading ? <Loader2 className="animate-spin text-accent" size={36} /> : <ShieldCheck size={36} />}
            <p className="text-sm font-medium">{error || 'Preparing protected page...'}</p>
          </div>
        )}
      </div>
    </section>
  );
};

const SecureNoteReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const readerRef = useRef(null);
  const pageRefs = useRef({});

  const pageNumbers = useMemo(
    () => Array.from({ length: metadata?.pageCount || 0 }, (_, index) => index + 1),
    [metadata?.pageCount]
  );

  const loadMetadata = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/notes/secure-view/${id}`);
      setMetadata(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not open secure reader');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    const blockContext = (event) => event.preventDefault();
    const blockKeys = (event) => {
      const key = event.key.toLowerCase();
      const blocked =
        key === 'f12' ||
        (event.ctrlKey && ['s', 'p', 'u'].includes(key)) ||
        (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key));

      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', blockContext);
    document.addEventListener('keydown', blockKeys, true);
    return () => {
      document.removeEventListener('contextmenu', blockContext);
      document.removeEventListener('keydown', blockKeys, true);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const registerPage = useCallback((page, node) => {
    if (node) pageRefs.current[page] = node;
  }, []);

  const goToPage = (page) => {
    const safePage = Math.min(Math.max(page, 1), metadata?.pageCount || 1);
    pageRefs.current[safePage]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrentPage(safePage);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await readerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent" size={52} />
        <p className="font-medium text-muted">Opening protected note reader...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-lg border border-border bg-surface p-10 text-center">
        <ShieldCheck className="text-danger" size={44} />
        <div>
          <h2 className="text-2xl font-bold">Secure reader unavailable</h2>
          <p className="mt-2 text-muted">{error}</p>
        </div>
        <button onClick={() => navigate('/notes')} className="rounded-field bg-accent px-5 py-3 font-bold text-accent-foreground">
          Back to Notes
        </button>
      </div>
    );
  }

  return (
    <div
      ref={readerRef}
      className="secure-reader -mx-4 min-h-screen select-none bg-background pb-12 sm:-mx-6 lg:-mx-8"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="sticky top-20 z-30 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-accent">
              <ShieldCheck size={16} />
              Secure reader
            </div>
            <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">{metadata.note.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => goToPage(currentPage - 1)} className="rounded-lg bg-surface-secondary p-2 hover:bg-surface-tertiary" title="Previous page">
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-24 text-center text-sm font-bold">
              {currentPage} / {metadata.pageCount}
            </span>
            <button onClick={() => goToPage(currentPage + 1)} className="rounded-lg bg-surface-secondary p-2 hover:bg-surface-tertiary" title="Next page">
              <ChevronRight size={18} />
            </button>
            <button onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))} className="rounded-lg bg-surface-secondary p-2 hover:bg-surface-tertiary" title="Zoom out">
              <ZoomOut size={18} />
            </button>
            <span className="w-14 text-center text-sm font-bold">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((value) => Math.min(1.6, value + 0.1))} className="rounded-lg bg-surface-secondary p-2 hover:bg-surface-tertiary" title="Zoom in">
              <ZoomIn size={18} />
            </button>
            <button onClick={loadMetadata} className="rounded-lg bg-surface-secondary p-2 hover:bg-surface-tertiary" title="Refresh secure token">
              <RefreshCw size={18} />
            </button>
            <button onClick={toggleFullscreen} className="rounded-lg bg-accent p-2 text-accent-foreground hover:opacity-90" title="Fullscreen">
              {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        {pageNumbers.map((page) => (
          <PageImage
            key={`${metadata.viewToken}-${page}`}
            noteId={id}
            page={page}
            token={metadata.viewToken}
            zoom={zoom}
            onVisible={setCurrentPage}
            registerPage={registerPage}
          />
        ))}
      </div>
    </div>
  );
};

export default SecureNoteReader;
