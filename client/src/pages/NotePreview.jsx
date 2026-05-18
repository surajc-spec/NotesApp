import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import AdUnit from '../components/AdUnit';

const NotePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [note, setNote] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const previewUrlRef = useRef('');

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

  const loadPreview = async () => {
    setLoading(true);
    setError('');
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    try {
      const [infoRes, fileRes] = await Promise.all([
        api.get(`/notes/preview-info/${id}`),
        api.get(`/notes/preview/${id}`, { responseType: 'blob' }),
      ]);

      setNote(infoRes.data);
      const objectUrl = URL.createObjectURL(fileRes.data);
      previewUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not open protected preview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [id]);

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
        <button
          onClick={loadPreview}
          className="flex items-center justify-center gap-2 rounded-field bg-surface-secondary px-4 py-3 font-bold hover:bg-surface-tertiary"
        >
          <RefreshCw size={18} />
          Refresh Preview
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="relative min-h-[75vh] overflow-hidden rounded-lg border border-border bg-surface">
          <div className="pointer-events-none absolute inset-0 z-10 select-none opacity-70">
            <div className="preview-watermark-grid h-full w-full" style={{ '--watermark-text': `"${watermark}"` }} />
            <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-surface/80 px-4 py-2 text-xs font-bold text-foreground shadow-sm">
              {watermark}
            </div>
          </div>
          <iframe
            title={note?.title || 'Protected note preview'}
            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="h-[78vh] w-full select-none bg-white"
            draggable="false"
            onContextMenu={(e) => e.preventDefault()}
          />
        </section>

        <div className="space-y-6">
          <AdUnit placement="sidebar" className="hidden lg:block" />
          <AdUnit placement="inContent" />
        </div>
      </div>

      <AdUnit placement="footer" className="mt-8" />
    </div>
  );
};

export default NotePreview;
