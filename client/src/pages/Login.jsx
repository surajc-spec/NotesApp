import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-[500px] bg-accent/10 blur-[100px] rounded-full -z-10" />
      
      <div className="max-w-md w-full bg-surface border border-border rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-muted mt-2">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3 text-sm animate-in fade-in zoom-in duration-200">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground ml-1">Email Address</label>
            <div className="relative group">
              <input 
                type="email" 
                className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground" 
                placeholder="name@university.edu"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-foreground">Password</label>
              <Link to="#" className="text-xs text-accent hover:underline">Forgot password?</Link>
            </div>
            <div className="relative group">
              <input 
                type="password" 
                className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-accent text-accent-foreground rounded-field font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={20} />
                    Authenticating...
                </>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-10 text-muted">
          New to NoteShare? <Link to="/register" className="text-accent font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
