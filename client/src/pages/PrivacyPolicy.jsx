import React from 'react';
import { Shield, Eye, Lock, Database, Cookie, ExternalLink } from 'lucide-react';
import AdUnit from '../components/AdUnit';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      {/* <AdUnit placement="top" className="mb-10" /> */}

      {/* Header */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6 shadow-xl shadow-accent/5">
          <Shield size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Privacy Policy</h1>
        <p className="text-muted mt-3 text-sm md:text-base">
          Last updated: May 20, 2026 • Learn how we protect your personal and study data.
        </p>
      </div>

      {/* Grid Content */}
      <div className="space-y-8">
        
        {/* Core Premise Alert */}
        <div className="p-6 bg-accent/5 border border-accent/10 rounded-[1.5rem] flex flex-col sm:flex-row gap-4 items-start">
          <div className="p-3 bg-accent/10 text-accent rounded-xl shrink-0">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Secure & Protected Environment</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              NoteShare is built from the ground up to prevent unauthorized downloads, text extraction, and copying. All note documents are securely streamed in-app through authenticated channels. We never expose direct file links to ensure authors' content remains secure.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="bg-surface border border-border rounded-[2rem] p-8 md:p-12 space-y-12 shadow-xl">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-secondary border border-border rounded-lg text-accent">
                <Database size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">1. Information We Collect</h2>
            </div>
            <p className="text-muted text-sm md:text-base leading-relaxed pl-11">
              To curate your library experience, we collect specific details when you register for an account:
            </p>
            <ul className="list-disc pl-16 text-muted text-sm md:text-base space-y-2">
              <li><strong className="text-foreground">Profile Details:</strong> Your name, active academic year, and branch of study (e.g. Computer Science, Mechanical). This helps show only notes relevant to your syllabus.</li>
              <li><strong className="text-foreground">Account Credentials:</strong> Your email address and securely hashed passwords (using bcryptjs).</li>
              <li><strong className="text-foreground">Note Metadata:</strong> Titles, subjects, and descriptions of any notes you upload.</li>
            </ul>
          </section>

          <hr className="border-separator" />

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-secondary border border-border rounded-lg text-accent">
                <Eye size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">2. How We Protect Your Notes</h2>
            </div>
            <p className="text-muted text-sm md:text-base leading-relaxed pl-11">
              We employ strict security policies to protect the educational resources shared by our student community:
            </p>
            <ul className="list-disc pl-16 text-muted text-sm md:text-base space-y-2">
              <li><strong className="text-foreground">In-App Streaming Only:</strong> Notes are rendered on an iframe securely and cannot be downloaded, printed, or saved as files.</li>
              <li><strong className="text-foreground">Anti-Copy Measures:</strong> Text copying, scraping, dragging, and right-clicks are electronically disabled.</li>
              <li><strong className="text-foreground">Dynamic Watermarking:</strong> Every view overlays a unique watermark with the reader's name, email, and localized timestamp, discouraging unauthorized photo captures or sharing.</li>
            </ul>
          </section>

          <hr className="border-separator" />

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-secondary border border-border rounded-lg text-accent">
                <Cookie size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">3. Advertising & Cookies</h2>
            </div>
            <p className="text-muted text-sm md:text-base leading-relaxed pl-11">
              NoteShare is a free resource. To cover hosting, secure streaming bandwith, and service operations, we run context-relevant advertisements:
            </p>
            <ul className="list-disc pl-16 text-muted text-sm md:text-base space-y-2">
              <li>We work with Google AdSense and third-party advertising partners to display relevant ads to users.</li>
              <li>These partners may use cookies (like the DART cookie) to serve ads based on your visits to our site and other internet locations.</li>
              <li>You may opt-out of personalized advertising by visiting the <a href="https://settings.google.com/ads" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-bold inline-flex items-center gap-1">Google Ad Settings <ExternalLink size={12} /></a> or clearing your browser cookies.</li>
            </ul>
          </section>

          <hr className="border-separator" />

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-secondary border border-border rounded-lg text-accent">
                <Shield size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">4. Data Deletion & Requests</h2>
            </div>
            <p className="text-muted text-sm md:text-base leading-relaxed pl-11">
              You own your data. If you wish to delete your account or any notes you have uploaded, you can do so directly from your My Notes dashboard, or contact our support team to request immediate and complete removal of all personal records.
            </p>
          </section>

        </div>

      </div>

      {/* <AdUnit placement="footer" className="mt-12" /> */}
    </div>
  );
};

export default PrivacyPolicy;
