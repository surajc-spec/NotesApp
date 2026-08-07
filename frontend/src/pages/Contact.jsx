import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Loader2 } from 'lucide-react';

const Contact = () => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (statusMessage.text) setStatusMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!formData.user_name || !formData.user_email || !formData.message) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);

    try {
      // 1. Try sending via Backend Resend API (Recommended & Secure)
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.user_name,
          email: formData.user_email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const resData = await response.json();

      if (response.ok) {
        setStatusMessage({
          type: 'success',
          text: resData.message || 'Thank you! Your message has been sent successfully. We will get back to you shortly.',
        });

        setFormData({
          user_name: '',
          user_email: '',
          subject: '',
          message: '',
        });
        return;
      }

      // 2. Fallback to EmailJS if backend Resend returns error
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_noteshare';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_noteshare';
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.user_name,
          reply_to: formData.user_email,
          user_email: formData.user_email,
          subject: formData.subject || 'General Inquiry',
          message: formData.message,
        },
        publicKey
      );

      setStatusMessage({
        type: 'success',
        text: 'Thank you! Your message has been sent successfully.',
      });

      setFormData({
        user_name: '',
        user_email: '',
        subject: '',
        message: '',
      });

    } catch (err) {
      console.error('Contact Submit Error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to send message. Please check your network connection or try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground pb-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 pt-10 sm:pt-14">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-light-foreground dark:text-dark-foreground">
            Get in Touch with NoteShare
          </h1>
          <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted max-w-md mx-auto font-sans leading-relaxed">
            Have questions, feedback, or need assistance? Send us a direct message.
          </p>
        </div>

        {/* Contact Form Card */}
        <div className="bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border border-light-border dark:border-dark-border rounded-3xl p-6 sm:p-10 shadow-2xl">
          
          {/* Status Alert */}
          {statusMessage.text && (
            <div className={`mb-6 p-4 rounded-xl text-xs sm:text-sm border animate-fadeIn ${
              statusMessage.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  Your Full Name
                </label>
                <input
                  type="text"
                  name="user_name"
                  required
                  placeholder="John Doe"
                  value={formData.user_name}
                  onChange={handleChange}
                  className="w-full h-[48px] px-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="user_email"
                  required
                  placeholder="student@example.com"
                  value={formData.user_email}
                  onChange={handleChange}
                  className="w-full h-[48px] px-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                placeholder="e.g. Note request / Feedback"
                value={formData.subject}
                onChange={handleChange}
                className="w-full h-[48px] px-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light-foreground dark:text-dark-foreground mb-2">
                Your Message
              </label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Write your query or feedback here..."
                value={formData.message}
                onChange={handleChange}
                className="w-full p-4 bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border rounded-field text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] text-base font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <span>Send Message</span>
              )}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};

export default Contact;
