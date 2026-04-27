import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';
import api from '../services/api';
import '../components/Notes.css';

const UploadNote = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('isPublic', isPublic);
    formData.append('file', file);

    try {
      await api.post('/notes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="card">
        <h2 className="mb-4 flex items-center gap-2">
          <UploadCloud /> Upload a Note
        </h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              className="form-control" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures Ch 1"
              required 
            />
          </div>

          <div className="form-group">
            <label>Subject / Category</label>
            <input 
              type="text" 
              className="form-control" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Computer Science"
              required 
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-control" 
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this note covers..."
              required 
            ></textarea>
          </div>

          <div className="form-group">
            <label>File (PDF, Image, Doc)</label>
            <div className="file-upload-wrapper">
              <input 
                type="file" 
                className="file-input" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                required
              />
            </div>
          </div>

          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label htmlFor="isPublic" style={{ margin: 0, fontWeight: 500 }}>
              Make this note public (visible to everyone)
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Note'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadNote;
