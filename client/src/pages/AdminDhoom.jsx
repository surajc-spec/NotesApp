import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Archive,
  Download,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Lock,
  LogOut,
  Mail,
  NotebookTabs,
  Shield,
  Users,
} from 'lucide-react';
import api from '../services/api';

const AdminDhoom = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const adminHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const loadDashboard = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const [usersRes, notesRes, statsRes] = await Promise.all([
        api.get('/admin/users', { headers: adminHeaders }),
        api.get('/admin/notes', { headers: adminHeaders }),
        api.get('/admin/stats', { headers: adminHeaders }),
      ]);

      setUsers(usersRes.data || []);
      setNotes(notesRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Admin session expired');
      setToken('');
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/admin/login', {
        email,
        password,
      });

      setToken(res.data.token);
      localStorage.setItem('adminToken', res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
  };

  const download = (path) => {
    const params = new URLSearchParams({
      token,
      t: String(Date.now()),
    });
    window.open(`${api.defaults.baseURL}${path}?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-surface border border-border rounded-[1.5rem] p-6 shadow-2xl space-y-5"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl mx-auto flex items-center justify-center">
              <Shield size={30} />
            </div>
            <h1 className="text-2xl font-bold">Admin</h1>
          </div>

          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Admin email"
              required
              className="w-full pl-11 pr-4 py-3 bg-surface-secondary border border-border rounded-field outline-none"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Admin password"
              required
              className="w-full pl-11 pr-11 py-3 bg-surface-secondary border border-border rounded-field outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent text-accent-foreground rounded-field font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-5 space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">NoteShare Admin</h1>
          <p className="text-muted text-sm">Private dashboard</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="p-3 bg-surface border border-border rounded-xl"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </header>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="animate-spin text-accent" size={36} />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3">
            {[
              ['Users', stats?.totalUsers || 0, Users],
              ['Notes', stats?.totalNotes || 0, FileText],
              ['Subjects', stats?.totalSubjects || 0, NotebookTabs],
              ['Today', stats?.uploadsToday || 0, Archive],
            ].map(([label, value, Icon]) => (
              <div key={label} className="bg-surface border border-border rounded-xl p-4">
                <Icon size={20} className="text-accent mb-3" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </section>

          <section className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <p className="text-sm text-muted">Newest user</p>
            <p className="font-bold">{stats?.newestUser?.name || 'None'}</p>
            <p className="text-xs text-muted">{stats?.newestUser?.email}</p>
            <div className="h-px bg-border my-3" />
            <p className="text-sm text-muted">Newest upload</p>
            <p className="font-bold">{stats?.newestUpload?.title || 'None'}</p>
            <p className="text-xs text-muted">{stats?.newestUpload?.subject}</p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Uploads</h2>
              <button
                type="button"
                onClick={() => download('/admin/download-all')}
                className="px-3 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-bold flex items-center gap-2"
              >
                <Download size={14} />
                All
              </button>
            </div>

            {notes.map((note) => (
              <article key={note._id} className="bg-surface border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{note.title}</p>
                    <p className="text-xs text-muted">{note.subject}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => download(`/admin/download/${note._id}`)}
                    className="p-2 bg-surface-secondary rounded-lg"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                </div>
                <p className="text-xs text-muted">
                  {note.uploader?.name || 'Unknown'} · {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="font-bold">Registered Users</h2>
            {users.map((user) => (
              <article key={user._id} className="bg-surface border border-border rounded-xl p-4">
                <p className="font-bold">{user.name}</p>
                <p className="text-xs text-muted">{user.email}</p>
                <p className="text-xs text-muted mt-2">
                  {user.branch} · {user.year} · {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDhoom;
