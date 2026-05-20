import React, { useEffect } from 'react';
import { ShieldAlert, EyeOff, Lock } from 'lucide-react';
import { useFullscreenProtection } from '../hooks/useFullscreenProtection';

/**
 * Reusable FullscreenGuard component to enforce enhanced security when in fullscreen mode.
 * Provides a dark translucent overlay by default, intercepts screenshot shortcuts,
 * applies extreme blackout shields and heavy blurs instantly, and guards against focus loss.
 */
const FullscreenGuard = ({ children, isEnabled = true }) => {
  const {
    isFullscreen,
    isBlackoutActive,
    setIsBlackoutActive,
    isFullscreenBlurred,
    setIsFullscreenBlurred,
    showNotification,
    isFullscreenAlertActive,
    setIsFullscreenAlertActive,
    fullscreenAlertMessage,
    setFullscreenAlertMessage,
  } = useFullscreenProtection();

  useEffect(() => {
    if (!isEnabled || !isFullscreen) return;

    let alertTimeout;

    const triggerBlackout = (msg) => {
      setFullscreenAlertMessage(msg);
      setIsBlackoutActive(true);
      setIsFullscreenBlurred(true);
      setIsFullscreenAlertActive(true);

      if (alertTimeout) clearTimeout(alertTimeout);
      // Restore the view after exactly 3 seconds
      alertTimeout = setTimeout(() => {
        setIsBlackoutActive(false);
        setIsFullscreenBlurred(false);
        setIsFullscreenAlertActive(false);
      }, 3000);
    };

    // Fullscreen Screenshot Shortcut Event Interceptors (Requirement 3)
    const handleKeyDown = (e) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const keyCode = e.keyCode;

      const isPrintScreen = e.key === 'PrintScreen' || keyCode === 44;
      const isAltPrintScreen = e.altKey && isPrintScreen;
      const isF11 = e.key === 'F11' || keyCode === 122;
      const isMacCapture =
        e.metaKey &&
        e.shiftKey &&
        (key === '3' || key === '4' || key === '5' || keyCode === 51 || keyCode === 52 || keyCode === 53);
      const isWinSnipping = e.metaKey && e.shiftKey && (key === 's' || keyCode === 83);
      
      const isFKey = (keyCode >= 112 && keyCode <= 123) || /^f(1[0-2]|\d)$/i.test(e.key);
      const isCtrlShiftS = (e.ctrlKey || e.metaKey) && e.shiftKey && (key === 's' || keyCode === 83);

      if (isPrintScreen || isAltPrintScreen || isMacCapture || isWinSnipping || isF11 || isFKey || isCtrlShiftS) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackout('Screenshots and capture shortcuts are blocked in protected fullscreen mode.');
        return;
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const keyCode = e.keyCode;
      const isPrintScreen = e.key === 'PrintScreen' || keyCode === 44;
      const isWinSnipping = e.metaKey && e.shiftKey && (key === 's' || keyCode === 83);
      const isFKey = (keyCode >= 112 && keyCode <= 123) || /^f(1[0-2]|\d)$/i.test(e.key);
      const isCtrlShiftS = (e.ctrlKey || e.metaKey) && e.shiftKey && (key === 's' || keyCode === 83);

      if (isPrintScreen || isWinSnipping || isFKey || isCtrlShiftS) {
        try {
          navigator.clipboard.writeText('');
        } catch (_) {}
        triggerBlackout('Screenshots and capture shortcuts are blocked in protected fullscreen mode.');
      }
    };

    // Visibility Change / Tab & App Switching Protection (Requirement 5)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsFullscreenBlurred(true);
        setIsBlackoutActive(true);
      } else {
        if (!isFullscreenAlertActive) {
          setIsFullscreenBlurred(false);
          setIsBlackoutActive(false);
        }
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (!document.hasFocus()) {
          setIsFullscreenBlurred(true);
          setIsBlackoutActive(true);
        }
      }, 10);
    };

    const handleFocus = () => {
      if (document.hasFocus() && !isFullscreenAlertActive) {
        setIsFullscreenBlurred(false);
        setIsBlackoutActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      if (alertTimeout) clearTimeout(alertTimeout);
    };
  }, [isFullscreen, isEnabled, isFullscreenAlertActive]);

  const wrapperClasses = isFullscreen ? 'w-full h-full relative' : '';

  // Increased sensitivity heavy blur filter (60px) + blackout style
  const contentFilter = isFullscreen && (isBlackoutActive || isFullscreenBlurred)
    ? 'blur-[60px] opacity-0'
    : 'blur-0 opacity-100';

  const transitionClass = isBlackoutActive || isFullscreenBlurred
    ? 'transition-none'
    : 'transition-all duration-500 ease-out';

  return (
    <div className={wrapperClasses}>
      {/* Content wrapper with heavy blur and opacity filter */}
      <div className={`${contentFilter} ${transitionClass} w-full h-full`}>
        {children}
      </div>

      {/* Default Translucent Dark Overlay (Task 3: add dark translucent overlay layer in fullscreen) */}
      {isFullscreen && isEnabled && !isBlackoutActive && !isFullscreenBlurred && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-black/40 mix-blend-multiply border-[6px] border-accent/20 rounded-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
      )}

      {/* Floating Animated Glassmorphic Warning Toast (Task 3: show warning message: "Protected fullscreen mode enabled.") */}
      {isFullscreen && isEnabled && showNotification && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full bg-surface/80 backdrop-blur-xl border border-border/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-bounce font-sans">
          <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center">
            <Lock size={12} className="animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide text-foreground">
            Protected fullscreen mode enabled.
          </span>
        </div>
      )}

      {/* Extreme Screenshot Attempt Blackout Overlay */}
      {isFullscreen && isEnabled && isBlackoutActive && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/98 p-8 transition-none font-sans select-none">
          <div className="text-center p-10 bg-surface/5 border border-border/10 rounded-3xl backdrop-blur-xl max-w-md shadow-2xl flex flex-col items-center animate-pulse">
            <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-6 border border-danger/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <ShieldAlert size={44} />
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Security Alert</h3>
            <p className="text-sm text-muted mt-3 leading-relaxed font-iosevka">
              {fullscreenAlertMessage || 'Screenshots and copying are disabled for protected notes.'}
            </p>
          </div>
        </div>
      )}

      {/* Focus Loss / Tab Switching Blackout Overlay (Task 3) */}
      {isFullscreen && isEnabled && isFullscreenBlurred && !isBlackoutActive && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-8 transition-none font-sans select-none">
          <div className="text-center p-10 bg-surface/5 border border-border/10 rounded-3xl backdrop-blur-xl max-w-md shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6 border border-accent/20 shadow-[0_0_30px_rgba(124,58,237,0.2)] animate-pulse">
              <EyeOff size={44} />
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Fullscreen View Paused</h3>
            <p className="text-sm text-muted mt-3 leading-relaxed font-iosevka">
              App focus was lost. Return focus to the browser window to resume secure viewing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullscreenGuard;
