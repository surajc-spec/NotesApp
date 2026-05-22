import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  GraduationCap,
  Building2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import CustomSelect from '../components/CustomSelect';
import { Turnstile } from '@marsidev/react-turnstile';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [year, setYear] = useState('First Year');
  const [branch, setBranch] = useState('Computer Science');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [captchaVerified, setCaptchaVerified] =
    useState(false);

  const { register } =
    useContext(AuthContext);

  const navigate =
    useNavigate();

  const yearOptions = [
    { label: 'First Year', value: 'First Year' },
    { label: 'Second Year', value: 'Second Year' },
    { label: 'Third Year', value: 'Third Year' },
    { label: 'Fourth Year', value: 'Fourth Year' },
  ];

  const branchOptions = [
    {
      label: 'Computer Science',
      value: 'Computer Science',
    },
    {
      label: 'Information Technology',
      value: 'Information Technology',
    },
    {
      label: 'Electronics',
      value: 'Electronics',
    },
    {
      label: 'Mechanical',
      value: 'Mechanical',
    },
    {
      label: 'Civil',
      value: 'Civil',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!captchaVerified) {
      setError(
        'Please complete CAPTCHA'
      );
      return;
    }

    setLoading(true);

    const res =
      await register(
        name,
        email,
        password,
        year,
        branch
      );

    if (res.success) {
      localStorage.setItem(
        'showRegistrationPopup',
        'true'
      );

      navigate('/');
    } else {
      setError(res.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[600px] bg-accent/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-xl w-full bg-surface border border-border rounded-[2rem] p-8 md:p-12 shadow-2xl relative">

        <div className="text-center mb-10">

          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6">
            <UserPlus size={32} />
          </div>

          <h2 className="text-3xl font-bold text-foreground">
            Create Account
          </h2>

          <p className="text-muted mt-2">
            Join our elite community
          </p>

        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3">

            <AlertCircle size={18} />

            {error}

          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >

          <div className="space-y-2 md:col-span-2">

            <label className="text-sm font-bold">
              Full Name
            </label>

            <div className="relative">

              <input
                type="text"
                value={name}
                required
                placeholder="John Doe"
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border rounded-field"
              />

              <User
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />

            </div>

          </div>

          <div className="space-y-2">

            <label className="text-sm font-bold">
              Email
            </label>

            <div className="relative">

              <input
                type="email"
                required
                value={email}
                placeholder="john@uni.edu"
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border rounded-field"
              />

              <Mail
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />

            </div>

          </div>

          <div className="space-y-2">

            <label className="text-sm font-bold">
              Password
            </label>

            <div className="relative">

              <input
                type="password"
                required
                minLength="6"
                value={password}
                placeholder="••••••••"
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border rounded-field"
              />

              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />

            </div>

          </div>

          <CustomSelect
            label="Academic Year"
            options={yearOptions}
            value={year}
            onChange={setYear}
            icon={GraduationCap}
          />

          <CustomSelect
            label="Department/Branch"
            options={branchOptions}
            value={branch}
            onChange={setBranch}
            icon={Building2}
          />

          <div className="md:col-span-2 flex justify-center">

            <Turnstile
              siteKey={
                import.meta.env
                  .VITE_TURNSTILE_SITE_KEY
              }
              onSuccess={() => {
                setCaptchaVerified(true);
                setError('');
              }}
              onExpire={() =>
                setCaptchaVerified(false)
              }
              onError={() =>
                setCaptchaVerified(false)
              }
            />

          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !captchaVerified
            }
            className="md:col-span-2 mt-4 py-4 bg-accent rounded-field font-bold disabled:opacity-50 flex justify-center gap-2"
          >

            {loading ? (
              <>
                <Loader2
                  className="animate-spin"
                  size={20}
                />
                Creating Account...
              </>
            ) : (
              captchaVerified
                ? 'Sign Up'
                : 'Complete CAPTCHA'
            )}

          </button>

        </form>

        <p className="text-center mt-10">

          Already have account?

          <Link
            to="/login"
            className="text-accent ml-2"
          >
            Sign In
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Register;