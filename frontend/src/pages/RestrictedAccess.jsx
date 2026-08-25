import React, { useState, useEffect } from 'react';
import { ShieldAlert, Monitor, Smartphone, Minimize2, Code2, RefreshCw, Lock, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RestrictedAccess = () => {
  const navigate = useNavigate();
  const [restrictionReason, setRestrictionReason] = useState('');

  const checkRestrictions = () => {
    // 1. Check Mobile Device / Screen Width
    const isMobileWidth = window.innerWidth < 1024;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent || ''
    );

    if (isMobileWidth || isMobileUA) {
      return { restricted: true, reason: 'mobile' };
    }

    // 2. Check Window Minimized / Non-Maximized
    const widthThreshold = window.screen.availWidth * 0.85;
    const heightThreshold = window.screen.availHeight * 0.85;
    const isMinimizedOrSmall =
      window.outerWidth < widthThreshold || window.outerHeight < heightThreshold;

    if (isMinimizedOrSmall) {
      return { restricted: true, reason: 'minimized' };
    }

    // 3. Check DevTools Open
    const threshold = 160;
    const isDevToolsOpen =
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold;

    if (isDevToolsOpen) {
      return { restricted: true, reason: 'devtools' };
    }

    return { restricted: false, reason: '' };
  };

  useEffect(() => {
    const { restricted, reason } = checkRestrictions();
    setRestrictionReason(reason);

    // If restrictions are cleared (window maximized, DevTools closed), auto-redirect back
    const handleResize = () => {
      const current = checkRestrictions();
      if (!current.restricted) {
        const lastRoute = sessionStorage.getItem('last_valid_route') || '/notes';
        navigate(lastRoute, { replace: true });
      } else {
        setRestrictionReason(current.reason);
      }
    };

    window.addEventListener('resize', handleResize);
    const interval = setInterval(handleResize, 1000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, [navigate]);

  const handleRecheck = () => {
    const current = checkRestrictions();
    if (!current.restricted) {
      const lastRoute = sessionStorage.getItem('last_valid_route') || '/notes';
      navigate(lastRoute, { replace: true });
    } else {
      setRestrictionReason(current.reason);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-light-background dark:bg-dark-background transition-colors duration-300 select-none">
      <div className="w-full max-w-xl">
        
        {/* Security Card */}
        <div className="bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-md border-2 border-red-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 animate-fadeIn">
          
       
        
          {/* Title & Badge */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-light-foreground dark:text-dark-foreground font-sans">
              Desktop Mode or App Required
            </h1>

            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed max-w-md mx-auto font-sans">
              To protect academic materials and enable hardware screenshot security, NoteShare is accessible on desktop browsers or via the official Android App.
            </p>
          </div>

          {/* Detected Reason Banner */}
          <div className="p-4 rounded-2xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-xs sm:text-sm font-semibold text-light-foreground dark:text-dark-foreground flex items-center justify-center gap-3">
            {restrictionReason === 'mobile' && (
              <>
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Mobile Browser Detected</span>
              </>
            )}
            {restrictionReason === 'minimized' && (
              <>
                <Minimize2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Window Minimized or Not Maximized</span>
              </>
            )}
            {restrictionReason === 'devtools' && (
              <>
                <Code2 className="w-5 h-5 text-red-400 shrink-0" />
                <span>Developer Tools / Inspector Opened</span>
              </>
            )}
            {!restrictionReason && (
              <>
                <Monitor className="w-5 h-5 text-primary shrink-0" />
                <span>Checking System Requirements...</span>
              </>
            )}
          </div>

          {/* Action / Steps to Unlock */}
          {restrictionReason === 'mobile' ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-primary/10 border-2 border-primary/30 text-left space-y-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-inner">
                  <Smartphone className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-extrabold text-light-foreground dark:text-dark-foreground font-sans">
                    Study on Phone with NoteShare App
                  </h4>
                  <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed mt-0.5">
                    Secure mobile studying with native hardware protection.
                  </p>
                </div>
              </div>

              <a
                href="/NoteShare.apk?v=4.0"
                download="NoteShare.apk"
                className="w-full py-3.5 px-5 bg-primary hover:bg-emerald-400 text-primary-foreground font-extrabold text-sm sm:text-base rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg hover:shadow-primary/25 active:scale-[0.98] text-center"
              >
                <Download className="w-5 h-5 stroke-[2.5] shrink-0" />
                <span>Download Android App (.apk)</span>
              </a>

              <p className="text-xs text-light-muted dark:text-dark-muted text-center pt-0.5">
                Or open <span className="font-bold text-light-foreground dark:text-dark-foreground">noteshare.online</span> on your laptop/desktop.
              </p>
            </div>
          ) : (
            <div className="text-left p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2 text-xs text-light-muted dark:text-dark-muted font-medium">
              <p className="font-bold text-light-foreground dark:text-dark-foreground uppercase tracking-wider text-[11px] mb-1">
                How to restore access:
              </p>
              <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                <li>Open NoteShare on a <strong>laptop or desktop computer</strong>.</li>
                <li>Ensure your browser window is <strong>fully maximized</strong> (F11 or Maximize button).</li>
                <li>Close any open <strong>Developer Tools or Inspect Element</strong> panels.</li>
              </ul>

              <button
                onClick={handleRecheck}
                className="w-full h-[48px] mt-3 text-sm font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                <span>Re-Check Security &amp; Resume</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RestrictedAccess;
