import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Globe, Lock, BookOpen } from 'lucide-react';
import api from '../services/api';
import CustomSelect from '../components/CustomSelect';

const UploadNote = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('DBMS');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const subjectOptions = [
    { label: 'DBMS', value: 'DBMS' },
    { label: 'Data Structures', value: 'Data Structures' },
    { label: 'Operating Systems', value: 'Operating Systems' },
    { label: 'Computer Networks', value: 'Computer Networks' },
    { label: 'Mathematics', value: 'Mathematics' },
    { label: 'Physics', value: 'Physics' },
    { label: 'Other', value: 'Other' },
  ];

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
    <div className="max-w-3xl mx-auto pb-20 px-4">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6">
            <UploadCloud size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Share Your Knowledge</h2>
        <p className="text-muted mt-2 text-sm md:text-base">Upload your study materials and help fellow students excel.</p>
      </div>

      <div className="bg-surface border border-border rounded-[2rem] p-6 md:p-12 shadow-2xl relative">
        {error && (
          <div className="mb-8 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3 text-sm animate-in fade-in zoom-in duration-200">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1 text-center sm:text-left">Document Title</label>
                <div className="relative group">
                    <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground" 
                    placeholder="e.g. DBMS Unit 1 Notes"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                    />
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1 text-center sm:text-left">Subject Category</label>
                <div className="relative group">
                    <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground" 
                    placeholder="e.g. DBMS, Physics, etc."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required 
                    />
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground ml-1">Description</label>
            <textarea 
              className="w-full px-5 py-4 bg-surface-secondary border border-border rounded-[1.5rem] focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground min-h-[120px]" 
              placeholder="What topics does this note cover? Any specific instructions?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground ml-1">Select File</label>
            <div className="relative group cursor-pointer">
                <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    required
                />
                <div className={`w-full py-10 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition-all ${file ? 'bg-accent/5 border-accent text-accent' : 'bg-surface-secondary border-border hover:border-accent/50 text-muted'}`}>
                    <UploadCloud size={40} className={file ? 'text-accent' : 'text-muted/50'} />
                    <div className="text-center px-4">
                        <p className="font-bold truncate max-w-xs">{file ? file.name : 'Click to select or drag & drop'}</p>
                        <p className="text-xs opacity-70">Supports PDF, DOC, PPT, and Images (Max 50MB)</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-surface-secondary rounded-[1.5rem] border border-border">
            <div className="flex items-center gap-4 text-center sm:text-left">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isPublic ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {isPublic ? <Globe size={24} /> : <Lock size={24} />}
                </div>
                <div>
                    <h4 className="font-bold text-foreground">Privacy Setting</h4>
                    <p className="text-xs text-muted">{isPublic ? 'Public: Same Branch & Year' : 'Private: Only visible to you'}</p>
                </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <div className="w-14 h-7 bg-muted/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-accent text-accent-foreground rounded-field font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={24} />
                    Uploading Note...
                </>
            ) : 'Publish Note'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadNote;
