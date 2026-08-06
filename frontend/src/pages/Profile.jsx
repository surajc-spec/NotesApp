import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  ArrowRight
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

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [branch, setBranch] = useState(user?.branch || 'Information Technology');
  const [semester, setSemester] = useState(user?.semester || 1);
  const [examType, setExamType] = useState(user?.examType || 'insem');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBranch(user.branch || 'Information Technology');
      setSemester(user.semester || 1);
      setExamType(user.examType || 'insem');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 bg-light-background dark:bg-dark-background">
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-8 sm:p-10 max-w-md text-center shadow-xl space-y-4">
          <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">Please Sign In</h2>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            You need to be logged in to view and manage your profile.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-[46px] bg-primary text-primary-foreground font-bold rounded-btn transition-transform active:scale-95 mt-4"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const calculatedYear = getYearFromSem(semester);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!branch || !semester) {
      setMessage({ type: 'error', text: 'Please select both branch and semester.' });
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          name,
          branch,
          semester: Number(semester),
          examType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      updateUser(data.user);

      setMessage({
        type: 'success',
        text: `Academic profile updated! Notes & question papers are now tailored to ${data.user.branch} • ${data.user.year} (${data.user.examType === 'insem' ? 'In-Sem' : data.user.examType === 'endsem' ? 'End-Sem' : 'All Exams'}).`,
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Could not update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground py-8 sm:py-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PAGE HEADER */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground font-sans">
            User Profile &amp; Preferences
          </h1>
          <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted mt-1 font-sans">
            Manage your branch, academic semester, and exam preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: User Card Overview */}
          <div className="lg:col-span-5 bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col items-center text-center space-y-5">
            
            {/* Avatar Circle */}
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shadow-inner">
              <User className="w-10 h-10 stroke-[2]" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-light-foreground dark:text-dark-foreground font-sans">
                {user.name}
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-xs text-light-muted dark:text-dark-muted mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </div>
            </div>

            {/* Academic Badges */}
            <div className="w-full pt-4 border-t border-light-border dark:border-dark-border space-y-3">
              
              <div className="p-3.5 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-left">
                <div className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted tracking-wider">Engineering Branch</div>
                <div className="text-sm font-bold text-light-foreground dark:text-dark-foreground truncate mt-0.5">
                  {user.branch || 'Not Set'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-left">
                <div className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted tracking-wider">Academic Year &amp; Semester</div>
                <div className="text-sm font-bold text-light-foreground dark:text-dark-foreground mt-0.5">
                  Semester {user.semester || 1} • <span className="text-primary">{user.year || getYearFromSem(user.semester)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-left">
                <div className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted tracking-wider">Exam Type Preference</div>
                <div className="text-sm font-bold text-primary mt-0.5">
                  {user.examType === 'insem' ? 'In-Sem (Mid Semester)' : user.examType === 'endsem' ? 'End-Sem (Final Semester)' : 'All Exams'}
                </div>
              </div>

            </div>

            {/* Quick Action Links */}
            <div className="w-full pt-2 space-y-2.5">
              <Link
                to="/notes"
                className="w-full h-11 px-4 bg-primary hover:bg-emerald-400 text-primary-foreground font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>View Notes for My Branch</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>

              <Link
                to="/question-papers"
                className="w-full h-11 px-4 bg-light-surface-secondary hover:bg-light-surface-tertiary dark:bg-dark-surface-secondary dark:hover:bg-dark-surface-tertiary text-light-foreground dark:text-dark-foreground font-bold text-xs rounded-xl border border-light-border dark:border-dark-border transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>View Question Papers</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>
            </div>

          </div>

          {/* RIGHT COLUMN: Edit Academic Profile Form */}
          <div className="lg:col-span-7 bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-xl">
            
            <div className="mb-6">
              <h2 className="text-xl font-bold text-light-foreground dark:text-dark-foreground">
                Update Academic Details
              </h2>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                Customize branch, semester, and exam type to filter your notes &amp; papers
              </p>
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
                <span className="text-xs sm:text-sm">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-[46px] px-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Engineering Branch */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                  Engineering Branch
                </label>
                <CustomSelect
                  id="profile-branch"
                  name="branch"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  options={BRANCH_OPTIONS}
                  placeholder="Select Branch"
                />
              </div>

              {/* Semester Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                  Current Semester
                </label>
                <CustomSelect
                  id="profile-semester"
                  name="semester"
                  required
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  options={SEMESTER_OPTIONS}
                  placeholder="Select Semester"
                />
              </div>

              {/* Exam Type Preference Toggle (In-Sem / End-Sem / All) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                  Target Exam Type Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  <button
                    type="button"
                    onClick={() => setExamType('insem')}
                    className={`h-[46px] px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      examType === 'insem'
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-light-surface-secondary dark:bg-dark-surface-secondary border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-primary/40'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      examType === 'insem' ? 'border-primary bg-primary' : 'border-light-border dark:border-dark-border'
                    }`}>
                      {examType === 'insem' && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                    </div>
                    <span>In-Sem (Mid)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamType('endsem')}
                    className={`h-[46px] px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      examType === 'endsem'
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-light-surface-secondary dark:bg-dark-surface-secondary border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-primary/40'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      examType === 'endsem' ? 'border-primary bg-primary' : 'border-light-border dark:border-dark-border'
                    }`}>
                      {examType === 'endsem' && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                    </div>
                    <span>End-Sem (Final)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamType('all')}
                    className={`h-[46px] px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      examType === 'all'
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-light-surface-secondary dark:bg-dark-surface-secondary border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-primary/40'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      examType === 'all' ? 'border-primary bg-primary' : 'border-light-border dark:border-dark-border'
                    }`}>
                      {examType === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                    </div>
                    <span>All Exams</span>
                  </button>

                </div>
              </div>

              {/* Automatically Computed Year Banner */}
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs font-semibold text-light-foreground dark:text-dark-foreground">
                <span>Calculated Academic Year:</span>
                <span className="font-extrabold text-primary text-sm">{calculatedYear}</span>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full h-[48px] text-sm font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 stroke-[2.5]" />
                      <span>Update Academic Profile</span>
                  </>
                )}
              </button>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
