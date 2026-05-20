import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Loader2, Maximize, Minimize, RefreshCw, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import AdUnit from '../components/AdUnit';
import PasswordModal from '../components/PasswordModal';
import ScreenshotGuard from '../components/ScreenshotGuard';

const NotePreview = () => {
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
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const previewUrlRef = useRef('');
  const previewFrameRef = useRef(null);

  const readApiError = async (err) => {
    if (!err.response?.data) return err.message || 'Could not open protected preview';

    if (err.response.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const parsed = JSON.parse(text);
        return parsed.message || text;
      } catch (_) {
        return `Preview request failed (${err.response.status})`;
      }
    }

    return err.response.data.message || `Preview request failed (${err.response.status})`;
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
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    try {
      const config = pwd ? { headers: { 'x-note-password': pwd } } : {};
      const infoRes = await api.get(`/notes/preview-info/${id}`, config);
      setNote(infoRes.data);
      setIsPasswordProtected(infoRes.data.isPasswordProtected);

      const fileRes = await api.get(`/notes/preview/${id}`, { 
        responseType: 'blob',
        ...config
      });
      const objectUrl = URL.createObjectURL(fileRes.data);
      previewUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
      setIsPasswordModalOpen(false);
    } catch (err) {
      const isPwdReq = err.response?.status === 401 || (err.response?.data && (err.response.data.isPasswordRequired || err.response.data.message?.includes('Password')));
      if (isPwdReq) {
        setIsPasswordProtected(true);
        setIsPasswordModalOpen(true);
      } else {
        setError(await readApiError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (password) => {
    try {
      await api.post(`/notes/verify-password/${id}`, { password });
      setEnteredPassword(password);
      await loadPreview(password);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Invalid password');
    }
  };

  useEffect(() => {
    loadPreview();
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === previewFrameRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!previewFrameRef.current) return;

    if (document.fullscreenElement === previewFrameRef.current) {
      await document.exitFullscreen();
      return;
    }

    await previewFrameRef.current.requestFullscreen();
  };

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
        <button onClick={() => navigate('/notes')} className="rounded-field bg-accent px-5 py-3 font-bold text-accent-foreground">
          Back to Notes
        </button>
      </div>
    );
  }

  return (
    <ScreenshotGuard isEnabled={true}>
      <div className="protected-preview pb-16">
        <AdUnit placement="top" className="mb-6" />

        <div className="mb-5 flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <button onClick={() => navigate(-1)} className="mb-2 flex items-center gap-2 text-sm font-bold text-muted hover:text-accent">
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-accent">
              <Eye size={16} />
              Preview only
            </div>
            <h1 className="truncate text-2xl font-bold text-foreground">{note?.title}</h1>
            <p className="text-sm text-muted">{note?.subject} | {note?.uploader?.name || 'Anonymous'}</p>
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
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <section ref={previewFrameRef} className="preview-fullscreen-shell relative min-h-[75vh] overflow-hidden rounded-lg border border-border bg-surface">
            <div className="pointer-events-none absolute inset-0 z-10 select-none opacity-70">
              <div className="preview-watermark-grid h-full w-full" style={{ '--watermark-text': `"${watermark}"` }} />
              <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-surface/80 px-4 py-2 text-xs font-bold text-foreground shadow-sm">
                {watermark}
              </div>
            </div>
            <iframe
              title={note?.title || 'Protected note preview'}
              src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              className="h-[78vh] w-full select-none bg-white dark-invert-pdf"
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
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
        onClose={() => navigate(-1)}
        onSubmit={handlePasswordSubmit}
        title={note?.title || 'Protected Note'}
      />
    </ScreenshotGuard>
  );
};

export default NotePreview;
