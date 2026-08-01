import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  GraduationCap, 
  Users,
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileUp, 
  Search,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CustomSelect from '../components/CustomSelect';

const BRANCH_OPTIONS = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
];

const SEMESTER_OPTIONS = [
  { label: 'Semester 1 (First Year)', value: 1 },
  { label: 'Semester 2 (First Year)', value: 2 },
  { label: 'Semester 3 (Second Year)', value: 3 },
  { label: 'Semester 4 (Second Year)', value: 4 },
  { label: 'Semester 5 (Third Year)', value: 5 },
  { label: 'Semester 6 (Third Year)', value: 6 },
  { label: 'Semester 7 (Fourth Year)', value: 7 },
  { label: 'Semester 8 (Fourth Year)', value: 8 },
];

const getYearFromSem = (sem) => {
  const s = Number(sem);
  if (s === 1 || s === 2) return 'First Year';
  if (s === 3 || s === 4) return 'Second Year';
  if (s === 5 || s === 6) return 'Third Year';
  if (s === 7 || s === 8) return 'Fourth Year';
  return 'First Year';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'question-papers' | 'manage' | 'users'

  // Metrics
  const [stats, setStats] = useState({
    notesCount: 0,
    papersCount: 0,
    usersCount: 0,
  });

  // Users Tab Data
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  // Manage Tab Data
  const [manageNotes, setManageNotes] = useState([]);
  const [managePapers, setManagePapers] = useState([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [searchManage, setSearchManage] = useState('');

  // Upload Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    subjectCode: '',
    description: '',
    branch: '',
    semester: '',
    examType: 'insem',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isAdmin) {
      fetchManageData();
      fetchUsersData();
    }
  }, [user]);

  const fetchUsersData = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch('/api/auth/users', { headers, credentials: 'include' });
      const data = await res.json();
      const list = data.users || [];
      setRegisteredUsers(list);
      setStats(prev => ({ ...prev, usersCount: list.length }));
    } catch (err) {
      console.error('Error fetching registered users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchManageData = async () => {
    setManageLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch Notes
      const notesRes = await fetch('/api/notes/view-notes?limit=50', { headers, credentials: 'include' });
      const notesData = await notesRes.json();
      const notesList = notesData.notes || [];

      // Fetch Question Papers
      const papersRes = await fetch('/api/question-papers/view-question-papers?limit=50', { headers, credentials: 'include' });
      const papersData = await papersRes.json();
      const papersList = papersData.questionPapers || [];

      setManageNotes(notesList);
      setManagePapers(papersList);
      setStats(prev => ({
        ...prev,
        notesCount: notesList.length,
        papersCount: papersList.length,
      }));
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setManageLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Only PDF files are allowed.' });
        setSelectedFile(null);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'PDF file size cannot exceed 15 MB.' });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      if (message.text) setMessage({ type: '', text: '' });
    }
  };

  // Upload Handler for Notes or Question Papers
  const handleUploadSubmit = async (e, isQuestionPaper = false) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const { title, subject, subjectCode, description, branch, semester, examType } = formData;

    if (!title || !subject || !subjectCode || !branch || !semester || !selectedFile) {
      setMessage({ type: 'error', text: 'Please fill in all required fields and select a PDF file.' });
      return;
    }

    setUploading(true);

    try {
      const semNum = Number(semester);
      const yearStr = getYearFromSem(semNum);
      const token = localStorage.getItem('token');

      const authHeaders = {
        'Content-Type': 'application/json',
      };
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }

      // Endpoint paths
      const uploadUrlEndpoint = isQuestionPaper 
        ? '/api/question-papers/upload-url' 
        : '/api/notes/upload-url';
      
      const createEndpoint = isQuestionPaper 
        ? '/api/question-papers/create-question-paper' 
        : '/api/notes/create-notes';

      // 1. Get Upload Presigned URL from Cloudflare R2
      const urlRes = await fetch(uploadUrlEndpoint, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      const urlData = await urlRes.json();

      if (!urlRes.ok || !urlData.uploadUrl) {
        throw new Error(urlData.message || 'Failed to generate presigned upload URL.');
      }

      // 2. Upload file directly to R2 bucket
      let r2Res;
      try {
        r2Res = await fetch(urlData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': selectedFile.type },
          body: selectedFile,
        });
      } catch (r2Err) {
        throw new Error('Direct upload to storage server failed. Please ensure Cloudflare R2 bucket CORS is allowed.');
      }

      if (!r2Res.ok) {
        throw new Error(`Upload to storage server failed with status ${r2Res.status}.`);
      }

      // 3. Save Record in MongoDB Database
      const createRes = await fetch(createEndpoint, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({
          title,
          subject,
          subjectCode,
          description,
          branch,
          semester: semNum,
          year: yearStr,
          examType,
          pdfKey: urlData.key,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.message || 'Failed to save record.');
      }

      setMessage({
        type: 'success',
        text: `${isQuestionPaper ? 'Question Paper' : 'Note'} uploaded successfully!`,
      });

      // Reset Form
      setFormData({
        title: '',
        subject: '',
        subjectCode: '',
        description: '',
        branch: '',
        semester: '',
        examType: 'insem',
      });
      setSelectedFile(null);

      // Refresh manage data
      fetchManageData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Something went wrong during upload.' });
    } finally {
      setUploading(false);
    }
  };

  // Delete Note Handler
  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    setDeleteLoadingId(id);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete note.');
      }

      setManageNotes(prev => prev.filter(n => (n._id || n.id) !== id));
      setStats(prev => ({ ...prev, notesCount: Math.max(0, prev.notesCount - 1) }));
    } catch (err) {
      alert(err.message || 'Error deleting note.');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // Delete Question Paper Handler
  const handleDeletePaper = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question paper?')) return;
    setDeleteLoadingId(id);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/api/question-papers/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete question paper.');
      }

      setManagePapers(prev => prev.filter(p => (p._id || p.id) !== id));
      setStats(prev => ({ ...prev, papersCount: Math.max(0, prev.papersCount - 1) }));
    } catch (err) {
      alert(err.message || 'Error deleting question paper.');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // Access Guard
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 bg-light-background dark:bg-dark-background">
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-10 max-w-md text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">Access Restricted</h2>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Only administrators can access the upload dashboard. Please log in with an admin account.
          </p>
          <button
            onClick={() => navigate('/notes')}
            className="w-full h-[46px] bg-primary text-primary-foreground font-bold rounded-btn transition-transform active:scale-95 shadow-md mt-4"
          >
            Browse Academic Library
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = registeredUsers.filter(u =>
    (u.name || '').toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.branch || '').toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredManageNotes = manageNotes.filter(n =>
    (n.title || '').toLowerCase().includes(searchManage.toLowerCase()) ||
    (n.subject || '').toLowerCase().includes(searchManage.toLowerCase())
  );

  const filteredManagePapers = managePapers.filter(p =>
    (p.title || '').toLowerCase().includes(searchManage.toLowerCase()) ||
    (p.subject || '').toLowerCase().includes(searchManage.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground pb-20 transition-colors duration-300">
      <div className="max-w-container mx-auto px-6 sm:px-8 lg:px-10 pt-10">
        
        {/* HEADER & METRICS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/15 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <LayoutDashboard className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground font-sans">
                Admin Dashboard
              </h1>
              <p className="text-sm text-light-muted dark:text-dark-muted mt-1 font-sans">
                Manage NoteShare platform notes, question papers &amp; users
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-5 py-3 rounded-2xl bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border flex items-center gap-3">
              <Users className="w-5 h-5 text-sky-400" />
              <div>
                <div className="text-xs text-light-muted dark:text-dark-muted font-medium">Registered Users</div>
                <div className="text-lg font-bold text-light-foreground dark:text-dark-foreground">{stats.usersCount}</div>
              </div>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs text-light-muted dark:text-dark-muted font-medium">Uploaded Notes</div>
                <div className="text-lg font-bold text-light-foreground dark:text-dark-foreground">{stats.notesCount}</div>
              </div>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs text-light-muted dark:text-dark-muted font-medium">Question Papers</div>
                <div className="text-lg font-bold text-light-foreground dark:text-dark-foreground">{stats.papersCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-3 mb-8 border-b border-light-border dark:border-dark-border pb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveTab('notes'); setMessage({ type: '', text: '' }); }}
            className={`h-[44px] px-6 text-sm font-bold rounded-btn transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notes'
                ? 'bg-primary text-primary-foreground'
                : 'bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground border border-light-border dark:border-dark-border'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Upload Notes</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('question-papers'); setMessage({ type: '', text: '' }); }}
            className={`h-[44px] px-6 text-sm font-bold rounded-btn transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'question-papers'
                ? 'bg-primary text-primary-foreground'
                : 'bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground border border-light-border dark:border-dark-border'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Upload Question Papers</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('users'); fetchUsersData(); }}
            className={`h-[44px] px-6 text-sm font-bold rounded-btn transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-primary text-primary-foreground'
                : 'bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground border border-light-border dark:border-dark-border'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registered Users ({stats.usersCount})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('manage'); setMessage({ type: '', text: '' }); fetchManageData(); }}
            className={`h-[44px] px-6 text-sm font-bold rounded-btn transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-primary text-primary-foreground'
                : 'bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground border border-light-border dark:border-dark-border'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Manage &amp; Delete Content</span>
          </button>
        </div>

        {/* TAB 1 & 2: UPLOAD FORM (Notes / Question Papers) */}
        {(activeTab === 'notes' || activeTab === 'question-papers') && (
          <div className="max-w-3xl bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-8 sm:p-10 shadow-xl">
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">
                {activeTab === 'notes' ? 'Upload New Study Note' : 'Upload Previous Year Question Paper'}
              </h2>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                Fill in metadata and attach PDF document (max 15MB).
              </p>
            </div>

            {/* Alert Banner */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 animate-fadeIn border ${
                message.type === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}>
                {message.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Upload Form */}
            <form onSubmit={(e) => handleUploadSubmit(e, activeTab === 'question-papers')} className="space-y-6">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder={activeTab === 'notes' ? 'e.g. Data Structures Unit 1 Complete Notes' : 'e.g. In-Sem Question Paper 2025'}
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full h-[50px] px-5 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Grid: Subject & Subject Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Subject Name
                  </label>
                  <input
                    name="subject"
                    type="text"
                    required
                    placeholder="e.g. Data Structures"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full h-[50px] px-5 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Subject Code
                  </label>
                  <input
                    name="subjectCode"
                    type="text"
                    required
                    placeholder="e.g. DS201"
                    value={formData.subjectCode}
                    onChange={handleInputChange}
                    className="w-full h-[50px] px-5 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm uppercase text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  Description / Overview (Optional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Brief summary of notes content..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Grid: Branch & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Branch
                  </label>
                  <CustomSelect
                    id="branch"
                    name="branch"
                    required
                    value={formData.branch}
                    onChange={handleInputChange}
                    options={BRANCH_OPTIONS}
                    placeholder="Select Branch"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Semester
                  </label>
                  <CustomSelect
                    id="semester"
                    name="semester"
                    required
                    value={formData.semester}
                    onChange={handleInputChange}
                    options={SEMESTER_OPTIONS}
                    placeholder="Select Semester"
                  />
                </div>
              </div>

              {/* Exam Type Selection Cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2 font-sans">
                  Exam Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, examType: 'insem' }))}
                    className={`h-[50px] px-5 rounded-field border text-sm font-bold transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer ${
                      formData.examType === 'insem'
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-light-surface-secondary dark:bg-dark-surface-secondary border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-primary/40 hover:text-light-foreground dark:hover:text-dark-foreground'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      formData.examType === 'insem' ? 'border-primary bg-primary' : 'border-light-border dark:border-dark-border'
                    }`}>
                      {formData.examType === 'insem' && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                    </div>
                    <span>In-Sem (Mid Semester)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, examType: 'endsem' }))}
                    className={`h-[50px] px-5 rounded-field border text-sm font-bold transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer ${
                      formData.examType === 'endsem'
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-light-surface-secondary dark:bg-dark-surface-secondary border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-primary/40 hover:text-light-foreground dark:hover:text-dark-foreground'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                      formData.examType === 'endsem' ? 'border-primary bg-primary' : 'border-light-border dark:border-dark-border'
                    }`}>
                      {formData.examType === 'endsem' && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                    </div>
                    <span>End-Sem (Final Semester)</span>
                  </button>
                </div>
              </div>

              {/* PDF File Drag and Drop Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  PDF Document Attachment
                </label>
                <div className="relative border-2 border-dashed border-light-border dark:border-dark-border hover:border-primary rounded-field p-6 text-center bg-light-surface-secondary/50 dark:bg-dark-surface-secondary/50 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <FileUp className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    {selectedFile ? (
                      <div>
                        <p className="text-sm font-bold text-primary">{selectedFile.name}</p>
                        <p className="text-xs text-light-muted dark:text-dark-muted">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-light-foreground dark:text-dark-foreground">
                          Click or drag PDF file here
                        </p>
                        <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                          Maximum file size 15 MB (PDF format strictly)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full h-[50px] text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading PDF to Cloud...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 stroke-[2.5]" />
                    <span>Publish {activeTab === 'notes' ? 'Note' : 'Question Paper'}</span>
                  </>
                )}
              </button>

            </form>

          </div>
        )}

        {/* TAB 3: REGISTERED USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* Search Filter Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-muted dark:text-dark-muted">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search registered users by name, email, or branch..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full h-[46px] pl-10 pr-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <button
                type="button"
                onClick={fetchUsersData}
                className="h-[46px] px-5 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-sm font-bold rounded-btn transition-all hover:bg-light-surface-tertiary dark:hover:bg-dark-surface-tertiary shrink-0"
              >
                Refresh Users List
              </button>
            </div>

            {/* Users Table / List Container */}
            <div className="bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
                <div className="flex items-center gap-2 text-lg font-bold text-light-foreground dark:text-dark-foreground font-sans">
                  <UserCheck className="w-5 h-5 text-sky-400" />
                  <span>Registered Users ({filteredUsers.length})</span>
                </div>
              </div>

              {usersLoading ? (
                <div className="py-12 text-center text-light-muted dark:text-dark-muted">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-light-muted dark:text-dark-muted py-6 text-center">
                  No registered users found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-light-border dark:border-dark-border text-xs uppercase font-extrabold tracking-wider text-light-muted dark:text-dark-muted">
                        <th className="py-3 px-4">User Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Branch</th>
                        <th className="py-3 px-4">Semester</th>
                        <th className="py-3 px-4">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-border dark:divide-dark-border">
                      {filteredUsers.map((u) => {
                        const userId = u._id || u.id;
                        return (
                          <tr key={userId} className="hover:bg-light-surface-secondary/50 dark:hover:bg-dark-surface-secondary/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-light-foreground dark:text-dark-foreground">
                              {u.name}
                            </td>
                            <td className="py-3.5 px-4 text-light-muted dark:text-dark-muted">
                              {u.email}
                            </td>
                            <td className="py-3.5 px-4 text-light-foreground dark:text-dark-foreground font-medium">
                              {u.branch || 'N/A'}
                            </td>
                            <td className="py-3.5 px-4 text-light-muted dark:text-dark-muted">
                              Sem {u.semester || 'N/A'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                u.role === 'admin' 
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                  : 'bg-primary/10 text-primary border border-primary/20'
                              }`}>
                                {u.role === 'admin' ? '👑 Admin' : 'Student'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: MANAGE & DELETE CONTENT */}
        {activeTab === 'manage' && (
          <div className="space-y-8">
            
            {/* Search Filter Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-muted dark:text-dark-muted">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Filter uploaded items by title or subject..."
                  value={searchManage}
                  onChange={(e) => setSearchManage(e.target.value)}
                  className="w-full h-[46px] pl-10 pr-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <button
                type="button"
                onClick={fetchManageData}
                className="h-[46px] px-5 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-sm font-bold rounded-btn transition-all hover:bg-light-surface-tertiary dark:hover:bg-dark-surface-tertiary shrink-0"
              >
                Refresh List
              </button>
            </div>

            {/* Section 1: Manage Notes */}
            <div className="bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
                <div className="flex items-center gap-2 text-lg font-bold text-light-foreground dark:text-dark-foreground font-sans">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Uploaded Study Notes ({filteredManageNotes.length})</span>
                </div>
              </div>

              {manageLoading ? (
                <div className="py-12 text-center text-light-muted dark:text-dark-muted">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                </div>
              ) : filteredManageNotes.length === 0 ? (
                <p className="text-sm text-light-muted dark:text-dark-muted py-6 text-center">
                  No notes uploaded yet.
                </p>
              ) : (
                <div className="divide-y divide-light-border dark:divide-dark-border">
                  {filteredManageNotes.map((note) => {
                    const noteId = note._id || note.id;
                    return (
                      <div key={noteId} className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold text-light-foreground dark:text-dark-foreground">
                            {note.title}
                          </div>
                          <div className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                            <span className="font-bold text-primary">{note.subjectCode || note.subject}</span> • {note.branch} • Semester {note.semester}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(noteId)}
                          disabled={deleteLoadingId === noteId}
                          title="Delete Note"
                          className="h-9 px-3.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 shrink-0"
                        >
                          {deleteLoadingId === noteId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Manage Question Papers */}
            <div className="bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
                <div className="flex items-center gap-2 text-lg font-bold text-light-foreground dark:text-dark-foreground font-sans">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  <span>Uploaded Question Papers ({filteredManagePapers.length})</span>
                </div>
              </div>

              {manageLoading ? (
                <div className="py-12 text-center text-light-muted dark:text-dark-muted">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                </div>
              ) : filteredManagePapers.length === 0 ? (
                <p className="text-sm text-light-muted dark:text-dark-muted py-6 text-center">
                  No question papers uploaded yet.
                </p>
              ) : (
                <div className="divide-y divide-light-border dark:divide-dark-border">
                  {filteredManagePapers.map((paper) => {
                    const paperId = paper._id || paper.id;
                    return (
                      <div key={paperId} className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold text-light-foreground dark:text-dark-foreground">
                            {paper.title}
                          </div>
                          <div className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                            <span className="font-bold text-emerald-400">{paper.subjectCode || paper.subject}</span> • {paper.branch} • Semester {paper.semester}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeletePaper(paperId)}
                          disabled={deleteLoadingId === paperId}
                          title="Delete Question Paper"
                          className="h-9 px-3.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 shrink-0"
                        >
                          {deleteLoadingId === paperId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
