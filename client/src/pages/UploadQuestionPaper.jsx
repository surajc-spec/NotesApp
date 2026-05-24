import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BookOpen, CheckCircle2, FileQuestion, Loader2, UploadCloud } from 'lucide-react';
import api from '../services/api';
import { normalizeSubject } from '../utils/subjectUtils';

const UploadQuestionPaper = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setError('Please select at least one PDF to upload');
      return;
    }

    const normalizedSubject = normalizeSubject(subject);

    if (!normalizedSubject) {
      setError('Please enter a subject');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', normalizedSubject);
    formData.append('description', description);
    files.forEach((file) => {
      formData.append('pdf', file);
    });

    try {
      await api.post('/questionpapers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/questionpapers');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to upload question paper'
      );
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
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Upload Question Paper</h2>
        <p className="text-muted mt-2 text-sm md:text-base">Share previous papers with students from your branch and year.</p>
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
              <label className="text-sm font-bold text-foreground ml-1 text-center sm:text-left">Paper Title Optional</label>
              <div className="relative group">
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground"
                  placeholder="Leave blank to use PDF names"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <FileQuestion className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground ml-1 text-center sm:text-left">Subject Category</label>
              <div className="relative group">
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground"
                  placeholder="e.g. CNS, WAD, DBMS"
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
              placeholder="Mention exam type, unit, semester, or any useful details."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground ml-1">Select PDFs</label>
            <div className="relative group cursor-pointer">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                accept=".pdf"
                multiple
                required
              />
              <div className={`w-full py-10 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition-all ${files.length > 0 ? 'bg-accent/5 border-accent text-accent' : 'bg-surface-secondary border-border hover:border-accent/50 text-muted'}`}>
                <UploadCloud size={40} className={files.length > 0 ? 'text-accent' : 'text-muted/50'} />
                <div className="text-center px-4">
                  <p className="font-bold truncate max-w-xs">
                    {files.length > 0 ? `${files.length} PDF${files.length === 1 ? '' : 's'} selected` : 'Click to select or drag & drop'}
                  </p>
                  <p className="text-xs opacity-70">Supports multiple PDFs (Max 10MB each)</p>
                </div>
              </div>
            </div>
            {files.length > 0 && (
              <div className="grid gap-2 pt-3">
                {files.map((selectedFile, index) => (
                  <div
                    key={`${selectedFile.name}-${selectedFile.lastModified}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm text-foreground"
                  >
                    <FileQuestion size={16} className="shrink-0 text-accent" />
                    <span className="min-w-0 flex-1 truncate">{selectedFile.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 p-6 bg-surface-secondary rounded-[1.5rem] border border-border">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-success/10 text-success">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Same Branch and Year</h4>
              <p className="text-xs text-muted">Question papers are visible only to matching students.</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-accent text-accent-foreground rounded-field font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Uploading {files.length > 1 ? 'Papers' : 'Paper'}...
              </>
            ) : `Publish ${files.length > 1 ? `${files.length} Question Papers` : 'Question Paper'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadQuestionPaper;
