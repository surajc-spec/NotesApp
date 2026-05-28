import React from 'react';
import { BookOpen, Download, Smartphone, Shield, Sparkles, Monitor } from 'lucide-react';

const DownloadPage = () => {
  const handleDownload = () => {
    window.location.href = '/download/noteshare.apk';
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left column: Visual Showcase */}
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-accent to-indigo-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative w-64 h-[480px] bg-[#06110f] border-4 border-border rounded-[2.5rem] p-3 shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Speaker & camera slot */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-border rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-12 h-1 bg-muted rounded-full" />
              </div>

              {/* In-app preview screen */}
              <div className="flex-1 mt-6 rounded-[1.75rem] bg-gradient-to-b from-[#081b18] to-background p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-8 right-4 w-24 h-24 bg-accent/5 rounded-full blur-xl" />
                
                {/* Slim Status Bar */}
                <div className="flex justify-between items-center text-[10px] text-muted">
                  <span>NoteShare App</span>
                  <span>100%</span>
                </div>

                {/* App Content Preview */}
                <div className="flex-1 flex flex-col justify-center items-center space-y-4">
                  <img src="/favicon2.png" alt="NoteShare Logo" className="w-16 h-16 rounded-2xl bg-white/5 p-2 shadow-lg" />
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-foreground">Academic Library</h4>
                    <p className="text-[10px] text-accent font-medium mt-0.5">Third Year • IT</p>
                  </div>
                  
                  {/* Dummy Note Card */}
                  <div className="w-full bg-surface border border-border p-2.5 rounded-xl text-left space-y-1.5 shadow-md">
                    <div className="h-2 w-12 bg-accent/20 rounded" />
                    <div className="h-3 w-28 bg-foreground/10 rounded" />
                    <div className="h-2 w-20 bg-muted/20 rounded" />
                  </div>
                </div>

                {/* Bottom navigation bar */}
                <div className="h-8 border-t border-border/40 flex justify-around items-center text-[9px] text-muted pt-1">
                  <span className="text-accent font-bold">Notes</span>
                  <span>Papers</span>
                  <span>Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Copy & Actions */}
        <div className="space-y-8 text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              Verified Clean Build
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-foreground">
              Get the Secure <br />
              <span className="text-accent">NoteShare App</span>
            </h1>
            <p className="text-muted text-base leading-relaxed">
              Read and preview notes safely with screenshot protection, screen recording blocks, and dynamic offline watermarks tailored exactly for your branch and year.
            </p>
          </div>

          {/* Download Box */}
          <div className="bg-surface border border-border rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider block">File details</span>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Smartphone size={16} className="text-accent" />
                noteshare.apk (Android)
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-4 bg-accent text-accent-foreground rounded-field font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Download size={22} />
              Download APK
            </button>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="flex items-start gap-2.5">
                <Shield size={16} className="text-accent mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-foreground">Anti-Screenshot</h5>
                  <p className="text-[10px] text-muted leading-normal mt-0.5">FLAG_SECURE active inside app views.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <BookOpen size={16} className="text-accent mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-foreground">Adaptive Filter</h5>
                  <p className="text-[10px] text-muted leading-normal mt-0.5">Loads your branch & year content instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
