import React, { useState, useEffect } from 'react';
import { ShieldAlert, Monitor, Smartphone, Minimize2, Code2, RefreshCw, Lock } from 'lucide-react';
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
          
          {/* Glowing Header Icon */}
          <div className="relative inline-flex items-center justify-center mx-auto">
            <div className="w-24 h-24 rounded-3xl bg-red-500/10 border-2 border-red-500/30 text-red-500 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-12 h-12 stroke-[2.2]" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-md">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          {/* Title & Badge */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-wider">
              <span>Security Access Restriction</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-light-foreground dark:text-dark-foreground font-sans">
              Desktop Full-Screen Mode Required
            </h1>

            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed max-w-md mx-auto font-sans">
              NoteShare academic notes and question papers are protected by security policy and can only be accessed on full-screen desktop computers.
            </p>
          </div>

          {/* Detected Reason Banner */}
          <div className="p-4 rounded-2xl bg-light-surface-secondary dark:bg-dark-surface-secondary border border-light-border dark:border-dark-border text-xs sm:text-sm font-semibold text-light-foreground dark:text-dark-foreground flex items-center justify-center gap-3">
            {restrictionReason === 'mobile' && (
              <>
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Mobile Device or Small Screen Detected</span>
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

          {/* Steps to Unlock */}
          <div className="text-left p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2 text-xs text-light-muted dark:text-dark-muted font-medium">
            <p className="font-bold text-light-foreground dark:text-dark-foreground uppercase tracking-wider text-[11px] mb-1">
              How to restore access:
            </p>
            <ul className="list-disc pl-4 space-y-1 leading-relaxed">
              <li>Open NoteShare on a <strong>laptop or desktop computer</strong>.</li>
              <li>Ensure your browser window is <strong>fully maximized</strong> (F11 or Maximize button).</li>
              <li>Close any open <strong>Developer Tools or Inspect Element</strong> panels.</li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRecheck}
            className="w-full h-[52px] text-sm font-bold text-primary-foreground bg-primary hover:bg-emerald-400 rounded-btn transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4 stroke-[2.5]" />
            <span>Re-Check Security &amp; Resume</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default RestrictedAccess;
