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
  Files,
  X,
  Download,
  Pencil,
  Check,
  CheckSquare,
  Square
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

// Safe JSON parser to prevent HTML <!DOCTYPE> SyntaxError crashes
const parseJsonResponse = async (res) => {
  const contentType = res.headers ? res.headers.get('content-type') : null;
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Server returned status ${res.status}. Please try again.`);
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'question-papers' | 'users' | 'manage'

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
  const [downloadLoadingId, setDownloadLoadingId] = useState(null);
  const [searchManage, setSearchManage] = useState('');

  // Multi-Select Bulk Delete State
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Edit Details Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // item object being edited
  const [isEditingPaper, setIsEditingPaper] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    subject: '',
    subjectCode: '',
    description: '',
    branch: '',
    semester: '',
    examType: 'insem',
  });
  const [editLoading, setEditLoading] = useState(false);

  // Single Notes Upload Form State
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

  // Bulk Question Papers Upload State
  const [selectedBulkFiles, setSelectedBulkFiles] = useState([]);
  const [bulkProgress, setBulkProgress] = useState({
    current: 0,
    total: 0,
    uploading: false,
    results: [],
  });

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
      const data = await parseJsonResponse(res);
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
      const notesRes = await fetch('/api/notes/view-notes?limit=100', { headers, credentials: 'include' });
      const notesData = await parseJsonResponse(notesRes);
      const notesList = notesData.notes || [];

      // Fetch Question Papers
      const papersRes = await fetch('/api/question-papers/view-question-papers?limit=100', { headers, credentials: 'include' });
      const papersData = await parseJsonResponse(papersRes);
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

  // Bulk Question Papers File Selection Handler
  const handleBulkFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validPdfs = files.filter(file => {
      if (file.type !== 'application/pdf') return false;
      if (file.size > 15 * 1024 * 1024) return false;
      return true;
    });

    if (validPdfs.length < files.length) {
      setMessage({
        type: 'error',
        text: `${files.length - validPdfs.length} file(s) skipped because they were not valid PDFs or exceeded 15MB.`,
      });
    } else {
      if (message.text) setMessage({ type: '', text: '' });
    }

    setSelectedBulkFiles(prev => [...prev, ...validPdfs]);
  };

  const removeBulkFile = (index) => {
    setSelectedBulkFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Single Upload Handler for Notes
  const handleNotesUploadSubmit = async (e) => {
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

      const authHeaders = { 'Content-Type': 'application/json' };
      if (token) authHeaders['Authorization'] = `Bearer ${token}`;

      // 1. Get Presigned Upload URL
      const uploadUrlRes = await fetch('/api/notes/upload-url', {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      const uploadUrlData = await parseJsonResponse(uploadUrlRes);
      if (!uploadUrlRes.ok || !uploadUrlData.uploadUrl) {
        throw new Error(uploadUrlData.message || 'Failed to generate upload URL.');
      }

      // 2. Upload File directly to Cloudflare R2 bucket
      const r2Res = await fetch(uploadUrlData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      });

      if (!r2Res.ok) {
        throw new Error('Cloud storage upload failed.');
      }

      // 3. Save Document Metadata in DB
      const createRes = await fetch('/api/notes/create-note', {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({
          title,
          subject,
          subjectCode,
          description: description || `Uploaded Note for ${subject}`,
          branch,
          year: yearStr,
          semester: semNum,
          pdfKey: uploadUrlData.key,
          examType,
        }),
      });

      const createData = await parseJsonResponse(createRes);
      if (!createRes.ok) {
        throw new Error(createData.message || 'Failed to save note metadata.');
      }

      setMessage({
        type: 'success',
        text: 'Successfully uploaded Note to Cloudflare R2 & Database!',
      });

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
      fetchManageData();

    } catch (err) {
      console.error('Upload Error:', err);
      setMessage({ type: 'error', text: err.message || 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  // Bulk Upload Handler for Question Papers
  const handleQuestionPapersBulkUploadSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const { subject, subjectCode, description, branch, semester, examType } = formData;

    if (!subject || !subjectCode || !branch || !semester || !selectedBulkFiles.length) {
      setMessage({
        type: 'error',
        text: 'Please select branch, semester, subject, exam type, and add at least one PDF file.',
      });
      return;
    }

    const semNum = Number(semester);
    const yearStr = getYearFromSem(semNum);
    const token = localStorage.getItem('token');

    const authHeaders = { 'Content-Type': 'application/json' };
    if (token) authHeaders['Authorization'] = `Bearer ${token}`;

    setBulkProgress({
      current: 0,
      total: selectedBulkFiles.length,
      uploading: true,
      results: selectedBulkFiles.map(f => ({ name: f.name, status: 'pending' })),
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedBulkFiles.length; i++) {
      const file = selectedBulkFiles[i];

      setBulkProgress(prev => ({
        ...prev,
        current: i + 1,
        results: prev.results.map((r, idx) => idx === i ? { ...r, status: 'uploading' } : r),
      }));

      try {
        const uploadUrlRes = await fetch('/api/question-papers/upload-url', {
          method: 'POST',
          headers: authHeaders,
          credentials: 'include',
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        const uploadUrlData = await parseJsonResponse(uploadUrlRes);
        if (!uploadUrlRes.ok || !uploadUrlData.uploadUrl) {
          throw new Error(uploadUrlData.message || 'Failed to generate upload URL.');
        }

        const r2Res = await fetch(uploadUrlData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!r2Res.ok) {
          throw new Error('R2 cloud storage upload failed.');
        }

        const paperTitle = file.name.replace(/\.[^/.]+$/, '').trim() || `${subject} Question Paper`;

        const createRes = await fetch('/api/question-papers/create-question-paper', {
          method: 'POST',
          headers: authHeaders,
          credentials: 'include',
          body: JSON.stringify({
            title: paperTitle,
            subject,
            subjectCode,
            description: description || `Uploaded question paper for ${subject} (${subjectCode}).`,
            branch,
            year: yearStr,
            semester: semNum,
            pdfKey: uploadUrlData.key,
            examType,
          }),
        });

        const createData = await parseJsonResponse(createRes);
        if (!createRes.ok) {
          throw new Error(createData.message || 'Failed to save question paper metadata.');
        }

        successCount++;
        setBulkProgress(prev => ({
          ...prev,
          results: prev.results.map((r, idx) => idx === i ? { ...r, status: 'success' } : r),
        }));
      } catch (err) {
        console.error(`Bulk upload error for file ${file.name}:`, err);
        failCount++;
        setBulkProgress(prev => ({
          ...prev,
          results: prev.results.map((r, idx) => idx === i ? { ...r, status: 'error', error: err.message } : r),
        }));
      }
    }

    setBulkProgress(prev => ({ ...prev, uploading: false }));
    setSelectedBulkFiles([]);
    fetchManageData();

    if (failCount === 0) {
      setMessage({
        type: 'success',
        text: `Successfully uploaded ${successCount} question paper(s) to Cloudflare R2 & Database!`,
      });
    } else {
      setMessage({
        type: 'error',
        text: `Bulk upload finished: ${successCount} succeeded, ${failCount} failed. Check details below.`,
      });
    }
  };

  // Download PDF Handler for Dashboard
  const handleDownload = async (id, isQuestionPaper = false, title = 'Document') => {
    setDownloadLoadingId(id);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const endpoint = isQuestionPaper
        ? `/api/question-papers/${id}/view`
        : `/api/notes/${id}/view`;

      const res = await fetch(endpoint, { headers, credentials: 'include' });
      const data = await parseJsonResponse(res);

      if (!res.ok || !data.pdfUrl) {
        throw new Error(data.message || 'Failed to fetch PDF download link.');
      }

      const safeTitle = (title || 'document').replace(/[^a-zA-Z0-9_\-\s]/g, '_').trim();
      const fileName = `${safeTitle}.pdf`;

      try {
        const fileRes = await fetch(data.pdfUrl);
        if (!fileRes.ok) throw new Error('Could not fetch file content from Cloudflare R2.');

        const blob = await fileRes.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
      } catch (blobErr) {
        console.warn('Blob fetch failed, falling back to direct window open:', blobErr);
        window.open(data.pdfUrl, '_blank');
      }

      setMessage({ type: 'success', text: `Downloading ${fileName}...` });
    } catch (err) {
      console.error('Download Error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to download document.' });
    } finally {
      setDownloadLoadingId(null);
    }
  };

  // Single Delete Item Handler
  const handleDelete = async (id, isQuestionPaper = false) => {
    if (!window.confirm(`Are you sure you want to delete this ${isQuestionPaper ? 'question paper' : 'note'}? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoadingId(id);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const endpoint = isQuestionPaper 
        ? `/api/question-papers/${id}` 
        : `/api/notes/${id}`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete item.');
      }

      setMessage({ type: 'success', text: 'Deleted successfully.' });
      fetchManageData();

    } catch (err) {
      console.error('Delete Error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to delete item.' });
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // --- MULTI-SELECT & BULK DELETE HANDLERS ---
  const toggleSelectNote = (id) => {
    setSelectedNoteIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllNotes = (filteredNotes) => {
    const allFilteredIds = filteredNotes.map(n => n._id);
    const allSelected = allFilteredIds.every(id => selectedNoteIds.includes(id));

    if (allSelected) {
      setSelectedNoteIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedNoteIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleBulkDeleteNotes = async () => {
    if (!selectedNoteIds.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedNoteIds.length} selected note(s)? This will delete their PDF files and database records permanently.`)) {
      return;
    }

    setBulkDeleting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}) 
      };

      const res = await fetch('/api/notes/bulk-delete', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ ids: selectedNoteIds }),
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.message || 'Bulk delete failed.');

      setMessage({ type: 'success', text: `Successfully deleted ${selectedNoteIds.length} note(s)!` });
      setSelectedNoteIds([]);
      fetchManageData();
    } catch (err) {
      console.error('Bulk Delete Notes Error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to delete selected notes.' });
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectPaper = (id) => {
    setSelectedPaperIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPapers = (filteredPapers) => {
    const allFilteredIds = filteredPapers.map(p => p._id);
    const allSelected = allFilteredIds.every(id => selectedPaperIds.includes(id));

    if (allSelected) {
      setSelectedPaperIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedPaperIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleBulkDeletePapers = async () => {
    if (!selectedPaperIds.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedPaperIds.length} selected question paper(s)?`)) {
      return;
    }

    setBulkDeleting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}) 
      };

      const res = await fetch('/api/question-papers/bulk-delete', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ ids: selectedPaperIds }),
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.message || 'Bulk delete failed.');

      setMessage({ type: 'success', text: `Successfully deleted ${selectedPaperIds.length} question paper(s)!` });
      setSelectedPaperIds([]);
      fetchManageData();
    } catch (err) {
      console.error('Bulk Delete Papers Error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to delete selected question papers.' });
    } finally {
      setBulkDeleting(false);
    }
  };

  // --- EDIT DETAILS MODAL HANDLERS ---
  const handleOpenEditModal = (item, isPaper = false) => {
    setEditingItem(item);
    setIsEditingPaper(isPaper);
    setEditFormData({
      title: item.title || '',
      subject: item.subject || '',
      subjectCode: item.subjectCode || '',
      description: item.description || '',
      branch: item.branch || '',
      semester: item.semester ? String(item.semester) : '',
      examType: item.examType || 'insem',
    });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    setEditFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setEditLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}) 
      };

      const semNum = Number(editFormData.semester);
      const yearStr = getYearFromSem(semNum);

      const endpoint = isEditingPaper
        ? `/api/question-papers/${editingItem._id}`
        : `/api/notes/${editingItem._id}`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          title: editFormData.title,
          subject: editFormData.subject,
          subjectCode: editFormData.subjectCode,
          description: editFormData.description,
          branch: editFormData.branch,
          year: yearStr,
          semester: semNum,
          examType: editFormData.examType,
        }),
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.message || 'Failed to update details.');

      setMessage({
        type: 'success',
        text: `Successfully updated details for "${editFormData.title}"!`,
      });

      setIsEditModalOpen(false);
      setEditingItem(null);
      fetchManageData();

    } catch (err) {
      console.error('Update Error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update item details.' });
    } finally {
      setEditLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground">
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-10 max-w-md text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            You must have Admin privileges to access the Notes &amp; Question Papers Upload Portal.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full h-[46px] bg-primary text-primary-foreground font-bold rounded-btn transition-transform active:scale-95 shadow-md mt-4"
          >
            Return to Home
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
    (n.subject || '').toLowerCase().includes(searchManage.toLowerCase()) ||
    (n.subjectCode || '').toLowerCase().includes(searchManage.toLowerCase())
  );

  const filteredManagePapers = managePapers.filter(p =>
    (p.title || '').toLowerCase().includes(searchManage.toLowerCase()) ||
    (p.subject || '').toLowerCase().includes(searchManage.toLowerCase()) ||
    (p.subjectCode || '').toLowerCase().includes(searchManage.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 pt-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                Admin Control Center
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground font-sans mt-2">
              Management Dashboard
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted mt-1 font-sans">
              Upload study notes, question papers in bulk, edit details, and perform bulk operations
            </p>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">Total Notes</p>
              <h3 className="text-2xl font-extrabold text-light-foreground dark:text-dark-foreground mt-0.5">
                {stats.notesCount}
              </h3>
            </div>
          </div>

          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">Question Papers</p>
              <h3 className="text-2xl font-extrabold text-light-foreground dark:text-dark-foreground mt-0.5">
                {stats.papersCount}
              </h3>
            </div>
          </div>

          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">Registered Users</p>
              <h3 className="text-2xl font-extrabold text-light-foreground dark:text-dark-foreground mt-0.5">
                {stats.usersCount}
              </h3>
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
            <span>Manage Content</span>
          </button>
        </div>

        {/* TAB 1: UPLOAD NOTES FORM */}
        {activeTab === 'notes' && (
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-8 sm:p-10 shadow-xl max-w-4xl">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">
                  Upload Study Note
                </h2>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                  Direct presigned R2 upload for academic PDF files
                </p>
              </div>
            </div>

            {/* Alert Message */}
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

            <form onSubmit={handleNotesUploadSubmit} className="space-y-6">
              
              {/* Title & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Chapter 1 Operating Systems"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full h-[50px] px-5 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="e.g. Operating Systems"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full h-[50px] px-5 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Subject Code & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    required
                    placeholder="e.g. OS101"
                    value={formData.subjectCode}
                    onChange={handleInputChange}
                    className="w-full h-[50px] px-5 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Engineering Branch
                  </label>
                  <CustomSelect
                    id="single-branch"
                    name="branch"
                    required
                    value={formData.branch}
                    onChange={handleInputChange}
                    options={BRANCH_OPTIONS}
                    placeholder="Select Branch"
                  />
                </div>
              </div>

              {/* Semester & Exam Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Semester
                  </label>
                  <CustomSelect
                    id="single-semester"
                    name="semester"
                    required
                    value={formData.semester}
                    onChange={handleInputChange}
                    options={SEMESTER_OPTIONS}
                    placeholder="Select Semester"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Exam Type
                  </label>
                  <div className="flex items-center gap-4 h-[50px]">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                      <input
                        type="radio"
                        name="examType"
                        value="insem"
                        checked={formData.examType === 'insem'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span>In-Sem Exam</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                      <input
                        type="radio"
                        name="examType"
                        value="endsem"
                        checked={formData.examType === 'endsem'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span>End-Sem Exam</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Provide brief details about this note..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* PDF File Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  PDF Document File
                </label>
                <div className="relative border-2 border-dashed border-light-border dark:border-dark-border hover:border-primary rounded-2xl p-6 text-center transition-colors bg-light-surface-secondary/50 dark:bg-dark-surface-secondary/50 group">
                  <input
                    type="file"
                    accept="application/pdf"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <FileUp className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    {selectedFile ? (
                      <p className="text-sm font-bold text-primary">
                        {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-light-foreground dark:text-dark-foreground">
                          Click or drag PDF note file here
                        </p>
                        <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                          Maximum file size 15 MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full h-[50px] text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-md"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading Note...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 stroke-[2.5]" />
                    <span>Upload Study Note</span>
                  </>
                )}
              </button>

            </form>
          </div>
        )}

        {/* TAB 2: BULK UPLOAD QUESTION PAPERS FORM */}
        {activeTab === 'question-papers' && (
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-8 sm:p-10 shadow-xl max-w-4xl">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">
                  Bulk Upload Question Papers
                </h2>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                  Select multiple PDF files at once to upload entire subject sets in parallel
                </p>
              </div>
            </div>

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

            <form onSubmit={handleQuestionPapersBulkUploadSubmit} className="space-y-6">
              
              {/* Branch & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Engineering Branch
                  </label>
                  <CustomSelect
                    id="bulk-branch"
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
                    id="bulk-semester"
                    name="semester"
                    required
                    value={formData.semester}
                    onChange={handleInputChange}
                    options={SEMESTER_OPTIONS}
                    placeholder="Select Semester"
                  />
                </div>
              </div>

              {/* Subject Code & Subject Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="e.g. Data Structures & Algorithms"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full h-[50px] px-5 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    required
                    placeholder="e.g. DSA201"
                    value={formData.subjectCode}
                    onChange={handleInputChange}
                    className="w-full h-[50px] px-5 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Exam Type Radio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  Exam Type
                </label>
                <div className="flex items-center gap-6 h-[50px] bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border px-5 rounded-field">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      type="radio"
                      name="examType"
                      value="insem"
                      checked={formData.examType === 'insem'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span>In-Sem Question Papers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      type="radio"
                      name="examType"
                      value="endsem"
                      checked={formData.examType === 'endsem'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span>End-Sem Question Papers</span>
                  </label>
                </div>
              </div>

              {/* Bulk File Selection Area */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  Select Multiple PDF Question Papers
                </label>
                <div className="relative border-2 border-dashed border-light-border dark:border-dark-border hover:border-primary rounded-2xl p-6 text-center transition-colors bg-light-surface-secondary/50 dark:bg-dark-surface-secondary/50 group">
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleBulkFilesChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <FileUp className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-sm font-bold text-light-foreground dark:text-dark-foreground">
                        Click or drag multiple Question Paper PDFs here
                      </p>
                      <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                        Select multiple PDF files at once (Maximum file size 15 MB per file)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Files Queue List */}
              {selectedBulkFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-light-muted dark:text-dark-muted">
                    <span>Selected PDF Queue ({selectedBulkFiles.length} papers)</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBulkFiles([])}
                      className="text-red-400 hover:underline text-[11px]"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-light-border dark:border-dark-border rounded-xl divide-y divide-light-border dark:divide-dark-border bg-light-surface-secondary/40 dark:bg-dark-surface-secondary/40">
                    {selectedBulkFiles.map((file, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-bold truncate text-light-foreground dark:text-dark-foreground">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-light-muted dark:text-dark-muted shrink-0">
                            ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeBulkFile(idx)}
                          className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-light-muted dark:text-dark-muted hover:text-red-400 flex items-center justify-center transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Realtime Upload Progress Status Bar */}
              {bulkProgress.uploading && (
                <div className="p-5 rounded-2xl bg-dark-surface-secondary border border-dark-border space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Batch Upload Progress</span>
                    <span className="text-primary font-extrabold">
                      {bulkProgress.current} / {bulkProgress.total} Papers ({Math.round((bulkProgress.current / bulkProgress.total) * 100)}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-dark-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto text-[11px] space-y-1 text-gray-300 font-mono pt-1">
                    {bulkProgress.results.map((res, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="truncate max-w-md">{res.name}</span>
                        {res.status === 'uploading' && <span className="text-amber-400 font-bold">Uploading...</span>}
                        {res.status === 'success' && <span className="text-emerald-400 font-bold">Uploaded</span>}
                        {res.status === 'error' && <span className="text-red-400 font-bold">Failed</span>}
                        {res.status === 'pending' && <span className="text-gray-500">Pending</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bulk Submit Button */}
              <button
                type="submit"
                disabled={bulkProgress.uploading || selectedBulkFiles.length === 0}
                className="w-full h-[50px] text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {bulkProgress.uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading Batch ({bulkProgress.current}/{bulkProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 stroke-[2.5]" />
                    <span>Upload {selectedBulkFiles.length} Question Paper(s)</span>
                  </>
                )}
              </button>

            </form>

          </div>
        )}

        {/* TAB 3: REGISTERED USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-8 shadow-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">
                  Registered Users Directory
                </h2>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                  Total {registeredUsers.length} user accounts registered on NoteShare
                </p>
              </div>

              {/* Search User Input */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-light-muted dark:text-dark-muted">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full h-[40px] pl-9 pr-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {usersLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-bold text-light-muted dark:text-dark-muted">Loading user accounts...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-sm text-light-muted dark:text-dark-muted">
                No registered users found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto border border-light-border dark:border-dark-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted uppercase font-extrabold border-b border-light-border dark:border-dark-border">
                    <tr>
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Branch</th>
                      <th className="px-5 py-3.5">Semester &amp; Year</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-border dark:divide-dark-border">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-light-surface-secondary/50 dark:hover:bg-dark-surface-secondary/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-light-foreground dark:text-dark-foreground">
                          {u.name}
                        </td>
                        <td className="px-5 py-4 text-light-muted dark:text-dark-muted font-mono">
                          {u.email}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {u.branch || 'N/A'}
                        </td>
                        <td className="px-5 py-4">
                          Sem {u.semester || 1} - <span className="text-primary font-bold">{u.year || getYearFromSem(u.semester)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === 'admin' 
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                              : 'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-light-muted dark:text-dark-muted">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recently'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: MANAGE CONTENT TAB (WITH EDIT & BULK MULTI-SELECT DELETE) */}
        {activeTab === 'manage' && (
          <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-8 shadow-xl space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">
                  Manage Content &amp; Edit Details
                </h2>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                  Select multiple items to delete in bulk, or click the pencil icon to edit title, subject, or branch details
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-light-muted dark:text-dark-muted">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search title or subject..."
                  value={searchManage}
                  onChange={(e) => setSearchManage(e.target.value)}
                  className="w-full h-[40px] pl-9 pr-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Alert Message */}
            {message.text && (
              <div className={`p-4 rounded-xl text-sm flex items-start gap-3 animate-fadeIn border ${
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

            {manageLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-bold text-light-muted dark:text-dark-muted">Loading content items...</p>
              </div>
            ) : (
              <div className="space-y-10">
                
                {/* --- SECTION 1: UPLOADED NOTES --- */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span>Uploaded Notes ({filteredManageNotes.length})</span>
                    </h3>

                    {/* Bulk Delete Floating Action Bar for Notes */}
                    {selectedNoteIds.length > 0 && (
                      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl animate-fadeIn">
                        <span className="text-xs font-bold text-red-400">
                          {selectedNoteIds.length} Note(s) Selected
                        </span>
                        <button
                          type="button"
                          onClick={handleBulkDeleteNotes}
                          disabled={bulkDeleting}
                          className="h-8 px-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          {bulkDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete Selected ({selectedNoteIds.length})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {filteredManageNotes.length === 0 ? (
                    <div className="p-6 text-center text-xs text-light-muted dark:text-dark-muted border border-dashed border-light-border dark:border-dark-border rounded-xl">
                      No study notes found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-light-border dark:border-dark-border rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted uppercase font-extrabold border-b border-light-border dark:border-dark-border">
                          <tr>
                            <th className="px-4 py-3 text-center w-10">
                              <input
                                type="checkbox"
                                checked={filteredManageNotes.length > 0 && filteredManageNotes.every(n => selectedNoteIds.includes(n._id))}
                                onChange={() => handleSelectAllNotes(filteredManageNotes)}
                                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                                title="Select All Notes"
                              />
                            </th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Branch &amp; Sem</th>
                            <th className="px-4 py-3">Exam Type</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                          {filteredManageNotes.map((note) => {
                            const isSelected = selectedNoteIds.includes(note._id);
                            return (
                              <tr 
                                key={note._id} 
                                className={`transition-colors ${
                                  isSelected 
                                    ? 'bg-primary/10 dark:bg-primary/10' 
                                    : 'hover:bg-light-surface-secondary/50 dark:hover:bg-dark-surface-secondary/50'
                                }`}
                              >
                                <td className="px-4 py-3.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectNote(note._id)}
                                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                                  />
                                </td>
                                <td className="px-4 py-3.5 font-bold text-light-foreground dark:text-dark-foreground max-w-xs truncate">
                                  {note.title}
                                </td>
                                <td className="px-4 py-3.5">
                                  {note.subject} ({note.subjectCode})
                                </td>
                                <td className="px-4 py-3.5">
                                  {note.branch} - Sem {note.semester}
                                </td>
                                <td className="px-4 py-3.5 font-semibold text-primary">
                                  {note.examType === 'insem' ? 'In-Sem' : 'End-Sem'}
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {/* Edit Details Pencil Button */}
                                    <button
                                      type="button"
                                      title="Edit Note Details"
                                      onClick={() => handleOpenEditModal(note, false)}
                                      className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 flex items-center justify-center transition-all active:scale-95 shrink-0"
                                    >
                                      <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
                                    </button>

                                    {/* Download Icon Button */}
                                    <button
                                      type="button"
                                      title="Download PDF"
                                      onClick={() => handleDownload(note._id, false, note.title)}
                                      disabled={downloadLoadingId === note._id}
                                      className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shrink-0"
                                    >
                                      {downloadLoadingId === note._id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Download className="w-4 h-4 stroke-[2]" />
                                      )}
                                    </button>

                                    {/* Single Delete Icon Button */}
                                    <button
                                      type="button"
                                      title="Delete Note"
                                      onClick={() => handleDelete(note._id, false)}
                                      disabled={deleteLoadingId === note._id}
                                      className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shrink-0"
                                    >
                                      {deleteLoadingId === note._id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4 stroke-[2]" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* --- SECTION 2: UPLOADED QUESTION PAPERS --- */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-light-foreground dark:text-dark-foreground flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                      <span>Uploaded Question Papers ({filteredManagePapers.length})</span>
                    </h3>

                    {/* Bulk Delete Floating Action Bar for Papers */}
                    {selectedPaperIds.length > 0 && (
                      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl animate-fadeIn">
                        <span className="text-xs font-bold text-red-400">
                          {selectedPaperIds.length} Paper(s) Selected
                        </span>
                        <button
                          type="button"
                          onClick={handleBulkDeletePapers}
                          disabled={bulkDeleting}
                          className="h-8 px-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        >
                          {bulkDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete Selected ({selectedPaperIds.length})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {filteredManagePapers.length === 0 ? (
                    <div className="p-6 text-center text-xs text-light-muted dark:text-dark-muted border border-dashed border-light-border dark:border-dark-border rounded-xl">
                      No question papers found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-light-border dark:border-dark-border rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted uppercase font-extrabold border-b border-light-border dark:border-dark-border">
                          <tr>
                            <th className="px-4 py-3 text-center w-10">
                              <input
                                type="checkbox"
                                checked={filteredManagePapers.length > 0 && filteredManagePapers.every(p => selectedPaperIds.includes(p._id))}
                                onChange={() => handleSelectAllPapers(filteredManagePapers)}
                                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                                title="Select All Question Papers"
                              />
                            </th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Branch &amp; Sem</th>
                            <th className="px-4 py-3">Exam Type</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                          {filteredManagePapers.map((paper) => {
                            const isSelected = selectedPaperIds.includes(paper._id);
                            return (
                              <tr 
                                key={paper._id} 
                                className={`transition-colors ${
                                  isSelected 
                                    ? 'bg-primary/10 dark:bg-primary/10' 
                                    : 'hover:bg-light-surface-secondary/50 dark:hover:bg-dark-surface-secondary/50'
                                }`}
                              >
                                <td className="px-4 py-3.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectPaper(paper._id)}
                                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                                  />
                                </td>
                                <td className="px-4 py-3.5 font-bold text-light-foreground dark:text-dark-foreground max-w-xs truncate">
                                  {paper.title}
                                </td>
                                <td className="px-4 py-3.5">
                                  {paper.subject} ({paper.subjectCode})
                                </td>
                                <td className="px-4 py-3.5">
                                  {paper.branch} - Sem {paper.semester}
                                </td>
                                <td className="px-4 py-3.5 font-semibold text-emerald-400">
                                  {paper.examType === 'insem' ? 'In-Sem' : 'End-Sem'}
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {/* Edit Details Pencil Button */}
                                    <button
                                      type="button"
                                      title="Edit Question Paper Details"
                                      onClick={() => handleOpenEditModal(paper, true)}
                                      className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 flex items-center justify-center transition-all active:scale-95 shrink-0"
                                    >
                                      <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
                                    </button>

                                    {/* Download Icon Button */}
                                    <button
                                      type="button"
                                      title="Download Question Paper"
                                      onClick={() => handleDownload(paper._id, true, paper.title)}
                                      disabled={downloadLoadingId === paper._id}
                                      className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shrink-0"
                                    >
                                      {downloadLoadingId === paper._id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Download className="w-4 h-4 stroke-[2]" />
                                      )}
                                    </button>

                                    {/* Single Delete Icon Button */}
                                    <button
                                      type="button"
                                      title="Delete Question Paper"
                                      onClick={() => handleDelete(paper._id, true)}
                                      disabled={deleteLoadingId === paper._id}
                                      className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shrink-0"
                                    >
                                      {deleteLoadingId === paper._id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4 stroke-[2]" />
                                      )}
                                    </button>
                                  </div>
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

          </div>
        )}

      </div>

      {/* --- EDIT DETAILS OVERLAY MODAL --- */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 mb-6 border-b border-light-border dark:border-dark-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-light-foreground dark:text-dark-foreground">
                    Edit {isEditingPaper ? 'Question Paper' : 'Study Note'} Details
                  </h3>
                  <p className="text-xs text-light-muted dark:text-dark-muted truncate max-w-xs sm:max-w-sm">
                    {editingItem.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditSubmit} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  className="w-full h-[46px] px-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Subject & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-1.5">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={editFormData.subject}
                    onChange={handleEditInputChange}
                    className="w-full h-[46px] px-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-1.5">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    required
                    value={editFormData.subjectCode}
                    onChange={handleEditInputChange}
                    className="w-full h-[46px] px-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Branch & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-1.5">
                    Engineering Branch
                  </label>
                  <CustomSelect
                    id="edit-branch"
                    name="branch"
                    required
                    value={editFormData.branch}
                    onChange={handleEditInputChange}
                    options={BRANCH_OPTIONS}
                    placeholder="Select Branch"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-1.5">
                    Semester
                  </label>
                  <CustomSelect
                    id="edit-semester"
                    name="semester"
                    required
                    value={editFormData.semester}
                    onChange={handleEditInputChange}
                    options={SEMESTER_OPTIONS}
                    placeholder="Select Semester"
                  />
                </div>
              </div>

              {/* Exam Type Radio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-1.5">
                  Exam Type
                </label>
                <div className="flex items-center gap-6 h-[46px] bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border px-4 rounded-field">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="radio"
                      name="examType"
                      value="insem"
                      checked={editFormData.examType === 'insem'}
                      onChange={handleEditInputChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span>In-Sem Exam</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="radio"
                      name="examType"
                      value="endsem"
                      checked={editFormData.examType === 'endsem'}
                      onChange={handleEditInputChange}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span>End-Sem Exam</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  className="w-full p-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-light-border dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-10 px-5 bg-light-surface-secondary dark:bg-dark-surface-secondary text-light-foreground dark:text-dark-foreground border border-light-border dark:border-dark-border font-bold text-xs rounded-xl hover:bg-light-border dark:hover:bg-dark-border transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editLoading}
                  className="h-10 px-6 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
