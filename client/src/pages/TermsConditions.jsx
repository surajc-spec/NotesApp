import React from 'react';
import { FileWarning, AlertTriangle, UserCheck, ShieldCheck, Scale } from 'lucide-react';
import AdUnit from '../components/AdUnit';

const TermsConditions = () => {
  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 animate-in fade-in duration-500">
      <AdUnit placement="top" className="mb-10" />

      {/* Header */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6 shadow-xl shadow-accent/5">
          <Scale size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Terms & Conditions</h1>
        <p className="text-muted mt-3 text-sm md:text-base">
          Last updated: May 20, 2026 • Please read our educational and secure streaming policies.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Core Warning Alert */}
        <div className="p-6 bg-danger/5 border border-danger/10 rounded-[1.5rem] flex flex-col sm:flex-row gap-4 items-start animate-pulse">
          <div className="p-3 bg-danger/10 text-danger rounded-xl shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">STRICT NO-DOWNLOAD POLICY</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              NoteShare is exclusively a secure in-app viewer. Downloading, scraping, printing, copying text, or taking screen captures of any document hosted on this platform is strictly forbidden. Circumventing our technical measures is a violation of our intellectual property terms.
            </p>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-surface border border-border rounded-[2rem] p-8 md:p-12 space-y-12 shadow-xl">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-secondary border border-border rounded-lg text-accent">
                <UserCheck size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">1. User Eligibility & Accounts</h2>
            </div>
            <p className="text-muted text-sm md:text-base leading-relaxed pl-11">
              By creating an account, you agree to provide truthful academic profiles. You are responsible for keeping your login credentials secure. Accounts may not be shared between multiple students. If we detect suspicious concurrent log-ins, your account may be temporarily locked.
            </p>
          </section>

          <hr className="border-separator" />

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-secondary border border-border rounded-lg text-accent">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">2. Secured Previewing & Anti-Circumvention</h2>
            </div>
            <p className="text-muted text-sm md:text-base leading-relaxed pl-11">
              Our service provides advanced technological protections to protect the work of creators:
            </p>
            <ul className="list-disc pl-16 text-muted text-sm md:text-base space-y-2">
              <li>You may not use third-party extensions, custom styles, or script injections to remove or hide watermarks.</li>
              <li>Attempting to access raw Cloudinary paths, Google Drive folders, or backend database files directly without authentication is strictly prohibited and logged as malicious behavior.</li>
              <li>Circumventing developer tool shortcuts blocks (such as console inspect or F12 key bypasses) to scrape pages will result in an immediate, permanent ban of your academic account and IP.</li>
            </ul>
          </section>

          <hr className="border-separator" />

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-secondary border border-border rounded-lg text-accent">
                <FileWarning size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">3. Uploaded Content Ownership</h2>
            </div>
            <p className="text-muted text-sm md:text-base leading-relaxed pl-11">
              Creators who upload notes retain 100% intellectual copyright over their files. By publishing notes on NoteShare:
            </p>
            <ul className="list-disc pl-16 text-muted text-sm md:text-base space-y-2">
              <li>You guarantee you have the legal right or permission to share the educational material.</li>
              <li>You grant NoteShare a limited, non-exclusive license to secure, watermark, and stream the file to authorized students matching your branch and year criteria.</li>
              <li>You agree not to publish offensive, copyrighted textbook duplicates, or non-educational files.</li>
            </ul>
          </section>

          <hr className="border-separator" />

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-secondary border border-border rounded-lg text-accent">
                <Scale size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">4. Platform Monetization & Ads</h2>
            </div>
            <p className="text-muted text-sm md:text-base leading-relaxed pl-11">
              To provide this hosting service entirely for free, we display network advertisements. You agree not to use aggressive ad-blocking software while using our services, as this deprives the platform of crucial support needed to maintain streaming and encryption server costs.
            </p>
          </section>

        </div>

      </div>

      <AdUnit placement="footer" className="mt-12" />
    </div>
  );
};

export default TermsConditions;
