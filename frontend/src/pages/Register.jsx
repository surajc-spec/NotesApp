import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Info, MailCheck, ShieldCheck, RefreshCw } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
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

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    examType: 'insem',
    branch: '',
    semester: '',
    otp: '',
  });

  const [step, setStep] = useState(1); // Step 1: User Info | Step 2: OTP Entry
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend OTP Cooldown Timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Google authentication failed.');
      }

      login(data);

      if (data.user?.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/notes');
      }
    } catch (err) {
      setError(err.message || 'Failed to register with Google.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMessage('');

    const { name, email, password, examType, branch, semester } = formData;

    if (!name || !email || !password || !examType || !branch || !semester) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP code. Please try again.');
      }

      setStep(2);
      setSuccessMessage(`A 6-digit verification code was sent to ${email}. Please check your inbox.`);
      setResendCooldown(60); // 60s cooldown
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Registration with Verified OTP
  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const { name, email, password, examType, branch, semester, otp } = formData;

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the valid 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
          branch,
          semester: Number(semester),
          examType,
          otp: otp.trim(),
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      login(data);
      navigate('/notes');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-light-background dark:bg-dark-background transition-colors duration-300">
      <div className="w-full max-w-lg">
        
        {/* Card Container */}
        <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-2xl shadow-xl p-8 sm:p-10 transition-colors">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground">
              {step === 1 ? 'Create an Account' : 'Verify Email Address'}
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted mt-2">
              {step === 1
                ? 'Join NoteShare to access notes & question papers'
                : `Enter the 6-digit code sent to ${formData.email}`}
            </p>
          </div>

          {/* Clean Google Sign Up Button */}
          {step === 1 && (
            <>
              <div className="mb-6 flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign up was cancelled or failed.')}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  text="signup_with"
                  size="large"
                  width="360"
                />
              </div>

              {/* Divider */}
              <div className="relative mb-6 flex items-center justify-center">
                <div className="border-t border-light-border dark:border-dark-border w-full"></div>
                <span className="bg-light-surface dark:bg-dark-surface px-3 text-xs uppercase font-bold text-light-muted dark:text-dark-muted absolute">
                  or email registration
                </span>
              </div>
            </>
          )}

          {/* Academic Info Banner */}
          {step === 1 && (
            <div className="mb-6 p-3.5 rounded-xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-center text-xs font-semibold text-light-muted dark:text-dark-muted flex items-center justify-center gap-2">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span>Academic details can be updated anytime from your profile. If you don't see any notes, please check your academic details in your profile.</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3 animate-fadeIn">
              <MailCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-[50px] px-5 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-[50px] px-5 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Grid for Password & Exam Type Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full h-[50px] pl-5 pr-12 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm text-light-foreground dark:text-dark-foreground placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="examType" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Exam Type
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
              </div>

              {/* Grid for Branch & Semester Custom Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="branch" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                    Branch
                  </label>
                  <CustomSelect
                    id="branch"
                    name="branch"
                    required
                    value={formData.branch}
                    onChange={handleChange}
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
                    value={formData.semester}
                    onChange={handleChange}
                    options={SEMESTER_OPTIONS}
                    placeholder="Select Semester"
                  />
                </div>
              </div>

              {/* Step 1 Button: Send OTP */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] px-6 text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 ease-out flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MailCheck className="w-5 h-5 stroke-[2.5]" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP & Complete Registration */}
          {step === 2 && (
            <form onSubmit={handleFinalRegister} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="123456"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full h-[60px] text-center text-2xl font-mono tracking-[12px] font-extrabold bg-light-surface-secondary dark:bg-dark-surface-secondary border-2 border-primary rounded-field text-light-foreground dark:text-dark-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Step 2 Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[50px] px-6 text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 ease-out flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                      <span>Verify &amp; Create Account</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground font-semibold underline"
                  >
                    ← Edit Registration Details
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleSendOtp}
                    className="text-primary hover:underline font-bold disabled:opacity-40 disabled:no-underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Footer Link */}
          <div className="mt-8 text-center text-sm text-light-muted dark:text-dark-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded-sm"
            >
              Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
