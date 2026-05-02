import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [year, setYear] = useState(user?.year || 'First Year');
  const [branch, setBranch] = useState(user?.branch || 'Computer Science');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const res = await updateProfile(year, branch);
    if (res.success) {
      setMessage('Profile updated successfully!');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="auth-container" style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem 1rem' }}>
      <div className="card auth-card" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="text-center mb-4">My Profile</h2>
        
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}><strong>Name:</strong> {user.name}</p>
          <p style={{ margin: 0, color: '#64748b' }}><strong>Email:</strong> {user.email}</p>
        </div>

        {message && <div style={{ backgroundColor: '#dcfce3', color: '#166534', padding: '10px', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Year</label>
            <select 
              className="form-control" 
              value={year} 
              onChange={(e) => setYear(e.target.value)} 
              required
            >
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Fourth Year">Fourth Year</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Branch</label>
            <select 
              className="form-control" 
              value={branch} 
              onChange={(e) => setBranch(e.target.value)} 
              required
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
