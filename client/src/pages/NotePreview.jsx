import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Loader2, Maximize, Minimize, RefreshCw, ShieldCheck } from 'lucide-react';

import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import AdUnit from '../components/AdUnit';
import PasswordModal from '../components/PasswordModal';
import ScreenshotGuard from '../components/ScreenshotGuard';
import ProtectedPdfViewer from '../components/ProtectedPdfViewer';
import { normalizeSubject } from '../utils/subjectUtils';

const NotePreview = ({ resourceType = 'notes' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [note, setNote] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isScreenShieldVisible, setIsScreenShieldVisible] = useState(false);
  const isQuestionPaper = resourceType === 'questionpapers';
  const resourceBasePath = isQuestionPaper ? '/questionpapers' : '/notes';
  const resourceLabel = isQuestionPaper ? 'question paper' : 'note';

  const previewUrlRef = useRef('');
  const previewFrameRef = useRef(null);
  const shieldTimerRef = useRef(null);

  const showScreenShield = useCallback(() => {
    setIsScreenShieldVisible(true);

    if (shieldTimerRef.current) clearTimeout(shieldTimerRef.current);

    shieldTimerRef.current = setTimeout(() => {
      setIsScreenShieldVisible(false);
    }, 1400);
  }, []);

  const readApiError = async (err) => {
    if (!err.response?.data) return 'Preview unavailable';

    try {
      if (err.response.data instanceof Blob) {
        const text = await err.response.data.text();
        const parsed = JSON.parse(text);
        return parsed.message || 'Preview unavailable';
      }

      return err.response.data.message || 'Preview unavailable';
    } catch {
      return 'Preview unavailable';
    }
  };

  const getFirstSuccessful = async (requests) => {
    let lastError;

    for (const request of requests) {
      try {
        return await request();
      } catch (err) {
        lastError = err;

        if (err.response?.status && err.response.status !== 404) {
          throw err;
        }
      }
    }

    throw lastError;
  };

  const watermark = useMemo(() => {
    const stamp = new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `Viewed by ${user?.name || 'User'} | ${user?.email || ''} | ${stamp}`;
  }, [user?.email, user?.name]);

  const loadPreview = async (pwd = enteredPassword) => {
    setLoading(true);
    setError('');

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }

    try {
      const config = { headers: {} };

      if (pwd) {
        config.headers['x-note-password'] = pwd;
      }

      const passwordParams = pwd ? { password: pwd } : {};
      const requestConfig = {
        ...config,
        params: passwordParams,
      };

      const info = await getFirstSuccessful([
        () => api.get(`${resourceBasePath}/${id}${isQuestionPaper ? '' : '/preview-info'}`, requestConfig),
        () => api.get(`/notes/preview-info/${id}`, requestConfig),
      ]);

      setNote(info.data);

      const file = await getFirstSuccessful([
        () =>
          api.get(`${resourceBasePath}/${id}/preview`, {
            responseType: 'blob',
            ...requestConfig,
            headers: {
              ...requestConfig.headers,
            },
          }),
        () =>
          api.get(`/notes/preview/${id}`, {
            responseType: 'blob',
            ...requestConfig,
            headers: {
              ...requestConfig.headers,
            },
          }),
      ]);

      const url = URL.createObjectURL(file.data);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      setIsPasswordModalOpen(false);
    } catch (err) {
      const askPwd = err.response?.status === 401;

      if (askPwd) {
        setIsPasswordModalOpen(true);
      } else {
        setError(await readApiError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (password) => {
    if (isQuestionPaper) return;

    await getFirstSuccessful([
      () =>
        api.post(`/notes/${id}/verify-password`, {
          password,
        }),
      () =>
        api.post(`/notes/verify-password/${id}`, {
          password,
        }),
    ]);

    setEnteredPassword(password);
    await loadPreview(password);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPreview();

    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (shieldTimerRef.current) clearTimeout(shieldTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!isFullscreen) return;

    const scrollY = window.scrollY;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsFullscreen(false);
    };

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    previewFrameRef.current?.focus();
    window.addEventListener('keydown', handleEscape, true);

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
      window.removeEventListener('keydown', handleEscape, true);
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    requestAnimationFrame(() => previewFrameRef.current?.focus());
  };

  const watermarkLayer = (
    <div className="pointer-events-none absolute inset-0 z-10 select-none opacity-70">
      <div
        className="preview-watermark-grid h-full w-full"
        style={{ '--watermark-text': `"${watermark}"` }}
      />
      <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-surface/80 px-4 py-2 text-xs font-bold text-foreground shadow-sm">
        {watermark}
      </div>
    </div>
  );

  const fullscreenLayer =
    isFullscreen &&
    createPortal(
      <section
        ref={previewFrameRef}
        tabIndex={-1}
        className="protected-preview fixed inset-0 z-[999999] flex h-[100dvh] w-screen flex-col overflow-hidden bg-background outline-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="relative z-30 grid h-20 shrink-0 grid-cols-[minmax(0,1fr)_minmax(220px,520px)_auto] items-center gap-3 border-b border-border bg-surface px-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-accent">
              <Eye size={16} />
              Preview only
            </div>
            <p className="truncate text-sm font-bold text-foreground">{note?.title}</p>
          </div>

          <AdUnit placement="fullscreen" compact className="h-14 max-h-14 w-full" />

          <button
            onClick={toggleFullscreen}
            className="flex shrink-0 items-center justify-center gap-2 rounded-field bg-accent px-4 py-3 font-bold text-accent-foreground shadow-lg hover:opacity-90"
          >
            <Minimize size={18} />
            Exit
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-black/85 backdrop-blur-md">
          {isScreenShieldVisible && (
            <div className="absolute inset-0 z-[2147483647] flex items-center justify-center bg-black text-center text-lg font-bold text-white">
              Protected preview
            </div>
          )}

          {watermarkLayer}
          <ProtectedPdfViewer
            fileUrl={previewUrl}
            title={note?.title || 'Protected note preview'}
            isFullscreen
          />
        </div>
      </section>,
      document.body
    );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accent" size={52} />
        <p className="font-medium text-muted">Opening protected preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-lg border border-border bg-surface p-10 text-center">
        <ShieldCheck className="text-danger" size={44} />
        <div>
          <h2 className="text-2xl font-bold">Preview unavailable</h2>
          <p className="mt-2 text-muted">{error}</p>
        </div>
        <button
          onClick={() => navigate(resourceBasePath)}
          className="rounded-field bg-accent px-5 py-3 font-bold text-accent-foreground"
        >
          Back to {isQuestionPaper ? 'Question Papers' : 'Notes'}
        </button>
      </div>
    );
  }

  return (
    <ScreenshotGuard isEnabled onBlock={showScreenShield}>
      <div className="protected-preview pb-16">
        {fullscreenLayer}

        {isScreenShieldVisible && (
          <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black text-center text-lg font-bold text-white">
            Protected preview
          </div>
        )}

        <AdUnit placement="top" className="mb-6" />

        <div className="mb-5 flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="mb-2 flex items-center gap-2 text-sm font-bold text-muted hover:text-accent"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-accent">
              <Eye size={16} />
              Preview only
            </div>
            <h1 className="truncate text-2xl font-bold text-foreground">{note?.title}</h1>
            <p className="text-sm text-muted">
              {normalizeSubject(note?.subject)} | {note?.uploader?.name || 'Anonymous'}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => loadPreview()}
              className="flex items-center justify-center gap-2 rounded-field bg-surface-secondary px-4 py-3 font-bold hover:bg-surface-tertiary"
            >
              <RefreshCw size={18} />
              Refresh Preview
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center gap-2 rounded-field bg-accent px-4 py-3 font-bold text-accent-foreground hover:opacity-90"
            >
              <Maximize size={18} />
              Fullscreen
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <section
            className="preview-fullscreen-shell relative min-h-[75vh] overflow-hidden rounded-lg border border-border bg-surface"
            onContextMenu={(e) => e.preventDefault()}
          >
            {watermarkLayer}
            <ProtectedPdfViewer
              fileUrl={previewUrl}
              title={note?.title || 'Protected note preview'}
              isFullscreen={false}
            />
          </section>

          <div className="space-y-6">
            <AdUnit placement="sidebar" className="hidden lg:block" />
          </div>
        </div>

        <AdUnit placement="footer" className="mt-8" />
      </div>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onSubmit={handlePasswordSubmit}
        onClose={() => navigate(-1)}
        title={note?.title || `Protected ${resourceLabel}`}
      />
    </ScreenshotGuard>
  );
};

export default NotePreview;
