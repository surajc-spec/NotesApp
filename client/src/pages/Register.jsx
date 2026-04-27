import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await register(name, email, password, year);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2 className="text-center mb-4">Create an Account</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label>Year (e.g. First Year, Second Year)</label>
            <input 
              type="text" 
              className="form-control" 
              value={year} 
              onChange={(e) => setYear(e.target.value)} 
              required 
              placeholder="e.g. 2nd Year"
            />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
