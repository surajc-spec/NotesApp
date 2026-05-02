import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, GraduationCap, Building2, AlertCircle, Loader2 } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [year, setYear] = useState('First Year');
  const [branch, setBranch] = useState('Computer Science');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const yearOptions = [
    { label: 'First Year', value: 'First Year' },
    { label: 'Second Year', value: 'Second Year' },
    { label: 'Third Year', value: 'Third Year' },
    { label: 'Fourth Year', value: 'Fourth Year' },
  ];

  const branchOptions = [
    { label: 'Computer Science', value: 'Computer Science' },
    { label: 'Information Technology', value: 'Information Technology' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Mechanical', value: 'Mechanical' },
    { label: 'Civil', value: 'Civil' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await register(name, email, password, year, branch);
    if (res.success) {
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
          <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
          <p className="text-muted mt-2">Join our elite community of learners</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3 text-sm animate-in fade-in zoom-in duration-200">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-foreground ml-1">Full Name</label>
            <div className="relative group">
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground" 
                placeholder="John Doe"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground ml-1">Email Address</label>
            <div className="relative group">
              <input 
                type="email" 
                className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground" 
                placeholder="john@uni.edu"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground ml-1">Password</label>
            <div className="relative group">
              <input 
                type="password" 
                className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength="6"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
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

          <button 
            type="submit" 
            className="md:col-span-2 mt-4 py-4 bg-accent text-accent-foreground rounded-field font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating Account...
                </>
            ) : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-10 text-muted">
          Already have an account? <Link to="/login" className="text-accent font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
