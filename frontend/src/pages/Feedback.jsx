import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const Feedback = () => {
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [semester, setSemester] = useState(user?.semester ? String(user.semester) : '');
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!comment || !comment.trim()) {
      setError('Please write a short review or feedback comment.');
      return;
    }

    if (!name || !branch || !semester) {
      setError('Please fill in your name, branch, and semester.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          branch: branch.trim(),
          semester: Number(semester),
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-light-background dark:bg-dark-background transition-colors duration-300">
      <div className="w-full max-w-lg">
        
        {/* Main Card */}
        <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl shadow-xl p-8 sm:p-10 transition-colors">
          
          {submitted ? (
            /* Success State */
            <div className="text-center py-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground mb-2">
                Thank You for Your Review!
              </h2>
              <p className="text-sm text-light-muted dark:text-dark-muted mb-8 leading-relaxed">
                Your feedback has been submitted successfully and will be displayed on the NoteShare homepage!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/"
                  className="px-6 py-3 text-sm font-bold text-light-foreground dark:text-dark-foreground bg-light-surface-secondary dark:bg-dark-surface-secondary hover:bg-light-border dark:hover:bg-dark-border rounded-btn transition-colors"
                >
                  Return to Home
                </Link>
                <Link
                  to="/notes"
                  className="px-6 py-3 text-sm font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-colors"
                >
                  Explore Notes
                </Link>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground">
                  Student Feedback &amp; Review
                </h1>
                <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted mt-2 leading-relaxed max-w-md mx-auto">
                  We'd love to hear your success story! Please share your feedback, feel free to mention your SGPA, and tell us how NoteShare helped boost your exam scores.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Rating Selector */}
                <div className="text-center bg-light-surface-secondary dark:bg-dark-surface-secondary p-4 rounded-xl border border-light-border dark:border-dark-border">
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    How would you rate NoteShare?
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Suraj Chougule"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-[48px] px-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Grid for Branch & Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="branch" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                      Branch
                    </label>
                    <CustomSelect
                      id="branch"
                      name="branch"
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      options={BRANCH_OPTIONS}
                      placeholder="Select Branch"
                    />
                  </div>

                  <div>
                    <label htmlFor="semester" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                      Semester
                    </label>
                    <CustomSelect
                      id="semester"
                      name="semester"
                      required
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      options={SEMESTER_OPTIONS}
                      placeholder="Select Semester"
                    />
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground">
                      Review &amp; SGPA Story
                    </label>
                    <span className="text-xs text-light-muted dark:text-dark-muted">
                      {comment.length}/500
                    </span>
                  </div>
                  <textarea
                    id="comment"
                    rows={4}
                    maxLength={500}
                    required
                    placeholder="Share your story! Mention your SGPA, how NoteShare helped boost your exam score, or your favorite feature..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-xl text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[50px] px-6 text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 ease-out flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MessageSquarePlus className="w-5 h-5 stroke-[2.5]" />
                      <span>Submit Testimonial</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    to="/"
                    className="text-xs font-semibold text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                  </Link>
                </div>

              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Feedback;
