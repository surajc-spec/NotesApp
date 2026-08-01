import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  Edit3,
  Calendar,
  Layers,
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

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBranch(user.branch || 'Information Technology');
      setSemester(user.semester || 1);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6 bg-light-background dark:bg-dark-background">
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-10 max-w-md text-center shadow-xl space-y-4">
          <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">Please Sign In</h2>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            You need to be logged in to view and manage your profile.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-[46px] bg-primary text-primary-foreground font-bold rounded-btn transition-transform active:scale-95 shadow-md mt-4"
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      // Sync user state in AuthContext & LocalStorage
      updateUser(data.user);

      setMessage({
        type: 'success',
        text: `Academic profile updated! Your notes & question papers are now tailored to ${data.user.branch} • ${data.user.year}.`,
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Could not update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground pb-20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-10">
        
        {/* PAGE HEADER */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground font-sans">
            User Profile &amp; Preferences
          </h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-1 font-sans">
            Manage your personal info, branch, and academic semester
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: User Card Overview */}
          <div className="lg:col-span-5 bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-8 shadow-xl flex flex-col items-center text-center space-y-6">
            
            {/* Avatar Circle */}
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shadow-inner">
              <User className="w-12 h-12 stroke-[2]" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground font-sans">
                {user.name}
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-xs text-light-muted dark:text-dark-muted mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </div>
            </div>

            {/* Academic Badges */}
            <div className="w-full pt-4 border-t border-light-border dark:border-dark-border space-y-3">
              
              <div className="p-3.5 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Engineering Branch</div>
                  <div className="text-sm font-bold text-light-foreground dark:text-dark-foreground truncate">
                    {user.branch || 'Not Set'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Academic Year &amp; Semester</div>
                  <div className="text-sm font-bold text-light-foreground dark:text-dark-foreground">
                    Semester {user.semester || 1} • <span className="text-primary">{user.year || getYearFromSem(user.semester)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Action Links */}
            <div className="w-full pt-2 space-y-2">
              <Link
                to="/notes"
                className="w-full h-11 px-4 bg-primary hover:bg-emerald-400 text-primary-foreground font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(54,215,157,0.35)]"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Notes for My Branch</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>

              <Link
                to="/question-papers"
                className="w-full h-11 px-4 bg-light-surface-secondary hover:bg-light-surface-tertiary dark:bg-dark-surface-secondary dark:hover:bg-dark-surface-tertiary text-light-foreground dark:text-dark-foreground font-bold text-xs rounded-xl border border-light-border dark:border-dark-border transition-all flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>View Question Papers</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>
            </div>

          </div>

          {/* RIGHT COLUMN: Edit Academic Profile Form */}
          <div className="lg:col-span-7 bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl p-8 sm:p-10 shadow-xl">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">
                  Update Academic Details
                </h2>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                  Change your branch or semester to customize study recommendations
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

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-[50px] px-5 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Engineering Branch */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
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

              {/* Automatically Computed Year Preview */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
                <span className="font-medium text-light-foreground dark:text-dark-foreground">
                  Calculated Academic Year:
                </span>
                <span className="font-extrabold text-primary text-sm">
                  {calculatedYear}
                </span>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full h-[50px] text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(54,215,157,0.35)] mt-8"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 stroke-[2.5]" />
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
