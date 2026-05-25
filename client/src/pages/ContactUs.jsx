import React, { useState } from 'react';
import { Mail, MessageSquare, CheckCircle, AlertCircle, Loader2, Send, MapPin } from 'lucide-react';
import AdUnit from '../components/AdUnit';
import api from '../services/api';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/contact', { name, email, subject, message });
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <AdUnit placement="top" className="mb-10" />

      {/* Header */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6 shadow-xl shadow-accent/5">
          <MessageSquare size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Contact Us</h1>
        <p className="text-muted mt-3 text-sm md:text-base">
          Have feedback, found a bug, or want to suggest new secure features? We’d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Info Sidebar */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Card 1 */}
          <div className="bg-surface border border-border rounded-[1.5rem] p-6 flex items-start gap-4 shadow-md">
            <div className="w-10 h-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Email Support</h4>
              <p className="text-xs text-muted mt-1">Our team replies within 24 hours.</p>
              <a href="mailto:surajchougule2706@gmail.com" className="text-accent text-sm font-semibold hover:underline mt-2 inline-block">
                Email
              </a>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface border border-border rounded-[1.5rem] p-6 flex items-start gap-4 shadow-md">
            <div className="w-10 h-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Academic HQ</h4>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                NA<br />
                
              </p>
            </div>
          </div>

        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="bg-surface border border-border rounded-[2rem] p-8 md:p-12 shadow-xl relative min-h-[400px] flex flex-col justify-center">
            
            {success ? (
              <div className="text-center py-8 space-y-5 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto shadow-lg shadow-success/5">
                  <CheckCircle size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Message sent successfully.</h3>
                  <p className="text-muted mt-2 text-sm max-w-xs mx-auto">
                    Admin will review and contact if needed.
                  </p>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 bg-accent text-accent-foreground rounded-field font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3 text-sm animate-in fade-in zoom-in duration-200">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground ml-1">Your Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground text-sm"
                      placeholder="e.g. Sham"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground ml-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground text-sm"
                      placeholder="e.g. sham@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground ml-1">Subject</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-field focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground text-sm"
                    placeholder="e.g. Reporting note layout bug / copyright feedback"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground ml-1">Your Message</label>
                  <textarea
                    className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-[1.25rem] focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-foreground text-sm min-h-[140px]"
                    placeholder="Describe your issue or suggestion..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    minLength={10}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-accent text-accent-foreground rounded-field font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-accent/15 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>

      <AdUnit placement="footer" className="mt-12" />
    </div>
  );
};

export default ContactUs;
