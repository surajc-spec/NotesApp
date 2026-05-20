import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, X, KeyRound } from 'lucide-react';

const PasswordModal = ({ isOpen, onClose, onSubmit, title = "Protected Note" }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await onSubmit(password);
    } catch (err) {
      setError(err.message || 'Invalid password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-surface/90 border border-border/80 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-muted hover:text-foreground hover:bg-surface-secondary/80 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Lock Icon Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-4 ring-8 ring-accent/5">
            <Lock size={32} className="animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted mt-1">This note is password protected. Enter the password to unlock.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              <KeyRound size={18} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-12 pr-12 py-3.5 bg-field-background text-field-foreground border border-border rounded-xl text-sm placeholder:text-field-placeholder focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors cursor-pointer"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 text-danger border border-danger/20 text-sm animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-border text-foreground hover:bg-surface-secondary rounded-xl font-semibold text-sm transition-colors cursor-pointer"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-accent text-accent-foreground hover:opacity-90 rounded-xl font-semibold text-sm shadow-lg shadow-accent/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                'Unlock Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
