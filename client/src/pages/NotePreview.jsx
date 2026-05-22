import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Loader2,
  Maximize,
  Minimize,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

import AdUnit from '../components/AdUnit';
import PasswordModal from '../components/PasswordModal';
import ScreenshotGuard from '../components/ScreenshotGuard';
import ProtectedPdfViewer from '../components/ProtectedPdfViewer';

const NotePreview = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const [note, setNote] = useState(null);

  const [previewUrl, setPreviewUrl] = useState('');

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] =
    useState(false);

  const [enteredPassword, setEnteredPassword] =
    useState('');

  const [isPasswordProtected, setIsPasswordProtected] =
    useState(false);

  const previewUrlRef = useRef('');

  const previewFrameRef = useRef(null);

  const readApiError = async (err) => {
    if (!err.response?.data) {
      return 'Preview request failed';
    }

    try {
      if (err.response.data instanceof Blob) {
        const text =
          await err.response.data.text();

        const parsed =
          JSON.parse(text);

        return (
          parsed.message ||
          `Preview request failed (${err.response.status})`
        );
      }

      return (
        err.response.data.message ||
        `Preview request failed (${err.response.status})`
      );
    } catch {
      return 'Preview unavailable';
    }
  };

  const watermark = useMemo(() => {
    return `Viewed by ${
      user?.name || 'User'
    }`;
  }, [user]);



  // ======================
  // FIXED PREVIEW LOADER
  // ======================

  const loadPreview = async (
    pwd = enteredPassword
  ) => {
    setLoading(true);

    setError('');

    try {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(
          previewUrlRef.current
        );

        previewUrlRef.current = '';
      }

      const config = {};

      if (pwd) {
        config.headers = {
          'x-note-password': pwd,
        };
      }

      // FIXED
      const infoRes =
        await api.get(
          `/notes/${id}/preview-info`,
          config
        );

      setNote(infoRes.data);

      setIsPasswordProtected(
        infoRes.data.isPasswordProtected
      );

      // FIXED
      const fileRes =
        await api.get(
          `/notes/${id}/preview`,
          {
            responseType: 'blob',
            ...config,
          }
        );

      const url =
        URL.createObjectURL(
          fileRes.data
        );

      previewUrlRef.current =
        url;

      setPreviewUrl(url);

      setIsPasswordModalOpen(
        false
      );
    } catch (err) {
      const requirePassword =
        err.response?.status ===
          401 ||
        err.response?.data
          ?.isPasswordRequired;

      if (requirePassword) {
        setIsPasswordProtected(
          true
        );

        setIsPasswordModalOpen(
          true
        );
      } else {
        setError(
          await readApiError(
            err
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };



  // ======================
  // FIXED PASSWORD VERIFY
  // ======================

  const handlePasswordSubmit =
    async (password) => {
      try {
        await api.post(
          `/notes/${id}/verify-password`,
          {
            password,
          }
        );

        setEnteredPassword(
          password
        );

        await loadPreview(
          password
        );
      } catch (err) {
        throw new Error(
          err.response?.data
            ?.message ||
            'Invalid password'
        );
      }
    };



  useEffect(() => {
    loadPreview();

    return () => {
      if (
        previewUrlRef.current
      ) {
        URL.revokeObjectURL(
          previewUrlRef.current
        );
      }
    };
  }, [id]);



  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2
          className="animate-spin"
          size={50}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">

        <div className="text-center">

          <ShieldCheck
            size={40}
          />

          <h2>
            Preview unavailable
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={() =>
              navigate(
                '/notes'
              )
            }
          >
            Back
          </button>

        </div>

      </div>
    );
  }

  return (
    <ScreenshotGuard>

      <div>

        <div className="mb-5">

          <button
            onClick={() =>
              navigate(-1)
            }
          >
            <ArrowLeft />
          </button>

          <button
            onClick={() =>
              loadPreview()
            }
          >
            <RefreshCw />
          </button>

          <button
            onClick={() =>
              setIsFullscreen(
                !isFullscreen
              )
            }
          >
            {isFullscreen
              ? <Minimize />
              : <Maximize />}
          </button>

        </div>

        <ProtectedPdfViewer
          fileUrl={
            previewUrl
          }
          title={
            note?.title
          }
          isFullscreen={
            isFullscreen
          }
        />

      </div>

      <PasswordModal
        isOpen={
          isPasswordModalOpen
        }
        onSubmit={
          handlePasswordSubmit
        }
        onClose={() =>
          navigate(-1)
        }
      />

    </ScreenshotGuard>
  );
};

export default NotePreview;