import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, AlertCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CustomSelect from '../components/CustomSelect';

const BRANCH_OPTIONS = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
];

const SEMESTER_OPTIONS = [
  { label: 'Semester 1', value: 1 },
  { label: 'Semester 2', value: 2 },
  { label: 'Semester 3', value: 3 },
  { label: 'Semester 4', value: 4 },
  { label: 'Semester 5', value: 5 },
  { label: 'Semester 6', value: 6 },
  { label: 'Semester 7', value: 7 },
  { label: 'Semester 8', value: 8 },
];

const EXAM_TYPE_OPTIONS = [
  { label: 'In-Sem Exam', value: 'insem' },
  { label: 'End-Sem Exam', value: 'endsem' },
];

const SetupProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    branch: user?.branch || '',
    semester: user?.semester || '',
    examType: user?.examType || 'insem',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user is not logged in, redirect to login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const parseResponse = async (response) => {
    let data = {};
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Backend is waking up or deploying. Please try again in 10 seconds.');
      }
    }
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { branch, semester, examType } = formData;

    if (!branch || !semester) {
      setError('Please select both your Branch and Semester.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          branch,
          semester: Number(semester),
          examType: examType || 'insem',
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update academic profile. Please try again.');
      }

      if (data.user) {
        updateUser(data.user);
      }

      navigate('/notes');
    } catch (err) {
      setError(err.message || 'Something went wrong while saving your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-light-background dark:bg-dark-background transition-colors duration-300">
      <div className="w-full max-w-lg">
        
        {/* Card Container */}
        <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl shadow-xl p-8 sm:p-10 transition-colors">
          
          {/* Header Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <GraduationCap className="w-8 h-8 stroke-[2.2]" />
            </div>
          </div>

          {/* Header Texts */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-light-foreground dark:text-dark-foreground">
              Select Academic Details
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted mt-2">
              Tell us your branch and semester so we can load the exact notes and question papers for you.
            </p>
          </div>

          {/* Info Banner */}
          <div className="mb-6 p-3.5 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-center text-xs text-light-muted dark:text-dark-muted">
            You can update your branch and semester details anytime from your Profile.
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Branch Selection */}
            <div>
              <label htmlFor="branch" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                Engineering Branch
              </label>
              <CustomSelect
                id="branch"
                name="branch"
                required
                value={formData.branch}
                onChange={handleChange}
                options={BRANCH_OPTIONS}
                placeholder="Select Your Branch"
              />
            </div>

            {/* Semester Selection */}
            <div>
              <label htmlFor="semester" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                Current Semester
              </label>
              <CustomSelect
                id="semester"
                name="semester"
                required
                value={formData.semester}
                onChange={handleChange}
                options={SEMESTER_OPTIONS}
                placeholder="Select Your Semester"
              />
            </div>

            {/* Exam Type Selection */}
            <div>
              <label htmlFor="examType" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                Target Exam
              </label>
              <CustomSelect
                id="examType"
                name="examType"
                required
                value={formData.examType}
                onChange={handleChange}
                options={EXAM_TYPE_OPTIONS}
                placeholder="Select Exam Type"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] px-6 text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 ease-out flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6 shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <BookOpen className="w-5 h-5 stroke-[2.2]" />
                  <span>Continue to Notes</span>
                  <ArrowRight className="w-4 h-4 ml-1 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default SetupProfile;
