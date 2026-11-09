import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Trash2,
  ShieldCheck,
  Lock,
  Loader2,
  AlertCircle,
  Megaphone,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const formatTimestamp = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const Community = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';

  // For Admin: query params can override to inspect any channel.
  // For Students: strictly always use data from their profile!
  const branchParam = searchParams.get('branch');
  const semesterParam = searchParams.get('semester');

  const activeBranch = (isAdmin && branchParam) ? branchParam : user?.branch;
  const activeSemester = (isAdmin && semesterParam) ? Number(semesterParam) : user?.semester;

  // Messages state
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [requiresProfile, setRequiresProfile] = useState(false);

  // Compose input state
  const [content, setContent] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Auto-scroll ref
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);

  // Authentication & Profile Setup check
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isAdmin && (!user.branch || !user.semester)) {
      setRequiresProfile(true);
      setLoading(false);
    }
  }, [user, isAdmin, navigate]);

  const getHeaders = () => {
    const authToken = token || localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  };

  // Fetch messages
  const fetchMessages = async (isPolling = false) => {
    if (!user) return;
    if (!isAdmin && (!user.branch || !user.semester)) return;

    try {
      const params = new URLSearchParams();
      if (isAdmin && branchParam && semesterParam) {
        params.append('branch', activeBranch);
        params.append('semester', String(activeSemester));
      }

      const res = await fetch(`/api/community/messages?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include',
      });

      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        if (body.requiresProfileSetup) {
          setRequiresProfile(true);
          setLoading(false);
          return;
        }
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to load community messages');
      }

      const data = await res.json();
      setMessages(data.messages || []);
      setError('');

      if (!isPolling || !userScrolledUpRef.current) {
        scrollToBottom();
      }
    } catch (err) {
      if (!isPolling) {
        setError(err.message || 'Could not connect to community stream');
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  // Initial fetch and polling every 4 seconds
  useEffect(() => {
    if (!user || requiresProfile) return;
    setLoading(true);
    fetchMessages(false);

    const interval = setInterval(() => {
      fetchMessages(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeBranch, activeSemester, user, requiresProfile]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    userScrolledUpRef.current = !isAtBottom;
  };

  // Post a message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    setError('');

    try {
      const payload = {
        content: content.trim(),
        isAnnouncement: isAdmin ? isAnnouncement : false,
      };

      if (isAdmin && branchParam && semesterParam) {
        payload.branch = activeBranch;
        payload.semester = activeSemester;
      }

      const res = await fetch('/api/community/messages', {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.message || 'Failed to send message');
      }

      setContent('');
      setIsAnnouncement(false);
      userScrolledUpRef.current = false;
      await fetchMessages(false);
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    setDeletingId(messageId);
    try {
      const res = await fetch(`/api/community/messages/${messageId}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to delete message');
      }

      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      alert(err.message || 'Failed to delete message');
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Profile incomplete block
  if (requiresProfile) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-light-foreground dark:text-dark-foreground mb-3">
            Class Community is Locked
          </h1>
          <p className="text-light-muted dark:text-dark-muted mb-8 leading-relaxed text-sm sm:text-base">
            To maintain strict academic privacy, you must link your verified Engineering Branch and Semester before joining your class discussion hub.
          </p>
          <Link
            to="/setup-profile"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-btn hover:bg-emerald-400 transition-all shadow-md active:scale-95"
          >
            <span>Complete Profile Setup</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-72px)] flex flex-col bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground overflow-hidden font-sans">
      
      {/* 1. FIXED TOP HEADER BAR (Data strictly from profile or admin query param) */}
      <header className="shrink-0 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-light-border dark:border-dark-border px-4 sm:px-8 py-3.5 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 dark:bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
              <MessageSquare className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-light-foreground dark:text-dark-foreground truncate">
                  {activeBranch || 'My Class'}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted border border-light-border dark:border-dark-border shrink-0">
                  Semester {activeSemester}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-light-muted dark:text-dark-muted truncate mt-0.5">
                {isAdmin && branchParam
                  ? `Viewing ${activeBranch} Sem ${activeSemester} group from Admin Panel.`
                  : 'Class discussion group for your verified branch & semester.'}
              </p>
            </div>
          </div>

          {/* Admin shortcut to return to dashboard */}
          {isAdmin && branchParam && (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border hover:border-primary text-light-foreground dark:text-dark-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>
      </header>

      {/* ERROR BANNER */}
      {error && (
        <div className="shrink-0 max-w-4xl mx-auto w-full px-4 pt-3">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 2. SCROLLABLE MESSAGES STREAM (Only this area scrolls) */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 custom-scrollbar min-h-0"
      >
        <div className="max-w-4xl mx-auto space-y-3.5">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-light-muted dark:text-dark-muted gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-sm">Connecting to {activeBranch} class stream...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-light-muted dark:text-dark-muted">
              <div className="w-14 h-14 rounded-2xl bg-light-surface-secondary dark:bg-dark-surface-secondary flex items-center justify-center mb-3 text-primary">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-light-foreground dark:text-dark-foreground text-base mb-1">
                No discussions yet
              </h3>
              <p className="text-xs sm:text-sm max-w-sm">
                Be the first to ask a doubt or share an exam tip with your {activeBranch} Sem {activeSemester} classmates!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = user?._id && String(msg.sender) === String(user._id);
              const isMsgAdmin = msg.senderRole === 'admin';
              const canDelete = isMine || isAdmin;

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} transition-opacity duration-200`}
                >
                  {/* Sender Metadata Bar */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-semibold text-light-foreground dark:text-dark-foreground">
                      {isMine ? 'You' : msg.senderName}
                    </span>
                    {isMsgAdmin && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        Admin
                      </span>
                    )}
                    {msg.isAnnouncement && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Megaphone className="w-2.5 h-2.5" />
                        Announcement
                      </span>
                    )}
                    <span className="text-[11px] text-light-muted dark:text-dark-muted">
                      {formatTimestamp(msg.createdAt)}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                      msg.isAnnouncement
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/30 text-light-foreground dark:text-dark-foreground shadow-sm'
                        : isMine
                        ? 'bg-primary text-primary-foreground font-medium rounded-tr-sm shadow-sm'
                        : isMsgAdmin
                        ? 'bg-primary/10 dark:bg-primary/15 border border-primary/30 text-light-foreground dark:text-dark-foreground rounded-tl-sm'
                        : 'bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-light-foreground dark:text-dark-foreground rounded-tl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                    {/* Delete action button */}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg._id)}
                        disabled={deletingId === msg._id}
                        title="Delete message"
                        className={`absolute -top-2.5 ${
                          isMine ? '-left-7' : '-right-7'
                        } opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-red-500 hover:text-red-600 hover:scale-110 shadow-sm`}
                      >
                        {deletingId === msg._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. PERMANENTLY FIXED INPUT COMPOSER (Docked strictly at bottom, never moves) */}
      <footer className="shrink-0 border-t border-light-border dark:border-dark-border bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-md px-4 sm:px-8 py-3 z-20">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="space-y-2">
            {/* Admin Announcement Toggle */}
            {isAdmin && (
              <div className="flex items-center justify-between pb-0.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground">
                  <input
                    type="checkbox"
                    checked={isAnnouncement}
                    onChange={(e) => setIsAnnouncement(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-primary focus:ring-primary accent-primary"
                  />
                  <span className="font-semibold flex items-center gap-1">
                    <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                    Mark as Official Announcement for {activeBranch} Sem {activeSemester}
                  </span>
                </label>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeBranch} Sem ${activeSemester} class... (Shift + Enter for new line)`}
                  rows={1}
                  maxLength={1000}
                  className="w-full h-[48px] max-h-32 px-4 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-2xl text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                />
                <span className="absolute right-3 bottom-2 text-[10px] text-light-muted dark:text-dark-muted pointer-events-none">
                  {content.length}/1000
                </span>
              </div>

              <button
                type="submit"
                disabled={!content.trim() || sending}
                className="w-12 h-12 rounded-2xl bg-primary hover:bg-emerald-400 text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40 disabled:hover:bg-primary transition-all shadow-sm active:scale-95"
                title="Send message"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 stroke-[2.2]" />
                )}
              </button>
            </div>
          </form>
        </div>
      </footer>

    </div>
  );
};

export default Community;
