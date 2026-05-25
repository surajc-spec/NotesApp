import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Archive,
  BarChart3,
  Clock3,
  Download,
  Eye,
  EyeOff,
  FileQuestion,
  FileText,
  Loader2,
  Lock,
  LogOut,
  Mail,
  NotebookTabs,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import api from '../services/api';

const formatDate = (value) => (value ? new Date(value).toLocaleString('en-IN') : '--');
const displayMetric = (value) => (value === null || value === undefined ? '--' : value);

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
    status === 'new' ? 'bg-accent/15 text-accent' :
    status === 'resolved' ? 'bg-success/15 text-success' :
    'bg-surface-secondary text-muted'
  }`}>
    {status}
  </span>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-xl rounded-[1.5rem] border border-border bg-surface p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold">{title}</h3>
        <button type="button" onClick={onClose} className="rounded-lg bg-surface-secondary p-2">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const AdminDhoom = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [paperMetrics, setPaperMetrics] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const adminHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadDashboard = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const [usersRes, notesRes, statsRes, messagesRes, analyticsRes, paperMetricsRes] = await Promise.all([
        api.get('/admin/users', { headers: adminHeaders }),
        api.get('/admin/notes', { headers: adminHeaders }),
        api.get('/admin/stats', { headers: adminHeaders }),
        api.get('/admin/messages', { headers: adminHeaders }),
        api.get('/admin/analytics', { headers: adminHeaders }),
        api.get('/admin/question-paper-metrics', { headers: adminHeaders }),
      ]);

      setUsers(usersRes.data || []);
      setNotes(notesRes.data || []);
      setStats(statsRes.data || null);
      setMessages(messagesRes.data || []);
      setAnalytics(analyticsRes.data || null);
      setPaperMetrics(paperMetricsRes.data || null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/admin/login', { email, password });
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

  const openAdminFile = (path) => {
    const params = new URLSearchParams({ token, t: String(Date.now()) });
    window.open(`${api.defaults.baseURL}${path}?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  const setMessageStatus = async (message, status) => {
    try {
      const res = await api.patch(`/admin/messages/${message._id}`, { status }, { headers: adminHeaders });
      setMessages((items) => items.map((item) => (item._id === message._id ? res.data : item)));
      setSelectedMessage((current) => (current?._id === message._id ? res.data : current));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update message');
    }
  };

  const softDeleteNote = async (note) => {
    if (!window.confirm(`Remove "${note.title}" from visible notes? The file will be retained.`)) return;

    try {
      await api.patch(`/admin/notes/${note._id}/soft-delete`, {}, { headers: adminHeaders });
      setNotice('Upload removed. Original record and file retained.');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove upload');
    }
  };

  const messageCounts = {
    new: messages.filter((message) => message.status === 'new').length,
    read: messages.filter((message) => message.status === 'read').length,
    resolved: messages.filter((message) => message.status === 'resolved').length,
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-surface border border-border rounded-[1.5rem] p-6 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl mx-auto flex items-center justify-center"><Users size={30} /></div>
            <h1 className="text-2xl font-bold">Admin</h1>
          </div>
          {error && <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-2 text-sm"><AlertCircle size={16} />{error}</div>}
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" required className="w-full pl-11 pr-4 py-3 bg-surface-secondary border border-border rounded-field outline-none" />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Admin password" required className="w-full pl-11 pr-11 py-3 bg-surface-secondary border border-border rounded-field outline-none" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-accent text-accent-foreground rounded-field font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            {loading && <Loader2 className="animate-spin" size={18} />} Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6 md:px-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NoteShare Admin</h1>
          <p className="text-muted text-sm">Private dashboard</p>
        </div>
        <button type="button" onClick={logout} className="p-3 bg-surface border border-border rounded-xl" title="Logout"><LogOut size={18} /></button>
      </header>

      {error && <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-2 text-sm"><AlertCircle size={16} />{error}</div>}
      {notice && <div className="p-3 bg-success/10 border border-success/20 text-success rounded-xl text-sm">{notice}</div>}

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-accent" size={36} /></div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ['Users', stats?.totalUsers || 0, Users],
              ['Notes', stats?.totalNotes || 0, FileText],
              ['Subjects', stats?.totalSubjects || 0, NotebookTabs],
              ['Today uploads', stats?.uploadsToday || 0, Archive],
            ].map(([label, value, Icon]) => (
              <div key={label} className="bg-surface border border-border rounded-xl p-4">
                <Icon size={20} className="text-accent mb-3" /><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">Analytics</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ['Active Users', analytics?.activeUsers, Activity],
                ['Avg Engagement Time', analytics?.averageEngagementTime, Clock3],
                ['Returning Users', analytics?.returningUsers, Users],
              ].map(([label, value, Icon]) => (
                <div key={label} className="bg-surface border border-border rounded-xl p-4">
                  <Icon size={20} className="text-accent mb-3" /><p className="text-2xl font-bold">{displayMetric(value)}</p><p className="text-xs text-muted">{label}</p>
                </div>
              ))}
              <div className="bg-surface border border-border rounded-xl p-4">
                <BarChart3 size={20} className="text-accent mb-3" />
                <p className="text-xs text-muted mb-2">Traffic</p>
                <div className="flex justify-between gap-2 text-sm"><span>New Users</span><strong>{displayMetric(analytics?.traffic?.newUsers)}</strong></div>
                <div className="flex justify-between gap-2 text-sm"><span>Returning</span><strong>{displayMetric(analytics?.traffic?.returningUsers)}</strong></div>
                <div className="flex justify-between gap-2 text-sm"><span>Views</span><strong>{displayMetric(analytics?.traffic?.views)}</strong></div>
              </div>
            </div>
            {!analytics?.configured && <p className="text-xs text-muted">Google Analytics reporting not configured on the server. Existing site analytics remains unchanged.</p>}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">Question Paper Metrics</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ['Question Papers', paperMetrics?.papers, FileQuestion],
                ['Subjects', paperMetrics?.subjects, NotebookTabs],
                ['Most Viewed Subject', paperMetrics?.mostViewedSubject, Eye],
                ['Most Uploaded Subject', paperMetrics?.mostUploadedSubject, Archive],
              ].map(([label, value, Icon]) => (
                <div key={label} className="bg-surface border border-border rounded-xl p-4">
                  <Icon size={20} className="text-accent mb-3" /><p className="text-xl font-bold truncate">{displayMetric(value)}</p><p className="text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
            {!paperMetrics?.mostViewedSubject && <p className="text-xs text-muted">Most viewed subject will appear after subject view tracking is available.</p>}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">Contact Requests</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['New Messages', messageCounts.new],
                ['Read', messageCounts.read],
                ['Resolved', messageCounts.resolved],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-surface p-4"><p className="text-2xl font-bold text-accent">{value}</p><p className="text-xs text-muted">{label}</p></div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-secondary text-muted"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Subject</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message._id} className="border-t border-border">
                      <td className="p-3 font-bold">{message.name}{message.status === 'new' && <span className="ml-2 h-2 w-2 inline-block rounded-full bg-accent" />}</td>
                      <td className="p-3 text-muted">{message.email}</td>
                      <td className="p-3">{message.subject}</td>
                      <td className="p-3 text-muted">{formatDate(message.createdAt)}</td>
                      <td className="p-3"><StatusBadge status={message.status} /></td>
                      <td className="p-3 whitespace-nowrap space-x-2">
                        <button onClick={() => setSelectedMessage(message)} className="text-accent font-bold">View</button>
                        {message.status === 'new' && <button onClick={() => setMessageStatus(message, 'read')} className="text-muted font-bold">Mark Read</button>}
                        {message.status !== 'resolved' && <button onClick={() => setMessageStatus(message, 'resolved')} className="text-success font-bold">Resolve</button>}
                      </td>
                    </tr>
                  ))}
                  {!messages.length && <tr><td colSpan="6" className="p-6 text-center text-muted">No contact messages yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">Recent Users</h2>
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-secondary text-muted"><tr><th className="p-3">Name</th><th className="p-3">Branch</th><th className="p-3">Year</th><th className="p-3">Joined</th><th className="p-3">Action</th></tr></thead>
                <tbody>
                  {users.slice(0, 10).map((user) => (
                    <tr key={user._id} className="border-t border-border">
                      <td className="p-3 font-bold">{user.name}</td><td className="p-3">{user.branch}</td><td className="p-3">{user.year}</td><td className="p-3 text-muted">{formatDate(user.createdAt)}</td>
                      <td className="p-3"><button onClick={() => setSelectedUser(user)} className="text-accent font-bold">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Recent Uploads</h2><button type="button" onClick={() => openAdminFile('/admin/download-all')} className="px-3 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-bold flex items-center gap-2"><Download size={14} />Download All</button></div>
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-surface-secondary text-muted"><tr><th className="p-3">Title</th><th className="p-3">Subject</th><th className="p-3">Uploader</th><th className="p-3">Preview</th><th className="p-3">Actions</th></tr></thead>
                <tbody>
                  {notes.slice(0, 10).map((note) => (
                    <tr key={note._id} className="border-t border-border">
                      <td className="p-3 font-bold">{note.title}</td><td className="p-3">{note.subject}</td><td className="p-3 text-muted">{note.uploader?.name || 'Unknown'}</td>
                      <td className="p-3"><button onClick={() => openAdminFile(`/admin/preview/${note._id}`)} className="text-accent font-bold">View</button></td>
                      <td className="p-3 whitespace-nowrap space-x-3"><button onClick={() => openAdminFile(`/admin/download/${note._id}`)} title="Download"><Download size={16} className="inline" /></button><button onClick={() => softDeleteNote(note)} className="text-danger" title="Soft delete"><Trash2 size={16} className="inline" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {selectedMessage && (
        <Modal title="Contact Message" onClose={() => setSelectedMessage(null)}>
          <div className="space-y-3 text-sm">
            <p><span className="text-muted">Name:</span> {selectedMessage.name}</p>
            <p><span className="text-muted">Email:</span> {selectedMessage.email}</p>
            <p><span className="text-muted">Subject:</span> {selectedMessage.subject}</p>
            <p><span className="text-muted">Created:</span> {formatDate(selectedMessage.createdAt)}</p>
            <StatusBadge status={selectedMessage.status} />
            <p className="rounded-xl bg-surface-secondary p-4 whitespace-pre-wrap">{selectedMessage.message}</p>
          </div>
        </Modal>
      )}
      {selectedUser && (
        <Modal title="User Details" onClose={() => setSelectedUser(null)}>
          <div className="space-y-3 text-sm"><p><span className="text-muted">Name:</span> {selectedUser.name}</p><p><span className="text-muted">Email:</span> {selectedUser.email}</p><p><span className="text-muted">Branch:</span> {selectedUser.branch}</p><p><span className="text-muted">Year:</span> {selectedUser.year}</p><p><span className="text-muted">Joined:</span> {formatDate(selectedUser.createdAt)}</p></div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDhoom;
